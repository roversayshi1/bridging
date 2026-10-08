/**
 * Apply all seed SQL via Supabase MCP HTTP using refresh_token from ~/.mcp-auth.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
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
    const text = await res.text();
    throw new Error(`token refresh failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];

const bearer = await getAccessToken();
const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
  requestInit: { headers: { Authorization: `Bearer ${bearer}` } },
});
const client = new Client({ name: 'emath-seed-refresh', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

for (const file of files) {
  const query = fs.readFileSync(path.join(dir, file), 'utf8');
  const result = await client.callTool({ name: 'execute_sql', arguments: { query } });
  const text = result.content?.map((c) => c.text).join('\n') ?? '';
  if (result.isError) {
    console.error('FAILED', file, text.slice(0, 800));
    await client.close();
    process.exit(1);
  }
  console.log('applied', file);
}

const counts = await client.callTool({
  name: 'execute_sql',
  arguments: {
    query: `SELECT 'topics' AS tbl, count(*)::bigint AS n FROM bridging.topics
UNION ALL SELECT 'notes', count(*)::bigint FROM bridging.notes
UNION ALL SELECT 'questions', count(*)::bigint FROM bridging.questions
UNION ALL SELECT 'legacy_users', count(*)::bigint FROM bridging.legacy_users
ORDER BY tbl;`,
  },
});
console.log(counts.content?.map((c) => c.text).join('\n'));
await client.close();
