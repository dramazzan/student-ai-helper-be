const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originalFileName: String,
  title: String,
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: Number,
    },
  ],
});

module.exports = mongoose.model('Test', testSchema);
