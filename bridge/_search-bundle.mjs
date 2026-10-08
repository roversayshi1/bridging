import fs from 'node:fs';
const s = fs.readFileSync('C:/Users/rover/Projects/emath-marker/bridge/_live-main.js', 'utf8');
const terms = [
  'scanAndRender',
  'headHelpersAreCurrent',
  'repairCorruptedMath',
  'clearBrokenKatex',
  'ae5f2e79',
  'f8c7ac62',
  'querySelectorAll',
  'Load Topics Data',
];
for (const t of terms) {
  console.log(t, s.includes(t));
}
const i = s.indexOf('headHelpersAreCurrent');
if (i >= 0) console.log('snippet', s.slice(i, i + 200));
const j = s.indexOf('scanAndRender');
if (j >= 0) console.log('scan at', j, s.slice(j, j + 150));
