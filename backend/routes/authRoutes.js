const express = require('express');
const { registerUser, loginUser, storePublicKey } = require('../controllers/authController'); // Import the new controller

const router = express.Router();

// Register Route
router.post('/register', registerUser);

// Login Route
router.post('/login', loginUser);

// Store Public Key Route (after login)
router.post('/store-public-key', storePublicKey); // New route for storing the public key

module.exports = router;
