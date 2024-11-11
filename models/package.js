const mongoose = require("mongoose");
const Joi = require("joi");
const lodash = require("lodash");

const packageTypes = ["SMD", "THT"];

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 50,
        unique: true
    },
    type: {
        type: String,
        enum: packageTypes
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        autopopulate: { select: "name email" }
    }
});

const Package = mongoose.model("Package", packageSchema);


function validate(package) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        type: Joi.string().valid(...packageTypes)
    });

    return schema.validate(package);
}

async function findByName(name) {
    return await Package.findOne({ name: name });
}

function pickProperties(obj) {
    return lodash.pick(obj, ["name", "type"]);
}

async function exists(id) {
    const package = await Package.findOne({ _id: id });
    if(package) {
        return true;
    }

    return false;
}

module.exports.Package = Package;
module.exports.validate = validate;
module.exports.packageTypes = packageTypes;
module.exports.findByName = findByName;
module.exports.pickProperties = pickProperties;
module.exports.exists = exists;
