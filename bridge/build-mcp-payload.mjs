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
const file = files[i];
const sql = fs.readFileSync(path.join(dir, file), 'utf8');
const out = path.join(dir, '.mcp-payload.json');
fs.writeFileSync(out, JSON.stringify({ file, index: i, query: sql }), 'utf8');
console.log(out);
