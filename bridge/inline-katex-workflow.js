// Burst-render KaTeX in question prompts. Works in production (head helpers) and editor preview (CDN fallback).

var win = typeof wwLib !== 'undefined' && wwLib.getFrontWindow ? wwLib.getFrontWindow() : window;
var doc = win.document;

var PROMPT_UIDS = [
  'ae5f2e79-0b46-4c4a-8e23-639000357860',
  'cb1a6e43-05fe-4831-8dc5-bed0b06045a5',
  'd1f67df6-fe79-4396-8be3-17d105df0a71',
  '2b368312-9d8f-4345-af1f-f0ca9a0b5f94',
];

var delimiters = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
];

function isPromptElement(el) {
  if (!el) return false;
  if (el.classList && el.classList.contains('bridging-math')) return true;
  var uid = el.getAttribute && el.getAttribute('data-ww-uid');
  return !!(uid && PROMPT_UIDS.indexOf(uid) >= 0);
}

function getPromptTextEl(el) {
  var wrapper = isPromptElement(el) ? el : (el.closest ? el.closest('.bridging-math, [data-ww-uid]') : null);
  if (!wrapper || !isPromptElement(wrapper)) return null;

  if (el && el.tagName) {
    var tag = el.tagName.toUpperCase();
    if ((tag === 'P' || tag === 'SPAN') && wrapper.contains(el)) return el;
  }

  var textEl = wrapper.querySelector('p, span');
  if (!textEl || textEl.querySelector('div, button, a, img, svg, input, textarea')) return null;
  if (textEl.children.length > 2) return null;
  return textEl;
}

function repairCorruptedMath(text) {
  if (!text || typeof text !== 'string') return text;
  text = text.replace(/\\\(([^\\]+?)\]\{([^}]+)\}\\\)/g, '\\($1^{$2}\\)');
  text = text.replace(/([A-Za-z])\d\1\^\{(\d+)\}\1\d?/g, '$1^$2');
  return text;
}

function isValidKatex(el) {
  if (!el) return false;
  var katex = el.querySelector('.katex');
  if (!katex) return false;
  return !!(katex.querySelector('math') || katex.querySelector('.katex-html'));
}

function getPromptSourceText(el) {
  if (!el) return '';
  var hash = el.getAttribute('data-katex-hash') || '';
  if (hash.indexOf('|') > 0) return hash.slice(hash.indexOf('|') + 1);
  return repairCorruptedMath((el.textContent || '').trim());
}

