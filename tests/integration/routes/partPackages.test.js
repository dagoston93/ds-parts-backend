let mockUser = { };

jest.mock("../../../middleware/auth", () => jest.fn((req, res, next) => { req.user = mockUser; next();}));
jest.mock("../../../middleware/validateObjectId", () => jest.fn((req, res, next) => next()));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");

const utils = require("../../_test-utils/utils");
const tokenUtils = require("../../_test-utils/tokenUtils");

const { PartPackage } = require("../../../models/partPackage");

const auth = require("../../../middleware/auth");
const validateObjectId = require("../../../middleware/validateObjectId");
const userRights = require("../../../middleware/userRights");

userRights.canModifyParts = jest.fn((req, res, next) => next());
userRights.canDeleteParts = jest.fn((req, res, next) => next());

let server;
const testedRoute = "/api/packages";

describe(testedRoute, () => {
    beforeEach( () => {
        jest.clearAllMocks();
        mockUser = { };
        server = require("../../../index");
    });
    
    afterEach(async () => {
        await PartPackage.deleteMany({});
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

        it("should return all packages", async () => {            
            await PartPackage.collection.insertMany([
                { name: "Package1" },
                { name: "Package2" },
            ]);

            const res = await exec();

            expect(res.body.length).toBe(2);
            expect(res.body.some(m => m.name == "Package1")).toBeTruthy();
            expect(res.body.some(m => m.name == "Package2")).toBeTruthy();
        });

        it("should respond 200", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("GET /types", () => {
        const exec = async () => {
            return await request(server).get(`${testedRoute}/types`);
        };

        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should return SMD and THT", async () => {
            const res = await exec();

            expect(res.body.length).toBe(2);
            expect(res.body).toContain("SMD");
            expect(res.body).toContain("THT");
        });

        it("should respond 200", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("GET /:id", () => {
        let id;
        let partPackage;

        beforeEach(async () => {
            partPackage = new PartPackage({ name: "package1", type: "SMD" });
            await partPackage.save();
            id = partPackage._id;
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

        it("should respond 404 if no package with the given ID exists", async () => {
            id = utils.getValidObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should return the package if valid ID passed", async () => {
           const res = await exec();

            expect(res.body).toHaveProperty('name', partPackage.name);
        });

        it("should respond 200 if valid ID passed", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("POST /", ()=> {
        let newPartPackage;

        const exec = async () => {
            return await request(server)
                .post(testedRoute)
                .send(newPartPackage);
        };

        beforeEach(async () => {
            let token = await tokenUtils.getToken_User_CanRead();
            const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
            mockUser._id = decoded.user._id;
            
            newPartPackage = { name: "package1", type: "SMD" };
        });

        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call canModifyParts middleware", async () => {
            await exec();

            expect(userRights.canModifyParts).toHaveBeenCalled();
        });

        it("should respond 400 if package validation fails", async () => {
            newPartPackage = { };

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if package with the given name already exists", async () => {
            await new PartPackage({ name: "package1" }).save();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the package if request is valid", async () => {
            await exec();

            const partPackageInDb = await PartPackage.findOne({ name: "package1" });

            expect(partPackageInDb).not.toBeNull();
        });

        it("should save the creator of the package if request is valid", async () => {
            await exec();

            const partPackageInDb = await PartPackage.findOne({ name: "package1" });

            expect(partPackageInDb.createdBy._id.toString()).toBe(mockUser._id);
        });

        it("should return the package if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "package1");
            expect(res.body).toHaveProperty("type", "SMD");
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("PUT /:id", () => {
        let id;
        let partPackage;
        let newPartPackage = { };

        beforeEach(async () => {
            partPackage = await new PartPackage({ name: "package1", type: "SMD" }).save();
            id = partPackage._id;
            newPartPackage = { name: "package2", type: "THT" };
        });

        const exec = async () => {
            return await request(server)
                .put(`${testedRoute}/${id}`)
                .send(newPartPackage);
        };

        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call canModifyParts middleware", async () => {
            await exec();

            expect(userRights.canModifyParts).toHaveBeenCalled();
        });

        it("should call validateObjectId middleware", async () => {
            await exec();

            expect(validateObjectId).toHaveBeenCalled();
        });

        it("should respond 404 if package with the given ID does not exist", async () => {
            id = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should respond 400 if package validation fails", async () => {
            newPartPackage = { };

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if package with the given name already exists", async () => {
            await new PartPackage({ name: "package2" }).save();

            const res = await exec();

            expect(res.status).toBe(400);
        });
        

        it("should save the package if request is valid", async () => {
            await exec();

            const partPackageInDb = await PartPackage.findOne({ name: newPartPackage.name });

            expect(partPackageInDb).not.toBeNull();
        });

        it("should save the package if request is valid - name identical", async () => {
            newPartPackage.name = "package1";

            await exec();

            const partPackageInDb = await PartPackage.findOne({ name: newPartPackage.name });

            expect(partPackageInDb).not.toBeNull();
        });

        it("should return the modified package if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", newPartPackage.name);
            expect(res.body).toHaveProperty("type", newPartPackage.type);
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("DELETE /:id", () => {
        let id;
        let partPackage;

        beforeEach(async () => {
            partPackage = await new PartPackage({ name: "package1", type: "SMD" }).save();
            id = partPackage._id;
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

        it("should call canDeleteParts middleware", async () => {
            await exec();

            expect(userRights.canDeleteParts).toHaveBeenCalled();
        });

        it("should call validateObjectId middleware", async () => {
            await exec();

            expect(validateObjectId).toHaveBeenCalled();
        });

        it("should respond 404 if package with the given ID does not exist", async () => {
            id = utils.getValidObjectId();

            const res = await exec();
            
            expect(res.status).toBe(404);
        });

        it("should delete package if request is valid", async () => {
            const res = await exec();

            const partPackageInDb = await PartPackage.findOne({ name: partPackage.name });

            expect(partPackageInDb).toBeNull();
        });

        it("should return the deleted package if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", partPackage.name);
            expect(res.body).toHaveProperty("type", partPackage.type);
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });
});