import { normalizeBasicText } from '../normalizers/text.js';
import { parseRational, rationalsEqual } from './rational.js';

export interface ParsedMatrix {
  rows: string[][];
  raw: string;
}

export function parseMatrix(input: string): ParsedMatrix | null {
  const s = normalizeBasicText(input);
  const stripped = s.replace(/^\[\s*/, '').replace(/\s*\]$/, '').trim();
  if (!stripped) return null;

  const rowParts = stripped.split(';').map((r) => r.trim());
  const rows = rowParts.map((row) => row.split(',').map((c) => c.trim()));
  if (rows.some((r) => r.length === 0)) return null;
  const width = rows[0]!.length;
  if (!rows.every((r) => r.length === width)) return null;
  return { rows, raw: s };
}

export function matricesEqual(a: ParsedMatrix, b: ParsedMatrix): boolean {
  if (a.rows.length !== b.rows.length) return false;
  for (let i = 0; i < a.rows.length; i++) {
    const rowA = a.rows[i]!;
    const rowB = b.rows[i]!;
    if (rowA.length !== rowB.length) return false;
    for (let j = 0; j < rowA.length; j++) {
      if (!cellEqual(rowA[j]!, rowB[j]!)) return false;
    }
  }
  return true;
}

function cellEqual(a: string, b: string): boolean {
  if (a === b) return true;
  const ra = parseRational(a);
  const rb = parseRational(b);
  if (ra && rb) return rationalsEqual(ra, rb);
  return false;
}
