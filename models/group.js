const mongoose = require("mongoose");
const Joi = require("joi");

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 100
    },
    canModifyParts: {
        type: Boolean,
        required: true
    },
    canDeleteParts: {
        type: Boolean,
        required: true
    },
    canModifyUsers: {
        type: Boolean,
        required: true
    },
    canDeleteUsers: {
        type: Boolean,
        required: true
    }
});

const Group = mongoose.model("Group", groupSchema);

function validate(group) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        canModifyParts: Joi.boolean().required(),
        canDeleteParts: Joi.boolean().required(),
        canModifyUsers: Joi.boolean().required(),
        canDeleteUsers: Joi.boolean().required()
    });

    return schema.validate(group);
}

module.exports.Group = Group;
module.exports.validate = validate;
