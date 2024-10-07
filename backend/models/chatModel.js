// chatModel.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  encryptedText: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  senderPublicKey: { 
    type: String, 
    required: true 
  }
}, { _id: true });

const chatSchema = new mongoose.Schema({
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  messages: [messageSchema],
}, { 
  timestamps: true 
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;