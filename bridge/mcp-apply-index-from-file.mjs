/**
 * Emit one execute_sql payload from bridge/.apply-<index>.sql (stdout JSON).
 * Agent: CallDynamicTool user-supabase execute_sql with parsed { query }.
 * Usage: node bridge/mcp-apply-index-from-file.mjs <0-13>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const sqlPath = path.join(dir, `.apply-${i}.sql`);
if (!Number.isInteger(i) || i < 0 || i > 13 || !fs.existsSync(sqlPath)) {
  console.error('usage: node mcp-apply-index-from-file.mjs <0-13>');
  process.exit(1);
}
const query = fs.readFileSync(sqlPath, 'utf8');
const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];
process.stdout.write(JSON.stringify({ index: i, seedFile: files[i], query }));
