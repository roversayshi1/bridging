/**
 * Apply bridge/.step-NN.sql via Supabase MCP execute_sql (stdio).
 * Requires SUPABASE_ACCESS_TOKEN in env (same as exec-mcp-seed.mjs).
 * Usage: node bridge/exec-steps-range-mcp.mjs 7 13
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
  console.error('usage: node bridge/exec-steps-range-mcp.mjs <from> <to>');
  process.exit(1);
}
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Set SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}
const projectId = process.env.SUPABASE_PROJECT_REF ?? 'xcyfgrieeatwbkretrdr';
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@supabase/mcp-server-supabase@0.13.0'],
  env: { ...process.env, SUPABASE_ACCESS_TOKEN: token, SUPABASE_PROJECT_REF: projectId },
});
const client = new Client({ name: 'exec-steps-range', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);
const applied = [];
for (let n = from; n <= to; n++) {
  const p = path.join(dir, `.step-${String(n).padStart(2, '0')}.sql`);
  if (!fs.existsSync(p)) {
    console.error('missing', p);
    process.exit(1);
  }
  const query = fs.readFileSync(p, 'utf8');
  const result = await client.callTool({ name: 'execute_sql', arguments: { project_id: projectId, query } });
  if (result.isError) {
    console.error('fail', p, result.content?.map((c) => c.text).join('\n'));
    process.exit(1);
  }
  applied.push(path.basename(p));
  console.log('ok', path.basename(p));
}
await client.close();
console.log(JSON.stringify({ applied }));
