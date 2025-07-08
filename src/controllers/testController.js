const { generateTestFromText, splitTextIntoThemes, generateSummaryFromText} = require('../services/geminiService');
const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const TestModule = require('../models/TestModule');
const path = require('path');
const {parseFile} = require('../utils/fileParser')
const {getMultiTestsByUser , getNormalTestsByUser, getTestsByModuleId, getTestModules , getTestById} = require('../services/testService');

exports.generateTest = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не найден' });
        }

        const ext = path.extname(req.file.originalname).toLowerCase();

        let text;
        try {
            if (ext === '.pdf') {
                text = await parseFile(req.file.path);
            } else if (ext === '.docx') {
                text = await parseFile(req.file.path);
            } else {
                return res.status(400).json({ message: 'Поддерживаются только PDF и DOCX файлы' });
            }
        } catch (err) {
            console.error('Ошибка чтения файла:', err.message);
            return res.status(400).json({ message: 'Ошибка при обработке файла. Попробуйте другой.' });
        }

        const { difficulty, questionCount } = req.body;

        const testJson = await generateTestFromText(text, req.user._id, req.file.originalname, {
            difficulty,
            questionCount,
        });

        const summary = await generateSummaryFromText(text , req.user._id, req.file.originalname)
        testJson.summary = summary;

        res.status(200).json({ test: testJson });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка генерации теста' });
    }
};

exports.getTestResult = async (req, res) => {
    try {
        const testResultId = req.params.id;
        const userId = req.user._id;

        const testResult = await TestResult.findById(testResultId);
        if (!testResult) return res.status(404).json({ message: 'Результат теста не найден' });

        if (testResult.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Нет доступа к результату этого теста' });
        }

        const test = await Test.findById(testResult.testId);
        if (!test) return res.status(404).json({ message: 'Оригинальный тест не найден' });

        const detailedResults = testResult.answers.map(answer => {
            const question = test.questions.find(q => q._id.toString() === answer.questionId);
            return {
                question: question?.question || 'Вопрос не найден',
                options: question?.options || [],
                selectedAnswerIndex: answer.selectedAnswer,
                selectedAnswerText: question?.options[answer.selectedAnswer] || '',
                correctAnswerIndex: question?.correctAnswer,
                correctAnswerText: question?.options[question.correctAnswer] || '',
                isCorrect: answer.selectedAnswer === question?.correctAnswer
            };
        });

        const percentage = Math.round((testResult.score / test.questions.length) * 100);

        res.status(200).json({
            testTitle: test.title,
            score: testResult.score,
            totalQuestions: test.questions.length,
            percentage,
            details: detailedResults,
            completedAt: testResult.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения результата теста' });
    }
};

exports.generateMultipleTests = async (req, res) => {
    try {
        const { difficulty, questionCount } = req.body;
        const userId = req.user._id;

        const text = await parseFile(req.file.path);
        const themes = await splitTextIntoThemes(text);

        if (!themes || themes.length === 0) {
            return res.status(400).json({ message: 'Темы не найдены в файле' });
        }

        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        const fileNameWithoutExtension = path.basename(originalName, path.extname(originalName));

        const testModule = await TestModule.create({
            owner: userId,
            originalFileName: fileNameWithoutExtension,

        });

        const tests = [];
        let week = 1;

        for (const theme of themes) {
            const test = await generateTestFromText(theme.content, userId, originalName, {
                difficulty,
                questionCount,
                testType: "multi"
            });

            test.themeTitle = theme.title;
            test.week = week;
            test.moduleId = testModule._id;

            await test.save();
            tests.push(test);
            week++;
        }

        res.status(200).json({
            message: 'Тесты успешно созданы по темам',
            moduleId: testModule._id,
            testCount: tests.length,
            tests,
        });

    } catch (error) {
        console.error('Ошибка при создании нескольких тестов:', error.message);
        res.status(500).json({ message: 'Ошибка при генерации тестов', error: error.message });
    }
};


exports.getNormalTests = async (req, res) => {
    try {
        const tests = await getNormalTestsByUser(req.user._id);
        res.status(200).json({ tests });
    } catch (err) {
        console.error('Ошибка при получении обычных тестов:', err.message);
        res.status(500).json({ message: 'Ошибка сервера при получении обычных тестов' });
    }
};


exports.getMultiTests = async (req, res) => {
    try {
        const tests = await getMultiTestsByUser(req.user._id);
        res.status(200).json({ tests });
    } catch (err) {
        console.error('Ошибка при получении мульти-тестов:', err.message);
        res.status(500).json({ message: 'Ошибка сервера при получении мульти-тестов' });
    }
};



exports.getTestsByModuleId = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const tests = await getTestsByModuleId(moduleId);
        res.status(200).json({ tests });
    } catch (error) {
        console.error('Ошибка при получении тестов по модулю:', error.message);
        res.status(500).json({ message: 'Ошибка сервера при получении тестов' });
    }
};


exports.getTestModules = async (req, res) => {
    try {
        const modules = await getTestModules(req.user._id);
        res.status(200).json({ modules });
    } catch (err) {
        console.error('Ошибка при получении модулей:', err.message);
        res.status(500).json({ message: 'Ошибка сервера при получении модулей' });
    }
};


exports.getTestByIdController = async (req, res) => {
    try {
        const testId = req.params.id;
        const userId = req.user.id;

        const test = await getTestById(testId, userId);

        res.status(200).json(test);
    } catch (error) {
        console.error('Ошибка получения теста:', error.message);
        res.status(400).json({ error: error.message });
    }
};
