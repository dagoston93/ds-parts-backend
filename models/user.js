const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
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
        },
        unique: true
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

const passwordComplexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  };

function validate(user) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.custom((value, helper) => {
            if(!isEmail(value)) {
                return helper.error("any.invalid");
            }

            return value;
        }).required(),
        password: passwordComplexity(passwordComplexityOptions),
        group: Joi.objectId().required()
    });

    return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validate;
