/** Write bridge/.mcp-active-payload.json for one line of bridge/.chunk0-lines.jsonl */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const idx = Number(process.argv[2]);
const lines = fs.readFileSync(path.join(dir, '.chunk0-lines.jsonl'), 'utf8').trim().split('\n');
const o = JSON.parse(lines[idx]);
const out = path.join(dir, '.mcp-active-payload.json');
fs.writeFileSync(out, JSON.stringify({ step: o.step, index: idx, query: o.query }));
console.log(JSON.stringify({ index: idx, step: o.step, bytes: o.query.length }));
