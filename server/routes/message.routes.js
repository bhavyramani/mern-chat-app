const express = require('express');
const router = express.Router();
const {allMessages, sendMessage} = require('../controllers/message.controller');

router.get('/:chatId', allMessages);
router.post('/', sendMessage);

module.exports = router;