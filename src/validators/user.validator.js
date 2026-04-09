const { z, paginationQuerySchema, uuidSchema } = require("./common.validator");

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  instituteId: uuidSchema.optional()
});

const userListQuerySchema = paginationQuerySchema.extend({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"]).optional(),
  instituteId: uuidSchema.optional()
});

const userIdParamSchema = z.object({
  userId: uuidSchema
});

module.exports = {
  createUserSchema,
  userListQuerySchema,
  userIdParamSchema
};
