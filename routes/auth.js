const express = require("express");
const lodash = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");

const { User } = require("../models/user");

const router = express.Router();

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let user = await User.findOne({ email: req.body.email }).populate("group");
    if(!user) {
        res.status(400).send("Invalid e-mail address or password!\n");
        return;
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) {
        res.status(400).send("Invalid e-mail address or password!\n");
        return;
    }

    const token = user.generateAuthToken();
    res.send(token);
});

function validate(user) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });

    return schema.validate(user);
}

module.exports = router;