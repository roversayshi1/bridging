import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const safeCode = fs.readFileSync(path.join(dir, 'inline-katex-workflow.js'), 'utf8')
  .replace(/\r?\n/g, '\r\n');

const files = ['_upd-topics.json', '_upd-toggle.json', '_upd-practice.json'];

for (const file of files) {
  const payload = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  if (payload.actions?.RENDER_MATH) {
    payload.actions.RENDER_MATH.code = safeCode;
    payload.actions.RENDER_MATH.__wwdescription =
      'Safely typeset LaTeX in known question-prompt elements via head-script helpers.';
  }
  fs.writeFileSync(path.join(dir, file.replace('.json', '-safe.json')), JSON.stringify(payload));
  console.log('wrote', file.replace('.json', '-safe.json'));
}
