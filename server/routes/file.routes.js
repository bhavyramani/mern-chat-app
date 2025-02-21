const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { authMiddleware } = require('../middlewares/auth.middleware');
const router = express.Router();

const mongoURI = process.env.MONGO_URI;

// Create a connection to the MongoDB database for gridfs
const conn = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Initialize GridFSBucket
let gridfsBucket;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    console.log('GridFSBucket initialized');
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload file
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate custom filename: timestamp + userId + original filename to avoid conflicts
    const customFilename = `${Date.now()}_${req.user._id}_${req.file.originalname}`;

    const uploadStream = gridfsBucket.openUploadStream(customFilename, {
        contentType: req.file.mimetype
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', () => {
        res.status(201).json({
            fileId: uploadStream.id,
            filename: customFilename,
            contentType: req.file.mimetype
        });
    });

    uploadStream.on('error', (err) => {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Error uploading file' });
    });
});

// Download file
router.get('/download/:filename', async (req, res) => {
    try {
        const file = await conn.db.collection('uploads.files').findOne({ filename: req.params.filename });
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        const downloadStream = gridfsBucket.openDownloadStream(file._id);
        downloadStream.on('error', (err) => {
            console.error('Download error:', err);
            res.status(500).json({ error: 'Error downloading file' });
        });
        downloadStream.pipe(res);
    } catch (err) {
        console.error('Internal error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
