export type FallbackQuestion = {
  id: string;
  prompt: string;
  difficulty: string;
  model_answer: string;
  question_type: string;
};

export const FALLBACK_DAILY: FallbackQuestion[] = [
  {
    id: 'daily-fallback-001',
    prompt: 'Simplify \\(\\dfrac{6a^{5}b^{2}}{3a^{2}b}\\).',
    difficulty: 'Easy',
    model_answer: '2a^3b',
    question_type: 'algebraic-expression',
  },
  {
    id: 'daily-fallback-002',
    prompt: 'Write \\(x^{2} - 9x + 20\\) in factorised form.',
    difficulty: 'Easy',
    model_answer: '(x-4)(x-5)',
    question_type: 'algebraic-expression',
  },
  {
    id: 'daily-fallback-003',
    prompt: 'Give the exact value of the diagonal of a unit square.',
    difficulty: 'Medium',
    model_answer: 'sqrt(2)',
    question_type: 'numeric',
  },
];

export function singaporeDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(now);
}

export function dayIndex(date: string, n: number): number {
  if (n <= 0) return 0;
  let h = 2166136261;
  for (let i = 0; i < date.length; i += 1) {
    h ^= date.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % n;
}

const UGLY = /\[\[|shown below|the figure|the diagram|stem-and-leaf|you must show your working/i;

export function isDailyFriendlyPrompt(
  prompt: string,
  metadata?: Record<string, unknown> | null
): boolean {
  if (metadata?.diagram_required === true) return false;
  const text = String(prompt ?? '').trim();
  if (text.length < 18 || text.length > 280) return false;
  if (UGLY.test(text)) return false;
  if (/\([a-c]\)[\s\S]{0,100}\([b-d]\)/i.test(text)) return false;

  const hasMathSyntax =
    /\\\(|\\\[|\\frac|\\sqrt|\\dfrac|[A-Za-z0-9]\^\d|[A-Za-z]\^\{\d+\}/.test(text) || /[=≈]/.test(text);
  const words = text.split(/\s+/).filter(Boolean);
  const looksNormal =
    /^[A-Z“"]/.test(text) &&
    words.length >= 8 &&
    !/[A-Za-z]\^\d/.test(text) &&
    (text.match(/[A-Za-z]/g)?.length ?? 0) > text.length * 0.45;

  return hasMathSyntax || looksNormal;
}

export function wrapPromptMath(prompt: string): string {
  if (/\\\(|\\\[/.test(prompt)) return prompt;
  return prompt.replace(/([A-Za-z0-9]+)\^(\d+)/g, (_, base: string, exp: string) => `\\(${base}^{${exp}}\\)`);
}
