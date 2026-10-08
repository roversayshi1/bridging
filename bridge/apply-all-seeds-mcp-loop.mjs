/**
 * Apply all 14 seed batches via Supabase MCP execute_sql.
 * Requires Cursor agent: reads each _seed-json-*.sql and invokes MCP.
 *
 * This script cannot call MCP from plain Node (no OAuth in shell).
 * It writes bridge/.mcp-active.sql and prints the batch index for the agent.
 *
 * Agent loop:
 *   node bridge/apply-all-seeds-mcp-loop.mjs next
 *   → CallDynamicTool user-supabase execute_sql with query = fs.readFileSync('.mcp-active.sql')
 *   → node bridge/apply-all-seeds-mcp-loop.mjs mark <i>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const progressPath = path.join(dir, '.seed-mcp-progress.json');
const activePath = path.join(dir, '.mcp-active.sql');

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

if (cmd === 'next') {
  const p = loadProgress();
  const i = files.findIndex((_, idx) => !p.done.includes(idx));
  if (i < 0) {
    console.log(JSON.stringify({ complete: true, done: p.done }));
    process.exit(0);
  }
  const query = fs.readFileSync(path.join(dir, files[i]), 'utf8');
  fs.writeFileSync(activePath, query, 'utf8');
  console.log(
    JSON.stringify({
      index: i,
      file: files[i],
      activePath,
      bytes: query.length,
    }),
  );
  process.exit(0);
}

console.error('usage: next | mark <index>');
process.exit(1);
