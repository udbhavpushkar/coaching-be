const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { tenantMiddleware } = require("../middlewares/tenant.middleware");
const { asyncHandler } = require("../utils/async-handler");

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);
router.get("/", roleMiddleware("SUPER_ADMIN", "ADMIN"), asyncHandler(dashboardController.getDashboard));

module.exports = router;
