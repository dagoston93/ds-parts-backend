const utils = require("../../_test-utils/utils");
const category = require("../../../models/category");

describe("category model", () => {
    beforeEach( () => {
        server = require("../../../index");
    });
    
    afterEach(async () => {
        await server.close();
    });

    describe("validate", () => {
        it("should return an error if name is not provided", () => {
            const { error } = category.validate({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if name is not a string", () => {
            const { error } = category.validate({ name: 123 });
            
            expect(error).toBeDefined();
        });

        it("should return an error if name is less than 2 characters long", () => {
            const { error } = category.validate({ name: "a" });
            
            expect(error).toBeDefined();
        });

        it("should return an error if name more than 255 characters long", () => {
            const { error } = category.validate({ name: utils.getLongString(256) });
            
            expect(error).toBeDefined();
        });

        it("should return an error if createdBy is not a valid object ID.", () => {
            const { error } = category.validate(
                { 
                    name: "Category1",
                    createdBy: 1234
                });
            
            expect(error).toBeDefined();
        });

        it("should return an error if parent is not a valid object ID.", () => {
            const { error } = category.validate(
                { 
                    name: "Category1",
                    parent: 1234
                });
            
            expect(error).toBeDefined();
        });

        it("should not return an error if category is valid - no creator or parent given", () => {
            const { error } = category.validate({ name: "12345" });
            
            expect(error).not.toBeDefined();
        });

        it("should not return an error if category is valid - valid creator given", () => {
            const { error } = category.validate(
                { 
                    name: "12345",
                    createdBy: utils.getValidObjectId()
            });
            
            expect(error).not.toBeDefined();
        });

        it("should not return an error if category is valid - valid parent given", () => {
            const { error } = category.validate(
                { 
                    name: "12345",
                    parent: utils.getValidObjectId()
            });
            
            expect(error).not.toBeDefined();
        });
    });
});