const { z, paginationQuerySchema, uuidSchema } = require("./common.validator");

const createFeeSchema = z.object({
  studentId: uuidSchema,
  totalAmount: z.coerce.number().positive()
});

const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  paymentDate: z.coerce.date(),
  mode: z.enum(["CASH", "UPI", "CARD"])
});

const feeListQuerySchema = paginationQuerySchema.extend({
  studentId: uuidSchema.optional()
});

const feeIdParamSchema = z.object({
  feeId: uuidSchema
});

module.exports = {
  createFeeSchema,
  recordPaymentSchema,
  feeListQuerySchema,
  feeIdParamSchema
};
