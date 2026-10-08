/** Write bridge/.mcp-b64-chunk-NN.sql for each cursor-run chunk (exec via _exec_sql). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const total = 19;
for (let i = 0; i < total; i++) {
  const inner = fs.readFileSync(path.join(dir, `.cursor-run-${i}.sql`), 'utf8');
  const b64 = Buffer.from(inner, 'utf8').toString('base64');
  const wrapped = `SELECT bridging._exec_sql(convert_from(decode('${b64}', 'base64'), 'UTF8'));`;
  const out = path.join(dir, `.mcp-b64-chunk-${String(i).padStart(2, '0')}.sql`);
  fs.writeFileSync(out, wrapped);
}
console.log(JSON.stringify({ written: total, bytes: fs.statSync(path.join(dir, '.mcp-b64-chunk-00.sql')).size }));
