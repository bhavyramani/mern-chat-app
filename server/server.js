const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const { authMiddleware } = require('./middlewares/auth.middleware');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');
const messageRoutes = require('./routes/message.routes');
const User = require('./models/user.model');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
// Allow cors policy
app.use(cors());
// Parse incoming request bodies in a middleware before handler.
app.use(bodyParser.json());
connectDB(); // Connect to MongoDB
const fileRoutes = require('./routes/file.routes'); // Import file routes

app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); //Serve static files (profile images)
app.use('/api/user', userRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/message', authMiddleware, messageRoutes)
app.use('/api/files', fileRoutes);

// For production
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname1, '/client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname1, 'client', 'build', 'index.html'));
    })
}

// End production

// Error handlers
app.use(notFound);
app.use(errorHandler);

const server = app.listen(5000, () => {
    console.log('Server is running on port http://localhost:5000/');
});

// Initialize socket
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CLIENT_URL,
    }
});

io.on('connection', (socket) => {
    console.log('Connected to sokcet.io');

    // Update user's status
    socket.on('setup', async (userData) => {
        socket.join(userData._id);
        await User.findByIdAndUpdate(userData._id, { lastSeen: new Date() });
        socket.emit('connected');
    });

    // Assign user in room
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User Joined Room: ' + room);
    });

    // Make user status online if heartbeat is received
    socket.on('heartbeat', async (userId) => {
        console.log("Heartbeat from: " + userId);
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
        io.emit('userStatus', { userId, status: 'online' });
    });

    // Emit message to other users
    socket.on('new message', (newMessageRecived) => {
        let chat = newMessageRecived.chat;
        if (!chat.users)
            return console.log('Chat.users not defined');
        chat.users.forEach((user) => {
            if (user._id == newMessageRecived.sender._id)
                return;
            socket.in(user._id).emit('message received', newMessageRecived);
        });
    });

    // Start typing indicators
    socket.on('typing', (room) => {
        console.log('Typing in room: ' + room);
        socket.in(room).emit('typing');
    });

    // Stop typing indicators
    socket.on('stop typing', (room) => {
        console.log('Stop Typing in room: ' + room);
        socket.in(room).emit('stop typing');
    });

    socket.off('setup', (userData) => {
        socket.leave(userData._id);
    });

    socket.on("disconnect", async () => {
        console.log("User disconnected:", socket.id);
    });
});