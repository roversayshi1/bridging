/**
 * Apply all bridge/.mcp-payload-*.json via stdin JSON-RPC to a connected MCP client.
 * Not used when agent calls CallDynamicTool directly; kept for local MCP stdio with PAT.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const total = 14;
for (let i = 0; i < total; i++) {
  const p = path.join(dir, `.mcp-payload-${i}.json`);
  if (!fs.existsSync(p)) {
    console.error('missing', p);
    process.exit(1);
  }
  const { query } = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (typeof query !== 'string' || !query.trim()) {
    console.error('empty query', i);
    process.exit(1);
  }
  console.log(JSON.stringify({ index: i, bytes: query.length, head: query.slice(0, 40) }));
}
