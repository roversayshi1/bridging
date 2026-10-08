import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];
const i = Number(process.argv[2]);
if (!Number.isInteger(i) || i < 0 || i >= files.length) {
  console.error('usage: node bridge/load-seed-query.mjs <0-13>');
  process.exit(1);
}
const file = files[i];
const query = fs.readFileSync(path.join(dir, file), 'utf8');
const out = path.join(dir, '.current-seed-query.sql');
fs.writeFileSync(out, query, 'utf8');
process.stdout.write(JSON.stringify({ index: i, file, bytes: query.length, out }));
