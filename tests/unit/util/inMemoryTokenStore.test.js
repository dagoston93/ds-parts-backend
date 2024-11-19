const { addToken, invalidateToken, invalidateAllTokens, removeUser, isTokenValid } = require("../../../util/inMemoryTokenStore");

describe("inMemoryTokenStore", () => {
    afterEach(() => {
        removeUser("userId1");
        removeUser("userId2");
    });

    describe("addToken", ()=>{
        it("should add tokens correctly", () => {
            addToken("userId1", "token1");
            addToken("userId2", "token2");

            expect(isTokenValid("userId1", "token1")).toBe(true);
            expect(isTokenValid("userId2", "token2")).toBe(true);
        });
    });

    describe("invalidateToken", ()=>{
        it("should invalidate a single token", () => {
            addToken("userId1", "token1");
            addToken("userId1", "token2");

            invalidateToken("userId1", "token1");

            expect(isTokenValid("userId1", "token1")).toBe(false);
            expect(isTokenValid("userId1", "token2")).toBe(true);
        });
    });

    describe("invalidateAllTokens", () => {
        it("should invalidate all tokens of a user", () => {
            addToken("userId1", "token1");
            addToken("userId1", "token2");

            invalidateAllTokens("userId1");

            expect(isTokenValid("userId1", "token1")).toBe(false);
            expect(isTokenValid("userId1", "token2")).toBe(false);
        });
    });

    describe("removeUser", () => {
        it("should remove all tokens of a user from the store", () => {
            addToken("userId1", "token1");
            addToken("userId1", "token2");

            removeUser("userId1");

            expect(isTokenValid("userId1", "token1")).toBe(false);
            expect(isTokenValid("userId1", "token2")).toBe(false);
        });

    });

    describe("isTokenValid", () => {
        it("should return false if user is not in the store", () => {
            addToken("userId1", "token1");

            expect(isTokenValid("userId2", "token2")).toBe(false);
        });

        it("should return false if user has no token with the given ID", () => {
            addToken("userId1", "token1");
            addToken("userId1", "token2");

            expect(isTokenValid("userId1", "token3")).toBe(false);
        });

        it("should return true if user has a token with given ID", () => {
            addToken("userId1", "token1");
            addToken("userId2", "token2");

            expect(isTokenValid("userId1", "token1")).toBe(true);
            expect(isTokenValid("userId2", "token2")).toBe(true);
        });
    });
});
