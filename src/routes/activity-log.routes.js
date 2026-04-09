const express = require("express");
const activityLogController = require("../controllers/activity-log.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { tenantMiddleware } = require("../middlewares/tenant.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { validate } = require("../middlewares/validate.middleware");
const { activityLogQuerySchema } = require("../validators/activity-log.validator");

const router = express.Router();

router.use(authMiddleware, tenantMiddleware, roleMiddleware("SUPER_ADMIN", "ADMIN"));
router.get("/", validate(activityLogQuerySchema, "query"), asyncHandler(activityLogController.listActivityLogs));

module.exports = router;
