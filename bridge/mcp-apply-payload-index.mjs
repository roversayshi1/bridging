/**
 * Prints { file, query } for one seed batch (for agent → execute_sql).
 * Usage: node bridge/mcp-apply-payload-index.mjs <0-13>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const payloadPath = path.join(dir, `.mcp-payload-${i}.json`);
if (!Number.isInteger(i) || !fs.existsSync(payloadPath)) {
  console.error('missing', payloadPath);
  process.exit(1);
}
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
process.stdout.write(JSON.stringify(payload));
