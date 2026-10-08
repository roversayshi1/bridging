/** Apply bridge/.mcp-parts-manifest.json via Supabase MCP execute_sql (HTTP bearer). */
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

const bearer = loadBearer();
if (!bearer) {
  console.error('No bearer token');
  process.exit(1);
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(dir, '.mcp-parts-manifest.json'), 'utf8'),
).manifest;

const transport = new StreamableHTTPClientTransport(new URL(url), {
  requestInit: { headers: { Authorization: `Bearer ${bearer}` } },
});
const client = new Client({ name: 'apply-parts', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

const start = Number(process.env.PART_START ?? 0);
for (const file of manifest.slice(start)) {
  const query = fs.readFileSync(path.join(dir, '..', file), 'utf8');
  const result = await client.callTool({ name: 'execute_sql', arguments: { query } });
  if (result.isError) {
    console.error('FAIL', file, result.content?.map((c) => c.text).join('\n').slice(0, 800));
    await client.close();
    process.exit(1);
  }
  console.log('ok', file);
}

await client.close();
console.log('done');
