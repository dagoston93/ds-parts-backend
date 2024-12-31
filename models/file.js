const mongoose = require("mongoose");
const Joi = require("joi");
const lodash = require("lodash");
const autopopulate = require("mongoose-autopopulate");

const baseSchema = new mongoose.Schema({
    name: { 
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 150
    },
    description: { 
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 150
    },
    fileName: {
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 255
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});


const fileSchema = new mongoose.Schema(baseSchema.obj);
const imageSchema = new mongoose.Schema(baseSchema.obj);

fileSchema.plugin(autopopulate);
imageSchema.plugin(autopopulate);

const File = mongoose.model("File", fileSchema);
const Image = mongoose.model("Image", imageSchema);

function validate(file) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(150).required(),
        description: Joi.string().min(2).max(150).required(),
        fileName: Joi.string().min(2).max(255),
        createdBy: Joi.objectId(),
    });

    return schema.validate(file);
}

function pickProperties(obj) {
    return lodash.pick(obj, ["name", "description"]);
}

async function fileExists(fileName) {
    const file = await File.findOne({ fileName: fileName });
    if(file) {
        return true;
    }

    return false;
}

async function imageExists(fileName) {
    const image = await Image.findOne({ fileName: fileName });
    if(image) {
        return true;
    }

    return false;
}

module.exports.File = File;
module.exports.Image = Image;
module.exports.validate = validate;
module.exports.pickProperties = pickProperties;
module.exports.fileExists = fileExists;
module.exports.imageExists = imageExists;