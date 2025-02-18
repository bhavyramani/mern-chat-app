const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { chats } = require('./data/data');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const dummy = require('./data/data')

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/user', userRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(5000, () => {
    console.log('Server is running on port http://localhost:5000/');
});