const express = require("express");
const studentController = require("../controllers/student.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { tenantMiddleware } = require("../middlewares/tenant.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { validate } = require("../middlewares/validate.middleware");
const { createStudentSchema, updateStudentSchema, studentListQuerySchema, studentIdParamSchema } = require("../validators/student.validator");

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);
router.post("/", roleMiddleware("ADMIN"), validate(createStudentSchema), asyncHandler(studentController.createStudent));
router.get("/", roleMiddleware("SUPER_ADMIN", "ADMIN", "TEACHER"), validate(studentListQuerySchema, "query"), asyncHandler(studentController.listStudents));
router.get("/:studentId", roleMiddleware("SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"), validate(studentIdParamSchema, "params"), asyncHandler(studentController.getStudent));
router.patch("/:studentId", roleMiddleware("ADMIN"), validate(studentIdParamSchema, "params"), validate(updateStudentSchema), asyncHandler(studentController.updateStudent));
router.delete("/:studentId", roleMiddleware("ADMIN"), validate(studentIdParamSchema, "params"), asyncHandler(studentController.deleteStudent));

module.exports = router;
