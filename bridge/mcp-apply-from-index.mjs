/**
 * Print SQL for batch index to stdout (for agent execute_sql).
 * Usage: node bridge/mcp-apply-from-index.mjs <0-13>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const p = path.join(dir, `.mcp-query-${i}.sql`);
if (!Number.isInteger(i) || i < 0 || i > 13 || !fs.existsSync(p)) {
  process.stderr.write(`invalid index ${process.argv[2]}\n`);
  process.exit(1);
}
process.stdout.write(fs.readFileSync(p, 'utf8'));
