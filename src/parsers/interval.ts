import { normalizeBasicText } from '../normalizers/text.js';
import { parseRational, rationalsEqual } from './rational.js';

export type IntervalBracket = '(' | '[' | ')' | ']';

export interface ParsedInterval {
  left: IntervalBracket;
  right: IntervalBracket;
  lower: string;
  upper: string;
  variable: string | null;
  inequality: string | null;
  raw: string;
}

const INTERVAL_NOTATION =
  /^([\[(])\s*([^,\]]+?)\s*,\s*([^,\]]+?)\s*([\])])$/;
const INEQUALITY_PATTERN =
  /^([a-zA-Z])\s*(>=|<=|>|<|≥|≤|≠|!=)\s*(-?\d+(?:\.\d+)?(?:\/\d+)?)$/;

export function parseInterval(input: string): ParsedInterval | null {
  const s = normalizeBasicText(input).replace(/≥/g, '>=').replace(/≤/g, '<=');

  const intervalMatch = s.match(INTERVAL_NOTATION);
  if (intervalMatch) {
    return {
      left: intervalMatch[1] as IntervalBracket,
      right: intervalMatch[4] as IntervalBracket,
      lower: intervalMatch[2]!.trim(),
      upper: intervalMatch[3]!.trim(),
      variable: null,
      inequality: null,
      raw: s,
    };
  }

  const ineqMatch = s.match(INEQUALITY_PATTERN);
  if (ineqMatch) {
    return {
      left: '(',
      right: ')',
      lower: '',
      upper: ineqMatch[3]!.trim(),
      variable: ineqMatch[1]!,
      inequality: ineqMatch[2]!,
      raw: s,
    };
  }

  return null;
}

export function intervalsEqual(a: ParsedInterval, b: ParsedInterval): boolean {
  if (a.inequality && b.inequality) {
    return (
      a.variable === b.variable &&
      normalizeInequality(a.inequality) === normalizeInequality(b.inequality) &&
      boundsEqual(a.upper, b.upper)
    );
  }

  if (a.inequality || b.inequality) {
    return inequalityToIntervalEqual(a, b) || inequalityToIntervalEqual(b, a);
  }

  return (
    a.left === b.left &&
    a.right === b.right &&
    boundsEqual(a.lower, b.lower) &&
    boundsEqual(a.upper, b.upper)
  );
}

function normalizeInequality(op: string): string {
  if (op === '≥') return '>=';
  if (op === '≤') return '<=';
  return op;
}

function boundsEqual(a: string, b: string): boolean {
  if (a === b) return true;
  const ra = parseRational(a);
  const rb = parseRational(b);
  if (ra && rb) return rationalsEqual(ra, rb);
  return false;
}

function inequalityToIntervalEqual(
  ineq: ParsedInterval,
  interval: ParsedInterval
): boolean {
  if (!ineq.inequality || ineq.variable !== interval.variable) return false;
  const op = normalizeInequality(ineq.inequality);
  const bound = ineq.upper;

  if (op === '>') {
    return interval.left === '(' && interval.lower === bound && interval.upper.includes('∞');
  }
  if (op === '>=') {
    return interval.left === '[' && interval.lower === bound && interval.upper.includes('∞');
  }
  if (op === '<') {
    return interval.right === ')' && interval.upper === bound && interval.lower.includes('-∞');
  }
  if (op === '<=') {
    return interval.right === ']' && interval.upper === bound && interval.lower.includes('-∞');
  }
  return false;
}

export function isIntervalNotation(input: string): boolean {
  const parsed = parseInterval(input);
  return parsed !== null;
}
