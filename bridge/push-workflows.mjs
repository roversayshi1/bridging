import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(dir, 'inline-katex-workflow.js'), 'utf8').replace(/\r?\n/g, '\r\n');

const renderAction = {
  id: 'RENDER_MATH',
  type: 'custom-js',
  name: 'Render KaTeX in question prompts',
  __wwdescription: 'Typeset LaTeX in question prompts; loads KaTeX in editor preview when head scripts are missing.',
  code,
  next: null,
};

const payloads = [
  JSON.parse(fs.readFileSync(path.join(dir, '_upd-topics-safe.json'), 'utf8')),
  JSON.parse(fs.readFileSync(path.join(dir, '_upd-toggle-safe.json'), 'utf8')),
  JSON.parse(fs.readFileSync(path.join(dir, '_upd-practice-safe.json'), 'utf8')),
];

for (const payload of payloads) {
  payload.actions.RENDER_MATH = { ...renderAction, name: payload.actions.RENDER_MATH.name, next: payload.actions.RENDER_MATH.next };
  const out = path.join(dir, `mcp-${payload.id}.json`);
  const { projectId, id, scope, pageId, elementUid, firstAction, actions } = payload;
  fs.writeFileSync(out, JSON.stringify({ projectId, id, scope, pageId, elementUid, firstAction, actions }));
  console.log('wrote', out);
}

const fnPayload = {
  projectId: 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0',
  id: 'e7b8c9d0-4a1b-4c2d-9e3f-567890abcdef',
  scope: 'function',
  firstAction: 'RENDER_MATH',
  actions: {
    RENDER_MATH: { ...renderAction, name: 'Burst render KaTeX' },
  },
};
fs.writeFileSync(path.join(dir, 'mcp-e7b8c9d0.json'), JSON.stringify(fnPayload));
console.log('wrote mcp-e7b8c9d0.json');
