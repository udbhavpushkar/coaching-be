const instituteService = require("../services/institute.service");
const { successResponse } = require("../utils/response");

const createInstitute = async (req, res) => {
  const data = await instituteService.createInstitute(req.body, req.user);
  return successResponse(res, {
    statusCode: 201,
    message: "Institute created successfully",
    data
  });
};

const listInstitutes = async (req, res) => {
  const result = await instituteService.listInstitutes(req.query);
  return successResponse(res, {
    message: "Institutes fetched successfully",
    data: result.items,
    meta: result.meta
  });
};

const updateInstituteStatus = async (req, res) => {
  const data = await instituteService.updateInstituteStatus(req.params.instituteId, req.body.isActive, req.user);
  return successResponse(res, {
    message: "Institute status updated successfully",
    data
  });
};

module.exports = {
  createInstitute,
  listInstitutes,
  updateInstituteStatus
};
