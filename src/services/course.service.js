const prisma = require("../prisma/client");
const { ApiError } = require("../utils/api-error");
const { buildPagination, buildPaginationMeta } = require("../utils/pagination");
const { buildSearchFilter, withSoftDelete } = require("../utils/query");
const { getTenantWhere } = require("./base.service");
const { logActivity } = require("../utils/activity-log");

const createCourse = async (req, payload) => {
  const course = await prisma.course.create({
    data: {
      title: payload.title,
      description: payload.description,
      duration: payload.duration,
      fees: payload.fees,
      instituteId: req.tenant.instituteId,
      createdBy: req.user.id
    }
  });

  await logActivity({
    userId: req.user.id,
    instituteId: req.tenant.instituteId,
    action: "CREATE",
    entity: "COURSE",
    entityId: course.id
  });

  return course;
};

const listCourses = async (req, query) => {
  const { page, limit, skip } = buildPagination(query);
  const where = withSoftDelete({
    ...getTenantWhere(req),
    ...buildSearchFilter(query.search, ["title", "description", "duration"])
  });

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.course.count({ where })
  ]);

  return { items, meta: buildPaginationMeta({ total, page, limit }) };
};

const getCourseById = async (req, courseId) => {
  const course = await prisma.course.findFirst({
    where: withSoftDelete(getTenantWhere(req, { id: courseId }))
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return course;
};

const updateCourse = async (req, courseId, payload) => {
  await getCourseById(req, courseId);

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: payload
  });

  await logActivity({
    userId: req.user.id,
    instituteId: updated.instituteId,
    action: "UPDATE",
    entity: "COURSE",
    entityId: updated.id,
    metadata: payload
  });

  return updated;
};

const deleteCourse = async (req, courseId) => {
  const course = await getCourseById(req, courseId);

  const deleted = await prisma.course.update({
    where: { id: courseId },
    data: { deletedAt: new Date() }
  });

  await logActivity({
    userId: req.user.id,
    instituteId: course.instituteId,
    action: "DELETE",
    entity: "COURSE",
    entityId: courseId
  });

  return deleted;
};

module.exports = {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};
