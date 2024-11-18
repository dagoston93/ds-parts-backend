const { addToken, invalidateToken, invalidateAllTokens, removeUser, isTokenValid } = require("../../../util/inMemoryTokenStore");
const { tokenStore } = require("../../../startup/db");

describe("unit - inMemoryTokenStore", () => {
    afterEach(() => {
        for(const key in tokenStore) {
            delete tokenStore[key];
        }
    });

    describe("addToken", ()=>{
        it("should add the user if not in yet in the store", () => {
            addToken("userId1", "token1");

            expect(tokenStore).toMatchObject({ "userId1": ["token1"]});
        });

        it("should add the token ID if user is already in store", () => {
            tokenStore["userId1"] = ["token1"];

            addToken("userId1", "token2");

            expect(tokenStore).toMatchObject({ "userId1": ["token1", "token2"]});
        });
    });

    describe("invalidateToken", ()=>{
        it("should not change tokenStore if user not in store", () => {
            tokenStore["userId1"] = ["token1"];

            invalidateToken("userId2", "tokenId2");

            expect(tokenStore).toMatchObject({ "userId1": ["token1"]});
        });

        it("should not change tokenStore if user has no token with the given Id", () => {
            tokenStore["userId1"] = ["token1"];

            invalidateToken("userId1", "token2");

            expect(tokenStore).toMatchObject({ "userId1": ["token1"]});
        });

        it("should remove token from store if request is valid", () => {
            tokenStore["userId1"] = ["token1", "token2"];

            invalidateToken("userId1", "token2");

            expect(tokenStore).toMatchObject({ "userId1": ["token1"]});
        });
    });

    describe("invalidateAllTokens", () => {
        it("should not change tokenStore if user not in store", () => {
            tokenStore["userId1"] = ["token1", "token2"];

            invalidateAllTokens("userId2");

            expect(tokenStore).toMatchObject({ "userId1": ["token1", "token2"]});
        });

        it("should invalidate all tokens of user, if request is valid", () => {
            tokenStore["userId1"] = ["token1", "token2"];

            invalidateAllTokens("userId1");

            expect(tokenStore).toMatchObject({ "userId1": []});
        });

        describe("removeUser", () => {
            it("should not change tokenStore if user not in store", () => {
                tokenStore["userId1"] = ["token1", "token2"];
    
                removeUser("userId2");
    
                expect(tokenStore).toMatchObject({ "userId1": ["token1", "token2"]});
            });
    
            it("should invalidate all tokens of user, if request is valid", () => {
                tokenStore["userId1"] = ["token1", "token2"];
    
                removeUser("userId1");
    
                expect(tokenStore).toMatchObject({ });
            });
        });

        describe("isTokenValid", () => {
            it("should return false if user not in store", () => {
                tokenStore["userId1"] = ["token1", "token2"];
    
                const isValid = isTokenValid("userId2", "token1");
    
                expect(isValid).toBeFalsy();
            });
    
            it("should return false if user has no valid token with the given ID in store", () => {
                tokenStore["userId1"] = ["token1", "token2"];
    
                const isValid = isTokenValid("userId1", "token3");
    
                expect(isValid).toBeFalsy();
            });

            it("should return true if user has valid token with the given ID", () => {
                tokenStore["userId1"] = ["token1", "token2"];
    
                const isValid = isTokenValid("userId1", "token1");
    
                expect(isValid).toBeTruthy();
            });
        });
    });
});