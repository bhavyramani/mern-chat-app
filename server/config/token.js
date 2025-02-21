const jwt = require('jsonwebtoken');

// Generate token from user id
const getToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
        // expiry time is one day
    })
};

module.exports = { getToken };