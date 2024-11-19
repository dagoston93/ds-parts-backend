const express = require("express");
require("express-async-errors");

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const config = require("config");

const setupRoutes = require("./startup/routes");
const { initDb } = require("./startup/db");
const initConfig = require("./startup/config");
const { logger } = require("./util/logger");
const { User } = require("./models/user");

initConfig();

const app = express();
setupRoutes(app);

initDb();
User.initTokenStore();

const port = config.get("port");
const server = app.listen(port, () => logger.info(`Listening on port ${port}...`));

module.exports = server;
