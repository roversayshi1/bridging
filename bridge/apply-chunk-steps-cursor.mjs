/**
 * Emit JSON lines {step, query} for chunk steps in range (for agent execute_sql loop).
 * Usage: node bridge/apply-chunk-steps-cursor.mjs <from> <to>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const from = Number(process.argv[2]);
const to = Number(process.argv[3]);
const lines = fs.readFileSync(path.join(dir, '.all-chunk-steps.jsonl'), 'utf8').trim().split('\n');
for (let s = from; s <= to; s++) {
  const row = JSON.parse(lines[s]);
  process.stdout.write(JSON.stringify({ step: s, query: row.query }) + '\n');
}
