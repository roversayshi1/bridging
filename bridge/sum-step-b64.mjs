import fs from 'node:fs';
let total = 0;
for (let i = 3; i <= 11; i++) {
  const f = `bridge/.step-${String(i).padStart(2, '0')}.sql`;
  const s = fs.readFileSync(f, 'utf8');
  const m = s.match(/VALUES \((\d+), '([^']*)'\)/);
  if (m) {
    total += m[2].length;
    console.log(f, 'seq', m[1], 'b64len', m[2].length);
  }
}
console.log('total', total);
