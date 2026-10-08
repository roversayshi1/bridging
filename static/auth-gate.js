(function () {
  var gated = /^\/(practice|notes|topics|dashboard|analytics|account|admin)(\/|$)/;
  var checking = false;

  function hasClientSessionHint() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i) || '';
        if (/better-auth|supabase|session_token|bridging/i.test(key) && localStorage.getItem(key)) return true;
      }
    } catch (e) {}
    return false;
  }

  function sessionLooksValid(payload) {
    if (!payload) return false;
    if (payload.user && (payload.user.id || payload.user.email)) return true;
    if (payload.session && payload.session.userId) return true;
    return false;
  }

  function guard(attempt) {
    if (!gated.test(location.pathname)) {
      paintBrix();
      return;
    }
    if (checking && !attempt) return;
    checking = true;
    fetch('/api/auth/get-session', { credentials: 'include' })
      .then(function (res) {
        return res.json();
      })
      .then(function (session) {
        if (sessionLooksValid(session)) {
          checking = false;
          paintBrix();
          return;
        }
        var next = (attempt || 0) + 1;
        if (next < 6) {
          setTimeout(function () { guard(next); }, 250);
          return;
        }
        checking = false;
        if (hasClientSessionHint()) {
          paintBrix();
          return;
        }
        location.replace('/login');
      })
      .catch(function () {
        checking = false;
        paintBrix();
      });
  }

  function paintBrix() {
    var onPractice = /^\/practice(\/|$)/.test(location.pathname);
    var existing = document.getElementById('bridging-brix');
    if (!onPractice) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    var img = document.createElement('img');
    img.id = 'bridging-brix';
    img.src = '/brand/brix.png';
    img.alt = 'Brix';
    img.style.cssText =
      'position:fixed;right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));width:min(132px,26vw);height:auto;z-index:40;pointer-events:none;filter:drop-shadow(0 10px 18px rgba(15,23,42,.18));';
    document.body.appendChild(img);
  }

  var push = history.pushState;
  history.pushState = function () {
    var result = push.apply(this, arguments);
    guard(0);
    return result;
  };
  var replace = history.replaceState;
  history.replaceState = function () {
    var result = replace.apply(this, arguments);
    guard(0);
    return result;
  };
  window.addEventListener('popstate', function () { guard(0); });
  guard(0);
})();
