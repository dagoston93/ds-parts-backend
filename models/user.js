const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const lodash = require("lodash");
const passwordComplexity = require("joi-password-complexity");
const config = require("config");
const autopopulate = require("mongoose-autopopulate");
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
    rights: {
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
    }
});

userSchema.plugin(autopopulate);

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        lodash.pick(this, [
            "_id",
            "name",
            "rights.canModifyParts",
            "rights.canDeleteParts",
            "rights.canModifyUsers",
            "rights.canDeleteUsers"]),
        config.get("jwtPrivateKey"));

    return token;
}

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
        rights: {
            canModifyParts : Joi.bool().required(),
            canDeleteParts : Joi.bool().required(),
            canModifyUsers : Joi.bool().required(),
            canDeleteUsers : Joi.bool().required()
        }
    });

    return schema.validate(user);
}

async function findByEmail(email) {
    return await User.findOne({ email: email });
}

function pickProperties(obj) {
    return lodash.pick(obj, ["_id", "name", "email", "rights"]);
}

module.exports.User = User;
module.exports.validate = validate;
module.exports.findByEmail = findByEmail;
module.exports.pickProperties = pickProperties;
