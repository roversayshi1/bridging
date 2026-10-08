import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const backupPath =
  process.argv[2] ||
  path.join(root, 'content/backups/questions-editor-2026-09-04.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizePrompt(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const backup = loadJson(backupPath);
const existing = new Set(
  (backup.questions || []).map((q) => normalizePrompt(q.prompt))
);

const sources = [
  { file: 'content/stc-2022-word-only.json', label: 'stc-2022' },
  { file: 'content/sass-2022-word-only.json', label: 'sass-2022' },
];

const toImport = [];
const skipped = [];

for (const source of sources) {
  const payload = loadJson(path.join(root, source.file));
  for (const item of payload.questions || []) {
    const key = normalizePrompt(item.prompt);
    if (existing.has(key)) {
      skipped.push({ source: source.label, prompt: item.prompt?.slice(0, 80) });
      continue;
    }
    existing.add(key);
    toImport.push(item);
  }
}

const outPath = path.join(root, 'content/_seed-stc-sass-filtered.json');
fs.writeFileSync(
  outPath,
  JSON.stringify({ questions: toImport }, null, 2) + '\n'
);

const onelinePath = path.join(root, 'content/_seed-stc-sass-oneline.json');
fs.writeFileSync(onelinePath, JSON.stringify({ questions: toImport }));

console.log(
  JSON.stringify({
    backupRows: backup.questions?.length || 0,
    toImport: toImport.length,
    skippedDuplicates: skipped.length,
    outPath,
    onelinePath,
    onelineBytes: fs.statSync(onelinePath).size,
  })
);
