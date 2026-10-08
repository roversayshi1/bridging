/**
 * Split a single-line _seed_b64 INSERT into INSERT + UPDATE ... || chunks for MCP size limits.
 * Usage: node bridge/split-step-insert.mjs bridge/.step-07.sql
 * Writes bridge/.mcp-split-queries.json { queries: string[] }
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const inPath = process.argv[2];
if (!inPath) {
  console.error('usage: node bridge/split-step-insert.mjs <step.sql>');
  process.exit(1);
}
const sql = fs.readFileSync(path.resolve(inPath), 'utf8').trim();
const m = /^INSERT INTO bridging\._seed_b64 \(seq, data\) VALUES \((\d+), '(.+)'\);$/s.exec(sql);
if (!m) {
  console.error('unexpected SQL shape');
  process.exit(1);
}
const seq = m[1];
const data = m[2];
const CHUNK = 2800;
const queries = [];
const esc = (s) => s.replace(/'/g, "''");
if (data.length <= CHUNK) {
  queries.push(sql);
} else {
  queries.push(
    `INSERT INTO bridging._seed_b64 (seq, data) VALUES (${seq}, '${esc(data.slice(0, CHUNK))}');`,
  );
  for (let i = CHUNK; i < data.length; i += CHUNK) {
    queries.push(
      `UPDATE bridging._seed_b64 SET data = data || '${esc(data.slice(i, i + CHUNK))}' WHERE seq = ${seq};`,
    );
  }
}
const out = path.join(dir, '.mcp-split-queries.json');
fs.writeFileSync(out, JSON.stringify({ source: inPath, seq: Number(seq), dataLen: data.length, queries }));
console.log(JSON.stringify({ out, count: queries.length, lens: queries.map((q) => q.length) }));
