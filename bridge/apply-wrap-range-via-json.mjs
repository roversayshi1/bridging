/**
 * Emit one JSON line per wrap query for agent execute_sql loop.
 * Usage: node bridge/apply-wrap-range-via-json.mjs 3 9
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const from = Number(process.argv[2]);
const to = Number(process.argv[3]);
for (let i = from; i <= to; i++) {
  const p = path.join(dir, `.mcp-query-wrap-${i}.txt`);
  const query = fs.readFileSync(p, 'utf8');
  process.stdout.write(JSON.stringify({ i, bytes: query.length, query }) + '\n');
}
