/** Print one execute_sql query from bridge/.all-chunk-steps.jsonl by step index (0-based). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const step = Number(process.argv[2]);
const lines = fs.readFileSync(path.join(dir, '.all-chunk-steps.jsonl'), 'utf8').trim().split('\n');
if (!Number.isInteger(step) || step < 0 || step >= lines.length) {
  console.error('usage: node bridge/run-chunk-mcp-step.mjs <0-' + (lines.length - 1) + '>');
  process.exit(1);
}
const { query } = JSON.parse(lines[step]);
process.stdout.write(query);
