(function () {
  function mount() {
    if (location.pathname === '/today' || location.pathname.indexOf('/today/') === 0) return;
    if (document.getElementById('bridging-daily-banner')) return;

    var bar = document.createElement('a');
    bar.id = 'bridging-daily-banner';
    bar.href = '/today';
    bar.innerHTML = '<span>Today’s daily E-Math question</span><strong>Try it today!</strong>';
    document.body.insertBefore(bar, document.body.firstChild);

    var app = document.getElementById('app');
    if (app) app.style.setProperty('margin-top', '44px', 'important');
  }

  var style = document.createElement('style');
  style.textContent =
    '#bridging-daily-banner{position:fixed;top:0;left:0;right:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;gap:12px;height:44px;box-sizing:border-box;background:#111;color:#fff;text-decoration:none;font:500 14px/1 Inter,sans-serif;padding:0 16px;}' +
    '#bridging-daily-banner strong{font-weight:700;}' +
    '@media (max-width:640px){#bridging-daily-banner{font-size:13px;gap:8px;}}';
  document.head.appendChild(style);

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
