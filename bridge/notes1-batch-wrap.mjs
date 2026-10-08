import fs from 'fs';

function wrap(q) {
  const b = Buffer.from(q, 'utf8').toString('base64');
  return `SELECT bridging._exec_sql(convert_from(decode('${b}', 'base64'), 'UTF8'));`;
}

function batch(a, b, tag) {
  const inner =
    fs.readFileSync(`bridge/.notes1-exec-${a}.txt`, 'utf8') +
    '\n' +
    fs.readFileSync(`bridge/.notes1-exec-${b}.txt`, 'utf8');
  const w = wrap(inner);
  fs.writeFileSync(`bridge/.notes1-batch-${tag}.sql`, w);
  fs.writeFileSync(`bridge/.notes1-batch-${tag}.json`, JSON.stringify({ query: w }));
  console.log(tag, inner.length, w.length);
}

batch(5, 6, '5-6');
batch(7, 8, '7-8');
const q9 = fs.readFileSync('bridge/.notes1-exec-9.txt', 'utf8');
fs.writeFileSync('bridge/.notes1-batch-9-only.json', JSON.stringify({ query: q9 }));
console.log('9-only', q9.length);
