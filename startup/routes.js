const express = require("express");
const helmet = require("helmet");
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require("path");

const parts = require("../routes/parts");
const categories = require("../routes/categories");
const users = require("../routes/users");
const manufacturers = require("../routes/manufacturers");
const packages = require("../routes/partPackages");
const auth = require("../routes/auth");
const upload = require("../routes/upload");
const files = require("../routes/files");
const error = require("../middleware/error");

const { logger } = require("../util/logger");
const { morganMiddleware } = require("../util/logger");

module.exports = function(app) {
    app.use(fileUpload(
        {
            debug: true,
            logger: (msg) => {logger.info(msg)},
            createParentPath: true
        }
    ));

    app.use(cors({
        origin: 'http://localhost:5173',
        methods: "GET,PUT,POST,DELETE",
        exposedHeaders: ["Content-Disposition"]
    }));

    app.use(helmet({
        crossOriginResourcePolicy: false,
    }));
    
    app.use(express.json());
    app.use(morganMiddleware);
    app.use("/api/parts", parts);
    app.use("/api/categories", categories);
    app.use("/api/users", users);
    app.use("/api/manufacturers", manufacturers);
    app.use("/api/packages", packages);
    app.use("/api/auth", auth);
    app.use("/api/upload", upload);
    app.use("/api/files", files);
    app.use("/images", express.static(path.resolve(__dirname, "../uploads/images")));
    app.use("/files", express.static(path.resolve(__dirname, "../uploads/files")));
    app.use(error);
}