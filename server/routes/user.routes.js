const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/user.controller');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware')

router.post('/signup', registerUser);
router.post('/login', authUser);
router.get('/', authMiddleware, allUsers);


module.exports = router;