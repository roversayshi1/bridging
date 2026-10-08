/**
 * For each part in manifest: write .mcp-one-query.txt (for Cursor execute_sql).
 * Usage: node bridge/apply-all-parts-loop.mjs <index>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const manifest = JSON.parse(
  fs.readFileSync(path.join(dir, '.mcp-parts-manifest.json'), 'utf8'),
).manifest;
if (!Number.isInteger(i) || i < 0 || i >= manifest.length) {
  console.error('usage: node bridge/apply-all-parts-loop.mjs <0..n-1>');
  process.exit(1);
}
const rel = manifest[i];
const query = fs.readFileSync(path.join(dir, '..', rel), 'utf8');
fs.writeFileSync(path.join(dir, '.mcp-one-query.txt'), query);
console.log(JSON.stringify({ i, file: rel, len: query.length }));
