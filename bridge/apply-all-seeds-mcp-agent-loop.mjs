/**
 * Agent driver: prints one line per batch for IDE MCP apply.
 * Usage: node bridge/apply-all-seeds-mcp-agent-loop.mjs
 * Agent: for each line, Read bridge/.batch-<i>.sql then user-supabase execute_sql.
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
  const p = path.join(dir, `.batch-${i}.sql`);
  const src = path.join(dir, files[i]);
  if (!fs.existsSync(p)) fs.copyFileSync(src, p);
  const len = fs.statSync(p).size;
  console.log(`${i}\t${files[i]}\t${len}`);
}
