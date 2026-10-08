/** Print SQL from bridge/.chunk-out-<step>.sql for agent execute_sql */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const s = process.argv[2];
const p = path.join(dir, `.chunk-out-${s}.sql`);
process.stdout.write(fs.readFileSync(p, 'utf8'));
