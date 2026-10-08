import { describe, expect, it } from 'vitest';
import { markAnswer } from '../src/markAnswer.js';

const correct = { isCorrect: true, verdict: 'Correct' as const };
const wrong = { isCorrect: false, verdict: 'Wrong' as const };

describe('markAnswer – numeric & fraction equivalence', () => {
  it('accepts decimal equivalent when allowed', () => {
    expect(
      markAnswer({
        studentAnswer: '2.5',
        canonicalAnswer: '5/2',
        questionType: 'fraction',
        answerConstraints: { allowEquivalentForms: true },
      })
    ).toEqual(correct);
  });

  it('rejects decimal when exact fraction form required', () => {
    expect(
      markAnswer({
        studentAnswer: '2.5',
        canonicalAnswer: '5/2',
        questionType: 'fraction',
        answerConstraints: {
          allowEquivalentForms: true,
          requiredForm: 'fraction',
          requireExactForm: true,
        },
      })
    ).toEqual(wrong);
  });

  it('accepts fraction when fraction form required', () => {
    expect(
      markAnswer({
        studentAnswer: '5/2',
        canonicalAnswer: '5/2',
        questionType: 'fraction',
        answerConstraints: {
          requiredForm: 'fraction',
          requireExactForm: true,
        },
      })
    ).toEqual(correct);
  });

  it('accepts 0.5 and 1/2 when equivalent forms allowed', () => {
    expect(
      markAnswer({
        studentAnswer: '0.5',
        canonicalAnswer: '1/2',
        questionType: 'numeric',
        answerConstraints: { allowEquivalentForms: true },
      })
    ).toEqual(correct);
  });

  it('accepts Singapore thousands separator via acceptedAnswers', () => {
    expect(
      markAnswer({
        studentAnswer: '15048',
        canonicalAnswer: '15 049',
        questionType: 'numeric',
        acceptedAnswers: ['15049', '15048'],
        answerConstraints: { allowEquivalentForms: true },
      })
    ).toEqual(correct);
  });

  it('accepts normalized thousands separator on canonical side', () => {
    expect(
      markAnswer({
        studentAnswer: '15049',
        canonicalAnswer: '15 049',
        questionType: 'numeric',
      })
    ).toEqual(correct);
  });
});

describe('markAnswer – algebraic expressions', () => {
  it('accepts factorised equivalent when allowed', () => {
    expect(
      markAnswer({
        studentAnswer: '(x-4)(x-5)',
        canonicalAnswer: 'x^2 - 9x + 20',
        questionType: 'algebraic-expression',
        answerConstraints: { allowEquivalentForms: true },
      })
    ).toEqual(correct);
  });

  it('rejects expanded form when factorised required', () => {
    expect(
      markAnswer({
        studentAnswer: 'x^2 - 9x + 20',
        canonicalAnswer: '(x-4)(x-5)',
        questionType: 'algebraic-expression',
        answerConstraints: {
          allowEquivalentForms: true,
          requiredForm: 'factorised',
          requireExactForm: true,
        },
      })
    ).toEqual(wrong);
  });

  it('accepts equivalent linear combination', () => {
    expect(
      markAnswer({
        studentAnswer: '4x',
        canonicalAnswer: '2x + 2x',
        questionType: 'algebraic-expression',
        answerConstraints: { allowEquivalentForms: true },
      })
    ).toEqual(correct);
  });
});

describe('markAnswer – coordinates', () => {
  it('rejects swapped coordinates', () => {
    expect(
      markAnswer({
        studentAnswer: '(-3, 2)',
        canonicalAnswer: '(2, -3)',
        questionType: 'coordinate',
      })
    ).toEqual(wrong);
  });

  it('accepts matching coordinates', () => {
    expect(
      markAnswer({
        studentAnswer: '(2, -3)',
        canonicalAnswer: '(2, -3)',
        questionType: 'coordinate',
      })
    ).toEqual(correct);
  });
});

describe('markAnswer – sets', () => {
  it('accepts reordered set when unordered', () => {
    expect(
      markAnswer({
        studentAnswer: '{6, 1, 4}',
        canonicalAnswer: '{1, 4, 6}',
        questionType: 'set',
        answerConstraints: { ordered: false },
      })
    ).toEqual(correct);
  });

  it('rejects reordered set when ordered required', () => {
    expect(
      markAnswer({
        studentAnswer: '{6, 1, 4}',
        canonicalAnswer: '{1, 4, 6}',
        questionType: 'set',
        answerConstraints: { ordered: true },
      })
    ).toEqual(wrong);
  });
});

describe('markAnswer – intervals & inequalities', () => {
  it('rejects >= when strict > required', () => {
    expect(
      markAnswer({
        studentAnswer: 'x >= 3',
        canonicalAnswer: 'x > 3',
        questionType: 'interval',
      })
    ).toEqual(wrong);
  });

  it('accepts matching strict inequality', () => {
    expect(
      markAnswer({
        studentAnswer: 'x > 3',
        canonicalAnswer: 'x > 3',
        questionType: 'interval',
      })
    ).toEqual(correct);
  });

  it('accepts bracket interval notation', () => {
    expect(
      markAnswer({
        studentAnswer: '[3, 5)',
        canonicalAnswer: '[3, 5)',
        questionType: 'interval',
      })
    ).toEqual(correct);
  });
});

