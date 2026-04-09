const prisma = require("../prisma/client");
const { ApiError } = require("../utils/api-error");
const { hashPassword } = require("../utils/password");
const { buildPagination, buildPaginationMeta } = require("../utils/pagination");
const { buildSearchFilter } = require("../utils/query");

const createInstitute = async (payload, actor) => {
  const existingInstitute = await prisma.institute.findFirst({
    where: {
      OR: [{ email: payload.email }, { users: { some: { email: payload.admin.email } } }]
    }
  });

  if (existingInstitute) {
    throw new ApiError(409, "Institute or admin email already exists");
  }

  const adminPassword = await hashPassword(payload.admin.password);

  return prisma.$transaction(async (tx) => {
    const institute = await tx.institute.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        plan: payload.plan,
        trialEndsAt: payload.trialEndsAt
      }
    });

    const admin = await tx.user.create({
      data: {
        name: payload.admin.name,
        email: payload.admin.email,
        phone: payload.admin.phone,
        password: adminPassword,
        role: "ADMIN",
        instituteId: institute.id
      }
    });

    await tx.subscription.create({
      data: {
        instituteId: institute.id,
        plan: payload.plan,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: payload.trialEndsAt || new Date(new Date().setDate(new Date().getDate() + 14))
      }
    });

    await tx.activityLog.create({
      data: {
        userId: actor.id,
        instituteId: institute.id,
        action: "CREATE",
        entity: "INSTITUTE",
        entityId: institute.id,
        metadata: { adminUserId: admin.id, plan: payload.plan }
      }
    });

    return { institute, admin };
  });
};

const listInstitutes = async (query) => {
  const { page, limit, skip } = buildPagination(query);
  const where = {
    ...buildSearchFilter(query.search, ["name", "email", "phone"]),
    ...(query.isActive === undefined ? {} : { isActive: query.isActive })
  };

  const [items, total] = await Promise.all([
    prisma.institute.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.institute.count({ where })
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit })
  };
};

const updateInstituteStatus = async (instituteId, isActive, actor) => {
  const institute = await prisma.institute.findUnique({ where: { id: instituteId } });

  if (!institute) {
    throw new ApiError(404, "Institute not found");
  }

  const updated = await prisma.institute.update({
    where: { id: instituteId },
    data: { isActive }
  });

  await prisma.activityLog.create({
    data: {
      userId: actor.id,
      instituteId,
      action: "UPDATE",
      entity: "INSTITUTE",
      entityId: instituteId,
      metadata: { isActive }
    }
  });

  return updated;
};

module.exports = {
  createInstitute,
  listInstitutes,
  updateInstituteStatus
};
