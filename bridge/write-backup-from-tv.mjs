import fs from 'node:fs';
import path from 'node:path';

const agentFile =
  process.argv[2] ||
  'C:/Users/rover/.cursor/projects/c-Users-rover-Projects-emath-marker/agent-tools/509234b7-1320-4a4d-a94b-b37c064dd6f0.txt';

const raw = JSON.parse(fs.readFileSync(agentFile, 'utf8'));
const rows = Array.isArray(raw) ? raw : raw.data || [];
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
