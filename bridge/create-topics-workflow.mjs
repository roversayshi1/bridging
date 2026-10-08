import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(dir, 'inline-katex-workflow.js'), 'utf8').replace(/\r?\n/g, '\r\n');

const args = {
  projectId: 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0',
  id: 'f8c7ac62-5db4-4a3e-8913-91fc497f4e40',
  scope: 'page',
  pageId: '74ea9589-7db5-49bc-a4a4-f3ec2b663b96',
  name: 'Load Topics Data',
  description:
    'On Topics page load, wait for nested question repeaters then burst-render KaTeX via safe head-script helpers.',
  trigger: 'onload',
  firstAction: 'NOOP',
  actions: {
    NOOP: {
      id: 'NOOP',
      type: 'custom-js',
      name: 'Use app-loaded data',
      __wwdescription: 'Topics data already loaded by app-level Load Student Data.',
      code: 'return null;',
      next: 'WAIT_FOR_REPEATERS',
    },
    WAIT_FOR_REPEATERS: {
      id: 'WAIT_FOR_REPEATERS',
      type: 'wait',
      name: 'Wait for repeater data',
      __wwdescription: 'Give nested topic question repeaters time to render before KaTeX runs.',
      value: 1000,
      next: 'RENDER_MATH',
    },
    RENDER_MATH: {
      id: 'RENDER_MATH',
      type: 'custom-js',
      name: 'Render KaTeX in question prompts',
      __wwdescription: 'Typeset LaTeX in question prompts only (no page-wide scan).',
      code,
      next: null,
    },
  },
};

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', 'mcp-remote', 'https://ai-api.weweb.io/v1/mcp'],
});
const client = new Client({ name: 'create-topics-workflow', version: '1.0.0' });
await client.connect(transport);
const result = await client.callTool({ name: 'createFrontendWorkflow', arguments: args });
console.log(JSON.stringify(result, null, 2));
await client.close();
