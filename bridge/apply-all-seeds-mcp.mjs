/**
 * Apply all _seed-json-*.sql via user-supabase execute_sql (Cursor MCP).
 * Run from repo root: node bridge/apply-all-seeds-mcp.mjs
 *
 * Requires Cursor Agent with user-supabase MCP connected. This script prints
 * one JSON line per file: {"i":0,"file":"...","query":"<full sql>"}
 * Pipe to your MCP runner or apply manually from the printed payloads.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = fs
  .readdirSync(dir)
  .filter((f) => f.startsWith('_seed-json-') && f.endsWith('.sql'))
  .sort((a, b) => {
    const an = a.includes('notes') ? 0 : 1;
    const bn = b.includes('notes') ? 0 : 1;
    if (an !== bn) return an - bn;
    return (
      parseInt(a.match(/-(\d+)\.sql$/)[1], 10) -
      parseInt(b.match(/-(\d+)\.sql$/)[1], 10)
    );
  });

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const query = fs.readFileSync(path.join(dir, file), 'utf8');
  process.stdout.write(JSON.stringify({ i, file, query }) + '\n');
}
