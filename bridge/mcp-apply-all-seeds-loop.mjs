/**
 * Apply all bridge/_seed-json-*.sql via Supabase MCP execute_sql using Cursor agent
 * dynamic tools. Emits one JSON line per batch for the harness to forward to
 * user-supabase/execute_sql (query field).
 *
 * Usage (agent): node bridge/mcp-apply-all-seeds-loop.mjs emit
 * After each successful MCP apply: node bridge/mcp-apply-all-seeds-loop.mjs mark <i>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const progressPath = path.join(dir, '.seed-mcp-progress.json');
const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];

function loadProgress() {
  if (!fs.existsSync(progressPath)) return { done: [] };
  return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
}

function saveProgress(p) {
  fs.writeFileSync(progressPath, JSON.stringify(p, null, 2), 'utf8');
}

const cmd = process.argv[2];

if (cmd === 'mark') {
  const i = Number(process.argv[3]);
  const p = loadProgress();
  if (!p.done.includes(i)) p.done.push(i);
  p.done.sort((a, b) => a - b);
  saveProgress(p);
  console.log(JSON.stringify({ marked: i, done: p.done }));
  process.exit(0);
}

if (cmd === 'emit') {
  const p = loadProgress();
  const i = files.findIndex((_, idx) => !p.done.includes(idx));
  if (i < 0) {
    console.log(JSON.stringify({ complete: true, done: p.done }));
    process.exit(0);
  }
  const query = fs.readFileSync(path.join(dir, files[i]), 'utf8');
  const out = path.join(dir, '.mcp-batch-payload.json');
  fs.writeFileSync(out, JSON.stringify({ query }), 'utf8');
  console.log(
    JSON.stringify({
      index: i,
      file: files[i],
      bytes: query.length,
      payloadPath: out,
    }),
  );
  process.exit(0);
}

console.error('usage: emit | mark <index>');
process.exit(1);
