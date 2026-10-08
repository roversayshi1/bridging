/**
 * Apply seeds via hosted Supabase MCP (HTTP). Uses browser OAuth session if available.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const projectRef = 'xcyfgrieeatwbkretrdr';
const url = `https://mcp.supabase.com/mcp?project_ref=${projectRef}&features=database`;

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

const transport = new StreamableHTTPClientTransport(new URL(url));
const client = new Client({ name: 'emath-seed', version: '1.0.0' }, { capabilities: {} });

try {
  await client.connect(transport);
} catch (e) {
  console.error('connect failed', e.message);
  process.exit(1);
}

for (const file of files) {
  const sql = fs.readFileSync(path.join(dir, file), 'utf8');
  const result = await client.callTool({ name: 'execute_sql', arguments: { query: sql } });
  if (result.isError) {
    console.error('FAILED', file, result);
    process.exit(1);
  }
  console.log('applied', file);
}

await client.close();
console.log('done', files.length);
