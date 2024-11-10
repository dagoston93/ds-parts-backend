const express = require("express");
const lodash = require("lodash");

const { Part, validate } = require("../models/part");

const router = express.Router();

router.get("/", async (req, res) => {
    const parts = await Part.find();
    res.send(parts);
});

router.get("/:id", async (req, res) => {
    const part = await Part.findById(req.params.id);

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

    let part = new Part(
        lodash.pick(req.body, [
            "name",
            "manufacturer",
            "package",
            "price",
            "count",
            "createdBy",
            "category"
    ]));

    part.save();

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
            lodash.pick(req.body, [
                "name",
                "manufacturer",
                "package",
                "price",
                "count",
                "createdBy",
                "category"]),
            { new: true });

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