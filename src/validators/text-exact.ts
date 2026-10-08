import type { ValidationContext } from '../types.js';
import { normalizeTextExact } from '../normalizers/text.js';

export function validateTextExact(ctx: ValidationContext): boolean {
  const { studentAnswer, canonicalAnswer } = ctx;
  return normalizeTextExact(studentAnswer) === normalizeTextExact(canonicalAnswer);
}
