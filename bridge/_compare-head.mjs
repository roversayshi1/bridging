import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(dir, '_live-topics.html'), 'utf8');
const repo = fs.readFileSync(path.join(dir, '_katex-head-html.txt'), 'utf8');
const start = html.indexOf('<script defer>\n// Safe KaTeX');
const end = html.indexOf('</script>', start);
const inline = start >= 0 ? html.slice(start + '<script defer>\n'.length, end) : '';
console.log({
  liveLen: inline.length,
  repoLen: repo.length,
  liveHasRepair: inline.includes('bridgingRepairCorruptedMath'),
  liveHasOldSkip: inline.includes("textEl.querySelector('.katex')"),
  repoHasRepair: repo.includes('bridgingRepairCorruptedMath'),
});
