/**
 * Compact deterministic marker for WeWeb custom-js (no external dependencies).
 * Mirrors emath-marker public API: { isCorrect, verdict: 'Correct'|'Wrong' }.
 */
function markAnswerCompact(input) {
  var studentAnswer = String(input.studentAnswer || '');
  var canonicalAnswer = String(input.canonicalAnswer || '');
  var questionType = input.questionType || 'numeric';
  var constraints = input.answerConstraints || {};
  var acceptedAnswers = input.acceptedAnswers || [];

  function verdict(isCorrect) {
    return { isCorrect: isCorrect, verdict: isCorrect ? 'Correct' : 'Wrong' };
  }

  if (!studentAnswer.trim() || !canonicalAnswer.trim()) return verdict(false);

  function normText(s) {
    return String(s || '')
      .trim()
      .replace(/[\u2212\u2013\u2014]/g, '-')
      .replace(/[×·∙]/g, '*')
      .replace(/√/g, 'sqrt')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function normThousands(s) {
    var t = String(s || '').trim();
    if (/^-?\d{1,3}(?: \d{3})+$/.test(t)) return t.replace(/ /g, '');
    return t;
  }

  function parseFraction(s) {
    var mixed = s.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixed) {
      var whole = parseInt(mixed[1], 10);
      var num = parseInt(mixed[2], 10);
      var den = parseInt(mixed[3], 10);
      var sign = whole < 0 ? -1 : 1;
      whole = Math.abs(whole);
      return (sign * (whole * den + num)) / den;
    }
    var frac = s.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (frac) return parseInt(frac[1], 10) / parseInt(frac[2], 10);
    var n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  function numsEqual(a, b, tol) {
    if (a === null || b === null) return false;
    if (tol != null) return Math.abs(a - b) <= tol;
    return Math.abs(a - b) < 1e-12;
  }

  function isFractionForm(s) {
    return /^\d+\s+\d+\s*\/\s*\d+$/.test(s.trim()) || /^-?\d+\s*\/\s*\d+$/.test(s.trim());
  }

  function formOk(studentRaw, canonicalRaw) {
    var required = constraints.requiredForm;
    if (!required && !constraints.requireExactForm) return true;
    if (required === 'fraction') return isFractionForm(studentRaw);
    if (required === 'simplified-surds') return /sqrt\s*\(/i.test(studentRaw) && !/\d\.\d+/.test(studentRaw);
    if (required === 'factorised') return /\([^)]+\)\s*\([^)]+\)/.test(studentRaw.replace(/\s+/g, ''));
    if (constraints.requireExactForm && /sqrt\s*\(/i.test(canonicalRaw) && /\d\.\d+/.test(studentRaw)) return false;
    return true;
  }

  function checkPair(student, canonical) {
    var sRaw = normThousands(student);
    var cRaw = normThousands(canonical);
    if (!formOk(sRaw, cRaw)) return false;

    if (questionType === 'text-exact') {
      return normText(sRaw) === normText(cRaw);
    }

    if (questionType === 'set') {
      var parseSet = function (x) {
        var m = x.match(/^\{\s*(.*)\s*\}$/);
        if (!m) return null;
        if (!m[1].trim()) return [];
        return m[1].split(',').map(function (p) { return p.trim(); });
      };
      var ss = parseSet(normText(sRaw));
      var cs = parseSet(normText(cRaw));
      if (!ss || !cs) return false;
      if (constraints.ordered) {
        return ss.length === cs.length && ss.every(function (v, i) { return v === cs[i]; });
      }
      if (ss.length !== cs.length) return false;
      var csCopy = cs.slice();
      return ss.every(function (item) {
        var idx = csCopy.indexOf(item);
        if (idx === -1) {
          var sn = parseFraction(item);
          var found = -1;
          for (var i = 0; i < csCopy.length; i++) {
            var cn = parseFraction(csCopy[i]);
            if (sn !== null && cn !== null && numsEqual(sn, cn, null)) { found = i; break; }
          }
          if (found === -1) return false;
          csCopy.splice(found, 1);
          return true;
        }
        csCopy.splice(idx, 1);
        return true;
      });
    }

    if (questionType === 'coordinate') {
      var parseCoord = function (x) {
        var m = x.match(/^\(\s*([^)]+)\s*\)$/);
        if (!m) return null;
        return m[1].split(',').map(function (p) { return p.trim(); });
      };
      var sc = parseCoord(sRaw);
      var cc = parseCoord(cRaw);
      if (!sc || !cc || sc.length !== cc.length) return false;
      for (var i = 0; i < sc.length; i++) {
        var sa = parseFraction(sc[i]);
        var ca = parseFraction(cc[i]);
        if (sa !== null && ca !== null) {
          if (!numsEqual(sa, ca, constraints.tolerance)) return false;
        } else if (sc[i] !== cc[i]) return false;
      }
      return true;
    }

    if (questionType === 'interval') {
      return normText(sRaw.replace(/≥/g, '>=').replace(/≤/g, '<=')) ===
        normText(cRaw.replace(/≥/g, '>=').replace(/≤/g, '<='));
    }

    if (questionType === 'algebraic-expression' || questionType === 'equation') {
      if (!constraints.allowEquivalentForms) {
        return normText(sRaw.replace(/\s+/g, '')) === normText(cRaw.replace(/\s+/g, ''));
      }
      var ns = normText(sRaw).replace(/\s+/g, '');
      var nc = normText(cRaw).replace(/\s+/g, '');
      if (ns === nc) return true;
      // lightweight expanded check for (x-a)(x-b) vs quadratic
      if (/\([^)]+\)\([^)]+\)/.test(nc)) {
        var bin = nc.match(/\(([^)]+)\)\(([^)]+)\)/);
        if (bin) {
          var expanded = expandBinomials(bin[1], bin[2]);
          if (expanded && ns === expanded) return formOk(sRaw, cRaw);
        }
      }
      return false;
    }

    // numeric, fraction, decimal, percentage, ratio, matrix default numeric path
    var stripMoney = function (x) { return x.replace(/[£$€]/g, '').trim(); };
    var sn = parseFraction(stripMoney(sRaw.replace(/%|percent/gi, '')));
    var cn = parseFraction(stripMoney(cRaw.replace(/%|percent/gi, '')));
    if (sn === null || cn === null) {
      return normText(sRaw) === normText(cRaw);
    }
    return numsEqual(sn, cn, constraints.tolerance);
  }

  function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function evidentPart(studentNorm, canonicalNorm) {
    if (!canonicalNorm) return false;
    if (studentNorm.indexOf(canonicalNorm) !== -1) return true;

    var studentCompact = studentNorm.replace(/\s+/g, '');
    var canonicalCompact = canonicalNorm.replace(/\s+/g, '');
    if (canonicalCompact.length >= 2 && studentCompact.indexOf(canonicalCompact) !== -1) {
      return true;
    }

    var numericCore = canonicalNorm.replace(/[£$€%]/g, '').trim();
    if (/^-?\d+(?:\.\d+)?$/.test(numericCore)) {
      var pattern = new RegExp('(?:^|[^0-9])' + escapeRegex(numericCore) + '(?:[^0-9]|$)');
      return pattern.test(studentNorm);
    }

    var withUnit = canonicalNorm.match(/^(.+?)\s+(s|sec|secs|seconds|min|mins|minutes|h|hr|hrs|hours|m|cm|mm|km|%)$/);
    if (withUnit) {
      return evidentPart(studentNorm, withUnit[1].trim());
    }

    return false;
  }

  function evidentInAnswer(student, canonical) {
    var studentNorm = normText(normThousands(student));
    var canonicalRaw = String(canonical || '').trim();

    if (/\s+and\s+/i.test(canonicalRaw)) {
      var parts = canonicalRaw.split(/\s+and\s+/i);
      for (var j = 0; j < parts.length; j++) {
        if (!evidentPart(studentNorm, normText(normThousands(parts[j])))) return false;
      }
      return parts.length > 0;
    }

    return evidentPart(studentNorm, normText(normThousands(canonicalRaw)));
  }

  function expandBinomials(a, b) {
    // (x-4)(x-5) -> x^2-9x+20 style normalized string
    var ma = a.match(/^([+-]?\d*)x([+-]\d+)?$/);
    var mb = b.match(/^([+-]?\d*)x([+-]\d+)?$/);
    if (!ma || !mb) return null;
    var a1 = ma[1] === '' || ma[1] === '+' ? 1 : ma[1] === '-' ? -1 : parseInt(ma[1], 10);
    var a0 = ma[2] ? parseInt(ma[2], 10) : 0;
    var b1 = mb[1] === '' || mb[1] === '+' ? 1 : mb[1] === '-' ? -1 : parseInt(mb[1], 10);
    var b0 = mb[2] ? parseInt(mb[2], 10) : 0;
    var c2 = a1 * b1;
    var c1 = a1 * b0 + a0 * b1;
    var c0 = a0 * b0;
    return 'x^2' + (c1 >= 0 ? '+' + c1 : c1) + 'x' + (c0 >= 0 ? '+' + c0 : c0);
  }

  if (checkPair(studentAnswer, canonicalAnswer)) return verdict(true);
  for (var i = 0; i < acceptedAnswers.length; i++) {
    if (acceptedAnswers[i] && checkPair(studentAnswer, acceptedAnswers[i])) return verdict(true);
  }

  if (!constraints.requireExactForm && !constraints.requiredForm) {
    if (evidentInAnswer(studentAnswer, canonicalAnswer)) return verdict(true);
    for (var k = 0; k < acceptedAnswers.length; k++) {
      if (acceptedAnswers[k] && evidentInAnswer(studentAnswer, acceptedAnswers[k])) return verdict(true);
    }
  }

  return verdict(false);
}

