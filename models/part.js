const mongoose = require("mongoose");
const Joi = require("joi");
const lodash = require("lodash");
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
    partPackage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartPackage",
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
        ref: "User"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        autopopulate: { select: "name" }
    },
    primaryImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
        autopopulate: true
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
        autopopulate: true
    }],
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
        autopopulate: true
    }],
});

partSchema.plugin(autopopulate);
const Part = mongoose.model("Part", partSchema);

function validate(part) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        manufacturer: Joi.objectId(),
        partPackage: Joi.objectId(),
        price: Joi.number().greater(0).required(),
        count: Joi.number().min(0).required(),
        category: Joi.objectId(),
        createdBy: Joi.objectId(),
        primaryImage: Joi.objectId(),
        images: Joi.array().items(Joi.objectId()),
        files: Joi.array().items(Joi.objectId()),
    });

    return schema.validate(part);
}

function pickProperties(obj) {
    return lodash.pick(
        obj,
        [
            "name",
            "manufacturer",
            "partPackage",
            "price",
            "count",
            "category",
            "primaryImage",
            "images",
            "files",
        ]);
}

module.exports.Part = Part;
module.exports.validate = validate;
module.exports.pickProperties = pickProperties;
