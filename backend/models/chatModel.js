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
  },
  status: { 
    type: String, 
    enum: ['pending', 'sent'],  // Change 'unsent' to 'pending'
    default: 'pending'          // Default status is now 'pending'
  }
}, { _id: true });

const chatSchema = new mongoose.Schema({
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  messages: [messageSchema],     // Embed the message schema
}, { 
  timestamps: true 
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
