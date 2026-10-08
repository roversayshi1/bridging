/**
 * Apply bridge/_seed-json-*.sql using Supabase Management API / direct Postgres.
 * Requires DATABASE_URL (Supabase connection string with service role) in env.
 */
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const dir = path.resolve(import.meta.dirname);
const conn = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;

if (!conn) {
  console.error('Set DATABASE_URL (Supabase → Settings → Database → connection string, service role).');
  console.error('Alternatively run each bridge/_seed-json-*.sql in Supabase SQL editor.');
  process.exit(1);
}

const files = fs
  .readdirSync(dir)
  .filter((f) => f.startsWith('_seed-json-') && f.endsWith('.sql'))
  .sort();

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
await client.connect();

for (const file of files) {
  const sql = fs.readFileSync(path.join(dir, file), 'utf8');
  await client.query(sql);
  console.log('applied', file);
}

await client.end();
console.log('done', files.length, 'files');
