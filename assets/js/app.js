/* ============================================================================
 *  app.js  —  the engine.
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
      // On sub-pages (no in-page sections) scroll-spy has nothing to track,
      // so highlight the Log link directly to keep the active state consistent.
      if (base === "/") {
        var logLink = qs('#nav-links a[href="/progress.html"]');
        if (logLink) logLink.classList.add("is-current");
      }
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
      // A spinner marks each item as actively "in progress".
      wrap.appendChild(el("div", { class: "hud-row" }, [
        el("span", { class: "spinner", "aria-hidden": "true" }),
        el("div", { class: "hud-line" }, [
          el("span", { class: "hud-label" }, [it.label]),
          it.detail ? el("span", { class: "hud-detail" }, [it.detail]) : null,
        ]),
      ]));
    });
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

  /* ---- social icons + footer ------------------------------------------- */
  // Icon glyphs are matched to a link by its URL, so adding a social later is
  // just one more entry in contact.links — the right icon is picked up here.
  var ICONS = {
    github: '<path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56 0-.27-.01-1.16-.02-2.1-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.25 1.84 1.25 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.54.12-3.2 0 0 1.01-.33 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.56 3.3-1.23 3.3-1.23.66 1.66.24 2.89.12 3.2.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.38.81 1.12.81 2.26 0 1.63-.01 2.95-.01 3.35 0 .31.21.68.83.56C20.56 21.88 24 17.49 24 12.29 24 5.78 18.63.5 12 .5z"/>',
    email: '<path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.7.5L12 11.2 19.3 6H4.7ZM20 7.4l-7.4 5.27a1 1 0 0 1-1.16 0L4 7.4V18h16V7.4Z"/>',
    linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.03-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V21H9V9Z"/>',
    x: '<path d="M17.53 3H20.5l-6.49 7.41L21.75 21h-6.02l-4.71-6.16L5.62 21H2.65l6.94-7.93L2.25 3h6.17l4.26 5.63L17.53 3Zm-1.06 16.2h1.65L7.6 4.71H5.83L16.47 19.2Z"/>',
    instagram: '<path d="M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.8.22 2.43.47.66.25 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.63.42 1.36.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.8-.47 2.43a4.9 4.9 0 0 1-2.92 2.92c-.63.25-1.36.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.8-.22-2.43-.47a4.9 4.9 0 0 1-2.92-2.92c-.25-.63-.42-1.36-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.8.47-2.43A4.9 4.9 0 0 1 5.45 2.53c.63-.25 1.36-.42 2.43-.47C8.94 2.01 9.28 2 12 2Zm0 1.8c-2.67 0-2.99.01-4.04.06-.98.04-1.5.21-1.86.35-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.36-.31.88-.35 1.86-.05 1.05-.06 1.37-.06 4.04s.01 2.99.06 4.04c.04.98.21 1.5.35 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.36.14.88.31 1.86.35 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.98-.04 1.5-.21 1.86-.35.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.36.31-.88.35-1.86.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.04-.98-.21-1.5-.35-1.86a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.36-.14-.88-.31-1.86-.35-1.05-.05-1.37-.06-4.04-.06Zm0 3.06a5.14 5.14 0 1 1 0 10.28 5.14 5.14 0 0 1 0-10.28Zm0 1.8a3.34 3.34 0 1 0 0 6.68 3.34 3.34 0 0 0 0-6.68Zm5.34-3.23a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/>',
    link: '<path d="M10.6 13.4a1 1 0 0 0 1.42 0l3.54-3.54a3 3 0 1 0-4.24-4.24l-1.3 1.3a1 1 0 0 0 1.42 1.42l1.3-1.3a1 1 0 1 1 1.4 1.4L10.6 12a1 1 0 0 0 0 1.4Zm2.8-2.8a1 1 0 0 0-1.42 0L8.44 14.14a3 3 0 1 0 4.24 4.24l1.3-1.3a1 1 0 0 0-1.42-1.42l-1.3 1.3a1 1 0 1 1-1.4-1.4L13.4 12a1 1 0 0 0 0-1.4Z"/>',
  };
  function iconSVG(name) {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">'
      + (ICONS[name] || ICONS.link) + "</svg>";
  }
  function iconForHref(href) {
    var h = (href || "").toLowerCase();
    if (h.indexOf("mailto:") === 0) return "email";
    if (h.indexOf("github.com") >= 0) return "github";
    if (h.indexOf("linkedin.com") >= 0) return "linkedin";
    if (h.indexOf("twitter.com") >= 0 || h.indexOf("//x.com") >= 0 || h.indexOf(".x.com") >= 0) return "x";
    if (h.indexOf("instagram.com") >= 0) return "instagram";
    return "link";
  }
  function renderFooter(c) {
    var fs = qs("#footer-socials");
    if (!fs) return;
    clear(fs);
    (c.contact.links || []).forEach(function (lnk) {
      var ext = lnk.href.indexOf("http") === 0;
      fs.appendChild(el("a", {
        class: "foot-social", href: lnk.href,
        "aria-label": lnk.label, title: lnk.label,
        target: ext ? "_blank" : null, rel: ext ? "noopener noreferrer" : null,
        html: iconSVG(iconForHref(lnk.href)),
      }));
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
    renderFooter(c);
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
