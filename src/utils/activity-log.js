const prisma = require("../prisma/client");

const logActivity = async ({
  userId,
  instituteId = null,
  action,
  entity,
  entityId,
  metadata = {}
}) => {
  return prisma.activityLog.create({
    data: {
      userId,
      instituteId,
      action,
      entity,
      entityId,
      metadata
    }
  });
};

module.exports = { logActivity };
