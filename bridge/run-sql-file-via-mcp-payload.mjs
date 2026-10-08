/** Prepare .mcp-active-payload.json from a SQL file path (argv[2]). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const rel = process.argv[2];
if (!rel) {
  console.error('usage: node run-sql-file-via-mcp-payload.mjs <path-to-sql>');
  process.exit(1);
}
const src = path.isAbsolute(rel) ? rel : path.join(dir, '..', rel);
const query = fs.readFileSync(src, 'utf8');
const out = path.join(dir, '.mcp-active-payload.json');
fs.writeFileSync(out, JSON.stringify({ file: rel, bytes: query.length, query }));
console.log(JSON.stringify({ file: rel, bytes: query.length }));
