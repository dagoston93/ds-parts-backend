const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const { canModifyUsers, canDeleteUsers } = require("../middleware/userRights");
const { User, validate, findByEmail, pickProperties } = require("../models/user");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    const users = await User.find();

    res.send(users);
});

router.get("/:id", auth, async (req, res) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(404).send("User with given ID not found.");
        return;
    }

    res.send(user);
});

router.post("/", [auth, canModifyUsers], async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }
    
    let user = await findByEmail(req.body.email);
    if(user) {
        res.status(400).send("User with the give e-mail already exists.");
        return;
    }

    user = new User(pickProperties(req.body));
    let salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.createdBy = req.user;
    user.save();

    res.send(pickProperties(user));
});

router.delete("/:id", [auth, canDeleteUsers], async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if(!user) {
        res.status(404).send("User with given ID not found.");
        return;
    }

    res.send(pickProperties(user));
});

module.exports = router;