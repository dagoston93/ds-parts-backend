const express = require("express");

const { Package, validate, packageTypes } = require("../models/package");

const router = express.Router();

router.get("/", async (req, res) => {
    const package = await Package.find();
    res.send(package);
});

router.get("/types", (req, res) => {
    res.send(packageTypes);
});

router.get("/:id", async (req, res) => {
    const package = await Package.findById(req.params.id);

    if(!package) {
        res.status(404).send("Package with given ID not found.");
        return;
    }

    res.send(package);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let package = new Package({
        name: req.body.name,
        type: req.body.type
    });

    package = await package.save();
    res.send(package);
});

router.put("/:id", async (req, res) => {
    const {error} = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let package = await Package.findById(req.params.id);

    if(!package) {
        res.status(404).send("Package with given ID not found.");
        return;
    }

    package.name = req.body.name;
    package.type = req.body.type;

    package = await package.save();
    res.send(package);
});

router.delete("/:id", async (req, res) => {
    const package = await Package.findByIdAndDelete(req.params.id);

    if(!package) {
        res.status(404).send("Package with given ID not found.");
        return;
    }

    res.send(package);
});

module.exports = router;