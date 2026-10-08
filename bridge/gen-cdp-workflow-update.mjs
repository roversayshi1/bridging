import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inlineCode = fs.readFileSync(path.join(__dirname, 'inline-katex-workflow.js'), 'utf8');

const script = `(async () => {
  const inlineCode = ${JSON.stringify(inlineCode)};
  const pages = [
    { pageId: '74ea9589-7db5-49bc-a4a4-f3ec2b663b96', name: 'Topics' },
    { pageId: '24b87e3d-6298-463b-9b2d-6dfdf5824a36', name: 'Practice' }
  ];
  const designId = 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0';
  const designVersionId = 'd73d2d9a-e9a1-4d03-97d8-b423f644f1da';
  const results = [];
  for (const { pageId, name } of pages) {
    const page = wwLib.$store.state.websiteData.design.pages.find(p => p.id === pageId);
    const workflows = JSON.parse(JSON.stringify(page.workflows || []));
    let updated = 0;
    workflows.forEach(wf => {
      Object.values(wf.actions || {}).forEach(action => {
        if (action.type === 'custom-js' && /renderMathInElement|KaTeX|bridgingRenderMath/i.test((action.code || '') + (action.name || ''))) {
          action.code = inlineCode;
          updated++;
        }
      });
    });
    await wwLib.$apollo.mutate({
      mutation: wwLib.$apolloQueries.UPDATE_PAGE,
      variables: { designId, designVersionId, pageId, data: { workflows } }
    });
    page.workflows = workflows;
    results.push({ name, updated });
  }
  return { ok: true, results };
})()`;

fs.writeFileSync(path.join(__dirname, '_cdp-update-katex-workflow.js'), script);
console.log('written', script.length);
