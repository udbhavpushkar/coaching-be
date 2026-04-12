const { Prisma } = require("@prisma/client");
const prisma = require("../prisma/client");
const { ApiError } = require("../utils/api-error");
const { buildPagination, buildPaginationMeta } = require("../utils/pagination");
const { withSoftDelete } = require("../utils/query");
const { getTenantWhere } = require("./base.service");
const { logActivity } = require("../utils/activity-log");

const createFee = async (req, payload) => {
  const student = await prisma.student.findFirst({
    where: withSoftDelete(getTenantWhere(req, { id: payload.studentId })),
    include: { fee: true }
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (student.fee) {
    throw new ApiError(409, "Fee structure already exists for student");
  }

  const fee = await prisma.fee.create({
    data: {
      studentId: payload.studentId,
      totalAmount: payload.totalAmount,
      paidAmount: 0,
      dueAmount: payload.totalAmount,
      instituteId: req.tenant.instituteId,
      createdBy: req.user.id
    }
  });

  await logActivity({
    userId: req.user.id,
    instituteId: req.tenant.instituteId,
    action: "CREATE",
    entity: "FEE",
    entityId: fee.id,
    metadata: { studentId: payload.studentId, totalAmount: payload.totalAmount }
  });

  return fee;
};

const listFees = async (req, query) => {
  const { page, limit, skip } = buildPagination(query);
  const where = withSoftDelete(
    getTenantWhere(req, {
      ...(query.studentId ? { studentId: query.studentId } : {})
    })
  );

  const [items, total] = await Promise.all([
    prisma.fee.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        payments: {
          orderBy: { paymentDate: "desc" },
          take: 5
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.fee.count({ where })
  ]);

  return { items, meta: buildPaginationMeta({ total, page, limit }) };
};

const getFeeById = async (req, feeId) => {
  const fee = await prisma.fee.findFirst({
    where: withSoftDelete(getTenantWhere(req, { id: feeId })),
    include: {
      student: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      },
      payments: {
        orderBy: { paymentDate: "desc" }
      }
    }
  });

  if (!fee) {
    throw new ApiError(404, "Fee record not found");
  }

  return fee;
};

const recordPayment = async (req, feeId, payload) => {
  const paymentAmount = new Prisma.Decimal(payload.amount);

  if (paymentAmount.lte(0)) {
    throw new ApiError(422, "Payment amount must be greater than zero");
  }

  const paymentDate = payload.paymentDate ? new Date(payload.paymentDate) : new Date();

  if (Number.isNaN(paymentDate.getTime())) {
    throw new ApiError(422, "Invalid payment date");
  }

  if (paymentDate > new Date()) {
    throw new ApiError(422, "Payment date cannot be in the future");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Keep the read-validate-write cycle in one transaction so concurrent payments
    // cannot both validate against the same stale fee balance.
    const fee = await tx.fee.findFirst({
      where: withSoftDelete(getTenantWhere(req, { id: feeId }))
    });

    if (!fee) {
      throw new ApiError(404, "Fee record not found");
    }

    // Prisma returns Decimal values. Use Decimal arithmetic to avoid precision loss.
    const nextPaidAmount = fee.paidAmount.add(paymentAmount);

    if (nextPaidAmount.gt(fee.totalAmount)) {
      throw new ApiError(422, "Payment exceeds total fee amount");
    }

    const payment = await tx.payment.create({
      data: {
        feeId,
        amount: paymentAmount,
        paymentDate,
        mode: payload.mode,
        instituteId: req.tenant.instituteId,
        createdBy: req.user.id
      }
    });

    const updatedFee = await tx.fee.update({
      where: { id: feeId },
      data: {
        paidAmount: nextPaidAmount,
        dueAmount: fee.totalAmount.sub(nextPaidAmount)
      }
    });

    return { payment, updatedFee };
  });

  await logActivity({
    userId: req.user.id,
    instituteId: req.tenant.instituteId,
    action: "PAYMENT",
    entity: "PAYMENT",
    entityId: result.payment.id,
    metadata: { feeId, amount: paymentAmount.toNumber(), mode: payload.mode }
  });

  return result;
};

const getFeeSummary = async (req) => {
  const feeWhere = withSoftDelete(getTenantWhere(req));
  const paymentWhere = getTenantWhere(req);

  const [feeAggregate, paymentAggregate] = await Promise.all([
    prisma.fee.aggregate({
      where: feeWhere,
      _sum: {
        totalAmount: true,
        dueAmount: true
      }
    }),
    prisma.payment.aggregate({
      where: paymentWhere,
      _sum: {
        amount: true
      }
    })
  ]);

  return {
    totalRevenue: paymentAggregate._sum.amount?.toNumber() || 0,
    pendingDues: feeAggregate._sum.dueAmount?.toNumber() || 0,
    totalFeeBooked: feeAggregate._sum.totalAmount?.toNumber() || 0
  };
};

module.exports = {
  createFee,
  listFees,
  getFeeById,
  recordPayment,
  getFeeSummary
};
