import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(dir, '_seed-json-notes-0.sql'), 'utf8');
const b64 = Buffer.from(sql, 'utf8').toString('base64');
const chunkSize = 2800;
const chunks = [];
for (let o = 0; o < b64.length; o += chunkSize) {
  chunks.push(b64.slice(o, o + chunkSize));
}
const queries = chunks.map((chunk, seq) => {
  const esc = chunk.replace(/'/g, "''");
  return `INSERT INTO bridging._seed_b64 (seq, data) VALUES (${seq}, '${esc}');`;
});
queries.forEach((q, i) => {
  fs.writeFileSync(path.join(dir, `.chunk0-small-${String(i).padStart(2, '0')}.txt`), q);
});
console.log(
  JSON.stringify({
    chunks: chunks.length,
    min: Math.min(...queries.map((q) => q.length)),
    max: Math.max(...queries.map((q) => q.length)),
  }),
);
