const z = require("zod");

const uuidSchema = z.string().uuid();
const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().optional()
});

module.exports = {
  z,
  uuidSchema,
  paginationQuerySchema
};
