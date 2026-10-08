import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const b64 = fs.readFileSync(path.join(dir, '_katex-head.b64'), 'utf8').trim();
const mid = Math.ceil(b64.length / 2);
const b64a = b64.slice(0, mid);
const b64b = b64.slice(mid);

fs.writeFileSync(path.join(dir, '_cdp-set-b64a.js'), `window.__b64a = ${JSON.stringify(b64a)};`);
fs.writeFileSync(path.join(dir, '_cdp-set-b64b.js'), `window.__b64b = ${JSON.stringify(b64b)};`);
fs.writeFileSync(
  path.join(dir, '_cdp-save-head.js'),
  `(async () => {
  const designId = 'bcf230cd-e5b1-4fde-814b-0ddd71a314f0';
  const headScripts = new TextDecoder().decode(Uint8Array.from(atob(window.__b64a + window.__b64b), c => c.charCodeAt(0)));
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
    hasPrepare: headScripts.includes('bridgingPreparePlainMath'),
    hasObserver: headScripts.includes('bridgingEnsureMathObserver'),
    hasDeferInline: headScripts.includes('<script defer>')
  };
})()`
);

console.log('b64a', b64a.length, 'b64b', b64b.length);
