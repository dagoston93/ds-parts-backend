const { logger } = require("../util/logger");
const mongoose = require("mongoose");
const config = require("config");

module.exports = function() {
    const dbConnString = config.get("dbConnString");

    mongoose.connect(dbConnString)
    .then(()=>logger.info("Connected to MongoDB..."))
    .catch(err => {
        logger.error("Failed to connect to MongoDB: ", err);
        process.exit(1);
    });
}