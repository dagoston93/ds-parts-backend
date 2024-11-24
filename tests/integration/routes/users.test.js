let mockUser = { };

jest.mock("../../../middleware/auth", () => jest.fn((req, res, next) => { req.user = mockUser; next();}));
jest.mock("../../../middleware/validateObjectId", () => jest.fn((req, res, next) => next()));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");

const utils = require("../../_test-utils/utils");
const tokenUtils = require("../../_test-utils/tokenUtils");
const tokenStore = require("../../../util/inMemoryTokenStore");

const { User } = require("../../../models/user");

const auth = require("../../../middleware/auth");
const validateObjectId = require("../../../middleware/validateObjectId");
const userRights = require("../../../middleware/userRights");

userRights.canModifyUsers = jest.fn((req, res, next) => next());
userRights.canDeleteUsers = jest.fn((req, res, next) => next());

let server;
const testedRoute = "/api/users";

describe(testedRoute, ()=>{
    beforeEach( async () => {
        jest.clearAllMocks();
        mockUser = { };
        server = require("../../../index");
    });
    
    afterEach(async () => {
        await User.deleteMany({});
        await server.close();
    });

    describe("GET /", () => {
        const exec = async () => {
            return await request(server).get(testedRoute);
        };

        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call canModifyUsers middleware", async () => {
            await exec();

            expect(userRights.canModifyUsers).toHaveBeenCalled();
        });

        it("should return all users", async () => {            
            await User.collection.insertMany([
                {
                    name: "User1",
                    email: "user1@email.com",
                    password: "abcDEF1@",
                    rights: {
                        canModifyParts: false,
                        canDeleteParts: false,
                        canModifyUsers: false,
                        canDeleteUsers: false
                    }
                },
                {
                    name: "User2",
                    email: "user2@email.com",
                    password: "abcDEF1@",
                    rights: {
                        canModifyParts: false,
                        canDeleteParts: false,
                        canModifyUsers: false,
                        canDeleteUsers: false
                    }
                },
            ]);

            const res = await exec();

            expect(res.body.length).toBe(2);
            expect(res.body.some(m => m.name == "User1")).toBeTruthy();
            expect(res.body.some(m => m.name == "User2")).toBeTruthy();
        });

        it("should respond 200", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("GET /:id", () => {
        let id;
        let user;

        beforeEach(async () => {
            user = new User({
                name: "User1",
                email: "user1@email.com",
                password: "abcDEF1@",
                rights: {
                    canModifyParts: false,
                    canDeleteParts: false,
                    canModifyUsers: false,
                    canDeleteUsers: false
                }
            });
            await user.save();
            id = user._id;
        });

        const exec = async () => {
            return await request(server).get(`${testedRoute}/${id}`);
        };


        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call validateObjectId middleware", async () => {
            await exec();

            expect(validateObjectId).toHaveBeenCalled();
        });

        it("should respond 404 if no user with the given ID exists", async () => {
            id = utils.getValidObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should return the user if valid ID passed", async () => {
           const res = await exec();

            expect(res.body).toHaveProperty('name', user.name);
            expect(res.body).toHaveProperty('email', user.email);
            expect(res.body).toHaveProperty('rights', user.rights);
        });

        it("should respond 200 if valid ID passed", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("POST /", ()=> {
        let user;

        const exec = async () => {
            return await request(server)
                .post(testedRoute)
                .send(user);
        };

        beforeEach(async () => {
            let token = await tokenUtils.getToken_User_CanRead();
            const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
            mockUser._id = decoded.user._id;
            
            user = {
                name: "User1",
                email: "user1@email.com",
                password: "abcDEF1@",
                rights: {
                    canModifyParts: false,
                    canDeleteParts: false,
                    canModifyUsers: false,
                    canDeleteUsers: false
                }
            };
        });

        afterEach(async () => {
            await tokenUtils.removeUsers();
        });

        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call canModifyUsers middleware", async () => {
            await exec();

            expect(userRights.canModifyUsers).toHaveBeenCalled();
        });

        it("should respond 400 if user validation fails", async () => {
            user = { };

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if user with the given email already exists", async () => {
            await new User({
                name: "User2",
                email: "user1@email.com",
                password: "abcDEF1@",
                rights: {
                    canModifyParts: true,
                    canDeleteParts: true,
                    canModifyUsers: true,
                    canDeleteUsers: true
                }
            }).save();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the user if request is valid", async () => {
            await exec();

            const userInDb = await User.findOne({ name: "User1" });

            expect(userInDb).not.toBeNull();
        });

        it("should hash the user's password before saving it", async () => {
            await exec();

            const userInDb = await User.findOne({ name: "User1" });

            expect(userInDb.password).not.toBe(user.password);
        });

        it("should save the creator of the user if request is valid", async () => {
            await exec();

            const userInDb = await User.findOne({ name: "User1" });

            expect(userInDb.createdBy._id.toString()).toBe(mockUser._id);
        });

        it("should return the user if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", user.name);
            expect(res.body).toHaveProperty("email", user.email);
            expect(res.body).toHaveProperty("rights", user.rights);
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("PUT /rights/:id", () => {
        let id;
        let user;
        let newRights = { };

        beforeEach(async () => {
            user = await new User({
                name: "User1",
                email: "user1@email.com",
                password: "abcDEF1@",
                rights: {
                    canModifyParts: false,
                    canDeleteParts: true,
                    canModifyUsers: false,
                    canDeleteUsers: true
                },
                validTokens: ["ABC"]
            }).save();

            tokenStore.addToken(user._id, "ABC");

            id = user._id;

            newRights = {
                canModifyParts: true,
                canDeleteParts: false,
                canModifyUsers: true,
                canDeleteUsers: false
            };
        });

        const exec = async () => {
            return await request(server)
                .put(`${testedRoute}/rights/${id}`)
                .send(newRights);
        };

        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call canModifyUsers middleware", async () => {
            await exec();

            expect(userRights.canModifyUsers).toHaveBeenCalled();
        });

        it("should call validateObjectId middleware", async () => {
            await exec();

            expect(validateObjectId).toHaveBeenCalled();
        });

        it("should respond 404 if user with the given ID does not exist", async () => {
            id = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should respond 400 if user validation fails", async () => {
            newRights = { };

            const res = await exec();

            expect(res.status).toBe(400);
        });        

        it("should save the user's rights if request is valid and rights are different", async () => {
            await exec();

            const userInDb = await User.findOne({ email: user.email });

            expect(userInDb.rights.canModifyParts).toBe(true);
            expect(userInDb.rights.canDeleteParts).toBe(false);
            expect(userInDb.rights.canModifyUsers).toBe(true);
            expect(userInDb.rights.canDeleteUsers).toBe(false);
        });

        it("should invalidate the user's tokens if request is valid and rights are different", async () => {
            await exec();

            const userInDb = await User.findOne({ email: user.email });

            expect(userInDb.validTokens.length).toBe(0);
            expect(tokenStore.isTokenValid(user._id, "ABC")).toBe(false);
        });

        it("should NOT invalidate the user's tokens if request is valid and rights are the same", async () => {
            newRights = {
                canModifyParts: false,
                canDeleteParts: true,
                canModifyUsers: false,
                canDeleteUsers: true
            };

            await exec();

            const userInDb = await User.findOne({ email: user.email });

            expect(userInDb.validTokens).toContain("ABC");
            expect(tokenStore.isTokenValid(user._id, "ABC")).toBe(true);
        });

        it("should return the modified user if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", user.name);
            expect(res.body).toHaveProperty("email", user.email);
            expect(res.body).toHaveProperty("rights", newRights);
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("DELETE /:id", () => {
        let id;
        let user;

        beforeEach(async () => {
            user = await new User({
                name: "User1",
                email: "user1@email.com",
                password: "abcDEF1@",
                rights: {
                    canModifyParts: false,
                    canDeleteParts: true,
                    canModifyUsers: false,
                    canDeleteUsers: true
                },
                validTokens: ["ABC"]
            }).save();

            tokenStore.addToken(user._id, "ABC");

            id = user._id;
        });

        const exec = async () => {
            return await request(server)
                .delete(`${testedRoute}/${id}`)
                .send();
        };

        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call canDeleteUsers middleware", async () => {
            await exec();

            expect(userRights.canDeleteUsers).toHaveBeenCalled();
        });

        it("should call validateObjectId middleware", async () => {
            await exec();

            expect(validateObjectId).toHaveBeenCalled();
        });

        it("should respond 404 if user with the given ID does not exist", async () => {
            id = utils.getValidObjectId();

            const res = await exec();
            
            expect(res.status).toBe(404);
        });

        it("should delete user if request is valid", async () => {
            const res = await exec();

            const userInDb = await User.findOne({ name: user.name });

            expect(userInDb).toBeNull();
        });

        it("should return the deleted user if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", user.name);
            expect(res.body).toHaveProperty("email", user.email);
            expect(res.body).toHaveProperty("rights", user.rights);
        });

        it("should invalidate the user's tokens if request is valid", async () => {
            await exec();

            expect(tokenStore.isTokenValid(user._id, "ABC")).toBe(false);
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });
});