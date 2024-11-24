const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const lodash = require("lodash");
const { canModifyUsers, canDeleteUsers } = require("../middleware/userRights");
const { User, validateUser, validateUserRights, findByEmail, pickUserProperties, pickUserRightsProperties } = require("../models/user");
const tokenStore = require("../util/inMemoryTokenStore");

const router = express.Router();

router.get("/", [auth, canModifyUsers], async (req, res) => {
    const users = await User.find();

    res.send(users);
});

router.get("/:id", [auth, canModifyUsers, validateObjectId], async (req, res) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(404).send("User with given ID not found.");
        return;
    }

    res.send(user);
});

router.post("/", [auth, canModifyUsers], async (req, res) => {
    const { error } = validateUser(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }
    
    let user = await findByEmail(req.body.email);
    if(user) {
        res.status(400).send("User with the give e-mail already exists.");
        return;
    }

    user = new User(pickUserProperties(req.body));
    let salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.createdBy = req.user;
    validTokens = [];
    user.save();

    res.send(pickUserProperties(user));
});

router.put("/rights/:id", [auth, canModifyUsers, validateObjectId], async (req, res) => {
    const { error } = validateUserRights(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }
    
    let user = await User.findById(req.params.id);
    if(!user) {
        res.status(404).send("User with the given ID does not exist.");
        return;
    }

    if(!lodash.isEqual(pickUserRightsProperties(req.body), pickUserRightsProperties(user.rights))) {
        Object.assign(user.rights, pickUserRightsProperties(req.body));
        user = await user.save();

        await user.invalidateAllTokens();
        tokenStore.invalidateAllTokens(user._id);
    }

    res.send(pickUserProperties(user));
});

router.delete("/:id", [auth, canDeleteUsers, validateObjectId], async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if(!user) {
        res.status(404).send("User with given ID not found.");
        return;
    }

    tokenStore.removeUser(user._id);
    res.send(pickUserProperties(user));
});

module.exports = router;