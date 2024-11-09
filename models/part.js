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
        type: String/*mongoose.Schema.Types.ObjectId*/,
        required: true
    },
    package: {
        type: String/*mongoose.Schema.Types.ObjectId*/,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    createdOn: {
        type: Date, 
        required: true
    },
    createdBy: {
        type: String/*mongoose.Schema.Types.ObjectId*/,
        required: true
    },
    category: {
        type: String/*mongoose.Schema.Types.ObjectId*/
    }
});

const Part = mongoose.model("Part", partSchema);

function validate(part) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        manufacturer: Joi.string().required(),
        package: Joi.string().required(),
        price: Joi.number().greater(0).required(),
        count: Joi.number().min(0).required(),
        createdOn: Joi.number().required(),
        createdBy: Joi.string().required(),
        category: Joi.string()
    });

    return schema.validate(part);
}

module.exports.Part = Part;
module.exports.validate = validate;
