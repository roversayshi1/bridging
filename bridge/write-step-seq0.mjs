import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(dir, '_seed-json-notes-0.sql'), 'utf8');
const b64 = Buffer.from(sql, 'utf8').toString('base64');
const chunkSize = 6000;
const seq = 0;
const chunk = b64.slice(0, chunkSize);
const esc = chunk.replace(/'/g, "''");
const q = `INSERT INTO bridging._seed_b64 (seq, data) VALUES (${seq}, '${esc}');`;
fs.writeFileSync(path.join(dir, '.step-03.sql'), q);
console.log(JSON.stringify({ seq, dataLen: chunk.length, queryBytes: q.length }));
