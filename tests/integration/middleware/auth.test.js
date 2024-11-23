const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");
const tokenUtils = require("../../_test-utils/tokenUtils");

const { User } = require("../../../models/user");
const tokenStore = require("../../../util/inMemoryTokenStore");

let server;

describe("auth middleware", () => {
    let token;

    beforeEach( async () => {
        server = require("../../../index");
        token = await tokenUtils.getToken_User_CanRead();
    });

    afterEach(async () => {
        await tokenUtils.removeUsers();
        await server.close();
    });

    const exec = () => {
        return request(server)
            .get("/api/manufacturers")
            .set("x-auth-token", token)
            .send({ name: "Manufacturer1" });
    };

    it("should respond 401 if no token is provided", async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it("should respond 400 if invalid token is provided", async () => {
        token = 'invalidtoken';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should respond 400 if token is invalidated", async () => {
        const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
        
        const user = await User.findById(decoded.user._id);

        await user.invalidateToken(decoded.tokenId);
        tokenStore.invalidateToken(decoded.user._id, decoded.tokenId);

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should respond 200 if valid token is provided", async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });
});
