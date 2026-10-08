/**
 * Apply all bridge/_seed-json-*.sql via user-supabase execute_sql.
 * Run inside Cursor agent: for each batch, read stdout JSON and call
 * CallDynamicTool user-supabase execute_sql with { query }.
 *
 * Usage: node bridge/apply-all-seeds-mcp-runner.mjs
 * Prints one line per batch: APPLY <index> <file> <bytes>
 * Agent should run: node bridge/mcp-exec-one-batch.mjs <index>
 * then CallDynamicTool execute_sql with parsed .query
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];

for (let i = 0; i < files.length; i++) {
  const sql = fs.readFileSync(path.join(dir, files[i]), 'utf8');
  console.log(`APPLY ${i} ${files[i]} ${sql.length}`);
}
