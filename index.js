const express = require("express");
require("express-async-errors");

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const config = require("config");

const setupRoutes = require("./startup/routes");
const { initDb } = require("./startup/db");
const initConfig = require("./startup/config");
const { logger } = require("./util/logger");

initConfig();

const app = express();
setupRoutes(app);

initDb();

const port = config.get("port");
app.listen(port, () => logger.info(`Listening on port ${port}...`));
