function fixMojibake(text) {
  if (!text || typeof text !== 'string') return text;
  try {
    return decodeURIComponent(escape(text));
  } catch (e) {
    return text;
  }
}

function preparePlainMath(text) {
  if (!text || typeof text !== 'string') return text;

  text = fixMojibake(text);
  if (/\\\(|\\\[|\$\$/.test(text)) return text;

  var superMap = {
    '\u00b2': '2',
    '\u00b3': '3',
    '\u2074': '4',
    '\u2075': '5',
    '\u2076': '6',
    '\u2077': '7',
    '\u2078': '8',
    '\u2079': '9',
    '\u2070': '0',
    '\u00b9': '1',
    '\u207b': '-',
  };

  text = text.replace(/([A-Za-z0-9]+)([\u00b2\u00b3\u2070-\u2079\u00b9\u207b]+)/g, function (_, base, sup) {
    var exp = '';
    for (var i = 0; i < sup.length; i++) {
      exp += superMap[sup.charAt(i)] || sup.charAt(i);
    }
    return base + '^(' + exp + ')';
  });

  text = text.replace(
    /(\([^)]+\)|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)\^(\([^)]+\)|[+-]?\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*)/g,
    function (_, base, exp) {
      return '\\(' + base + '^{' + exp + '}' + '\\)';
    }
  );

  return text;
}

const row = context.workflow['LOOP_QUESTIONS'].loop?.item || {};
const oldPrompt = row.prompt || '';
const oldAnswer = row.model_answer || '';
const oldExplanation = row.explanation || '';

const prompt = preparePlainMath(oldPrompt);
const model_answer = preparePlainMath(oldAnswer);
const explanation = preparePlainMath(oldExplanation);

const changed = prompt !== oldPrompt || model_answer !== oldAnswer || explanation !== oldExplanation;

return { id: row.id, prompt: prompt, model_answer: model_answer, explanation: explanation, changed: changed };