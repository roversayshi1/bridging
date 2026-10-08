import type { ValidationContext } from '../types.js';
import { parseInterval, intervalsEqual } from '../parsers/interval.js';
import { studentFormAllowed } from '../utils/form-check.js';
import { normalizeBasicText } from '../normalizers/text.js';

export function validateInterval(ctx: ValidationContext): boolean {
  const { studentAnswer, canonicalAnswer, constraints } = ctx;
  if (!studentFormAllowed(studentAnswer, canonicalAnswer, constraints)) return false;

  const student = parseInterval(studentAnswer);
  const canonical = parseInterval(canonicalAnswer);
  if (!student || !canonical) return false;

  if (!constraints.allowEquivalentForms) {
    return normalizeBasicText(student.raw) === normalizeBasicText(canonical.raw);
  }

  return intervalsEqual(student, canonical);
}
