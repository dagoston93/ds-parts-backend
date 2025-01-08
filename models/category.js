const mongoose = require("mongoose");
const Joi = require("joi");
const lodash = require("lodash");
const autopopulate = require("mongoose-autopopulate");

const customFieldSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 150
    },
    type: {
        type: String,
        required: true
    },
    required: {
        type: Boolean,
        required: true
    }
});

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
        ref: "User"
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        autopopulate: { select: "name" }
    },
    customFields:  [customFieldSchema]
});

categorySchema.plugin(autopopulate);

const Category = mongoose.model("Category", categorySchema);

function validate(category) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        createdBy: Joi.objectId(),
        parent: Joi.objectId(),
        customFields: Joi.array().items(Joi.object())
    });

    return schema.validate(category);
}

function pickProperties(obj) {
    return lodash.pick(obj, ["name", "parent", "customFields"]);
}

async function exists(id) {
    const category = await Category.findOne({ _id: id });
    if(category) {
        return true;
    }

    return false;
}

module.exports.Category = Category;
module.exports.validate = validate;
module.exports.pickProperties = pickProperties;
module.exports.exists = exists;
