const express = require("express");
const parts = require("./routes/parts");

const Joi = require("joi");
const config = require("config");

const logger = require("./middleware/logger");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(helmet());

if(app.get("env") == "development") {
    app.use(morgan('tiny'));
    app.use(logger);

    console.log("Logging enabled...");
}

app.use("/api/parts", parts);


const port = config.get("port");
app.listen(port, () => console.log(`Listening on port ${port}...`));
