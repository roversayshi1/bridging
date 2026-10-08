/**
 * Writes each part SQL as JSON lines for sequential MCP execute_sql (query field).
 * Usage: node bridge/apply-parts-batch.mjs
 */
import fs from 'node:fs';

const manifest = JSON.parse(
  fs.readFileSync('bridge/.mcp-parts-manifest.json', 'utf8'),
).manifest;
const out = 'bridge/.mcp-parts-jsonl.jsonl';
const lines = manifest.map((p) => JSON.stringify({ file: p, query: fs.readFileSync(p, 'utf8') }));
fs.writeFileSync(out, lines.join('\n'));
console.log('wrote', out, 'lines', lines.length);
