/* ============================================================================
 *  app.js  —  the engine. You normally don't need to edit this file.
 *  It reads content.js + progress.js and renders the page, and handles the
 *  language switch, dark/light theme, animations, and the log feed.
 * ==========================================================================*/
(function () {
  "use strict";

  var C = window.SITE_CONTENT || {};
  var LANGS = Object.keys(C);                 // ["en","ja","ms"]
  var DEFAULT_LANG = "en";
  var LS_LANG = "ah-lang";
  var LS_THEME = "ah-theme";
  var LOCALE = { en: "en-GB", ja: "ja-JP", ms: "ms-MY" };

  /* ---- tiny helpers ---------------------------------------------------- */
  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); }
  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  // resolve "a.b.c" against an object
  function get(obj, path) {
    return path.split(".").reduce(function (o, k) {
      return (o == null) ? undefined : o[k];
    }, obj);
  }
  // create an element: el("a", {class:"btn", href:"#"}, ["text" or node, ...])
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  /* ---- language -------------------------------------------------------- */
  function pickInitialLang() {
    var saved = localStorage.getItem(LS_LANG);
    if (saved && C[saved]) return saved;
    var nav = (navigator.language || "en").slice(0, 2);
    if (C[nav]) return nav;
    return DEFAULT_LANG;
  }
  var lang = pickInitialLang();

  function setLang(next) {
    if (!C[next]) return;
    lang = next;
    try { localStorage.setItem(LS_LANG, next); } catch (e) {}
    render();
  }

  /* ---- theme ----------------------------------------------------------- */
  function initialTheme() {
    var saved = localStorage.getItem(LS_THEME);
    if (saved === "light" || saved === "dark") return saved;
    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var meta = qs('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f5f7fb" : "#0b1120");
    var btn = qs("#theme-toggle");
    if (btn) {
      var c = C[lang] || C[DEFAULT_LANG];
      var toDark = theme === "light";
      btn.setAttribute("aria-label", toDark ? c.ui.themeToDark : c.ui.themeToLight);
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      var icon = qs(".theme-icon", btn);
      if (icon) icon.textContent = theme === "light" ? "☾" : "☀";
    }
  }
  function setTheme(theme) {
    try { localStorage.setItem(LS_THEME, theme); } catch (e) {}
    applyTheme(theme);
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(cur === "dark" ? "light" : "dark");
  }

  /* ---- text bindings: [data-i18n], [data-i18n-html], [data-i18n-attr] -- */
  function applyBindings(c) {
    qsa("[data-i18n]").forEach(function (n) {
      var v = get(c, n.getAttribute("data-i18n"));
      if (v != null) n.textContent = v;
    });
    qsa("[data-i18n-html]").forEach(function (n) {
      var v = get(c, n.getAttribute("data-i18n-html"));
      if (v != null) n.innerHTML = v;
    });
    // data-i18n-attr="aria-label:ui.menu; placeholder:contact.form.name"
    qsa("[data-i18n-attr]").forEach(function (n) {
      n.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var bits = pair.split(":");
        if (bits.length < 2) return;
        var attr = bits[0].trim();
        var v = get(c, bits[1].trim());
        if (v != null) n.setAttribute(attr, v);
      });
    });
  }

  /* ---- nav + controls -------------------------------------------------- */
  function renderNav(c) {
    var ul = qs("#nav-links");
    if (ul) {
      clear(ul);
      // On sub-pages (no #top hero), point section links back to the home page.
      var base = document.getElementById("top") ? "" : "/";
      var items = [
        [base + "#about", c.nav.about], [base + "#research", c.nav.research],
        [base + "#now", c.nav.now], ["/progress.html", c.nav.log],
        [base + "#contact", c.nav.contact],
      ];
      items.forEach(function (it) {
        ul.appendChild(el("li", null, [el("a", { href: it[0], class: "nav-link" }, [it[1]])]));
      });
    }
    // language segmented control
    var ls = qs("#lang-switch");
    if (ls) {
      clear(ls);
      ls.setAttribute("role", "group");
      ls.setAttribute("aria-label", c.ui.langLabel);
      LANGS.forEach(function (code) {
        var b = el("button", {
          type: "button", class: "lang-btn" + (code === lang ? " is-active" : ""),
          "data-lang": code, "aria-pressed": String(code === lang),
        }, [C[code].langName]);
        b.addEventListener("click", function () { setLang(code); });
        ls.appendChild(b);
      });
    }
  }

  /* ---- hero ------------------------------------------------------------ */
  var roleTimer = null;
  function renderHero(c) {
    var rolesEl = qs("#hero-roles");
    if (!rolesEl) return;
    var roles = c.hero.roles || [];
    if (roleTimer) { clearTimeout(roleTimer); roleTimer = null; }

    if (reduceMotion() || roles.length <= 1) {
      rolesEl.textContent = roles[0] || "";
      return;
    }
    // typewriter cycle
    var i = 0, j = 0, deleting = false;
    function tick() {
      var word = roles[i % roles.length];
      j = deleting ? j - 1 : j + 1;
      rolesEl.textContent = word.slice(0, j);
      var delay = deleting ? 35 : 65;
      if (!deleting && j === word.length) { delay = 1500; deleting = true; }
      else if (deleting && j === 0) { deleting = false; i++; delay = 350; }
      roleTimer = setTimeout(tick, delay);
    }
    rolesEl.textContent = "";
    tick();
  }

  /* ---- learning HUD ---------------------------------------------------- */
  function renderLearning(c) {
    var wrap = qs("#learning-items");
    if (!wrap) return;
    clear(wrap);
    (c.learning.items || []).forEach(function (it) {
      var pct = Math.max(0, Math.min(100, it.percent || 0));
      var fill = el("span", { class: "bar-fill" });
      var row = el("div", { class: "hud-row" }, [
        el("div", { class: "hud-line" }, [
          el("span", { class: "hud-label" }, [it.label]),
          el("span", { class: "hud-pct", "data-target": pct }, ["0%"]),
        ]),
        el("div", { class: "bar", role: "progressbar", "aria-valuenow": pct,
                    "aria-valuemin": 0, "aria-valuemax": 100,
                    "aria-label": it.label }, [fill]),
        el("div", { class: "hud-detail" }, [it.detail || ""]),
      ]);
      row._fill = fill; row._pct = pct; row._num = qs(".hud-pct", row);
      wrap.appendChild(row);
    });
    animateHud(wrap);
  }
  function animateHud(wrap) {
    var rows = qsa(".hud-row", wrap);
    function run(row) {
      if (reduceMotion()) {
        row._fill.style.width = row._pct + "%";
        row._num.textContent = row._pct + "%";
        return;
      }
      requestAnimationFrame(function () { row._fill.style.width = row._pct + "%"; });
      var start = null, dur = 900;
      function step(ts) {
        if (start == null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        row._num.textContent = Math.round(p * row._pct) + "%";
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) { rows.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    rows.forEach(function (r) { io.observe(r); });
  }

  /* ---- about ----------------------------------------------------------- */
  function renderAbout(c) {
    var p = qs("#about-paragraphs");
    if (p) { clear(p); (c.about.paragraphs || []).forEach(function (t) { p.appendChild(el("p", null, [t])); }); }
    var f = qs("#about-facts");
    if (f) {
      clear(f);
      (c.about.facts || []).forEach(function (fact) {
        f.appendChild(el("div", { class: "fact" }, [
          el("dt", null, [fact.label]),
          el("dd", null, [fact.value]),
        ]));
      });
    }
  }

  /* ---- research -------------------------------------------------------- */
  function renderResearch(c) {
    var s = qs("#research-sensors");
    if (s) { clear(s); (c.research.sensors || []).forEach(function (t) { s.appendChild(el("li", { class: "chip" }, [t])); }); }
    var ph = qs("#research-phases");
    if (ph) {
      clear(ph);
      (c.research.phases || []).forEach(function (p) {
        ph.appendChild(el("article", { class: "phase reveal" }, [
          el("span", { class: "phase-tag" }, [p.tag]),
          el("h3", null, [p.title]),
          el("p", null, [p.desc]),
        ]));
      });
    }
  }

  /* ---- now / roadmap --------------------------------------------------- */
  function renderNow(c) {
    var r = qs("#now-roadmap");
    if (!r) return;
    clear(r);
    (c.now.roadmap || []).forEach(function (m) {
      r.appendChild(el("li", { class: "milestone reveal " + (m.state || "future") }, [
        el("span", { class: "milestone-dot", "aria-hidden": "true" }),
        el("div", { class: "milestone-body" }, [
          el("span", { class: "milestone-date" }, [m.date]),
          el("h3", null, [m.title]),
          el("p", null, [m.desc]),
        ]),
      ]));
    });
  }

  /* ---- skills ---------------------------------------------------------- */
  function renderSkills(c) {
    var g = qs("#skills-groups");
    if (!g) return;
    clear(g);
    (c.skills.groups || []).forEach(function (grp) {
      var chips = el("ul", { class: "chip-row" });
      (grp.items || []).forEach(function (it) {
        chips.appendChild(el("li", { class: "chip" }, [
          it.name,
          it.note ? el("span", { class: "chip-note" }, [it.note]) : null,
        ]));
      });
      g.appendChild(el("div", { class: "skill-group reveal" }, [
        el("h3", { class: "skill-group-name" }, [grp.name]),
        chips,
      ]));
    });
  }

  /* ---- projects -------------------------------------------------------- */
  function renderProjects(c) {
    var grid = qs("#projects-grid");
    if (!grid) return;
    clear(grid);
    (c.projects.items || []).forEach(function (p) {
      var tags = el("ul", { class: "card-tags" });
      (p.tags || []).forEach(function (t) { tags.appendChild(el("li", null, [t])); });
      var kids = [el("h3", null, [p.title]), el("p", null, [p.desc]), tags];
      if (p.link) {
        kids.push(el("a", { class: "card-link", href: p.link,
          target: "_blank", rel: "noopener noreferrer" },
          [(p.linkLabel || "View") + " →"]));
      }
      grid.appendChild(el("article", { class: "card reveal" }, kids));
    });
  }

  /* ---- contact --------------------------------------------------------- */
  function renderContact(c) {
    var l = qs("#contact-links");
    if (!l) return;
    clear(l);
    (c.contact.links || []).forEach(function (lnk) {
      var ext = lnk.href.indexOf("http") === 0;
      l.appendChild(el("a", {
        class: "social-link", href: lnk.href,
        target: ext ? "_blank" : null, rel: ext ? "noopener noreferrer" : null,
      }, [
        el("span", { class: "social-label" }, [lnk.label]),
        el("span", { class: "social-value" }, [lnk.value]),
      ]));
    });
  }

  /* ---- progress page --------------------------------------------------- */
  var activeFilter = "__all__";
  function entryText(entry) {
    return entry[lang] || entry.en || entry.ja || entry.ms || {};
  }
  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    try {
      return new Intl.DateTimeFormat(LOCALE[lang] || "en", {
        year: "numeric", month: "short", day: "numeric",
      }).format(d);
    } catch (e) { return iso; }
  }
  function renderProgress(c) {
    var feed = qs("#log-feed");
    if (!feed) return;
    var entries = (window.PROGRESS_ENTRIES || []).slice().sort(function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });

    // filter chips
    var filters = qs("#log-filters");
    if (filters) {
      clear(filters);
      var tags = ["__all__"];
      entries.forEach(function (e) {
        (e.tags || []).forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); });
      });
      tags.forEach(function (t) {
        var label = t === "__all__" ? c.progressPage.filterAll : t;
        var b = el("button", {
          type: "button",
          class: "filter-chip" + (t === activeFilter ? " is-active" : ""),
          "data-filter": t, "aria-pressed": String(t === activeFilter),
        }, [label]);
        b.addEventListener("click", function () { activeFilter = t; renderProgress(c); });
        filters.appendChild(b);
      });
    }

    clear(feed);
    var shown = entries.filter(function (e) {
      return activeFilter === "__all__" || (e.tags || []).indexOf(activeFilter) >= 0;
    });
    if (!shown.length) {
      feed.appendChild(el("p", { class: "log-empty" }, [c.progressPage.empty]));
      return;
    }
    shown.forEach(function (e) {
      var tx = entryText(e);
      var head = el("header", { class: "log-head" }, [
        el("time", { class: "log-date", datetime: e.date }, [fmtDate(e.date)]),
        el("h2", null, [tx.title || ""]),
      ]);
      var tagRow = el("ul", { class: "card-tags" });
      (e.tags || []).forEach(function (t) { tagRow.appendChild(el("li", null, [t])); });

      var bodyWrap = el("div", { class: "log-body" });
      var paras = Array.isArray(tx.body) ? tx.body : (tx.body ? [tx.body] : []);
      paras.forEach(function (p) { bodyWrap.appendChild(el("p", null, [p])); });

      var kids = [head, tagRow, bodyWrap];
      if (e.images && e.images.length) {
        var gal = el("div", { class: "log-gallery" });
        e.images.forEach(function (src) {
          gal.appendChild(el("a", { href: src, target: "_blank", rel: "noopener noreferrer" }, [
            el("img", { src: src, alt: tx.title || "", loading: "lazy" }),
          ]));
        });
        kids.push(gal);
      }
      feed.appendChild(el("article", { class: "log-entry reveal" }, kids));
    });
    observeReveals();
  }

  /* ---- scroll reveals -------------------------------------------------- */
  var revealIO = null;
  function observeReveals() {
    var els = qsa(".reveal:not(.is-visible)");
    if (reduceMotion() || !("IntersectionObserver" in window)) {
      els.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); revealIO.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }
    els.forEach(function (n) { revealIO.observe(n); });
  }

  /* ---- active nav link on scroll -------------------------------------- */
  function initScrollSpy() {
    var sections = qsa("section[id], header[id]");
    if (!sections.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        qsa("#nav-links .nav-link").forEach(function (a) {
          a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---- master render --------------------------------------------------- */
  function render() {
    var c = C[lang] || C[DEFAULT_LANG];
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", c.dir || "ltr");
    document.title = c.hero.name + " · " + c.hero.eyebrow;

    applyBindings(c);
    renderNav(c);
    renderHero(c);
    renderLearning(c);
    renderAbout(c);
    renderResearch(c);
    renderNow(c);
    renderSkills(c);
    renderProjects(c);
    renderContact(c);
    renderProgress(c);
    applyTheme(document.documentElement.getAttribute("data-theme") || initialTheme());
    observeReveals();
  }

  /* ---- boot ------------------------------------------------------------ */
  function boot() {
    applyTheme(initialTheme());

    var tt = qs("#theme-toggle");
    if (tt) tt.addEventListener("click", toggleTheme);

    var mt = qs("#menu-toggle");
    var nav = qs("#primary-nav");
    if (mt && nav) {
      mt.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        mt.setAttribute("aria-expanded", String(open));
      });
      qsa("a", nav).forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          mt.setAttribute("aria-expanded", "false");
        });
      });
    }

    var y = qs("#year");
    if (y) y.textContent = new Date().getFullYear();

    render();
    initScrollSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
