import type { ValidationContext } from '../types.js';
import { parseSet } from '../parsers/set.js';
import { studentFormAllowed } from '../utils/form-check.js';
import { parseRational, rationalsEqual } from '../parsers/rational.js';

function elementEqual(a: string, b: string): boolean {
  if (a === b) return true;
  const ra = parseRational(a);
  const rb = parseRational(b);
  if (ra && rb) return rationalsEqual(ra, rb);
  return false;
}

function multisetEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const used = new Array(b.length).fill(false);
  return a.every((item) => {
    const idx = b.findIndex((candidate, i) => !used[i] && elementEqual(item, candidate));
    if (idx === -1) return false;
    used[idx] = true;
    return true;
  });
}

export function validateSet(ctx: ValidationContext): boolean {
  const { studentAnswer, canonicalAnswer, constraints } = ctx;
  if (!studentFormAllowed(studentAnswer, canonicalAnswer, constraints)) return false;

  const student = parseSet(studentAnswer);
  const canonical = parseSet(canonicalAnswer);
  if (!student || !canonical) return false;

  if (constraints.ordered) {
    return (
      student.elements.length === canonical.elements.length &&
      student.elements.every((el, i) => elementEqual(el, canonical.elements[i]!))
    );
  }

  return multisetEqual(student.elements, canonical.elements);
}
