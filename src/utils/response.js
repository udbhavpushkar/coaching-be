const successResponse = (res, { statusCode = 200, message = "Success", data = null, meta = null }) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });

const errorResponse = (res, { statusCode = 500, message = "Internal Server Error", details = null }) =>
  res.status(statusCode).json({
    success: false,
    message,
    details
  });

module.exports = {
  successResponse,
  errorResponse
};
