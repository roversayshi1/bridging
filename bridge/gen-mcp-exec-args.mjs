import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];

for (let i = 0; i < files.length; i++) {
  const query = fs.readFileSync(path.join(dir, files[i]), 'utf8');
  const out = path.join(dir, `.mcp-exec-${i}.json`);
  fs.writeFileSync(
    out,
    JSON.stringify({ file: files[i], index: i, query }),
    'utf8',
  );
  console.log(i, files[i], query.length);
}
