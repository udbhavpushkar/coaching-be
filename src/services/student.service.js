const prisma = require("../prisma/client");
const { ApiError } = require("../utils/api-error");
const { hashPassword } = require("../utils/password");
const { buildPagination, buildPaginationMeta } = require("../utils/pagination");
const { withSoftDelete } = require("../utils/query");
const { getTenantWhere } = require("./base.service");
const { logActivity } = require("../utils/activity-log");

const ensureStudentRelations = async (req, courseId, batchId) => {
  const [course, batch] = await Promise.all([
    prisma.course.findFirst({ where: withSoftDelete(getTenantWhere(req, { id: courseId })) }),
    prisma.batch.findFirst({ where: withSoftDelete(getTenantWhere(req, { id: batchId })) })
  ]);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }
};

const createStudent = async (req, payload) => {
  await ensureStudentRelations(req, payload.courseId, payload.batchId);

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.user.email }
  });

  if (existingUser) {
    throw new ApiError(409, "Student email already exists");
  }

  const password = await hashPassword(payload.user.password);

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: payload.user.name,
        email: payload.user.email,
        phone: payload.user.phone,
        password,
        role: "STUDENT",
        instituteId: req.tenant.instituteId
      }
    });

    return tx.student.create({
      data: {
        userId: user.id,
        fatherName: payload.fatherName,
        enrollmentNumber: payload.enrollmentNumber,
        courseId: payload.courseId,
        batchId: payload.batchId,
        instituteId: req.tenant.instituteId,
        createdBy: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });
  });

  await logActivity({
    userId: req.user.id,
    instituteId: req.tenant.instituteId,
    action: "CREATE",
    entity: "STUDENT",
    entityId: student.id,
    metadata: { userId: student.userId }
  });

  return student;
};

const listStudents = async (req, query) => {
  const { page, limit, skip } = buildPagination(query);
  const where = withSoftDelete({
    ...getTenantWhere(req, {
      ...(query.batchId ? { batchId: query.batchId } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {})
    }),
    ...(query.search
      ? {
          OR: [
            { enrollmentNumber: { contains: query.search, mode: "insensitive" } },
            { fatherName: { contains: query.search, mode: "insensitive" } },
            { user: { name: { contains: query.search, mode: "insensitive" } } },
            { user: { email: { contains: query.search, mode: "insensitive" } } }
          ]
        }
      : {})
  });

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        course: true,
        batch: true
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.student.count({ where })
  ]);

  return { items, meta: buildPaginationMeta({ total, page, limit }) };
};

const getStudentById = async (req, studentId) => {
  const where = withSoftDelete(getTenantWhere(req, { id: studentId }));
  const student = await prisma.student.findFirst({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      course: true,
      batch: true,
      fee: true
    }
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (req.user.role === "STUDENT" && student.userId !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }

  return student;
};

const updateStudent = async (req, studentId, payload) => {
  const existing = await getStudentById(req, studentId);
  await ensureStudentRelations(req, payload.courseId || existing.courseId, payload.batchId || existing.batchId);

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: payload
  });

  await logActivity({
    userId: req.user.id,
    instituteId: updated.instituteId,
    action: "UPDATE",
    entity: "STUDENT",
    entityId: studentId,
    metadata: payload
  });

  return updated;
};

const deleteStudent = async (req, studentId) => {
  const student = await getStudentById(req, studentId);

  const deleted = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: student.userId },
      data: { deletedAt: new Date() }
    });

    return tx.student.update({
      where: { id: studentId },
      data: { deletedAt: new Date() }
    });
  });

  await logActivity({
    userId: req.user.id,
    instituteId: student.instituteId,
    action: "DELETE",
    entity: "STUDENT",
    entityId: studentId
  });

  return deleted;
};

module.exports = {
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};
