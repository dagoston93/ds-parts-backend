const auth = require("../../../middleware/auth");

const jwt = require("jsonwebtoken");
const config = require("config");

const tokenStore = require("../../../util/inMemoryTokenStore");

describe("auth middleware", () => {
    it("should populate req object with user and tokenId", async () => {
        const token = jwt.sign({ user: "user1", tokenId: "token1" }, config.get("jwtPrivateKey"));

        tokenStore.isTokenValid = jest.fn().mockReturnValue(true);
        
        const req = { header: jest.fn().mockReturnValue(token) };
        const res = { };
        const next = jest.fn();

        auth(req, res, next);

        expect(req).toHaveProperty("user", "user1");
        expect(req).toHaveProperty("tokenId", "token1");
    });
});