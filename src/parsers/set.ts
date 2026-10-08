import { normalizeBasicText } from '../normalizers/text.js';

export interface ParsedSet {
  elements: string[];
  raw: string;
}

export function parseSet(input: string): ParsedSet | null {
  const s = normalizeBasicText(input);
  const rosterMatch = s.match(/^\{\s*(.*)\s*\}$/);
  if (!rosterMatch) return null;

  const inner = rosterMatch[1]!.trim();
  if (inner === '') return { elements: [], raw: s };

  const elements = splitSetElements(inner);
  return { elements, raw: s };
}

function splitSetElements(inner: string): string[] {
  const elements: string[] = [];
  let current = '';
  let depth = 0;

  for (const char of inner) {
    if (char === ',' && depth === 0) {
      elements.push(current.trim());
      current = '';
      continue;
    }
    if (char === '(' || char === '{' || char === '[') depth++;
    if (char === ')' || char === '}' || char === ']') depth--;
    current += char;
  }

  if (current.trim()) elements.push(current.trim());
  return elements;
}

export function setsEqual(
  student: ParsedSet,
  canonical: ParsedSet,
  ordered: boolean
): boolean {
  if (ordered) {
    return (
      student.elements.length === canonical.elements.length &&
      student.elements.every((el, i) => el === canonical.elements[i])
    );
  }

  if (student.elements.length !== canonical.elements.length) return false;
  const sortedStudent = [...student.elements].sort();
  const sortedCanonical = [...canonical.elements].sort();
  return sortedStudent.every((el, i) => el === sortedCanonical[i]);
}

export function isSetRosterForm(input: string): boolean {
  return /^\{\s*.*\s*\}$/.test(normalizeBasicText(input));
}
