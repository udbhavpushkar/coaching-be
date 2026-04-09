const prisma = require("../prisma/client");
const { buildPagination, buildPaginationMeta } = require("../utils/pagination");
const { ApiError } = require("../utils/api-error");
const { getTenantWhere } = require("./base.service");
const { logActivity } = require("../utils/activity-log");

const createSubscription = async (req, payload) => {
  const institute = await prisma.institute.findUnique({
    where: { id: payload.instituteId }
  });

  if (!institute) {
    throw new ApiError(404, "Institute not found");
  }

  const subscription = await prisma.subscription.create({
    data: payload
  });

  await prisma.institute.update({
    where: { id: payload.instituteId },
    data: { plan: payload.plan }
  });

  await logActivity({
    userId: req.user.id,
    instituteId: payload.instituteId,
    action: "CREATE",
    entity: "SUBSCRIPTION",
    entityId: subscription.id,
    metadata: { plan: payload.plan, status: payload.status }
  });

  return subscription;
};

const listSubscriptions = async (req, query) => {
  const { page, limit, skip } = buildPagination(query);
  const where = {
    ...getTenantWhere(req, req.user.role === "SUPER_ADMIN" && query.instituteId ? { instituteId: query.instituteId } : {}),
    ...(query.status ? { status: query.status } : {})
  };

  const [items, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: { institute: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.subscription.count({ where })
  ]);

  return { items, meta: buildPaginationMeta({ total, page, limit }) };
};

module.exports = {
  createSubscription,
  listSubscriptions
};
