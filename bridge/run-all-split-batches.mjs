/**
 * Run all .split-batch-*.sql via stdin JSON lines {query} for external MCP driver.
 * Usage: node bridge/run-all-split-batches.mjs | your-mcp-driver
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
for (let i = 0; i < 12; i++) {
  const q = fs.readFileSync(
    path.join(dir, `.split-batch-${String(i).padStart(2, '0')}.sql`),
    'utf8'
  );
  process.stdout.write(JSON.stringify({ i, query: q }) + '\n');
}
