/**
 * Try Supabase MCP via mcp-remote (OAuth tokens may live in ~/.mcp-auth).
 * Usage: node bridge/try-mcp-remote-seed.mjs <batchIndex 0-13>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2] ?? 0);
const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];
const file = files[i];
const query = fs.readFileSync(path.join(dir, file), 'utf8');
const url =
  'https://mcp.supabase.com/mcp?project_ref=xcyfgrieeatwbkretrdr&features=database';

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', 'mcp-remote', url],
  env: { ...process.env },
});
const client = new Client({ name: 'try-mcp-remote-seed', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);
const result = await client.callTool({ name: 'execute_sql', arguments: { query } });
await client.close();
const text = result.content?.map((c) => c.text).join('\n') ?? '';
if (result.isError) {
  console.error('error', text);
  process.exit(1);
}
console.log('ok', file, text.slice(0, 200));
