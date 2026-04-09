const prisma = require("../prisma/client");
const { comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { ApiError } = require("../utils/api-error");
const { logActivity } = require("../utils/activity-log");

const login = async ({ email, password }) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null
    },
    include: {
      institute: true
    }
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.role !== "SUPER_ADMIN" && (!user.institute || !user.institute.isActive)) {
    throw new ApiError(403, "Institute is inactive");
  }

  const token = signToken({
    id: user.id,
    role: user.role,
    instituteId: user.instituteId
  });

  await logActivity({
    userId: user.id,
    instituteId: user.instituteId,
    action: "LOGIN",
    entity: "AUTH",
    entityId: user.id,
    metadata: { email: user.email }
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      instituteId: user.instituteId
    }
  };
};

module.exports = {
  login
};
