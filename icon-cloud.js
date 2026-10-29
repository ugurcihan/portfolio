/* Icon cloud — the technology logos on a slowly turning 3D sphere.
 *
 * Inspired by the 21st.dev "interactive-icon-cloud" (react-icon-cloud), written without React or a
 * canvas library: the logos are plain <img> elements in a <ul>, moved by CSS transforms.
 *
 *   drag            -> spin the sphere (keeps its momentum after you let go)
 *   click a logo    -> that logo swings to the front (500 ms)
 *   hover           -> slows the idle spin; the native tooltip names the logo
 *   idle            -> a slow spin; only runs while the cloud is on screen
 *
 * Without JavaScript (or with reduced motion) the logos stay a plain, readable grid / a still sphere.
 * Vertical swipes still scroll the page on touch screens (touch-action: pan-y).
 */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FOCAL = 2.7;           // perspective: bigger = flatter
  var IDLE = [0.34, 0.1];    // idle spin, rad/s around the Y and X axes
  var FRONT_MS = 500;        // click-to-front duration

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t * t * (3 - 2 * t); }

  /** Rotate every point by `angle` around the unit axis (Rodrigues' formula). */
  function rotateAll(pts, ax, ay, az, angle) {
    if (!angle) return;
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var k = 1 - c;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var x = p[0], y = p[1], z = p[2];
      var dot = ax * x + ay * y + az * z;
      p[0] = x * c + (ay * z - az * y) * s + ax * dot * k;
      p[1] = y * c + (az * x - ax * z) * s + ay * dot * k;
      p[2] = z * c + (ax * y - ay * x) * s + az * dot * k;
    }
  }

  function init(box) {
    var list = box.querySelector('.icon-cloud-list');
    if (!list) return;
    var items = Array.prototype.slice.call(list.children);
    var n = items.length;
    if (n < 3) return;

    // Fibonacci sphere: evenly spread points; z > 0 faces the viewer
    var pts = items.map(function (_, i) {
      var y = 1 - ((i + 0.5) * 2) / n;
      var r = Math.sqrt(1 - y * y);
      var th = i * 2.399963229728653;
      return [Math.cos(th) * r, y, Math.sin(th) * r];
    });
    rotateAll(pts, 1, 0, 0, 0.35); // initial tilt

    box.classList.add('is-live');
    var size = 0;
    var radius = 0;
    var raf = 0;
    var visible = false;
    var last = 0;
    var hover = false;
    var vel = [IDLE[0], IDLE[1]]; // current angular velocity (rad/s): [around Y, around X]
    var drag = { id: -1, x: 0, y: 0, moved: false, target: null, t: 0 };
    var front = null;             // active click-to-front animation

    function measure() {
      size = box.clientWidth;
      radius = size * 0.36;
      box.style.setProperty('--ic', clamp(size * 0.105, 30, 52).toFixed(1) + 'px');
      render();
    }

    function render() {
      for (var i = 0; i < n; i++) {
        var p = pts[i];
        var persp = FOCAL / (FOCAL - p[2]);
        var px = p[0] * radius * persp;
        var py = -p[1] * radius * persp;
        var depth = (p[2] + 1) / 2;
        var el = items[i];
        el.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0) translate(-50%,-50%) scale(' + (persp * 0.9).toFixed(3) + ')';
        el.style.opacity = (0.28 + 0.72 * depth).toFixed(3);
        el.style.zIndex = String(Math.round(depth * 100));
      }
    }

    function tick(now) {
      raf = 0;
      if (!visible) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;

      if (front) {
        var t = clamp((now - front.t0) / FRONT_MS, 0, 1);
        var e = ease(t);
        rotateAll(pts, front.ax, front.ay, front.az, front.angle * (e - front.done));
        front.done = e;
        if (t >= 1) { front = null; vel = [0, 0]; }
      } else if (drag.id < 0 || !drag.moved) {
        // glide back to the idle spin; hovering slows it
        var goal = hover ? 0.3 : 1;
        vel[0] += (IDLE[0] * goal - vel[0]) * Math.min(1, dt * 1.6);
        vel[1] += (IDLE[1] * goal - vel[1]) * Math.min(1, dt * 1.6);
        rotateAll(pts, 0, 1, 0, vel[0] * dt);
        rotateAll(pts, 1, 0, 0, vel[1] * dt);
      }
      render();
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (!raf && visible && !reduced) { last = 0; raf = requestAnimationFrame(tick); }
    }

    function toFront(i) {
      var p = pts[i];
      // axis = p x (0,0,1); angle = angle between p and the front direction
      var ax = p[1];
      var ay = -p[0];
      var az = 0;
      var len = Math.sqrt(ax * ax + ay * ay);
      var angle = Math.acos(clamp(p[2], -1, 1));
      if (len < 1e-4 || angle < 0.02) return;
      front = { ax: ax / len, ay: ay / len, az: az, angle: angle, done: 0, t0: performance.now() };
      start();
    }

    // ---- input
    box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    box.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hover = false; });
    box.addEventListener('pointerdown', function (e) {
      if (reduced) return;
      drag.id = e.pointerId;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved = false;
      drag.target = e.target.closest ? e.target.closest('li') : null;
      drag.t = performance.now();
      front = null;
    });
    box.addEventListener('pointermove', function (e) {
      if (e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      var dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 6) {
        drag.moved = true;
        try { box.setPointerCapture(e.pointerId); } catch (err) { /* capture is only a nicety */ }
      }
      if (!drag.moved) return;
      var now = performance.now();
      var dts = Math.max(0.001, (now - drag.t) / 1000);
      var ry = dx * 0.0065; // drag right -> front surface moves right
      var rx = dy * 0.0065; // drag down  -> front surface moves down
      rotateAll(pts, 0, 1, 0, ry);
      rotateAll(pts, 1, 0, 0, rx);
      vel = [clamp(ry / dts, -4, 4), clamp(rx / dts, -4, 4)];
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.t = now;
      render();
    });
    function end(e) {
      if (e.pointerId !== drag.id) return;
      var wasClick = !drag.moved && drag.target;
      var target = drag.target;
      drag.id = -1;
      drag.moved = false;
      if (wasClick && e.type === 'pointerup') {
        var idx = items.indexOf(target);
        if (idx >= 0) toFront(idx);
      }
    }
    box.addEventListener('pointerup', end);
    box.addEventListener('pointercancel', end);

    // ---- lifecycle
    if (window.ResizeObserver) new ResizeObserver(measure).observe(box);
    measure();
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        visible = entries[0] ? entries[0].isIntersecting : true;
        if (visible) start();
      }, { threshold: 0.1 }).observe(box);
    } else {
      visible = true;
      start();
    }
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('.icon-cloud'), init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
