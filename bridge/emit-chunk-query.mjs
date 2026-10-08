/** Print { step, bytes, query } for bridge/.chunk-queries/<step>.sql (stdout for agent MCP). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const step = Number(process.argv[2]);
const p = path.join(dir, '.chunk-queries', `${step}.sql`);
const query = fs.readFileSync(p, 'utf8');
process.stdout.write(JSON.stringify({ step, bytes: query.length, query }));
