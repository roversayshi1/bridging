/**
 * Print one JSON object per line: { step, query } for agent execute_sql loop.
 * Usage: node bridge/apply-steps-via-mcp-loop.mjs 4 11
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const from = Number(process.argv[2]);
const to = Number(process.argv[3]);
for (let i = from; i <= to; i++) {
  const stepFile = `bridge/.step-${String(i).padStart(2, '0')}.sql`;
  const wrapPath = path.join(dir, `.mcp-b64-wrap-.step-${String(i).padStart(2, '0')}.sql`);
  if (!fs.existsSync(wrapPath)) {
    console.error('missing wrap for step', i, '- run wrap-sql-as-b64-exec first');
    process.exit(1);
  }
  const query = fs.readFileSync(wrapPath, 'utf8');
  console.log(JSON.stringify({ step: i, stepFile, bytes: query.length, query }));
}
