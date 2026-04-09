const express = require("express");

const authRoutes = require("./auth.routes");
const instituteRoutes = require("./institute.routes");
const userRoutes = require("./user.routes");
const courseRoutes = require("./course.routes");
const batchRoutes = require("./batch.routes");
const studentRoutes = require("./student.routes");
const feeRoutes = require("./fee.routes");
const attendanceRoutes = require("./attendance.routes");
const dashboardRoutes = require("./dashboard.routes");
const subscriptionRoutes = require("./subscription.routes");
const activityLogRoutes = require("./activity-log.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/institutes", instituteRoutes);
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/batches", batchRoutes);
router.use("/students", studentRoutes);
router.use("/fees", feeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/activity-logs", activityLogRoutes);

module.exports = router;
