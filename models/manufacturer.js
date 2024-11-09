const mongoose = require("mongoose");
const Joi = require("joi");

const manufacturerSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 150
    }
});

const Manufacturer = mongoose.model("Manufacturer", manufacturerSchema);

function validate(manufacturer) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(150).required()
    });

    return schema.validate(manufacturer);
}

module.exports.Manufacturer = Manufacturer;
module.exports.validate = validate;
