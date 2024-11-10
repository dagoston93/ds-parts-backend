const mongoose = require("mongoose");
const Joi = require("joi");

const manufacturerSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 150,
        unique: true
    }
});

const Manufacturer = mongoose.model("Manufacturer", manufacturerSchema);

function validate(manufacturer) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(150).required()
    });

    return schema.validate(manufacturer);
}

async function findByName(name) {
    return await Manufacturer.findOne({ name: name });
}

module.exports.Manufacturer = Manufacturer;
module.exports.validate = validate;
module.exports.findByName = findByName;
