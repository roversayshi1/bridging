/**
 * Apply all seed batches by printing one line per batch for an external MCP driver.
 * Each line: BATCH <i> <path-to-sql>
 * The Cursor agent should CallDynamicTool execute_sql with fs.readFileSync(path,'utf8') per batch.
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
  console.log(`BATCH ${i} ${path.join(dir, files[i])}`);
}
