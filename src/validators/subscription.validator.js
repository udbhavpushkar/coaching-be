const { z, paginationQuerySchema, uuidSchema } = require("./common.validator");

const createSubscriptionSchema = z.object({
  instituteId: uuidSchema,
  plan: z.enum(["FREE", "BASIC", "PRO"]),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
});

const subscriptionListQuerySchema = paginationQuerySchema.extend({
  instituteId: uuidSchema.optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional()
});

module.exports = {
  createSubscriptionSchema,
  subscriptionListQuerySchema
};
