const { z, paginationQuerySchema, uuidSchema } = require("./common.validator");

const createCourseSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  duration: z.string().min(1),
  fees: z.coerce.number().nonnegative()
});

const updateCourseSchema = createCourseSchema.partial();

const courseListQuerySchema = paginationQuerySchema;

const courseIdParamSchema = z.object({
  courseId: uuidSchema
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  courseListQuerySchema,
  courseIdParamSchema
};
