const { z, paginationQuerySchema, uuidSchema } = require("./common.validator");

const activityLogQuerySchema = paginationQuerySchema.extend({
  userId: uuidSchema.optional(),
  instituteId: uuidSchema.optional(),
  action: z.enum(["CREATE", "UPDATE", "DELETE", "LOGIN", "PAYMENT"]).optional(),
  entity: z.string().optional()
});

module.exports = {
  activityLogQuerySchema
};
