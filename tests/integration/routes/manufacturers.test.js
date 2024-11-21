let mockUser = { };

jest.mock("../../../middleware/auth", () => jest.fn((req, res, next) => { req.user = mockUser; next();}));
jest.mock("../../../middleware/validateObjectId", () => jest.fn((req, res, next) => next()));

const request = require("supertest");
const utils = require("../../_test-utils/utils");

const { Manufacturer } = require("../../../models/manufacturer");

const auth = require("../../../middleware/auth");
const validateObjectId = require("../../../middleware/validateObjectId");
const userRights = require("../../../middleware/userRights");

userRights.canModifyParts = jest.fn((req, res, next) => next());
userRights.canDeleteParts = jest.fn((req, res, next) => next());

let server;
const testedRoute = "/api/manufacturers";

describe(testedRoute, () => {
    beforeEach( () => {
        jest.clearAllMocks();
        mockUser = { };
        server = require("../../../index");
    });
    
    afterEach(async () => {
        await Manufacturer.deleteMany({});
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

        it("should return all manufacturers", async () => {            
            await Manufacturer.collection.insertMany([
                { name: "Manufacturer1" },
                { name: "Manufacturer2" },
            ]);

            const res = await exec();

            expect(res.body.length).toBe(2);
            expect(res.body.some(m => m.name == "Manufacturer1")).toBeTruthy();
            expect(res.body.some(m => m.name == "Manufacturer2")).toBeTruthy();
        });

        it("should respond 200", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("GET /:id", () => {
        let id;
        let manufacturer;

        beforeEach(async () => {
            manufacturer = new Manufacturer({ name: "Manufacturer1" });
            await manufacturer.save();
            id = manufacturer._id;
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

        it("should respond 404 if no manufacturer with the given ID exists", async () => {
            id = utils.getValidObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should return the manufacturer if valid ID passed", async () => {
           const res = await exec();

            expect(res.body).toHaveProperty('name', manufacturer.name);
        });

        it("should respond 200 if valid ID passed", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("POST /", ()=> {
        let manufacturer;

        const exec = async () => {
            return await request(server)
                .post(testedRoute)
                .send(manufacturer);
        };

        beforeEach(() => {
            mockUser._id = utils.getValidObjectId();
            manufacturer = { name: "Manufacturer1" };
        });

        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call canModifyParts middleware", async () => {
            await exec();

            expect(userRights.canModifyParts).toHaveBeenCalled();
        });

        it("should respond 400 if manufacturer validation fails", async () => {
            manufacturer = { };

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if manufacturer with the given name already exists", async () => {
            await new Manufacturer({ name: "Manufacturer1" }).save();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the manufacturer if request is valid", async () => {
            await exec();

            const manufacturerInDb = Manufacturer.find({ name: "Manufacturer1" });

            expect(manufacturerInDb).not.toBeNull();
        });

        it("should return the manufacturer if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "Manufacturer1");
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("PUT /:id", () => {
        let id;
        let manufacturer;
        let newManufacturer = { };

        beforeEach(async () => {
            manufacturer = await new Manufacturer({ name: "Manufacturer1" }).save();
            id = manufacturer._id;
            newManufacturer = { name: "Manufacturer2" };
        });

        const exec = async () => {
            return await request(server)
                .put(`${testedRoute}/${id}`)
                .send(newManufacturer);
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

        it("should respond 404 if manufacturer with the given ID does not exist", async () => {
            id = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should respond 400 if manufacturer validation fails", async () => {
            newManufacturer = { };

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if manufacturer with the given name already exists", async () => {
            await new Manufacturer({ name: "Manufacturer2" }).save();

            const res = await exec();

            expect(res.status).toBe(400);
        });
        

        it("should save the manufacturer if request is valid", async () => {
            await exec();

            const manufacturerInDb = Manufacturer.find({ name: newManufacturer.name });

            expect(manufacturerInDb).not.toBeNull();
        });

        it("should return the modified manufacturer if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", newManufacturer.name);
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("DELETE /:id", () => {
        let id;
        let manufacturer;

        beforeEach(async () => {
            manufacturer = await new Manufacturer({ name: "Manufacturer1" }).save();
            id = manufacturer._id;
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

        it("should respond 404 if manufacturer with the given ID does not exist", async () => {
            id = utils.getValidObjectId();

            const res = await exec();
            
            expect(res.status).toBe(404);
        });

        it("should delete manufacturer if request is valid", async () => {
            const res = await exec();

            const manufacturerInDb = await Manufacturer.findOne({ name: manufacturer.name });

            expect(manufacturerInDb).toBeNull();
        });

        it("should return the deleted manufacturer if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", manufacturer.name);
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });
});