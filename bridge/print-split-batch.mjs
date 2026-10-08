import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const q = fs.readFileSync(
  path.join(dir, `.split-batch-${String(i).padStart(2, '0')}.sql`),
  'utf8'
);
process.stdout.write(JSON.stringify({ query: q }));
