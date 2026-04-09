const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  explorer: true,
  definition: {
    openapi: "3.0.0",
    info: {
      title: "InstituteOS API",
      version: "1.0.0",
      description: "Multi-tenant Coaching ERP backend for India"
    },
    // components: {
    //   securitySchemes: {
    //     bearerAuth: {
    //       type: "http",
    //       scheme: "bearer",
    //       bearerFormat: "JWT"
    //     }
    //   }
    // },
    // security: [{ bearerAuth: [] }],
  },
  apis: []
};

module.exports = swaggerJSDoc(options);
