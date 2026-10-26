/*
 * robot.js
 *
 * A four-legged walker, drawn in 3D and then snapped to a grid of small
 * square cells, a bit like a terminal drawing. It roams a floor of dots
 * that fills the screen, and cannot see the floor until its sensor sweeps
 * over it. It picks places to explore, rests and looks around, and walks
 * round the text instead of over it. Warm spots in the floor
 * show up in the one accent colour; the counter in the corner keeps track
 * of how many it has found.
 *
 * It wakes up lying down and stands, sits now and then when it stops,
 * lies down to rest after a long quiet spell and stretches as it gets up,
 * and goes to sniff a warm spot it has just found close by. It reads the
 * name on the page from time to time. Its lens dims while it rests.
 *
 * The head follows the pointer (or whatever link you hover). Rest the
 * pointer somewhere and it walks over. A click or a tap sends out a ping
 * that lights up the floor for a moment, and sends the robot there.
 *
 * No libraries. Pauses when the tab is hidden. Reduced motion gets one
 * still frame.
 *
 * <canvas data-robot data-mode="home|lost"> plus optional
 * [data-robot-count] and [data-robot-state] elements on the page, and an
 * optional [data-robot-avoid] element whose box is kept quiet behind text.
 */
(function () {
  'use strict';

  var canvas = document.querySelector('canvas[data-robot]');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d', { alpha: false });
  var mode = canvas.getAttribute('data-mode') || 'home';
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(mq && mq.matches);
  var html = document.documentElement;

  /* ------------------------------------------------------------ helpers */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function hash(a, b) {
    var h = (a * 374761393 + b * 668265263) | 0;
    h = (h ^ (h >>> 13)) * 1274126177 | 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function parseColor(s) {
    s = (s || '').trim();
    if (s[0] === '#') {
      if (s.length === 4) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
      return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
    }
    var m = s.match(/[\d.]+/g);
    return m ? [+m[0], +m[1], +m[2]] : [20, 20, 20];
  }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function css(c, a) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (a == null ? 1 : a) + ')'; }

  /* ---------------------------------------------------------- materials */
  var M_PLAIN = 0, M_SEAM = 1, M_JOINT = 2, M_LENS = 3, M_VENT = 4, M_FOOT = 5, M_DARK = 6;
  var K_ROBOT = 1, K_FLOOR = 2, K_WALL = 3, K_HEAT = 4, K_HAZE = 5;

  /* A point set: local positions, normals and a material per point. */
  function PointSet(n) {
    this.n = 0;
    this.p = new Float32Array(n * 3);
    this.q = new Float32Array(n * 3);
    this.m = new Uint8Array(n);
  }
  PointSet.prototype.add = function (x, y, z, nx, ny, nz, m) {
    var i = this.n++, k = i * 3;
    this.p[k] = x; this.p[k + 1] = y; this.p[k + 2] = z;
    var l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    this.q[k] = nx / l; this.q[k + 1] = ny / l; this.q[k + 2] = nz / l;
    this.m[i] = m;
  };

  /* Fibonacci sphere directions, mapped onto a rounded box (superellipsoid). */
  function roundedBox(count, a, b, c, e, matFn) {
    var s = new PointSet(count), ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < count; i++) {
      var y = 1 - (i + 0.5) / count * 2, r = Math.sqrt(1 - y * y), th = ga * i;
      var dx = Math.cos(th) * r, dy = y, dz = Math.sin(th) * r;
      var f = Math.pow(Math.pow(Math.abs(dx), e) + Math.pow(Math.abs(dy), e) + Math.pow(Math.abs(dz), e), 1 / e);
      var ux = dx / f, uy = dy / f, uz = dz / f;
      var nx = Math.sign(ux) * Math.pow(Math.abs(ux), e - 1) / a;
      var ny = Math.sign(uy) * Math.pow(Math.abs(uy), e - 1) / b;
      var nz = Math.sign(uz) * Math.pow(Math.abs(uz), e - 1) / c;
      s.add(ux * a, uy * b, uz * c, nx, ny, nz, matFn ? matFn(ux, uy, uz) : M_PLAIN);
    }
    return s;
  }
  /* A unit tube along +x from 0 to 1 with a radius profile. */
  function tube(along, around, r0, r1, mat) {
    var s = new PointSet(along * around);
    for (var i = 0; i < along; i++) {
      var t = (i + 0.5) / along, r = lerp(r0, r1, t);
      for (var j = 0; j < around; j++) {
        var a = (j + (i % 2) * 0.5) / around * Math.PI * 2;
        s.add(t, Math.cos(a) * r, Math.sin(a) * r, 0, Math.cos(a), Math.sin(a), (i === 2 || i === along - 3) && j % 2 ? M_SEAM : mat);
      }
    }
    return s;
  }
  function sphere(count, r, mat) { return roundedBox(count, r, r, r, 2, function () { return mat; }); }

  /* ------------------------------------------------------------- the robot */
  /* A small four-legged robot: a long body, a sensor head on a short mast,
     an antenna at the back, and legs whose knees point back. Body frame:
     x forward, y up, z to the side. */
  /* A closed cylinder along +x from 0 to 1, radius in world units. */
  function cyl(along, around, rings, r, mat, capMat) {
    var s = new PointSet(along * around + 2 * rings * around);
    for (var i = 0; i < along; i++) {
      var tt = (i + 0.5) / along;
      for (var j = 0; j < around; j++) {
        var an = (j + (i % 2) * 0.5) / around * Math.PI * 2;
        s.add(tt, Math.cos(an) * r, Math.sin(an) * r, 0, Math.cos(an), Math.sin(an), mat);
      }
    }
    for (var e = 0; e < 2; e++) {
      for (var k = 0; k < rings; k++) {
        var rr = r * (k + 0.5) / rings;
        for (var j2 = 0; j2 < around; j2++) {
          var a2 = (j2 + k * 0.5) / around * Math.PI * 2;
          s.add(e, Math.cos(a2) * rr, Math.sin(a2) * rr, e ? 1 : -1, 0, 0, k === rings - 1 && j2 % 3 === 0 ? M_SEAM : (capMat == null ? mat : capMat));
        }
      }
    }
    return s;
  }
  var BODY = roundedBox(4800, 0.56, 0.13, 0.22, 4.4, function (x, y, z) {
    if (Math.abs(z) > 0.82 && Math.abs(y) < 0.4 && x > -0.5 && x < 0.3 && ((x * 16 + 16) | 0) % 2 === 0) return M_VENT;
    if (Math.abs(x - 0.62) < 0.03 || Math.abs(x + 0.62) < 0.03) return M_SEAM;
    if (y < -0.55) return M_DARK;
    return M_PLAIN;
  });
  var DECK = roundedBox(1400, 0.3, 0.03, 0.12, 6, function (x, y) { return y > 0.6 && Math.abs(x) < 0.8 && ((x * 10 + 10) | 0) % 3 === 0 ? M_SEAM : M_PLAIN; });
  var BELLY = roundedBox(900, 0.26, 0.035, 0.12, 6, function () { return M_DARK; });
  var MAST = tube(14, 12, 0.04, 0.036, M_DARK);
  var HEAD = roundedBox(1900, 0.15, 0.08, 0.13, 6, function (x, y, z) {
    if (x > 0.7 && Math.abs(y) < 0.55) return M_DARK;
    if (Math.abs(y - 0.0) < 0.06 && x < 0.6) return M_SEAM;
    return M_PLAIN;
  });
  var LENS = cyl(6, 18, 6, 0.064, M_DARK, M_LENS);
  var ANT = tube(34, 4, 0.012, 0.009, M_DARK);
  var ANT_TIP = sphere(60, 0.03, M_JOINT);
  var MOTOR = cyl(8, 22, 5, 0.12, M_JOINT, M_PLAIN);
  var THIGH = tube(36, 12, 0.066, 0.05, M_PLAIN);
  var KNEE = cyl(5, 16, 3, 0.074, M_JOINT, M_JOINT);
  var SHANK = tube(40, 9, 0.042, 0.03, M_PLAIN);
  var FOOT = sphere(140, 0.06, M_FOOT);
  var L1 = 0.55, L2 = 0.6, HEIGHT = 0.95;

  // hips (body local) and where each foot rests (x forward, z out to the side)
  var LEGS = [];
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (l, i) {
    LEGS.push({ hx: l[0] * 0.43, hy: -0.05, hz: l[1] * 0.23, pz: l[1] * 0.33, side: l[1], fx: l[0] * 0.47, fz: l[1] * 0.34 });
  });
  // a walk, one foot at a time: left hind, left fore, right hind, right fore
  var LEG_OFFSET = [0.25, 0.75, 0, 0.5];
  var DUTY = 0.75;
  var ant = { x: 0, v: 0 };
  var headNow = [0.42, HEIGHT + 0.4, 0];

  /* -------------------------------------------------------------- the world */
  // A fixed floor that fills the screen, and the robot walks around on it.
  // x runs across the screen, z runs into it (negative is further away), y is up.
  var R = rng(7);
  var SP = 0.2;
  var floor = [], heats = [], walls = [], haze = [], pings = [];
  var found = 0;
  function newWall(x, z) {
    var w = 0.3 + R() * 0.6, d = 0.25 + R() * 0.45, h = 0.25 + R() * 0.8;
    var pts = [], st = 0.11;
    for (var a = -w / 2; a <= w / 2 + 1e-6; a += st) {
      for (var y = st / 2; y <= h; y += st) {
        pts.push([a, y, -d / 2], [a, y, d / 2]);
      }
    }
    for (var b = -d / 2 + st; b < d / 2; b += st) {
      for (var y2 = st / 2; y2 <= h; y2 += st) pts.push([-w / 2, y2, b], [w / 2, y2, b]);
    }
    for (var a2 = -w / 2; a2 <= w / 2 + 1e-6; a2 += st) for (var b2 = -d / 2; b2 <= d / 2 + 1e-6; b2 += st) pts.push([a2, h, b2]);
    return { x: x, z: z, rad: Math.sqrt(w * w + d * d) / 2, pts: pts, seen: new Float32Array(pts.length) };
  }
  function newHeat(x, z) { return { x: x, z: z, r: 0.22 + R() * 0.2, found: false, glow: 0, at: 0 }; }

  /* ------------------------------------------------------------- the state */
  var t = 0, phase = 0, gaitF = 0.4, gaitMag = 0;
  // the robot: where it stands, which way it faces (forward is cos, -sin), and how fast
  var bot = { x: 0, z: 0, yaw: -0.5, v: 0, w: 0, placed: false };
  var route = null;        // { pts: [[x, z], ...], kind: 'wander' | 'go' | 'pointer', since, tries }
  var stateName = 'explore', stateUntil = 0, look = null, lookUntil = 0;
  var headYaw = 0, headPitch = -0.25, hyV = 0, hpV = 0;
  var P0 = 0.6, camYaw = 0, camPitch = 0.6;
  var pointer = { x: 0, y: 0, active: false, mouse: false, at: -99, moved: -99, rx: -1e3, ry: -1e3, sent: true, target: null };
  var crouch = 0;
  // poses, each from 0 to 1 and eased, so it never snaps from one to another.
  // act is what it is doing in place: wake, sit, lie, stretch or sniff
  var pose = { sit: 0, lie: 0, bow: 0, sniff: 0 }, act = null;
  var quietAt = 0, restNext = 30, lens = 0.2, prints = [], marker = null, readPt = null, revisit = false;
  var legFx = [0, 0, 0, 0], legFz = [0, 0, 0, 0], legLift = [0, 0, 0, 0], legPh = [0, 0, 0, 0], bodyOx = 0;
  // body height, pitch, shift and where the feet go (front, hind) for each pose
  var POSES = {
    sit: { y: 0.6, pitch: 0.48, ox: -0.12, ff: 0.03, hf: 0.27, fz: 0 },
    lie: { y: 0.27, pitch: 0, ox: 0, ff: -0.04, hf: 0.04, fz: 0.03 },
    bow: { y: 0.64, pitch: -0.4, ox: 0.04, ff: 0.36, hf: 0, fz: 0.02 },
    sniff: { y: 0.84, pitch: -0.12, ox: 0.03, ff: 0.04, hf: 0, fz: 0 }
  };
  function startAct(name, dur) { act = { name: name, until: t + dur, at: t }; route = null; }
  function wrap(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }

  /* --------------------------------------------------------------- layout */
  var W = 0, H = 0, dpr = 1, cell = 10, cols = 0, rows = 0, scale = 100, cx = 0, cy = 0;
  var zbuf, lum, kind, mat, heatv, nxs, nys;
  var avoid = null, avoidEl = document.querySelector('[data-robot-avoid]');
  var countEl = document.querySelector('[data-robot-count]');
  var stateEl = document.querySelector('[data-robot-state]');
  var colors = {}, atlas = null, glyphs = '.:-=+*x#%@o/\\|', glyphIndex = {};
  for (var gi = 0; gi < glyphs.length; gi++) glyphIndex[glyphs[gi]] = gi;
  var LEVELS = 14;
  var G_DOT = 0, G_COLON = 1, G_DASH = 2, G_PLUS = 4, G_STAR = 5, G_X = 6, G_HASH = 7, G_AT = 9, G_O = 10, G_SLASH = 11, G_BACK = 12, G_BAR = 13;

  function readColors() {
    var cs = getComputedStyle(html);
    colors.bg = parseColor(cs.getPropertyValue('--bg'));
    colors.fg = parseColor(cs.getPropertyValue('--fg'));
    colors.accent = parseColor(cs.getPropertyValue('--accent'));
    colors.light = html.getAttribute('data-theme') === 'light';
    colors.shade = [];
    for (var i = 0; i < LEVELS; i++) {
      var k = i / (LEVELS - 1);
      colors.shade.push(css(mix(colors.bg, colors.fg, colors.light ? 0.08 + k * 0.78 : 0.06 + k * 0.84)));
    }
    colors.heat = [];
    for (var j = 0; j < 4; j++) colors.heat.push(css(mix(colors.bg, colors.accent, 0.35 + j * 0.22)));
    buildAtlas();
  }

  // glyphs drawn once into a strip, then copied per cell
  function buildAtlas() {
    var gs = Math.round(cell * dpr);
    atlas = document.createElement('canvas');
    atlas.width = gs * glyphs.length; atlas.height = gs * 3;
    var g = atlas.getContext('2d');
    g.font = Math.round(gs * 0.92) + 'px "Geist Mono", ui-monospace, monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    var tones = [
      css(colors.bg, colors.light ? 0.9 : 0.85),
      css(colors.fg, 0.75),
      css(colors.light ? colors.bg : mix(colors.bg, colors.accent, 0.25), 0.95)
    ];
    for (var r = 0; r < 3; r++) {
      g.fillStyle = tones[r];
      for (var i = 0; i < glyphs.length; i++) g.fillText(glyphs[i], i * gs + gs / 2, r * gs + gs / 2 + gs * 0.04);
    }
    atlas.gs = gs;
  }

  function layout() {
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    var narrow = W < 700;
    cell = narrow ? 6 : (W > 1700 ? 9 : 8);
    cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);
    var n = cols * rows;
    zbuf = new Float32Array(n); lum = new Float32Array(n); kind = new Uint8Array(n);
    mat = new Uint8Array(n); heatv = new Float32Array(n); nxs = new Float32Array(n); nys = new Float32Array(n);
    scale = narrow ? Math.min(W * 0.16, H * 0.08) : Math.min(W * 0.07, H * 0.115);
    cx = W * 0.5; cy = H * 0.5;
    cam.dist = 12;
    P0 = Math.max(0.55, Math.atan(cy / (scale * cam.dist)) + 0.14);
    camYaw = 0; camPitch = P0;
    avoid = null; blocks = [];
    if (avoidEl) {
      var a = avoidEl.getBoundingClientRect();
      if (a.width) {
        avoid = { x0: (a.left - r.left - 18) / cell, y0: (a.top - r.top - 14) / cell, x1: (a.right - r.left + 18) / cell, y1: (a.bottom - r.top + 10) / cell };
        blocks.push({ x0: a.left - r.left - 24, y0: a.top - r.top - 20, x1: a.right - r.left + 24, y1: a.bottom - r.top + 16 });
      }
    }
    var tele = document.querySelector('.tele');
    if (tele) { var tr = tele.getBoundingClientRect(); if (tr.width) blocks.push({ x0: tr.left - r.left - 12, y0: tr.top - r.top - 12, x1: tr.right - r.left + 12, y1: tr.bottom - r.top + 12 }); }
    var hd = document.querySelector('header.top');
    topLimit = Math.max(56, hd ? hd.getBoundingClientRect().bottom - r.top + 6 : 56);
    readColors();
    buildWorld();
  }

  // where the robot may stand: its whole box on screen, clear of text and walls
  var blocks = [], topLimit = 56;
  function boxAt(x, z) {
    var zc = project(x, 0, z);
    if (zc < 0) return null;
    var fx = PX, fy = PY, k = cam.focal / zc;
    project(x, 1.45, z);
    return [fx - 0.9 * k, PY, fx + 0.9 * k, fy + 0.25 * k];
  }
  function ok(x, z) {
    var b = boxAt(x, z);
    if (!b || b[0] < 6 || b[2] > W - 6 || b[1] < topLimit || b[3] > H - 6) return false;
    for (var i = 0; i < blocks.length; i++) {
      var q = blocks[i];
      if (b[0] < q.x1 && b[2] > q.x0 && b[1] < q.y1 && b[3] > q.y0) return false;
    }
    for (var j = 0; j < walls.length; j++) {
      var dx = x - walls[j].x, dz = z - walls[j].z, rr = walls[j].rad + 0.8;
      if (dx * dx + dz * dz < rr * rr) return false;
    }
    return true;
  }
  // is the straight line clear? a start that is already out of bounds may walk back in
  function clear(ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az, n = Math.ceil(Math.sqrt(dx * dx + dz * dz) / 0.2), inside = !ok(ax, az);
    for (var i = 1; i <= n; i++) {
      var good = ok(ax + dx * i / n, az + dz * i / n);
      if (good) inside = false; else if (!inside) return false;
    }
    return true;
  }
  function ground(sx, sy) { var g = unproject(sx, sy); return g[3] ? null : [g[0], g[2]]; }
  function randomSpot() { return ground(R() * W, topLimit + R() * (H - topLimit)); }
  function freeSpot(minD, maxD) {
    for (var i = 0; i < 120; i++) {
      var s = randomSpot();
      if (!s || !ok(s[0], s[1])) continue;
      var d = Math.hypot(s[0] - bot.x, s[1] - bot.z);
      if (d >= minD && d <= maxD) return s;
    }
    return null;
  }
  function nearestOk(x, z) {
    if (ok(x, z)) return [x, z];
    for (var r = 0.25; r < 9; r += 0.25) {
      for (var i = 0; i < 20; i++) {
        var a = i / 20 * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
        if (ok(px, pz)) return [px, pz];
      }
    }
    return null;
  }
  // a straight line if it is clear, otherwise one waypoint that gets around
  function plan(tx, tz) {
    if (clear(bot.x, bot.z, tx, tz)) return [[tx, tz]];
    var best = null, bd = 1e9;
    for (var i = 0; i < 70; i++) {
      var s = randomSpot();
      if (!s) continue;
      var d = Math.hypot(s[0] - bot.x, s[1] - bot.z) + Math.hypot(tx - s[0], tz - s[1]);
      if (d >= bd || !ok(s[0], s[1])) continue;
      if (clear(bot.x, bot.z, s[0], s[1]) && clear(s[0], s[1], tx, tz)) { bd = d; best = s; }
    }
    return best ? [best, [tx, tz]] : null;
  }
  // how much of the floor around a spot it has not looked at lately (0 to 1)
  function fresh(x, z) {
    var n = 0, u = 0;
    for (var i = 0; i < floor.length; i++) {
      var f = floor[i], dx = f.x - x, dz = f.z - z;
      if (dx * dx + dz * dz < 2.25) { n++; u += 1 - Math.min(1, f.seen); }
    }
    return n ? u / n : 0;
  }
  function goTo(x, z, kind) {
    var p = nearestOk(x, z);
    if (!p) return false;
    var pts = plan(p[0], p[1]);
    if (!pts) return false;
    route = { pts: pts, kind: kind, since: t, tries: 0 };
    if (act && kind !== 'wander') act = null;
    stateName = kind === 'wander' ? 'explore' : 'follow';
    return true;
  }

  function buildWorld() {
    camYaw = 0; camPitch = P0;
    setCamera();
    var xs = [], zs = [], corners = [[0, 0], [W, 0], [0, H], [W, H]];
    for (var c = 0; c < 4; c++) { var g = unproject(corners[c][0], corners[c][1]); xs.push(g[0]); zs.push(g[2]); }
    var x0 = Math.min.apply(null, xs) - 0.4, x1 = Math.max.apply(null, xs) + 0.4;
    var z0 = Math.min.apply(null, zs) - 0.4, z1 = Math.max.apply(null, zs) + 0.4;
    SP = clamp(2.8 * cell / scale, 0.15, 0.4);
    var R2 = rng(11), inv = 1 / 1;
    floor = [];
    for (var x = x0; x < x1; x += SP) {
      for (var z = z0; z < z1; z += SP) {
        var fx = x + (R2() - 0.5) * SP * 0.3, fz = z + (R2() - 0.5) * SP * 0.3;
        if (project(fx, 0, fz) < 0 || PX < -cell || PX > W + cell || PY < -cell || PY > H + cell) continue;
        var ex = clamp(Math.min(PX, W - PX) / (W * 0.1), 0, 1), ey = clamp(Math.min(PY, H - PY) / (H * 0.1), 0, 1);
        floor.push({ x: fx, z: fz, seen: 0, j: R2(), e: ex * ey });
      }
    }
    // the robot starts right of centre, or stays where it was if that still fits
    walls = [];
    if (!bot.placed || !ok(bot.x, bot.z)) {
      var st = ground(W * (W < 700 ? 0.5 : 0.66), H * (W < 700 ? 0.34 : 0.42)), s0 = st && nearestOk(st[0], st[1]);
      if (s0) { bot.x = s0[0]; bot.z = s0[1]; }
      bot.placed = true;
    }
    route = null;
    var nW = W < 700 ? 2 : 4, nH = W < 700 ? 4 : 6;
    for (var i = 0; i < nW; i++) {
      var s = freeSpot(1.8, 1e9);
      if (s) { var wl = newWall(s[0], s[1]); walls.push(wl); if (!ok(bot.x, bot.z)) walls.pop(); }
    }
    heats = [];
    for (var h = 0; h < nH; h++) { var s2 = freeSpot(1.2, 1e9); if (s2) heats.push(newHeat(s2[0], s2[1])); }
  }

  /* --------------------------------------------------------------- camera */
  var cam = { x: 0, y: 0, z: 0, rx: [1, 0, 0], ry: [0, 1, 0], rz: [0, 0, 1], dist: 5.4, focal: 1 };
  var light = [0, 0, 0];
  var TARGET = [0, 0, 0];
  function setCamera() {
    var cp = Math.cos(camPitch), sp = Math.sin(camPitch), cyw = Math.cos(camYaw), syw = Math.sin(camYaw);
    // forward points from the camera to the target
    var fwd = [-cp * syw, -sp, -cp * cyw];
    cam.x = TARGET[0] - fwd[0] * cam.dist; cam.y = TARGET[1] - fwd[1] * cam.dist; cam.z = TARGET[2] - fwd[2] * cam.dist;
    var right = [cyw, 0, -syw];
    var up = [right[1] * fwd[2] - right[2] * fwd[1], right[2] * fwd[0] - right[0] * fwd[2], right[0] * fwd[1] - right[1] * fwd[0]];
    cam.rx = right; cam.ry = [-up[0], -up[1], -up[2]]; cam.rz = fwd;
    cam.focal = scale * cam.dist / 1.0;
    // light from the upper left, a little toward the viewer
    var lx = -0.55 * right[0] - 0.45 * fwd[0];
    var ly = 0.8 - 0.45 * fwd[1];
    var lz = -0.55 * right[2] - 0.45 * fwd[2];
    var ll = Math.sqrt(lx * lx + ly * ly + lz * lz);
    light[0] = lx / ll; light[1] = ly / ll; light[2] = lz / ll;
  }
  // world point to cell; returns depth or -1
  var PX = 0, PY = 0;
  function project(x, y, z) {
    var dx = x - cam.x, dy = y - cam.y, dz = z - cam.z;
    var zc = dx * cam.rz[0] + dy * cam.rz[1] + dz * cam.rz[2];
    if (zc < 0.3) return -1;
    var xc = dx * cam.rx[0] + dy * cam.rx[1] + dz * cam.rx[2];
    var yc = dx * cam.ry[0] + dy * cam.ry[1] + dz * cam.ry[2];
    PX = cx + cam.focal * xc / zc;
    PY = cy + cam.focal * yc / zc;
    return zc;
  }
  // screen point to the floor (y = 0)
  function unproject(sx, sy) {
    var xc = (sx - cx) / cam.focal, yc = (sy - cy) / cam.focal;
    var d = [cam.rz[0] + xc * cam.rx[0] + yc * cam.ry[0], cam.rz[1] + xc * cam.rx[1] + yc * cam.ry[1], cam.rz[2] + xc * cam.rx[2] + yc * cam.ry[2]];
    if (d[1] > -0.02) {
      var l = Math.sqrt(d[0] * d[0] + d[2] * d[2]) || 1;
      return [cam.x + d[0] / l * 6, 0.9 + d[1] * 4, cam.z + d[2] / l * 6, true];
    }
    var k = -cam.y / d[1];
    return [cam.x + d[0] * k, 0, cam.z + d[2] * k, false];
  }

  /* ------------------------------------------------------------- raster */
  function plot(ix, iy, z, l, k, m, h, nx, ny) {
    if (ix < 0 || iy < 0 || ix >= cols || iy >= rows) return;
    var i = iy * cols + ix;
    if (z >= zbuf[i]) return;
    zbuf[i] = z; lum[i] = l; kind[i] = k; mat[i] = m; heatv[i] = h; nxs[i] = nx; nys[i] = ny;
  }

  // transform a point set by a 3x3 basis (columns a, b, c) and origin o
  function drawSet(set, a, b, c, o) {
    var p = set.p, q = set.q, mm = set.m, n = set.n, inv = 1 / cell;
    for (var i = 0; i < n; i++) {
      var k = i * 3, lx = p[k], ly = p[k + 1], lz = p[k + 2];
      var wx = o[0] + a[0] * lx + b[0] * ly + c[0] * lz;
      var wy = o[1] + a[1] * lx + b[1] * ly + c[1] * lz;
      var wz = o[2] + a[2] * lx + b[2] * ly + c[2] * lz;
      var qx = q[k], qy = q[k + 1], qz = q[k + 2];
      var nx = a[0] * qx + b[0] * qy + c[0] * qz;
      var ny = a[1] * qx + b[1] * qy + c[1] * qz;
      var nz = a[2] * qx + b[2] * qy + c[2] * qz;
      var nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= nl; ny /= nl; nz /= nl;
      if (nx * (cam.x - wx) + ny * (cam.y - wy) + nz * (cam.z - wz) < 0) continue;
      var z = project(wx, wy, wz);
      if (z < 0) continue;
      var d = nx * light[0] + ny * light[1] + nz * light[2];
      var l = 0.16 + 0.7 * (d > 0 ? d : 0) + 0.14 * (ny > 0 ? ny : 0);
      var m = mm[i];
      if (m === M_DARK) l *= 0.55;
      else if (m === M_JOINT) l = 0.3 + l * 0.75;
      // screen-space normal for the outline characters
      var sx = nx * cam.rx[0] + ny * cam.rx[1] + nz * cam.rx[2];
      var sy = nx * cam.ry[0] + ny * cam.ry[1] + nz * cam.ry[2];
      plot((PX * inv) | 0, (PY * inv) | 0, z, l, K_ROBOT, m, 0, sx, sy);
    }
  }

  var IDENT_A = [1, 0, 0], IDENT_B = [0, 1, 0], IDENT_C = [0, 0, 1];
  function segBasis(A, B) {
    var a = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
    var len = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1;
    var u = [a[0] / len, a[1] / len, a[2] / len];
    var ref = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    var v = [u[1] * ref[2] - u[2] * ref[1], u[2] * ref[0] - u[0] * ref[2], u[0] * ref[1] - u[1] * ref[0]];
    var vl = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); v = [v[0] / vl, v[1] / vl, v[2] / vl];
    var w = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    return [a, v, w];
  }

  /* ----------------------------------------------------------- simulate */
  var body = { y: HEIGHT, pitch: 0, roll: 0 };
  function rotY(v, ang) { var c = Math.cos(ang), s = Math.sin(ang); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; }
  function bodyBasis() {
    // small pitch about z, roll about x
    var cp = Math.cos(body.pitch), sp = Math.sin(body.pitch), cr = Math.cos(body.roll), sr = Math.sin(body.roll);
    var a = [cp, sp, 0];
    var b = [-sp * cr, cp * cr, sr];
    var c = [sp * sr, -cp * sr, cr];
    return [a, b, c];
  }
  function toWorld(B, o, lx, ly, lz) {
    return [o[0] + B[0][0] * lx + B[1][0] * ly + B[2][0] * lz, o[1] + B[0][1] * lx + B[1][1] * ly + B[2][1] * lz, o[2] + B[0][2] * lx + B[1][2] * ly + B[2][2] * lz];
  }

  var shownKey = '';
  function setState(name, dur) { stateName = name; stateUntil = t + dur; }
  function label(force) {
    if (!stateEl) return;
    var key = reduce ? 'still' : (act ? (act.name === 'lie' ? 'rest' : act.name) : ((route && route.kind !== 'wander' && route.kind !== 'sniff') || (!route && pointer.active && t - pointer.at < 3) ? 'follow' : (route ? 'explore' : 'idle')));
    if (key === shownKey && !force) return;
    shownKey = key;
    stateEl.textContent = key;
  }
  function bump() { found++; if (countEl) countEl.textContent = (found < 10 ? '0' : '') + (found % 100); }

  function step(dt) {
    t += dt;
    var mouse = pointer.active && t - pointer.at < 3;
    var lost = mode === 'lost';

    // a pointer that rests for a moment draws the robot over
    if (pointer.active && pointer.mouse && !pointer.sent && t - pointer.moved > 1.2 && t - pointer.moved < 8) {
      pointer.sent = true;
      var pg = ground(pointer.x, pointer.y);
      if (pg) {
        var pdx = pg[0] - bot.x, pdz = pg[1] - bot.z, pd = Math.hypot(pdx, pdz);
        if (pd > 1.8) { var kk = (pd - 1.2) / pd; goTo(bot.x + pdx * kk, bot.z + pdz * kk, 'pointer'); }
      }
    }
    // what it is doing in place comes to an end
    var quiet = t - quietAt;
    if (!readPt || ((t * 60) | 0) % 60 === 0) {
      var nm = document.querySelector('h1');
      if (nm) { var nr = nm.getBoundingClientRect(), cr = canvas.getBoundingClientRect(), gq = ground(nr.left + nr.width / 2 - cr.left, nr.bottom - cr.top + 10); if (gq) readPt = [gq[0], 0.1, gq[1]]; }
    }
    if (act && act.name === 'lie' && quiet < 0.5 && t - act.at > 2.5) act.until = Math.min(act.until, t);
    if (act && t > act.until) {
      var an = act.name; act = null;
      if (an === 'lie') startAct('stretch', 1.9);
      else if (an === 'sniff' && R() < 0.3 && !lost) startAct('sit', 4 + R() * 3);
      else { stateName = 'idle'; stateUntil = t + (an === 'wake' ? 1.6 : 0.9); }
    }
    // a long quiet spell: lie down for a while
    if (!route && !act && !lost && quiet > 30 && t > restNext) { startAct('lie', 9 + R() * 6); restNext = t + 50; }
    // nothing to do: rest a while, or pick somewhere new to look at
    if (!route && !act && t > stateUntil) {
      var best = null, bs = -1;
      for (var c = 0; c < 6; c++) {
        var s = freeSpot(2.2, 11);
        if (!s) continue;
        var sc = Math.min(7, Math.hypot(s[0] - bot.x, s[1] - bot.z)) + 6 * fresh(s[0], s[1]) + R() * 2;
        if (sc > bs) { bs = sc; best = s; }
      }
      if (!best || !goTo(best[0], best[1], 'wander')) { stateName = 'idle'; stateUntil = t + 1.5; }
    }

    // where the head wants to look
    var lookAt = null, ty, tp, hp = headNow;
    var resting = act && (act.name === 'lie' || act.name === 'wake');
    if (mouse && pointer.target && !pointer.target[3] && !(act && act.name === 'wake')) lookAt = pointer.target;
    else if (look && t < lookUntil) lookAt = look;
    // standing or sitting about: now and then it reads the name
    if (!lookAt && !route && !resting && readPt && !lost && (t % 26) < 11) {
      var ry = wrap(Math.atan2(-(readPt[2] - hp[2]), readPt[0] - hp[0]) - bot.yaw);
      if (Math.abs(ry) < 1.3) lookAt = [readPt[0] + 0.3 * Math.sin(t * 0.6), readPt[1], readPt[2]];
    }
    if (lookAt) {
      ty = wrap(Math.atan2(-(lookAt[2] - hp[2]), lookAt[0] - hp[0]) - bot.yaw);
      tp = Math.atan2(lookAt[1] - hp[1], Math.hypot(lookAt[0] - hp[0], lookAt[2] - hp[2]));
    } else if (resting) {
      // waking up or lying down: head low, looking at the floor in front
      ty = 0.15 * Math.sin(t * 0.25); tp = -0.62;
    } else if (!route) {
      // looking around; on the 404 it searches, wider and quicker
      ty = lost ? Math.sin(t * 1.0) * 1.3 + Math.sin(t * 0.27) * 0.2 : Math.sin(t * 0.7) * 1.05;
      tp = -0.32 + 0.12 * Math.sin(t * 0.43);
    } else {
      ty = Math.sin(t * 0.9) * 0.45 + Math.sin(t * 0.31) * 0.2; tp = -0.32 + 0.06 * Math.sin(t * 0.5);
    }
    if (act && act.name === 'stretch') { ty *= 0.3; tp = -0.05; }
    if (act && act.name === 'sniff') tp = Math.min(tp, -0.7);

    // steering: turn toward the next point, and only walk once it is roughly ahead,
    // so it turns on the spot first and never walks backwards
    var vT = 0, wT = 0;
    if (route) {
      var g = route.pts[0], dx = g[0] - bot.x, dz = g[1] - bot.z, d = Math.hypot(dx, dz), lastPt = route.pts.length === 1;
      if (d < (lastPt ? 0.2 : 0.5)) {
        route.pts.shift();
        if (!route.pts.length) {
          var kind = route.kind, sniffAt = route.at;
          route = null;
          var rr = R();
          if (kind === 'sniff') { startAct('sniff', 2.2); if (sniffAt) { look = sniffAt; lookUntil = t + 2.2; } }
          else if (kind !== 'wander') {
            // it looks at the spot it was sent to, and sometimes sits down there
            stateName = 'idle'; stateUntil = t + 2.5 + R() * 1.5;
            look = marker ? [marker.x, 0, marker.z] : [g[0] + Math.cos(bot.yaw) * 1.5, 0, g[1] - Math.sin(bot.yaw) * 1.5]; lookUntil = t + 2;
            if (marker) marker.done = t;
            if (!lost && rr < 0.35) { startAct('sit', 5 + R() * 3); stateUntil = 0; }
          }
          else if (!lost && rr < 0.18) startAct('sit', 4 + R() * 4);
          else if (rr < 0.5) { stateName = 'idle'; stateUntil = t + 2.5 + R() * 3; }
        }
      } else {
        var e = wrap(Math.atan2(-dz, dx) - bot.yaw);
        var vmax = (route.kind === 'wander' ? 0.65 : 1.05) * (lost ? 0.8 : 1);
        var ce = Math.max(0, Math.cos(e));
        wT = clamp(e * 2.4, -1.4, 1.4);
        vT = vmax * ce * ce * ce * (lastPt ? clamp(d / 0.9, 0.25, 1) : 1);
      }
      if (route && t - route.since > 25) route = null;
    } else if (lookAt && Math.abs(ty) > 1.15) {
      // something interesting behind it: turn round to face it
      wT = clamp(ty * 1.2, -1, 1);
    }
    if (!route && stateName !== 'idle') stateName = 'idle';
    // it only walks once it is standing again
    var down = Math.max(pose.sit, pose.lie, pose.bow, pose.sniff * 0.6), gate = clamp(1 - down * 1.6, 0, 1);
    if (act) { vT = 0; if (act.name !== 'sniff') wT = 0; }
    vT *= gate * gate; wT *= gate;
    bot.v += (vT - bot.v) * Math.min(1, dt * 2.2);
    bot.w += (wT - bot.w) * Math.min(1, dt * 5);
    bot.yaw = wrap(bot.yaw + bot.w * dt);
    var nx = bot.x + Math.cos(bot.yaw) * bot.v * dt, nz = bot.z - Math.sin(bot.yaw) * bot.v * dt;
    if (ok(nx, nz) || !ok(bot.x, bot.z)) { bot.x = nx; bot.z = nz; }
    else {
      // about to touch an edge or the text: stop, turn, and find another way
      bot.v *= 0.3;
      if (route) {
        var fin = route.pts[route.pts.length - 1], k2 = route.kind, tries = route.tries + 1;
        route = null;
        if (tries < 4 && goTo(fin[0], fin[1], k2)) route.tries = tries;
      }
    }
    label();
    crouch += ((route ? 0 : 1) - crouch) * Math.min(1, dt * 1.5);

    // gait: a walk, three feet down most of the time, stepping faster as it goes faster
    gaitMag = Math.abs(bot.v) + 0.45 * Math.abs(bot.w);
    gaitF = clamp(0.4 + gaitMag * 1.5, 0.4, 1.75);
    phase = (phase + dt * gaitF) % 1;
    var moving = clamp(gaitMag / 0.3, 0, 1);
    var y0 = HEIGHT - crouch * 0.12 + 0.012 * Math.sin(phase * Math.PI * 8) * moving + 0.006 * Math.sin(t * 1.7);
    var p0 = -0.015 - crouch * 0.04 + 0.01 * Math.sin(t * 0.9) + 0.012 * Math.sin(phase * Math.PI * 4) * moving;
    body.roll = 0.025 * Math.sin(phase * Math.PI * 2) * moving + 0.05 * bot.w * clamp(bot.v / 0.4, 0, 1);
    // ease each pose toward what it is doing, then blend them over the standing pose
    var an2 = act ? act.name : '';
    var want = { sit: an2 === 'sit' ? 1 : 0, lie: an2 === 'lie' || an2 === 'wake' ? 1 : 0, bow: an2 === 'stretch' && t - act.at < 1.5 ? 1 : 0, sniff: an2 === 'sniff' ? 1 : 0 };
    // still slowing down from a walk: finish stopping before going down
    if (Math.abs(bot.v) > 0.12) want.sit = want.lie = want.bow = 0;
    var ws = 0, wy = 0, wp = 0, wo = 0, wff = 0, whf = 0, wfz = 0;
    for (var pk in POSES) {
      var rate = pk === 'lie' && want.lie < pose.lie ? 1.3 : 2.1;
      pose[pk] += (want[pk] - pose[pk]) * Math.min(1, dt * rate);
      var wk = pose[pk] * pose[pk] * (3 - 2 * pose[pk]), P = POSES[pk];
      ws += wk; wy += wk * P.y; wp += wk * P.pitch; wo += wk * P.ox; wff += wk * P.ff; whf += wk * P.hf; wfz += wk * P.fz;
    }
    if (ws > 1) { wy /= ws; wp /= ws; wo /= ws; wff /= ws; whf /= ws; wfz /= ws; ws = 1; }
    // breathing, slower and deeper when it is down
    var breathe = 0.008 * Math.sin(t * 1.4) * ws;
    body.y = y0 * (1 - ws) + wy + breathe;
    body.pitch = p0 * (1 - ws) + wp;
    bodyOx = wo;
    for (var lg = 0; lg < 4; lg++) {
      var nf = LEGS[lg].fx > 0 ? wff : whf, nfz = LEGS[lg].side * wfz;
      // a foot that has to move to a new spot lifts a little on the way
      var mv = Math.hypot(nf - legFx[lg], nfz - legFz[lg]) / Math.max(dt, 1e-3);
      legLift[lg] += (clamp(mv * 0.25, 0, 0.09) - legLift[lg]) * Math.min(1, dt * 10);
      legFx[lg] = nf; legFz[lg] = nfz;
    }
    // the lens: dim while it rests, bright when it is watching something
    var lensT = resting ? 0.15 : (lookAt && mouse ? 1 : 0.7);
    lens += (lensT - lens) * Math.min(1, dt * 3);
    // footprints where a foot comes down, fading out
    var TsF = DUTY / gaitF;
    for (var fp = 0; fp < 4; fp++) {
      var phf = (phase + LEG_OFFSET[fp]) % 1;
      if (phf < legPh[fp] && gaitMag > 0.08 && !reduce) {
        var LL = LEGS[fp], fdx = -(bot.v + bot.w * LL.fz) * TsF, fdz = bot.w * LL.fx * TsF;
        var lx2 = LL.fx + legFx[fp] - fdx / 2, lz2 = LL.fz + legFz[fp] - fdz / 2, cy0 = Math.cos(bot.yaw), sy0 = Math.sin(bot.yaw);
        prints.push({ x: bot.x + lx2 * cy0 + lz2 * sy0, z: bot.z - lx2 * sy0 + lz2 * cy0, t: t });
      }
      legPh[fp] = phf;
    }
    while (prints.length && (prints.length > 90 || t - prints[0].t > 5)) prints.shift();
    if (marker && marker.done && t - marker.done > 2) marker = null;
    // the antenna lags behind the body
    var aT = -bot.v * 0.16 - (body.y - HEIGHT) * 0.6;
    ant.v += (60 * (aT - ant.x) - 3.2 * ant.v) * dt; ant.x += ant.v * dt;

    for (var h = 0; h < heats.length; h++) {
      var ht = heats[h];
      ht.glow *= Math.exp(-dt * 0.25);
      // found ones cool off and turn up somewhere else later
      if (ht.found && t - ht.at > 16 && ht.glow < 0.08) {
        var ns = freeSpot(3, 1e9);
        if (ns) heats[h] = newHeat(ns[0], ns[1]);
      }
    }
    for (var z = haze.length - 1; z >= 0; z--) {
      var hz = haze[z]; hz.y += dt * hz.v; hz.life -= dt;
      if (hz.life <= 0) haze.splice(z, 1);
    }
    for (var p = pings.length - 1; p >= 0; p--) { pings[p].r += dt * 3.2; if (pings[p].r > 9) pings.splice(p, 1); }

    ty = clamp(ty, -1.5, 1.5); tp = clamp(tp, -0.7, 0.45);
    // a spring, so it settles instead of snapping
    var sk = 26, damp = 9;
    hyV += (sk * (ty - headYaw) - damp * hyV) * dt; headYaw += hyV * dt;
    hpV += (sk * (tp - headPitch) - damp * hpV) * dt; headPitch += hpV * dt;

    // the camera stays put, with a very slow drift
    var px = pointer.active ? (pointer.x / W - 0.5) : 0, py = pointer.active ? (pointer.y / H - 0.5) : 0;
    var cyT = 0.025 * Math.sin(t * 0.045) + px * 0.02, cpT = P0 + 0.012 * Math.sin(t * 0.07) + py * 0.012;
    camYaw += (cyT - camYaw) * Math.min(1, dt * 1.4);
    camPitch += (cpT - camPitch) * Math.min(1, dt * 1.4);

    sense(dt, hp);
  }

  // the sensor: a cone from the head, plus any ping rings
  function sense(dt, headPos) {
    var dirYaw = bot.yaw + headYaw, dirPitch = headPitch;
    var dxh = Math.cos(dirPitch) * Math.cos(dirYaw), dyh = Math.sin(dirPitch), dzh = -Math.cos(dirPitch) * Math.sin(dirYaw);
    var cosCone = Math.cos(0.36), reach = 4.6, fade = Math.exp(-dt * 0.1), wfade = Math.exp(-dt * 0.15);
    function seeAmount(x, y, z) {
      var vx = x - headPos[0], vy = y - headPos[1], vz = z - headPos[2];
      var d = Math.sqrt(vx * vx + vy * vy + vz * vz);
      if (d > reach || d < 0.05) return 0;
      var c = (vx * dxh + vy * dyh + vz * dzh) / d;
      if (c < cosCone) return 0;
      return (1 - d / reach) * clamp((c - cosCone) / (1 - cosCone) * 3, 0, 1);
    }
    function ring(x, z, width) {
      var s = 0;
      for (var p = 0; p < pings.length; p++) {
        var pg = pings[p], dd = Math.abs(Math.hypot(x - pg.x, z - pg.z) - pg.r);
        if (dd < width) s = Math.max(s, (1 - dd / width) * (1 - pg.r / 9.5));
      }
      return s;
    }
    for (var i = 0; i < floor.length; i++) {
      var f = floor[i], s = seeAmount(f.x, 0, f.z);
      f.seen *= fade;
      if (pings.length) s = Math.max(s, ring(f.x, f.z, 0.25));
      if (s > f.seen) f.seen = Math.min(1, f.seen + (s - f.seen) * Math.min(1, dt * 8));
    }
    for (var w = 0; w < walls.length; w++) {
      var wl = walls[w];
      for (var j = 0; j < wl.pts.length; j++) {
        var q = wl.pts[j], x = wl.x + q[0], z = wl.z + q[2], s2 = seeAmount(x, q[1], z);
        wl.seen[j] *= wfade;
        if (pings.length) s2 = Math.max(s2, ring(x, z, 0.3));
        if (s2 > wl.seen[j]) wl.seen[j] = Math.min(1, wl.seen[j] + (s2 - wl.seen[j]) * Math.min(1, dt * 8));
      }
    }
    for (var h = 0; h < heats.length; h++) {
      var ht = heats[h], s3 = seeAmount(ht.x, 0, ht.z);
      if (pings.length && ring(ht.x, ht.z, 0.35) > 0) s3 = Math.max(s3, 0.8);
      if (s3 > 0.15) {
        ht.glow = Math.min(1, ht.glow + dt * 3);
        if (!ht.found && ht.glow > 0.5) {
          ht.found = true; ht.at = t; bump();
          // a warm spot close by: go and sniff it
          var hd = Math.hypot(ht.x - bot.x, ht.z - bot.z);
          if (!reduce && !act && (!route || route.kind === 'wander') && hd < 3.2 && hd > 0.6 && R() < 0.75) {
            var k2 = (hd - 0.75) / hd;
            goTo(bot.x + (ht.x - bot.x) * k2, bot.z + (ht.z - bot.z) * k2, 'sniff');
            if (route && route.kind === 'sniff') { route.at = [ht.x, 0, ht.z]; act = null; }
          }
        }
        if (ht.found) ht.at = Math.max(ht.at, t - 10);
        if (!reduce && R() < dt * 14) haze.push({ x: ht.x + (R() - 0.5) * ht.r * 1.4, y: 0.05, z: ht.z + (R() - 0.5) * ht.r * 1.4, v: 0.25 + R() * 0.3, life: 1.4 + R() });
      }
    }
  }

  /* ------------------------------------------------------------- render */
  // body-local to world: turn by the heading, then move to where the robot stands
  var hc0 = 1, hs0 = 0;
  function rw(v) { return [v[0] * hc0 + v[2] * hs0, v[1], -v[0] * hs0 + v[2] * hc0]; }
  function pw(v) { var r = rw(v); r[0] += bot.x; r[2] += bot.z; return r; }
  function dl(set, a, b, c, o) { drawSet(set, rw(a), rw(b), rw(c), pw(o)); }

  function render() {
    setCamera();
    zbuf.fill(1e9); kind.fill(0);
    var inv = 1 / cell;

    // floor dots, walls and heat
    for (var i = 0; i < floor.length; i++) {
      var f = floor[i];
      var z = project(f.x, 0, f.z);
      if (z < 0) continue;
      var heat = 0;
      for (var h = 0; h < heats.length; h++) {
        var ht = heats[h], ddx = f.x - ht.x, ddz = f.z - ht.z, dd = ddx * ddx + ddz * ddz;
        if (dd < ht.r * ht.r * 2.2) heat = Math.max(heat, ht.glow * (1 - dd / (ht.r * ht.r * 2.2)));
      }
      var l = 0.045 + 0.075 * f.e + f.seen * 0.75 * (0.5 + 0.5 * f.e);
      if (l < 0.03 && heat < 0.05) continue;
      plot((PX * inv) | 0, (PY * inv) | 0, z + 0.5, l, heat > 0.08 ? K_HEAT : K_FLOOR, 0, heat, f.j, f.seen);
    }
    for (var w = 0; w < walls.length; w++) {
      var wl = walls[w];
      for (var j = 0; j < wl.pts.length; j++) {
        var s = wl.seen[j];
        if (s < 0.04) continue;
        var q = wl.pts[j], zz = project(wl.x + q[0], q[1], wl.z + q[2]);
        if (zz < 0) continue;
        plot((PX * inv) | 0, (PY * inv) | 0, zz + 0.2, s * 0.62, K_WALL, 0, 0, hash(w, j), s);
      }
    }
    for (var k = 0; k < haze.length; k++) {
      var hz = haze[k], z3 = project(hz.x, hz.y, hz.z);
      if (z3 < 0) continue;
      plot((PX * inv) | 0, (PY * inv) | 0, z3, clamp(hz.life, 0, 1), K_HAZE, 0, clamp(hz.life, 0, 1), 0, 0);
    }

    // footprints, fading
    for (var fq = 0; fq < prints.length; fq++) {
      var pr = prints[fq], zp = project(pr.x, 0, pr.z), age = (t - pr.t) / 5;
      if (zp < 0) continue;
      plot((PX * inv) | 0, (PY * inv) | 0, zp + 0.45, 0.5 * (1 - age), K_FLOOR, 0, 0, 0.5, 1);
    }
    // the spot it was sent to: a small amber ring until it has had a look
    if (marker) {
      var mk = marker.done ? clamp(1 - (t - marker.done) / 2, 0, 1) : 0.75 + 0.25 * Math.sin(t * 5);
      for (var mq2 = 0; mq2 < 14; mq2++) {
        var ma = mq2 / 14 * Math.PI * 2, zm = project(marker.x + Math.cos(ma) * 0.16, 0, marker.z + Math.sin(ma) * 0.16);
        if (zm >= 0) plot((PX * inv) | 0, (PY * inv) | 0, zm + 0.4, mk, K_HEAT, 0, 0.6 * mk + 0.2, 0, 0);
      }
    }

    // the robot, built in its own frame and then turned and moved into place
    hc0 = Math.cos(bot.yaw); hs0 = Math.sin(bot.yaw);
    var B = bodyBasis(), O = [bodyOx, body.y, 0];
    dl(BODY, B[0], B[1], B[2], O);
    dl(DECK, B[0], B[1], B[2], toWorld(B, O, -0.08, 0.15, 0));
    dl(BELLY, B[0], B[1], B[2], toWorld(B, O, 0, -0.14, 0));
    // feet on the floor slide back at exactly the speed the body moves (turning
    // included), so planted feet stay planted; lifted feet swing to the front
    var Ts = DUTY / gaitF;
    for (var g = 0; g < LEGS.length; g++) {
      var L = LEGS[g];
      var Dx = -(bot.v + bot.w * L.fz) * Ts, Dz = bot.w * L.fx * Ts;
      var lift = 0.15 * clamp(Math.hypot(Dx, Dz) / 0.12, 0, 1);
      var nzL = L.fz + L.side * crouch * 0.04 + legFz[g], nfx = L.fx + legFx[g];
      var ph = (phase + LEG_OFFSET[g]) % 1, fx, fz, fy = 0;
      if (ph < DUTY) { var u = ph / DUTY; fx = nfx - Dx / 2 + Dx * u; fz = nzL - Dz / 2 + Dz * u; }
      else { var sw = (ph - DUTY) / (1 - DUTY), e = sw * sw * (3 - 2 * sw); fx = nfx + Dx / 2 - Dx * e; fz = nzL + Dz / 2 - Dz * e; fy = lift * Math.sin(Math.PI * sw); }
      var p1 = toWorld(B, O, L.hx, L.hy, L.pz);
      var foot = [fx, fy + legLift[g] + 0.06, fz];
      // two links in the leg's vertical plane, knee pointing back
      var ta = foot[0] - p1[0], tb = foot[1] - p1[1], tz = foot[2] - p1[2];
      var dd2 = Math.sqrt(ta * ta + tb * tb), dc = clamp(dd2, Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-3);
      var th = Math.atan2(tb, ta) - Math.acos(clamp((L1 * L1 + dc * dc - L2 * L2) / (2 * L1 * dc), -1, 1));
      var knee = [p1[0] + Math.cos(th) * L1, p1[1] + Math.sin(th) * L1, p1[2] + tz * (L1 / (L1 + L2))];
      var fb = segBasis(p1, knee), tb2 = segBasis(knee, foot);
      var side = [0, 0, L.side * 0.12], kside = [0, 0, L.side * 0.1];
      dl(THIGH, fb[0], fb[1], fb[2], p1);
      dl(SHANK, tb2[0], tb2[1], tb2[2], knee);
      dl(MOTOR, side, IDENT_B, [L.side, 0, 0], toWorld(B, O, L.hx, L.hy, L.hz));
      dl(KNEE, kside, IDENT_B, [L.side, 0, 0], [knee[0], knee[1], knee[2] - L.side * 0.05]);
      dl(FOOT, IDENT_A, IDENT_B, IDENT_C, foot);
    }
    // the mast and the sensor head
    var mb = toWorld(B, O, 0.36, 0.1, 0), mt = toWorld(B, O, 0.36, 0.28, 0);
    var nb = segBasis(mb, mt);
    dl(MAST, nb[0], nb[1], nb[2], mb);
    var cyh = Math.cos(headYaw), syh = Math.sin(headYaw), cph = Math.cos(headPitch), sph = Math.sin(headPitch);
    var ha = [cph * cyh, sph, -cph * syh];
    var hb = [-sph * cyh, cph, sph * syh];
    var hc = [syh, 0, cyh];
    var hcen = [mt[0] + hb[0] * 0.08, mt[1] + hb[1] * 0.08, mt[2] + hb[2] * 0.08];
    headNow = pw(hcen);
    dl(HEAD, ha, hb, hc, hcen);
    // the lens sits off to one side of the face
    var lo = [hcen[0] + ha[0] * 0.13 + hc[0] * 0.05, hcen[1] + ha[1] * 0.13 + 0.01, hcen[2] + ha[2] * 0.13 + hc[2] * 0.05];
    dl(LENS, [ha[0] * 0.07, ha[1] * 0.07, ha[2] * 0.07], hb, hc, lo);
    // the antenna, swaying on a spring
    var ab = toWorld(B, O, -0.42, 0.16, -0.1), at = [ab[0] + ant.x, ab[1] + 0.5, ab[2] + ant.x * 0.3];
    var abs2 = segBasis(ab, at);
    dl(ANT, abs2[0], abs2[1], abs2[2], ab);
    dl(ANT_TIP, IDENT_A, IDENT_B, IDENT_C, at);

    paint();
  }
  function paint() {
    var c = ctx, s = cell * dpr, gap = Math.max(1, Math.round(dpr)), sz = s - gap;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = css(colors.bg);
    c.fillRect(0, 0, canvas.width, canvas.height);
    var tick = (t * 6) | 0, gs = atlas.gs;
    var buckets = [];
    for (var b = 0; b < LEVELS; b++) buckets.push([]);
    var hot = [[], [], [], []], glyph = [];
    for (var iy = 0; iy < rows; iy++) {
      for (var ix = 0; ix < cols; ix++) {
        var i = iy * cols + ix, kd = kind[i];
        if (!kd) continue;
        var l = lum[i];
        if (avoid && ix >= avoid.x0 && ix <= avoid.x1 && iy >= avoid.y0 && iy <= avoid.y1) l *= kd === K_ROBOT ? 0.5 : 0.15;
        if (kd === K_FLOOR) {
          var seen = nys[i];
          if (seen < 0.25) {
            // a faint dot, not a full cell
            var lv = clamp((l * 2.2 * (LEVELS - 1)) | 0, 0, LEVELS - 1);
            buckets[lv].push(ix, iy, 1);
          } else {
            buckets[clamp((l * (LEVELS - 1)) | 0, 0, LEVELS - 1)].push(ix, iy, 0);
            if (seen > 0.5 && nxs[i] < 0.35) glyph.push(ix, iy, nxs[i] < 0.12 ? G_PLUS : G_DOT, 1);
          }
        } else if (kd === K_HEAT || kd === K_HAZE) {
          var hv = heatv[i];
          hot[clamp((hv * 4) | 0, 0, 3)].push(ix, iy);
          if (kd === K_HEAT && hv > 0.55 && hash(ix, iy + tick) < 0.35) glyph.push(ix, iy, hash(ix, iy) < 0.5 ? G_STAR : G_PLUS, 2);
        } else if (kd === K_WALL) {
          buckets[clamp((l * (LEVELS - 1)) | 0, 0, LEVELS - 1)].push(ix, iy, 0);
          if (nxs[i] < 0.4) glyph.push(ix, iy, nxs[i] < 0.15 ? G_HASH : G_COLON, 1);
        } else {
          var m = mat[i];
          if (m === M_LENS) { hot[lens > 0.85 ? 3 : (lens > 0.5 ? 2 : (lens > 0.25 ? 1 : 0))].push(ix, iy); if (lens > 0.5 && hash(ix, iy + tick) < 0.3) glyph.push(ix, iy, G_DASH, 2); continue; }
          // silhouette: a neighbour with nothing, or something much further away
          var z0 = zbuf[i];
          var up = iy > 0 ? i - cols : -1, dn = iy < rows - 1 ? i + cols : -1, lf = ix > 0 ? i - 1 : -1, rt = ix < cols - 1 ? i + 1 : -1;
          var oU = up < 0 || kind[up] !== K_ROBOT || zbuf[up] > z0 + 0.3;
          var oD = dn < 0 || kind[dn] !== K_ROBOT || zbuf[dn] > z0 + 0.3;
          var oL = lf < 0 || kind[lf] !== K_ROBOT || zbuf[lf] > z0 + 0.3;
          var oR = rt < 0 || kind[rt] !== K_ROBOT || zbuf[rt] > z0 + 0.3;
          // a thin rim of light on top edges, a touch of shadow underneath
          if (oU) l = Math.min(1, l + 0.22); else if (oD) l *= 0.7;
          else if (oL || oR) l = Math.min(1, l + 0.08);
          buckets[clamp((l * (LEVELS - 1)) | 0, 0, LEVELS - 1)].push(ix, iy, 0);
          var hsh = hash(ix * 7 + (tick >> 3), iy);
          if (m === M_VENT && hsh < 0.7) glyph.push(ix, iy, G_COLON, 0);
          else if (m === M_SEAM && hsh < 0.35) glyph.push(ix, iy, Math.abs(nxs[i]) > Math.abs(nys[i]) ? G_BAR : G_DASH, 0);
        }
      }
    }
    for (var lv2 = 0; lv2 < LEVELS; lv2++) {
      var arr = buckets[lv2];
      if (!arr.length) continue;
      c.fillStyle = colors.shade[lv2];
      for (var a = 0; a < arr.length; a += 3) {
        if (arr[a + 2]) { var ds = Math.max(1.5, s * 0.22); c.fillRect(arr[a] * s + (s - ds) / 2, arr[a + 1] * s + (s - ds) / 2, ds, ds); }
        else c.fillRect(arr[a] * s, arr[a + 1] * s, sz, sz);
      }
    }
    for (var hl = 0; hl < 4; hl++) {
      var hr = hot[hl];
      if (!hr.length) continue;
      c.fillStyle = colors.heat[hl];
      for (var e = 0; e < hr.length; e += 2) c.fillRect(hr[e] * s, hr[e + 1] * s, sz, sz);
    }
    for (var q = 0; q < glyph.length; q += 4) {
      var gi2 = glyph[q + 2];
      // tone row: 0 dark ink on light cells, 1 light ink, 2 for accent cells
      var row = glyph[q + 3];
      if (row === 0 && lum[glyph[q + 1] * cols + glyph[q]] < 0.5) row = 1;
      c.drawImage(atlas, gi2 * gs, row * gs, gs, gs, glyph[q] * s, glyph[q + 1] * s, gs, gs);
    }
  }

  /* --------------------------------------------------------------- loop */
  var raf = 0, last = 0, running = false;
  function frame(now) {
    raf = 0;
    if (!running) return;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    step(dt);
    render();
    raf = requestAnimationFrame(frame);
  }
  function start() { if (reduce || running) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  function still() {
    // a settled, readable pose: some of the floor mapped, one warm spot found
    t = 0; phase = 0.18; crouch = 0.4; lens = 0.7; act = null;
    stateName = 'idle'; route = null; bot.v = 0; bot.w = 0;
    var st = ground(W * (W < 700 ? 0.5 : 0.64), H * (W < 700 ? 0.34 : 0.42)), s0 = st && nearestOk(st[0], st[1]);
    if (s0) { bot.x = s0[0]; bot.z = s0[1]; }
    bot.yaw = -0.45;
    headYaw = 0.5; headPitch = -0.3;
    camYaw = 0; camPitch = P0;
    render();
    pings = [{ r: 2.4, x: bot.x, z: bot.z }];
    for (var i = 0; i < 40; i++) {
      sense(0.1, headNow);
      pings[0].r += 0.08;
    }
    pings = [];
    render();
    label(true);
  }

  function retarget() {
    if (!pointer.active) return;
    pointer.target = unproject(pointer.x, pointer.y);
  }
  function send(sx, sy) {
    var g = ground(sx, sy);
    pings.push({ r: 0.4, x: bot.x, z: bot.z });
    quietAt = t;
    if (!g) return;
    // it stops just short of the spot, so it can look at it
    var d = Math.hypot(g[0] - bot.x, g[1] - bot.z), k = d > 0.8 ? (d - 0.45) / d : 1;
    marker = { x: g[0], z: g[1], done: 0 };
    goTo(bot.x + (g[0] - bot.x) * k, bot.z + (g[1] - bot.z) * k, 'go');
  }

  function boot() {
    layout();
    if (reduce) { still(); }
    else {
      // warm up so the first frame is not empty
      for (var i = 0; i < 90; i++) { step(1 / 30); if (i % 10 === 0) render(); }
      // it starts lying down where it was last time (this visit), and gets up
      try {
        var sv = JSON.parse(sessionStorage.getItem(SKEY) || 'null');
        if (sv && ok(sv.x, sv.z)) { bot.x = sv.x; bot.z = sv.z; bot.yaw = sv.yaw; revisit = true; }
      } catch (err) {}
      route = null; bot.v = bot.w = 0; prints.length = 0;
      pose.lie = 1; lens = 0.1; quietAt = t; restNext = t + 30;
      startAct('wake', revisit ? 0.5 : 1.4);
      step(1 / 60);
      render();
      start();
    }
    label();
    if (countEl) countEl.textContent = (found < 10 ? '0' : '') + (found % 100);
    canvas.classList.add('is-on');
  }

  var SKEY = 'ah-robot-' + mode;
  window.addEventListener('pagehide', function () {
    try { sessionStorage.setItem(SKEY, JSON.stringify({ x: bot.x, z: bot.z, yaw: bot.yaw })); } catch (err) {}
  });
  var host = canvas.closest('[data-robot-host]') || document;
  host.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true; pointer.mouse = true; pointer.at = t;
    if (Math.hypot(pointer.x - pointer.rx, pointer.y - pointer.ry) > 10) { pointer.rx = pointer.x; pointer.ry = pointer.y; pointer.moved = t; pointer.sent = false; quietAt = t; }
    var link = e.target.closest && e.target.closest('a, button, nav, header, [data-robot-avoid]');
    if (link) {
      // the head still looks at links, but the robot does not walk over to them
      pointer.sent = true;
      if (link.matches('a, button')) {
        var lr = link.getBoundingClientRect();
        pointer.x = lr.left + lr.width / 2 - r.left; pointer.y = lr.top + lr.height / 2 - r.top;
      }
    }
    retarget();
  }, { passive: true });
  document.addEventListener('pointerleave', function () { pointer.active = false; });
  host.addEventListener('pointerdown', function (e) {
    if (e.target.closest && e.target.closest('a, button, input, label, summary, nav, header')) return;
    var r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true; pointer.at = t; pointer.sent = true;
    retarget();
    if (reduce) return;
    send(pointer.x, pointer.y);
  }, { passive: true });
  document.addEventListener('focusin', function (e) {
    var a = e.target.closest && e.target.closest('a, button');
    if (!a || reduce) return;
    var r = canvas.getBoundingClientRect(), lr = a.getBoundingClientRect();
    pointer.x = lr.left + lr.width / 2 - r.left; pointer.y = lr.top + lr.height / 2 - r.top; pointer.active = true; pointer.at = t; pointer.sent = true;
    retarget();
  });

  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { layout(); if (reduce) still(); else render(); }, 80);
  });
  document.addEventListener('ah:theme', function () { readColors(); if (reduce || !running) render(); });
  if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { reduce = e.matches; if (reduce) { stop(); still(); } else start(); });

  // for screenshots and debugging
  window.AH_ROBOT = {
    ping: function () { pings.push({ r: 0.4, x: bot.x, z: bot.z }); },
    go: function (sx, sy) { send(sx, sy); },
    step: function (n) { for (var i = 0; i < n; i++) step(1 / 60); render(); },
    stop: stop, start: start,
    face: function (yaw) { bot.yaw = yaw; },
    act: function (name, dur) { if (name === 'stand') { act = null; return; } startAct(name, dur || 8); },
    quiet: function (s) { quietAt = t - s; restNext = 0; },
    fits: function (sx, sy) { setCamera(); var g = ground(sx, sy); return !!g && ok(g[0], g[1]); },
    state: function () {
      setCamera(); project(bot.x, 0, bot.z);
      return { t: t, found: found, state: stateName, x: bot.x, z: bot.z, yaw: bot.yaw, v: bot.v, sx: PX, sy: PY, ok: ok(bot.x, bot.z), route: route ? route.kind : null, act: act ? act.name : null, pose: { sit: +pose.sit.toFixed(2), lie: +pose.lie.toFixed(2), bow: +pose.bow.toFixed(2), sniff: +pose.sniff.toFixed(2) }, lens: +lens.toFixed(2), prints: prints.length };
    }
  };

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
})();
