import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const CHUNK = 1800;

function sqlForSeedInsert(seq, data) {
  const stmts = [];
  const parts = [];
  for (let i = 0; i < data.length; i += CHUNK) parts.push(data.slice(i, i + CHUNK));
  const esc = (s) => s.replace(/'/g, "''");
  stmts.push(
    `INSERT INTO bridging._seed_b64 (seq, data) VALUES (${seq}, '${esc(parts[0])}') ON CONFLICT (seq) DO UPDATE SET data = EXCLUDED.data;`
  );
  for (let i = 1; i < parts.length; i++) {
    stmts.push(
      `UPDATE bridging._seed_b64 SET data = data || '${esc(parts[i])}' WHERE seq = ${seq};`
    );
  }
  return stmts;
}

function parseQFile(file) {
  const sql = fs.readFileSync(file, 'utf8').trim();
  const m = sql.match(
    /^INSERT INTO bridging\._seed_b64 \(seq, data\) VALUES \((\d+), '([\s\S]*)'\);$/
  );
  if (!m) throw new Error('not a seed b64 insert: ' + file);
  return { seq: Number(m[1]), data: m[2] };
}

const out = [];
for (let n = 2; n <= 10; n++) {
  const file = path.join(dir, `.q-${n}.sql`);
  const { seq, data } = parseQFile(file);
  for (const s of sqlForSeedInsert(seq, data)) {
    out.push({ file: `.q-${n}.sql`, seq, sql: s });
  }
}
const outPath = path.join(dir, '.split-seed-stmts.json');
fs.writeFileSync(outPath, JSON.stringify(out));
console.log('wrote', out.length, 'statements to', outPath);
