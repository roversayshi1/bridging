import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = [
  'mcp-f8c7ac62-5db4-4a3e-8913-91fc497f4e40.json',
  'mcp-c8e4a2f1-7b9d-4e6a-a1c3-5d8f0b2e9a74.json',
  'mcp-b6cf647a-ec28-4e70-94c0-d24c78ce64bc.json',
  'mcp-e7b8c9d0.json',
];

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', 'mcp-remote', 'https://ai-api.weweb.io/v1/mcp'],
});

const client = new Client({ name: 'push-frontend-workflows', version: '1.0.0' });
await client.connect(transport);

const results = [];
for (const file of files) {
  const args = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  try {
    const result = await client.callTool({
      name: 'editFrontendWorkflow',
      arguments: args,
    });
    const text = result.content?.map((c) => c.text).join('\n') ?? JSON.stringify(result);
    const isError = result.isError === true;
    results.push({ file, id: args.id, scope: args.scope, ok: !isError, response: text });
    console.log(JSON.stringify({ file, id: args.id, ok: !isError, response: text }));
  } catch (err) {
    results.push({ file, id: args.id, scope: args.scope, ok: false, response: String(err) });
    console.log(JSON.stringify({ file, id: args.id, ok: false, response: String(err) }));
  }
}

await client.close();
const failed = results.filter((r) => !r.ok);
process.exit(failed.length ? 1 : 0);
