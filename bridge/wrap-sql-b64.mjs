import fs from 'node:fs';

const i = Number(process.argv[2]);
if (!Number.isInteger(i)) {
  console.error('usage: node bridge/wrap-sql-b64.mjs <index>');
  process.exit(1);
}
const sql = fs.readFileSync(`bridge/.mcp-query-${i}.sql`, 'utf8');
const b64 = Buffer.from(sql, 'utf8').toString('base64');
const wrapped = `DO $do$ BEGIN EXECUTE convert_from(decode('${b64}', 'base64'), 'UTF8'); END; $do$;`;
const out = `bridge/.mcp-wrapped-${i}.sql`;
fs.writeFileSync(out, wrapped, 'utf8');
console.log(JSON.stringify({ index: i, sqlLen: sql.length, wrappedLen: wrapped.length, out }));
