import { create, all } from 'mathjs';

const math = create(all, {});

export interface RationalValue {
  numerator: bigint;
  denominator: bigint;
  /** Original parse kind for form checking */
  source: 'fraction' | 'decimal' | 'integer' | 'mixed' | 'scientific' | 'surds' | 'symbolic';
  raw: string;
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function reduceRational(num: bigint, den: bigint): RationalValue {
  if (den === 0n) throw new Error('Zero denominator');
  const sign = den < 0n ? -1n : 1n;
  const n = num * sign;
  const d = den * sign;
  const g = gcd(n, d);
  return {
    numerator: n / g,
    denominator: d / g,
    source: 'fraction',
    raw: `${n}/${d}`,
  };
}

const MIXED_FRACTION = /^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/;
const SIMPLE_FRACTION = /^(-?\d+)\s*\/\s*(\d+)$/;
const SCIENTIFIC = /^(-?\d+(?:\.\d+)?)\s*[eE]\s*([+-]?\d+)$/;
const SURD_PATTERN = /sqrt\s*\(/i;
const DECIMAL_PATTERN = /^-?\d+\.\d+$/;
const INTEGER_PATTERN = /^-?\d+$/;

export function detectNumericForm(raw: string): RationalValue['source'] {
  const s = raw.trim();
  if (MIXED_FRACTION.test(s)) return 'mixed';
  if (SIMPLE_FRACTION.test(s)) return 'fraction';
  if (SURD_PATTERN.test(s)) return 'surds';
  if (SCIENTIFIC.test(s)) return 'scientific';
  if (DECIMAL_PATTERN.test(s)) return 'decimal';
  if (INTEGER_PATTERN.test(s)) return 'integer';
  return 'symbolic';
}

export function parseRational(input: string): RationalValue | null {
  const raw = input.trim();
  if (!raw) return null;

  const mixed = raw.match(MIXED_FRACTION);
  if (mixed) {
    const whole = BigInt(mixed[1]!);
    const num = BigInt(mixed[2]!);
    const den = BigInt(mixed[3]!);
    const sign = whole < 0n ? -1n : 1n;
    const absWhole = whole < 0n ? -whole : whole;
    const totalNum = absWhole * den + num;
    const result = reduceRational(sign * totalNum, den);
    result.source = 'mixed';
    result.raw = raw;
    return result;
  }

  const frac = raw.match(SIMPLE_FRACTION);
  if (frac) {
    const result = reduceRational(BigInt(frac[1]!), BigInt(frac[2]!));
    result.source = 'fraction';
    result.raw = raw;
    return result;
  }

  if (SURD_PATTERN.test(raw)) {
    return null;
  }

  try {
    const evaluated = math.evaluate(raw) as number | { s: number; n: number; d: number } | bigint;
    if (typeof evaluated === 'number') {
      if (!Number.isFinite(evaluated)) return null;
      const source = DECIMAL_PATTERN.test(raw) ? 'decimal' : 'symbolic';
      return decimalToRational(evaluated, raw, source);
    }
    if (typeof evaluated === 'bigint') {
      return {
        numerator: evaluated,
        denominator: 1n,
        source: 'integer',
        raw,
      };
    }
    if (evaluated && typeof evaluated === 'object' && 's' in evaluated && 'n' in evaluated && 'd' in evaluated) {
      const frac = evaluated as { s: number; n: number; d: number };
      const sign = BigInt(frac.s);
      const n = BigInt(frac.n);
      const d = BigInt(frac.d);
      const result = reduceRational(sign * n, d);
      result.raw = raw;
      result.source = DECIMAL_PATTERN.test(raw) ? 'decimal' : 'integer';
      return result;
    }
  } catch {
    return null;
  }

  return null;
}

function decimalToRational(
  value: number,
  raw: string,
  source: RationalValue['source']
): RationalValue {
  const fraction = math.fraction(value) as unknown as { s: number | bigint; n: number | bigint; d: number | bigint };
  const result = reduceRational(BigInt(fraction.s) * BigInt(fraction.n), BigInt(fraction.d));
  result.source = source;
  result.raw = raw;
  return result;
}

export function rationalsEqual(a: RationalValue, b: RationalValue): boolean {
  return a.numerator === b.numerator && a.denominator === b.denominator;
}

export function rationalToNumber(r: RationalValue): number {
  return Number(r.numerator) / Number(r.denominator);
}

export function numericWithinTolerance(
  student: number,
  canonical: number,
  tolerance: number
): boolean {
  return Math.abs(student - canonical) <= tolerance;
}

export function roundToDecimalPlaces(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function roundToSignificantFigures(value: number, sigFigs: number): number {
  if (value === 0) return 0;
  const digits = Math.floor(Math.log10(Math.abs(value))) + 1;
  const factor = 10 ** (sigFigs - digits);
  return Math.round(value * factor) / factor;
}

export function matchesSignificantFigures(studentRaw: string, canonicalValue: number, sigFigs: number): boolean {
  const studentRational = parseRational(studentRaw);
  if (!studentRational) return false;
  const studentVal = rationalToNumber(studentRational);
  const roundedCanonical = roundToSignificantFigures(canonicalValue, sigFigs);
  const roundedStudent = roundToSignificantFigures(studentVal, sigFigs);
  return roundedCanonical === roundedStudent;
}

export function matchesDecimalPlaces(studentRaw: string, canonicalValue: number, places: number): boolean {
  const studentRational = parseRational(studentRaw);
  if (!studentRational) return false;
  const studentVal = rationalToNumber(studentRational);
  return roundToDecimalPlaces(studentVal, places) === roundToDecimalPlaces(canonicalValue, places);
}

export { math };
