/** Write bridge/.mcp-active-payload.json { query } for batch index (agent → execute_sql). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const p = path.join(dir, `.mcp-query-${i}.sql`);
if (!fs.existsSync(p)) {
  console.error('missing', p);
  process.exit(1);
}
const query = fs.readFileSync(p, 'utf8');
const out = path.join(dir, '.mcp-active-payload.json');
fs.writeFileSync(out, JSON.stringify({ index: i, bytes: query.length, query }));
console.log(JSON.stringify({ index: i, bytes: query.length, file: out }));
