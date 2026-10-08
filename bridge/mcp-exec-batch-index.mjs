/**
 * Execute one seed batch via Supabase MCP using IDE proxy env (if set).
 * Fallback: prints path for agent CallDynamicTool.
 * Usage: node bridge/mcp-exec-batch-index.mjs <0-13>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const seedFiles = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];
const file = seedFiles[i];
if (!Number.isInteger(i) || i < 0 || i >= seedFiles.length) {
  console.error('usage: node bridge/mcp-exec-batch-index.mjs <0-13>');
  process.exit(1);
}
const query = fs.readFileSync(path.join(dir, file), 'utf8');
const payload = { query };
const outPath = path.join(dir, `.mcp-exec-args-${i}.json`);
fs.writeFileSync(outPath, JSON.stringify(payload), 'utf8');
console.log(JSON.stringify({ index: i, file, bytes: query.length, argsPath: outPath }));
