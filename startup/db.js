const { logger } = require("../util/logger");
const mongoose = require("mongoose");
const config = require("config");
const { User } = require("../models/user");

const tokenStore = {};

function initDb() {
    const dbConnString = config.get("dbConnString");

    mongoose.connect(dbConnString)
    .then(()=>logger.info(`Connected to MongoDB at ${dbConnString}...`))
    .catch(err => {
        logger.error(`Failed to connect to MongoDB at ${dbConnString}: `, err);
        process.exit(1);
    });

    User.find().then(users => {
        users.forEach(user => {
            tokenStore[user._id] = user.validTokens;
        })
    });
}

module.exports.initDb = initDb;
module.exports.tokenStore = tokenStore;