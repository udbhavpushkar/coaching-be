const { z, paginationQuerySchema, uuidSchema } = require("./common.validator");

const createStudentSchema = z.object({
  user: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    password: z.string().min(8)
  }),
  fatherName: z.string().min(2),
  enrollmentNumber: z.string().min(2),
  courseId: uuidSchema,
  batchId: uuidSchema
});

const updateStudentSchema = z.object({
  fatherName: z.string().min(2).optional(),
  enrollmentNumber: z.string().min(2).optional(),
  courseId: uuidSchema.optional(),
  batchId: uuidSchema.optional()
});

const studentListQuerySchema = paginationQuerySchema.extend({
  batchId: uuidSchema.optional(),
  courseId: uuidSchema.optional()
});

const studentIdParamSchema = z.object({
  studentId: uuidSchema
});

module.exports = {
  createStudentSchema,
  updateStudentSchema,
  studentListQuerySchema,
  studentIdParamSchema
};
