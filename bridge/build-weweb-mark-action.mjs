import fs from 'node:fs';

const marker = fs.readFileSync(new URL('./weweb-compact-marker.js', import.meta.url), 'utf8');

const infer = `
function inferQuestionType(modelAnswer, metadata, row) {
  if (row && row.question_type) return row.question_type;
  const marking = (metadata && metadata.marking) || {};
  if (marking.questionType) return marking.questionType;
  const s = String(modelAnswer || '').trim();
  if (/^\\{\\s*.*\\s*\\}$/.test(s)) return 'set';
  if (/^\\(\\s*[^,)]+,\\s*[^)]+\\s*\\)$/.test(s)) return 'coordinate';
  if (/^x\\s*[<>]=?/.test(s) || /^[\\[(].*,.*[\\])]$/.test(s)) return 'interval';
  if (/%/.test(s)) return 'percentage';
  if (/^\\d+\\s*:\\s*\\d+/.test(s)) return 'ratio';
  if (/[a-zA-Z]/.test(s) && (/[\\^()]/.test(s) || /[a-zA-Z]\\s*[+\\-]/.test(s))) return 'algebraic-expression';
  if (/^yes$|^no$/i.test(s)) return 'text-exact';
  if (/^[£$]?\\d/.test(s) || /^-?\\d/.test(s) || /\\//.test(s)) return 'numeric';
  return 'text-exact';
}
`;

const runner = `
const rows = context.workflow['FETCH_Q'].result?.data || [];
const question = rows[0];
if (!question) {
  return {
    isCorrect: false,
    status: 'invalid',
    feedback: 'Question not found.',
    verdict: 'Wrong',
    questionId: context.parameters['questionId'] || '',
  };
}
const metadata = question.metadata || {};
const marking = metadata.marking || {};
const accepted = Array.isArray(question.accepted_answers)
  ? question.accepted_answers
  : (Array.isArray(marking.acceptedAnswers) ? marking.acceptedAnswers : []);
const result = markMathAnswerCompact({
  studentAnswer: context.parameters['studentAnswer'] || '',
  expectedAnswer: question.model_answer || '',
  questionType: inferQuestionType(question.model_answer, metadata, question),
  tolerance: question.answer_tolerance != null ? question.answer_tolerance : (marking.tolerance != null ? marking.tolerance : undefined),
  acceptedAnswers: accepted,
  options: {
    caseSensitive: question.case_sensitive != null ? question.case_sensitive : !!marking.caseSensitive,
    requireSimplifiedForm: question.require_simplified_form != null ? question.require_simplified_form : !!marking.simplifyRequired,
    requireUnits: question.require_units != null ? question.require_units : !!marking.requireUnits,
    requiredUnit: question.required_unit || marking.requiredUnit || null,
    acceptedUnits: question.accepted_units || marking.acceptedUnits || [],
    markingNotes: question.marking_notes || marking.markingNotes || '',
  },
});
result.questionId = question.id;
result.verdict = result.isCorrect ? 'Correct' : (result.status === 'needs_review' ? 'Review' : 'Wrong');
return result;
`;

const body = `${marker}\n${infer}\n${runner}`;
fs.writeFileSync(new URL('./weweb-mark-action.js', import.meta.url), body);
console.log('weweb-mark-action.js bytes:', body.length);
