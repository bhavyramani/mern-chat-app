const errorHandler = require('express-async-handler');
const User = require('../models/user.model');
const { getToken } = require('../config/token');

// Register new user
const registerUser = errorHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const profile = req.file.filename;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all fields");
    }

    const checkUser = await User.findOne({ email });
    if (checkUser) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        profile,
        lastSeen: new Date() // Store current timestamp as last seen
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            lastSeen: user.lastSeen,
            token: getToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error("Failed to create user");
    }
});

// Authenticate user
const authUser = errorHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.verify(password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            token: getToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// Get all users matching search query
const allUsers = errorHandler(async (req, res) => {
    const query = req.query.search;
    if (!query) {
        res.status(400);
        throw new Error('Please provide search query');
    }

    const users = await User.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
        ]
    }, { _id: 1, name: 1, email: 1 }).find({ _id: { $ne: req.user._id } });
    res.send(users);
});

module.exports = { registerUser, authUser, allUsers };