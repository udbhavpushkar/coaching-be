const batchService = require("../services/batch.service");
const { successResponse } = require("../utils/response");

const createBatch = async (req, res) => {
  const data = await batchService.createBatch(req, req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "Batch created successfully",
    data
  });
};

const listBatches = async (req, res) => {
  const result = await batchService.listBatches(req, req.query);
  return successResponse(res, {
    message: "Batches fetched successfully",
    data: result.items,
    meta: result.meta
  });
};

const getBatch = async (req, res) => {
  const data = await batchService.getBatchById(req, req.params.batchId);
  return successResponse(res, {
    message: "Batch fetched successfully",
    data
  });
};

const updateBatch = async (req, res) => {
  const data = await batchService.updateBatch(req, req.params.batchId, req.body);
  return successResponse(res, {
    message: "Batch updated successfully",
    data
  });
};

const deleteBatch = async (req, res) => {
  const data = await batchService.deleteBatch(req, req.params.batchId);
  return successResponse(res, {
    message: "Batch deleted successfully",
    data
  });
};

module.exports = {
  createBatch,
  listBatches,
  getBatch,
  updateBatch,
  deleteBatch
};
