/**
 * Prints one line per seed file: APPLY_INDEX <i> <file> <bytes>
 * Agent should run execute_sql with query = fs.readFileSync(bridge/_seed-json-...).
 */
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

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const bytes = fs.statSync(path.join(dir, file)).size;
  console.log(`APPLY_INDEX ${i} ${file} ${bytes}`);
}
