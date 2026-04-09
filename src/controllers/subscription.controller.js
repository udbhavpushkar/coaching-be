const subscriptionService = require("../services/subscription.service");
const { successResponse } = require("../utils/response");

const createSubscription = async (req, res) => {
  const data = await subscriptionService.createSubscription(req, req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "Subscription created successfully",
    data
  });
};

const listSubscriptions = async (req, res) => {
  const result = await subscriptionService.listSubscriptions(req, req.query);
  return successResponse(res, {
    message: "Subscriptions fetched successfully",
    data: result.items,
    meta: result.meta
  });
};

module.exports = {
  createSubscription,
  listSubscriptions
};
