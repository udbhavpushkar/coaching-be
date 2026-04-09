const activityLogService = require("../services/activity-log.service");
const { successResponse } = require("../utils/response");

const listActivityLogs = async (req, res) => {
  const result = await activityLogService.listActivityLogs(req, req.query);
  return successResponse(res, {
    message: "Activity logs fetched successfully",
    data: result.items,
    meta: result.meta
  });
};

module.exports = {
  listActivityLogs
};
