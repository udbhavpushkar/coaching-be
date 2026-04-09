const authService = require("../services/auth.service");
const { successResponse } = require("../utils/response");

const login = async (req, res) => {
  const data = await authService.login(req.body);
  return successResponse(res, {
    message: "Login successful",
    data
  });
};

module.exports = {
  login
};
