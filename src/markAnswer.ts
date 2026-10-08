import type {
  MarkAnswerInput,
  MarkAnswerResult,
  ValidationContext,
} from './types.js';
import { resolveConstraints } from './utils/form-check.js';
import { runValidator } from './validators/registry.js';
import { stripOuterDelimiters, normalizeBasicText } from './normalizers/text.js';
import { evidentInAnswer } from './utils/containment.js';

function toVerdict(isCorrect: boolean): MarkAnswerResult {
  return {
    isCorrect,
    verdict: isCorrect ? 'Correct' : 'Wrong',
  };
}

function buildContext(
  input: MarkAnswerInput,
  studentAnswer: string,
  canonicalAnswer: string
): ValidationContext {
  return {
    questionType: input.questionType,
    studentAnswer: stripOuterDelimiters(normalizeBasicText(studentAnswer)),
    canonicalAnswer: stripOuterDelimiters(normalizeBasicText(canonicalAnswer)),
    constraints: resolveConstraints(input.answerConstraints),
  };
}

function evaluatePair(input: MarkAnswerInput, student: string, canonical: string): boolean {
  const ctx = buildContext(input, student, canonical);

  if (input.customValidator) {
    const custom = input.customValidator(
      ctx.studentAnswer,
      ctx.canonicalAnswer,
      ctx.constraints
    );
    if (custom !== null) return custom;
  }

  return runValidator(ctx);
}

/**
 * Deterministic binary math answer marker.
 * Student-facing output is strictly Correct / Wrong only.
 */
export function markAnswer(input: MarkAnswerInput): MarkAnswerResult {
  const student = input.studentAnswer ?? '';
  const canonical = input.canonicalAnswer ?? '';

  if (student.trim() === '' || canonical.trim() === '') {
    return toVerdict(false);
  }

  if (evaluatePair(input, student, canonical)) {
    return toVerdict(true);
  }

  for (const alt of input.acceptedAnswers ?? []) {
    if (alt.trim() && evaluatePair(input, student, alt)) {
      return toVerdict(true);
    }
  }

  const constraints = resolveConstraints(input.answerConstraints);
  if (!constraints.requireExactForm && !constraints.requiredForm) {
    if (evidentInAnswer(student, canonical)) {
      return toVerdict(true);
    }
    for (const alt of input.acceptedAnswers ?? []) {
      if (alt.trim() && evidentInAnswer(student, alt)) {
        return toVerdict(true);
      }
    }
  }

  return toVerdict(false);
}

export { markAnswer as default };
