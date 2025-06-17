const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFileName: { type: String },
  title: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['легкий', 'средний', 'трудный'],
    default: 'средний',
  },
  questionCount: { type: Number },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
