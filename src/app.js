const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const { corsOptions } = require("./config/cors");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");
const { successResponse } = require("./utils/response");
const swaggerSpec = require("./config/swagger");

const swaggerUi = require("swagger-ui-express");

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.get("/health", (_req, res) => {
  return successResponse(res, {
    message: "InstituteOS backend is healthy",
    data: { uptime: process.uptime() }
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
