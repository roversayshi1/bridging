/**
 * Emit execute_sql payload for one seed batch (stdout = JSON {query}).
 * Agent: CallDynamicTool user-supabase execute_sql with parsed stdout.
 * Usage: node bridge/mcp-exec-one-batch.mjs <0-13>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];
if (!Number.isInteger(i) || i < 0 || i >= files.length) {
  console.error('usage: node bridge/mcp-exec-one-batch.mjs <0-13>');
  process.exit(1);
}
const query = fs.readFileSync(path.join(dir, files[i]), 'utf8');
process.stdout.write(JSON.stringify({ file: files[i], index: i, query }));
