const mongoose = require("mongoose");
const Joi = require("joi");
const autopopulate = require("mongoose-autopopulate");

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
        ref: "Manufacturer",
        autopopulate: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
        autopopulate: true
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
        ref: "User",
        autopopulate: { select: "name email" }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        autopopulate: { select: "name" }
    }
});

partSchema.plugin(autopopulate);
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
