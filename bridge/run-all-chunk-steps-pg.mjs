/**
 * Apply bridge/.all-chunk-steps.jsonl using pg (no MCP).
 * Set DATABASE_URL or SUPABASE_DB_URL, or create bridge/.db-url with the connection string.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const dir = path.dirname(fileURLToPath(import.meta.url));
const urlPath = path.join(dir, '.db-url');
const conn =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DB_URL ??
  (fs.existsSync(urlPath) ? fs.readFileSync(urlPath, 'utf8').trim() : null);

if (!conn) {
  console.error('Set DATABASE_URL / SUPABASE_DB_URL or bridge/.db-url');
  process.exit(1);
}

const jsonl = path.join(dir, '.all-chunk-steps.jsonl');
if (!fs.existsSync(jsonl)) {
  console.error('Missing', jsonl, '— run: node bridge/apply-all-chunked-seeds.mjs');
  process.exit(1);
}

const lines = fs.readFileSync(jsonl, 'utf8').trim().split('\n').filter(Boolean);
const client = new pg.Client({ connectionString: conn });
await client.connect();

for (let n = 0; n < lines.length; n++) {
  const { step, index, file, query } = JSON.parse(lines[n]);
  await client.query(query);
  if (n % 10 === 0 || step === 'apply') {
    console.log('step', n + 1, '/', lines.length, step, file ?? '', index ?? '');
  }
}

const counts = await client.query(`
SELECT 'topics' AS tbl, count(*)::bigint AS n FROM bridging.topics
UNION ALL SELECT 'notes', count(*)::bigint FROM bridging.notes
UNION ALL SELECT 'questions', count(*)::bigint FROM bridging.questions
UNION ALL SELECT 'legacy_users', count(*)::bigint FROM bridging.legacy_users
ORDER BY tbl`);
console.log(JSON.stringify(counts.rows, null, 2));
await client.end();
