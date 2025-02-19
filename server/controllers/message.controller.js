const errorHandler = require('express-async-handler');
const Message = require("../models/message.model");
const User = require("../models/user.model");
const Chat = require("../models/chat.model");

const allMessages = errorHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name profile email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const sendMessage = errorHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    let newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        let message = await Message.create(newMessage);
        message = await message.populate("sender", "name profile");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name profile email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { lastMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { allMessages, sendMessage };