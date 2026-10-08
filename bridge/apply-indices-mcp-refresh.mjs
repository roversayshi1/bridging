/**
 * Apply selected seed batch indices via Supabase MCP HTTP (refresh token).
 * Usage: node bridge/apply-indices-mcp-refresh.mjs 6 7 8 ...
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const indices = process.argv.slice(2).map(Number).filter((n) => Number.isInteger(n));
if (!indices.length) {
  console.error('usage: node bridge/apply-indices-mcp-refresh.mjs <indices...>');
  process.exit(1);
}

const mcpUrl =
  'https://mcp.supabase.com/mcp?project_ref=xcyfgrieeatwbkretrdr&features=database';
const tokenPath = path.join(
  os.homedir(),
  '.mcp-auth',
  'mcp-remote-v1',
  '272b6f9910974dbac6d471c5108c55e6_tokens.json',
);

async function getAccessToken() {
  const t = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  if (t.access_token && t.expires_at && Date.now() < t.expires_at - 60_000) {
    return t.access_token;
  }
  const res = await fetch('https://api.supabase.com/v1/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: t.refresh_token,
    }),
  });
  if (!res.ok) {
    throw new Error(`token refresh failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

const bearer = await getAccessToken();
const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
  requestInit: { headers: { Authorization: `Bearer ${bearer}` } },
});
const client = new Client({ name: 'apply-indices-refresh', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

for (const i of indices) {
  const p = path.join(dir, `.mcp-query-${i}.sql`);
  if (!fs.existsSync(p)) {
    console.error('missing', p);
    process.exit(1);
  }
  const query = fs.readFileSync(p, 'utf8');
  const result = await client.callTool({ name: 'execute_sql', arguments: { query } });
  const text = result.content?.map((c) => c.text).join('\n') ?? '';
  if (result.isError) {
    console.error('FAILED', i, text.slice(0, 1200));
    await client.close();
    process.exit(1);
  }
  console.log('applied', i, query.length);
}

await client.close();
