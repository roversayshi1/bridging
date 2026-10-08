/**
 * Apply one seed batch via Supabase MCP stdio (needs SUPABASE_ACCESS_TOKEN).
 * Usage: SUPABASE_ACCESS_TOKEN=... node bridge/exec-mcp-seed.mjs <index 0-13>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const i = Number(process.argv[2]);
const applyPath = path.join(dir, `.apply-${i}.sql`);
if (!Number.isInteger(i) || !fs.existsSync(applyPath)) {
  console.error('missing', applyPath);
  process.exit(1);
}
const query = fs.readFileSync(applyPath, 'utf8');
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Set SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@supabase/mcp-server-supabase@0.13.0'],
  env: {
    ...process.env,
    SUPABASE_ACCESS_TOKEN: token,
    SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF ?? 'xcyfgrieeatwbkretrdr',
  },
});
const client = new Client({ name: 'exec-mcp-seed', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);
const projectId = process.env.SUPABASE_PROJECT_REF ?? 'xcyfgrieeatwbkretrdr';
const result = await client.callTool({
  name: 'execute_sql',
  arguments: { project_id: projectId, query },
});
await client.close();
if (result.isError) {
  console.error(result.content?.map((c) => c.text).join('\n'));
  process.exit(1);
}
console.log('ok', i, query.length);
