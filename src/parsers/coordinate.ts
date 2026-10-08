import { normalizeBasicText } from '../normalizers/text.js';
import { parseRational, rationalsEqual } from './rational.js';

export interface ParsedCoordinate {
  components: string[];
  raw: string;
}

export function parseCoordinate(input: string): ParsedCoordinate | null {
  const s = normalizeBasicText(input);
  const parenMatch = s.match(/^\(\s*([^)]+)\s*\)$/);
  const bracketMatch = s.match(/^\[\s*([^\]]+)\s*\]$/);
  const match = parenMatch ?? bracketMatch;
  if (!match) return null;

  const parts = match[1]!.split(',').map((p) => p.trim());
  if (parts.length < 2) return null;
  return { components: parts, raw: s };
}

export function coordinatesEqual(
  student: ParsedCoordinate,
  canonical: ParsedCoordinate
): boolean {
  if (student.components.length !== canonical.components.length) return false;
  return student.components.every((comp, i) =>
    componentsEqual(comp, canonical.components[i]!)
  );
}

function componentsEqual(a: string, b: string): boolean {
  if (a === b) return true;
  const ra = parseRational(a);
  const rb = parseRational(b);
  if (ra && rb) return rationalsEqual(ra, rb);
  return false;
}
