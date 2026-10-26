/*
 * robot.js
 *
 * A four-legged walker, drawn in 3D and then snapped to a grid of small
 * square cells, a bit like a terminal drawing. It walks on a floor of dots
 * it cannot see until its sensor sweeps over it. Warm spots in the floor
 * show up in the one accent colour; the counter in the corner keeps track
 * of how many it has found.
 *
 * The head follows the pointer (or whatever link you hover). A click or a
 * tap sends out a ping that lights up the whole floor for a moment.
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
  var R = rng(7);
  var FLOOR_X = 5.2, FLOOR_Z = 3.4, SP = 0.2;
  var floor = [];
  for (var fx = -FLOOR_X; fx < FLOOR_X; fx += SP) {
    for (var fz = -FLOOR_Z; fz <= FLOOR_Z + 1e-6; fz += SP) {
      floor.push({ x: fx + (R() - 0.5) * 0.06, z: fz + (R() - 0.5) * 0.06, seen: 0, j: R() });
    }
  }
  var heats = [], walls = [];
  function newHeat(x) {
    var side = R() < 0.5 ? -1 : 1;
    return { x: x, z: side * (0.4 + R() * 2.4), r: 0.22 + R() * 0.2, found: false, glow: 0 };
  }
  function newWall(x) {
    var side = R() < 0.5 ? -1 : 1, w = 0.3 + R() * 0.7, d = 0.25 + R() * 0.5, h = 0.25 + R() * 0.9;
    var z = side * (1.5 + R() * 1.6), pts = [], st = 0.11;
    for (var a = -w / 2; a <= w / 2 + 1e-6; a += st) {
      for (var y = st / 2; y <= h; y += st) {
        pts.push([a, y, -d / 2], [a, y, d / 2]);
      }
    }
    for (var b = -d / 2 + st; b < d / 2; b += st) {
      for (var y2 = st / 2; y2 <= h; y2 += st) pts.push([-w / 2, y2, b], [w / 2, y2, b]);
    }
    for (var a2 = -w / 2; a2 <= w / 2 + 1e-6; a2 += st) for (var b2 = -d / 2; b2 <= d / 2 + 1e-6; b2 += st) pts.push([a2, h, b2]);
    return { x: x, z: z, pts: pts, seen: new Float32Array(pts.length) };
  }
  for (var hi = 0; hi < 5; hi++) heats.push(newHeat(-FLOOR_X + (hi + 0.5) * (2 * FLOOR_X / 5) + (R() - 0.5)));
  for (var wi = 0; wi < 3; wi++) walls.push(newWall(-FLOOR_X + (wi + 0.6) * (2 * FLOOR_X / 3)));
  var haze = [];
  var pings = [];
  var found = 0;

  /* ------------------------------------------------------------- the state */
  var t = 0, phase = 0, speed = 0.5, speedTarget = 0.5, FREQ = 1.15, gaitF = 1.15;
  var stateName = 'explore', stateUntil = 9;
  var headYaw = 0, headPitch = -0.25, hyV = 0, hpV = 0;
  var camYaw = 0.95, camPitch = 0.24, camYawT = 0.95, camPitchT = 0.24;
  var pointer = { x: 0, y: 0, active: false, at: -99, target: null };
  var crouch = 0;

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
    if (mode === 'lost') {
      scale = Math.min(W * (narrow ? 0.28 : 0.14), H * 0.25);
      cx = W * (narrow ? 0.5 : 0.62); cy = H * (narrow ? 0.36 : 0.42);
    } else if (narrow) {
      scale = Math.min(W * 0.3, H * 0.19);
      cx = W * 0.54; cy = H * 0.33;
    } else {
      scale = Math.min(W * 0.17, H * 0.29);
      cx = W * 0.6; cy = H * 0.4;
    }
    avoid = null;
    if (avoidEl) {
      var a = avoidEl.getBoundingClientRect();
      if (a.width) avoid = { x0: (a.left - r.left - 18) / cell, y0: (a.top - r.top - 14) / cell, x1: (a.right - r.left + 18) / cell, y1: (a.bottom - r.top + 10) / cell };
    }
    readColors();
  }

  /* --------------------------------------------------------------- camera */
  var cam = { x: 0, y: 0, z: 0, rx: [1, 0, 0], ry: [0, 1, 0], rz: [0, 0, 1], dist: 5.4, focal: 1 };
  var light = [0, 0, 0];
  var TARGET = [0, 0.7, 0];
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
    var key = reduce ? 'still' : (pointer.active && t - pointer.at < 3 && mode !== 'lost' ? 'follow' : stateName);
    if (key === shownKey && !force) return;
    shownKey = key;
    stateEl.textContent = key;
  }
  function bump() { found++; if (countEl) countEl.textContent = (found < 10 ? '0' : '') + (found % 100); }

  function step(dt) {
    t += dt;
    var following = pointer.active && t - pointer.at < 3;
    if (mode === 'lost') {
      speedTarget = 0;
      if (stateName !== 'idle') setState('idle', 1e9);
    } else if (t > stateUntil) {
      if (stateName === 'explore') { setState('idle', 4 + R() * 3); }
      else setState('explore', 9 + R() * 7);
    }
    if (mode !== 'lost') speedTarget = stateName === 'idle' ? 0 : (following ? 0.32 : 0.5);
    label();
    speed += (speedTarget - speed) * Math.min(1, dt * 1.2);
    crouch += ((stateName === 'idle' ? 1 : 0) - crouch) * Math.min(1, dt * 1.5);

    // gait: a walk, three feet on the floor most of the time
    gaitF = FREQ * clamp(0.35 + speed * 1.6, 0, 1);
    phase = (phase + dt * gaitF) % 1;
    var moving = clamp(speed / 0.3, 0, 1);
    body.y = HEIGHT - crouch * 0.12 + 0.012 * Math.sin(phase * Math.PI * 8) * moving + 0.006 * Math.sin(t * 1.7);
    body.roll = 0.025 * Math.sin(phase * Math.PI * 2) * moving;
    body.pitch = -0.015 - crouch * 0.04 + 0.01 * Math.sin(t * 0.9) + 0.012 * Math.sin(phase * Math.PI * 4) * moving;
    // the antenna lags behind the body
    var aT = -speed * 0.16 - (body.y - HEIGHT) * 0.6;
    ant.v += (60 * (aT - ant.x) - 3.2 * ant.v) * dt; ant.x += ant.v * dt;

    // the world slides back under the robot
    var dx = speed * dt;
    for (var i = 0; i < floor.length; i++) {
      var f = floor[i];
      f.x -= dx;
      if (f.x < -FLOOR_X) { f.x += 2 * FLOOR_X; f.seen = 0; }
      f.seen *= Math.exp(-dt * 0.35);
    }
    for (var h = 0; h < heats.length; h++) {
      heats[h].x -= dx; heats[h].glow *= Math.exp(-dt * 0.25);
      if (heats[h].x < -FLOOR_X - 0.5) heats[h] = newHeat(FLOOR_X + R() * 1.5);
    }
    for (var w = 0; w < walls.length; w++) {
      var wl = walls[w];
      wl.x -= dx;
      for (var s = 0; s < wl.seen.length; s++) wl.seen[s] *= Math.exp(-dt * 0.3);
      if (wl.x < -FLOOR_X - 1) walls[w] = newWall(FLOOR_X + 0.6 + R() * 2);
    }
    for (var z = haze.length - 1; z >= 0; z--) {
      var hz = haze[z]; hz.y += dt * hz.v; hz.x -= dx; hz.life -= dt;
      if (hz.life <= 0) haze.splice(z, 1);
    }
    for (var p = pings.length - 1; p >= 0; p--) { pings[p].r += dt * 3.2; if (pings[p].r > 7) pings.splice(p, 1); }

    // where the head wants to look
    var ty, tp;
    var headPos = headNow;
    if (following && pointer.target) {
      var tg = pointer.target;
      ty = Math.atan2(-(tg[2] - headPos[2]), tg[0] - headPos[0]);
      tp = Math.atan2(tg[1] - headPos[1], Math.sqrt(Math.pow(tg[0] - headPos[0], 2) + Math.pow(tg[2] - headPos[2], 2)));
    } else if (stateName === 'idle') {
      ty = Math.sin(t * 0.7) * 1.05; tp = -0.32 + 0.12 * Math.sin(t * 0.43);
    } else {
      ty = Math.sin(t * 0.37) * 0.6 + Math.sin(t * 0.13) * 0.25; tp = -0.3 + 0.08 * Math.sin(t * 0.5);
    }
    ty = clamp(ty, -1.5, 1.5); tp = clamp(tp, -0.7, 0.45);
    // a spring, so it settles instead of snapping
    var k = 26, damp = 9;
    hyV += (k * (ty - headYaw) - damp * hyV) * dt; headYaw += hyV * dt;
    hpV += (k * (tp - headPitch) - damp * hpV) * dt; headPitch += hpV * dt;

    // camera drifts, and leans a little toward the pointer
    var px = pointer.active ? (pointer.x / W - 0.5) : 0, py = pointer.active ? (pointer.y / H - 0.5) : 0;
    camYawT = 0.95 + 0.22 * Math.sin(t * 0.045) + px * 0.3;
    camPitchT = 0.24 + 0.04 * Math.sin(t * 0.07) + py * 0.1;
    camYaw += (camYawT - camYaw) * Math.min(1, dt * 1.4);
    camPitch += (camPitchT - camPitch) * Math.min(1, dt * 1.4);

    sense(dt, headPos);
  }

  // the sensor: a cone from the head, plus any ping rings
  function sense(dt, headPos) {
    var dirYaw = headYaw, dirPitch = headPitch;
    var dxh = Math.cos(dirPitch) * Math.cos(dirYaw), dyh = Math.sin(dirPitch), dzh = -Math.cos(dirPitch) * Math.sin(dirYaw);
    var cosCone = Math.cos(0.36), reach = 4.6;
    function seeAmount(x, y, z) {
      var vx = x - headPos[0], vy = y - headPos[1], vz = z - headPos[2];
      var d = Math.sqrt(vx * vx + vy * vy + vz * vz);
      if (d > reach || d < 0.05) return 0;
      var c = (vx * dxh + vy * dyh + vz * dzh) / d;
      if (c < cosCone) return 0;
      return (1 - d / reach) * clamp((c - cosCone) / (1 - cosCone) * 3, 0, 1);
    }
    for (var i = 0; i < floor.length; i++) {
      var f = floor[i], s = seeAmount(f.x, 0, f.z);
      for (var p = 0; p < pings.length; p++) {
        var rr = Math.sqrt(f.x * f.x + f.z * f.z), dd = Math.abs(rr - pings[p].r);
        if (dd < 0.25) s = Math.max(s, (1 - dd / 0.25) * (1 - pings[p].r / 7.5));
      }
      if (s > f.seen) f.seen = Math.min(1, f.seen + (s - f.seen) * Math.min(1, dt * 8));
    }
    for (var w = 0; w < walls.length; w++) {
      var wl = walls[w];
      for (var j = 0; j < wl.pts.length; j++) {
        var q = wl.pts[j], x = wl.x + q[0], z = wl.z + q[2], s2 = seeAmount(x, q[1], z);
        for (var p2 = 0; p2 < pings.length; p2++) {
          var r2 = Math.sqrt(x * x + z * z), d2 = Math.abs(r2 - pings[p2].r);
          if (d2 < 0.3) s2 = Math.max(s2, (1 - d2 / 0.3) * (1 - pings[p2].r / 7.5));
        }
        if (s2 > wl.seen[j]) wl.seen[j] = Math.min(1, wl.seen[j] + (s2 - wl.seen[j]) * Math.min(1, dt * 8));
      }
    }
    for (var h = 0; h < heats.length; h++) {
      var ht = heats[h], s3 = seeAmount(ht.x, 0, ht.z);
      for (var p3 = 0; p3 < pings.length; p3++) {
        var r3 = Math.sqrt(ht.x * ht.x + ht.z * ht.z);
        if (Math.abs(r3 - pings[p3].r) < 0.35) s3 = Math.max(s3, 0.8);
      }
      if (s3 > 0.15) {
        ht.glow = Math.min(1, ht.glow + dt * 3);
        if (!ht.found && ht.glow > 0.5) { ht.found = true; bump(); }
        if (!reduce && R() < dt * 14) haze.push({ x: ht.x + (R() - 0.5) * ht.r * 1.4, y: 0.05, z: ht.z + (R() - 0.5) * ht.r * 1.4, v: 0.25 + R() * 0.3, life: 1.4 + R() });
      }
    }
  }

  /* ------------------------------------------------------------- render */
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
      var edge = 1 - clamp((Math.abs(f.x) - FLOOR_X * 0.55) / (FLOOR_X * 0.45), 0, 1);
      edge *= 1 - clamp((Math.abs(f.z) - FLOOR_Z * 0.5) / (FLOOR_Z * 0.5), 0, 1);
      var base = 0.06 + 0.07 * edge;
      var l = (base + f.seen * 0.75) * edge;
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

    // the robot
    var B = bodyBasis(), O = [0, body.y, 0];
    drawSet(BODY, B[0], B[1], B[2], O);
    drawSet(DECK, B[0], B[1], B[2], toWorld(B, O, -0.08, 0.15, 0));
    drawSet(BELLY, B[0], B[1], B[2], toWorld(B, O, 0, -0.14, 0));
    var stride = speed * DUTY / gaitF, lift = 0.15 * clamp(speed / 0.2, 0, 1);
    for (var g = 0; g < LEGS.length; g++) {
      var L = LEGS[g];
      var ph = (phase + LEG_OFFSET[g]) % 1, fx, fy = 0;
      if (ph < DUTY) { fx = L.fx + stride / 2 - stride * (ph / DUTY); }
      else { var sw = (ph - DUTY) / (1 - DUTY), e = sw * sw * (3 - 2 * sw); fx = L.fx - stride / 2 + stride * e; fy = lift * Math.sin(Math.PI * sw); }
      var p1 = toWorld(B, O, L.hx, L.hy, L.pz);
      var foot = [fx, fy + 0.06, L.fz + L.side * crouch * 0.04];
      // two links in the leg's vertical plane, knee pointing back
      var ta = foot[0] - p1[0], tb = foot[1] - p1[1], tz = foot[2] - p1[2];
      var dd = Math.sqrt(ta * ta + tb * tb), dc = clamp(dd, Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-3);
      var th = Math.atan2(tb, ta) - Math.acos(clamp((L1 * L1 + dc * dc - L2 * L2) / (2 * L1 * dc), -1, 1));
      var knee = [p1[0] + Math.cos(th) * L1, p1[1] + Math.sin(th) * L1, p1[2] + tz * (L1 / (L1 + L2))];
      var fb = segBasis(p1, knee), tb2 = segBasis(knee, foot);
      var side = [0, 0, L.side * 0.12], kside = [0, 0, L.side * 0.1];
      drawSet(THIGH, fb[0], fb[1], fb[2], p1);
      drawSet(SHANK, tb2[0], tb2[1], tb2[2], knee);
      drawSet(MOTOR, side, IDENT_B, [L.side, 0, 0], toWorld(B, O, L.hx, L.hy, L.hz));
      drawSet(KNEE, kside, IDENT_B, [L.side, 0, 0], [knee[0], knee[1], knee[2] - L.side * 0.05]);
      drawSet(FOOT, IDENT_A, IDENT_B, IDENT_C, foot);
    }
    // the mast and the sensor head
    var mb = toWorld(B, O, 0.36, 0.1, 0), mt = toWorld(B, O, 0.36, 0.28, 0);
    var nb = segBasis(mb, mt);
    drawSet(MAST, nb[0], nb[1], nb[2], mb);
    var cyh = Math.cos(headYaw), syh = Math.sin(headYaw), cph = Math.cos(headPitch), sph = Math.sin(headPitch);
    var ha = [cph * cyh, sph, -cph * syh];
    var hb = [-sph * cyh, cph, sph * syh];
    var hc = [syh, 0, cyh];
    var hcen = [mt[0] + hb[0] * 0.08, mt[1] + hb[1] * 0.08, mt[2] + hb[2] * 0.08];
    headNow = hcen;
    drawSet(HEAD, ha, hb, hc, hcen);
    // the lens sits off to one side of the face
    var lo = [hcen[0] + ha[0] * 0.13 + hc[0] * 0.05, hcen[1] + ha[1] * 0.13 + 0.01, hcen[2] + ha[2] * 0.13 + hc[2] * 0.05];
    drawSet(LENS, [ha[0] * 0.07, ha[1] * 0.07, ha[2] * 0.07], hb, hc, lo);
    // the antenna, swaying on a spring
    var ab = toWorld(B, O, -0.42, 0.16, -0.1), at = [ab[0] + ant.x, ab[1] + 0.5, ab[2] + ant.x * 0.3];
    var abs2 = segBasis(ab, at);
    drawSet(ANT, abs2[0], abs2[1], abs2[2], ab);
    drawSet(ANT_TIP, IDENT_A, IDENT_B, IDENT_C, at);

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
          if (m === M_LENS) { hot[3].push(ix, iy); if (hash(ix, iy + tick) < 0.3) glyph.push(ix, iy, G_DASH, 2); continue; }
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
    // a settled, readable pose: the floor partly mapped, one warm spot found
    t = 0; phase = 0.18; speed = 0; crouch = 0.4;
    stateName = 'idle';
    headYaw = 0.55; headPitch = -0.3;
    camYaw = 0.95; camPitch = 0.24;
    pings = [{ r: 2.4 }];
    for (var i = 0; i < 40; i++) {
      var hp = headNow;
      sense(0.1, hp);
      pings[0].r += 0.08;
    }
    pings = [];
    speed = 0.0001;
    render();
    label(true);
  }

  function retarget() {
    if (!pointer.active) return;
    pointer.target = unproject(pointer.x, pointer.y);
  }

  function boot() {
    layout();
    if (reduce) { still(); }
    else {
      // warm up so the first frame is not empty
      for (var i = 0; i < 90; i++) step(1 / 30);
      render();
      start();
    }
    label();
    if (countEl) countEl.textContent = (found < 10 ? '0' : '') + (found % 100);
    canvas.classList.add('is-on');
  }

  var host = canvas.closest('[data-robot-host]') || document;
  host.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true; pointer.at = t;
    var link = e.target.closest && e.target.closest('a, button');
    if (link) {
      var lr = link.getBoundingClientRect();
      pointer.x = lr.left + lr.width / 2 - r.left; pointer.y = lr.top + lr.height / 2 - r.top;
    }
    retarget();
  }, { passive: true });
  document.addEventListener('pointerleave', function () { pointer.active = false; });
  host.addEventListener('pointerdown', function (e) {
    if (e.target.closest && e.target.closest('a, button, input, label, summary, nav, header')) return;
    var r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true; pointer.at = t;
    retarget();
    if (reduce) return;
    pings.push({ r: 0.4 });
    if (stateName === 'idle' && mode !== 'lost') setState('explore', 8 + R() * 5);
  }, { passive: true });
  document.addEventListener('focusin', function (e) {
    var a = e.target.closest && e.target.closest('a, button');
    if (!a || reduce) return;
    var r = canvas.getBoundingClientRect(), lr = a.getBoundingClientRect();
    pointer.x = lr.left + lr.width / 2 - r.left; pointer.y = lr.top + lr.height / 2 - r.top; pointer.active = true; pointer.at = t;
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
  window.AH_ROBOT = { ping: function () { pings.push({ r: 0.4 }); }, step: function (n) { for (var i = 0; i < n; i++) step(1 / 60); render(); }, stop: stop, start: start, state: function () { return { t: t, found: found, state: stateName }; } };

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
})();
