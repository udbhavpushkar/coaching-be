const dashboardService = require("../services/dashboard.service");
const { successResponse } = require("../utils/response");

const getDashboard = async (req, res) => {
  const data = await dashboardService.getDashboardMetrics(req);
  return successResponse(res, {
    message: "Dashboard metrics fetched successfully",
    data
  });
};

module.exports = {
  getDashboard
};
