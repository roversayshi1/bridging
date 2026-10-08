import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const lines = fs
  .readFileSync(path.join(dir, 'seeds.jsonl'), 'utf8')
  .split('\n')
  .filter(Boolean);
if (!Number.isInteger(i) || i < 0 || i >= lines.length) {
  console.error('usage: node mcp-exec-from-jsonl-index.mjs <0..', lines.length - 1, '>');
  process.exit(1);
}
const { query, file } = JSON.parse(lines[i]);
const out = path.join(dir, '.q');
fs.writeFileSync(out, query, 'utf8');
console.log(JSON.stringify({ i, file, bytes: query.length, out }));
