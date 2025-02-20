const errorHandler = require('express-async-handler');
const Message = require("../models/message.model");
const User = require("../models/user.model");
const Chat = require("../models/chat.model");

const allMessages = errorHandler(async (req, res) => {
    try {
        const { chatId } = req.params;
        let { page, limit = 20 } = req.query;
        limit = parseInt(limit);
        const totalMessages = await Message.countDocuments({ chat: chatId });
        const totalPages = Math.ceil(totalMessages / limit) || 1;
        if (!page) {
            page = 1;
        } else {
            page = parseInt(page);
        }
        const skip = (page - 1) * limit;
        
        const messages = await Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("sender", "name profile email")
            .populate("chat");

        res.json({
            messages,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const sendMessage = errorHandler(async (req, res) => {
    const { content, chatId, file } = req.body;
    console.log(req.body);
    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    let newMessage = {
        sender: req.user._id,
        file: file,
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

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message });
        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { allMessages, sendMessage };
