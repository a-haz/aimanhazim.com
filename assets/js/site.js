/*
 * site.js
 * Theme, the small-screen menu, and the lists that come from assets/data.
 */
(function () {
  'use strict';
  var html = document.documentElement;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fire(name, detail) { var ev; try { ev = new CustomEvent(name, { detail: detail }); } catch (e) { ev = document.createEvent('CustomEvent'); ev.initCustomEvent(name, false, false, detail); } document.dispatchEvent(ev); }

  try { document.createElement('canvas').getContext('2d') || html.classList.add('no-canvas'); } catch (e) { html.classList.add('no-canvas'); }

  /* ------------------------------------------------------------ theme */
  function themeLabels() {
    var light = html.getAttribute('data-theme') === 'light';
    var label = light ? 'Switch to dark mode' : 'Switch to light mode';
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) { btns[i].setAttribute('aria-label', label); btns[i].setAttribute('title', label); }
    // the page theme wins over the OS scheme, so both theme-color tags follow it
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var j = 0; j < metas.length; j++) metas[j].setAttribute('content', light ? '#f1eee8' : '#141312');
  }
  // the theme follows the system light or dark setting until the toggle is used.
  // the toggle saves a choice; toggling back to the system's own theme clears it
  var sysLight = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  function systemTheme() { return sysLight && sysLight.matches ? 'light' : 'dark'; }
  function setTheme(next) {
    if (html.getAttribute('data-theme') === next) return;
    html.setAttribute('data-theme', next);
    themeLabels();
    fire('ah:theme', next);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (!b) return;
    var next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    try {
      if (next === systemTheme()) localStorage.removeItem('ah-theme');
      else localStorage.setItem('ah-theme', next);
    } catch (err) {}
    setTheme(next);
  });
  // the system switches (at sunset, say) while the page is open: follow it, unless a choice is saved
  function onSystem() {
    var saved = null;
    try { saved = localStorage.getItem('ah-theme'); } catch (err) {}
    if (saved !== 'light' && saved !== 'dark') setTheme(systemTheme());
  }
  if (sysLight) {
    if (sysLight.addEventListener) sysLight.addEventListener('change', onSystem);
    else if (sysLight.addListener) sysLight.addListener(onSystem);
  }

  /* ------------------------------------------------------------ menu */
  var menu = document.getElementById('menu'), opener = null;
  function openMenu(btn) {
    if (!menu) return;
    opener = btn || document.activeElement;
    html.classList.add('menu-open');
    menu.removeAttribute('inert'); menu.setAttribute('aria-hidden', 'false');
    var o = document.querySelectorAll('[data-menu-open]');
    for (var i = 0; i < o.length; i++) o[i].setAttribute('aria-expanded', 'true');
    var first = menu.querySelector('a, button');
    if (first) setTimeout(function () { first.focus(); }, 30);
  }
  function closeMenu() {
    if (!menu || !html.classList.contains('menu-open')) return;
    html.classList.remove('menu-open');
    menu.setAttribute('inert', ''); menu.setAttribute('aria-hidden', 'true');
    var o = document.querySelectorAll('[data-menu-open]');
    for (var i = 0; i < o.length; i++) o[i].setAttribute('aria-expanded', 'false');
    if (opener && opener.focus) opener.focus();
  }
  if (menu) { menu.setAttribute('inert', ''); menu.setAttribute('aria-hidden', 'true'); }
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var o = e.target.closest('[data-menu-open]');
    if (o) { openMenu(o); return; }
    if (e.target.closest('[data-menu-close]')) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (!html.classList.contains('menu-open')) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key !== 'Tab') return;
    var f = menu.querySelectorAll('a, button');
    if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 760) closeMenu(); });

  /* ------------------------------------------------------------ helpers */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(d) {
    var p = String(d || '').split('-');
    if (p.length < 2) return esc(d);
    var y = p[0], m = parseInt(p[1], 10), day = p[2] ? parseInt(p[2], 10) : null;
    return (day ? day + ' ' : '') + MONTHS[m - 1] + ' ' + y;
  }
  function paras(body) {
    var b = body;
    if (b == null) return '';
    if (!Array.isArray(b)) b = [b];
    return b.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  }
  function isExternal(href) { return /^https?:/.test(href); }

  /* ------------------------------------------------------------ lists */
  function renderEntries(el, list, emptyKey, emptyEn) {
    if (!list || !list.length) { el.innerHTML = '<li class="empty">' + esc(emptyEn) + '</li>'; return; }
    var page = el.getAttribute('data-page') || '', used = {};
    el.innerHTML = list.map(function (it) {
      // the date is the anchor; a second entry on the same day gets -2, -3, ...
      var id = String(it.date), seen = used[id] = (used[id] || 0) + 1;
      if (seen > 1) id += '-' + seen;
      id = esc(id);
      return '<li id="' + id + '"><time datetime="' + esc(it.date) + '">' + fmtDate(it.date) + '</time><div><h2><a href="' + page + '#' + id + '">' + esc(it.title) + '</a></h2><div class="body">' + paras(it.body) + '</div></div></li>';
    }).join('');
  }

  function renderProjects(el, list) {
    el.innerHTML = (list || []).map(function (p, i) {
      var links = (p.links || []).map(function (l) {
        var ext = isExternal(l.href);
        return '<a href="' + esc(l.href) + '"' + (ext ? ' rel="noopener"' : '') + '>' + esc(l.label) + '<span class="arr" aria-hidden="true">' + (ext ? ' \u2197' : ' \u2192') + '</span></a>';
      }).join('');
      var n = (i + 1 < 10 ? '0' : '') + (i + 1);
      return '<li class="work"><span class="work-n" aria-hidden="true">' + n + '</span><div><h2>' + esc(p.title) + (p.tag ? ' <span class="yr">' + esc(p.tag) + '</span>' : '') + (p.year ? ' <span class="yr">' + esc(p.year) + '</span>' : '') + '</h2><p>' + esc(p.line) + '</p>' + (links ? '<p class="links">' + links + '</p>' : '') + '</div></li>';
    }).join('');
  }

  function renderGallery(el, list) {
    var empty = document.querySelector('[data-gallery-empty]');
    if (!list || !list.length) { el.innerHTML = ''; el.hidden = true; if (empty) empty.hidden = false; return; }
    el.hidden = false; if (empty) empty.hidden = true;
    el.innerHTML = list.map(function (it) {
      var size = it.w ? ' width="' + it.w + '" height="' + it.h + '"' : '', media;
      if (it.type === 'video') {
        var srcs = '';
        if (it.webm) srcs += '<source src="' + esc(it.webm) + '" type="video/webm">';
        srcs += '<source src="' + esc(it.src) + '" type="video/' + (/\.webm$/i.test(it.src) ? 'webm' : 'mp4') + '">';
        media = '<video' + size + (it.poster ? ' poster="' + esc(it.poster) + '"' : '') + ' muted playsinline controls preload="none"' + (it.loop ? ' loop' : '') + (it.alt ? ' aria-label="' + esc(it.alt) + '"' : '') + '>' + srcs + '</video>';
      } else {
        media = '<img src="' + esc(it.src) + '" alt="' + esc(it.alt || '') + '"' + size + ' loading="lazy" decoding="async">';
      }
      return '<figure class="shot' + (it.type === 'video' ? ' is-video' : '') + '">' + media +
        (it.caption || it.date ? '<figcaption><span>' + esc(it.caption || '') + '</span><span>' + (it.type === 'video' ? 'video' + (it.date ? ' · ' : '') : '') + (it.date ? fmtDate(it.date) : '') + '</span></figcaption>' : '') + '</figure>';
    }).join('');
  }

  function renderAll() {
    var els = document.querySelectorAll('[data-list]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], k = el.getAttribute('data-list');
      if (k === 'projects') renderProjects(el, window.AH_PROJECTS);
      else if (k === 'writing') renderEntries(el, window.AH_WRITING, 'writing.empty', 'Nothing here yet.');
      else if (k === 'gallery') renderGallery(el, window.AH_GALLERY);
    }
    if (location.hash && !renderAll.done) {
      renderAll.done = true;
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }
  }

  function colorsNow() {
    var cs = getComputedStyle(html);
    return { bg: cs.getPropertyValue('--bg').trim(), fg: cs.getPropertyValue('--fg').trim(), accent: cs.getPropertyValue('--accent').trim() };
  }

  /* ------------------------------------------------------------ portrait */
  // the about photo, drawn as cells until you hover or tap it
  function drawPortrait() {
    var box = document.querySelector('.portrait');
    if (!box) return;
    var img = box.querySelector('img'), cv = box.querySelector('canvas');
    if (!img || !cv) return;
    function go() {
      // a theme switch can land before the photo has loaded, or after it failed
      if (!img.naturalWidth) return;
      var size = Math.round(box.getBoundingClientRect().width) || 168;
      var dpr = Math.min(2, window.devicePixelRatio || 1), cell = 6, n = Math.floor(size / cell);
      var off = document.createElement('canvas'); off.width = n; off.height = n;
      var og = off.getContext('2d');
      var iw = img.naturalWidth, ih = img.naturalHeight, side = Math.min(iw, ih);
      var d;
      try { og.drawImage(img, (iw - side) / 2, (ih - side) * 0.3, side, side, 0, 0, n, n); d = og.getImageData(0, 0, n, n).data; } catch (e) { return; }
      cv.width = size * dpr; cv.height = size * dpr;
      var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var c = colorsNow(), light = html.getAttribute('data-theme') === 'light';
      g.fillStyle = c.bg; g.fillRect(0, 0, size, size);
      g.fillStyle = c.fg;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
        var i = (y * n + x) * 4, l = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255;
        l = Math.pow(l, 1.15);
        var v = light ? 1 - l : l;
        var s = v * (cell - 1);
        if (s < 0.8) continue;
        g.globalAlpha = 0.35 + v * 0.6;
        g.fillRect(x * cell + (cell - s) / 2, y * cell + (cell - s) / 2, s, s);
      }
      g.globalAlpha = 1;
    }
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go);
    function flip() { box.setAttribute('aria-pressed', String(box.classList.toggle('is-revealed'))); }
    box.addEventListener('click', flip);
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    document.addEventListener('ah:theme', go);
  }

  /* ------------------------------------------------------------ clock */
  // local time in Fukui, in the footer
  function tick() {
    var els = document.querySelectorAll('[data-clock]');
    if (!els.length) return;
    var now;
    try { now = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()); } catch (e) { return; }
    for (var i = 0; i < els.length; i++) els[i].textContent = 'Fukui ' + now + ' JST';
  }
  tick();
  setInterval(tick, 20000);

  /* ------------------------------------------------------------ boot */
  themeLabels();
  renderAll();
  drawPortrait();
  /* ------------------------------------------------------------ article bits */
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vids = document.querySelectorAll('video[data-autoplay]');
  for (var v = 0; v < vids.length; v++) {
    (function (vid) {
      var fig = vid.closest('figure'), btn = fig && fig.querySelector('[data-vid-toggle]');
      var paused = still;
      function lbl() { if (btn) btn.textContent = vid.paused ? 'Play' : 'Pause'; }
      if (btn) {
        btn.hidden = false;
        btn.addEventListener('click', function () { paused = !vid.paused; if (paused) vid.pause(); else vid.play().catch(function () {}); });
        vid.addEventListener('play', lbl); vid.addEventListener('pause', lbl); lbl();
      }
      if (!('IntersectionObserver' in window)) return;
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { if (!paused) vid.play().catch(function () {}); } else vid.pause();
      }, { threshold: 0.25 }).observe(vid);
    })(vids[v]);
  }
  var toc = document.querySelector('[data-toc]');
  if (toc && 'IntersectionObserver' in window) {
    var tl = toc.querySelectorAll('a[href^="#"]'), map = {};
    for (var l = 0; l < tl.length; l++) map[tl[l].getAttribute('href').slice(1)] = tl[l];
    var io = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        if (!entries[e].isIntersecting) continue;
        var id = entries[e].target.id;
        for (var k in map) map[k].classList.toggle('is-here', k === id);
      }
    }, { rootMargin: '-20% 0px -70% 0px' });
    for (var id in map) { var sec = document.getElementById(id); if (sec) io.observe(sec); }
  }
})();
