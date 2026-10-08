/** Write bridge/.step-query.sql from bridge/.all-chunk-steps.jsonl line (1-based). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const lineNo = Number(process.argv[2]);
const rows = fs.readFileSync(path.join(dir, '.all-chunk-steps.jsonl'), 'utf8').trim().split('\n');
if (!Number.isInteger(lineNo) || lineNo < 1 || lineNo > rows.length) {
  console.error('usage: line 1..', rows.length);
  process.exit(1);
}
const { step, query } = JSON.parse(rows[lineNo - 1]);
const out = path.join(dir, '.step-query.sql');
fs.writeFileSync(out, query);
console.log(JSON.stringify({ lineNo, step, bytes: query.length, file: out }));
