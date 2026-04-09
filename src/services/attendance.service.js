const prisma = require("../prisma/client");
const { ApiError } = require("../utils/api-error");
const { buildPagination, buildPaginationMeta } = require("../utils/pagination");
const { getTenantWhere } = require("./base.service");
const { logActivity } = require("../utils/activity-log");

const normalizeDate = (value) => {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const markAttendance = async (req, payload) => {
  const attendanceDate = normalizeDate(payload.date);
  const [student, batch] = await Promise.all([
    prisma.student.findFirst({
      where: { id: payload.studentId, instituteId: req.tenant.instituteId, deletedAt: null }
    }),
    prisma.batch.findFirst({
      where: { id: payload.batchId, instituteId: req.tenant.instituteId, deletedAt: null }
    })
  ]);

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_batchId_date: {
        studentId: payload.studentId,
        batchId: payload.batchId,
        date: attendanceDate
      }
    },
    update: {
      status: payload.status,
      createdBy: req.user.id
    },
    create: {
      studentId: payload.studentId,
      batchId: payload.batchId,
      date: attendanceDate,
      status: payload.status,
      instituteId: req.tenant.instituteId,
      createdBy: req.user.id
    }
  });

  await logActivity({
    userId: req.user.id,
    instituteId: req.tenant.instituteId,
    action: "CREATE",
    entity: "ATTENDANCE",
    entityId: attendance.id,
    metadata: { studentId: payload.studentId, batchId: payload.batchId, status: payload.status, date: attendanceDate }
  });

  return attendance;
};

const getAttendanceReport = async (req, query) => {
  const { page, limit, skip } = buildPagination(query);
  const where = getTenantWhere(req, {
    ...(query.studentId ? { studentId: query.studentId } : {}),
    ...(query.batchId ? { batchId: query.batchId } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          date: {
            ...(query.dateFrom ? { gte: normalizeDate(query.dateFrom) } : {}),
            ...(query.dateTo ? { lte: normalizeDate(query.dateTo) } : {})
          }
        }
      : {})
  });

  const [items, total, totals] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        batch: true
      },
      orderBy: { date: "desc" },
      skip,
      take: limit
    }),
    prisma.attendance.count({ where }),
    prisma.attendance.groupBy({
      by: ["status"],
      where,
      _count: { _all: true }
    })
  ]);

  const presentCount = totals.find((entry) => entry.status === "PRESENT")?._count._all || 0;
  const totalRecords = totals.reduce((sum, entry) => sum + entry._count._all, 0);

  return {
    items,
    meta: {
      ...buildPaginationMeta({ total, page, limit }),
      attendancePercentage: totalRecords ? Number(((presentCount / totalRecords) * 100).toFixed(2)) : 0
    }
  };
};

module.exports = {
  markAttendance,
  getAttendanceReport
};
