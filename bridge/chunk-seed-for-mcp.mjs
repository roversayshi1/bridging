/**
 * Emit small execute_sql statements to load one seed file via bridging._seed_b64 chunks.
 * Usage: node bridge/chunk-seed-for-mcp.mjs <0-13>
 * Prints JSON lines: { "step": "ddl"|"clear"|"insert"|"apply"|"cleanup", "query": "..." }
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];
if (!Number.isInteger(i) || i < 0 || i >= files.length) {
  console.error('usage: node bridge/chunk-seed-for-mcp.mjs <0-13>');
  process.exit(1);
}

const sql = fs.readFileSync(path.join(dir, files[i]), 'utf8');
const b64 = Buffer.from(sql, 'utf8').toString('base64');
const chunkSize = 6000;
const chunks = [];
for (let o = 0; o < b64.length; o += chunkSize) {
  chunks.push(b64.slice(o, o + chunkSize));
}

const emit = (step, query) => console.log(JSON.stringify({ step, file: files[i], index: i, query }));

emit(
  'ddl',
  `CREATE TABLE IF NOT EXISTS bridging._seed_b64 (seq int PRIMARY KEY, data text NOT NULL);
CREATE OR REPLACE FUNCTION bridging._apply_b64_seed() RETURNS void LANGUAGE plpgsql AS $$
DECLARE s text;
BEGIN
  SELECT string_agg(data, '' ORDER BY seq) INTO s FROM bridging._seed_b64;
  IF s IS NULL OR s = '' THEN
    RAISE EXCEPTION 'no seed chunks loaded';
  END IF;
  EXECUTE convert_from(decode(s, 'base64'), 'UTF8');
END;
$$;`,
);

emit('clear', 'TRUNCATE bridging._seed_b64;');

for (let seq = 0; seq < chunks.length; seq++) {
  const esc = chunks[seq].replace(/'/g, "''");
  emit('insert', `INSERT INTO bridging._seed_b64 (seq, data) VALUES (${seq}, '${esc}');`);
}

emit('apply', 'SELECT bridging._apply_b64_seed();');
emit('cleanup', 'TRUNCATE bridging._seed_b64;');
