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

const PartPackage = mongoose.model("PartPackage", packageSchema);


function validate(partPackage) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        type: Joi.string().valid(...packageTypes),
        createdBy: Joi.objectId()
    });

    return schema.validate(partPackage);
}

async function findByName(name) {
    return await PartPackage.findOne({ name: name });
}

function pickProperties(obj) {
    return lodash.pick(obj, ["name", "type"]);
}

async function exists(id) {
    const partPackage = await PartPackage.findOne({ _id: id });
    if(partPackage) {
        return true;
    }

    return false;
}

module.exports.PartPackage = PartPackage;
module.exports.validate = validate;
module.exports.packageTypes = packageTypes;
module.exports.findByName = findByName;
module.exports.pickProperties = pickProperties;
module.exports.exists = exists;
