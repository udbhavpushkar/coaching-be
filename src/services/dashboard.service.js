const prisma = require("../prisma/client");
const { getTenantWhere } = require("./base.service");

const getDashboardMetrics = async (req) => {
  const studentWhere = { ...getTenantWhere(req), deletedAt: null };
  const feeWhere = { ...getTenantWhere(req), deletedAt: null };
  const paymentWhere = getTenantWhere(req);
  const attendanceWhere = getTenantWhere(req);

  const [totalStudents, feeAggregate, paymentAggregate, attendanceAggregate] = await Promise.all([
    prisma.student.count({ where: studentWhere }),
    prisma.fee.aggregate({
      where: feeWhere,
      _sum: {
        dueAmount: true
      }
    }),
    prisma.payment.aggregate({
      where: paymentWhere,
      _sum: {
        amount: true
      }
    }),
    prisma.attendance.groupBy({
      by: ["status"],
      where: attendanceWhere,
      _count: { _all: true }
    })
  ]);

  const presentCount = attendanceAggregate.find((item) => item.status === "PRESENT")?._count._all || 0;
  const totalAttendance = attendanceAggregate.reduce((sum, item) => sum + item._count._all, 0);

  return {
    totalStudents,
    totalRevenue: Number(paymentAggregate._sum.amount || 0),
    pendingFees: Number(feeAggregate._sum.dueAmount || 0),
    attendancePercentage: totalAttendance ? Number(((presentCount / totalAttendance) * 100).toFixed(2)) : 0
  };
};

module.exports = {
  getDashboardMetrics
};
