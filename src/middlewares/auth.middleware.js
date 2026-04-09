const prisma = require("../prisma/client");
const { verifyToken } = require("../utils/jwt");
const { ApiError } = require("../utils/api-error");

const authMiddleware = async (req, _res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const token = authorization.split(" ")[1];

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findFirst({
      where: {
        id: payload.id,
        deletedAt: null
      },
      include: {
        institute: true
      }
    });

    if (!user) {
      return next(new ApiError(401, "Invalid token"));
    }

    if (user.role !== "SUPER_ADMIN" && (!user.instituteId || !user.institute?.isActive)) {
      return next(new ApiError(403, "Institute is inactive or missing"));
    }

    req.user = {
      id: user.id,
      role: user.role,
      instituteId: user.instituteId,
      email: user.email
    };

    return next();
  } catch (_error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

module.exports = { authMiddleware };
