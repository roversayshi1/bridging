import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const b64 = fs.readFileSync(path.join(__dirname, '_katex-head.b64'), 'utf8');

for (let i = 0; i < 4; i++) {
  const s = b64.slice(i * 2400, (i + 1) * 2400);
  fs.writeFileSync(
    path.join(__dirname, `_b64chunk${i}.txt`),
    `window.__b64c${i}="${s}";`
  );
  console.log(i, s.length);
}

console.log('total', b64.length);
