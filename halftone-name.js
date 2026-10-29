/* Halftone name — the hero name printed as a field of halftone dots.
 * Based on the 21st.dev "halftone-wordmark-footer" (kedhareswer), reduced to type-size:
 * the dots follow the h1's own font, size and line breaks, so it sits exactly where the text was.
 *
 * Each dot is sized by how much of the letter covers its cell. The pointer parts the dots on
 * springs and warms them toward coral (also lights up the ones near it, like the old spotlight);
 * a click sends a shock ring through the word. The real <h1> stays in the page, visually hidden,
 * so screen readers, SEO and the EN/TR switch keep working. Reduced motion draws it static.
 *
 * Markup: <div class="glow-name-wrap" id="glowNameWrap"><h1 class="glow-name">…</h1></div>
 */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INK = [255, 255, 255];
  var WARM = [255, 122, 92];

  /** Dot radius for a cell coverage in [0, 1]: area-true, so tone stays even. */
  function radiusFor(coverage, gap) {
    var c = coverage < 0 ? 0 : coverage > 1 ? 1 : coverage;
    return Math.sqrt(c) * gap * 0.56;
  }

  /** One spring step back to home plus the push from a pointer at (px, py) within radius r. */
  function step(x, y, vx, vy, hx, hy, px, py, r) {
    var dx = x - px;
    var dy = y - py;
    var d2 = dx * dx + dy * dy;
    if (r > 0 && d2 < r * r) {
      var d = Math.sqrt(d2) + 0.001;
      var f = (1 - d / r) * 2.2;
      vx += (dx / d) * f;
      vy += (dy / d) * f;
    }
    vx = (vx + (hx - x) * 0.06) * 0.82;
    vy = (vy + (hy - y) * 0.06) * 0.82;
    return [x + vx, y + vy, vx, vy];
  }

  function wrapLines(ctx, text, maxW) {
    var words = String(text).trim().split(/\s+/);
    var lines = [];
    var line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = t;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function init(wrap) {
    var h1 = wrap.querySelector('h1');
    if (!h1) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'ht-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    wrap.appendChild(canvas);
    wrap.classList.add('ht-on');
    var ctx = canvas.getContext('2d');
    if (!ctx) {
      wrap.classList.remove('ht-on');
      return;
    }

    var w = 0;
    var h = 0;
    var dpr = 1;
    var px = -1e5;
    var py = -1e5;
    var raf = 0;
    var visible = true;
    var awake = true;
    var radius = 70;
    var ring = { x: 0, y: 0, t: -1 };
    var dots = new Float32Array(0); // x, y, vx, vy, hx, hy, r per dot
    var count = 0;

    function layout() {
      var cs = getComputedStyle(h1);
      var fs = parseFloat(cs.fontSize) || 72;
      var lh = parseFloat(cs.lineHeight);
      if (!lh || isNaN(lh)) lh = fs * 1.0;
      var font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
      var text = h1.textContent;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var width = Math.max(1, Math.round(wrap.clientWidth));
      var meas = document.createElement('canvas').getContext('2d');
      meas.font = font;
      var lines = wrapLines(meas, text, width);
      var fm = meas.measureText('Hg');
      var asc = fm.fontBoundingBoxAscent || fs * 0.9;
      var desc = fm.fontBoundingBoxDescent || fs * 0.25;
      var base = (lh - (asc + desc)) / 2 + asc; // baseline inside one line box, same as CSS
      var boxH = Math.round(lines.length * lh);
      var extra = Math.round(fs * 0.32); // room for descenders below the last line

      w = width;
      h = boxH + extra;
      wrap.style.height = boxH + 'px';
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      var mask = document.createElement('canvas');
      mask.width = w;
      mask.height = h;
      var m = mask.getContext('2d', { willReadFrequently: true });
      m.font = font;
      m.fillStyle = '#000';
      m.textBaseline = 'alphabetic';
      lines.forEach(function (ln, i) {
        m.fillText(ln, 0, base + i * lh);
      });
      var img = m.getImageData(0, 0, w, h).data;

      var gap = Math.max(1.7, fs / 30);
      var cols = Math.ceil(w / gap);
      var rows = Math.ceil(h / gap);
      var tmp = [];
      for (var gy = 0; gy < rows; gy++) {
        for (var gx = 0; gx < cols; gx++) {
          var sum = 0;
          for (var sy = 0; sy < 3; sy++) {
            for (var sx = 0; sx < 3; sx++) {
              var x = Math.min(w - 1, Math.floor(gx * gap + ((sx + 0.5) * gap) / 3));
              var y = Math.min(h - 1, Math.floor(gy * gap + ((sy + 0.5) * gap) / 3));
              sum += img[(y * w + x) * 4 + 3];
            }
          }
          var cov = sum / (9 * 255);
          if (cov < 0.08) continue;
          var hx = gx * gap + gap / 2;
          var hy = gy * gap + gap / 2;
          tmp.push(hx, hy, 0, 0, hx, hy, radiusFor(cov, gap));
        }
      }
      dots = new Float32Array(tmp);
      count = tmp.length / 7;
      radius = Math.max(48, fs * 0.9);
      awake = true;
    }

    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var r = reduced ? 0 : radius;
      var glowR = radius * 1.7;
      var ringAge = ring.t < 0 ? 1e9 : now - ring.t;
      var ringR = ringAge * 0.7;
      var moving = false;
      for (var i = 0; i < count; i++) {
        var j = i * 7;
        var x = dots[j];
        var y = dots[j + 1];
        var vx = dots[j + 2];
        var vy = dots[j + 3];
        var hx = dots[j + 4];
        var hy = dots[j + 5];
        var k = 0;
        if (!reduced) {
          if (ringAge < 800) {
            var rx = hx - ring.x;
            var ry = hy - ring.y;
            var rd = Math.sqrt(rx * rx + ry * ry) + 0.001;
            var band = 1 - Math.min(1, Math.abs(rd - ringR) / 20);
            if (band > 0) {
              var f = band * 2.6 * (1 - ringAge / 800);
              vx += (rx / rd) * f;
              vy += (ry / rd) * f;
            }
          }
          var s = step(x, y, vx, vy, hx, hy, px, py, r);
          x = s[0];
          y = s[1];
          vx = s[2];
          vy = s[3];
          if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.05) moving = true;
          else {
            x = hx;
            y = hy;
            vx = 0;
            vy = 0;
          }
          dots[j] = x;
          dots[j + 1] = y;
          dots[j + 2] = vx;
          dots[j + 3] = vy;
          // warms with displacement and with closeness to the pointer (the old spotlight)
          var disp = Math.min(1, Math.hypot(x - hx, y - hy) / 18);
          var near = px > -1e4 ? Math.max(0, 1 - Math.hypot(hx - px, hy - py) / glowR) : 0;
          k = Math.min(1, Math.max(disp, near * near * 1.1));
        }
        ctx.fillStyle = k > 0.02
          ? 'rgb(' + Math.round(INK[0] + (WARM[0] - INK[0]) * k) + ',' + Math.round(INK[1] + (WARM[1] - INK[1]) * k) + ',' + Math.round(INK[2] + (WARM[2] - INK[2]) * k) + ')'
          : '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, dots[j + 6], 0, 6.2832);
        ctx.fill();
      }
      awake = moving || ringAge < 800 || px > -1e4;
    }

    function loop(now) {
      raf = 0;
      if (!visible) return;
      draw(now);
      if (awake) raf = requestAnimationFrame(loop);
    }
    function wake() {
      awake = true;
      if (!raf && visible) raf = requestAnimationFrame(loop);
    }

    var inside = false;
    function onMove(e) {
      var b = canvas.getBoundingClientRect();
      var lx = e.clientX - b.left;
      var ly = e.clientY - b.top;
      var near = lx > -radius * 2 && lx < b.width + radius * 2 && ly > -radius * 2 && ly < b.height + radius * 2;
      if (near) {
        px = lx;
        py = ly;
        inside = true;
        wake();
      } else if (inside) {
        px = -1e5;
        py = -1e5;
        inside = false;
        wake();
      }
    }
    function onDown(e) {
      if (reduced) return;
      var b = canvas.getBoundingClientRect();
      var lx = e.clientX - b.left;
      var ly = e.clientY - b.top;
      if (lx < 0 || lx > b.width || ly < 0 || ly > b.height) return;
      if (e.target.closest && e.target.closest('a,button')) return;
      ring = { x: lx, y: ly, t: performance.now() };
      wake();
    }
    function onLeaveWindow(e) {
      if (e.relatedTarget) return;
      px = -1e5;
      py = -1e5;
      inside = false;
      wake();
    }

    function start() {
      layout();
      draw(performance.now());
      wake();
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerout', onLeaveWindow, { passive: true });
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        layout();
        wake();
      }).observe(wrap);
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        visible = entries[0] ? entries[0].isIntersecting : true;
        if (visible) wake();
      }).observe(wrap);
    }
    // EN/TR switch rewrites the h1 text: redraw the dots for the new name
    if (window.MutationObserver) {
      new MutationObserver(function () {
        layout();
        wake();
      }).observe(h1, { childList: true, characterData: true, subtree: true });
    }

    var cs0 = getComputedStyle(h1);
    var loadFace = document.fonts && document.fonts.load
      ? document.fonts.load(cs0.fontWeight + ' ' + cs0.fontSize + ' ' + cs0.fontFamily, h1.textContent)
      : Promise.resolve();
    Promise.resolve(loadFace).then(function () { return document.fonts && document.fonts.ready; }).then(start, start);
  }

  function boot() {
    var wrap = document.getElementById('glowNameWrap');
    if (wrap) init(wrap);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
