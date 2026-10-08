// Safe KaTeX helpers for BRIDGING — only typeset known question-prompt elements.

window.BRIDGING_MATH_ELEMENT_UIDS = [
  'ae5f2e79-0b46-4c4a-8e23-639000357860', // Topics question prompt
  'cb1a6e43-05fe-4831-8dc5-bed0b06045a5', // Practice question prompt
  'd1f67df6-fe79-4396-8be3-17d105df0a71', // Model answer
  '2b368312-9d8f-4345-af1f-f0ca9a0b5f94', // Worked solution
];

window.bridgingMathDelimiters = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
];

window.bridgingFixMojibake = function (text) {
  if (!text || typeof text !== 'string') return text;
  try {
    return decodeURIComponent(escape(text));
  } catch (e) {
    return text;
  }
};

window.bridgingRepairCorruptedMath = function (text) {
  if (!text || typeof text !== 'string') return text;

  // Old converter bug: \(x]{2}\) instead of \(x^{2}\)
  text = text.replace(/\\\(([^\\]+?)\]\{([^}]+)\}\\\)/g, '\\($1^{$2}\\)');

  // Failed render leftovers such as x2x^{2}x2
  text = text.replace(/([A-Za-z])\d\1\^\{(\d+)\}\1\d?/g, '$1^$2');

  return text;
};

window.bridgingIsValidKatex = function (el) {
  if (!el) return false;
  var katex = el.querySelector('.katex');
  if (!katex) return false;
  return !!(katex.querySelector('math') || katex.querySelector('.katex-html'));
};

window.bridgingGetPromptSourceText = function (el) {
  if (!el) return '';

  var hash = el.getAttribute('data-katex-hash') || '';
  if (hash.indexOf('|') > 0) {
    return hash.slice(hash.indexOf('|') + 1);
  }

  return window.bridgingRepairCorruptedMath((el.textContent || '').trim());
};

window.bridgingIsPromptUid = function (uid) {
  return window.BRIDGING_MATH_ELEMENT_UIDS.indexOf(uid) >= 0;
};

window.bridgingIsPromptElement = function (el) {
  if (!el) return false;
  if (el.classList && el.classList.contains('bridging-math')) return true;

  var uid = el.getAttribute && el.getAttribute('data-ww-uid');
  if (uid && window.bridgingIsPromptUid(uid)) return true;

  var closest = el.closest ? el.closest('[data-ww-uid]') : null;
  return !!(closest && window.bridgingIsPromptUid(closest.getAttribute('data-ww-uid') || ''));
};

window.bridgingGetPromptWrapper = function (el) {
  if (!el) return null;
  if (window.bridgingIsPromptElement(el)) return el;
  return el.closest ? el.closest('.bridging-math, [data-ww-uid]') : null;
};

window.bridgingFindPromptWrappers = function (uid) {
  var wrappers = [];
  var seen = new Set();

  function add(el) {
    if (!el || seen.has(el) || !window.bridgingIsPromptElement(el)) return;
    seen.add(el);
    wrappers.push(el);
  }

  [
    '[data-ww-uid="' + uid + '"]',
    '.ww-element-' + uid,
    '[class*="ww-element-' + uid + '"]',
  ].forEach(function (selector) {
    try {
      document.querySelectorAll(selector).forEach(add);
    } catch (e) {}
  });

  return wrappers;
};

window.bridgingGetPromptTextEl = function (el) {
  var wrapper = window.bridgingGetPromptWrapper(el);
  if (!wrapper || !window.bridgingIsPromptElement(wrapper)) {
    return null;
  }

  if (el && el.tagName) {
    var tag = el.tagName.toUpperCase();
    if ((tag === 'P' || tag === 'SPAN') && wrapper.contains(el)) {
      return el;
    }
  }

  var textEl = wrapper.querySelector('p, span');
  if (!textEl) return null;
  if (textEl.querySelector('div, button, a, img, svg, input, textarea')) return null;
  if (textEl.children.length > 2) return null;
  return textEl;
};

