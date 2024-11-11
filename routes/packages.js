const express = require("express");
const auth = require("../middleware/auth");
const { canModifyParts, canDeleteParts } = require("../middleware/userRights");
const { Package, validate, packageTypes, findByName, pickProperties } = require("../models/package");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    const package = await Package.find();
    res.send(package);
});

router.get("/types", auth, (req, res) => {
    res.send(packageTypes);
});

router.get("/:id", auth, async (req, res) => {
    const package = await Package.findById(req.params.id);

    if(!package) {
        res.status(404).send("Package with given ID not found.");
        return;
    }

    res.send(package);
});

router.post("/", [auth, canModifyParts], async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }
    
    let package = await findByName(req.body.name);
    if(package) {
        res.status(400).send("Package already exsits.");
        return;
    }

    package = new Package(pickProperties(req.body));
    package.createdBy = req.user._id;
    package = await package.save();

    res.send(package);
});

router.put("/:id", [auth, canModifyParts], async (req, res) => {
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

    if(package.name != req.body.name) {
        let existingPackage = await findByName(req.body.name);
        if(existingPackage) {
            res.status(400).send("Package already exsits.");
            return;
        }       
    }

    Object.assign(package, pickProperties(req.body));

    package = await package.save();
    res.send(package);
});

router.delete("/:id", [auth, canDeleteParts], async (req, res) => {
    const package = await Package.findByIdAndDelete(req.params.id);

    if(!package) {
        res.status(404).send("Package with given ID not found.");
        return;
    }

    res.send(package);
});

module.exports = router;