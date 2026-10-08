import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const batch = process.argv[2] ?? '0';
const src = path.join(dir, `_seed-json-notes-${batch}.sql`);
const sql = fs.readFileSync(src, 'utf8');
const start = sql.indexOf("'[") + 1;
const end = sql.lastIndexOf("]'::json");
const arr = JSON.parse(sql.slice(start, end));
const outDir = path.join(dir, `.notes-${batch}-rows`);
fs.mkdirSync(outDir, { recursive: true });
arr.forEach((row, i) => {
  const one = `INSERT INTO bridging.notes\nSELECT * FROM json_populate_recordset(null::bridging.notes, '${JSON.stringify([row]).replace(/'/g, "''")}'::json)\nON CONFLICT (id) DO NOTHING;`;
  fs.writeFileSync(path.join(outDir, `row-${String(i).padStart(2, '0')}.sql`), one);
});
console.log(JSON.stringify({ batch, rows: arr.length, outDir }));
