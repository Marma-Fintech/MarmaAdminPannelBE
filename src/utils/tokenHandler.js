const blacklistedTokens = new Set();

const addToBlacklist = async (token) => {
    blacklistedTokens.add(token);
};

const isTokenBlacklisted = async (token) => {
    console.log("token", token);
    return blacklistedTokens.has(token);
};

module.exports = { addToBlacklist, isTokenBlacklisted };