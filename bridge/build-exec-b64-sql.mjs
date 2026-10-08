import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const esc = (s) => `'${s.replace(/'/g, "''")}'`;
for (let i = 0; i < 14; i++) {
  const b64 = fs.readFileSync(path.join(dir, `.b64-${i}.txt`), 'utf8');
  const q = `SELECT bridging.exec_b64_sql(${esc(b64)});`;
  fs.writeFileSync(path.join(dir, `.exec-b64-${i}.sql`), q);
  console.log(i, q.length);
}
