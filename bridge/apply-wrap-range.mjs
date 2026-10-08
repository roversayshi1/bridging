/**
 * Apply bridge/.mcp-query-wrap-{from..to}.txt via Supabase MCP execute_sql.
 * Uses Cursor's linked Supabase MCP over stdio (OAuth token from cursor-agent).
 * Usage: node bridge/apply-wrap-range.mjs 3 9
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const from = Number(process.argv[2]);
const to = Number(process.argv[3]);
if (!Number.isInteger(from) || !Number.isInteger(to)) {
  console.error('usage: node bridge/apply-wrap-range.mjs <from> <to>');
  process.exit(1);
}

const projectId = 'xcyfgrieeatwbkretrdr';
const transport = new StdioClientTransport({
  command: 'npx',
  args: [
    '-y',
    'mcp-remote',
    `https://mcp.supabase.com/mcp?project_ref=${projectId}&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching`,
  ],
  env: { ...process.env },
});
const client = new Client({ name: 'apply-wrap-range', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

const applied = [];
for (let i = from; i <= to; i++) {
  const p = path.join(dir, `.mcp-query-wrap-${i}.txt`);
  const query = fs.readFileSync(p, 'utf8');
  const result = await client.callTool({ name: 'execute_sql', arguments: { query } });
  if (result.isError) {
    console.error('fail wrap', i, result.content?.map((c) => c.text).join('\n'));
    process.exit(1);
  }
  applied.push(i);
  console.log('ok wrap', i, query.length);
}
await client.close();
console.log(JSON.stringify({ applied }));