function isSafeMathText(text) {
  if (!text || typeof text !== 'string') return false;
  text = text.trim();
  if (!text || text.length > 500) return false;
  if (/View all questions|Practice topic|Revision notes|Mastery score|Questions in this topic|Not started|attempted|mastery/i.test(text)) {
    return false;
  }
  if (/[A-Za-z0-9]\d[A-Za-z]\^{/.test(text)) return false;
  return /\\\(|\\\[|\$\$|\^/.test(text);
}

function preparePlainMath(text) {
  if (!text || typeof text !== 'string') return text;
  text = repairCorruptedMath(text);
  if (/\\\(|\\\[|\$\$/.test(text)) return text;
  return text.replace(/(\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*)\^(\d+|[A-Za-z][A-Za-z0-9]*)/g, function (_, base, exp) {
    return '\\(' + base + '^{' + exp + '}\\)';
  });
}

function isKaTeXReady() {
  return typeof renderMathInElement === 'function' && typeof katex !== 'undefined';
}

function clearBrokenKatex(el) {
  if (!el) return;
  el.querySelectorAll('.katex').forEach(function (node) {
    if (!node.querySelector('math') && !node.querySelector('.katex-html')) {
      var parent = node.parentNode;
      if (parent && parent.childNodes.length === 1 && parent !== el) {
        parent.replaceWith(doc.createTextNode(node.textContent || ''));
      } else {
        node.replaceWith(doc.createTextNode(node.textContent || ''));
      }
    }
  });
}

function findMathNodes() {
  var nodes = [];
  var seen = new Set();

  function addWrapper(wrapper) {
    var textEl = getPromptTextEl(wrapper);
    if (!textEl || seen.has(textEl)) return;
    if (isValidKatex(textEl)) return;
    clearBrokenKatex(textEl);
    if (isSafeMathText(getPromptSourceText(textEl))) {
      seen.add(textEl);
      nodes.push(textEl);
    }
  }

  PROMPT_UIDS.forEach(function (uid) {
    [
      '[data-ww-uid="' + uid + '"]',
      '.ww-element-' + uid,
      '[class*="ww-element-' + uid + '"]',
    ].forEach(function (selector) {
      try {
        doc.querySelectorAll(selector).forEach(addWrapper);
      } catch (e) {}
    });
  });

  doc.querySelectorAll('.bridging-math').forEach(addWrapper);
  return nodes;
}

function renderMathNodes(force) {
  var renderFn = win.renderMathInElement || (typeof renderMathInElement === 'function' ? renderMathInElement : null);
  if (!renderFn || !isKaTeXReady()) return 0;

  var rendered = 0;
  findMathNodes().forEach(function (target) {
    if (!force && isValidKatex(target)) {
      rendered++;
      return;
    }

    clearBrokenKatex(target);

    var raw = getPromptSourceText(target);
    if (!isSafeMathText(raw)) return;

    var prepared = preparePlainMath(raw);
    var hash = prepared.length + '|' + prepared.slice(0, 120);
    if (!force && target.getAttribute('data-katex-hash') === hash && isValidKatex(target)) {
      rendered++;
      return;
    }
    if (target.querySelector('div, button, a, img, svg')) return;

    target.textContent = prepared;
    renderFn(target, { delimiters: delimiters, throwOnError: false });
    if (!isValidKatex(target)) {
      target.removeAttribute('data-katex-hash');
      target.removeAttribute('data-katex-rendered');
      return;
    }
    target.setAttribute('data-katex-hash', hash);
    target.setAttribute('data-katex-rendered', 'true');
    rendered++;
  });

  return rendered;
}

function loadScript(src, onload) {
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
}

function ensureKaTeX(onReady) {
  if (isKaTeXReady()) {
    onReady();
    return;
  }

  if (!win.__bridgingKatexLoading) {
    win.__bridgingKatexLoading = true;
    win.__bridgingKatexQueue = win.__bridgingKatexQueue || [];

    if (!doc.getElementById('bridging-katex-css')) {
      var link = doc.createElement('link');
      link.id = 'bridging-katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css';
      doc.head.appendChild(link);
    }

    loadScript('https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.js', function () {
      loadScript('https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/contrib/auto-render.min.js', function () {
        win.__bridgingKatexLoading = false;
        var queue = win.__bridgingKatexQueue || [];
        win.__bridgingKatexQueue = [];
        for (var i = 0; i < queue.length; i++) queue[i]();
      });
    });
  }

  win.__bridgingKatexQueue = win.__bridgingKatexQueue || [];
  win.__bridgingKatexQueue.push(onReady);
}

function burstRender(durationMs, intervalMs) {
  var endAt = Date.now() + (durationMs || 4500);
  var interval = intervalMs || 300;

  var tick = function () {
    renderMathNodes(false);
    if (Date.now() < endAt) setTimeout(tick, interval);
  };

  ensureKaTeX(tick);
}

// Production often keeps an outdated custom-head bundle after publish. Only delegate
// to head helpers when they include the current fake-KaTeX repair logic.
var headHelpersAreCurrent =
  typeof win.bridgingIsValidKatex === 'function' &&
  typeof win.bridgingRepairCorruptedMath === 'function' &&
  typeof win.bridgingClearBrokenKatex === 'function' &&
  (!win.bridgingFindMathNodes ||
    String(win.bridgingFindMathNodes).indexOf("querySelector('.katex')") < 0);

if (headHelpersAreCurrent && typeof win.bridgingRenderMathBurst === 'function') {
  if (typeof win.bridgingEnsureKaTeXLoaded === 'function') {
    win.bridgingEnsureKaTeXLoaded(function () {
      win.bridgingRenderMathBurst(4500, 300);
    });
  } else {
    win.bridgingRenderMathBurst(4500, 300);
  }
  return true;
}

burstRender(4500, 300);
return true;
