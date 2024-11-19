const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const lodash = require("lodash");
const passwordComplexity = require("joi-password-complexity");
const config = require("config");
const autopopulate = require("mongoose-autopopulate");
const { isEmail } = require("validator");
const { nanoid } = require('nanoid');
const tokenStore = require("../util/inMemoryTokenStore");

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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        autopopulate: { select: "name email" }
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
    },
    validTokens: [String]
});

userSchema.plugin(autopopulate);

userSchema.methods.generateAuthToken = async function() {
    let tokenData = {};
    tokenData.user = lodash.pick(this, [
        "_id",
        "name",
        "rights.canModifyParts",
        "rights.canDeleteParts",
        "rights.canModifyUsers",
        "rights.canDeleteUsers"]);

    const tokenId = nanoid(10);
    tokenData.tokenId = tokenId;
    tokenStore.addToken(this._id, tokenId);
    
    this.validTokens.push(tokenId);
    await this.save();

    const token = jwt.sign(tokenData, config.get("jwtPrivateKey"));

    return token;
}

userSchema.methods.invalidateToken = async function (tokenId) {
    this.validTokens = this.validTokens.filter(id => id != tokenId);
    await this.save();
}

userSchema.statics.initTokenStore = async function () {
    await this.find().then(users => {
        users.forEach(user => {
            user.validTokens.forEach(token => {
                tokenStore.addToken(user._id, token);
            });
        });
    });
};

userSchema.methods.invalidateAllTokens = async function () {
    this.validTokens = [];
    await this.save();
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

const userRightsSchema = {
    canModifyParts : Joi.bool().required(),
    canDeleteParts : Joi.bool().required(),
    canModifyUsers : Joi.bool().required(),
    canDeleteUsers : Joi.bool().required()
};

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.custom((value, helper) => {
            if(!isEmail(value)) {
                return helper.error("any.invalid");
            }

            return value;
        }).required(),
        password: passwordComplexity(passwordComplexityOptions),
        rights: userRightsSchema
    });

    return schema.validate(user);
}

function validateUserRights(rights) {
    const schema = Joi.object(userRightsSchema);
    return schema.validate(rights);
}

async function findByEmail(email) {
    return await User.findOne({ email: email });
}

function pickUserProperties(obj) {
    return lodash.pick(obj, ["name", "email", "rights"]);
}

function pickUserRightsProperties(obj) {
    return lodash.pick(obj, ["canModifyParts", "canDeleteParts", "canModifyUsers", "canDeleteUsers"]);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.validateUserRights = validateUserRights;
module.exports.findByEmail = findByEmail;
module.exports.pickUserProperties = pickUserProperties;
module.exports.pickUserRightsProperties = pickUserRightsProperties;
