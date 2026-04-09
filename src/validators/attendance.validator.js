const { z, paginationQuerySchema, uuidSchema } = require("./common.validator");

const markAttendanceSchema = z.object({
  studentId: uuidSchema,
  batchId: uuidSchema,
  date: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT"])
});

const attendanceReportQuerySchema = paginationQuerySchema.extend({
  studentId: uuidSchema.optional(),
  batchId: uuidSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
});

module.exports = {
  markAttendanceSchema,
  attendanceReportQuerySchema
};
