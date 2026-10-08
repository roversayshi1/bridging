/**
 * Apply bridge/_seed-json-*.sql via hosted Supabase MCP (HTTP), using
 * URL + headers from ~/.cursor/mcp.json (same session as IDE MCP).
 * One execute_sql call per file.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const mcpPath = path.join(os.homedir(), '.cursor', 'mcp.json');
const cfg = JSON.parse(fs.readFileSync(mcpPath, 'utf8')).mcpServers?.supabase;
if (!cfg?.url) {
  console.error('No supabase MCP url in', mcpPath);
  process.exit(1);
}

const files = fs
  .readdirSync(dir)
  .filter((f) => f.startsWith('_seed-json-') && f.endsWith('.sql'))
  .sort((a, b) => {
    const an = a.includes('notes') ? 0 : 1;
    const bn = b.includes('notes') ? 0 : 1;
    if (an !== bn) return an - bn;
    return (
      parseInt(a.match(/-(\d+)\.sql$/)[1], 10) -
      parseInt(b.match(/-(\d+)\.sql$/)[1], 10)
    );
  });

const transport = new StreamableHTTPClientTransport(new URL(cfg.url), {
  requestInit: { headers: cfg.headers ?? {} },
});
const client = new Client({ name: 'emath-seed-http', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

for (const file of files) {
  const sql = fs.readFileSync(path.join(dir, file), 'utf8');
  const result = await client.callTool({ name: 'execute_sql', arguments: { query: sql } });
  const text = result.content?.map((c) => c.text).join('\n') ?? '';
  if (result.isError) {
    console.error('FAILED', file, text);
    process.exit(1);
  }
  console.log('applied', file, sql.length, 'bytes');
}

const counts = await client.callTool({
  name: 'execute_sql',
  arguments: {
    query: `SELECT 'topics' AS tbl, count(*)::text AS n FROM bridging.topics
UNION ALL SELECT 'notes', count(*)::text FROM bridging.notes
UNION ALL SELECT 'questions', count(*)::text FROM bridging.questions
UNION ALL SELECT 'legacy_users', count(*)::text FROM bridging.legacy_users;`,
  },
});
console.log(counts.content?.map((c) => c.text).join('\n'));
await client.close();
console.log('done', files.length);
