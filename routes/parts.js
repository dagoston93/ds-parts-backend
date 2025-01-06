const express = require("express");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { canModifyParts, canDeleteParts } = require("../middleware/userRights");
const { Part, validate, pickProperties } = require("../models/part");
const { exists: manufacturerExists } = require("../models/manufacturer");
const { exists: packageExists } = require("../models/partPackage");
const { exists: categoryExists } = require("../models/category");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    const parts = await Part.find();
    res.send(parts);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
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

    if(req.body.partPackage && !(await packageExists(req.body.partPackage))) {
        res.status(400).send("Package does not exist.");
        return;
    }

    if(req.body.category && !(await categoryExists(req.body.category))) {
        res.status(400).send("Category does not exist.");
        return;
    }

    let part = new Part(pickProperties(req.body));
    part.createdBy = req.user._id; 
    part = await part.save();

    res.send(part);
});

router.put("/:id", [auth, canModifyParts, validateObjectId], async (req, res) => {
    const {error} = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    if(req.body.manufacturer && !(await manufacturerExists(req.body.manufacturer))) {
        res.status(400).send("Manufacturer does not exist.");
        return;
    }

    if(req.body.partPackage && !(await packageExists(req.body.partPackage))) {
        res.status(400).send("Package does not exist.");
        return;
    }

    if(req.body.category && !(await categoryExists(req.body.category))) {
        res.status(400).send("Category does not exist.");
        return;
    }

    const newData = pickProperties(req.body);
    if(!newData.primaryImage) {
        newData.primaryImage = null;
    }

    const part = await Part
        .findByIdAndUpdate(
            req.params.id,
            newData,
            { new: true }
        );

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    res.send(part);
});

router.delete("/:id", [auth, canDeleteParts, validateObjectId], async (req, res) => {
    const part = await Part.findByIdAndDelete(req.params.id);

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    res.send(part);
});

router.post("/:id/increment-count", [auth, canModifyParts, validateObjectId], async(req, res) => {
    const part = await Part.findById(req.params.id);

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    part.count += 1;
    await part.save();

    res.send(part);
});

router.post("/:id/decrement-count", [auth, canModifyParts, validateObjectId], async(req, res) => {
    const part = await Part.findById(req.params.id);

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    if(part.count > 0) {
        part.count -= 1;
        await part.save();
    }

    res.send(part);
});

module.exports = router;