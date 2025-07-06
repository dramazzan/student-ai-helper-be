const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
  async up() {
    const uri = process.env.MONGODB_URI;

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;
    const collection = db.collection('tests');

    const cursor = collection.find({
      $or: [
        { difficulty: { $exists: false } },
        { questionCount: { $exists: false } }
      ]
    });

    while (await cursor.hasNext()) {
      const test = await cursor.next();
      const questionCount = Array.isArray(test.questions) ? test.questions.length : 0;

      await collection.updateOne(
          { _id: test._id },
          {
            $set: {
              difficulty: test.difficulty || 'medium',
              questionCount: test.questionCount || questionCount,
            }
          }
      );
    }

    await mongoose.disconnect();
    console.log('✅ Migration UP complete');
  },

  async down() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-ai-helper';

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;
    const collection = db.collection('tests');

    await collection.updateMany({}, {
      $unset: {
        difficulty: '',
        questionCount: ''
      }
    });

    await mongoose.disconnect();
    console.log('↩️ Migration DOWN complete');
  }
};
