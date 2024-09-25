const Chat = require('../models/chatModel');
const jwt = require('jsonwebtoken');

// Create or fetch a chat room between two users
exports.getChatRoom = async (req, res) => {
  const userId = req.user._id;
  const { friendId } = req.body;

  console.log('Decoded userId:', userId, 'Received friendId:', friendId);

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, friendId] }
    });

    if (!chat) {
      console.log('No chat room found, creating a new one...');
      chat = new Chat({
        participants: [userId, friendId]
      });
      await chat.save();
      console.log('New chat room created with ID:', chat._id);
    } else {
      console.log('Existing chat room found with ID:', chat._id);
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error in getChatRoom:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get chat messages for a room
exports.getChatMessages = async (req, res) => {
  const { roomId } = req.params;

  try {
    const chat = await Chat.findById(roomId).populate('messages.sender', 'name');
    res.status(200).json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// Decode JWT and get user ID
const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify token using JWT_SECRET
    return decoded.id;  // Return the user ID from the decoded token
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;  // Return null if token is invalid
  }
};

// Handle incoming message
exports.handleSendMessage = async (roomId, message) => {
  try {
    // Decode the sender's token to get the user ID
    const userId = getUserIdFromToken(message.sender);
    
    if (!userId) {
      throw new Error('Invalid token, unable to decode sender');
    }

    // Fetch the chat room by ID
    const chat = await Chat.findById(roomId);
    
    if (!chat) {
      throw new Error('Chat room not found');
    }

    // Push the new message into the messages array
    const newMessage = {
      sender: userId,
      text: message.text,
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);

    // Save the chat room with the new message
    await chat.save();

    console.log('Message saved to database');
    return newMessage;  // Return the saved message
  } catch (error) {
    console.error('Error sending message:', error.message);
    throw error;
  }
};

