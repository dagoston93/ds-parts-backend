const mongoose = require("mongoose");
const Joi = require("joi");
const lodash = require("lodash");
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
        ref: "User"
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

function pickProperties(obj) {
    return lodash.pick(obj, ["name", "parent"]);
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
