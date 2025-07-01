const mongoose = require('mongoose');

const testModuleSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    originalFileName: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TestModule', testModuleSchema);
