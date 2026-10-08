import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const raw = fs.readFileSync(path.join(dir, 'inline-katex-workflow.js'), 'utf8');
const compact = raw
  .replace(/\r\n/g, '\n')
  .split('\n')
  .filter((line) => !line.trim().startsWith('//'))
  .join('\r\n')
  .replace(/\n\s*\n/g, '\r\n');

const renderAction = {
  id: 'RENDER_MATH',
  type: 'custom-js',
  name: 'Render KaTeX in question prompts',
  __wwdescription: 'Load KaTeX if needed (editor preview) and typeset LaTeX in question text.',
  code: compact,
  next: null,
};

fs.writeFileSync(path.join(dir, '_compact-katex-code.txt'), compact);
fs.writeFileSync(path.join(dir, '_render-action.json'), JSON.stringify(renderAction));
console.log('compact length', compact.length);
