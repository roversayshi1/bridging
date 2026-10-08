import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = ['_upd-fn.json', '_upd-topics.json', '_upd-practice.json', '_upd-toggle.json'];
const payloads = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

// Output minimal shell-escapable summary for verification
for (const p of payloads) {
  console.log(p.name, p.id, Object.keys(p.actions).join(','));
}
