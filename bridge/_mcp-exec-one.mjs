import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('usage: node _mcp-exec-one.mjs <sql-file>');
  process.exit(1);
}
const sql = fs.readFileSync(path.resolve(file), 'utf8');
process.stdout.write(sql);
