const prisma = require("../prisma/client");
const { ApiError } = require("../utils/api-error");
const { buildPagination, buildPaginationMeta } = require("../utils/pagination");
const { buildSearchFilter, withSoftDelete } = require("../utils/query");
const { getTenantWhere } = require("./base.service");
const { logActivity } = require("../utils/activity-log");

const ensureCourse = async (req, courseId) => {
  const course = await prisma.course.findFirst({
    where: withSoftDelete(getTenantWhere(req, { id: courseId }))
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return course;
};

const ensureTeacher = async (req, teacherId) => {
  if (!teacherId) {
    return null;
  }

  const teacher = await prisma.user.findFirst({
    where: withSoftDelete(getTenantWhere(req, { id: teacherId, role: "TEACHER" }))
  });

  if (!teacher) {
    throw new ApiError(404, "Teacher not found");
  }

  return teacher;
};

const createBatch = async (req, payload) => {
  await Promise.all([ensureCourse(req, payload.courseId), ensureTeacher(req, payload.teacherId)]);

  const batch = await prisma.batch.create({
    data: {
      ...payload,
      instituteId: req.tenant.instituteId,
      createdBy: req.user.id
    }
  });

  await logActivity({
    userId: req.user.id,
    instituteId: req.tenant.instituteId,
    action: "CREATE",
    entity: "BATCH",
    entityId: batch.id
  });

  return batch;
};

const listBatches = async (req, query) => {
  const { page, limit, skip } = buildPagination(query);
  const where = withSoftDelete({
    ...getTenantWhere(req, {
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.teacherId ? { teacherId: query.teacherId } : {})
    }),
    ...buildSearchFilter(query.search, ["name"])
  });

  const [items, total] = await Promise.all([
    prisma.batch.findMany({
      where,
      include: {
        course: true,
        teacher: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.batch.count({ where })
  ]);

  return { items, meta: buildPaginationMeta({ total, page, limit }) };
};

const getBatchById = async (req, batchId) => {
  const batch = await prisma.batch.findFirst({
    where: withSoftDelete(getTenantWhere(req, { id: batchId })),
    include: {
      course: true,
      teacher: { select: { id: true, name: true, email: true } }
    }
  });

  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }

  return batch;
};

const updateBatch = async (req, batchId, payload) => {
  const existing = await getBatchById(req, batchId);

  await Promise.all([
    payload.courseId ? ensureCourse(req, payload.courseId) : Promise.resolve(existing.course),
    payload.teacherId ? ensureTeacher(req, payload.teacherId) : Promise.resolve(existing.teacher)
  ]);

  const updated = await prisma.batch.update({
    where: { id: batchId },
    data: payload
  });

  await logActivity({
    userId: req.user.id,
    instituteId: updated.instituteId,
    action: "UPDATE",
    entity: "BATCH",
    entityId: batchId,
    metadata: payload
  });

  return updated;
};

const deleteBatch = async (req, batchId) => {
  const batch = await getBatchById(req, batchId);

  const deleted = await prisma.batch.update({
    where: { id: batchId },
    data: { deletedAt: new Date() }
  });

  await logActivity({
    userId: req.user.id,
    instituteId: batch.instituteId,
    action: "DELETE",
    entity: "BATCH",
    entityId: batchId
  });

  return deleted;
};

module.exports = {
  createBatch,
  listBatches,
  getBatchById,
  updateBatch,
  deleteBatch
};