describe('markAnswer – accuracy rules', () => {
  it('accepts values matching 3 significant figures', () => {
    expect(
      markAnswer({
        studentAnswer: '17.0',
        canonicalAnswer: '17.0',
        questionType: 'decimal',
        answerConstraints: { significantFigures: 3 },
      })
    ).toEqual(correct);
  });

  it('accepts 17 when 3 s.f. rounding matches canonical 17.0', () => {
    expect(
      markAnswer({
        studentAnswer: '17',
        canonicalAnswer: '17.0',
        questionType: 'decimal',
        answerConstraints: { significantFigures: 3, allowEquivalentForms: true },
      })
    ).toEqual(correct);
  });

  it('rejects decimal approximation for exact surd when exact form required', () => {
    expect(
      markAnswer({
        studentAnswer: '1.414',
        canonicalAnswer: 'sqrt(2)',
        questionType: 'numeric',
        answerConstraints: {
          requireExactForm: true,
          requiredForm: 'simplified-surds',
          allowEquivalentForms: false,
        },
      })
    ).toEqual(wrong);
  });

  it('accepts sqrt(2) for exact surd answer', () => {
    expect(
      markAnswer({
        studentAnswer: 'sqrt(2)',
        canonicalAnswer: 'sqrt(2)',
        questionType: 'numeric',
        answerConstraints: {
          requireExactForm: true,
          requiredForm: 'simplified-surds',
        },
      })
    ).toEqual(correct);
  });
});

describe('markAnswer – tolerance', () => {
  it('accepts within tolerance when configured', () => {
    expect(
      markAnswer({
        studentAnswer: '3.14',
        canonicalAnswer: '3.14159',
        questionType: 'decimal',
        answerConstraints: { tolerance: 0.01, allowEquivalentForms: true },
      })
    ).toEqual(correct);
  });

  it('rejects outside tolerance', () => {
    expect(
      markAnswer({
        studentAnswer: '3.10',
        canonicalAnswer: '3.14159',
        questionType: 'decimal',
        answerConstraints: { tolerance: 0.01 },
      })
    ).toEqual(wrong);
  });
});

describe('markAnswer – ratio, percentage, matrix, text', () => {
  it('accepts equivalent ratio', () => {
    expect(
      markAnswer({
        studentAnswer: '2:4',
        canonicalAnswer: '1:2',
        questionType: 'ratio',
        answerConstraints: { allowEquivalentForms: true },
      })
    ).toEqual(wrong);
  });

  it('accepts exact ratio match', () => {
    expect(
      markAnswer({
        studentAnswer: '1:2',
        canonicalAnswer: '1:2',
        questionType: 'ratio',
      })
    ).toEqual(correct);
  });

  it('accepts percentage forms', () => {
    expect(
      markAnswer({
        studentAnswer: '50%',
        canonicalAnswer: '50%',
        questionType: 'percentage',
      })
    ).toEqual(correct);
  });

  it('accepts matrix entries with numeric equivalence', () => {
    expect(
      markAnswer({
        studentAnswer: '[1, 2.5; 0, 1]',
        canonicalAnswer: '[1, 5/2; 0, 1]',
        questionType: 'matrix',
        answerConstraints: { allowEquivalentForms: true },
      })
    ).toEqual(correct);
  });

  it('accepts exact text match', () => {
    expect(
      markAnswer({
        studentAnswer: 'Yes',
        canonicalAnswer: 'yes',
        questionType: 'text-exact',
      })
    ).toEqual(correct);
  });
});

describe('markAnswer – answer evident in longer response', () => {
  it('accepts yes inside an explanation', () => {
    expect(
      markAnswer({
        studentAnswer: 'Yes, they finish at 09:15 which is before 09:30',
        canonicalAnswer: 'Yes',
        questionType: 'text-exact',
      })
    ).toEqual(correct);
  });

  it('accepts a numeric final answer inside working', () => {
    expect(
      markAnswer({
        studentAnswer: 'The least common multiple is 24 seconds',
        canonicalAnswer: '24 s',
        questionType: 'text-exact',
      })
    ).toEqual(correct);
  });

  it('accepts an algebraic final answer inside working', () => {
    expect(
      markAnswer({
        studentAnswer: 'Complete the square to get (x - 5)^2 - 18',
        canonicalAnswer: '(x - 5)^2 - 18',
        questionType: 'algebraic-expression',
      })
    ).toEqual(correct);
  });

  it('still rejects when the final answer is not present', () => {
    expect(
      markAnswer({
        studentAnswer: 'They might finish on time',
        canonicalAnswer: 'Yes',
        questionType: 'text-exact',
      })
    ).toEqual(wrong);
  });
});

describe('markAnswer – custom validator', () => {
  it('uses custom validator when provided', () => {
    expect(
      markAnswer({
        studentAnswer: 'custom',
        canonicalAnswer: 'anything',
        questionType: 'text-exact',
        customValidator: (s) => (s === 'custom' ? true : null),
      })
    ).toEqual(correct);
  });
});

describe('markAnswer – empty & edge cases', () => {
  it('marks empty student answer wrong', () => {
    expect(
      markAnswer({
        studentAnswer: '',
        canonicalAnswer: '5',
        questionType: 'numeric',
      })
    ).toEqual(wrong);
  });

  it('returns only binary verdict fields', () => {
    const result = markAnswer({
      studentAnswer: '5',
      canonicalAnswer: '5',
      questionType: 'numeric',
    });
    expect(Object.keys(result).sort()).toEqual(['isCorrect', 'verdict']);
  });
});
