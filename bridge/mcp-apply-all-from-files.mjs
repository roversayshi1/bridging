/**
 * Emit one JSON object per line for agent: {"index", "file", "query"} for each seed batch.
 * Agent: for each line, CallDynamicTool user-supabase execute_sql with query.
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
  const query = fs.readFileSync(path.join(dir, files[i]), 'utf8');
  process.stdout.write(JSON.stringify({ index: i, file: files[i], query }) + '\n');
}
