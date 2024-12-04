let mockUser = { };

jest.mock("../../../middleware/auth", () => jest.fn((req, res, next) => { req.user = mockUser; next();}));
jest.mock("../../../middleware/validateObjectId", () => jest.fn((req, res, next) => next()));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");

const utils = require("../../_test-utils/utils");
const tokenUtils = require("../../_test-utils/tokenUtils");

const { Part } = require("../../../models/part");
const { Manufacturer } = require("../../../models/manufacturer");
const { PartPackage } = require("../../../models/partPackage");
const { Category } = require("../../../models/category");

const auth = require("../../../middleware/auth");
const validateObjectId = require("../../../middleware/validateObjectId");
const userRights = require("../../../middleware/userRights");

userRights.canModifyParts = jest.fn((req, res, next) => next());
userRights.canDeleteParts = jest.fn((req, res, next) => next());

let server;
const testedRoute = "/api/parts";

describe(testedRoute, ()=>{
    beforeEach( async () => {
        jest.clearAllMocks();
        mockUser = { };
        server = require("../../../index");
    });
    
    afterEach(async () => {
        await Part.deleteMany({});
        await Manufacturer.deleteMany({});
        await PartPackage.deleteMany({});
        await Category.deleteMany({});

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

        it("should return all parts", async () => {            
            await Part.collection.insertMany([
                { name: "Part1", price: 1, count: 2 },
                { name: "Part2", price: 2, count: 3 },
            ]);

            const res = await exec();

            expect(res.body.length).toBe(2);
            expect(res.body.some(m => m.name == "Part1")).toBeTruthy();
            expect(res.body.some(m => m.name == "Part2")).toBeTruthy();
        });

        it("should respond 200", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("GET /:id", () => {
        let id;
        let part;

        beforeEach(async () => {
            part = new Part({ name: "Part1", price: 1, count: 2 });
            await part.save();
            id = part._id;
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

        it("should respond 404 if no part with the given ID exists", async () => {
            id = utils.getValidObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should return the part if valid ID passed", async () => {
           const res = await exec();

            expect(res.body).toHaveProperty('name', part.name);
        });

        it("should respond 200 if valid ID passed", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("POST /", ()=> {
        let part;

        const exec = async () => {
            return await request(server)
                .post(testedRoute)
                .send(part);
        };

        beforeEach(async () => {
            let token = await tokenUtils.getToken_User_CanRead();
            const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
            mockUser._id = decoded.user._id;
            
            part = { name: "Part1", price: 1, count: 2 };
        });

        afterEach(async () => {
            await tokenUtils.removeUsers();
        });

        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call canModifyParts middleware", async () => {
            await exec();

            expect(userRights.canModifyParts).toHaveBeenCalled();
        });

        it("should respond 400 if part validation fails", async () => {
            part = { };

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if given manufacturer does not exist", async () => {
            part.manufacturer = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if given package does not exist", async () => {
            part.partPackage = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if given category does not exist", async () => {
            part.category = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the part if request is valid - no objectId type param given", async () => {
            await exec();

            const partInDb = await Part.findOne({ name: "Part1" });

            expect(partInDb).not.toBeNull();
        });

        it("should save the creator of the part if request is valid", async () => {
            await exec();

            const partInDb = await Part.findOne({ name: "Part1" });

            expect(partInDb.createdBy._id.toString()).toBe(mockUser._id);
        });

        it("should return the part if request is valid - no objectId type param given", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "Part1");
            expect(res.body).toHaveProperty("price", 1);
            expect(res.body).toHaveProperty("count", 2);
        });

        it("should respond 200 if request is valid - no objectId type param given", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it("should save the part if request is valid - valid objectId type params given", async () => {
            const manufacturer = await new Manufacturer({ name: "Manufacturer1" }).save();
            const partPackage = await new PartPackage({ name: "package1", type: "SMD" }).save();
            const category = await new Category({ name: "Category1" }).save();

            part.manufacturer = manufacturer._id;
            part.partPackage = partPackage._id;
            part.category = category._id;

            await exec();

            const partInDb = await Part.findOne({ name: "Part1" });

            expect(partInDb).not.toBeNull();
            expect(partInDb.manufacturer._id.toString()).toBe(manufacturer._id.toString());
            expect(partInDb.partPackage._id.toString()).toBe(partPackage._id.toString());
            expect(partInDb.category._id.toString()).toBe(category._id.toString());
        });

        it("should return the part if request is valid - valid objectId type params given", async () => {
            const manufacturer = await new Manufacturer({ name: "Manufacturer1" }).save();
            const partPackage = await new PartPackage({ name: "package1", type: "SMD" }).save();
            const category = await new Category({ name: "Category1" }).save();

            part.manufacturer = manufacturer._id;
            part.partPackage = partPackage._id;
            part.category = category._id;

            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "Part1");
            expect(res.body).toHaveProperty("price", 1);
            expect(res.body).toHaveProperty("count", 2);
            
            expect(res.body).toHaveProperty("manufacturer._id", manufacturer._id.toString());
            expect(res.body).toHaveProperty("partPackage._id", partPackage._id.toString());
            expect(res.body).toHaveProperty("category._id", category._id.toString());
        });

        it("should respond 200 if request is valid - valid objectId type params given", async () => {
            const manufacturer = await new Manufacturer({ name: "Manufacturer1" }).save();
            const partPackage = await new PartPackage({ name: "package1", type: "SMD" }).save();
            const category = await new Category({ name: "Category1" }).save();

            part.manufacturer = manufacturer._id;
            part.partPackage = partPackage._id;
            part.category = category._id;
            
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("PUT /:id", () => {
        let id;
        let part;
        let newPart = { };

        beforeEach(async () => {
            part = await new Part({ name: "Part1", price: 1, count: 2 }).save();
            id = part._id;
            newPart = { name: "Part2", price: 3, count: 4 };
        });

        const exec = async () => {
            return await request(server)
                .put(`${testedRoute}/${id}`)
                .send(newPart);
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

        it("should respond 404 if part with the given ID does not exist", async () => {
            id = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should respond 400 if part validation fails", async () => {
            newPart = { };

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if given manufacturer does not exist", async () => {
            newPart.manufacturer = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if given package does not exist", async () => {
            newPart.partPackage = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if given category does not exist", async () => {
            newPart.category = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the part if request is valid", async () => {
            await exec();

            const partInDb = await Part.findOne({ name: newPart.name });

            expect(partInDb).not.toBeNull();
        });

        it("should return the modified part if request is valid - no objectId type param given", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", newPart.name);
            expect(res.body).toHaveProperty("price", newPart.price);
            expect(res.body).toHaveProperty("count", newPart.count);
        });

        it("should respond 200 if request is valid - no objectId type param given", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it("should return the modified part if request is valid - valid objectId type params given", async () => {
            const manufacturer = await new Manufacturer({ name: "Manufacturer1" }).save();
            const partPackage = await new PartPackage({ name: "package1", type: "SMD" }).save();
            const category = await new Category({ name: "Category1" }).save();

            newPart.manufacturer = manufacturer._id;
            newPart.partPackage = partPackage._id;
            newPart.category = category._id;

            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", newPart.name);
            expect(res.body).toHaveProperty("price", newPart.price);
            expect(res.body).toHaveProperty("count", newPart.count);

            expect(res.body.manufacturer._id.toString()).toBe(manufacturer._id.toString());
            expect(res.body.partPackage._id.toString()).toBe(partPackage._id.toString());
            expect(res.body.category._id.toString()).toBe(category._id.toString());
        });

        it("should respond 200 if request is valid - valid objectId type params given", async () => {
            const manufacturer = await new Manufacturer({ name: "Manufacturer1" }).save();
            const partPackage = await new PartPackage({ name: "package1", type: "SMD" }).save();
            const category = await new Category({ name: "Category1" }).save();

            newPart.manufacturer = manufacturer._id;
            newPart.partPackage = partPackage._id;
            newPart.category = category._id;

            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("DELETE /:id", () => {
        let id;
        let part;

        beforeEach(async () => {
            part = await new Part({ name: "Part1", price: 1, count: 2 }).save();
            id = part._id;
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

        it("should respond 404 if part with the given ID does not exist", async () => {
            id = utils.getValidObjectId();

            const res = await exec();
            
            expect(res.status).toBe(404);
        });

        it("should delete part if request is valid", async () => {
            await exec();

            const partInDb = await Part.findOne({ name: part.name });

            expect(partInDb).toBeNull();
        });

        it("should return the deleted part if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", part.name);
            expect(res.body).toHaveProperty("price", part.price);
            expect(res.body).toHaveProperty("count", part.count);
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });
});