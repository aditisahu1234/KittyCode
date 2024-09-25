const Chat = require('../models/chatModel');
const jwt = require('jsonwebtoken');

// Decode JWT and get user ID
const getUserIdFromToken = (token) => {
  try {
    if (typeof token !== 'string') {
      console.log('Invalid sender token:', token);  // Log the token if it's not a string
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Decoded sender ID: ${decoded.id}`);  // Log decoded ID for debugging
    return decoded.id;
  } catch (error) {
    console.error('Error decoding JWT:', error);  // Log any JWT errors
    return null;
  }
};

// Create or fetch a chat room between two users
exports.getChatRoom = async (req, res) => {
  const userId = req.user._id;
  const { friendId } = req.body;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, friendId] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, friendId]
      });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get chat messages for a room with isSender Flag
exports.getChatMessages = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id;  // Assuming middleware sets req.user from JWT

  try {
    const chat = await Chat.findById(roomId).populate('messages.sender', 'name');

    if (!chat) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Add 'isSender' field to each message
    const messagesWithSenderFlag = chat.messages.map((message) => {
      let senderId;

      // Check if the sender is already an object (from the database) or a JWT string
      if (typeof message.sender === 'object' && message.sender._id) {
        // Sender is an object (already populated from DB)
        senderId = message.sender._id.toString();
      } else {
        // Sender is a JWT string (from incoming message)
        senderId = getUserIdFromToken(message.sender);
      }

      console.log(`Final sender ID: ${senderId}`);

      return {
        ...message._doc,
        isSender: senderId && senderId === userId.toString(),
      };
    });

    res.status(200).json(messagesWithSenderFlag);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



// Handle incoming message
exports.handleSendMessage = async (roomId, message) => {
  try {
    const userId = getUserIdFromToken(message.sender);

    if (!userId) {
      throw new Error('Invalid token, unable to decode sender');
    }

    const newMessage = {
      sender: userId,
      text: message.text,
      timestamp: new Date(),
    };

    // Use atomic update to push a new message into the messages array
    const updatedChat = await Chat.findByIdAndUpdate(
      roomId,
      { $push: { messages: newMessage } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedChat) {
      throw new Error('Chat room not found');
    }

    return newMessage;
  } catch (error) {
    throw error;
  }
};
