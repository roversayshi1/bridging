/**
 * Emit SQL INSERT ... ON CONFLICT for seed JSON (run via Supabase SQL editor or MCP execute_sql).
 * Usage: node bridge/generate-supabase-seed-sql.mjs topics | head
 */
import fs from 'node:fs';
import path from 'node:path';

const seedDir = path.join(path.resolve(import.meta.dirname, '..'), 'content/export/supabase-seed');
const table = process.argv[2] ?? 'topics';

function sqlStr(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(seedDir, name), 'utf8'));
}

const rows =
  table === 'topics'
    ? load('topics.json')
    : table === 'legacy'
      ? load('legacy-users.json')
      : null;

if (!rows) {
  console.error('Supported: topics, legacy');
  process.exit(1);
}

if (table === 'topics') {
  for (const r of rows) {
    console.log(
      `INSERT INTO bridging.topics (id, code, name, category, description, question_count, created_at, updated_at) VALUES (${sqlStr(r.id)}::uuid, ${sqlStr(r.code)}, ${sqlStr(r.name)}, ${sqlStr(r.category)}, ${sqlStr(r.description)}, ${r.question_count ?? 0}, ${sqlStr(r.createdAt)}::timestamptz, ${sqlStr(r.updatedAt)}::timestamptz) ON CONFLICT (id) DO UPDATE SET code=EXCLUDED.code, name=EXCLUDED.name, category=EXCLUDED.category, description=EXCLUDED.description, question_count=EXCLUDED.question_count, updated_at=EXCLUDED.updated_at;`
    );
  }
}

if (table === 'legacy') {
  for (const r of rows) {
    console.log(
      `INSERT INTO bridging.legacy_users (email, display_name, weweb_user_id, weweb_created_at, source) VALUES (${sqlStr(r.email)}, ${sqlStr(r.display_name)}, ${sqlStr(r.user_id)}::uuid, ${sqlStr(r.createdAt)}::timestamptz, 'weweb') ON CONFLICT (email, source) DO UPDATE SET display_name=EXCLUDED.display_name, weweb_user_id=EXCLUDED.weweb_user_id, weweb_created_at=EXCLUDED.weweb_created_at;`
    );
  }
}
