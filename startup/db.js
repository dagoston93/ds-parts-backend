const { logger } = require("../util/logger");
const mongoose = require("mongoose");
const config = require("config");


function initDb() {
    const dbConnString = config.get("dbConnString");

    mongoose.connect(dbConnString)
        .then(()=>logger.info(`Connected to MongoDB at ${dbConnString}...`))
        .catch(err => {
            logger.error(`Failed to connect to MongoDB at ${dbConnString}: `, err);
            process.exit(1);
        });
}

module.exports.initDb = initDb;
