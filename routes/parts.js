const express = require("express");
const auth = require("../middleware/auth");
const { canModifyParts, canDeleteParts } = require("../middleware/userRights");
const { Part, validate, pickProperties } = require("../models/part");
const { exists: manufacturerExists } = require("../models/manufacturer");
const { exists: packageExists } = require("../models/package");
const { exists: categoryExists } = require("../models/category");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    const parts = await Part.find();
    res.send(parts);
});

router.get("/:id", auth, async (req, res) => {
    const part = await Part.findById(req.params.id);

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }
        
    res.send(part);
});

router.post("/", [auth, canModifyParts], async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    if(req.body.manufacturer && !(await manufacturerExists(req.body.manufacturer))) {
        res.status(400).send("Manufacturer does not exist.");
        return;
    }

    if(req.body.package && !(await packageExists(req.body.package))) {
        res.status(400).send("Package does not exist.");
        return;
    }

    if(req.body.category && !(await categoryExists(req.body.category))) {
        res.status(400).send("Category does not exist.");
        return;
    }

    let part = new Part(pickProperties(req.body));
    part.createdBy = req.user._id; 
    part.save();

    res.send(part);
});

router.put("/:id", [auth, canModifyParts], async (req, res) => {
    const {error} = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    if(req.body.manufacturer && !(await manufacturerExists(req.body.manufacturer))) {
        res.status(400).send("Manufacturer does not exist.");
        return;
    }

    if(req.body.package && !(await packageExists(req.body.package))) {
        res.status(400).send("Package does not exist.");
        return;
    }

    if(req.body.category && !(await categoryExists(req.body.category))) {
        res.status(400).send("Category does not exist.");
        return;
    }

    const part = await Part
        .findByIdAndUpdate(
            req.params.id,
            pickProperties(req.body),
            { new: true }
        );

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    res.send(part);
});

router.delete("/:id", [auth, canDeleteParts], async (req, res) => {
    const part = await Part.findByIdAndDelete(req.params.id);

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    res.send(part);
});

module.exports = router;