const express = require("express");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const userRights = require("../middleware/userRights");
const { Manufacturer, validate, pickProperties, findByName } = require("../models/manufacturer");


const router = express.Router();

router.get("/", auth, async (req, res) => {
    const manufacturer = await Manufacturer.find();
    res.send(manufacturer);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
    const manufacturer = await Manufacturer.findById(req.params.id);

    if(!manufacturer) {
        res.status(404).send("Manufacturer with given ID not found.");
        return;
    }

    res.send(manufacturer);
});

router.post("/", [auth, userRights.canModifyParts], async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let manufacturer = await findByName(req.body.name);
    if(manufacturer) {
        res.status(400).send("Manufacturer already exists.");
        return;
    }

    manufacturer = new Manufacturer(pickProperties(req.body));

    manufacturer.createdBy = req.user._id;
    manufacturer = await manufacturer.save();

    res.send(manufacturer);
});

router.put("/:id", [auth, userRights.canModifyParts, validateObjectId], async (req, res) => {
    const {error} = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let manufacturer = await Manufacturer.findById(req.params.id);
    if(!manufacturer) {
        res.status(404).send("Manufacturer with given ID not found.");
        return;
    }

    if(manufacturer.name != req.body.name) {
        let existingManufacturer = await findByName(req.body.name);
        if(existingManufacturer) {
            res.status(400).send("Manufacturer already exists.");
            return;
        }
    }

    Object.assign(manufacturer, pickProperties(req.body));

    manufacturer = await manufacturer.save();
    res.send(manufacturer);
});

router.delete("/:id", [auth, userRights.canDeleteParts, validateObjectId], async (req, res) => {
    const manufacturer = await Manufacturer.findByIdAndDelete(req.params.id);

    if(!manufacturer) {
        res.status(404).send("Manufacturer with given ID not found.");
        return;
    }

    res.send(manufacturer);
});

module.exports = router;