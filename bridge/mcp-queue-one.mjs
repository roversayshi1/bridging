/** Emit one line from bridge/.chunk0-mcp-queue.jsonl as raw SQL on stdout. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const idx = Number(process.argv[2]);
const lines = fs.readFileSync(path.join(dir, '.chunk0-mcp-queue.jsonl'), 'utf8').trim().split('\n');
const o = JSON.parse(lines[idx]);
fs.writeFileSync(path.join(dir, '.mcp-active-payload.json'), JSON.stringify({ file: o.file, query: o.query }));
process.stdout.write(o.query);