if (typeof module !== 'undefined') module.exports = { markAnswerCompact: markAnswerCompact };

function normDisplay(value) {
  return String(value || '')
    .trim()
    .replace(/\\\(|\\\)|\\\[|\\\]/g, '')
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ');
}

function methodForType(questionType) {
  var t = String(questionType || '').toLowerCase();
  if (t === 'fraction' || t === 'percentage') return 'fraction_decimal';
  if (t === 'ratio') return 'ratio';
  if (t === 'set') return 'set';
  if (t === 'interval') return 'interval';
  if (t === 'expression' || t === 'equation' || t === 'algebraic-expression') return 'expression_equivalence';
  if (t === 'multiple_choice' || t === 'short_text' || t === 'text-exact') return 'normalized_text';
  if (t === 'manual_review') return 'manual_review';
  if (t === 'integer' || t === 'numeric') return 'numeric';
  return 'numeric';
}

function feedbackFor(status, opts) {
  if (status === 'correct') return 'Correct.';
  if (status === 'needs_review') {
    if (opts && opts.requireSimplifiedForm) {
      return 'Your answer is mathematically equivalent, but write it in the required simplest form.';
    }
    return 'This answer needs a clearer mathematical format before it can be checked automatically.';
  }
  if (status === 'invalid') {
    return 'I could not interpret that answer. Try using a clear format such as 3/4, 0.75, x^2, or (x+1)(x-1).';
  }
  if (opts && opts.requireUnits) {
    return 'Your numerical value is correct, but the required unit is missing or incorrect.';
  }
  return 'Not quite. Check your working and try again.';
}

