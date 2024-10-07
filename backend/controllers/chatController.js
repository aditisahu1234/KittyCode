const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Helper function to get user ID from token
const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

// Exchange public keys between users
exports.exchangePublicKeys = async (req, res) => {
  const { friendId, publicKey } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { publicKey }, 
      { new: true }
    );

    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    if (!friend.publicKey) {
      return res.status(400).json({ message: 'Friend does not have a public key' });
    }

    res.status(200).json({ 
      friendPublicKey: friend.publicKey,
      userPublicKey: updatedUser.publicKey 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error exchanging keys', 
      error: error.message 
    });
  }
};

// Create or fetch a chat room
exports.getChatRoom = async (req, res) => {
  const userId = req.user._id;
  const { friendId } = req.body;

  try {
    console.log('Fetching or creating chat room for user:', userId, 'and friend:', friendId);

    const currentUser = await User.findById(userId);
    const friendUser = await User.findById(friendId);

    if (!currentUser || !friendUser) {
      return res.status(404).json({ message: 'User or Friend not found' });
    }

    if (!currentUser.publicKey) {
      return res.status(400).json({ message: 'Your public key is missing. Exchange public keys before starting a chat.' });
    }

    if (!friendUser.publicKey) {
      return res.status(400).json({ message: 'Friend does not have a public key. Please request them to exchange keys.' });
    }

    let chat = await Chat.findOne({
      participants: { $all: [userId, friendId] }
    }).populate('participants', 'publicKey name');

    if (!chat) {
      console.log('No chat room found, creating a new one');
      chat = new Chat({
        participants: [userId, friendId]
      });
      await chat.save();
      chat = await chat.populate('participants', 'publicKey name');
    }

    const friend = chat.participants.find(
      p => p._id.toString() !== userId.toString()
    );

    if (!friend || !friend.publicKey) {
      console.error('Friend or friend public key not found');
      return res.status(400).json({ message: 'Friend or public key not found' });
    }

    res.status(200).json({
      _id: chat._id,
      friendPublicKey: friend.publicKey,
      friendName: friend.name
    });
  } catch (error) {
    console.error('Error fetching or creating chat room:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get chat messages
// Get chat messages (only unsent)
exports.getChatMessages = async (req, res) => {
  const { roomId } = req.params;

  try {
    const chat = await Chat.findById(roomId)
      .populate('messages.sender', 'publicKey name')
      .populate('participants', 'publicKey');

    if (!chat) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Filter to get only unsent messages
    const unsentMessages = chat.messages.filter(message => message.status === 'unsent');
    
    console.log(`Fetched unsent messages for room ${roomId}:`, unsentMessages);

    const formattedMessages = unsentMessages.map(message => ({
      _id: message._id,
      sender: message.sender._id,
      senderName: message.sender.name,
      encryptedText: message.encryptedText,
      timestamp: message.timestamp,
      senderPublicKey: message.senderPublicKey,
      status: message.status
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};


// Handle sending messages
// Handle sending messages
exports.handleSendMessage = async (roomId, message) => {
  try {
    console.log('Received message:', message);

    const userId = getUserIdFromToken(message.sender);
    console.log('Extracted userId from token:', userId);

    if (!userId) {
      throw new Error('Invalid token');
    }

    const chat = await Chat.findById(roomId).populate('participants', 'publicKey');
    if (!chat) {
      throw new Error('Chat room not found');
    }

    const newMessage = {
      sender: userId,
      encryptedText: message.encryptedText,
      timestamp: new Date(),
      senderPublicKey: message.senderPublicKey,
      status: 'pending',  // Initially set the status as 'pending'
    };

    if (!newMessage.encryptedText || !newMessage.senderPublicKey) {
      throw new Error('Message data is incomplete: encryptedText or senderPublicKey is missing');
    }

    console.log('Validated new message:', newMessage);

    // Push the new message into the chat's message array and save the chat
    chat.messages.push(newMessage);
    const updatedChat = await chat.save();  // Save the chat with the new message

    // Get the saved message (the last message in the chat)
    const savedMessage = updatedChat.messages[updatedChat.messages.length - 1];

    if (!savedMessage._id) {
      throw new Error('Message ID is undefined after saving');
    }

    // Return the saved message (with 'pending' status) for broadcasting
    return {
      _id: savedMessage._id,
      roomId: roomId,  
      sender: savedMessage.sender,
      encryptedText: savedMessage.encryptedText,
      timestamp: savedMessage.timestamp,
      senderPublicKey: savedMessage.senderPublicKey,
      status: savedMessage.status  // 'pending' status
    };
  } catch (error) {
    console.error('Error handling send message:', error.message);
    throw error;
  }
};

// Function to mark the message as sent
exports.markMessageAsSent = async (roomId, messageId) => {
  try {
    const chat = await Chat.findById(roomId);
    if (!chat) {
      throw new Error('Chat room not found');
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Mark the message as sent
    message.status = 'sent';
    await chat.save();  // Save the updated chat

    console.log(`Message marked as sent. Message ID: ${message._id}, Status: ${message.status}`);
    return message;
  } catch (error) {
    console.error('Error marking message as sent:', error.message);
    throw error;
  }
};





exports.getUserChats = async (req, res) => {
  const userId = req.user._id;

  try {
    const chats = await Chat.find({ 
      participants: userId, 
      'messages.0': { $exists: true } 
    })
    .populate('participants', 'name publicKey')
    .populate('messages.sender', 'name publicKey')
    .sort({ 'messages.timestamp': -1 });

    const formattedChats = chats.map((chat) => {
      // Fetch the last message that has been sent
      const lastMessage = chat.messages
        .filter(message => message.status === 'sent') // Only get sent messages
        .pop();

      const friend = chat.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      return {
        _id: chat._id,
        friendId: friend._id,
        friendName: friend.name,
        friendPublicKey: friend.publicKey,
        lastMessage: {
          encryptedText: lastMessage?.encryptedText || 'No messages yet',
          senderPublicKey: lastMessage?.senderPublicKey || null,
          timestamp: lastMessage?.timestamp || null,
          sender: lastMessage?.sender._id || null
        }
      };
    });

    res.status(200).json(formattedChats);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};


