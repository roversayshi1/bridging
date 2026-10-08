import { markAnswer } from './markAnswer.js';
import type { MarkAnswerInput, QuestionType } from './types.js';
import { stripOuterDelimiters, normalizeBasicText } from './normalizers/text.js';

export type MarkStatus = 'correct' | 'incorrect' | 'invalid' | 'needs_review';
export type MarkMethod =
  | 'exact_text'
  | 'normalized_text'
  | 'numeric'
  | 'fraction_decimal'
  | 'ratio'
  | 'set'
  | 'interval'
  | 'expression_equivalence'
  | 'multiple_choice'
  | 'manual_review';

export interface MarkMathAnswerInput {
  studentAnswer: string;
  expectedAnswer: string;
  questionType?: string;
  tolerance?: number;
  acceptedAnswers?: string[];
  options?: {
    caseSensitive?: boolean;
    requireSimplifiedForm?: boolean;
    requireUnits?: boolean;
    requiredUnit?: string;
    acceptedUnits?: string[];
    markingNotes?: string;
  };
}

export interface MarkMathAnswerResult {
  isCorrect: boolean;
  status: MarkStatus;
  feedback: string;
  normalizedStudentAnswer: string;
  normalizedExpectedAnswer: string;
  method: MarkMethod;
  confidence: 'high' | 'medium' | 'low';
}

const TYPE_MAP: Record<string, QuestionType> = {
  numeric: 'numeric',
  integer: 'numeric',
  fraction: 'fraction',
  percentage: 'percentage',
  ratio: 'ratio',
  expression: 'algebraic-expression',
  equation: 'equation',
  set: 'set',
  interval: 'interval',
  multiple_choice: 'text-exact',
  short_text: 'text-exact',
  manual_review: 'text-exact',
};

function normalizeForDisplay(value: string): string {
  return stripOuterDelimiters(normalizeBasicText(String(value || '').trim()));
}

function mapQuestionType(raw?: string): QuestionType {
  const key = String(raw || 'numeric').toLowerCase();
  return TYPE_MAP[key] || 'text-exact';
}

function buildMarkInput(input: MarkMathAnswerInput): MarkAnswerInput {
  const opts = input.options || {};
  return {
    studentAnswer: input.studentAnswer,
    canonicalAnswer: input.expectedAnswer,
    questionType: mapQuestionType(input.questionType),
    acceptedAnswers: input.acceptedAnswers || [],
    answerConstraints: {
      allowEquivalentForms: !opts.requireSimplifiedForm,
      requireExactForm: !!opts.requireSimplifiedForm,
      requiredForm: opts.requireSimplifiedForm ? 'fraction' : null,
      simplifyRequired: !!opts.requireSimplifiedForm,
      tolerance: input.tolerance ?? 0.000001,
      requireUnits: !!opts.requireUnits,
      acceptedUnits: opts.acceptedUnits || (opts.requiredUnit ? [opts.requiredUnit] : []),
    },
  };
}

function methodForType(questionType?: string): MarkMethod {
  const t = String(questionType || '').toLowerCase();
  if (t === 'fraction' || t === 'percentage') return 'fraction_decimal';
  if (t === 'ratio') return 'ratio';
  if (t === 'set') return 'set';
  if (t === 'interval') return 'interval';
  if (t === 'expression' || t === 'equation') return 'expression_equivalence';
  if (t === 'multiple_choice' || t === 'short_text') return 'normalized_text';
  if (t === 'manual_review') return 'manual_review';
  if (t === 'integer' || t === 'numeric') return 'numeric';
  return 'numeric';
}

function feedbackFor(status: MarkStatus, opts?: MarkMathAnswerInput['options']): string {
  if (status === 'correct') return 'Correct.';
  if (status === 'needs_review') {
    if (opts?.requireSimplifiedForm) {
      return 'Your answer is mathematically equivalent, but write it in the required simplest form.';
    }
    return 'This answer needs a clearer mathematical format before it can be checked automatically.';
  }
  if (status === 'invalid') {
    return 'I could not interpret that answer. Try using a clear format such as 3/4, 0.75, x^2, or (x+1)(x-1).';
  }
  if (opts?.requireUnits) {
    return 'Your numerical value is correct, but the required unit is missing or incorrect.';
  }
  return 'Not quite. Check your working and try again.';
}

export function markMathAnswer(input: MarkMathAnswerInput): MarkMathAnswerResult {
  const student = String(input.studentAnswer ?? '');
  const expected = String(input.expectedAnswer ?? '');
  const normalizedStudentAnswer = normalizeForDisplay(student);
  const normalizedExpectedAnswer = normalizeForDisplay(expected);
  const method = methodForType(input.questionType);

  if (!student.trim()) {
    return {
      isCorrect: false,
      status: 'invalid',
      feedback: feedbackFor('invalid'),
      normalizedStudentAnswer,
      normalizedExpectedAnswer,
      method,
      confidence: 'high',
    };
  }

  if (String(input.questionType || '').toLowerCase() === 'manual_review') {
    return {
      isCorrect: false,
      status: 'needs_review',
      feedback: feedbackFor('needs_review'),
      normalizedStudentAnswer,
      normalizedExpectedAnswer,
      method: 'manual_review',
      confidence: 'high',
    };
  }

  if (!expected.trim()) {
    return {
      isCorrect: false,
      status: 'needs_review',
      feedback: feedbackFor('needs_review'),
      normalizedStudentAnswer,
      normalizedExpectedAnswer,
      method: 'manual_review',
      confidence: 'high',
    };
  }

  const markInput = buildMarkInput(input);
  const result = markAnswer(markInput);

  if (result.isCorrect) {
    return {
      isCorrect: true,
      status: 'correct',
      feedback: 'Correct.',
      normalizedStudentAnswer,
      normalizedExpectedAnswer,
      method,
      confidence: 'high',
    };
  }

  if (input.options?.requireSimplifiedForm && markInput.answerConstraints?.allowEquivalentForms === false) {
    const relaxed = markAnswer({
      ...markInput,
      answerConstraints: {
        ...markInput.answerConstraints,
        allowEquivalentForms: true,
        requireExactForm: false,
        requiredForm: null,
        simplifyRequired: false,
      },
    });
    if (relaxed.isCorrect) {
      return {
        isCorrect: false,
        status: 'needs_review',
        feedback: feedbackFor('needs_review', input.options),
        normalizedStudentAnswer,
        normalizedExpectedAnswer,
        method,
        confidence: 'high',
      };
    }
  }

  return {
    isCorrect: false,
    status: 'incorrect',
    feedback: feedbackFor('incorrect', input.options),
    normalizedStudentAnswer,
    normalizedExpectedAnswer,
    method,
    confidence: 'high',
  };
}

export default markMathAnswer;
