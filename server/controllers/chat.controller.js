const errorHandler = require('express-async-handler');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');

// Load selcted Chat
const accessChat = errorHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    // Allow access only if it is made by same user
    let isChat = await Chat.find({
        groupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    }).populate("users", "-password").populate("lastMessage");

    // If chat alrady exist then return it Otherwise first create chat then return.
    isChat = await User.populate(isChat, {
        path: "lastMessage.sender",
        select: "name profile email",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        let chatData = {
            chatName: "sender",
            groupChat: false,
            users: [req.user._id, userId],
            admin: req.user._id
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

// Fetch all chats of users
const fetchChats = errorHandler(async (req, res) => {
    try {
        let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("admin", "-password")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });
        results = await User.populate(results, {
            path: "lastMessage.sender",
            select: "name profile email",
        });
        res.status(200).send(results);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// Create a group chat
const createGroupChat = errorHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    let users = JSON.parse(req.body.users);

    // At least 2 users should be there in group
    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            groupChat: true,
            admin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("admin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// Rename group title
const renameGroup = errorHandler(async (req, res) => {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName,
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("admin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(updatedChat);
    }
});

// Add user to group
const addToGroup = errorHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId).populate("users", "-password");

    if (!chat) {
        res.status(404);
        throw new Error("Chat Not Found");
    }

    // DO not allow more than 100 users in group
    if (chat.users.length >= 100) {
        res.status(400);
        throw new Error("Group chat user limit (100) reached.");
    }

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("admin", "-password");

    res.json(added);
});

// Remove user from group
const removeFromGroup = errorHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("admin", "-password");

    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(removed);
    }
});

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };