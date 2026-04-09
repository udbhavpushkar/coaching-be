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
          orderBy: { paymentDate: "desc" }
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
  const fee = await prisma.fee.findFirst({
    where: withSoftDelete(getTenantWhere(req, { id: feeId }))
  });

  if (!fee) {
    throw new ApiError(404, "Fee record not found");
  }

  const totalAmount = Number(fee.totalAmount);
  const paidAmount = Number(fee.paidAmount);
  const nextPaidAmount = paidAmount + payload.amount;

  if (nextPaidAmount > totalAmount) {
    throw new ApiError(422, "Payment exceeds total fee amount");
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        feeId,
        amount: payload.amount,
        paymentDate: payload.paymentDate,
        mode: payload.mode,
        instituteId: fee.instituteId,
        createdBy: req.user.id
      }
    });

    const updatedFee = await tx.fee.update({
      where: { id: feeId },
      data: {
        paidAmount: new Prisma.Decimal(nextPaidAmount),
        dueAmount: new Prisma.Decimal(totalAmount - nextPaidAmount)
      }
    });

    return { payment, updatedFee };
  });

  await logActivity({
    userId: req.user.id,
    instituteId: fee.instituteId,
    action: "PAYMENT",
    entity: "PAYMENT",
    entityId: result.payment.id,
    metadata: { feeId, amount: payload.amount, mode: payload.mode }
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
    totalRevenue: Number(paymentAggregate._sum.amount || 0),
    pendingDues: Number(feeAggregate._sum.dueAmount || 0),
    totalFeeBooked: Number(feeAggregate._sum.totalAmount || 0)
  };
};

module.exports = {
  createFee,
  listFees,
  getFeeById,
  recordPayment,
  getFeeSummary
};
