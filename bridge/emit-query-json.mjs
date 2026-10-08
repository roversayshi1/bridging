import fs from 'node:fs';
const p = process.argv[2];
const q = fs.readFileSync(p, 'utf8');
process.stdout.write(JSON.stringify({ query: q }));
