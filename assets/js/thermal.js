/*
 * thermal.js
 *
 * A white-hot thermal field drawn as a grid of squares, and a small robot
 * that looks for the warmest thing it can see and drives to it.
 *
 * The page text is the map. Anything marked [data-obstacle] inside the host
 * becomes a wall: heat does not show through it, the robot cannot see
 * through it, and the planner routes around it (A* on a coarse grid, with a
 * small penalty near walls, then pure pursuit to follow the path).
 *
 * States follow PyroScout: SEARCHING, NAVIGATING, REACHED.
 */
(function () {
  'use strict';

  var CYAN = '#E2A04C';
  var CYAN_RGB = '226,160,76';
  var INK = [20, 19, 18];
  var PAPER = [241, 236, 228];
  var LEVELS = 20;
  var STEP = 1 / 60;
  var SQ2 = Math.SQRT2;

  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function wrapAngle(a) {
    a = (a + Math.PI) % (2 * Math.PI);
    if (a < 0) a += 2 * Math.PI;
    return a - Math.PI;
  }
  function makeRandom(seed) {
    var s = (seed >>> 0) || 0x9e3779b9;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function pad(n, w) { n = String(Math.max(0, Math.round(n))); while (n.length < w) n = '0' + n; return n; }

  /* ---------------------------------------------------------------- heap */
  function Heap(cap) { this.ids = new Int32Array(cap); this.keys = new Float32Array(cap); this.n = 0; }
  Heap.prototype.push = function (id, key) {
    if (this.n >= this.ids.length) return;
    var ids = this.ids, keys = this.keys, i = this.n++;
    while (i > 0) {
      var p = (i - 1) >> 1;
      if (keys[p] <= key) break;
      ids[i] = ids[p]; keys[i] = keys[p]; i = p;
    }
    ids[i] = id; keys[i] = key;
  };
  Heap.prototype.pop = function () {
    var ids = this.ids, keys = this.keys, top = ids[0], n = --this.n;
    if (n <= 0) return top;
    var id = ids[n], key = keys[n], i = 0;
    for (;;) {
      var l = 2 * i + 1;
      if (l >= n) break;
      var r = l + 1, c = (r < n && keys[r] < keys[l]) ? r : l;
      if (keys[c] >= key) break;
      ids[i] = ids[c]; keys[i] = keys[c]; i = c;
    }
    ids[i] = id; keys[i] = key;
    return top;
  };

  /* ------------------------------------------------------------- presets */
  var PRESETS = {
    home:   { robot: true, walker: true, pointer: true, bottomPad: 70, seed: 7 },
    band:   { robot: true, walker: true, pointer: true, bottomPad: 70, seed: 11, walkerSpeed: 38, walkerY: [0.34, 0.74] },
    lost:   { robot: true, walker: false, pointer: true, bottomPad: 0, seed: 404 },
    end:    { robot: false, walker: false, pointer: true, topPad: 60, seed: 3 },
    scenario: { robot: true, walker: false, pointer: false, scenario: true, seed: 5 }
  };

  // PyroScout's three rooms, in metres, y up (same layout as the notebook).
  var SCENE = {
    w: 16, h: 12,
    walls: [
      [4.9, 7, 0.2, 5], [4.9, 0, 0.2, 5],
      [9.9, 4, 0.2, 8], [9.9, 0, 0.2, 2],
      [7, 7.5, 1, 1]
    ],
    start: [2, 6, 0],
    victim: [14, 10.5]
  };

  /* --------------------------------------------------------------- field */
  function Field(canvas, name) {
    var p = PRESETS[name] || PRESETS.home;
    this.opt = p;
    // PyroScout's thermal sensor sees 180 degrees; elsewhere a narrower cone reads better
    this.fov = p.scenario ? Math.PI : 1.95;
    this.canvas = canvas;
    this.host = canvas.closest('[data-field-host]') || canvas.parentElement;
    this.ctx = canvas.getContext('2d');
    this.rand = makeRandom(p.seed);
    this.reduce = !!(mqReduce && mqReduce.matches) || canvas.hasAttribute('data-static');
    this.running = false;
    this.visible = true;
    this.t = 0;
    this.acc = 0;
    this.last = 0;
    this.hudEls = {};
    this.hudScope = canvas.closest('[data-hud-scope]') || this.host;
    var hud = this.hudScope.querySelectorAll('[data-hud]');
    for (var i = 0; i < hud.length; i++) this.hudEls[hud[i].getAttribute('data-hud')] = hud[i];
    this.pointer = { x: 0, y: 0, inside: false, moved: -99 };
    this.drops = [];
    this.idleFrames = 0;
    this.paused = false;
    this.layout();
    this.bind();
  }

  Field.prototype.layout = function (keep) {
    var r = this.host.getBoundingClientRect();
    var W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
    var old = keep && this.W ? { W: this.W, H: this.H, robot: this.robot, walker: this.walker } : null;
    this.W = W; this.H = H;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(W * this.dpr);
    this.canvas.height = Math.round(H * this.dpr);
    this.canvas.style.width = W + 'px';
    this.canvas.style.height = H + 'px';
    var small = W < 700;
    this.cell = this.opt.scenario ? Math.max(4, Math.round(W / 92)) : (small ? 8 : 10);
    this.cols = Math.ceil(W / this.cell);
    this.rows = Math.ceil(H / this.cell);
    var n = this.cols * this.rows;
    this.heat = new Float32Array(n);
    this.tmp = new Float32Array(n);
    this.block = new Uint8Array(n);
    this.level = new Uint8Array(n);
    this.base = this.opt.scenario ? new Float32Array(n) : null;
    this.scale = small ? 0.92 : 1.12;
    this.robotR = 15 * this.scale;

    // coarse planning grid
    this.pcell = this.cell * 2;
    this.pcols = Math.ceil(W / this.pcell);
    this.prows = Math.ceil(H / this.pcell);
    var pn = this.pcols * this.prows;
    this.pblock = new Uint8Array(pn);
    this.pcost = new Float32Array(pn);
    this.visited = new Float32Array(pn);
    this.seen = new Uint8Array(pn);
    this.g = new Float32Array(pn);
    this.parent = new Int32Array(pn);
    this.closed = new Uint8Array(pn);
    this.heap = new Heap(pn * 8);

    if (this.opt.scenario) {
      this.setupScene();
      this.scale = clamp(this.mpp * 0.4 / 15, 0.4, 1.1);
      this.robotR = 15 * this.scale;
    }
    this.collectObstacles();
    this.buildAmbient();

    if (this.opt.robot) {
      if (old && old.robot) {
        this.robot = old.robot;
        this.robot.x *= W / old.W; this.robot.y *= H / old.H;
        this.robot.path = null;
        this.robot.est = null;
        this.unstick(this.robot);
      } else {
        this.resetRobot();
      }
    }
    if (this.opt.walker) {
      if (old && old.walker) {
        this.walker = old.walker;
        this.walker.x *= W / old.W; this.walker.y *= H / old.H;
        this.walker.tx = this.walker.x; this.walker.ty = this.walker.y;
      } else {
        this.placeActors();
      }
    }
  };

  /* --- obstacles ---------------------------------------------------- */
  Field.prototype.collectObstacles = function () {
    var hr = this.host.getBoundingClientRect();
    var rects = [];
    var els = this.host.querySelectorAll('[data-obstacle]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.getClientRects().length) continue;
      var cs = window.getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      var list;
      if (el.getAttribute('data-obstacle') === 'text') {
        var range = document.createRange();
        range.selectNodeContents(el);
        list = range.getClientRects();
      } else {
        list = [el.getBoundingClientRect()];
      }
      for (var j = 0; j < list.length; j++) {
        var q = list[j];
        if (q.width < 2 || q.height < 2) continue;
        rects.push({ x: q.left - hr.left, y: q.top - hr.top, w: q.width, h: q.height });
      }
    }
    if (this.opt.scenario) rects = rects.concat(this.sceneRects);
    this.rects = rects;
    this.rasterise();
  };

  Field.prototype.rasterise = function () {
    var c = this.cell, cols = this.cols, rows = this.rows, block = this.block;
    block.fill(0);
    var padH = this.opt.scenario ? 0 : 5;
    for (var k = 0; k < this.rects.length; k++) {
      var r = this.rects[k];
      var x0 = Math.floor((r.x - padH) / c), x1 = Math.ceil((r.x + r.w + padH) / c);
      var y0 = Math.floor((r.y - padH) / c), y1 = Math.ceil((r.y + r.h + padH) / c);
      for (var y = Math.max(0, y0); y < Math.min(rows, y1); y++)
        for (var x = Math.max(0, x0); x < Math.min(cols, x1); x++) block[y * cols + x] = 1;
    }
    var top = this.opt.topPad || 0, bottom = this.opt.bottomPad || 0;
    if (top) for (var yy = 0; yy < Math.min(rows, Math.ceil(top / c)); yy++) for (var xx = 0; xx < cols; xx++) block[yy * cols + xx] = 1;
    if (bottom) for (var y2 = Math.max(0, rows - Math.ceil(bottom / c)); y2 < rows; y2++) for (var x2 = 0; x2 < cols; x2++) block[y2 * cols + x2] = 1;

    // planning grid, inflated by the robot's size
    var pc = this.pcell, pcols = this.pcols, prows = this.prows, pb = this.pblock;
    pb.fill(0);
    var inf = this.robotR + (this.opt.scenario ? 1 : 7);
    for (var m = 0; m < this.rects.length; m++) {
      var q = this.rects[m];
      var a0 = Math.floor((q.x - inf) / pc), a1 = Math.ceil((q.x + q.w + inf) / pc);
      var b0 = Math.floor((q.y - inf) / pc), b1 = Math.ceil((q.y + q.h + inf) / pc);
      for (var b = Math.max(0, b0); b < Math.min(prows, b1); b++)
        for (var a = Math.max(0, a0); a < Math.min(pcols, a1); a++) pb[b * pcols + a] = 1;
    }
    var edge = Math.ceil(inf / pc);
    for (var py = 0; py < prows; py++) for (var px = 0; px < pcols; px++) {
      var cy = (py + 0.5) * pc, cx = (px + 0.5) * pc;
      if (px < edge || py < edge || px >= pcols - edge || py >= prows - edge) pb[py * pcols + px] = 1;
      if (top && cy < top + inf) pb[py * pcols + px] = 1;
      if (bottom && cy > this.H - bottom - inf) pb[py * pcols + px] = 1;
      if (cx < 0) pb[py * pcols + px] = 1;
    }

    // clearance cost: cells close to a wall cost a little more (keeps paths centred)
    var n = pcols * prows, dist = new Int16Array(n), queue = new Int32Array(n), qh = 0, qt = 0;
    for (var i = 0; i < n; i++) { if (pb[i]) { dist[i] = 0; queue[qt++] = i; } else dist[i] = 999; }
    while (qh < qt) {
      var cur = queue[qh++], ux = cur % pcols, uy = (cur / pcols) | 0, d = dist[cur] + 1;
      if (d > 4) continue;
      if (ux > 0 && dist[cur - 1] > d) { dist[cur - 1] = d; queue[qt++] = cur - 1; }
      if (ux < pcols - 1 && dist[cur + 1] > d) { dist[cur + 1] = d; queue[qt++] = cur + 1; }
      if (uy > 0 && dist[cur - pcols] > d) { dist[cur - pcols] = d; queue[qt++] = cur - pcols; }
      if (uy < prows - 1 && dist[cur + pcols] > d) { dist[cur + pcols] = d; queue[qt++] = cur + pcols; }
    }
    for (var j2 = 0; j2 < n; j2++) this.pcost[j2] = pb[j2] ? 0 : Math.max(0, 3 - dist[j2]) * 0.9;
  };

  Field.prototype.freeAt = function (x, y) {
    var px = Math.floor(x / this.pcell), py = Math.floor(y / this.pcell);
    if (px < 0 || py < 0 || px >= this.pcols || py >= this.prows) return false;
    return !this.pblock[py * this.pcols + px];
  };

  Field.prototype.nearestFree = function (px, py) {
    var W = this.pcols, H = this.prows;
    px = clamp(px, 0, W - 1); py = clamp(py, 0, H - 1);
    if (!this.pblock[py * W + px]) return [px, py];
    for (var r = 1; r < Math.max(W, H); r++) {
      var best = null, bd = 1e9;
      for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        var x = px + dx, y = py + dy;
        if (x < 0 || y < 0 || x >= W || y >= H || this.pblock[y * W + x]) continue;
        var d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = [x, y]; }
      }
      if (best) return best;
    }
    return null;
  };

  Field.prototype.unstick = function (a) {
    if (this.freeAt(a.x, a.y)) return;
    var f = this.nearestFree(Math.floor(a.x / this.pcell), Math.floor(a.y / this.pcell));
    if (f) { a.x = (f[0] + 0.5) * this.pcell; a.y = (f[1] + 0.5) * this.pcell; }
  };

  /* --- scenario ------------------------------------------------------ */
  Field.prototype.setupScene = function () {
    var s = this.W / SCENE.w, H = this.H;
    this.mpp = s; // pixels per metre
    this.sceneRects = SCENE.walls.map(function (w) {
      return { x: w[0] * s, y: H - (w[1] + w[3]) * s, w: w[2] * s, h: w[3] * s, wall: true };
    });
    var vx = SCENE.victim[0] * s, vy = H - SCENE.victim[1] * s;
    this.victim = { x: vx, y: vy };
    var c = this.cell, cols = this.cols, rows = this.rows, walls = this.sceneRects;
    function hidden(px, py) {
      for (var k = 0; k < walls.length; k++) {
        var q = walls[k];
        // segment vs rectangle (slab test)
        var t0 = 0, t1 = 1, dx = vx - px, dy = vy - py;
        var p = [-dx, dx, -dy, dy], qq = [px - q.x, q.x + q.w - px, py - q.y, q.y + q.h - py], ok = true;
        for (var m = 0; m < 4; m++) {
          if (p[m] === 0) { if (qq[m] < 0) { ok = false; break; } continue; }
          var r = qq[m] / p[m];
          if (p[m] < 0) { if (r > t1) { ok = false; break; } if (r > t0) t0 = r; }
          else { if (r < t0) { ok = false; break; } if (r < t1) t1 = r; }
        }
        if (ok) return true;
      }
      return false;
    }
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var px = (x + 0.5) * c, py = (y + 0.5) * c;
      var dx = (px - vx) / s, dy = (py - vy) / s;
      var I = 1 / (dx * dx + dy * dy + 1);
      var v = Math.log(1 + 14 * I) / Math.log(15);
      this.base[y * cols + x] = hidden(px, py) ? v * 0.3 : v * 0.95;
    }
  };

  /* --- actors -------------------------------------------------------- */
  Field.prototype.resetRobot = function () {
    var r = this.robot = {
      x: 0, y: 0, th: 0, v: 0, w: 0,
      state: 'SEARCHING', mode: 'scan', est: null, seenAt: -99, heatSeen: 0,
      path: null, pathAt: -99, goal: null, scanLeft: 1.4, scanDir: 1,
      progressAt: 0, progressD: 1e9, reachedAt: -99, blink: 0
    };
    if (this.opt.scenario) {
      r.x = SCENE.start[0] * this.mpp; r.y = this.H - SCENE.start[1] * this.mpp; r.th = 0;
      this.t = 0;
    } else {
      r.x = this.W * 0.6; r.y = this.H * 0.7; r.th = -Math.PI * 0.8;
    }
    this.unstick(r);
  };

  // Put the walker and the robot somewhere open, away from the text,
  // with the robot facing the walker so the first frames already show a chase.
  Field.prototype.placeActors = function () {
    var W = this.W, H = this.H, best = null, bs = -1e9, rand = this.rand;
    var wy = this.opt.walkerY || [0.2, 0.88];
    for (var i = 0; i < 260; i++) {
      var x = W * (0.12 + 0.8 * rand()), y = H * (wy[0] + (wy[1] - wy[0]) * rand());
      if (!this.freeAt(x, y)) continue;
      var room = this.clearance(x, y);
      var s = room * 1.4 + (x / W) * 60 - Math.abs(y / H - 0.55) * 40;
      if (s > bs) { bs = s; best = [x, y]; }
    }
    if (!best) best = [W * 0.75, H * 0.55];
    this.walker = { x: best[0], y: best[1], tx: best[0], ty: best[1], dir: Math.PI * 0.9, speed: this.opt.walkerSpeed || 46, pause: 0, fade: 1 };
    if (this.robot) {
      var rb = null, rs = -1e9;
      for (var k = 0; k < 220; k++) {
        var a = rand() * Math.PI * 2, d = 300 + rand() * 140;
        var rx = best[0] + Math.cos(a) * d, ry = best[1] + Math.sin(a) * d;
        if (!this.freeAt(rx, ry)) continue;
        var sc = this.clearance(rx, ry) + (ry > best[1] ? 20 : 0) - Math.abs(d - 360) * 0.2;
        if (sc > rs) { rs = sc; rb = [rx, ry]; }
      }
      if (rb) {
        this.robot.x = rb[0]; this.robot.y = rb[1];
        this.robot.th = Math.atan2(best[1] - rb[1], best[0] - rb[0]) + 0.5;
      }
    }
  };

  Field.prototype.clearance = function (x, y) {
    var px = Math.floor(x / this.pcell), py = Math.floor(y / this.pcell), W = this.pcols, H = this.prows;
    for (var r = 1; r < 12; r++) {
      for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        var ax = px + dx, ay = py + dy;
        if (ax < 0 || ay < 0 || ax >= W || ay >= H || this.pblock[ay * W + ax]) return r * this.pcell;
      }
    }
    return 12 * this.pcell;
  };

  /* --- heat ---------------------------------------------------------- */
  Field.prototype.deposit = function (x, y, amp, sigma) {
    var c = this.cell, cols = this.cols, rows = this.rows, heat = this.heat, block = this.block;
    var cx = x / c - 0.5, cy = y / c - 0.5, R = Math.ceil(sigma * 2.6), k = 1 / (2 * sigma * sigma);
    var x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(cols - 1, Math.ceil(cx + R));
    var y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(rows - 1, Math.ceil(cy + R));
    for (var yy = y0; yy <= y1; yy++) {
      var dy = yy - cy;
      for (var xx = x0; xx <= x1; xx++) {
        var i = yy * cols + xx;
        if (block[i]) continue;
        var dx = xx - cx;
        heat[i] += amp * Math.exp(-(dx * dx + dy * dy) * k);
      }
    }
  };

  Field.prototype.diffuse = function () {
    var cols = this.cols, rows = this.rows, h = this.heat, t = this.tmp, block = this.block;
    var decay = this.opt.scenario ? 0.975 : 0.988, kd = 0.16;
    for (var y = 0; y < rows; y++) {
      var row = y * cols;
      for (var x = 0; x < cols; x++) {
        var i = row + x;
        if (block[i]) { t[i] = 0; continue; }
        var c = h[i], s = 0, n = 0;
        if (x > 0 && !block[i - 1]) { s += h[i - 1]; n++; }
        if (x < cols - 1 && !block[i + 1]) { s += h[i + 1]; n++; }
        if (y > 0 && !block[i - cols]) { s += h[i - cols]; n++; }
        if (y < rows - 1 && !block[i + cols]) { s += h[i + cols]; n++; }
        var v = (c + kd * (s - n * c)) * decay;
        t[i] = v < 0.002 ? 0 : v;
      }
    }
    this.heat = t; this.tmp = h;
  };

  /* --- simulation step ---------------------------------------------- */
  Field.prototype.step = function (dt) {
    this.t += dt;
    var t = this.t, P = this.pointer;
    var pointerLive = this.opt.pointer && P.inside && (t - P.moved) < 6;

    if (pointerLive) {
      var idle = t - P.moved;
      this.deposit(P.x, P.y, idle < 1.5 ? 0.12 : 0.07, 1.7);
    }
    for (var i = this.drops.length - 1; i >= 0; i--) {
      var d = this.drops[i];
      d.life -= dt;
      if (d.life <= 0) { this.drops.splice(i, 1); continue; }
      this.deposit(d.x, d.y, 0.1 * Math.min(1, d.life / 3), 1.6);
    }
    if (this.walker) this.stepWalker(dt, pointerLive);
    if (this.robot) this.stepRobot(dt);
    this.diffuse();
  };

  Field.prototype.stepWalker = function (dt, pointerLive) {
    var w = this.walker;
    // a person's heat seen from above: a warm head, softer shoulders
    w.fade += ((pointerLive ? 0 : 1) - w.fade) * Math.min(1, dt * (pointerLive ? 2.5 : 0.35));
    if (w.pause > 0) {
      w.pause -= dt;
    } else {
      var dx = w.tx - w.x, dy = w.ty - w.y, dist = Math.hypot(dx, dy);
      if (dist < 6) {
        w.pause = this.rand() < 0.4 ? 1 + this.rand() * 1.8 : 0;
        this.pickWalkerTarget();
      } else {
        var want = Math.atan2(dy, dx);
        w.dir += clamp(wrapAngle(want - w.dir), -1.6 * dt, 1.6 * dt);
        var sp = w.speed * Math.min(1, dist / 40 + 0.3);
        w.x += Math.cos(w.dir) * sp * dt;
        w.y += Math.sin(w.dir) * sp * dt;
      }
    }
    if (w.fade > 0.02) {
      var a = w.fade, px = -Math.sin(w.dir), py = Math.cos(w.dir), sh = this.cell * 1.5;
      this.deposit(w.x, w.y, 0.085 * a, 1.25);
      this.deposit(w.x + px * sh, w.y + py * sh, 0.05 * a, 1.25);
      this.deposit(w.x - px * sh, w.y - py * sh, 0.05 * a, 1.25);
    }
  };

  Field.prototype.pickWalkerTarget = function () {
    var w = this.walker, W = this.W, H = this.H, wy = this.opt.walkerY || [0.16, 0.86];
    for (var i = 0; i < 40; i++) {
      var x = W * (0.06 + 0.88 * this.rand()), y = H * (wy[0] + (wy[1] - wy[0]) * this.rand());
      var d = Math.hypot(x - w.x, y - w.y);
      if (d < 120 || d > Math.max(420, W * 0.45)) continue;
      if (!this.freeAt(x, y)) continue;
      w.tx = x; w.ty = y; return;
    }
    w.tx = W * 0.72; w.ty = H * 0.5;
  };

  /* --- robot ---------------------------------------------------------- */
  var SENSE_EVERY = 0.09;

  Field.prototype.sense = function () {
    var r = this.robot, FOV = this.fov;
    if (this.opt.scenario) {
      this.markSeen();
      var v = this.victim, dx = v.x - r.x, dy = v.y - r.y, d = Math.hypot(dx, dy);
      var ang = Math.abs(wrapAngle(Math.atan2(dy, dx) - r.th));
      if (ang > FOV / 2 + 0.05) return null;
      if (!this.lineClear(r.x, r.y, v.x, v.y)) return null;
      var noise = this.mpp * 0.12;
      return { x: v.x + (this.rand() - 0.5) * noise, y: v.y + (this.rand() - 0.5) * noise, h: Math.min(1, 6 / (d / this.mpp + 1)) };
    }
    var c = this.cell, cols = this.cols, rows = this.rows, heat = this.heat, block = this.block;
    var range = Math.max(this.W, this.H) * 0.62, rays = 33, best = 0, bx = 0, by = 0;
    for (var k = 0; k < rays; k++) {
      var a = r.th - FOV / 2 + FOV * k / (rays - 1), ca = Math.cos(a), sa = Math.sin(a);
      for (var s = c; s < range; s += c * 0.85) {
        var x = r.x + ca * s, y = r.y + sa * s;
        var gx = (x / c) | 0, gy = (y / c) | 0;
        if (x < 0 || y < 0 || gx >= cols || gy >= rows) break;
        var i = gy * cols + gx;
        if (block[i]) break; // walls block infrared
        var h = heat[i] * (1 - 0.3 * s / range);
        if (h > best) { best = h; bx = x; by = y; }
      }
    }
    return best > 0.2 ? { x: bx, y: by, h: best } : null;
  };

  Field.prototype.markSeen = function () {
    var r = this.robot, c = this.cell, pc = this.pcell, range = this.mpp * 5.5, rays = 41, FOV = this.fov;
    for (var k = 0; k < rays; k++) {
      var a = r.th - FOV / 2 + FOV * k / (rays - 1), ca = Math.cos(a), sa = Math.sin(a);
      for (var s = 0; s < range; s += c * 0.8) {
        var x = r.x + ca * s, y = r.y + sa * s;
        var gx = (x / c) | 0, gy = (y / c) | 0;
        if (x < 0 || y < 0 || gx >= this.cols || gy >= this.rows || this.block[gy * this.cols + gx]) break;
        var px = (x / pc) | 0, py = (y / pc) | 0;
        this.seen[py * this.pcols + px] = 1;
      }
    }
  };

  // frontier exploration: go to the nearest free cell that borders the unseen
  Field.prototype.frontierTarget = function () {
    var W = this.pcols, H = this.prows, pb = this.pblock, seen = this.seen, r = this.robot, pc = this.pcell;
    var best = null, bs = 1e9;
    for (var y = 1; y < H - 1; y++) for (var x = 1; x < W - 1; x++) {
      var i = y * W + x;
      if (pb[i] || seen[i]) continue;
      if (!(seen[i - 1] || seen[i + 1] || seen[i - W] || seen[i + W])) continue;
      var cx = (x + 0.5) * pc, cy = (y + 0.5) * pc;
      var d = Math.hypot(cx - r.x, cy - r.y);
      if (d < this.mpp * 1.2) continue;
      var sc = d + this.rand() * pc * 3;
      if (sc < bs) { bs = sc; best = [cx, cy]; }
    }
    return best;
  };

  Field.prototype.lineClear = function (x0, y0, x1, y1) {
    var c = this.cell, d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / (c * 0.5));
    for (var i = 1; i < n; i++) {
      var x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
      var gx = (x / c) | 0, gy = (y / c) | 0;
      if (gx < 0 || gy < 0 || gx >= this.cols || gy >= this.rows) return false;
      if (this.block[gy * this.cols + gx]) return false;
    }
    return true;
  };

  Field.prototype.plan = function (gx, gy) {
    var r = this.robot, pc = this.pcell, W = this.pcols;
    var s = this.nearestFree(Math.floor(r.x / pc), Math.floor(r.y / pc));
    var g = this.nearestFree(Math.floor(gx / pc), Math.floor(gy / pc));
    if (!s || !g) return null;
    var sx = s[0], sy = s[1], tx = g[0], ty = g[1];
    var start = sy * W + sx, goal = ty * W + tx;
    var gs = this.g, par = this.parent, closed = this.closed, heap = this.heap, pb = this.pblock, cost = this.pcost;
    gs.fill(Infinity); closed.fill(0); heap.n = 0;
    gs[start] = 0; par[start] = -1;
    heap.push(start, 0);
    var DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
    var H = this.prows, found = false, pops = 0;
    while (heap.n > 0 && pops < 40000) {
      var cur = heap.pop(); pops++;
      if (closed[cur]) continue;
      closed[cur] = 1;
      if (cur === goal) { found = true; break; }
      var cx = cur % W, cy = (cur / W) | 0;
      for (var k = 0; k < 8; k++) {
        var nx = cx + DX[k], ny = cy + DY[k];
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        var ni = ny * W + nx;
        if (pb[ni] || closed[ni]) continue;
        if (k >= 4 && (pb[cy * W + nx] || pb[ny * W + cx])) continue; // no corner cutting
        var ng = gs[cur] + (k >= 4 ? SQ2 : 1) + cost[ni];
        if (ng < gs[ni]) {
          gs[ni] = ng; par[ni] = cur;
          var ddx = Math.abs(nx - tx), ddy = Math.abs(ny - ty);
          heap.push(ni, ng + (ddx + ddy) + (SQ2 - 2) * Math.min(ddx, ddy));
        }
      }
    }
    if (!found) return null;
    var cells = [];
    for (var c = goal; c !== -1; c = par[c]) cells.push(c);
    cells.reverse();
    var pts = cells.map(function (id) { return [(id % W + 0.5) * pc, (((id / W) | 0) + 0.5) * pc]; });
    pts[0] = [r.x, r.y];
    // string pulling: keep only the corners we need
    var out = [pts[0]], i = 0;
    while (i < pts.length - 1) {
      var j = pts.length - 1;
      while (j > i + 1 && !this.segmentFree(pts[i], pts[j])) j--;
      out.push(pts[j]); i = j;
    }
    return out;
  };

  // exact grid traversal (Amanatides and Woo) over the planning grid; the
  // starting cell is skipped so the robot can always plan its way out
  Field.prototype.segmentFree = function (a, b) {
    var pc = this.pcell, W = this.pcols, H = this.prows, pb = this.pblock;
    var x0 = a[0] / pc, y0 = a[1] / pc, x1 = b[0] / pc, y1 = b[1] / pc;
    var cx = Math.floor(x0), cy = Math.floor(y0), ex = Math.floor(x1), ey = Math.floor(y1);
    var dx = x1 - x0, dy = y1 - y0, sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1;
    var tdx = dx !== 0 ? Math.abs(1 / dx) : Infinity, tdy = dy !== 0 ? Math.abs(1 / dy) : Infinity;
    var tx = dx !== 0 ? (dx > 0 ? cx + 1 - x0 : x0 - cx) * tdx : Infinity;
    var ty = dy !== 0 ? (dy > 0 ? cy + 1 - y0 : y0 - cy) * tdy : Infinity;
    var limit = Math.abs(ex - cx) + Math.abs(ey - cy) + 2;
    for (var i = 0; i <= limit; i++) {
      if (cx < 0 || cy < 0 || cx >= W || cy >= H) return false;
      if (i > 0 && pb[cy * W + cx]) return false;
      if (cx === ex && cy === ey) return true;
      if (Math.abs(tx - ty) < 1e-9) {
        // through a corner exactly: both side cells must be open
        var ax = cx + sx, by = cy + sy;
        if (ax < 0 || ax >= W || by < 0 || by >= H || pb[cy * W + ax] || pb[by * W + cx]) return false;
        tx += tdx; ty += tdy; cx = ax; cy = by;
      } else if (tx < ty) { tx += tdx; cx += sx; }
      else { ty += tdy; cy += sy; }
    }
    return cx === ex && cy === ey;
  };

  Field.prototype.exploreTarget = function () {
    if (this.opt.scenario) { var f = this.frontierTarget(); if (f) return f; }
    var r = this.robot, best = null, bs = 1e9, pc = this.pcell, W = this.pcols;
    var reach = this.opt.scenario ? this.mpp * 6 : Math.max(240, this.W * 0.4);
    for (var i = 0; i < 36; i++) {
      var a = this.rand() * Math.PI * 2, d = 60 + this.rand() * reach;
      var x = r.x + Math.cos(a) * d, y = r.y + Math.sin(a) * d;
      if (!this.freeAt(x, y)) continue;
      var v = this.visited[Math.floor(y / pc) * W + Math.floor(x / pc)];
      var turn = Math.abs(wrapAngle(a - r.th));
      var s = v * 4 + turn * 0.6 + this.rand() * 0.8 - d / reach;
      if (s < bs) { bs = s; best = [x, y]; }
    }
    return best;
  };

  Field.prototype.stepRobot = function (dt) {
    var r = this.robot, t = this.t, sc = this.opt.scenario;
    var STAND = sc ? this.mpp * 0.75 : 66 * this.scale;

    // visited memory (for exploring somewhere new)
    var pc = this.pcell, W = this.pcols, vi = Math.floor(r.y / pc) * W + Math.floor(r.x / pc);
    if (vi >= 0 && vi < this.visited.length) this.visited[vi] = Math.min(6, this.visited[vi] + dt * 2);
    if (((t * 60) | 0) % 30 === 0) for (var q = 0; q < this.visited.length; q++) this.visited[q] *= 0.985;

    if (sc && r.state === 'REACHED' && t - r.reachedAt > 3.2) { this.restartScene(); return; }

    r.senseT = (r.senseT || 0) - dt;
    if (r.senseT <= 0) {
      r.senseT = SENSE_EVERY;
      var m = (r.ignoreUntil && t < r.ignoreUntil) ? null : this.sense();
      if (m) {
        if (!r.est || Math.hypot(m.x - r.est.x, m.y - r.est.y) > 160) r.est = { x: m.x, y: m.y };
        else { r.est.x += (m.x - r.est.x) * 0.45; r.est.y += (m.y - r.est.y) * 0.45; }
        r.seenAt = t; r.heatSeen = m.h;
      }
    }

    var vCmd = 0, wCmd = 0, fresh = r.est && (t - r.seenAt) < (sc ? 99 : 2.2);
    if (r.est) {
      var dx = r.est.x - r.x, dy = r.est.y - r.y, dist = Math.hypot(dx, dy);
      var face = wrapAngle(Math.atan2(dy, dx) - r.th);
      if (dist < STAND + (r.state === 'REACHED' ? 22 : 0)) {
        if (fresh) {
          if (r.state !== 'REACHED') { r.state = 'REACHED'; r.reachedAt = t; r.blink = 0.25; }
          wCmd = clamp(face * 3, -2.2, 2.2);
          // a small look-around now and then, like it's curious
          if (!sc && ((t - r.reachedAt) % 5) > 4.4) wCmd += Math.sin(t * 9) * 1.4;
          r.path = null;
        } else {
          // got to the last place it saw heat and there is nothing there
          r.est = null; r.state = 'SEARCHING'; r.mode = 'scan'; r.scanLeft = 1.6 + this.rand(); r.scanDir = this.rand() < 0.5 ? -1 : 1;
        }
      } else {
        r.state = 'NAVIGATING';
        var moved = r.goal ? Math.hypot(r.goal[0] - r.est.x, r.goal[1] - r.est.y) : 1e9;
        if (!r.path || r.replan || moved > pc * 1.2 || t - r.pathAt > 0.9) {
          r.replan = false;
          r.path = this.plan(r.est.x, r.est.y); r.pathAt = t; r.goal = [r.est.x, r.est.y];
          if (!r.path) { r.est = null; r.state = 'SEARCHING'; r.mode = 'scan'; r.scanLeft = 1.2; }
        }
        if (r.path) { var cmd = this.pursue(dist - STAND); vCmd = cmd[0]; wCmd = cmd[1]; }
      }
    } else {
      r.state = 'SEARCHING';
      if (r.mode === 'scan') {
        r.scanLeft -= dt;
        wCmd = 1.25 * r.scanDir;
        if (r.scanLeft <= 0) {
          var tg = this.exploreTarget();
          if (tg) { r.mode = 'explore'; r.replan = false; r.path = this.plan(tg[0], tg[1]); r.goal = tg; r.pathAt = t; r.progressAt = t; r.progressD = 1e9; }
          if (!r.path) { r.mode = 'scan'; r.scanLeft = 0.8; }
        }
      } else {
        var rem = r.goal ? Math.hypot(r.goal[0] - r.x, r.goal[1] - r.y) : 0;
        if (r.goal && (!r.path || r.replan) && rem >= 14) {
          r.replan = false;
          r.path = this.plan(r.goal[0], r.goal[1]); r.pathAt = t;
        }
        if (!r.path || rem < 14) {
          r.mode = 'scan'; r.scanLeft = sc ? 0.5 + this.rand() * 0.6 : 0.9 + this.rand() * 1.4; r.scanDir = this.rand() < 0.5 ? -1 : 1; r.path = null;
        } else {
          var c2 = this.pursue(rem); vCmd = c2[0] * 0.7; wCmd = c2[1];
          if (rem < r.progressD - 8) { r.progressD = rem; r.progressAt = t; }
          if (t - r.progressAt > 4) { r.mode = 'scan'; r.scanLeft = 0.6; r.path = null; }
        }
      }
    }

    // differential drive with acceleration limits
    var VMAX = sc ? this.mpp * 1.6 : 92 * this.scale;
    vCmd = clamp(vCmd, 0, VMAX);
    r.v += clamp(vCmd - r.v, -320 * dt, 220 * dt);
    r.w += clamp(wCmd - r.w, -9 * dt, 9 * dt);
    r.th = wrapAngle(r.th + r.w * dt);
    var nx = r.x + Math.cos(r.th) * r.v * dt, ny = r.y + Math.sin(r.th) * r.v * dt;
    var inside = nx > 4 && ny > 4 && nx < this.W - 4 && ny < this.H - 4;
    if (inside && (this.freeAt(nx, ny) || !this.freeAt(r.x, r.y))) { r.x = nx; r.y = ny; r.blocked = 0; }
    // slide along whichever axis is still open, so a cell edge can't pin it
    else if (inside && Math.abs(ny - r.y) > 1e-4 && this.freeAt(r.x, ny)) { r.y = ny; r.blocked = 0; }
    else if (inside && Math.abs(nx - r.x) > 1e-4 && this.freeAt(nx, r.y)) { r.x = nx; r.blocked = 0; }
    else {
      r.v = 0;
      r.blocked = (r.blocked || 0) + dt;
      if (r.blocked > 0.4) { r.replan = true; r.pathAt = -99; r.blocked = 0; }
    }

    // no progress for a while: give up on this target and look again
    if (r.state === 'NAVIGATING') {
      var dGoal = r.est ? Math.hypot(r.est.x - r.x, r.est.y - r.y) : 0;
      if (dGoal < (r.navBest || 1e9) - 6) { r.navBest = dGoal; r.navAt = t; }
      if (t - (r.navAt || t) > 3.5) {
        r.est = null; r.state = 'SEARCHING'; r.mode = 'scan'; r.scanLeft = 1.2; r.path = null; r.navBest = 1e9; r.navAt = t;
        r.ignoreUntil = t + 1.5;
      }
    } else { r.navBest = 1e9; r.navAt = t; }

    // warm wheels leave a faint track
    if (r.v > 8) {
      var px = -Math.sin(r.th) * 8 * this.scale, py = Math.cos(r.th) * 8 * this.scale, amp = 0.012 * r.v / VMAX;
      this.deposit(r.x + px, r.y + py, amp, 0.8);
      this.deposit(r.x - px, r.y - py, amp, 0.8);
    }
    if (r.blink > 0) r.blink -= dt;
  };

  // pure pursuit: steer at a "carrot" a fixed distance ahead on the path,
  // the farthest point along it that the robot can actually see
  Field.prototype.pursue = function (remaining) {
    var r = this.robot, path = r.path, sc = this.opt.scenario;
    var L = sc ? this.mpp * 0.8 : 34 * this.scale;
    var VMAX = sc ? this.mpp * 1.6 : 92 * this.scale;
    var tol = sc ? this.mpp * 0.25 : 10;
    while (path.length > 1 && Math.hypot(path[0][0] - r.x, path[0][1] - r.y) < tol && this.segmentFree([r.x, r.y], path[1])) path.shift();
    var tx = path[0][0], ty = path[0][1], px = r.x, py = r.y, acc = 0, stepLen = this.pcell * 0.5, done = false;
    for (var i = 0; i < path.length && !done; i++) {
      var qx = path[i][0], qy = path[i][1], seg = Math.hypot(qx - px, qy - py);
      for (var d = Math.min(stepLen, seg); d <= seg + 1e-6; d += stepLen) {
        if (acc + d > L) { done = true; break; }
        var cx = px + (qx - px) * (seg ? d / seg : 0), cy = py + (qy - py) * (seg ? d / seg : 0);
        if (!this.segmentFree([r.x, r.y], [cx, cy])) { done = true; break; }
        tx = cx; ty = cy;
      }
      acc += seg; px = qx; py = qy;
    }
    if (tx === path[0][0] && ty === path[0][1] && !this.segmentFree([r.x, r.y], [tx, ty])) {
      r.replan = true;
      return [0, 0];
    }
    var err = wrapAngle(Math.atan2(ty - r.y, tx - r.x) - r.th);
    var w = clamp(err * 3.2, -2.6, 2.6);
    var c = Math.cos(err);
    var v = Math.abs(err) > 0.9 ? 0 : VMAX * c * c * c * c * clamp(remaining / (sc ? this.mpp * 2 : 90), 0.3, 1);
    return [v, w];
  };

  Field.prototype.restartScene = function () {
    this.heat.fill(0);
    this.visited.fill(0);
    this.seen.fill(0);
    this.resetRobot();
  };

  /* ------------------------------------------------------------- drawing */
  Field.prototype.buildAmbient = function () {
    var cv = this.amb || (this.amb = document.createElement('canvas'));
    cv.width = this.canvas.width; cv.height = this.canvas.height;
    var g = cv.getContext('2d'), c = this.cell, rand = makeRandom(this.opt.seed + 99);
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.fillStyle = 'rgb(' + INK.join(',') + ')';
    g.fillRect(0, 0, this.W, this.H);
    var dot = c >= 10 ? 1.5 : 1.25;
    for (var y = 0; y < this.rows; y++) for (var x = 0; x < this.cols; x++) {
      var a = 0.07 + rand() * 0.07;
      g.fillStyle = 'rgba(237,239,241,' + a.toFixed(3) + ')';
      g.fillRect((x + 0.5) * c - dot / 2, (y + 0.5) * c - dot / 2, dot, dot);
    }
    if (this.opt.scenario) {
      g.fillStyle = 'rgba(237,239,241,0.5)';
      for (var i = 0; i < this.sceneRects.length; i++) {
        var r = this.sceneRects[i];
        g.fillRect(r.x, r.y, r.w, r.h);
      }
      g.strokeStyle = 'rgba(237,239,241,0.28)';
      g.lineWidth = 1;
      g.strokeRect(0.5, 0.5, this.W - 1, this.H - 1);
    }
    // palette for the warm cells
    this.fills = [];
    this.sizes = [];
    for (var l = 0; l < LEVELS; l++) {
      var f = l / (LEVELS - 1), tone = Math.pow(f, 0.85);
      var rr = Math.round(INK[0] + (PAPER[0] - INK[0]) * (0.18 + 0.82 * tone));
      var gg = Math.round(INK[1] + (PAPER[1] - INK[1]) * (0.18 + 0.82 * tone));
      var bb = Math.round(INK[2] + (PAPER[2] - INK[2]) * (0.18 + 0.82 * tone));
      this.fills.push('rgb(' + rr + ',' + gg + ',' + bb + ')');
      this.sizes.push(Math.round(c * (0.2 + 0.68 * Math.pow(f, 0.7)) * 2) / 2);
    }
  };

  Field.prototype.draw = function () {
    var ctx = this.ctx, c = this.cell, cols = this.cols, rows = this.rows, heat = this.heat, base = this.base, lv = this.level;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.amb, 0, 0);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    var counts = this.counts || (this.counts = new Int32Array(LEVELS)), n = cols * rows;
    counts.fill(0);
    for (var i = 0; i < n; i++) {
      var h = heat[i] + (base ? base[i] : 0);
      if (h < 0.035) { lv[i] = 0; continue; }
      var v = 1 - Math.exp(-1.9 * h);
      var l = Math.min(LEVELS - 1, (v * LEVELS) | 0);
      lv[i] = l; counts[l]++;
    }
    for (var L = 1; L < LEVELS; L++) {
      if (!counts[L]) continue;
      var s = this.sizes[L], off = (c - s) / 2;
      ctx.fillStyle = this.fills[L];
      ctx.beginPath();
      for (var j = 0; j < n; j++) {
        if (lv[j] !== L) continue;
        var x = (j % cols) * c, y = ((j / cols) | 0) * c;
        ctx.rect(x + off, y + off, s, s);
      }
      ctx.fill();
    }
    if (this.robot) this.drawRobot(ctx);
  };

  Field.prototype.drawRobot = function (ctx) {
    var r = this.robot, s = this.scale, t = this.t, FOV = this.fov;

    // planned path, as a line of small squares
    if (r.path && r.path.length > 1) {
      ctx.fillStyle = 'rgba(' + CYAN_RGB + ',0.75)';
      var gap = 9, carry = 0;
      for (var i = 1; i < r.path.length; i++) {
        var a = i === 1 ? [r.x, r.y] : r.path[i - 1], b = r.path[i];
        var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
        for (var d = gap - carry; d < len; d += gap) {
          if (i === 1 && d < 22 * s) continue;
          ctx.fillRect(a[0] + dx * d / len - 1, a[1] + dy * d / len - 1, 2, 2);
        }
        carry = (carry + len) % gap;
      }
    }

    // what it is tracking
    if (r.est && (r.state === 'NAVIGATING' || r.state === 'REACHED')) {
      var ex = r.est.x, ey = r.est.y, k = 15 + Math.sin(t * 5) * 1.5, arm = 6;
      ctx.strokeStyle = CYAN; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ex - k, ey - k + arm); ctx.lineTo(ex - k, ey - k); ctx.lineTo(ex - k + arm, ey - k);
      ctx.moveTo(ex + k - arm, ey - k); ctx.lineTo(ex + k, ey - k); ctx.lineTo(ex + k, ey - k + arm);
      ctx.moveTo(ex + k, ey + k - arm); ctx.lineTo(ex + k, ey + k); ctx.lineTo(ex + k - arm, ey + k);
      ctx.moveTo(ex - k + arm, ey + k); ctx.lineTo(ex - k, ey + k); ctx.lineTo(ex - k, ey + k - arm);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.th);

    // field of view
    var reach = (this.opt.scenario ? this.mpp * 3.2 : 170) * s;
    var grad = ctx.createRadialGradient(0, 0, 6, 0, 0, reach);
    grad.addColorStop(0, 'rgba(' + CYAN_RGB + ',0.13)');
    grad.addColorStop(1, 'rgba(' + CYAN_RGB + ',0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, reach, -FOV / 2, FOV / 2);
    ctx.closePath();
    ctx.fill();

    ctx.scale(s, s);
    // wheels
    ctx.fillStyle = '#0e0d0c';
    ctx.strokeStyle = 'rgba(237,239,241,0.55)';
    ctx.lineWidth = 1;
    var wheels = [[-11, -12.5], [3, -12.5], [-11, 8.5], [3, 8.5]];
    for (var w = 0; w < 4; w++) {
      ctx.beginPath(); ctx.rect(wheels[w][0], wheels[w][1], 9, 4); ctx.fill(); ctx.stroke();
    }
    // body
    ctx.fillStyle = 'rgb(' + INK.join(',') + ')';
    ctx.strokeStyle = 'rgb(' + PAPER.join(',') + ')';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-14, -9, 27, 18, 4); else ctx.rect(-14, -9, 27, 18);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(237,239,241,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-6, -9); ctx.lineTo(-6, 9); ctx.stroke();
    // the thermal camera
    var on = r.blink > 0 ? (Math.sin(r.blink * 60) > 0) : true;
    ctx.fillStyle = 'rgba(' + CYAN_RGB + ',0.28)';
    ctx.beginPath(); ctx.arc(8, 0, 6, 0, Math.PI * 2); ctx.fill();
    if (on) {
      ctx.fillStyle = CYAN;
      ctx.beginPath(); ctx.arc(8, 0, 2.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  Field.prototype.updateHud = function () {
    var h = this.hudEls, r = this.robot;
    if (!r) return;
    if (h.state && h.state.textContent !== r.state) {
      h.state.textContent = r.state;
      this.hudScope.setAttribute('data-state', r.state.toLowerCase());
    }
    if (h.pose) {
      var deg = ((r.th * 180 / Math.PI) + 360) % 360;
      h.pose.textContent = 'x ' + pad(r.x, 4) + '  y ' + pad(r.y, 4) + '  θ ' + pad(deg, 3);
    }
    if (h.heat) {
      var v = r.est && r.state !== 'SEARCHING' ? 1 - Math.exp(-1.9 * r.heatSeen) : 0;
      h.heat.textContent = (this.opt.scenario ? 't ' + this.t.toFixed(1) + ' s' : 'heat ' + v.toFixed(2));
    }
  };

  /* ---------------------------------------------------------------- loop */
  Field.prototype.frame = function (now) {
    if (!this.running) return;
    var self = this;
    this.raf = requestAnimationFrame(function (ts) { self.frame(ts); });
    if (!this.last) this.last = now;
    var dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.acc += dt * (this.opt.scenario ? 2 : 1);
    var steps = 0;
    while (this.acc >= STEP && steps < 6) { this.step(STEP); this.acc -= STEP; steps++; }
    if (steps === 6) this.acc = 0;
    if (!this.robot && !this.walker && !this.drops.length && !(this.pointer.inside && this.t - this.pointer.moved < 6)) {
      if (this.idleFrames++ > 600) return;
    } else this.idleFrames = 0;
    this.draw();
    if ((this.hudT = (this.hudT || 0) - dt) <= 0) { this.hudT = 0.12; this.updateHud(); }
  };

  Field.prototype.start = function () {
    if (this.running || this.reduce || this.paused || this.covered || !this.visible) return;
    this.running = true;
    this.last = 0;
    var self = this;
    this.raf = requestAnimationFrame(function (ts) { self.frame(ts); });
  };

  Field.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  };

  // run the world forward without drawing, so the first frame already has history
  Field.prototype.warm = function (seconds, settle) {
    var n = Math.round(seconds / STEP), arrived = 0;
    for (var i = 0; i < n; i++) {
      this.step(STEP);
      if (settle && this.robot && this.robot.state === 'REACHED' && ++arrived > 40) break;
    }
    this.draw();
    this.updateHud();
  };

  Field.prototype.label = function (key, fallback) {
    return fallback;
  };

  Field.prototype.syncToggle = function () {
    if (!this.toggle) return;
    var on = !this.paused && !this.reduce;
    this.toggle.textContent = on ? this.label('ui.pause', 'Pause') : this.label('ui.play', 'Play');
    this.toggle.setAttribute('aria-pressed', String(!on));
  };

  Field.prototype.bind = function () {
    var self = this, host = this.host;
    this.toggle = this.hudScope.querySelector('[data-field-toggle]');
    if (this.toggle) {
      this.toggle.hidden = false;
      this.toggle.addEventListener('click', function () {
        if (self.reduce) { self.reduce = false; self.paused = false; }
        else self.paused = !self.paused;
        if (self.paused) self.stop(); else self.start();
        self.syncToggle();
      });
      this.syncToggle();
    }
    function local(e) {
      var r = host.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }
    if (this.opt.pointer) {
      host.addEventListener('pointermove', function (e) {
        var p = local(e);
        self.pointer.x = p[0]; self.pointer.y = p[1];
        self.pointer.inside = true; self.pointer.moved = self.t;
      }, { passive: true });
      host.addEventListener('pointerleave', function () { self.pointer.inside = false; }, { passive: true });
      host.addEventListener('pointerdown', function (e) {
        if (e.target.closest('a, button, input, label, summary')) return;
        var p = local(e);
        self.drops.push({ x: p[0], y: p[1], life: 7 });
        self.deposit(p[0], p[1], 0.9, 1.9);
        if (self.reduce) self.draw();
      }, { passive: true });
    }

    // a sticky header keeps intersecting while the page covers it, so watch what comes next
    var pinned = host.closest('.hero, .band');
    if (pinned && window.getComputedStyle(pinned).position === 'sticky' && pinned.nextElementSibling) {
      var below = pinned.nextElementSibling;
      this.covered = false;
      var onScroll = function () {
        var c = below.getBoundingClientRect().top < -4;
        if (c === self.covered) return;
        self.covered = c;
        if (c) self.stop(); else self.start();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
        if (self.visible) self.start(); else self.stop();
      }, { rootMargin: '80px' }).observe(host);
    }

    var lastW = this.W, lastH = this.H, timer = 0;
    function relayout(force) {
      var r = host.getBoundingClientRect();
      var w = Math.round(r.width), h = Math.round(r.height);
      if (!force && w === lastW && Math.abs(h - lastH) < 2) { self.collectObstacles(); return; }
      lastW = w; lastH = h;
      self.layout(true);
      if (self.reduce) self.warm(0.2); else self.draw();
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { clearTimeout(timer); timer = setTimeout(function () { relayout(false); }, 120); }).observe(host);
    } else {
      window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(function () { relayout(false); }, 120); });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { self.collectObstacles(); });
  };

  /* ---------------------------------------------------------------- boot */
  function mount(canvas) {
    var name = canvas.getAttribute('data-field') || 'home';
    var f = new Field(canvas, name);
    f.warm(f.reduce ? 14 : (f.opt.scenario ? 0.4 : 1.8), f.reduce);
    f.start();
    canvas.classList.add('is-on');
    return f;
  }

  function boot() {
    var list = document.querySelectorAll('canvas[data-field]');
    window.AH_FIELDS = [];
    for (var i = 0; i < list.length; i++) {
      try { window.AH_FIELDS.push(mount(list[i])); } catch (e) { if (window.console) console.error(e); }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
