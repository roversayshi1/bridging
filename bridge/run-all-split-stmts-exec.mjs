/**
 * Prints one JSON line per split statement for external MCP execute_sql driver.
 * Usage: node bridge/run-all-split-stmts-exec.mjs | while read line; do ... done
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const stmts = JSON.parse(fs.readFileSync(path.join(dir, '.split-seed-stmts.json'), 'utf8'));
const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? stmts.length);
for (let i = start; i < end; i++) {
  const { file, seq, sql } = stmts[i];
  process.stdout.write(JSON.stringify({ i, file, seq, query: sql }) + '\n');
}
