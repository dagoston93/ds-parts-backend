const userRights = require("../../../middleware/userRights");

describe("userRights middlewares", () => {
    let req;
    let res;
    let send;
    let next;

    beforeEach(() => {
        req = {
            user: {
                rights: {
                    canModifyParts: true,
                    canDeleteParts: true,
                    canModifyUsers: true,
                    canDeleteUsers: true
                }
            }
        };

        send = jest.fn();
        res = {
            status: jest.fn().mockReturnValue(
                {
                    send: send
                }
            )
        };

        next = jest.fn();
    });

    describe("canModifyParts", () => {
        it("should respond 403 if user is not allowed to modify parts.", () => {
            req.user.rights.canModifyParts = false;

            userRights.canModifyParts(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(send).toHaveBeenCalled();
        });

        it("should not call next() if user is not allowed to modify parts.", () => {
            req.user.rights.canModifyParts = false;

            userRights.canModifyParts(req, res, next);

            expect(next).not.toHaveBeenCalled();
        });

        it("should call next() if user is allowed to modify parts.", () => {
            userRights.canModifyParts(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe("canDeleteParts", () => {
        it("should respond 403 if user is not allowed to delete parts.", () => {
            req.user.rights.canDeleteParts = false;

            userRights.canDeleteParts(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(send).toHaveBeenCalled();
        });

        it("should not call next() if user is not allowed to delete parts.", () => {
            req.user.rights.canDeleteParts = false;

            userRights.canDeleteParts(req, res, next);

            expect(next).not.toHaveBeenCalled();
        });

        it("should call next() if user is allowed to delete parts.", () => {
            userRights.canDeleteParts(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe("canModifyUsers", () => {
        it("should respond 403 if user is not allowed to modify users.", () => {
            req.user.rights.canModifyUsers = false;

            userRights.canModifyUsers(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(send).toHaveBeenCalled();
        });

        it("should not call next() if user is not allowed to modify users.", () => {
            req.user.rights.canModifyUsers = false;

            userRights.canModifyUsers(req, res, next);

            expect(next).not.toHaveBeenCalled();
        });

        it("should call next() if user is allowed to modify users.", () => {
            userRights.canModifyUsers(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe("canDeleteUsers", () => {
        it("should respond 403 if user is not allowed to delete users.", () => {
            req.user.rights.canDeleteUsers = false;

            userRights.canDeleteUsers(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(send).toHaveBeenCalled();
        });

        it("should not call next() if user is not allowed to delete users.", () => {
            req.user.rights.canDeleteUsers = false;

            userRights.canDeleteUsers(req, res, next);

            expect(next).not.toHaveBeenCalled();
        });

        it("should call next() if user is allowed to delete users.", () => {
            userRights.canDeleteUsers(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});