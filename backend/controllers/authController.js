const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { box } = require('tweetnacl');

const encodeBase64 = async (data) => {
  const base64Module = await import('@stablelib/base64');
  return base64Module.encode(data);
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register User (publicKey removed from registration)
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  console.log('Registering user:', email);

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user and save to database
    user = new User({ name, email, password }); // No publicKey field during registration
    await user.save();

    // Create JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      userId: user._id,
      username: user.name,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Login User (public key is not sent during login)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body; // Only email and password sent during login

  console.log('Logging in user:', email);

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Invalid credentials:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Invalid credentials for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      userId: user._id,
      username: user.name,
      publicKey: user.publicKey, // Return public key if exists
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error logging in user:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Store Public Key after login
exports.storePublicKey = async (req, res) => {
  const { publicKey } = req.body; // Public key sent in the request body
  const token = req.headers.authorization?.split(' ')[1]; // Retrieve token from Authorization header

  try {
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    // Verify the JWT token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store the public key for the user
    if (publicKey) {
      user.publicKey = publicKey;
      await user.save();
      console.log(`Public Key for user ${user.email} stored:`, publicKey); // Log the public key
      res.status(200).json({ message: 'Public key stored successfully' });
    } else {
      res.status(400).json({ message: 'Public key is missing' });
    }
  } catch (error) {
    console.error('Error storing public key:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
