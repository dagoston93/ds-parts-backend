const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
    name: { 
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 255
    },
    createdOn: {
        type: Date, 
        required: true
    },
    createdBy: {
        type: String/*mongoose.Schema.Types.ObjectId*/,
        required: true
    },
    parent: {
        type: String/*mongoose.Schema.Types.ObjectId*/,
    }
});

const Category = mongoose.model("Category", categorySchema);

function validate(category) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        createdOn: Joi.number().required(),
        createdBy: Joi.string().required(),
        parent: Joi.string()
    });

    return schema.validate(category);
}

module.exports.Category = Category;
module.exports.validate = validate;