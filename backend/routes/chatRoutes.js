// File: routes/chatRoutes.js
const express = require('express');
const { getChatRoom, getChatMessages, getUserChats } = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/room', protect, getChatRoom); // Get or create chat room
router.get('/:roomId/messages', protect, getChatMessages); // Get messages for a chat room
router.get('/user', protect, getUserChats); // Correctly define the GET route for fetching user chats

module.exports = router;
