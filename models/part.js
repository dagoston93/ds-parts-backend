const mongoose = require("mongoose");
const Joi = require("joi");

const partSchema = new mongoose.Schema({
    name: { 
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 255
    },
    manufacturer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manufacturer"
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package"
    },
    price: {
        type: Number,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }
});

const Part = mongoose.model("Part", partSchema);

function validate(part) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        manufacturer: Joi.objectId(),
        package: Joi.objectId(),
        price: Joi.number().greater(0).required(),
        count: Joi.number().min(0).required(),
        createdBy: Joi.string(),
        category: Joi.objectId()
    });

    return schema.validate(part);
}

module.exports.Part = Part;
module.exports.validate = validate;
