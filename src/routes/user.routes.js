const express = require("express");
const userController = require("../controllers/user.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { tenantMiddleware } = require("../middlewares/tenant.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { validate } = require("../middlewares/validate.middleware");
const { createUserSchema, createSuperAdminSchema, userListQuerySchema, userIdParamSchema } = require("../validators/user.validator");

const router = express.Router();

router.post("/super-admin", validate(createSuperAdminSchema), asyncHandler(userController.createSuperAdmin));

router.use(authMiddleware, tenantMiddleware);
router.post("/", roleMiddleware("SUPER_ADMIN", "ADMIN"), validate(createUserSchema), asyncHandler(userController.createUser));
router.get("/", roleMiddleware("SUPER_ADMIN", "ADMIN"), validate(userListQuerySchema, "query"), asyncHandler(userController.listUsers));
router.delete("/:userId", roleMiddleware("SUPER_ADMIN", "ADMIN"), validate(userIdParamSchema, "params"), asyncHandler(userController.deleteUser));

module.exports = router;
