let mockUser = { };

jest.mock("../../../middleware/auth", () => jest.fn((req, res, next) => { req.user = mockUser; next();}));

const request = require("supertest");
const bcrypt = require("bcrypt");

const { User } = require("../../../models/user");

const auth = require("../../../middleware/auth");
const userRights = require("../../../middleware/userRights");


userRights.canModifyParts = jest.fn((req, res, next) => next());
userRights.canDeleteParts = jest.fn((req, res, next) => next());

let server;
const testedRoute = "/api/auth";

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

    describe("POST /", ()=> {
        let userInRequest;
        let userInDb;

        const exec = () => {
            return request(server)
                .post(testedRoute)
                .send(userInRequest);
        };

        beforeEach(async () => {
            userInRequest = { 
                email: "email@email.com", 
                password: "password"
            };

            let salt = await bcrypt.genSalt(10);
            let password = await bcrypt.hash(userInRequest.password, salt);

            userInDb = new User({
                name: "user1",
                email: userInRequest.email,
                password: password,
                rights: {
                    canModifyParts: false,
                    canDeleteParts: false,
                    canModifyUsers: false,
                    canDeleteUsers: false
                }
            });
            await userInDb.save();
        });

        it("should respond 400 if no email given", async () => {
            delete userInRequest.email;
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if email is not a string", async () => {
            userInRequest.email = 123;
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if no password given", async () => {
            delete userInRequest.password;
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if password is not a string", async () => {
            userInRequest.password = 123;
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if user with given email does not exist", async () => {
            userInRequest.email = "email2@email.com";
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if password is invalid", async () => {
            userInRequest.password = "aaa";
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should should respond 200 if request is valid", async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
        });
    });
});