const errorHandler = require('express-async-handler');
const User = require('../models/user.model');
const { getToken } = require('../config/token');

const registerUser = errorHandler(async (req, res) => {
    const { name, email, password, profile } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please fill all fields');
    }

    const checkUser = await User.findOne({ email });
    if (checkUser) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        profile
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            token: getToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Failed to create user');
    }
});

const authUser = errorHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if(user && (await user.verify(password))){
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            token: getToken(user._id)
        });
    }else{
        res.status(401);
        throw new Error('Invalid email or password');
    }
    
});

module.exports = { registerUser, authUser };