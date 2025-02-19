const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const errorHandler = require('express-async-handler');

const authMiddleware = errorHandler(async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            next();
        }catch(error){
            res.status(401);
            throw new Error("Unauthorized");
        }
    }
});

module.exports = { authMiddleware };