const { logger } = require("../util/logger");

module.exports = function (err, req, res, next) {
    logger.error("", err);
    res.status(500).send("Internal server error.");
}