/**
 * Print one line: path to SQL file for MCP execute_sql (agent reads file → full query).
 * Usage: node bridge/mcp-apply-batch.mjs <0-13>
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
if (!Number.isInteger(i) || i < 0 || i >= files.length) {
  console.error('usage: node bridge/mcp-apply-batch.mjs <0-13>');
  process.exit(1);
}
const sqlPath = path.join(dir, files[i]);
console.log(JSON.stringify({ index: i, file: files[i], sqlPath, bytes: fs.statSync(sqlPath).size }));
