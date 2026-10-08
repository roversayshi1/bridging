import fs from 'node:fs';

const steps = [7, 8, 9, 10, 11];
const esc = (s) => s.replace(/'/g, "''");
const CHUNK = 2800;
const manifest = [];

for (const step of steps) {
  const f = `bridge/.step-${String(step).padStart(2, '0')}.sql`;
  const sql = fs.readFileSync(f, 'utf8').trim();
  const m = /^INSERT INTO bridging\._seed_b64 \(seq, data\) VALUES \((\d+), '(.+)'\);$/s.exec(sql);
  if (!m) throw new Error(`bad ${f}`);
  const seq = m[1];
  const data = m[2];
  const queries = [];
  if (data.length <= CHUNK) queries.push(sql);
  else {
    queries.push(
      `INSERT INTO bridging._seed_b64 (seq, data) VALUES (${seq}, '${esc(data.slice(0, CHUNK))}');`,
    );
    for (let i = CHUNK; i < data.length; i += CHUNK) {
      queries.push(
        `UPDATE bridging._seed_b64 SET data = data || '${esc(data.slice(i, i + CHUNK))}' WHERE seq = ${seq};`,
      );
    }
  }
  queries.forEach((q, i) => {
    const part = `bridge/.part-${step}-${i}.sql`;
    fs.writeFileSync(part, q);
    manifest.push(part);
  });
  console.log('step', step, 'seq', seq, 'parts', queries.length, 'dataLen', data.length);
}
fs.writeFileSync('bridge/.mcp-parts-manifest.json', JSON.stringify({ manifest }));
