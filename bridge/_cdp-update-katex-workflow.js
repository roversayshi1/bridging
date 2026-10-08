(async () => {
  const inlineCode = "if (typeof renderMathInElement !== 'function') return false;\r\n\r\nvar delimiters = [\r\n  { left: '$$', right: '$$', display: true },\r\n  { left: '\\\\[', right: '\\\\]', display: true },\r\n  { left: '\\\\(', right: '\\\\)', display: false }\r\n];\r\n\r\nfunction preparePlainMath(text) {\r\n  if (!text || typeof text !== 'string') return text;\r\n  if (text.indexOf('\\\\(') >= 0 || text.indexOf('\\\\[') >= 0 || text.indexOf('$$') >= 0) return text;\r\n  return text.replace(/(\\d+(?:\\.\\d+)?|[A-Za-z]+)\\^([+-]?\\d+(?:\\.\\d+)?|[A-Za-z]+)/g, function (_, base, exp) {\r\n    return '\\\\(' + base + '^{' + exp + '}\\\\)';\r\n  });\r\n}\r\n\r\nfunction getTarget(el) {\r\n  var node = el;\r\n  while (\r\n    node.children.length === 1 &&\r\n    (node.textContent || '').trim() === (node.children[0].textContent || '').trim()\r\n  ) {\r\n    node = node.children[0];\r\n  }\r\n  var child = el.querySelector('p, span');\r\n  if (child && child.textContent && child.textContent.length >= (el.textContent || '').length * 0.85) {\r\n    return child;\r\n  }\r\n  return el;\r\n}\r\n\r\nfunction needsMath(text) {\r\n  if (!text) return false;\r\n  return text.indexOf('\\\\(') >= 0 || text.indexOf('^') >= 0 || text.indexOf('$$') >= 0;\r\n}\r\n\r\nfunction renderNode(el) {\r\n  if (!el || el.querySelector('.katex')) return false;\r\n  var target = getTarget(el);\r\n  var raw = (target.textContent || '').trim();\r\n  if (!needsMath(raw)) return false;\r\n  var prepared = preparePlainMath(raw);\r\n  target.textContent = prepared;\r\n  renderMathInElement(target, { delimiters: delimiters, throwOnError: false });\r\n  return !!target.querySelector('.katex');\r\n}\r\n\r\nfunction scanAndRender() {\r\n  var rendered = 0;\r\n  Array.from(document.querySelectorAll('p, span, div')).forEach(function (el) {\r\n    if (el.children.length > 8) return;\r\n    var text = (el.textContent || '').trim();\r\n    if (!text || text.length > 4000 || !needsMath(text)) return;\r\n    if (el.querySelector('p, span') && getTarget(el) !== el) return;\r\n    if (renderNode(el)) rendered++;\r\n  });\r\n  return rendered;\r\n}\r\n\r\nvar runs = 0;\r\nvar timer = setInterval(function () {\r\n  scanAndRender();\r\n  runs++;\r\n  if (runs >= 20) clearInterval(timer);\r\n}, 250);\r\n\r\nreturn scanAndRender();\r\n";
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
})()