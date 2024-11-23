const utils = require("../../_test-utils/utils");
const part = require("../../../models/part");

describe("part model", () => {
    let newPart;

    beforeEach( () => {
        server = require("../../../index");
        newPart =  {
            name: "part1",
            price: 1,
            count: 1
        };
    });
    
    afterEach(async () => {
        await server.close();
    });

    describe("validate", () => {
        it("should return an error if name is not provided", () => {
            delete newPart.name;

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if name is not a string", () => {
            newPart.name = 123;

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if name is less than 2 characters long", () => {
            newPart.name = "a";

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if name more than 255 characters long", () => {
            newPart.name = utils.getLongString(256);

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if price is not provided", () => {
            delete newPart.price;

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if price is not a number", () => {
            newPart.price = "a";

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if price is not greater than 0", () => {
            newPart.price = 0;

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if count is not provided", () => {
            delete newPart.count;

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if count is not a number", () => {
            newPart.count = "a";

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if count is less than 0", () => {
            newPart.price = -1;

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if manufacturer is not a valid object ID.", () => {
            newPart.manufacturer = 123;

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if partPackage is not a valid object ID.", () => {
            newPart.partPackage = 123;

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if category is not a valid object ID.", () => {
            newPart.category = 123;

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should return an error if createdBy is not a valid object ID.", () => {
            newPart.createdBy = 123;

            const { error } = part.validate(newPart);
            
            expect(error).toBeDefined();
        });

        it("should not return an error if part is valid - no objectId type parameters given", () => {
            const { error } = part.validate(newPart);
            
            expect(error).not.toBeDefined();
        });

        it("should not return an error if part is valid - all objectId type parameters valid", () => {
            newPart.manufacturer = utils.getValidObjectId();
            newPart.partPackage = utils.getValidObjectId();
            newPart.category = utils.getValidObjectId();
            newPart.createdBy = utils.getValidObjectId();

            const { error } = part.validate(newPart);
            
            expect(error).not.toBeDefined();
        });
    });
});