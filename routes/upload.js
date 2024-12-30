const express = require("express");
const path = require("path");
const auth = require("../middleware/auth");
const userRights = require("../middleware/userRights");
const { Image, validate, pickProperties, imageExists } = require("../models/file");

// Helper function to split the file name into base and extension
function getFileNameParts(name) {
    const dotIndex = name.lastIndexOf(".");
    if (dotIndex === -1) {
        // No extension
        return { base: name, ext: "" };
    }
    return { base: name.substring(0, dotIndex), ext: name.substring(dotIndex) };
}

const router = express.Router();

router.post("/image", [auth, userRights.canModifyParts], async (req, res) => {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }


    let file = req.files['image[]'];
    let fileName = file.name;
    let n = 1;

    while(await imageExists(fileName)) {
        const { base, ext } = getFileNameParts(file.name);
        fileName = `${base}_${n}${ext}`;
        n += 1;
    }

   const uploadPath = path.resolve(__dirname, `../uploads/images/${fileName}`);

    file.mv(uploadPath, (err) => {
        if (err) {
            console.log("ERRRRRRR:", err);
            return res.status(500).send(err);
        }
    });

    let imageProps = pickProperties(req.body);
    imageProps.fileName = fileName;
    let image = new Image(imageProps);

    image.createdBy = req.user._id;
    await image.save();

    res.send(image);
});

module.exports = router;