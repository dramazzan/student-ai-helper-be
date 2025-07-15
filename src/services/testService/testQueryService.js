const Test = require('../../models/Test');
const mongoose = require('mongoose');

async function getNormalTestsByUser(userId) {
    return await Test.find({ owner: userId, testType: 'normal' }).sort({ createdAt: -1 });
}

async function getMultiTestsByUser(userId) {
    return await Test.find({ owner: userId, testType: 'multi' }).sort({ createdAt: -1 });
}

async function getTestsByModuleId(moduleId) {
    return await Test.find({ moduleId, testType: 'multi' }).sort({ createdAt: -1 });
}

async function getTestById(testId, userId) {
    if (!mongoose.Types.ObjectId.isValid(testId)) throw new Error('Неверный ID теста');
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Неверный ID пользователя');

    const test = await Test.findById(testId);
    if (!test) throw new Error('Тест не найден');
    if (!test.owner.equals(userId)) throw new Error('Нет доступа к этому тесту');

    return test;
}

module.exports = {
    getNormalTestsByUser,
    getMultiTestsByUser,
    getTestsByModuleId,
    getTestById,
};
