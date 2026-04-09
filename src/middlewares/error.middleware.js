const { ZodError } = require("zod");
const { Prisma } = require("@prisma/client");
const { ApiError } = require("../utils/api-error");
const { errorResponse } = require("../utils/response");

const notFoundHandler = (_req, _res, next) => {
  next(new ApiError(404, "Route not found"));
};

const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    return errorResponse(res, {
      statusCode: error.statusCode,
      message: error.message,
      details: error.details
    });
  }

  if (error instanceof ZodError) {
    return errorResponse(res, {
      statusCode: 422,
      message: "Validation failed",
      details: error.flatten()
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return errorResponse(res, {
      statusCode: 400,
      message: "Database operation failed",
      details: {
        code: error.code,
        meta: error.meta
      }
    });
  }

  return errorResponse(res, {
    statusCode: 500,
    message: error.message || "Internal Server Error"
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
