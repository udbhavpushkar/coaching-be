const { z, paginationQuerySchema, uuidSchema } = require("./common.validator");

const createBatchSchema = z.object({
  name: z.string().min(2),
  courseId: uuidSchema,
  teacherId: uuidSchema.optional().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date()
});

const updateBatchSchema = createBatchSchema.partial();

const batchListQuerySchema = paginationQuerySchema.extend({
  courseId: uuidSchema.optional(),
  teacherId: uuidSchema.optional()
});

const batchIdParamSchema = z.object({
  batchId: uuidSchema
});

module.exports = {
  createBatchSchema,
  updateBatchSchema,
  batchListQuerySchema,
  batchIdParamSchema
};
