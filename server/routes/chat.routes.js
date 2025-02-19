const express = require('express');
const router = express.Router();
const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chat.controller');

router.post('/', accessChat);
router.get('/', fetchChats);
router.post('/group', createGroupChat);
router.put('/rename', renameGroup);
router.put('/group/add', addToGroup);
router.put('/group/remove', removeFromGroup);

module.exports = router;