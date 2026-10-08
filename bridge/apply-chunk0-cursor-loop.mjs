/**
 * Agent loop for notes-0 b64 chunks (bridge/.cursor-run-*.sql).
 *   node bridge/apply-chunk0-cursor-loop.mjs next
 *   → Read bridge/.mcp-active.sql and CallDynamicTool execute_sql with exact contents
 *   → node bridge/apply-chunk0-cursor-loop.mjs mark <i>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const progressPath = path.join(dir, '.chunk0-mcp-progress.json');
const activePath = path.join(dir, '.mcp-active.sql');
const total = 19;

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
  console.log(JSON.stringify({ marked: i, done: p.done, remaining: total - p.done.length }));
  process.exit(0);
}

if (cmd === 'reset') {
  saveProgress({ done: [] });
  console.log(JSON.stringify({ reset: true }));
  process.exit(0);
}

if (cmd === 'next') {
  const p = loadProgress();
  let i = 0;
  while (i < total && p.done.includes(i)) i++;
  if (i >= total) {
    console.log(JSON.stringify({ complete: true, done: p.done }));
    process.exit(0);
  }
  const query = fs.readFileSync(path.join(dir, `.cursor-run-${i}.sql`), 'utf8');
  fs.writeFileSync(activePath, query, 'utf8');
  console.log(JSON.stringify({ index: i, activePath, bytes: query.length }));
  process.exit(0);
}

console.error('usage: next | mark <index> | reset');
process.exit(1);
