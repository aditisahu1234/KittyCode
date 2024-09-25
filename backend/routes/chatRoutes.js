// routes/chatRoutes.js
const express = require('express');
const { getChatRoom, getChatMessages } = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/room', protect, getChatRoom); // Get or create chat room
router.get('/:roomId/messages', protect, getChatMessages); // Get messages for a chat room

module.exports = router;
