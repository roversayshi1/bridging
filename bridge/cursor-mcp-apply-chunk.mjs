/**
 * Prepare one chunk for Cursor user-supabase execute_sql.
 * Usage: node bridge/cursor-mcp-apply-chunk.mjs <0-18>
 * Writes bridge/.mcp-active-payload.json and prints { index, bytes, sha256 }.
 * Agent: CallDynamicTool execute_sql with JSON.parse(fs.readFileSync('.mcp-active-payload.json')).query
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const p = path.join(dir, `.cursor-run-${i}.sql`);
const query = fs.readFileSync(p, 'utf8');
const out = path.join(dir, '.mcp-active-payload.json');
fs.writeFileSync(out, JSON.stringify({ index: i, bytes: query.length, query }));
const sha256 = crypto.createHash('sha256').update(query).digest('hex');
console.log(JSON.stringify({ index: i, bytes: query.length, sha256, payload: out }));
