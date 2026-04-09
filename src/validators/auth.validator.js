const { z } = require("./common.validator");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

module.exports = {
  loginSchema
};
