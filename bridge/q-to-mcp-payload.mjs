/** Write bridge/.mcp-active-payload.json { file, query } from bridge/.q-<n>.sql */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const n = process.argv[2];
const src = path.join(dir, `.q-${n}.sql`);
if (!fs.existsSync(src)) {
  console.error('missing', src);
  process.exit(1);
}
const query = fs.readFileSync(src, 'utf8');
const out = path.join(dir, '.mcp-active-payload.json');
fs.writeFileSync(out, JSON.stringify({ file: `.q-${n}.sql`, bytes: query.length, query }));
console.log(JSON.stringify({ file: `.q-${n}.sql`, bytes: query.length }));
