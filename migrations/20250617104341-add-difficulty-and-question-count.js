const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
    async up() {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        const db = mongoose.connection.db;
        const collection = db.collection('tests');

        // Установить значение 'средний' для отсутствующих difficulty
        await collection.updateMany(
            { difficulty: { $exists: false } },
            { $set: { difficulty: 'средний' } }
        );

        // Установить questionCount как размер массива questions
        const cursor = collection.find({ questionCount: { $exists: false } });

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            const count = Array.isArray(doc.questions) ? doc.questions.length : 0;
            await collection.updateOne({ _id: doc._id }, { $set: { questionCount: count } });
        }

        await mongoose.disconnect();
        console.log('✅ Migration UP выполнена');
    },

    async down() {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-ai-helper';
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        const db = mongoose.connection.db;
        const collection = db.collection('tests');

        await collection.updateMany({}, { $unset: { difficulty: "", questionCount: "" } });

        await mongoose.disconnect();
        console.log('↩️ Migration DOWN выполнена');
    }
};
