const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for registering a new user
router.post('/register', registerUser);

// Route for logging in a user
router.post('/login', loginUser);

// Example of a protected route (only accessible to authenticated users)
// router.get('/profile', protect, (req, res) => {
//   res.send('User profile');
// });

module.exports = router;
