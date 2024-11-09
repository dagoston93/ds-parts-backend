const express = require("express");
const mongoose = require("mongoose");

const config = require("config");

const helmet = require("helmet");
const morgan = require("morgan");

const parts = require("./routes/parts");
const categories = require("./routes/categories");
const users = require("./routes/users");
const groups = require("./routes/groups");
const manufacturers = require("./routes/manufacturers");
const packages = require("./routes/packages");

const logger = require("./middleware/logger");

const app = express();
app.use(helmet());
app.use(express.json());

if(app.get("env") == "development") {
    app.use(morgan('tiny'));
    app.use(logger);

    console.log("Logging enabled...");
}

app.use("/api/parts", parts);
app.use("/api/categories", categories);
app.use("/api/users", users);
app.use("/api/groups", groups);
app.use("/api/manufacturers", manufacturers);
app.use("/api/packages", packages);

const dbConnString = config.get("dbConnString");

mongoose.connect(dbConnString)
    .then(()=>console.log("Connected to MongoDB..."))
    .catch(err => console.log("Failed to connect to MongoDB: ", err.message));

const port = config.get("port");
app.listen(port, () => console.log(`Listening on port ${port}...`));

