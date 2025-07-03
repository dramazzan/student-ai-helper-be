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

        const cursor = collection.find({});

        while (await cursor.hasNext()) {
            const test = await cursor.next();

            const updatedQuestions = test.questions?.map((q) => {
                return {
                    ...q,
                    topic: q.topic || 'Общая тема',
                };
            });

            await collection.updateOne(
                { _id: test._id },
                { $set: { questions: updatedQuestions } }
            );
        }

        await mongoose.disconnect();
        console.log('✅ Migration UP complete: добавлены topic в questions');
    },

    async down() {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-ai-helper';

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = mongoose.connection.db;
        const collection = db.collection('tests');

        const cursor = collection.find({});

        while (await cursor.hasNext()) {
            const test = await cursor.next();

            const updatedQuestions = test.questions?.map((q) => {
                const { topic, ...rest } = q;
                return rest;
            });

            await collection.updateOne(
                { _id: test._id },
                { $set: { questions: updatedQuestions } }
            );
        }

        await mongoose.disconnect();
        console.log('↩️ Migration DOWN complete: удалены topic из questions');
    }
};
