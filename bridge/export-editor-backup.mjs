import fs from 'node:fs';
import path from 'node:path';

const agentDir =
  'C:/Users/rover/.cursor/projects/c-Users-rover-Projects-emath-marker/agent-tools';
const batch0 = JSON.parse(
  fs.readFileSync(path.join(agentDir, 'fec9fc78-cede-426a-983a-163a14fca260.txt'), 'utf8')
);

// batch1 passed inline from MCP — caller merges before run if needed
const batch1Path = process.argv[2];
const batch1 = batch1Path ? JSON.parse(fs.readFileSync(batch1Path, 'utf8')) : [];

const rows = [...batch0, ...batch1];
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
