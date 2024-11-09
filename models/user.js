const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    group: {
        type: String/*mongoose.Schema.Types.ObjectId*/,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

function validate(user) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        group: Joi.string().required()
    });

    return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validate;
