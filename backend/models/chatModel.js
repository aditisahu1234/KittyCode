// models/chatModel.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Ensure ObjectId type
    ],
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  }, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
