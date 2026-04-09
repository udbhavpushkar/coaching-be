const express = require("express");
const instituteController = require("../controllers/institute.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { validate } = require("../middlewares/validate.middleware");
const {
  createInstituteSchema,
  instituteListQuerySchema,
  instituteStatusSchema,
  instituteIdParamSchema
} = require("../validators/institute.validator");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("SUPER_ADMIN"));
router.post("/", validate(createInstituteSchema), asyncHandler(instituteController.createInstitute));
router.get("/", validate(instituteListQuerySchema, "query"), asyncHandler(instituteController.listInstitutes));
router.patch(
  "/:instituteId/status",
  validate(instituteIdParamSchema, "params"),
  validate(instituteStatusSchema),
  asyncHandler(instituteController.updateInstituteStatus)
);

module.exports = router;
