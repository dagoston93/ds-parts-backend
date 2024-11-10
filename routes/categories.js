const express = require("express");
const lodash = require("lodash");

const { Category, validate } = require("../models/category");
const router = express.Router();

router.get("/", async (req, res) => {
    const categories = await Category.find();
    res.send(categories);
});

router.get("/:id", async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(404).send("Category with given ID not found.");
        return;
    }

    res.send(category);
});

router.get("/sub/:id", async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(404).send("Category with given ID not found.");
        return;
    }

    const categories = await Category.find({ parent: req.params.id });

    res.send(categories);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    if(req.body.parent) {
        const parentCategory = await Category.findById(req.body.parent);

        if(!parentCategory) {
            res.status(400).send("If parent is provided, it has to be a valid category ID.");
            return;
        }
    }

    let category = new Category(lodash.pick(req.body, ["name", "createdBy", "parent"]));
    category.save();

    res.send(category);
});

router.put("/:id", async (req, res) => {
    const {error} = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    if(req.body.parent) {
        const category = await Category.findById(req.body.parent);

        if(!category) {
            res.status(400).send("If parent is provided, it has to be a valid category ID.");
            return;
        }
    }

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        lodash.pick(req.body, ["name", "createdBy", "parent"]),
        { new: true });

    if(!category) {
        res.status(404).send("Category with given ID not found.");
        return;
    }

    res.send(category);
});

router.delete("/:id", async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if(!category) {
        res.status(404).send("Category with given ID not found.");
        return;
    }

    res.send(category);
});

module.exports = router;