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
exports.getChatMessages = async (req, res) => {
  const { roomId } = req.params;

  try {
    const chat = await Chat.findById(roomId)
      .populate('messages.sender', 'publicKey name')
      .populate('participants', 'publicKey');

    if (!chat) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const formattedMessages = chat.messages.map(message => ({
      _id: message._id,
      sender: message.sender._id,
      senderName: message.sender.name,
      encryptedText: message.encryptedText,
      timestamp: message.timestamp,
      senderPublicKey: message.senderPublicKey
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
      senderPublicKey: message.senderPublicKey
    };

    if (!newMessage.encryptedText || !newMessage.senderPublicKey) {
      throw new Error('Message data is incomplete: encryptedText or senderPublicKey is missing');
    }

    console.log('Validated new message:', newMessage);

    chat.messages.push(newMessage);
    console.log('Messages after push:', chat.messages);

    // Validate all messages before saving
    chat.messages.forEach((msg, index) => {
      if (!msg.encryptedText || !msg.senderPublicKey) {
        throw new Error(`Message at index ${index} is incomplete: encryptedText or senderPublicKey is missing`);
      }
    });

    await chat.save();
    console.log('Chat saved successfully');

    const populatedChat = await Chat.findById(roomId).populate('messages.sender', 'publicKey name');
    console.log('Populated Chat:', populatedChat);

    const latestMessage = populatedChat.messages[populatedChat.messages.length - 1];
    console.log('Latest Message:', latestMessage);

    return {
      _id: latestMessage._id,
      sender: latestMessage.sender._id,
      senderName: latestMessage.sender.name,
      encryptedText: latestMessage.encryptedText,
      timestamp: latestMessage.timestamp,
      senderPublicKey: latestMessage.senderPublicKey
    };
  } catch (error) {
    console.error('Error handling send message:', error.message);
    throw error;
  }
};

// Get user's chat list
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
      const lastMessage = chat.messages[chat.messages.length - 1];
      const friend = chat.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      return {
        _id: chat._id,
        friendId: friend._id,
        friendName: friend.name,
        friendPublicKey: friend.publicKey,
        lastMessage: {
          encryptedText: lastMessage.encryptedText,
          senderPublicKey: lastMessage.senderPublicKey,
          timestamp: lastMessage.timestamp,
          sender: lastMessage.sender._id
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
