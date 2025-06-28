const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFileName: { type: String },
  title: { type: String, required: true }, // общий заголовок
  themeTitle: { type: String }, // название темы (например, "Неделя 1: HTML-основы")
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestModule' }, // связь с модулем
  week: { type: Number }, // номер недели или порядковый номер темы
  testType: {type: String , required: true, enum:['normal' , 'multi']},

  difficulty: {
    type: String,
    enum: ['легкий', 'средний', 'трудный'],
    default: 'средний',
  },

  questionCount: { type: Number },

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
