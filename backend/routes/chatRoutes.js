const express = require('express');
const { getChatRoom, getChatMessages, getUserChats, exchangePublicKeys } = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/room', protect, getChatRoom); // Get or create chat room
router.get('/:roomId/messages', protect, getChatMessages); // Get messages for a chat room
router.get('/user', protect, getUserChats); // Fetch user chats

// New route for exchanging public keys
router.post('/exchange-keys', protect, exchangePublicKeys);


module.exports = router;
