/**
 * Apply all bridge/_seed-json-*.sql via Postgres (pg).
 * Set DATABASE_URL or SUPABASE_DB_URL (Supabase → Database → connection string).
 */
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const conn = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;

if (!conn) {
  console.error('Set DATABASE_URL or SUPABASE_DB_URL.');
  process.exit(1);
}

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

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
await client.connect();

for (const file of files) {
  const sql = fs.readFileSync(path.join(dir, file), 'utf8');
  await client.query(sql);
  console.log('applied', file);
}

await client.end();
console.log('done', files.length);
