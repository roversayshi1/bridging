import { normalizeBasicText, stripOuterDelimiters } from '../normalizers/text.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function evidentPart(studentNorm: string, canonicalNorm: string): boolean {
  if (!canonicalNorm) return false;
  if (studentNorm.includes(canonicalNorm)) return true;

  const studentCompact = studentNorm.replace(/\s+/g, '');
  const canonicalCompact = canonicalNorm.replace(/\s+/g, '');
  if (canonicalCompact.length >= 2 && studentCompact.includes(canonicalCompact)) {
    return true;
  }

  const numericCore = canonicalNorm.replace(/[£$€%]/g, '').trim();
  if (/^-?\d+(?:\.\d+)?$/.test(numericCore)) {
    const pattern = new RegExp(`(?:^|[^0-9])${escapeRegex(numericCore)}(?:[^0-9]|$)`);
    return pattern.test(studentNorm);
  }

  const withUnit = canonicalNorm.match(/^(.+?)\s+(s|sec|secs|seconds|min|mins|minutes|h|hr|hrs|hours|m|cm|mm|km|%)$/);
  if (withUnit) {
    return evidentPart(studentNorm, withUnit[1]!.trim());
  }

  return false;
}

/** True when the model answer clearly appears inside a longer student response. */
export function evidentInAnswer(student: string, canonical: string): boolean {
  const studentNorm = normalizeBasicText(stripOuterDelimiters(student)).toLowerCase();
  const canonicalRaw = stripOuterDelimiters(canonical);

  if (/\s+and\s+/i.test(canonicalRaw)) {
    const parts = canonicalRaw
      .split(/\s+and\s+/i)
      .map((part) => normalizeBasicText(part).toLowerCase())
      .filter(Boolean);
    return parts.length > 0 && parts.every((part) => evidentPart(studentNorm, part));
  }

  const canonicalNorm = normalizeBasicText(canonicalRaw).toLowerCase();
  return evidentPart(studentNorm, canonicalNorm);
}
