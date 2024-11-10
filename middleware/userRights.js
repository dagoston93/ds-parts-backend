function canModifyParts(req, res, next) {
    if(!req.user.rights.canModifyParts) {
        res.status(403).send("Access denied.");
        return;
    }

    next();
}

function canDeleteParts(req, res, next) {
    if(!req.user.rights.canDeleteParts) {
        res.status(403).send("Access denied.");
        return;
    }

    next();
}

function canModifyUsers(req, res, next) {
    if(!req.user.rights.canModifyUsers) {
        res.status(403).send("Access denied.");
        return;
    }

    next();
}

function canDeleteUsers(req, res, next) {
    if(!req.user.rights.canDeleteUsers) {
        res.status(403).send("Access denied.");
        return;
    }

    next();
}

module.exports.canModifyParts = canModifyParts;
module.exports.canDeleteParts = canDeleteParts;
module.exports.canModifyUsers = canModifyUsers;
module.exports.canDeleteUsers = canDeleteUsers;
