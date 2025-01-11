const mongoose = require("mongoose");
const Joi = require("joi");
const lodash = require("lodash");

const containerSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 150,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const Container = mongoose.model("Container", containerSchema);

function validate(container) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(150).required(),
        createdBy: Joi.objectId()
    });

    return schema.validate(container);
}

function pickProperties(obj) {
    return lodash.pick(obj, ["name"]);
}

async function findByName(name) {
    return await Container.findOne({ name: name });
}

async function exists(id) {
    const container = await Container.findOne({ _id: id });
    if(container) {
        return true;
    }

    return false;
}

module.exports.Container = Container;
module.exports.validate = validate;
module.exports.findByName = findByName;
module.exports.pickProperties = pickProperties;
module.exports.exists = exists;
