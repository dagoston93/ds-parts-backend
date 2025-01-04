const express = require("express");
const auth = require("../middleware/auth");
const { File, Image } = require("../models/file");

const router = express.Router();

router.get("/images", auth, async (req, res) => {
    const images = await Image.find();
    res.send(images);
});

router.get("/files", auth, async (req, res) => {
    const files = await File.find();
    res.send(files);
});

module.exports = router;