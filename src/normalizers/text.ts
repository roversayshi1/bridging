/**
 * Text normalization for math answers.
 * Handles unicode symbols, Singapore thousands separators, and whitespace.
 */

const UNICODE_MINUS = /[\u2212\u2013\u2014\uFE63\uFF0D]/g;
const MULTIPLY_SYMBOLS = /[×·∙⋅]/g;

/** Strip currency/unit suffixes for separate unit handling. */
const TRAILING_UNIT = /\s*(cm|mm|m|km|g|kg|ml|l|s|min|h|°|deg|degrees?|%|percent|sgd|usd|£|\$|€)\s*$/i;

export function normalizeWhitespace(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function normalizeUnicodeMath(input: string): string {
  return input
    .replace(UNICODE_MINUS, '-')
    .replace(MULTIPLY_SYMBOLS, '*')
    .replace(/÷/g, '/')
    .replace(/√/g, 'sqrt')
    .replace(/\^/g, '^');
}

/**
 * Singapore-style thousands separator: "15 049" -> "15049"
 * Only applied when the string looks like a plain integer with spaces.
 */
export function normalizeThousandsSeparator(input: string): string {
  const trimmed = input.trim();
  if (/^-?\d{1,3}(?: \d{3})+$/.test(trimmed)) {
    return trimmed.replace(/ /g, '');
  }
  return trimmed;
}

export function normalizeBasicText(input: string): string {
  return normalizeWhitespace(normalizeUnicodeMath(normalizeThousandsSeparator(input)));
}

export function stripOuterDelimiters(input: string): string {
  const s = input.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1).trim();
  }
  return s;
}

export function splitValueAndUnit(input: string): { value: string; unit: string | null } {
  const normalized = normalizeBasicText(input);
  const match = normalized.match(/^(.+?)\s+([a-zA-Z°%$£€]+(?:\/[a-zA-Z]+)?)$/);
  if (match) {
    return { value: match[1]!.trim(), unit: match[2]!.toLowerCase() };
  }

  const trailing = normalized.match(/^(.+?)(cm|mm|m|km|g|kg|ml|l|s|min|h|°)$/i);
  if (trailing) {
    return { value: trailing[1]!.trim(), unit: trailing[2]!.toLowerCase() };
  }

  return { value: normalized.replace(TRAILING_UNIT, '').trim(), unit: null };
}

export function normalizeUnit(unit: string): string {
  return unit.toLowerCase().replace(/\./g, '').replace(/\s+/g, '');
}

export function unitsMatch(studentUnit: string | null, accepted: string[]): boolean {
  if (accepted.length === 0) return true;
  if (!studentUnit) return false;
  const normalizedStudent = normalizeUnit(studentUnit);
  return accepted.some((u) => normalizeUnit(u) === normalizedStudent);
}

export function normalizeTextExact(input: string): string {
  return normalizeBasicText(stripOuterDelimiters(input)).toLowerCase();
}

export function normalizePercentageLiteral(input: string): string {
  const s = normalizeBasicText(input);
  const percentMatch = s.match(/^(-?\d+(?:\.\d+)?)\s*(?:%|percent)$/i);
  if (percentMatch) return percentMatch[1]!;
  return s;
}

export function normalizeRatio(input: string): string {
  return normalizeBasicText(input).replace(/\s*:\s*/g, ':');
}

export function collapseSpacesInMath(input: string): string {
  return input.replace(/\s+/g, '');
}
