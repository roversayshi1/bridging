(async () => {
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
})()