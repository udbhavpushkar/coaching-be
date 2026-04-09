const { ApiError } = require("../utils/api-error");

const tenantMiddleware = (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized"));
  }

  if (req.user.role === "SUPER_ADMIN") {
    req.tenant = { instituteId: req.query.instituteId || null, isSuperAdmin: true };
    return next();
  }

  if (!req.user.instituteId) {
    return next(new ApiError(403, "Institute context missing"));
  }

  req.tenant = {
    instituteId: req.user.instituteId,
    isSuperAdmin: false
  };

  return next();
};

module.exports = { tenantMiddleware };
