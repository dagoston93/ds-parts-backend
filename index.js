const express = require("express");
require("express-async-errors");
const { logger, morganMiddleware } = require("./util/logger");
const error = require("./middleware/error");
const mongoose = require("mongoose");

const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const config = require("config");

const helmet = require("helmet");


const parts = require("./routes/parts");
const categories = require("./routes/categories");
const users = require("./routes/users");
const manufacturers = require("./routes/manufacturers");
const packages = require("./routes/packages");
const auth = require("./routes/auth");

if(!config.get("jwtPrivateKey")) {
    console.error("FATAL ERROR: jwtPrivateKey is NOT set.");
    process.exit(1);
}

const app = express();
app.use(helmet());
app.use(express.json());

// if(app.get("env") == "development") {
//     app.use(morgan('tiny'));
//     logger.info("Logging enabled...");
// }
app.use(morganMiddleware);
app.use("/api/parts", parts);
app.use("/api/categories", categories);
app.use("/api/users", users);
app.use("/api/manufacturers", manufacturers);
app.use("/api/packages", packages);
app.use("/api/auth", auth);

app.use(error);

const dbConnString = config.get("dbConnString");

mongoose.connect(dbConnString)
    .then(()=>logger.info("Connected to MongoDB..."))
    .catch(err => logger.error("Failed to connect to MongoDB: ", err));

const port = config.get("port");
app.listen(port, () => logger.info(`Listening on port ${port}...`));

