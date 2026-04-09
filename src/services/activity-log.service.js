const prisma = require("../prisma/client");
const { buildPagination, buildPaginationMeta } = require("../utils/pagination");
const { getTenantWhere } = require("./base.service");

const listActivityLogs = async (req, query) => {
  const { page, limit, skip } = buildPagination(query);
  const where = {
    ...getTenantWhere(req, {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(req.user.role === "SUPER_ADMIN" && query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.entity ? { entity: query.entity } : {})
    })
  };

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        institute: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.activityLog.count({ where })
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit })
  };
};

module.exports = {
  listActivityLogs
};
