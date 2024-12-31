const express = require("express");
const path = require("path");
const auth = require("../middleware/auth");
const userRights = require("../middleware/userRights");
const { Image, File, validate, pickProperties, imageExists, fileExists } = require("../models/file");

// Helper function to split the file name into base and extension
function getFileNameParts(name) {
    const dotIndex = name.lastIndexOf(".");
    if (dotIndex === -1) {
        // No extension
        return { base: name, ext: "" };
    }
    return { base: name.substring(0, dotIndex), ext: name.substring(dotIndex) };
}

async function uploadFile(req, res, exists, targetDir, dbEntity) {
    const { error } = validate(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }


    let file = req.files['file[]'];
    let fileName = file.name;
    let n = 1;

    while(await exists(fileName)) {
        const { base, ext } = getFileNameParts(file.name);
        fileName = `${base}_${n}${ext}`;
        n += 1;
    }

   const uploadPath = path.resolve(__dirname, `../uploads/${targetDir}/${fileName}`);

    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
    });

    let fileProps = pickProperties(req.body);
    fileProps.fileName = fileName;
    let fileInDb = new dbEntity(fileProps);

    fileInDb.createdBy = req.user._id;
    await fileInDb.save();

    return res.send(fileInDb);
}

const router = express.Router();

router.post("/image", [auth, userRights.canModifyParts], async (req, res) => {
    return uploadFile(req, res, imageExists, "images", Image);
});

router.post("/file", [auth, userRights.canModifyParts], async (req, res) => {
    return uploadFile(req, res, fileExists, "files", File);
});

module.exports = router;