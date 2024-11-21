const mongoose = require("mongoose");

function getLongString(length) {
    return new Array(length + 1).join("a")
}

function getValidObjectId() {
    return new mongoose.Types.ObjectId().toHexString();
}

module.exports.getLongString = getLongString;
module.exports.getValidObjectId = getValidObjectId;
