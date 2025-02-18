const express = require('express');
const cors = require('cors');
const { chats } = require('./data/data');
const app = express();
app.use(cors());

app.get('/api/chat', (req, res) => {
    res.send(chats);
})

app.listen(5000, () => {
    console.log('Server is running on port http://localhost:5000/');
});