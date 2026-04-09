const { Prisma } = require("@prisma/client");

const buildSearchFilter = (search, fields = []) => {
  if (!search || !fields.length) {
    return {};
  }

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search,
        mode: Prisma.QueryMode.insensitive
      }
    }))
  };
};

const withSoftDelete = (where = {}) => ({
  ...where,
  deletedAt: null
});

module.exports = {
  buildSearchFilter,
  withSoftDelete
};
