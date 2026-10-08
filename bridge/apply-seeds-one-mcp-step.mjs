/**
 * Emit one seed batch SQL path for the agent to pass to user-supabase execute_sql.
 * Marks batches done in bridge/.seed-mcp-progress.json after agent confirms apply.
 *
 * Usage:
 *   node bridge/apply-seeds-one-mcp-step.mjs status
 *   node bridge/apply-seeds-one-mcp-step.mjs next
 *   node bridge/apply-seeds-one-mcp-step.mjs mark <index>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const progressPath = path.join(dir, '.seed-mcp-progress.json');

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

function loadProgress() {
  if (!fs.existsSync(progressPath)) return { done: [] };
  return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
}

function saveProgress(p) {
  fs.writeFileSync(progressPath, JSON.stringify(p, null, 2), 'utf8');
}

const cmd = process.argv[2];

if (cmd === 'status') {
  const p = loadProgress();
  console.log(JSON.stringify({ total: files.length, done: p.done, files }));
  process.exit(0);
}

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
    console.log(JSON.stringify({ complete: true, total: files.length }));
    process.exit(0);
  }
  const file = files[i];
  const queryPath = path.join(dir, `.mcp-query-${i}.sql`);
  const query = fs.readFileSync(queryPath, 'utf8');
  const out = path.join(dir, '.mcp-next-query.sql');
  fs.writeFileSync(out, query, 'utf8');
  console.log(
    JSON.stringify({
      index: i,
      file,
      queryPath: out,
      bytes: query.length,
    }),
  );
  process.exit(0);
}

console.error('usage: status | next | mark <index>');
process.exit(1);
