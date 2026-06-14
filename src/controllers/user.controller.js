const userService = require("../services/user.service");
const { successResponse } = require("../utils/response");

const createSuperAdmin = async (req, res) => {
  const data = await userService.createSuperAdmin(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "Super admin created successfully",
    data
  });
};

const createUser = async (req, res) => {
  const data = await userService.createUser(req, req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "User created successfully",
    data
  });
};

const listUsers = async (req, res) => {
  const result = await userService.listUsers(req, req.query);
  return successResponse(res, {
    message: "Users fetched successfully",
    data: result.items,
    meta: result.meta
  });
};

const deleteUser = async (req, res) => {
  const data = await userService.softDeleteUser(req, req.params.userId);
  return successResponse(res, {
    message: "User deleted successfully",
    data
  });
};

module.exports = {
  createSuperAdmin,
  createUser,
  listUsers,
  deleteUser
};
