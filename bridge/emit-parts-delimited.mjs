import fs from 'node:fs';

const manifest = JSON.parse(
  fs.readFileSync('bridge/.mcp-parts-manifest.json', 'utf8'),
).manifest;
for (const p of manifest) {
  process.stdout.write('---PART---\n');
  process.stdout.write(fs.readFileSync(p, 'utf8'));
  process.stdout.write('\n');
}
