const express = require("express");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const userRights = require("../middleware/userRights");
const { Container, validate, pickProperties, findByName } = require("../models/container");


const router = express.Router();

router.get("/", auth, async (req, res) => {
    const containers = await Container.find();
    res.send(containers);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
    const container = await Container.findById(req.params.id);

    if(!container) {
        res.status(404).send("Container with given ID not found.");
        return;
    }

    res.send(container);
});

router.post("/", [auth, userRights.canModifyParts], async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let container = await findByName(req.body.name);
    if(container) {
        res.status(400).send("Container already exists.");
        return;
    }

    container = new Container(pickProperties(req.body));

    container.createdBy = req.user._id;
    container = await container.save();

    res.send(container);
});

router.put("/:id", [auth, userRights.canModifyParts, validateObjectId], async (req, res) => {
    const {error} = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let container = await Container.findById(req.params.id);
    if(!container) {
        res.status(404).send("Container with given ID not found.");
        return;
    }

    if(container.name != req.body.name) {
        let existingContainer = await findByName(req.body.name);
        if(existingContainer) {
            res.status(400).send("Container already exists.");
            return;
        }
    }

    Object.assign(container, pickProperties(req.body));

    container = await container.save();
    res.send(container);
});

router.delete("/:id", [auth, userRights.canDeleteParts, validateObjectId], async (req, res) => {
    const container = await Container.findByIdAndDelete(req.params.id);

    if(!container) {
        res.status(404).send("Container with given ID not found.");
        return;
    }

    res.send(container);
});

module.exports = router;