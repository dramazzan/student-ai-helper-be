const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFileName: { type: String },
  title: { type: String, required: true },
  themeTitle: { type: String },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestModule' },
  week: { type: Number },
  testType: {type: String , required: true, enum:['normal' , 'multi']},
  questionCount: { type: Number },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  summary:{
    type: String,
    default: ""
  },
  sourceType: {
    type: String,
    enum: ['file', 'url', 'weak_topics'],
    required: true,
  },
  sourceDetails: {
    type: [String],
    default: '',

  },
  questions: [
    {
      question: { type: String, required: true },
      topic: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
