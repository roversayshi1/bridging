import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const src = path.join(dir, `.mcp-query-${i}.sql`);
const dst = path.join(dir, '.current-seed.sql');
fs.copyFileSync(src, dst);
console.log(JSON.stringify({ index: i, bytes: fs.statSync(dst).size, path: dst }));
