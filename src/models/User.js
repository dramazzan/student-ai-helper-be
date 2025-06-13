const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  summaries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Summary' }],
  tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
});

module.exports = mongoose.model('User', userSchema);
