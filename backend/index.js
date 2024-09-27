const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { handleSendMessage } = require('./controllers/chatController');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust based on your front-end domain
    methods: ['GET', 'POST'],
  },
});

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chats', chatRoutes);

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('sendMessage', async ({ roomId, message }) => {
    try {
      console.log(`Received message from room ${roomId}:`, message);
      const savedMessage = await handleSendMessage(roomId, message);
  
      // Broadcast message to all clients in the room, including the senderJwt
      socket.broadcast.to(roomId).emit('receiveMessage', savedMessage);
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



 