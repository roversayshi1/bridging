import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = fs
  .readdirSync(dir)
  .filter((f) => f.startsWith('_seed-json-') && f.endsWith('.sql'))
  .sort((a, b) => {
    const an = a.includes('notes') ? 0 : 1;
    const bn = b.includes('notes') ? 0 : 1;
    if (an !== bn) return an - bn;
    return (
      parseInt(a.match(/-(\d+)\.sql$/)[1], 10) -
      parseInt(b.match(/-(\d+)\.sql$/)[1], 10)
    );
  });

const i = Number(process.argv[2]);
if (!Number.isInteger(i) || i < 0 || i >= files.length) {
  console.error('usage: node wrap-seed-for-mcp.mjs <0..', files.length - 1, '>');
  process.exit(1);
}

const file = files[i];
const sql = fs.readFileSync(path.join(dir, file), 'utf8');
const b64 = Buffer.from(sql, 'utf8').toString('base64');
const wrapped = `DO $mcp$\nBEGIN\n  EXECUTE convert_from(decode('${b64}', 'base64'), 'UTF8');\nEND $mcp$;`;
const out = path.join(dir, `.mcp-wrapped-${i}.sql`);
fs.writeFileSync(out, wrapped, 'utf8');
console.log(JSON.stringify({ i, file, sqlBytes: sql.length, wrappedBytes: wrapped.length, out }));
