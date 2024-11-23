const express = require("express");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const userRights = require("../middleware/userRights");
const { Category, validate, pickProperties } = require("../models/category");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    const categories = await Category.find();
    res.send(categories);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(404).send("Category with given ID not found.");
        return;
    }

    res.send(category);
});

router.get("/sub/:id", [auth, validateObjectId], async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(404).send("Category with given ID not found.");
        return;
    }

    const categories = await Category.find({ parent: req.params.id });

    res.send(categories);
});

router.post("/", [auth, userRights.canModifyParts], async (req, res) => {
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

    let category = new Category(pickProperties(req.body));
    category.createdBy = req.user._id;
    await category.save();

    res.send(category);
});

router.put("/:id", [auth, userRights.canModifyParts, validateObjectId], async (req, res) => {
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

    const category = await Category
        .findByIdAndUpdate(
            req.params.id,
            pickProperties(req.body),
            { new: true }
        );

    if(!category) {
        res.status(404).send("Category with given ID not found.");
        return;
    }

    res.send(category);
});

router.delete("/:id", [auth, userRights.canDeleteParts, validateObjectId], async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if(!category) {
        res.status(404).send("Category with given ID not found.");
        return;
    }

    res.send(category);
});

module.exports = router;