/** Prepare execute_sql payload for bridge/.mcp-b64-chunk-NN.sql */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const p = path.join(dir, `.mcp-b64-chunk-${String(i).padStart(2, '0')}.sql`);
const query = fs.readFileSync(p, 'utf8');
const out = path.join(dir, '.mcp-active-payload.json');
fs.writeFileSync(out, JSON.stringify({ index: i, bytes: query.length, query }));
console.log(JSON.stringify({ index: i, bytes: query.length }));
