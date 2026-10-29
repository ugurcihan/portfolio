/* Web Shot Button — vanilla port of the 21st.dev "web-shot-button" (uvain).
 *
 * A glass pill that shoots silk at the pointer: bring the cursor near and thin
 * threads leave the edge facing it, meet at the pointer and hang there with a
 * little slack; move away and they let go and spring back.
 *
 * Usage: add `data-webshot` to any <a> or <button>. Optional attributes:
 *   data-webshot-color="#ff7a5c"   tint the glass (default: clear glass)
 *   data-webshot-reach="140"       how far from the pill the pointer is noticed (px)
 *   data-webshot-threads="5"       number of threads
 *
 * The element keeps its own id, href and click handlers (it is only wrapped).
 * The threads are decoration: only the pill takes clicks. Reduced motion keeps
 * the glass and drops the threads. Nothing is drawn while the pointer is away.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SEGS = 16;
  var SPREAD = 17;
  var DAMP = 0.9;
  var GRAVITY = 0.05;

  /* Rough lightness 0..1 of a hex or rgb() colour, so the label stays readable on any tint. */
  function lightness(c) {
    var v;
    if (c.charAt(0) === '#') {
      var hex = c.length === 4 ? c.slice(1).split('').map(function (x) { return x + x; }).join('') : c.slice(1, 7);
      v = [0, 2, 4].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); });
    } else {
      v = (c.match(/[\d.]+/g) || []).map(Number);
      if (v.length < 3) return 0;
    }
    return (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255;
  }

  function enhance(btn) {
    var tone = btn.getAttribute('data-webshot-color');
    if (tone === 'clear') tone = null;
    var reach = Number(btn.getAttribute('data-webshot-reach')) || 140;
    var n = Math.max(1, Math.round(Number(btn.getAttribute('data-webshot-threads')) || 5));

    // wrap the element; its children move into a label span so ids and i18n keep working
    var wrap = document.createElement('span');
    wrap.className = 'ws-wrap';
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);
    btn.classList.add('ws-btn');

    var label = document.createElement('span');
    label.className = 'ws-label';
    while (btn.firstChild) label.appendChild(btn.firstChild);
    var hl1 = document.createElement('span');
    hl1.className = 'ws-hl ws-hl-top';
    hl1.setAttribute('aria-hidden', 'true');
    var hl2 = document.createElement('span');
    hl2.className = 'ws-hl ws-hl-bottom';
    hl2.setAttribute('aria-hidden', 'true');
    btn.appendChild(hl1);
    btn.appendChild(hl2);
    btn.appendChild(label);

    if (tone) {
      var light = lightness(tone) > 0.62;
      btn.style.backgroundColor = 'color-mix(in oklab, ' + tone + ' 92%, transparent)';
      btn.style.color = light ? '#111111' : '#ffffff';
      btn.classList.add(light ? 'ws-tone-light' : 'ws-tone-dark');
    }

    if (reduced) return;

    var cv = document.createElement('canvas');
    cv.className = 'ws-canvas';
    cv.setAttribute('aria-hidden', 'true');
    wrap.insertBefore(cv, btn);
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var pad = reach + 24;
    var w = 0;
    var h = 0;
    var dpr = 1;
    var ink = '#000';
    var active = false;
    var ext = 0;
    var raf = 0;
    var pointer = { x: 0, y: 0, known: false };
    var hold = { x: 0, y: 0 };
    var list = [];
    for (var i = 0; i < n; i++) {
      var pts = [];
      for (var k = 0; k < SEGS; k++) pts.push({ x: 0, y: 0, px: 0, py: 0 });
      list.push({ pts: pts, lag: 0.14 + (((i * 37) % 10) / 10) * 0.22, ax: 0, ay: 0, seeded: false });
    }

    function measure() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = btn.offsetWidth;
      h = btn.offsetHeight;
      var cw = w + pad * 2;
      var ch = h + pad * 2;
      cv.style.width = cw + 'px';
      cv.style.height = ch + 'px';
      cv.style.left = -pad + 'px';
      cv.style.top = -pad + 'px';
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
    }

    /* The pointer in canvas space, read from the centre so a press does not shift it. */
    function local() {
      var r = btn.getBoundingClientRect();
      return { x: pointer.x - (r.left + r.width / 2) + pad + w / 2, y: pointer.y - (r.top + r.height / 2) + pad + h / 2 };
    }

    /* Nearest point of the pill: centre of the end circle, the outward normal, and the distance outside the edge. */
    function cap(x, y) {
      var r = Math.min(w, h) / 2;
      var cy = pad + h / 2;
      var cx = Math.min(Math.max(x, pad + r), pad + w - r);
      var dx = x - cx;
      var dy = y - cy;
      var d = Math.hypot(dx, dy) || 1e-6;
      return { cx: cx, cy: cy, r: r, nx: dx / d, ny: dy / d, dist: d - r };
    }

    function kick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function path(p) {
      ctx.moveTo(p[0].x, p[0].y);
      for (var j = 1; j < p.length - 1; j++) {
        ctx.quadraticCurveTo(p[j].x, p[j].y, (p[j].x + p[j + 1].x) / 2, (p[j].y + p[j + 1].y) / 2);
      }
      ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
    }

    function draw() {
      ctx.save();
      ctx.strokeStyle = ink;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.92;
      ctx.lineWidth = 1.15;
      list.forEach(function (s) {
        ctx.beginPath();
        path(s.pts);
        ctx.stroke();
      });
      if (ext > 0.35) {
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.7 * Math.min(1, (ext - 0.35) * 3);
        [0.55, 0.78].forEach(function (at) {
          var j = Math.round(at * (SEGS - 1));
          for (var q = 0; q < list.length - 1; q++) {
            var a = list[q].pts[j];
            var b = list[q + 1].pts[j];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + 3, b.x, b.y);
            ctx.stroke();
          }
        });
      }
      ctx.restore();
    }

    function tick() {
      raf = 0;
      var p = local();
      var here = cap(p.x, p.y);
      var want = pointer.known && here.dist > 1 && here.dist < reach;
      if (want && !active) ink = getComputedStyle(wrap).color || ink;
      active = want;
      if (active) {
        hold.x = p.x;
        hold.y = p.y;
      }
      ext += ((active ? 1 : 0) - ext) * (active ? 0.1 : 0.2);
      if (!active && ext < 0.003) ext = 0;

      var hc = cap(hold.x, hold.y);
      var perpX = -hc.ny;
      var perpY = hc.nx;
      var inset = Math.min(6, hc.r * 0.5);

      list.forEach(function (s, idx) {
        var o = idx - (n - 1) / 2;
        var b = cap(hc.cx + hc.nx * (hc.r - inset) + perpX * o * SPREAD, hc.cy + hc.ny * (hc.r - inset) + perpY * o * SPREAD);
        var axT = b.cx + b.nx * (b.r - inset);
        var ayT = b.cy + b.ny * (b.r - inset);
        var pts = s.pts;
        var j;
        if (!s.seeded) {
          s.ax = axT;
          s.ay = ayT;
          for (j = 0; j < pts.length; j++) {
            pts[j].x = pts[j].px = axT;
            pts[j].y = pts[j].py = ayT;
          }
          s.seeded = true;
        }
        if (active) {
          s.ax += (axT - s.ax) * 0.3;
          s.ay += (ayT - s.ay) * 0.3;
        }
        var dx = hold.x - s.ax;
        var dy = hold.y - s.ay;
        var d = Math.hypot(dx, dy) || 1e-6;
        var len = ext * Math.min(d, reach + hc.r);
        var seg = len / (SEGS - 1);
        for (j = 1; j < pts.length; j++) {
          var q = pts[j];
          var vx = (q.x - q.px) * DAMP;
          var vy = (q.y - q.py) * DAMP;
          q.px = q.x;
          q.py = q.y;
          q.x += vx;
          q.y += vy + GRAVITY * ext;
        }
        var tip = pts[pts.length - 1];
        tip.x += (s.ax + (dx / d) * len - tip.x) * s.lag;
        tip.y += (s.ay + (dy / d) * len - tip.y) * s.lag;
        pts[0].x = pts[0].px = s.ax;
        pts[0].y = pts[0].py = s.ay;
        for (var it = 0; it < 6; it++) {
          for (j = 1; j < pts.length; j++) {
            var a = pts[j - 1];
            var c = pts[j];
            var ex = c.x - a.x;
            var ey = c.y - a.y;
            var el = Math.hypot(ex, ey) || 1e-6;
            if (el <= seg) continue;
            var diff = (el - seg) / el;
            if (j === 1) {
              c.x -= ex * diff;
              c.y -= ey * diff;
            } else {
              a.x += ex * diff * 0.5;
              a.y += ey * diff * 0.5;
              c.x -= ex * diff * 0.5;
              c.y -= ey * diff * 0.5;
            }
          }
        }
      });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w + pad * 2, h + pad * 2);
      if (ext > 0.01) draw();

      if (active || ext > 0) kick();
      else list.forEach(function (s) { s.seeded = false; });
    }

    function onMove(e) {
      if (e.pointerType === 'touch' && e.buttons === 0) return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.known = true;
      if (raf) return;
      var r = btn.getBoundingClientRect();
      if (e.clientX > r.left - reach && e.clientX < r.right + reach && e.clientY > r.top - reach && e.clientY < r.bottom + reach) kick();
    }
    function onEnd(e) {
      if (e.pointerType !== 'touch') return;
      pointer.known = false;
      kick();
    }
    function onOut(e) {
      if (e.relatedTarget) return;
      pointer.known = false;
      kick();
    }

    measure();
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        measure();
        kick();
      }).observe(btn);
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    window.addEventListener('pointerup', onEnd, { passive: true });
    window.addEventListener('pointercancel', onEnd, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-webshot]'), enhance);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
