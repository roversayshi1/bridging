import fs from 'node:fs';

const j = JSON.parse(
  fs.readFileSync('content/stc-2022-word-only.json', 'utf8')
);

const trims = {
  'stc-2022-p1,q12b': {
    explanation:
      '1 cm = 0.5 km, so 1 cm^2 = 0.25 km^2. Area = 1.85/0.25 = 7.4 cm^2 (MS: 74 cm^2).',
  },
  'stc-2022-p1,q4': {
    explanation:
      'USD = 500 x 0.753 = 376.50. S$ back = 376.50/0.722 = 521.47. Diff = 21.47.',
  },
  'stc-2022-p1,q17': {
    explanation:
      'Loan = 102000. Total = 152400. (1+r/100)^10 = 127/85, r ≈ 4.10%.',
  },
  'stc-2022-p1,q11': {
    explanation:
      'Ordered: x-4, x-3, x-3, x+2, x+3, x+4, x+7. Mode x-3, median x+2. 2x-1=17, x=9.',
  },
  'stc-2022-p2,q2a': {
    model_answer: '80/153',
    explanation: 'P(RG or GR) = 2(10/18)(8/17) = 80/153, not 2/9.',
  },
  'stc-2022-p2,q2d': {
    explanation: 'n=31 would remove more red balls than exist; accept n=4 only.',
  },
  'stc-2022-p2,q7a': {
    prompt:
      'Cafe X prices ($): A 5.20, L 6.60, M 7.30. Cafe Y: A 5.50, L 6.40, M 7.40. Belinda buys 2A, 4L, 3M; Carol buys 5L, 4M. Write purchases as 3x2 matrix Q (rows A,L,M; cols Belinda, Carol).',
    explanation: 'Rows are drink types; columns are Belinda and Carol.',
  },
  'stc-2022-p2,q7c': {
    explanation: 'Each entry is total bill for that person at that cafe.',
  },
  'stc-2022-p2,q7d': {
    explanation: 'Feb total $120.30; July total ≈ $127.53. % change on 2×Feb ≈ 6.01%.',
  },
  'stc-2022-p2,q10a': {
    explanation:
      'Max S$ = 280000/908.724; min S$ = 280000/939.752. Diff ≈ 10.20.',
  },
  'stc-2022-p2,q10b': {
    explanation:
      'ART 100 + PCR 345 + insurance 112 + flights 1869 + hotel/food/car 5367 = 7792; +10% ≈ 8329.',
  },
};

const questions = j.questions.map((q) => {
  const t = trims[q.tags];
  return t ? { ...q, ...t } : q;
});

const p1 = questions.filter((q) => q.tags.includes('p1'));
const p2 = questions.filter((q) => q.tags.includes('p2'));

function writePart(name, part) {
  const payload = { questions: part };
  const compact = JSON.stringify(payload);
  fs.writeFileSync(`content/${name}`, JSON.stringify(payload, null, 2) + '\n');
  const ok = compact.length <= 10000 ? 'OK' : 'OVER';
  console.log(`${name}: ${part.length} questions, ${compact.length} paste chars ${ok}`);
}

writePart('stc-2022-part1-p1.json', p1);
writePart('stc-2022-part2-p2.json', p2);
