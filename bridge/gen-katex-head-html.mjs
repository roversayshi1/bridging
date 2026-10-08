import fs from 'fs';
import path from 'path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const js = fs.readFileSync(path.join(root, 'bridging-katex-head.js'), 'utf8');
const head = [
  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css" crossorigin="anonymous">',
  '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.js" crossorigin="anonymous"></script>',
  '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>',
  '<script defer>',
  js,
  '</script>',
  '',
].join('\n');

fs.writeFileSync(path.join(root, '_katex-head-html.txt'), head);
console.log('wrote', head.length, 'chars');
