const express = require("express");

const { Group, validate } = require("../models/group");

const router = express.Router();

router.get("/", async (req, res) => {
    const groups = await Group.find();
    res.send(groups);
});

router.get("/:id", async (req, res) => {
    const group = await Group.findById(req.params.id);

    if(!group) {
        res.status(404).send("Group with given ID not found.");
        return;
    }

    res.send(group);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let group = new Group({
        name: req.body.name,
        canModifyParts: req.body.canModifyParts,
        canDeleteParts: req.body.canDeleteParts,
        canModifyUsers: req.body.canModifyUsers,
        canDeleteUsers: req.body.canDeleteUsers
    });

    group = await group.save();
    res.send(group);
});

router.put("/:id", async (req, res) => {
    const {error} = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let group = await Group.findById(req.params.id);

    if(!group) {
        res.status(404).send("Group with given ID not found.");
        return;
    }

    group.name = req.body.name;
    group.canModifyParts = req.body.canModifyParts;
    group.canDeleteParts = req.body.canDeleteParts;
    group.canModifyUsers = req.body.canModifyUsers;
    group.canDeleteUsers = req.body.canDeleteUsers;

    group = await group.save();
    res.send(group);
});

router.delete("/:id", async (req, res) => {
    const group = await Group.findByIdAndDelete(req.params.id);

    if(!group) {
        res.status(404).send("Group with given ID not found.");
        return;
    }

    res.send(group);
});

module.exports = router;