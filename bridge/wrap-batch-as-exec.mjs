import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
for (const f of ['.batch-9-11.sql', '.batch-12-14.sql', '.batch-15-18.sql']) {
  const b = fs.readFileSync(path.join(dir, f));
  const enc = `SELECT bridging._exec_sql(convert_from(decode('${b.toString('base64')}', 'base64'), 'UTF8'));`;
  const out = path.join(dir, f.replace('.sql', '.exec.sql'));
  fs.writeFileSync(out, enc);
  console.log(f, enc.length);
}
