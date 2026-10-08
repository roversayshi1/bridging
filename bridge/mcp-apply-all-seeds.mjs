/**
 * Apply each _seed-json-*.sql via Supabase MCP execute_sql (stdio server + PAT).
 * Usage: SUPABASE_ACCESS_TOKEN=... node bridge/mcp-apply-all-seeds.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF ?? 'xcyfgrieeatwbkretrdr';

if (!token) {
  console.error('Set SUPABASE_ACCESS_TOKEN (Supabase account access token).');
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

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@supabase/mcp-server-supabase@0.13.0'],
  env: { ...process.env, SUPABASE_ACCESS_TOKEN: token, SUPABASE_PROJECT_REF: projectRef },
});

const client = new Client({ name: 'emath-seed-apply', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

for (const file of files) {
  const query = fs.readFileSync(path.join(dir, file), 'utf8');
  const result = await client.callTool({ name: 'execute_sql', arguments: { query } });
  if (result.isError) {
    const msg = result.content?.map((c) => c.text).join('\n') ?? JSON.stringify(result);
    console.error('FAILED', file, msg);
    await client.close();
    process.exit(1);
  }
  console.log('applied', file);
}

await client.close();
console.log('done', files.length);
