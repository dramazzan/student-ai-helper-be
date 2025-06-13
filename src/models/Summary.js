const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originalFileName: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Summary', summarySchema);
