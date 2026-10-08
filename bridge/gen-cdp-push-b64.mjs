import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const b64 = fs.readFileSync(path.join(dir, '_head-b64.txt'), 'utf8');
const expr = `(async () => {
  const designId = 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0';
  const headScripts = atob('${b64}');
  const bodyScripts = wwLib.$store.getters['websiteData/getDesignInfo'].bodyScripts;
  await wwLib.$apollo.mutate({
    mutation: wwLib.$apolloQueries.UPDATE_DESIGN,
    variables: { designId, headScripts, bodyScripts }
  });
  const updated = { ...wwLib.$store.getters['websiteData/getDesignInfo'], headScripts };
  await wwLib.$store.dispatch('websiteData/updateDesignInfo', updated);
  return {
    ok: true,
    hasIsPrompt: headScripts.includes('bridgingIsPromptTextEl'),
    len: headScripts.length
  };
})()`;

fs.writeFileSync(path.join(dir, '_cdp-push-b64.txt'), expr);
console.log('expr len', expr.length);
