const express = require("express");

const { Manufacturer, validate, findByName } = require("../models/manufacturer");

const router = express.Router();

router.get("/", async (req, res) => {
    const manufacturer = await Manufacturer.find();
    res.send(manufacturer);
});

router.get("/:id", async (req, res) => {
    const manufacturer = await Manufacturer.findById(req.params.id);

    if(!manufacturer) {
        res.status(404).send("Manufacturer with given ID not found.");
        return;
    }

    res.send(manufacturer);
});

router.post("/", async (req, res) => {
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

    manufacturer = new Manufacturer({
        name: req.body.name
    });

    manufacturer = await manufacturer.save();
    res.send(manufacturer);
});

router.put("/:id", async (req, res) => {
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

    manufacturer.name = req.body.name;

    manufacturer = await manufacturer.save();
    res.send(manufacturer);
});

router.delete("/:id", async (req, res) => {
    const manufacturer = await Manufacturer.findByIdAndDelete(req.params.id);

    if(!manufacturer) {
        res.status(404).send("Manufacturer with given ID not found.");
        return;
    }

    res.send(manufacturer);
});

module.exports = router;