const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const {authMiddleware} = require('./middlewares/auth.middleware');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');
const messageRoutes = require('./routes/message.routes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/message', authMiddleware, messageRoutes)
app.use(notFound);
app.use(errorHandler);

app.listen(5000, () => {
    console.log('Server is running on port http://localhost:5000/');
});