const { ApiError } = require("../utils/api-error");

const ensureTenantScope = (req) => {
  if (!req.tenant) {
    throw new ApiError(500, "Tenant context not initialized");
  }

  return req.tenant;
};

const getTenantWhere = (req, additionalWhere = {}) => {
  const { instituteId, isSuperAdmin } = ensureTenantScope(req);

  if (isSuperAdmin && !instituteId) {
    return additionalWhere;
  }

  return {
    ...additionalWhere,
    instituteId
  };
};

const assertTenantAccess = (req, instituteId) => {
  const { instituteId: tenantId, isSuperAdmin } = ensureTenantScope(req);

  if (!isSuperAdmin && tenantId !== instituteId) {
    throw new ApiError(403, "Cross-tenant access denied");
  }
};

module.exports = {
  ensureTenantScope,
  getTenantWhere,
  assertTenantAccess
};
