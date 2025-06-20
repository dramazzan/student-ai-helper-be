const { parsePDF, parseDocx } = require('../utils/fileParser');
const { generateTestFromText, splitTextIntoThemes } = require('../services/geminiService');
const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const TestModule = require('../models/TestModule');
const path = require('path');

exports.generateTest = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не найден' });
        }

        const ext = path.extname(req.file.originalname).toLowerCase();

        let text;
        try {
            if (ext === '.pdf') {
                text = await parsePDF(req.file.path);
            } else if (ext === '.docx') {
                text = await parseDocx(req.file.path);
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

        const text = await parsePDF(req.file.path);
        const themes = await splitTextIntoThemes(text);

        // Создаём модуль для группировки всех тем
        const testModule = await TestModule.create({
            owner: userId,
            originalFileName: req.file.originalname,
        });

        const tests = [];

        let week = 1;
        for (const theme of themes) {
            const test = await generateTestFromText(theme.content, userId, req.file.originalname, {
                difficulty,
                questionCount,
            });

            test.themeTitle = theme.title;
            test.week = week;
            test.moduleId = testModule._id;

            await test.save();
            tests.push(test);
            week++;
        }

        res.status(200).json({
            message: 'Тесты по темам успешно созданы',
            moduleId: testModule._id,
            tests,
        });
    } catch (error) {
        console.error('Ошибка при создании нескольких тестов:', error);
        res.status(500).json({ message: 'Ошибка при генерации тестов' });
    }
};

