/**
 * Read a SQL file path (repo-relative) and write bridge/.mcp-active-payload.json.
 * Usage: node bridge/mcp-exec-batch-file.mjs bridge/.mcp-batch-0-2.sql
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const rel = process.argv[2];
const src = path.isAbsolute(rel) ? rel : path.join(dir, '..', rel);
const query = fs.readFileSync(src, 'utf8');
const out = path.join(dir, '.mcp-active-payload.json');
fs.writeFileSync(out, JSON.stringify({ file: rel, bytes: query.length, query }));
console.log(JSON.stringify({ file: rel, bytes: query.length, out }));
