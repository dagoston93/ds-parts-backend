const utils = require("../../_test-utils/utils");
const user = require("../../../models/user");

describe("category model", () => {
    let newUser;
    beforeEach( () => {
        server = require("../../../index");

        newUser = {
            name: "User1",
            email: "user1@email.com",
            password: "abcDEF1@",
            rights: {
                canModifyParts: false,
                canDeleteParts: false,
                canModifyUsers: false,
                canDeleteUsers: false
            }
        }
    });
    
    afterEach(async () => {
        await server.close();
    });

    describe("validate", () => {
        it("should return an error if name is not provided", () => {
            delete newUser.name;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if name is not a string", () => {
            newUser.name = 123;

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if name is less than 2 characters long", () => {
            newUser.name = "a";

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if name more than 100 characters long", () => {
            newUser.name = utils.getLongString(101);

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if email is not provided", () => {
            delete newUser.email;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if email is not a valid email address", () => {
            newUser.email = "abc-";

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if password is not provided", () => {
            delete newUser.password;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if password is not a string", () => {
            newUser.password = 123;

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if password is less than 8 characters", () => {
            newUser.password = "abDEF1@";

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if password is more than 30 characters", () => {
            newUser.password = "abcDEF1@" + utils.getLongString(23);

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if password does not contain lowercase characters", () => {
            newUser.password = "ABCDEF1@";

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if password does not contain uppercase characters", () => {
            newUser.password = "abcdef1@";

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if password does not contain numbers", () => {
            newUser.password = "abcDEFG@";

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if password does not contain special characters", () => {
            newUser.password = "abcDEF11";

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should return an error if rights.canModifyParts is not provided", () => {
            delete newUser.rights.canModifyParts;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if rights.canModifyParts is not a boolean", () => {
            newUser.rights.canModifyParts = 1;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if rights.canDeleteParts is not provided", () => {
            delete newUser.rights.canDeleteParts;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if rights.canDeleteParts is not a boolean", () => {
            newUser.rights.canDeleteParts = 1;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if rights.canModifyUsers is not provided", () => {
            delete newUser.rights.canModifyUsers;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if rights.canModifyUsers is not a boolean", () => {
            newUser.rights.canModifyUsers = 1;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if rights.canDeleteUsers is not provided", () => {
            delete newUser.rights.canDeleteUsers;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if rights.canDeleteUsers is not a boolean", () => {
            newUser.rights.canDeleteUsers = 1;

            const { error } = user.validateUser({ });
            
            expect(error).toBeDefined();
        });

        it("should return an error if createdBy is not a valid objectID", () => {
            newUser.createdBy = 123;

            const { error } = user.validateUser(newUser);
            
            expect(error).toBeDefined();
        });

        it("should not return an error if user is valid - no creator provided", () => {
            const { error } = user.validateUser(newUser);
            console.log(error);
            expect(error).not.toBeDefined();
        });

        it("should not return an error if user is valid - valid creator provided", () => {
            newUser.createdBy = utils.getValidObjectId();

            const { error } = user.validateUser(newUser);
            console.log(error);
            expect(error).not.toBeDefined();
        });
    });
});