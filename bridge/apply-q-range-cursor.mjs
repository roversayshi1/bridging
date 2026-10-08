/**
 * Print one JSON line per query file for agent CallDynamicTool execute_sql.
 * Usage: node bridge/apply-q-range-cursor.mjs 4 13
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const start = Number(process.argv[2] ?? 3);
const end = Number(process.argv[3] ?? 13);
for (let i = start; i <= end; i++) {
  const n = String(i).padStart(2, '0');
  const p = path.join(dir, `.q-${n}.txt`);
  const query = fs.readFileSync(p, 'utf8');
  console.log(JSON.stringify({ n, bytes: query.length, query }));
}
