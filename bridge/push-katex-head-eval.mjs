import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const headScripts = fs.readFileSync(path.join(dir, '_katex-head-html.txt'), 'utf8');

const expr = `(async () => {
  const designId = 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0';
  const headScripts = ${JSON.stringify(headScripts)};
  const bodyScripts = wwLib.$store.getters['websiteData/getDesignInfo'].bodyScripts;
  await wwLib.$apollo.mutate({
    mutation: wwLib.$apolloQueries.UPDATE_DESIGN,
    variables: { designId, headScripts, bodyScripts }
  });
  const updated = { ...wwLib.$store.getters['websiteData/getDesignInfo'], headScripts };
  await wwLib.$store.dispatch('websiteData/updateDesignInfo', updated);
  return {
    ok: true,
    hasFixMojibake: headScripts.includes('bridgingFixMojibake'),
    hasPrepare: headScripts.includes('bridgingPreparePlainMath')
  };
})()`;

fs.writeFileSync(path.join(dir, '_push-katex-head-eval.txt'), expr);
console.log('eval length', expr.length);
