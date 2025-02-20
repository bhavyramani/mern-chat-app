const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/user.controller');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const newName = Date.now() + '-' + file.originalname;
        cb(null, newName);
    }
});

const upload = multer({ storage: storage });

router.post('/signup', upload.single('profile'), registerUser);
router.post('/login', authUser);
router.get('/', authMiddleware, allUsers);
// router.get('')

module.exports = router;