window.bridgingIsSafeMathText = function (text) {
  if (!text || typeof text !== 'string') return false;
  text = text.trim();
  if (!text || text.length > 500) return false;
  if (/View all questions|Practice topic|Revision notes|Mastery score|Questions in this topic|Not started|attempted|mastery/i.test(text)) {
    return false;
  }
  if (/[A-Za-z0-9]\d[A-Za-z]\^{/.test(text)) return false;
  return /\\\(|\\\[|\$\$|\^/.test(text);
};

window.bridgingPreparePlainMath = function (text) {
  if (!text || typeof text !== 'string') return text;

  text = window.bridgingFixMojibake(text);
  text = window.bridgingRepairCorruptedMath(text);
  if (/\\\(|\\\[|\$\$/.test(text)) return text;

  return text.replace(/(\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*)\^(\d+|[A-Za-z][A-Za-z0-9]*)/g, function (_, base, exp) {
    return '\\(' + base + '^{' + exp + '}\\)';
  });
};

window.bridgingClearBrokenKatex = function (el) {
  if (!el) return;
  el.querySelectorAll('.katex').forEach(function (node) {
    if (!node.querySelector('math') && !node.querySelector('.katex-html')) {
      var parent = node.parentNode;
      if (parent && parent.childNodes.length === 1 && parent !== el) {
        parent.replaceWith(document.createTextNode(node.textContent || ''));
      } else {
        node.replaceWith(document.createTextNode(node.textContent || ''));
      }
    }
  });
};

window.bridgingFindMathNodes = function () {
  var nodes = [];
  var seen = new Set();

  function addWrapper(wrapper) {
    var textEl = window.bridgingGetPromptTextEl(wrapper);
    if (!textEl || seen.has(textEl)) return;
    if (window.bridgingIsValidKatex(textEl)) return;
    window.bridgingClearBrokenKatex(textEl);
    if (window.bridgingIsSafeMathText(window.bridgingGetPromptSourceText(textEl))) {
      seen.add(textEl);
      nodes.push(textEl);
    }
  }

  window.BRIDGING_MATH_ELEMENT_UIDS.forEach(function (uid) {
    window.bridgingFindPromptWrappers(uid).forEach(addWrapper);
  });

  document.querySelectorAll('.bridging-math').forEach(addWrapper);

  return nodes;
};

window.bridgingLoadScript = function (doc, src, onload) {
  var existing = doc.querySelector('script[src="' + src + '"]');
  if (existing) {
    if (existing.getAttribute('data-loaded') === '1') {
      onload();
      return;
    }
    existing.addEventListener('load', onload);
    return;
  }

  var script = doc.createElement('script');
  script.src = src;
  script.onload = function () {
    script.setAttribute('data-loaded', '1');
    onload();
  };
  doc.head.appendChild(script);
};

window.bridgingIsKaTeXReady = function () {
  return typeof renderMathInElement === 'function' && typeof katex !== 'undefined';
};

window.bridgingEnsureKaTeXLoaded = function (callback) {
  var doc = document;
  if (window.bridgingIsKaTeXReady()) {
    callback();
    return;
  }

  if (!window.__bridgingKatexLoading) {
    window.__bridgingKatexLoading = true;
    window.__bridgingKatexQueue = window.__bridgingKatexQueue || [];

    if (!doc.getElementById('bridging-katex-css')) {
      var link = doc.createElement('link');
      link.id = 'bridging-katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css';
      doc.head.appendChild(link);
    }

    window.bridgingLoadScript(doc, 'https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.js', function () {
      window.bridgingLoadScript(doc, 'https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/contrib/auto-render.min.js', function () {
        window.__bridgingKatexLoading = false;
        var queue = window.__bridgingKatexQueue || [];
        window.__bridgingKatexQueue = [];
        for (var i = 0; i < queue.length; i++) queue[i]();
      });
    });
  }

  window.__bridgingKatexQueue = window.__bridgingKatexQueue || [];
  window.__bridgingKatexQueue.push(callback);
};

window.bridgingWaitForKaTeX = function (callback, triesLeft) {
  if (window.bridgingIsKaTeXReady()) {
    callback();
    return;
  }

  if (typeof window.bridgingEnsureKaTeXLoaded === 'function') {
    window.bridgingEnsureKaTeXLoaded(callback);
    return;
  }

  if (triesLeft === undefined) triesLeft = 100;
  if (triesLeft <= 0) return;
  setTimeout(function () {
    window.bridgingWaitForKaTeX(callback, triesLeft - 1);
  }, 50);
};

window.bridgingRenderMathInEl = function (el, force) {
  if (!el || typeof renderMathInElement !== 'function') return false;

  var target = window.bridgingGetPromptTextEl(el);
  if (!target) return false;

  if (!force && window.bridgingIsValidKatex(target)) return true;

  window.bridgingClearBrokenKatex(target);

  var raw = window.bridgingGetPromptSourceText(target);
  if (!window.bridgingIsSafeMathText(raw)) return false;

  var prepared = window.bridgingPreparePlainMath(raw);
  var hash = prepared.length + '|' + prepared.slice(0, 120);

  if (!force && target.getAttribute('data-katex-hash') === hash && window.bridgingIsValidKatex(target)) {
    return true;
  }

  if (target.querySelector('div, button, a, img, svg')) return false;
  if (!window.bridgingIsKaTeXReady()) return false;

  target.textContent = prepared;
  renderMathInElement(target, {
    delimiters: window.bridgingMathDelimiters,
    throwOnError: false,
  });

  if (!window.bridgingIsValidKatex(target)) {
    target.removeAttribute('data-katex-hash');
    target.removeAttribute('data-katex-rendered');
    return false;
  }

  target.setAttribute('data-katex-hash', hash);
  target.setAttribute('data-katex-rendered', 'true');
  return true;
};

window.bridgingRenderMath = function (selector, force) {
  window.bridgingWaitForKaTeX(function () {
    var nodes;

    if (selector) {
      nodes = [];
      Array.from(document.querySelectorAll(selector)).forEach(function (el) {
        var target = window.bridgingGetPromptTextEl(el);
        if (target) nodes.push(target);
      });
    } else {
      nodes = window.bridgingFindMathNodes();
    }

    nodes.forEach(function (el) {
      window.bridgingRenderMathInEl(el, force);
    });
  });
};

window.bridgingRenderMathBurst = function (durationMs, intervalMs) {
  var endAt = Date.now() + (durationMs || 4000);
  var interval = intervalMs || 300;

  var tick = function () {
    window.bridgingRenderMath(null, false);
    if (Date.now() < endAt) {
      setTimeout(tick, interval);
    }
  };

  window.bridgingWaitForKaTeX(tick);
};
