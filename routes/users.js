const express = require("express");

const { User, validate } = require("../models/user");

const router = express.Router();

router.get("/", async (req, res) => {
    const users = await User
        .find()
        .populate("group");

    res.send(users);
});

router.get("/:id", async (req, res) => {
    const user = await User
        .findById(req.params.id)
        .populate("group");

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

    let existingUser = await User.find({ email: req.body.email });

    if(existingUser.length > 0) {
        res.status(400).send("User with the given e-mail already exists.");
        return;
    }

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password:  req.body.password,
        group: req.body.group
    });

    user.save();

    user = await User
        .findById(user._id)
        .populate("group");

    res.send(user);
});

router.put("/:id", async (req, res) => {
    const {error} = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let user = await User.findById(req.params.id);

    if(!user) {
        res.status(404).send("User with given ID not found.");
        return;
    }

    if(req.body.email != user.email) {
        let existingUser = await User.find({ email: req.body.email });

        if(existingUser.length > 0) {
            res.status(400).send("User with the given e-mail already exists.");
            return;
        }
    }

    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;
    user.group = req.body.group;

    await user.save();
    user = await User
        .findById(user._id)
        .populate("group");

    res.send(user);
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