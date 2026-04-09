const express = require("express");
const batchController = require("../controllers/batch.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { tenantMiddleware } = require("../middlewares/tenant.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { validate } = require("../middlewares/validate.middleware");
const { createBatchSchema, updateBatchSchema, batchListQuerySchema, batchIdParamSchema } = require("../validators/batch.validator");

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);
router.post("/", roleMiddleware("ADMIN"), validate(createBatchSchema), asyncHandler(batchController.createBatch));
router.get("/", roleMiddleware("SUPER_ADMIN", "ADMIN", "TEACHER"), validate(batchListQuerySchema, "query"), asyncHandler(batchController.listBatches));
router.get("/:batchId", roleMiddleware("SUPER_ADMIN", "ADMIN", "TEACHER"), validate(batchIdParamSchema, "params"), asyncHandler(batchController.getBatch));
router.patch("/:batchId", roleMiddleware("ADMIN"), validate(batchIdParamSchema, "params"), validate(updateBatchSchema), asyncHandler(batchController.updateBatch));
router.delete("/:batchId", roleMiddleware("ADMIN"), validate(batchIdParamSchema, "params"), asyncHandler(batchController.deleteBatch));

module.exports = router;
