/** Apply bridge/.one-chunk-{start..end}.sql via Supabase MCP execute_sql. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const url =
  'https://mcp.supabase.com/mcp?project_ref=xcyfgrieeatwbkretrdr&features=database';

function loadBearer() {
  if (process.env.MCP_SUPABASE_BEARER) return process.env.MCP_SUPABASE_BEARER;
  const tokenPath = path.join(
    os.homedir(),
    '.mcp-auth',
    'mcp-remote-v1',
    '272b6f9910974dbac6d471c5108c55e6_tokens.json',
  );
  if (fs.existsSync(tokenPath)) {
    const t = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    if (t.access_token) return t.access_token;
  }
  return null;
}

const start = Number(process.argv[2] ?? 8);
const end = Number(process.argv[3] ?? 18);
const bearer = loadBearer();
if (!bearer) {
  console.error('No bearer token');
  process.exit(1);
}

const transport = new StreamableHTTPClientTransport(new URL(url), {
  requestInit: { headers: { Authorization: `Bearer ${bearer}` } },
});
const client = new Client({ name: 'apply-one-chunks', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

for (let i = start; i <= end; i++) {
  const file = path.join(dir, `.one-chunk-${i}.sql`);
  const query = fs.readFileSync(file, 'utf8');
  const result = await client.callTool({ name: 'execute_sql', arguments: { query } });
  if (result.isError) {
    console.error('FAIL', i, result.content?.map((c) => c.text).join('\n').slice(0, 800));
    await client.close();
    process.exit(1);
  }
  console.log('OK', i, query.length);
}
await client.close();
console.log('done', start, end);
