const feeService = require("../services/fee.service");
const { successResponse } = require("../utils/response");

const createFee = async (req, res) => {
  const data = await feeService.createFee(req, req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "Fee structure created successfully",
    data
  });
};

const listFees = async (req, res) => {
  const result = await feeService.listFees(req, req.query);
  return successResponse(res, {
    message: "Fee records fetched successfully",
    data: result.items,
    meta: result.meta
  });
};

const getFee = async (req, res) => {
  const data = await feeService.getFeeById(req, req.params.feeId);
  return successResponse(res, {
    message: "Fee record fetched successfully",
    data
  });
};

const recordPayment = async (req, res) => {
  const data = await feeService.recordPayment(req, req.params.feeId, req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "Payment recorded successfully",
    data
  });
};

const getFeeSummary = async (req, res) => {
  const data = await feeService.getFeeSummary(req);
  return successResponse(res, {
    message: "Fee summary fetched successfully",
    data
  });
};

module.exports = {
  createFee,
  listFees,
  getFee,
  recordPayment,
  getFeeSummary
};
