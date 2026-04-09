const { z, paginationQuerySchema, uuidSchema } = require("./common.validator");

const createInstituteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  address: z.string().min(5),
  plan: z.enum(["FREE", "BASIC", "PRO"]).default("FREE"),
  trialEndsAt: z.coerce.date().optional(),
  admin: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    password: z.string().min(8)
  })
});

const instituteListQuerySchema = paginationQuerySchema.extend({
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true"))
});

const instituteStatusSchema = z.object({
  isActive: z.boolean()
});

const instituteIdParamSchema = z.object({
  instituteId: uuidSchema
});

module.exports = {
  createInstituteSchema,
  instituteListQuerySchema,
  instituteStatusSchema,
  instituteIdParamSchema
};
