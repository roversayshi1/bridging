import type { ValidationContext } from '../types.js';
import { parseMatrix, matricesEqual } from '../parsers/matrix.js';
import { normalizeBasicText } from '../normalizers/text.js';

export function validateMatrix(ctx: ValidationContext): boolean {
  const { studentAnswer, canonicalAnswer, constraints } = ctx;
  const student = parseMatrix(studentAnswer);
  const canonical = parseMatrix(canonicalAnswer);
  if (!student || !canonical) return false;

  if (!constraints.allowEquivalentForms) {
    return normalizeBasicText(student.raw) === normalizeBasicText(canonical.raw);
  }

  return matricesEqual(student, canonical);
}
