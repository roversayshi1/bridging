import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const src = path.join(dir, `.mcp-payload-${i}.json`);
const out = path.join(dir, `.mcp-payload-${i}.utf8.json`);
fs.writeFileSync(out, fs.readFileSync(src));
console.log(out, fs.statSync(out).size);
