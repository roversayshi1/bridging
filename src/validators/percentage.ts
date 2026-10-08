import type { ValidationContext } from '../types.js';
import { normalizePercentageLiteral } from '../normalizers/text.js';
import { parseRational, rationalsEqual, rationalToNumber } from '../parsers/rational.js';
import { studentFormAllowed } from '../utils/form-check.js';

function toDecimalRatio(input: string): number | null {
  const normalized = normalizePercentageLiteral(input);
  const rational = parseRational(normalized);
  if (!rational) return null;

  const raw = input.trim();
  if (/%|percent/i.test(raw)) {
    return rationalToNumber(rational) / 100;
  }
  if (rationalToNumber(rational) > 1 && !/%|percent/i.test(raw)) {
    return rationalToNumber(rational) / 100;
  }
  return rationalToNumber(rational);
}

export function validatePercentage(ctx: ValidationContext): boolean {
  const { studentAnswer, canonicalAnswer, constraints } = ctx;
  if (!studentFormAllowed(studentAnswer, canonicalAnswer, constraints)) return false;

  const student = toDecimalRatio(studentAnswer);
  const canonical = toDecimalRatio(canonicalAnswer);
  if (student == null || canonical == null) return false;

  if (constraints.tolerance != null) {
    return Math.abs(student - canonical) <= constraints.tolerance;
  }

  const sr = parseRational(normalizePercentageLiteral(studentAnswer));
  const cr = parseRational(normalizePercentageLiteral(canonicalAnswer));
  if (sr && cr) return rationalsEqual(sr, cr);

  return Math.abs(student - canonical) < 1e-12;
}
