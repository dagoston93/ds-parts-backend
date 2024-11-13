const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const auth = require("../middleware/auth");
const tokenStore = require("../util/inMemoryTokenStore");
const { User } = require("../models/user");

const router = express.Router();

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let user = await User.findOne({ email: req.body.email });
    if(!user) {
        res.status(400).send("Invalid e-mail address or password!\n");
        return;
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) {
        res.status(400).send("Invalid e-mail address or password!\n");
        return;
    }

    const token = await user.generateAuthToken();
    res.send(token);
});

router.post("/logout", auth, async (req, res) => {
    let user = await User.findById(req.user._id);
    if(!user) {
        res.status(400).send("User with given ID not found.");
        return;
    }

    await user.invalidateToken(req.tokenId);
    tokenStore.invalidateToken(req.user._id, req.tokenId);

    res.send(req.user._id);
});

function validate(user) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });

    return schema.validate(user);
}

module.exports = router;