const fs = require('fs');
const path = require('path');

function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function generateMoodleXmlFromTest(test, fileName) {
    const questions = test.questions.map((q) => {
        const answers = q.options.map((opt) => {
            const fraction = opt === q.correctAnswer ? '100' : '0';
            return `
<answer fraction="${fraction}" format="html">
  <text>${escapeXml(opt)}</text>
</answer>`;
        }).join('\n');

        return `
<question type="multichoice">
  <name><text>${escapeXml(q.question)}</text></name>
  <questiontext format="html">
    <text><![CDATA[${q.question}]]></text>
  </questiontext>
  <shuffleanswers>true</shuffleanswers>
  <answernumbering>abc</answernumbering>
  ${answers}
</question>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  ${questions}
</quiz>`;

    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

    const filePath = path.join(downloadsDir, fileName);
    fs.writeFileSync(filePath, xml, 'utf-8');

    return filePath;
}

module.exports = { generateMoodleXmlFromTest };
