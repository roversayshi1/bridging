import fs from 'node:fs';
import path from 'node:path';

const sqlPath = process.argv[2];
const outPath = process.argv[3] ?? path.join(path.dirname(sqlPath), '.exec-query.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');
const b64 = Buffer.from(sql, 'utf8').toString('base64');
const q = `DO $do$ BEGIN EXECUTE convert_from(decode('${b64}', 'base64'), 'utf8'); END $do$;`;
fs.writeFileSync(outPath, q);
console.log('wrote', outPath, 'len', q.length);
