const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true
  }
};

const swaggerSpec = require("./openapi");

module.exports = {
  swaggerSpec,
  swaggerUiOptions
};
