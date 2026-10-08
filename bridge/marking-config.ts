/**
 * Infer marking questionType from model answer when metadata.marking.questionType is absent.
 */
export function inferQuestionType(modelAnswer: string, metadata?: Record<string, unknown>): string {
  const marking = metadata?.marking as Record<string, unknown> | undefined;
  if (marking?.questionType && typeof marking.questionType === 'string') {
    return marking.questionType;
  }

  const s = String(modelAnswer || '').trim();
  if (/^\{.*\}$/.test(s)) return 'set';
  if (/^\(\s*[^,)]+,\s*[^)]+\s*\)$/.test(s)) return 'coordinate';
  if (/^x\s*[<>]=?/.test(s) || /^[\[(].*,.*[\])]$/.test(s)) return 'interval';
  if (/%/.test(s)) return 'percentage';
  if (/^\d+\s*:\s*\d+/.test(s)) return 'ratio';
  if (/[a-zA-Z]/.test(s) && (/[\^()]/.test(s) || /[a-zA-Z]\s*[+\-]/.test(s))) {
    return 'algebraic-expression';
  }
  if (/^yes$|^no$/i.test(s)) return 'text-exact';
  if (/^[£$]?\d/.test(s) || /^-?\d/.test(s) || /\//.test(s)) return 'numeric';
  return 'text-exact';
}

export function buildMarkPayload(
  studentAnswer: string,
  modelAnswer: string,
  metadata?: Record<string, unknown> | null
): {
  studentAnswer: string;
  canonicalAnswer: string;
  questionType: string;
  answerConstraints: Record<string, unknown>;
  acceptedAnswers: string[];
} {
  const meta = (metadata ?? {}) as Record<string, unknown>;
  const marking = (meta.marking ?? {}) as Record<string, unknown>;

  return {
    studentAnswer,
    canonicalAnswer: modelAnswer,
    questionType: inferQuestionType(modelAnswer, meta),
    answerConstraints: {
      allowEquivalentForms: marking.allowEquivalentForms ?? true,
      requireExactForm: marking.requireExactForm ?? false,
      requiredForm: marking.requiredForm ?? null,
      decimalPlaces: marking.decimalPlaces ?? null,
      significantFigures: marking.significantFigures ?? null,
      tolerance: marking.tolerance ?? null,
      requireUnits: marking.requireUnits ?? false,
      acceptedUnits: marking.acceptedUnits ?? [],
      ordered: marking.ordered ?? false,
      simplifyRequired: marking.simplifyRequired ?? false,
    },
    acceptedAnswers: Array.isArray(marking.acceptedAnswers)
      ? (marking.acceptedAnswers as string[])
      : [],
  };
}
