import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'content/stc-2022-word-only.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const questions = (source.questions || []).map((item) => ({
  topic_code: item.topic_code,
  difficulty: item.difficulty,
  diagram_required: !!item.diagram_required,
  subtopic: item.subtopic || '',
  question_type: item.question_type || 'open',
  tags: item.tags || '',
  prompt: item.prompt,
  model_answer: item.model_answer,
  explanation: item.explanation || '',
}));

const seenTags = new Set();
const duplicates = [];
for (const q of questions) {
  if (seenTags.has(q.tags)) duplicates.push(q.tags);
  seenTags.add(q.tags);
}

const payload = {
  source: source.source,
  notes:
    'STC 2022 word-only questions for production bulk import via Admin Portal (/admin → Tools → Bulk import). Do not include SASS — production already has those.',
  question_count: questions.length,
  questions,
};

const exportDir = path.join(root, 'content/export');
fs.mkdirSync(exportDir, { recursive: true });

const prettyPath = path.join(exportDir, 'stc-2022-production-import.json');
const onelinePath = path.join(exportDir, 'stc-2022-production-import-oneline.json');
const pastePath = path.join(exportDir, 'stc-2022-production-import-paste.txt');

const importBody = { questions };
fs.writeFileSync(prettyPath, JSON.stringify(payload, null, 2) + '\n');
fs.writeFileSync(onelinePath, JSON.stringify(importBody));
fs.writeFileSync(pastePath, JSON.stringify(importBody, null, 2) + '\n');

console.log(
  JSON.stringify(
    {
      questions: questions.length,
      duplicates,
      prettyPath,
      onelinePath,
      pastePath,
      onelineBytes: fs.statSync(onelinePath).size,
    },
    null,
    2
  )
);
