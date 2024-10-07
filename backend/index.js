const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { handleSendMessage, markMessageAsSent } = require('./controllers/chatController'); // Import both functions

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust based on your front-end domain
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

  // Handle sending messages
  socket.on('sendMessage', async ({ roomId, message }) => {
    try {
      console.log(`Received message from room ${roomId}:`, message);
      
      // Save the message in the database with 'pending' status
      const savedMessage = await handleSendMessage(roomId, message);
      
      // Broadcast the message to all clients in the room with 'pending' status
      socket.broadcast.to(roomId).emit('receiveMessage', savedMessage);

    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  });

  // Handle acknowledgment from the frontend when a message is decrypted
  socket.on('messageDecrypted', async ({ roomId, messageId }) => {
    try {
      // Mark the message as sent in the backend
      const updatedMessage = await markMessageAsSent(roomId, messageId);

      // Optionally, broadcast the updated message status to all clients
      socket.broadcast.to(roomId).emit('messageStatusUpdate', {
        _id: updatedMessage._id,
        status: updatedMessage.status,
      });

    } catch (error) {
      console.error('Error marking message as sent:', error.message);
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
