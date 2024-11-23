const utils = require("../../_test-utils/utils");
const partPackage = require("../../../models/partPackage");

describe("partPackage model", () => {
    let newPartPackage;

    beforeEach( () => {
        server = require("../../../index");
        newPartPackage =  {
            name: "package1",
            type: "SMD"
        };
    });
    
    afterEach(async () => {
        await server.close();
    });

    describe("validate", () => {
        it("should return an error if name is not provided", () => {
            delete newPartPackage.name;

            const { error } = partPackage.validate(newPartPackage);
            
            expect(error).toBeDefined();
        });

        it("should return an error if name is not a string", () => {
            newPartPackage.name = 123;

            const { error } = partPackage.validate(newPartPackage);
            
            expect(error).toBeDefined();
        });

        it("should return an error if name is less than 2 characters long", () => {
            newPartPackage.name = "a";

            const { error } = partPackage.validate(newPartPackage);
            
            expect(error).toBeDefined();
        });

        it("should return an error if name more than 50 characters long", () => {
            newPartPackage.name = utils.getLongString(51);

            const { error } = partPackage.validate(newPartPackage);
            
            expect(error).toBeDefined();
        });

        it("should return an error if type not 'SMD' or 'THT'", () => {
            newPartPackage.type = "a";
            
            const { error } = partPackage.validate(newPartPackage);
            
            expect(error).toBeDefined();
        });

        it("should return an error if createdBy is not a valid object ID.", () => {
            newPartPackage.createdBy = 123;

            const { error } = partPackage.validate(newPartPackage);
            
            expect(error).toBeDefined();
        });

        it("should not return an error if partPackage is valid - SMD - no creator", () => {
            const { error } = partPackage.validate(newPartPackage);
            
            expect(error).not.toBeDefined();
        });

        it("should not return an error if partPackage is valid - THT - no creator", () => {
            partPackage.type = 'THT';

            const { error } = partPackage.validate(newPartPackage);
            
            expect(error).not.toBeDefined();
        });

        it("should not return an error if partPackage is valid - no creator", () => {
            const { error } = partPackage.validate(newPartPackage);
            
            expect(error).not.toBeDefined();
        });

        it("should not return an error if partPackage is valid - valid creator", () => {
            newPartPackage.createdBy = utils.getValidObjectId();

            const { error } = partPackage.validate(newPartPackage);
            
            expect(error).not.toBeDefined();
        });
    });
});