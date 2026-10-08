import nerdamer from 'nerdamer';
import 'nerdamer/Algebra.js';
import 'nerdamer/Calculus.js';
import { math } from './rational.js';
import { collapseSpacesInMath, normalizeBasicText } from '../normalizers/text.js';

const IMPLICIT_MULTIPLICATION = [
  [/(\d)([a-zA-Z(])/g, '$1*$2'],
  [/([a-zA-Z)])(\d)/g, '$1*$2'],
  [/(\))(\()/g, '$1*$2'],
];

export function prepareExpression(input: string): string {
  let s = normalizeBasicText(input);
  s = s.replace(/\*\*/g, '^');
  for (const [pattern, replacement] of IMPLICIT_MULTIPLICATION) {
    s = s.replace(pattern, replacement as string);
  }
  return collapseSpacesInMath(s);
}

export function symbolicExpressionsEqual(a: string, b: string): boolean {
  const left = prepareExpression(a);
  const right = prepareExpression(b);
  if (left === right) return true;

  try {
    const diff = nerdamer(`(${left})-(${right})`).expand().text();
    const cleaned = diff.replace(/\s+/g, '');
    if (cleaned === '0' || cleaned === '-0') return true;
  } catch {
    // fall through to numeric sampling
  }

  try {
    const nodeA = math.parse(prepareExpression(a));
    const nodeB = math.parse(prepareExpression(b));
    const simplified = math.simplify(`${nodeA.toString()}-${nodeB.toString()}`);
    const text = simplified.toString();
    if (text === '0') return true;
  } catch {
    // fall through
  }

  return numericSampleEqual(a, b);
}

function numericSampleEqual(a: string, b: string): boolean {
  const samples = [1, 2, 3, -1, 0.5, 4, 7];
  try {
    const exprA = nerdamer(prepareExpression(a));
    const exprB = nerdamer(prepareExpression(b));
    for (const x of samples) {
      const valA = Number(exprA.evaluate({ x }).text());
      const valB = Number(exprB.evaluate({ x }).text());
      if (!Number.isFinite(valA) || !Number.isFinite(valB)) continue;
      if (Math.abs(valA - valB) > 1e-9) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function isFactorisedForm(input: string): boolean {
  const s = prepareExpression(input);
  return /\([^)]+\)\s*\([^)]+\)/.test(s) || /\([^)]+\)\^?\d/.test(s);
}

export function isExpandedPolynomial(input: string): boolean {
  const s = prepareExpression(input);
  if (isFactorisedForm(s)) return false;
  return /[a-zA-Z]\^?\d/.test(s) || /\d\s*[a-zA-Z]/.test(s);
}

export function containsSurd(input: string): boolean {
  return /sqrt\s*\(/i.test(input);
}

export function containsDecimalApproximation(input: string): boolean {
  return /\d\.\d+/.test(input) && !containsSurd(input);
}

export function equationsEquivalent(a: string, b: string): boolean {
  const normA = normalizeBasicText(a);
  const normB = normalizeBasicText(b);
  if (normA === normB) return true;

  const rearrangedA = rearrangeEquation(normA);
  const rearrangedB = rearrangeEquation(normB);
  if (rearrangedA && rearrangedB && rearrangedA === rearrangedB) return true;

  return symbolicExpressionsEqual(leftSide(normA), leftSide(normB)) &&
    symbolicExpressionsEqual(rightSide(normA), rightSide(normB));
}

function leftSide(eq: string): string {
  const idx = eq.indexOf('=');
  return idx === -1 ? eq : eq.slice(0, idx).trim();
}

function rightSide(eq: string): string {
  const idx = eq.indexOf('=');
  return idx === -1 ? '0' : eq.slice(idx + 1).trim();
}

function rearrangeEquation(eq: string): string | null {
  if (!eq.includes('=')) return null;
  try {
    const lhs = leftSide(eq);
    const rhs = rightSide(eq);
    const diff = nerdamer(`(${lhs})-(${rhs})`).expand().text();
    return `${diff}=0`;
  } catch {
    return null;
  }
}
