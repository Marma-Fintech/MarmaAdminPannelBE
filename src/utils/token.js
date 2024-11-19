const jwt = require("jsonwebtoken");
require('dotenv').config();

let JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

async function createToken(payload) {
   return jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn: '1d'
    });
}

async function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET_KEY);
    } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else if (err.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else {
            throw new Error('Token verification failed');
        }
    }
}

module.exports = { createToken, verifyToken };
