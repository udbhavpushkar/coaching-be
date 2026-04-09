const requireUser = (req) => {
  if (!req.user) {
    return null;
  }

  return {
    userId: req.user.id,
    role: req.user.role,
    instituteId: req.user.instituteId || null
  };
};

module.exports = { requireUser };
