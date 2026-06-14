const prisma = require("../prisma/client");
const { ApiError } = require("../utils/api-error");
const { hashPassword } = require("../utils/password");
const { buildPagination, buildPaginationMeta } = require("../utils/pagination");
const { buildSearchFilter, withSoftDelete } = require("../utils/query");
const { getTenantWhere } = require("./base.service");
const { logActivity } = require("../utils/activity-log");

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  instituteId: true,
  createdAt: true,
  updatedAt: true
};

const createSuperAdmin = async (payload) => {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: "SUPER_ADMIN",
      deletedAt: null
    }
  });

  if (existingSuperAdmin) {
    throw new ApiError(409, "Super admin already exists");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (existingUser) {
    throw new ApiError(409, "User email already exists");
  }

  const password = await hashPassword(payload.password);

  return prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password,
      role: "SUPER_ADMIN",
      instituteId: null
    },
    select: userSelect
  });
};

const createUser = async (req, payload) => {
  const instituteId = req.user.role === "SUPER_ADMIN" ? payload.instituteId || null : req.tenant.instituteId;

  if (req.user.role !== "SUPER_ADMIN" && payload.role === "ADMIN") {
    throw new ApiError(403, "Only super admin can create institute admins");
  }

  if (payload.role !== "SUPER_ADMIN" && !instituteId) {
    throw new ApiError(422, "Institute ID is required");
  }

  if (instituteId) {
    const institute = await prisma.institute.findUnique({ where: { id: instituteId } });

    if (!institute) {
      throw new ApiError(404, "Institute not found");
    }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (existingUser) {
    throw new ApiError(409, "User email already exists");
  }

  const password = await hashPassword(payload.password);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password,
      role: payload.role,
      instituteId
    }
  });

  await logActivity({
    userId: req.user.id,
    instituteId,
    action: "CREATE",
    entity: "USER",
    entityId: user.id,
    metadata: { role: user.role }
  });

  return user;
};

const listUsers = async (req, query) => {
  const { page, limit, skip } = buildPagination(query);
  const tenantFilter = req.user.role === "SUPER_ADMIN" && query.instituteId ? { instituteId: query.instituteId } : {};
  const where = withSoftDelete({
    ...buildSearchFilter(query.search, ["name", "email", "phone"]),
    ...(query.role ? { role: query.role } : {}),
    ...getTenantWhere(req, tenantFilter)
  });

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        instituteId: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    items,
    meta: buildPaginationMeta({ total, page, limit })
  };
};

const softDeleteUser = async (req, userId) => {
  const user = await prisma.user.findFirst({
    where: withSoftDelete(getTenantWhere(req, { id: userId }))
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "SUPER_ADMIN") {
    throw new ApiError(403, "Super admin cannot be deleted");
  }

  const deleted = await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() }
  });

  await logActivity({
    userId: req.user.id,
    instituteId: user.instituteId,
    action: "DELETE",
    entity: "USER",
    entityId: userId
  });

  return deleted;
};

module.exports = {
  createSuperAdmin,
  createUser,
  listUsers,
  softDeleteUser
};
