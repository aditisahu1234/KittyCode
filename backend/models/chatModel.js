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
  },
  type: {
    type: String,
    enum: ['text', 'image'],     // Add 'type' field to specify message type (text or image)
    default: 'text'              // Default is 'text' if not specified
  },
  fileName: { 
    type: String,                     // New field to store file name
    default: null                     // Default is null if not a file message
  },
  fileType: { 
    type: String,                     // New field to store file MIME type (e.g., 'application/pdf')
    default: null                     // Default is null if not a file message
  },
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
