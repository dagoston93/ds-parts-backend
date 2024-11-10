const mongoose = require("mongoose");
const Joi = require("joi");
const autopopulate = require("mongoose-autopopulate");

const categorySchema = new mongoose.Schema({
    name: { 
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 255
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        autopopulate: { select: "name email" }
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        autopopulate: { select: "name" }
    }
});

categorySchema.plugin(autopopulate);

const Category = mongoose.model("Category", categorySchema);

function validate(category) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        createdBy: Joi.objectId(),
        parent: Joi.objectId()
    });

    return schema.validate(category);
}

module.exports.Category = Category;
module.exports.validate = validate;