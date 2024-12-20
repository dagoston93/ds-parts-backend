const jwt = require("jsonwebtoken");
const config = require("config");
const tokenStore = require("../util/inMemoryTokenStore");

function auth(req, res, next) {
    const token = req.header("x-auth-token");
    if(!token) {
        res.status(401).send("Access denied. No token provided.");
        return;
    }

    try {
        const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
        req.user = decoded.user;
        req.tokenId = decoded.tokenId;

        if(!tokenStore.isTokenValid(decoded.user._id, decoded.tokenId)) {
            throw new Error();
        }

        next();
    }
    catch(ex) {
        res.status(401).send("Invalid access token.");
        return;
    }
}

module.exports = auth;