function mapQuestionType(raw) {
  var key = String(raw || 'numeric').toLowerCase();
  var map = {
    numeric: 'numeric',
    integer: 'numeric',
    fraction: 'fraction',
    percentage: 'percentage',
    ratio: 'ratio',
    expression: 'algebraic-expression',
    equation: 'equation',
    set: 'set',
    interval: 'interval',
    multiple_choice: 'text-exact',
    short_text: 'text-exact',
    manual_review: 'text-exact',
  };
  return map[key] || 'text-exact';
}

function markMathAnswerCompact(input) {
  var student = String((input && input.studentAnswer) || '');
  var expected = String((input && input.expectedAnswer) || '');
  var opts = (input && input.options) || {};
  var questionType = mapQuestionType(input && input.questionType);
  var method = methodForType(input && input.questionType);
  var normalizedStudentAnswer = normDisplay(student);
  var normalizedExpectedAnswer = normDisplay(expected);

  if (!student.trim()) {
    return {
      isCorrect: false,
      status: 'invalid',
      feedback: feedbackFor('invalid'),
      normalizedStudentAnswer: normalizedStudentAnswer,
      normalizedExpectedAnswer: normalizedExpectedAnswer,
      method: method,
      confidence: 'high',
      verdict: 'Wrong',
    };
  }

  if (String((input && input.questionType) || '').toLowerCase() === 'manual_review' || !expected.trim()) {
    return {
      isCorrect: false,
      status: 'needs_review',
      feedback: feedbackFor('needs_review', opts),
      normalizedStudentAnswer: normalizedStudentAnswer,
      normalizedExpectedAnswer: normalizedExpectedAnswer,
      method: 'manual_review',
      confidence: 'high',
      verdict: 'Wrong',
    };
  }

  var payload = {
    studentAnswer: student,
    canonicalAnswer: expected,
    questionType: questionType,
    acceptedAnswers: input.acceptedAnswers || [],
    answerConstraints: {
      allowEquivalentForms: !opts.requireSimplifiedForm,
      requireExactForm: !!opts.requireSimplifiedForm,
      requiredForm: opts.requireSimplifiedForm ? 'fraction' : null,
      simplifyRequired: !!opts.requireSimplifiedForm,
      tolerance: input.tolerance != null ? input.tolerance : 0.000001,
      requireUnits: !!opts.requireUnits,
      acceptedUnits: opts.acceptedUnits || (opts.requiredUnit ? [opts.requiredUnit] : []),
    },
  };

  var result = markAnswerCompact(payload);
  if (result.isCorrect) {
    return {
      isCorrect: true,
      status: 'correct',
      feedback: 'Correct.',
      normalizedStudentAnswer: normalizedStudentAnswer,
      normalizedExpectedAnswer: normalizedExpectedAnswer,
      method: method,
      confidence: 'high',
      verdict: 'Correct',
    };
  }

  if (opts.requireSimplifiedForm) {
    var relaxed = markAnswerCompact({
      studentAnswer: student,
      canonicalAnswer: expected,
      questionType: questionType,
      acceptedAnswers: input.acceptedAnswers || [],
      answerConstraints: {
        allowEquivalentForms: true,
        requireExactForm: false,
        requiredForm: null,
        simplifyRequired: false,
        tolerance: payload.answerConstraints.tolerance,
        requireUnits: !!opts.requireUnits,
        acceptedUnits: payload.answerConstraints.acceptedUnits,
      },
    });
    if (relaxed.isCorrect) {
      return {
        isCorrect: false,
        status: 'needs_review',
        feedback: feedbackFor('needs_review', opts),
        normalizedStudentAnswer: normalizedStudentAnswer,
        normalizedExpectedAnswer: normalizedExpectedAnswer,
        method: method,
        confidence: 'high',
        verdict: 'Wrong',
      };
    }
  }

  return {
    isCorrect: false,
    status: 'incorrect',
    feedback: feedbackFor('incorrect', opts),
    normalizedStudentAnswer: normalizedStudentAnswer,
    normalizedExpectedAnswer: normalizedExpectedAnswer,
    method: method,
    confidence: 'high',
    verdict: 'Wrong',
  };
}

if (typeof module !== 'undefined') module.exports.markMathAnswerCompact = markMathAnswerCompact;


function inferQuestionType(modelAnswer, metadata, row) {
  if (row && row.question_type) return row.question_type;
  const marking = (metadata && metadata.marking) || {};
  if (marking.questionType) return marking.questionType;
  const s = String(modelAnswer || '').trim();
  if (/^\{\s*.*\s*\}$/.test(s)) return 'set';
  if (/^\(\s*[^,)]+,\s*[^)]+\s*\)$/.test(s)) return 'coordinate';
  if (/^x\s*[<>]=?/.test(s) || /^[\[(].*,.*[\])]$/.test(s)) return 'interval';
  if (/%/.test(s)) return 'percentage';
  if (/^\d+\s*:\s*\d+/.test(s)) return 'ratio';
  if (/[a-zA-Z]/.test(s) && (/[\^()]/.test(s) || /[a-zA-Z]\s*[+\-]/.test(s))) return 'algebraic-expression';
  if (/^yes$|^no$/i.test(s)) return 'text-exact';
  if (/^[£$]?\d/.test(s) || /^-?\d/.test(s) || /\//.test(s)) return 'numeric';
  return 'text-exact';
}


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
