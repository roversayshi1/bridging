/**
 * Apply all bridge/.mcp-query-*.sql files via user-supabase execute_sql.
 *
 * This script is meant to be driven by the Cursor agent: for each index it
 * writes bridge/.mcp-active.sql and prints JSON metadata. The agent should
 * read that file and call execute_sql with its full contents, then run:
 *   node bridge/apply-all-mcp-queries.mjs mark <index>
 *
 * Or set DATABASE_URL / SUPABASE_DB_URL to apply directly with pg (no MCP).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const dir = path.dirname(fileURLToPath(import.meta.url));
const progressPath = path.join(dir, '.seed-mcp-progress.json');
const total = 14;

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
  const i = Array.from({ length: total }, (_, j) => j).find((j) => !p.done.includes(j));
  if (i === undefined) {
    console.log(JSON.stringify({ complete: true, done: p.done }));
    process.exit(0);
  }
  const queryPath = path.join(dir, `.mcp-query-${i}.sql`);
  const query = fs.readFileSync(queryPath, 'utf8');
  const active = path.join(dir, '.mcp-active.sql');
  fs.writeFileSync(active, query, 'utf8');
  const files = [
    '_seed-json-notes-0.sql',
    '_seed-json-notes-1.sql',
    ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
  ];
  console.log(
    JSON.stringify({
      index: i,
      seedFile: files[i],
      activePath: active,
      bytes: query.length,
    }),
  );
  process.exit(0);
}

if (cmd === 'pg') {
  const conn = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
  if (!conn) {
    console.error('Set DATABASE_URL or SUPABASE_DB_URL for pg apply.');
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: conn });
  await client.connect();
  for (let i = 0; i < total; i++) {
    const sql = fs.readFileSync(path.join(dir, `.mcp-query-${i}.sql`), 'utf8');
    await client.query(sql);
    console.log('applied', i);
  }
  await client.end();
  saveProgress({ done: Array.from({ length: total }, (_, j) => j) });
  process.exit(0);
}

console.error('usage: next | mark <index> | pg');
process.exit(1);
