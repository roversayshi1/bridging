import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const from = Number(process.argv[2]);
const to = Number(process.argv[3]);
const parts = [];
for (let i = from; i <= to; i++) {
  parts.push(fs.readFileSync(path.join(dir, `.mcp-b64-chunk-${String(i).padStart(2, '0')}.sql`), 'utf8').trim());
}
const query = parts.join('\n');
const out = path.join(dir, '.mcp-active-payload.json');
fs.writeFileSync(out, JSON.stringify({ from, to, bytes: query.length, query }));
console.log(JSON.stringify({ from, to, bytes: query.length, statements: parts.length }));
