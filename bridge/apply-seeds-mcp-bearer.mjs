/**
 * Apply all _seed-json-*.sql via Supabase MCP HTTP using a Bearer token.
 * Token: MCP_SUPABASE_BEARER env, or ~/.mcp-auth/.../272b6f9910974dbac6d471c5108c55e6_tokens.json
 */
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
  console.error('No bearer token (MCP_SUPABASE_BEARER or mcp-auth tokens file).');
  process.exit(1);
}

const files = [
  '_seed-json-notes-0.sql',
  '_seed-json-notes-1.sql',
  ...Array.from({ length: 12 }, (_, j) => `_seed-json-questions-${j}.sql`),
];

const transport = new StreamableHTTPClientTransport(new URL(url), {
  requestInit: { headers: { Authorization: `Bearer ${bearer}` } },
});
const client = new Client({ name: 'apply-seeds-mcp-bearer', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

for (const file of files) {
  const query = fs.readFileSync(path.join(dir, file), 'utf8');
  const result = await client.callTool({ name: 'execute_sql', arguments: { query } });
  const text = result.content?.map((c) => c.text).join('\n') ?? '';
  if (result.isError) {
    console.error('FAILED', file, text.slice(0, 500));
    await client.close();
    process.exit(1);
  }
  console.log('applied', file);
}

const counts = await client.callTool({
  name: 'execute_sql',
  arguments: {
    query: `SELECT 'topics' AS tbl, count(*)::int AS n FROM bridging.topics
UNION ALL SELECT 'notes', count(*)::int FROM bridging.notes
UNION ALL SELECT 'questions', count(*)::int FROM bridging.questions
UNION ALL SELECT 'legacy_users', count(*)::int FROM bridging.legacy_users;`,
  },
});
console.log('counts', counts.content?.map((c) => c.text).join('\n'));
await client.close();
