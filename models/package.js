const mongoose = require("mongoose");
const Joi = require("joi");

const packageTypes = ["SMD", "THT"];

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    type: {
        type: String,
        enum: packageTypes
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

module.exports.Package = Package;
module.exports.validate = validate;
module.exports.packageTypes = packageTypes;
