import fs from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const args = JSON.parse(
  fs.readFileSync(new URL('./_edit-mark-full.json', import.meta.url), 'utf8')
);

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', 'mcp-remote', 'https://ai-api.weweb.io/v1/mcp'],
});

const client = new Client({ name: 'invoke-edit-mark', version: '1.0.0' });
await client.connect(transport);
const result = await client.callTool({
  name: 'editBackendWorkflow',
  arguments: args,
});
const text = result.content?.map((c) => c.text).join('\n') ?? JSON.stringify(result);
console.log(text);
await client.close();
