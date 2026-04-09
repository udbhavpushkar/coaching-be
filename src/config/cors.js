const { env } = require("./env");

const origins = env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((origin) => origin.trim());

const corsOptions = {
  origin: origins,
  credentials: true
};

module.exports = { corsOptions };
