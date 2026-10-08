import { describe, expect, it } from 'vitest';
import { markMathAnswer } from '../src/markMathAnswer.js';

describe('markMathAnswer', () => {
  it('returns invalid for empty answers', () => {
    expect(markMathAnswer({ studentAnswer: '', expectedAnswer: '5' })).toMatchObject({
      isCorrect: false,
      status: 'invalid',
    });
  });

  it('returns correct for matching numeric answers', () => {
    expect(
      markMathAnswer({
        studentAnswer: '2.5',
        expectedAnswer: '5/2',
        questionType: 'fraction',
      })
    ).toMatchObject({
      isCorrect: true,
      status: 'correct',
      method: 'fraction_decimal',
    });
  });

  it('returns needs_review for manual_review type', () => {
    expect(
      markMathAnswer({
        studentAnswer: 'anything',
        expectedAnswer: 'x',
        questionType: 'manual_review',
      })
    ).toMatchObject({
      isCorrect: false,
      status: 'needs_review',
      method: 'manual_review',
    });
  });

  it('returns needs_review when simplified form is required but only equivalent', () => {
    expect(
      markMathAnswer({
        studentAnswer: '2.5',
        expectedAnswer: '5/2',
        questionType: 'fraction',
        options: { requireSimplifiedForm: true },
      })
    ).toMatchObject({
      isCorrect: false,
      status: 'needs_review',
    });
  });
});
