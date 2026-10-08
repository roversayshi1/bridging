import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
for (let i = 2; i <= 9; i++) {
  const p = path.join(dir, `.notes1-step-${String(i).padStart(2, '0')}-insert.sql`);
  const q = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(path.join(dir, `.notes1-payload-${i}.json`), JSON.stringify({ query: q }));
  console.log(i, q.length);
}
fs.writeFileSync(
  path.join(dir, '.notes1-payload-apply.json'),
  JSON.stringify({ query: fs.readFileSync(path.join(dir, '.notes1-step-10-apply.sql'), 'utf8') }),
);
