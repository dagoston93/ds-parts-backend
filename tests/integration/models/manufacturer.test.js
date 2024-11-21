const utils = require("../../_test-utils/utils");
const manufacturer = require("../../../models/manufacturer");

describe("manufacturer model", () => {
    describe("validate", () => {
        it("should return an error if name is not provided", () => {
            const { error } = manufacturer.validate({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if name is not a string", () => {
            const { error } = manufacturer.validate({ name: 123 });
            
            expect(error).toBeDefined();
        });

        it("should return an error if name is less than 2 characters long", () => {
            const { error } = manufacturer.validate({ name: "a" });
            
            expect(error).toBeDefined();
        });

        it("should return an error if name more than 150 characters long", () => {
            const { error } = manufacturer.validate({ name: utils.getLongString(151) });
            
            expect(error).toBeDefined();
        });

        it("should not return an error if manufacturer is valid", () => {
            const { error } = manufacturer.validate({ name: "12345" });
            
            expect(error).not.toBeDefined();
        });
    });
});