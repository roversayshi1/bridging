/**
 * Print { index, file, query } for one seed batch (stdout JSON).
 * Usage: node bridge/mcp-apply-batch-index.mjs <0-13>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];
if (!Number.isInteger(i) || i < 0 || i > 13) {
  console.error('usage: node mcp-apply-batch-index.mjs <0-13>');
  process.exit(1);
}
const file = files[i];
const query = fs.readFileSync(path.join(dir, file), 'utf8');
process.stdout.write(JSON.stringify({ index: i, file, query }));
