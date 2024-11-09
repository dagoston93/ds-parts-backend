const mongoose = require("mongoose");
const Joi = require("joi");
const { isEmail } = require("validator");

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
        validate: {
            validator: isEmail,
            messsage: "Invalid e-mail address."
        }
    },
    password: {
        type: String,
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }
});

const User = mongoose.model("User", userSchema);

function validate(user) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.custom((value, helper) => {
            if(!isEmail(value)) {
                return helper.error("any.invalid");
            }

            return value;
        }).required(),
        password: Joi.string().required(),
        group: Joi.objectId().required()
    });

    return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validate;
