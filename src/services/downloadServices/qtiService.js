const fs = require('fs');
const path = require('path');

function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function generateQtiFromTest(test, fileName) {
    const items = test.questions.map((q, i) => {
        const choices = q.options.map((opt, j) => {
            const id = `choice${String.fromCharCode(65 + j)}`;
            return `<simpleChoice identifier="${id}">${escapeXml(opt)}</simpleChoice>`;
        }).join('\n');

        // q.correctAnswer как индекс (число)
        const correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : Number(q.correctAnswer);
        const correctId = `choice${String.fromCharCode(65 + correctIndex)}`;

        return `
<assessmentItem identifier="q${i + 1}" title="Q${i + 1}" timeDependent="false">
  <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier">
    <correctResponse>
      <value>${correctId}</value>
    </correctResponse>
  </responseDeclaration>
  <itemBody>
    <choiceInteraction responseIdentifier="RESPONSE" shuffle="true" maxChoices="1">
      <prompt>${escapeXml(q.question)}</prompt>
      ${choices}
    </choiceInteraction>
  </itemBody>
</assessmentItem>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest title="${escapeXml(test.title)}">
  ${items}
</assessmentTest>`;

    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

    const filePath = path.join(downloadsDir, fileName);
    fs.writeFileSync(filePath, xml, 'utf-8');

    return filePath;
}

module.exports = { generateQtiFromTest };
