import fs from 'node:fs';
const p = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
for (const n of [3, 4, 5, 6, 7, 8, 9, 10]) {
  const s = fs.readFileSync(`${p}.q-${n}.sql`, 'utf8');
  console.log(n, s.length, s.trimEnd().endsWith("');"));
}
