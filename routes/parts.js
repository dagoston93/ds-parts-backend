const express = require("express");

const { Part, validate } = require("../models/part");

const router = express.Router();

router.get("/", async (req, res) => {
    const parts = await Part
        .find()
        .populate("manufacturer")
        .populate("package")
        .populate("createdBy", "name email")
        .populate("category", "name");
    res.send(parts);
});

router.get("/:id", async (req, res) => {
    const part = await Part
        .findById(req.params.id)
        .populate("manufacturer")
        .populate("package")
        .populate("createdBy", "name email")
        .populate("category", "name");

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }
        
    res.send(part);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    let part = new Part({
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        package: req.body.package,
        price: req.body.price,
        count: req.body.count,
        createdBy:  req.body.createdBy,
        category: req.body.category
    });

    part.save();

    part = await Part
        .findById(part._id)
        .populate("manufacturer")
        .populate("package")
        .populate("createdBy", "name email")
        .populate("category", "name");

    res.send(part);
});

router.put("/:id", async (req, res) => {
    const {error} = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    const part = await Part
        .findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                manufacturer: req.body.manufacturer,
                package: req.body.package,
                price: req.body.price,
                count: req.body.count,
                createdBy:  req.body.createdBy,
                category: req.body.category
            },
            { new: true })
        .findById(part._id)
        .populate("manufacturer")
        .populate("package")
        .populate("createdBy", "name email")
        .populate("category", "name");

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    res.send(part);
});

router.delete("/:id", async (req, res) => {
    const part = await Part.findByIdAndDelete(req.params.id);

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    res.send(part);
});

module.exports = router;