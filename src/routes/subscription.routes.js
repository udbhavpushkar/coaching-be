const express = require("express");
const subscriptionController = require("../controllers/subscription.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { tenantMiddleware } = require("../middlewares/tenant.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { validate } = require("../middlewares/validate.middleware");
const { createSubscriptionSchema, subscriptionListQuerySchema } = require("../validators/subscription.validator");

const router = express.Router();

router.use(authMiddleware, tenantMiddleware);
router.post("/", roleMiddleware("SUPER_ADMIN"), validate(createSubscriptionSchema), asyncHandler(subscriptionController.createSubscription));
router.get("/", roleMiddleware("SUPER_ADMIN", "ADMIN"), validate(subscriptionListQuerySchema, "query"), asyncHandler(subscriptionController.listSubscriptions));

module.exports = router;
