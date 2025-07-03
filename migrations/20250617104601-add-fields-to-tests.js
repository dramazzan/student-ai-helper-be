const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
    async up() {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-ai-helper';
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = mongoose.connection.db;
        const collection = db.collection('tests');

        const cursor = collection.find({
            $or: [{ difficulty: { $exists: false } }, { questionCount: { $exists: false } }],
        });

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            const questionCount = Array.isArray(doc.questions) ? doc.questions.length : 5;

            await collection.updateOne(
                { _id: doc._id },
                {
                    $set: {
                        difficulty: doc.difficulty || 'средний',
                        questionCount: doc.questionCount || questionCount,
                    },
                }
            );
        }

        await mongoose.disconnect();
        console.log('✅ Migration UP: поля добавлены');
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
                difficulty: "",
                questionCount: "",
            }
        });

        await mongoose.disconnect();
        console.log('↩️ Migration DOWN: поля удалены');
    },
};
