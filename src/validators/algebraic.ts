import type { ValidationContext } from '../types.js';
import {
  equationsEquivalent,
  symbolicExpressionsEqual,
} from '../parsers/expression.js';
import { studentFormAllowed } from '../utils/form-check.js';
import { normalizeBasicText } from '../normalizers/text.js';

export function validateAlgebraicExpression(ctx: ValidationContext): boolean {
  const { studentAnswer, canonicalAnswer, constraints } = ctx;

  if (!studentFormAllowed(studentAnswer, canonicalAnswer, constraints)) return false;

  if (!constraints.allowEquivalentForms) {
    return normalizeBasicText(studentAnswer) === normalizeBasicText(canonicalAnswer);
  }

  return symbolicExpressionsEqual(studentAnswer, canonicalAnswer);
}

export function validateEquation(ctx: ValidationContext): boolean {
  const { studentAnswer, canonicalAnswer, constraints } = ctx;
  if (!studentFormAllowed(studentAnswer, canonicalAnswer, constraints)) return false;

  if (!constraints.allowEquivalentForms) {
    return normalizeBasicText(studentAnswer) === normalizeBasicText(canonicalAnswer);
  }

  return equationsEquivalent(studentAnswer, canonicalAnswer);
}
