import type { QuestionType, ValidationContext, ValidatorFn } from '../types.js';
import { validateNumeric, validateFraction, validateDecimal } from './numeric.js';
import { validatePercentage } from './percentage.js';
import { validateRatio } from './ratio.js';
import { validateAlgebraicExpression, validateEquation } from './algebraic.js';
import { validateCoordinate } from './coordinate.js';
import { validateSet } from './set.js';
import { validateInterval } from './interval.js';
import { validateMatrix } from './matrix.js';
import { validateTextExact } from './text-exact.js';

const VALIDATORS: Record<QuestionType, ValidatorFn> = {
  numeric: validateNumeric,
  fraction: validateFraction,
  decimal: validateDecimal,
  percentage: validatePercentage,
  ratio: validateRatio,
  'algebraic-expression': validateAlgebraicExpression,
  equation: validateEquation,
  coordinate: validateCoordinate,
  set: validateSet,
  interval: validateInterval,
  matrix: validateMatrix,
  'text-exact': validateTextExact,
};

export function getValidator(questionType: QuestionType): ValidatorFn {
  return VALIDATORS[questionType];
}

export function runValidator(ctx: ValidationContext): boolean {
  const validator = getValidator(ctx.questionType as QuestionType);
  return validator(ctx);
}
