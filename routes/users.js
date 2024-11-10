const express = require("express");
const lodash = require("lodash");
const bcrypt = require("bcrypt");

const { User, validate } = require("../models/user");

const router = express.Router();

router.get("/", async (req, res) => {
    const users = await User.find();

    res.send(users);
});

router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(404).send("User with given ID not found.");
        return;
    }

    res.send(user);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let user = new User(lodash.pick(req.body, ["name", "email", "rights"]));
    let salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.save();

    res.send(lodash.pick(user, ["name", "email", "rights"]));
});

router.delete("/:id", async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if(!user) {
        res.status(404).send("User with given ID not found.");
        return;
    }

    res.send(user);
});

module.exports = router;