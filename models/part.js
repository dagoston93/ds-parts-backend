const mongoose = require("mongoose");
const Joi = require("joi");
const lodash = require("lodash");
const autopopulate = require("mongoose-autopopulate");

const customFieldValueSchema = new mongoose.Schema({
    numericValue: {
        type: Number
    },
    stringValue: {
        type: String,
        trim: true,
        maxlength: 255
    },
    unit: {
        type: String,
        trim: true,
        maxlength: 50
    },
    _id: {
        type: mongoose.Schema.Types.ObjectId,
    }
});

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
    container: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Container",
        autopopulate: { select: "name" }
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
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
    customFieldValues: {
        type: mongoose.Schema.Types.Map,
        of: customFieldValueSchema,
        autopopulate: true
    }
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
        container: Joi.objectId(),
        description: Joi.string().max(500).allow(""),
        createdBy: Joi.objectId(),
        primaryImage: Joi.objectId(),
        images: Joi.array().items(Joi.objectId()),
        files: Joi.array().items(Joi.objectId()),
        customFieldValues: Joi.object().pattern(
            Joi.string(),
            Joi.object(
                {
                    numericValue: Joi.number(),
                    stringValue: Joi.string().max(255),
                    unit: Joi.string().max(50),
                }
            )
        ),
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
            "container",
            "description",
            "primaryImage",
            "images",
            "files",
            "customFieldValues",
        ]);
}

module.exports.Part = Part;
module.exports.validate = validate;
module.exports.pickProperties = pickProperties;
