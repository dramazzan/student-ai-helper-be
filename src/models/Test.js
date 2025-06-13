const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  summary: { type: mongoose.Schema.Types.ObjectId, ref: 'Summary' },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Test', testSchema);
