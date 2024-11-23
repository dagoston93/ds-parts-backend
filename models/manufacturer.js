const mongoose = require("mongoose");
const Joi = require("joi");
const lodash = require("lodash");

const manufacturerSchema = new mongoose.Schema({
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
        ref: "User",
        autopopulate: { select: "name email" }
    }
});

const Manufacturer = mongoose.model("Manufacturer", manufacturerSchema);

function validate(manufacturer) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(150).required(),
        createdBy: Joi.objectId()
    });

    return schema.validate(manufacturer);
}

function pickProperties(obj) {
    return lodash.pick(obj, ["name", "parent"]);
}

async function findByName(name) {
    return await Manufacturer.findOne({ name: name });
}

async function exists(id) {
    const manufacturer = await Manufacturer.findOne({ _id: id });
    if(manufacturer) {
        return true;
    }

    return false;
}

module.exports.Manufacturer = Manufacturer;
module.exports.validate = validate;
module.exports.findByName = findByName;
module.exports.pickProperties = pickProperties;
module.exports.exists = exists;
