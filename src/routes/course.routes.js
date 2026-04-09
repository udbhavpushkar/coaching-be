const express = require("express");
const courseController = require("../controllers/course.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { tenantMiddleware } = require("../middlewares/tenant.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { validate } = require("../middlewares/validate.middleware");
const { createCourseSchema, updateCourseSchema, courseListQuerySchema, courseIdParamSchema } = require("../validators/course.validator");

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);
router.post("/", roleMiddleware("ADMIN"), validate(createCourseSchema), asyncHandler(courseController.createCourse));
router.get("/", roleMiddleware("SUPER_ADMIN", "ADMIN", "TEACHER"), validate(courseListQuerySchema, "query"), asyncHandler(courseController.listCourses));
router.get("/:courseId", roleMiddleware("SUPER_ADMIN", "ADMIN", "TEACHER"), validate(courseIdParamSchema, "params"), asyncHandler(courseController.getCourse));
router.patch("/:courseId", roleMiddleware("ADMIN"), validate(courseIdParamSchema, "params"), validate(updateCourseSchema), asyncHandler(courseController.updateCourse));
router.delete("/:courseId", roleMiddleware("ADMIN"), validate(courseIdParamSchema, "params"), asyncHandler(courseController.deleteCourse));

module.exports = router;
