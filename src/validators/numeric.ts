import type { ValidationContext } from '../types.js';
import {
  parseRational,
  rationalsEqual,
  rationalToNumber,
  numericWithinTolerance,
  matchesDecimalPlaces,
  matchesSignificantFigures,
} from '../parsers/rational.js';
import {
  checkUnits,
  extractValuePart,
  studentFormAllowed,
} from '../utils/form-check.js';
import { normalizeBasicText } from '../normalizers/text.js';
import { containsSurd, symbolicExpressionsEqual } from '../parsers/expression.js';

export function validateNumeric(ctx: ValidationContext): boolean {
  const { studentAnswer, canonicalAnswer, constraints } = ctx;

  if (!checkUnits(studentAnswer, constraints)) return false;
  if (!studentFormAllowed(studentAnswer, canonicalAnswer, constraints)) return false;

  const studentVal = extractValuePart(studentAnswer, constraints);
  const canonicalVal = extractValuePart(canonicalAnswer, constraints);

  const studentRational = parseRational(normalizeBasicText(studentVal));
  const canonicalRational = parseRational(normalizeBasicText(canonicalVal));

  if (!studentRational || !canonicalRational) {
    if (containsSurd(studentVal) || containsSurd(canonicalVal)) {
      if (!constraints.allowEquivalentForms) {
        return normalizeBasicText(studentVal) === normalizeBasicText(canonicalVal);
      }
      return symbolicExpressionsEqual(studentVal, canonicalVal);
    }
    return false;
  }

  if (constraints.tolerance != null) {
    return numericWithinTolerance(
      rationalToNumber(studentRational),
      rationalToNumber(canonicalRational),
      constraints.tolerance
    );
  }

  if (constraints.decimalPlaces != null) {
    return matchesDecimalPlaces(
      studentVal,
      rationalToNumber(canonicalRational),
      constraints.decimalPlaces
    );
  }

  if (constraints.significantFigures != null) {
    return matchesSignificantFigures(
      studentVal,
      rationalToNumber(canonicalRational),
      constraints.significantFigures
    );
  }

  if (!constraints.allowEquivalentForms) {
    return normalizeBasicText(studentVal) === normalizeBasicText(canonicalVal);
  }

  return rationalsEqual(studentRational, canonicalRational);
}

export function validateFraction(ctx: ValidationContext): boolean {
  return validateNumeric(ctx);
}

export function validateDecimal(ctx: ValidationContext): boolean {
  return validateNumeric(ctx);
}
