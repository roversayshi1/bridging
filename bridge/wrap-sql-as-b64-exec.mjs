/** Wrap a SQL file as SELECT bridging._exec_sql(decode(...)). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const rel = process.argv[2];
const src = path.isAbsolute(rel) ? rel : path.join(dir, '..', rel);
const inner = fs.readFileSync(src, 'utf8');
const b64 = Buffer.from(inner, 'utf8').toString('base64');
const wrapped = `SELECT bridging._exec_sql(convert_from(decode('${b64}', 'base64'), 'UTF8'));`;
const base = path.basename(rel, '.sql');
const out = path.join(dir, `.mcp-b64-wrap-${base}.sql`);
fs.writeFileSync(out, wrapped);
const payload = path.join(dir, '.mcp-active-payload.json');
fs.writeFileSync(payload, JSON.stringify({ file: out, bytes: wrapped.length, query: wrapped }));
console.log(JSON.stringify({ innerBytes: inner.length, wrappedBytes: wrapped.length, out }));
