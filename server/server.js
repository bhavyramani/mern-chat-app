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

const server = app.listen(5000, () => {
    console.log('Server is running on port http://localhost:5000/');
});
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors:{
        origin:'http://localhost:3000'
    }
});

io.on('connection', (socket)=>{
    console.log("Connected to sokcet.io");
    
    socket.on('setup', (userData)=>{
        socket.join(userData._id);
        console.log("User joined room", userData._id);
        socket.emit('connected');
    });

    socket.on('join chat', (room)=>{
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on('new message', (newMessageRecived)=>{
        let chat = newMessageRecived.chat;
        if(!chat.users)
            return console.log("Chat.users not defined");
        chat.users.forEach((user)=>{
            if(user._id == newMessageRecived.sender._id)
                return;
            socket.in(user._id).emit('message received', newMessageRecived);
        });
    });

    socket.on('typing', (room)=>{
        console.log("Typing in room: " + room);
        socket.in(room).emit('typing');
    });
    
    socket.on('stop typing', (room)=>{
        console.log("Stop Typing in room: " + room);
        socket.in(room).emit('stop typing');
    });

    socket.off("setup", ()=>{
        socket.leave(userData._id);
    });
});