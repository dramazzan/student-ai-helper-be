const { generateTestFromText, splitTextIntoThemes, generateSummaryFromText } = require('../../services/testService/geminiService');
const Test = require('../../models/Test');
const TestModule = require('../../models/TestModule');
const path = require('path');
const { parseFile } = require('../../utils/fileParser');


exports.generateTest = async (req, res) => {
    try {
        const { difficulty, questionCount, userPrompt } = req.body;

        let text = null;
        let originalName = 'generated-from-prompt';

        if (req.file) {
            try {
                text = await parseFile(req.file.path);
                originalName = req.file.originalname;
            } catch (err) {
                console.error('Ошибка чтения файла:', err.message);
                return res
                    .status(400)
                    .json({ message: 'Ошибка при обработке файла. Попробуйте другой.' });
            }
        }

        if (!text && !userPrompt) {
            return res
                .status(400)
                .json({ message: 'Нужно передать файл или промпт для генерации теста' });
        }

        const test = await generateTestFromText(
            text,
            req.user._id,
            originalName,
            { difficulty, questionCount },
            userPrompt
        );

        if (!test) {
            return res.status(500).json({ message: 'Ошибка при генерации теста' });
        }

        if (text) {
            const summary = await generateSummaryFromText(text, req.user._id, originalName);
            test.summary = summary;
        }

        await test.save();

        res.status(200).json({ test });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка генерации теста' });
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

            const summary = await generateSummaryFromText(text, userId, req.file.originalname);
            test.summary = summary;
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
