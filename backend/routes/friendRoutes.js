const express = require('express');
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
} = require('../controllers/friendController');
const protect = require('../middleware/authMiddleware'); // Ensure the user is authenticated

const router = express.Router();

// Route to send a friend request
router.post('/request', protect, sendFriendRequest);

// Route to accept a friend request
router.post('/accept', protect, acceptFriendRequest);

// Route to reject a friend request
router.post('/reject', protect, rejectFriendRequest);

// Route to get friend requests (for notifications)
router.get('/requests', protect, getFriendRequests);

// Route to get the list of friends for the logged-in user
router.get('/', protect, getFriends);

module.exports = router;
