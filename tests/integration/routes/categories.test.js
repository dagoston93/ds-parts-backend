let mockUser = { };

jest.mock("../../../middleware/auth", () => jest.fn((req, res, next) => { req.user = mockUser; next();}));
jest.mock("../../../middleware/validateObjectId", () => jest.fn((req, res, next) => next()));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");

const utils = require("../../_test-utils/utils");
const tokenUtils = require("../../_test-utils/tokenUtils");

const { Category } = require("../../../models/category");

const auth = require("../../../middleware/auth");
const validateObjectId = require("../../../middleware/validateObjectId");
const userRights = require("../../../middleware/userRights");

userRights.canModifyParts = jest.fn((req, res, next) => next());
userRights.canDeleteParts = jest.fn((req, res, next) => next());

let server;
const testedRoute = "/api/categories";

describe(testedRoute, ()=>{
    beforeEach( async () => {
        jest.clearAllMocks();
        mockUser = { };
        server = require("../../../index");
    });
    
    afterEach(async () => {
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

        it("should return all categories", async () => {            
            await Category.collection.insertMany([
                { name: "Category1" },
                { name: "Category2" },
            ]);

            const res = await exec();

            expect(res.body.length).toBe(2);
            expect(res.body.some(m => m.name == "Category1")).toBeTruthy();
            expect(res.body.some(m => m.name == "Category2")).toBeTruthy();
        });

        it("should respond 200", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("GET /:id", () => {
        let id;
        let category;

        beforeEach(async () => {
            category = new Category({ name: "Category1" });
            await category.save();
            id = category._id;
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

        it("should respond 404 if no category with the given ID exists", async () => {
            id = utils.getValidObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should return the category if valid ID passed", async () => {
           const res = await exec();

            expect(res.body).toHaveProperty('name', category.name);
        });

        it("should respond 200 if valid ID passed", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("GET /sub/:id", () => {
        let id;
        let category;

        beforeEach(async () => {
            category1 = new Category({ name: "Category1" });
            await category1.save();

            category2 = new Category(
                { 
                    name: "Category2",
                    parent: category1._id
                }
            );
            await category2.save();

            category3 = new Category(
                { 
                    name: "Category3",
                    parent: category1._id
                }
            );
            await category3.save();
            id = category1._id;
        });

        const exec = async () => {
            return await request(server).get(`${testedRoute}/sub/${id}`);
        };


        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call validateObjectId middleware", async () => {
            await exec();

            expect(validateObjectId).toHaveBeenCalled();
        });

        it("should respond 404 if no category with the given ID exists", async () => {
            id = utils.getValidObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should return the subcategories if valid ID passed", async () => {
           const res = await exec();

           expect(res.body.length).toBe(2);
           expect(res.body.some(m => m.name == "Category2")).toBeTruthy();
           expect(res.body.some(m => m.name == "Category3")).toBeTruthy();
        });

        it("should respond 200 if valid ID passed", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("POST /", ()=> {
        let category;
        let user;

        const exec = async () => {
            return await request(server)
                .post(testedRoute)
                .send(category);
        };

        beforeEach(async () => {
            let token = await tokenUtils.getToken_User_CanRead();
            const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
            mockUser._id = decoded.user._id;
            category = { name: "Category1" };
        });

        it("should call auth middleware", async () => {
            await exec();

            expect(auth).toHaveBeenCalled();
        });

        it("should call canModifyParts middleware", async () => {
            await exec();

            expect(userRights.canModifyParts).toHaveBeenCalled();
        });

        it("should respond 400 if category validation fails", async () => {
            category = { };

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should respond 400 if parent is given but does not exist", async () => {
            category.parent = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the category if request is valid - no parent given", async () => {
            await exec();

            const categoryInDb = await Category.findOne({ name: "Category1" });

            expect(categoryInDb).not.toBeNull();
        });

        it("should save the creator of the category if request is valid", async () => {
            await exec();

            const categoryInDb = await Category.findOne({ name: "Category1" });

            expect(categoryInDb.createdBy._id.toString()).toBe(mockUser._id);
        });

        it("should return the category if request is valid - no parent given", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "Category1");
        });

        it("should respond 200 if request is valid - no parent given", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it("should save the category if request is valid - no parent given", async () => {
            const parentCategory = new Category({ name: "ParentCategory" });
            await parentCategory.save();
            category.parent = parentCategory._id;

            await exec();

            const categoryInDb = await Category.findOne({ name: "Category1" });

            expect(categoryInDb).not.toBeNull();
            expect(categoryInDb.parent.toString()).toBe(parentCategory._id.toString());
        });
        
        it("should return the category if request is valid - valid parent given", async () => {
            const parentCategory = new Category({ name: "ParentCategory" });
            await parentCategory.save();
            category.parent = parentCategory._id;

            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "Category1");
            expect(res.body.parent.toString()).toBe(parentCategory._id.toString());
        });

        it("should respond 200 if request is valid - valid parent given", async () => {
            const parentCategory = new Category({ name: "ParentCategory" });
            await parentCategory.save();
            category.parent = parentCategory._id;
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("PUT /:id", () => {
        let id;
        let category;
        let newCategory = { };

        beforeEach(async () => {
            category = await new Category({ name: "Category1" }).save();
            id = category._id;
            newCategory = { name: "Category2" };
        });

        const exec = async () => {
            return await request(server)
                .put(`${testedRoute}/${id}`)
                .send(newCategory);
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

        it("should respond 404 if category with the given ID does not exist", async () => {
            id = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it("should respond 400 if category validation fails", async () => {
            newCategory = { };

            const res = await exec();

            expect(res.status).toBe(400);
        });
        
        it("should respond 400 if parent is given but does not exist", async () => {
            newCategory.parent = utils.getValidObjectId();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the category if request is valid", async () => {
            await exec();

            const categoryInDb = await Category.findOne({ name: newCategory.name });

            expect(categoryInDb).not.toBeNull();
        });

        it("should return the modified category if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", newCategory.name);
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it("should save the category if request is valid - no parent given", async () => {
            const parentCategory = new Category({ name: "ParentCategory" });
            await parentCategory.save();
            newCategory.parent = parentCategory._id;

            await exec();

            const categoryInDb = await Category.findOne({ name: "Category2" });

            expect(categoryInDb).not.toBeNull();
            expect(categoryInDb.parent.toString()).toBe(parentCategory._id.toString());
        });
        
        it("should return the category if request is valid - valid parent given", async () => {
            const parentCategory = new Category({ name: "ParentCategory" });
            await parentCategory.save();
            newCategory.parent = parentCategory._id;

            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "Category2");
            expect(res.body.parent.toString()).toBe(parentCategory._id.toString());
        });

        it("should respond 200 if request is valid - valid parent given", async () => {
            const parentCategory = new Category({ name: "ParentCategory" });
            await parentCategory.save();
            newCategory.parent = parentCategory._id;
            
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });

    describe("DELETE /:id", () => {
        let id;
        let category;

        beforeEach(async () => {
            category = await new Category({ name: "Category1" }).save();
            id = category._id;
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

        it("should respond 404 if category with the given ID does not exist", async () => {
            id = utils.getValidObjectId();

            const res = await exec();
            
            expect(res.status).toBe(404);
        });

        it("should delete category if request is valid", async () => {
            const res = await exec();

            const categoryInDb = await Category.findOne({ name: category.name });

            expect(categoryInDb).toBeNull();
        });

        it("should return the deleted category if request is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", category.name);
        });

        it("should respond 200 if request is valid", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });
});