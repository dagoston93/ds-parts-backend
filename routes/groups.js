const express = require("express");
const lodash = require("lodash");

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

    let group = new Group(lodash.pick(req.body, [
        "name",
        "canModifyParts",
        "canDeleteParts",
        "canModifyUsers",
        "canDeleteUsers"]));

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

    Object.assign(
        group,
        lodash.pick(req.body, [
            "name",
            "canModifyParts",
            "canDeleteParts",
            "canModifyUsers",
            "canDeleteUsers"
    ]));

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