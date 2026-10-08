import type { ValidationContext } from '../types.js';
import { normalizeRatio } from '../normalizers/text.js';
import { parseRational, rationalsEqual } from '../parsers/rational.js';

function parseRatio(input: string): [string, string] | null {
  const s = normalizeRatio(input);
  const parts = s.split(':');
  if (parts.length !== 2) return null;
  return [parts[0]!.trim(), parts[1]!.trim()];
}

export function validateRatio(ctx: ValidationContext): boolean {
  const { studentAnswer, canonicalAnswer, constraints } = ctx;
  const studentParts = parseRatio(studentAnswer);
  const canonicalParts = parseRatio(canonicalAnswer);
  if (!studentParts || !canonicalParts) return false;

  const [sa, sb] = studentParts;
  const [ca, cb] = canonicalParts;
  const sA = parseRational(sa);
  const sB = parseRational(sb);
  const cA = parseRational(ca);
  const cB = parseRational(cb);
  if (!sA || !sB || !cA || !cB) return false;

  if (constraints.ordered) {
    return rationalsEqual(sA, cA) && rationalsEqual(sB, cB);
  }

  const direct = rationalsEqual(sA, cA) && rationalsEqual(sB, cB);
  const swapped = rationalsEqual(sA, cB) && rationalsEqual(sB, cA);
  return direct || swapped;
}
