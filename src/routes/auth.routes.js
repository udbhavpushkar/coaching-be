const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const authController = require("../controllers/auth.controller");
const { validate } = require("../middlewares/validate.middleware");
const { loginSchema } = require("../validators/auth.validator");

const router = express.Router();

router.post("/login", validate(loginSchema), asyncHandler(authController.login));

module.exports = router;
