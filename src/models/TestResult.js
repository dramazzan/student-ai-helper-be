const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{ questionId: String, selectedAnswer: Number }],
    score: Number,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TestResult', testResultSchema);
