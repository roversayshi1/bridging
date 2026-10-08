import fs from 'node:fs';
import path from 'node:path';

const agentDir =
  'C:/Users/rover/.cursor/projects/c-Users-rover-Projects-emath-marker/agent-tools';

function loadRows(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  return [];
}

const batch0 = loadRows(
  process.argv[2] || path.join(agentDir, 'be30beba-dfe6-4e8f-b4b7-90a13c9579f8.txt')
);
const batch1 = loadRows(
  process.argv[3] || path.join(agentDir, 'questions-editor-offset-100.json')
);
const merged = [...batch0, ...batch1];
const seen = new Set();
const rows = merged.filter((row) => {
  if (!row?.id || seen.has(row.id)) return false;
  seen.add(row.id);
  return true;
});

const outDir = 'content/backups';
fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const outPath = path.join(outDir, `questions-editor-${stamp}.json`);

const payload = {
  exportedAt: new Date().toISOString(),
  environment: 'editor',
  projectId: 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0',
  total: rows.length,
  questions: rows,
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
console.log('Wrote', outPath, 'rows', rows.length);
