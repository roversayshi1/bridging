export type QuestionType =
  | 'numeric'
  | 'fraction'
  | 'decimal'
  | 'percentage'
  | 'ratio'
  | 'algebraic-expression'
  | 'equation'
  | 'coordinate'
  | 'set'
  | 'interval'
  | 'matrix'
  | 'text-exact';

export type RequiredForm =
  | 'fraction'
  | 'decimal'
  | 'percentage'
  | 'simplified-surds'
  | 'factorised'
  | 'expanded'
  | 'set-roster'
  | 'interval'
  | null;

export interface AnswerConstraints {
  allowEquivalentForms?: boolean;
  requireExactForm?: boolean;
  requiredForm?: RequiredForm;
  decimalPlaces?: number | null;
  significantFigures?: number | null;
  tolerance?: number | null;
  requireUnits?: boolean;
  acceptedUnits?: string[];
  ordered?: boolean;
  simplifyRequired?: boolean;
}

export type CustomValidator = (
  studentAnswer: string,
  canonicalAnswer: string,
  constraints: AnswerConstraints
) => boolean | null;

export interface MarkAnswerInput {
  studentAnswer: string;
  canonicalAnswer: string;
  questionType: QuestionType;
  answerConstraints?: AnswerConstraints;
  acceptedAnswers?: string[];
  customValidator?: CustomValidator;
}

export interface MarkAnswerResult {
  isCorrect: boolean;
  verdict: 'Correct' | 'Wrong';
}

export const DEFAULT_CONSTRAINTS: AnswerConstraints = {
  allowEquivalentForms: true,
  requireExactForm: false,
  requiredForm: null,
  decimalPlaces: null,
  significantFigures: null,
  tolerance: null,
  requireUnits: false,
  acceptedUnits: [],
  ordered: false,
  simplifyRequired: false,
};

export interface ValidationContext {
  questionType: QuestionType;
  studentAnswer: string;
  canonicalAnswer: string;
  constraints: AnswerConstraints;
}

export type ValidatorFn = (ctx: ValidationContext) => boolean;
