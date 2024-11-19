const tokenStore = {};

function addToken(userId, tokenId) {
    if(!tokenStore.hasOwnProperty(userId)) {
        tokenStore[userId] = [];
    }

    tokenStore[userId].push(tokenId);
}

function invalidateToken(userId, tokenId) {
    if(tokenStore.hasOwnProperty(userId)) {
        tokenStore[userId] = tokenStore[userId].filter(id => id != tokenId);
    }
}

function invalidateAllTokens(userId) {
    if(tokenStore.hasOwnProperty(userId)) {
        tokenStore[userId] = [];
    }
}

function removeUser(userId) {
    if(tokenStore.hasOwnProperty(userId)) {
        delete tokenStore[userId];
    }
}

function isTokenValid(userId, tokenId) {
    if(tokenStore.hasOwnProperty(userId)) {
        if(tokenStore[userId].includes(tokenId)) {
            return true;
        }
    }

    return false;
}

module.exports.addToken = addToken;
module.exports.invalidateToken = invalidateToken;
module.exports.invalidateAllTokens = invalidateAllTokens;
module.exports.removeUser = removeUser;
module.exports.isTokenValid = isTokenValid;
