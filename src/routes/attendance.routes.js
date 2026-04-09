const express = require("express");
const attendanceController = require("../controllers/attendance.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { tenantMiddleware } = require("../middlewares/tenant.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { validate } = require("../middlewares/validate.middleware");
const { markAttendanceSchema, attendanceReportQuerySchema } = require("../validators/attendance.validator");

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);
router.post("/", roleMiddleware("ADMIN", "TEACHER"), validate(markAttendanceSchema), asyncHandler(attendanceController.markAttendance));
router.get("/report", roleMiddleware("SUPER_ADMIN", "ADMIN", "TEACHER"), validate(attendanceReportQuerySchema, "query"), asyncHandler(attendanceController.getAttendanceReport));

module.exports = router;
