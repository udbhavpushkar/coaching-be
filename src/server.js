require("dotenv").config();

const app = require("./app");
const { env } = require("./config/env");

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`InstituteOS backend running on port ${env.port}`);
});
