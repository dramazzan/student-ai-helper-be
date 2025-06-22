const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  summaries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Summary' }],
  tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
  emailToken: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verifyTokenExpires: Date,
});

module.exports = mongoose.model('User', userSchema);
