const express = require("express");
const auth = require("../middleware/auth");
const { canModifyParts, canDeleteParts } = require("../middleware/userRights");
const { PartPackage, validate, packageTypes, findByName, pickProperties } = require("../models/partPackage");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    const partPackage = await PartPackage.find();
    res.send(partPackage);
});

router.get("/types", auth, (req, res) => {
    res.send(packageTypes);
});

router.get("/:id", auth, async (req, res) => {
    const partPackage = await PartPackage.findById(req.params.id);

    if(!partPackage) {
        res.status(404).send("Package with given ID not found.");
        return;
    }

    res.send(partPackage);
});

router.post("/", [auth, canModifyParts], async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }
    
    let partPackage = await findByName(req.body.name);
    if(partPackage) {
        res.status(400).send("Package already exsits.");
        return;
    }

    partPackage = new PartPackage(pickProperties(req.body));
    partPackage.createdBy = req.user._id;
    partPackage = await partPackage.save();

    res.send(partPackage);
});

router.put("/:id", [auth, canModifyParts], async (req, res) => {
    const {error} = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let partPackage = await PartPackage.findById(req.params.id);

    if(!partPackage) {
        res.status(404).send("Package with given ID not found.");
        return;
    }

    if(partPackage.name != req.body.name) {
        let existingPackage = await findByName(req.body.name);
        if(existingPackage) {
            res.status(400).send("Package already exsits.");
            return;
        }       
    }

    Object.assign(partPackage, pickProperties(req.body));

    partPackage = await partPackage.save();
    res.send(partPackage);
});

router.delete("/:id", [auth, canDeleteParts], async (req, res) => {
    const partPackage = await PartPackage.findByIdAndDelete(req.params.id);

    if(!partPackage) {
        res.status(404).send("Package with given ID not found.");
        return;
    }

    res.send(partPackage);
});

module.exports = router;