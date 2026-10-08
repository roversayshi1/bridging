import type { ValidationContext } from '../types.js';
import { parseCoordinate, coordinatesEqual } from '../parsers/coordinate.js';
import { studentFormAllowed } from '../utils/form-check.js';
import { normalizeBasicText } from '../normalizers/text.js';

export function validateCoordinate(ctx: ValidationContext): boolean {
  const { studentAnswer, canonicalAnswer, constraints } = ctx;
  if (!studentFormAllowed(studentAnswer, canonicalAnswer, constraints)) return false;

  const student = parseCoordinate(studentAnswer);
  const canonical = parseCoordinate(canonicalAnswer);
  if (!student || !canonical) return false;

  if (!constraints.allowEquivalentForms) {
    return normalizeBasicText(student.raw) === normalizeBasicText(canonical.raw);
  }

  return coordinatesEqual(student, canonical);
}
