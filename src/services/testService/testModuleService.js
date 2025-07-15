const Test = require('../../models/Test');
const TestModule = require('../../models/TestModule');
const TestResult = require('../../models/TestResult');

async function getTestModules(userId) {
    return await TestModule.find({ owner: userId });
}

async function getPassedPercentageByModule(moduleId, userId) {
    const tests = await Test.find({ moduleId, testType: 'multi' });
    if (!tests.length) return { total: 0, passed: 0, percentage: 0 };

    const testIds = tests.map(test => test._id);
    const results = await TestResult.find({ testId: { $in: testIds }, userId });

    const passedTestIds = new Set(results.filter(r => r.isPassed).map(r => r.testId.toString()));

    const total = testIds.length;
    const passed = passedTestIds.size;

    return {
        total,
        passed,
        percentage: Math.round((passed / total) * 100)
    };
}

module.exports = {
    getTestModules,
    getPassedPercentageByModule,
};
