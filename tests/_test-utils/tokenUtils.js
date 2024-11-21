const { User } = require("../../models/user");
const { nanoid } = require("nanoid");

async function getToken_User_CanRead() {
    const user = new User(
        {
            name: "testUser1",
            email: `${nanoid(10)}@email.com`,
            password: "1234",
            rights: {
                canModifyParts: false,
                canDeleteParts: false,
                canModifyUsers: false,
                canDeleteUsers: false
            }
        }
    );

    await user.save();
    return user.generateAuthToken();
}

function removeUsers() {
    return User.deleteMany({});
}

module.exports.getToken_User_CanRead = getToken_User_CanRead;
module.exports.removeUsers = removeUsers;
