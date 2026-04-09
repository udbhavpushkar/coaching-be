const express = require("express");
const feeController = require("../controllers/fee.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { tenantMiddleware } = require("../middlewares/tenant.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { validate } = require("../middlewares/validate.middleware");
const { createFeeSchema, recordPaymentSchema, feeListQuerySchema, feeIdParamSchema } = require("../validators/fee.validator");

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);
router.post("/", roleMiddleware("ADMIN"), validate(createFeeSchema), asyncHandler(feeController.createFee));
router.get("/", roleMiddleware("SUPER_ADMIN", "ADMIN"), validate(feeListQuerySchema, "query"), asyncHandler(feeController.listFees));
router.get("/summary", roleMiddleware("SUPER_ADMIN", "ADMIN"), asyncHandler(feeController.getFeeSummary));
router.get("/:feeId", roleMiddleware("SUPER_ADMIN", "ADMIN"), validate(feeIdParamSchema, "params"), asyncHandler(feeController.getFee));
router.post("/:feeId/payments", roleMiddleware("ADMIN"), validate(feeIdParamSchema, "params"), validate(recordPaymentSchema), asyncHandler(feeController.recordPayment));

module.exports = router;
