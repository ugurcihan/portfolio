/* Project Rail — projects hung on a clothes rail.
 *
 * Inspired by the 21st.dev "product-rail-gallery": pieces hang from a rail on hangers, lean away from
 * you at rest, and the one under the pointer swings round to face you while its neighbours slide
 * apart on springs. Here the "garments" are the portfolio's own project cards: the rail is built from
 * the existing `.previewable` cards, and opening one just clicks the original card, so the preview
 * dialog, its links and the EN/TR text all keep working. Nothing is rebuilt per frame while idle.
 *
 *   hover / arrow keys / swipe  -> turn a card to the front
 *   click / Enter               -> open the preview dialog
 *   no interaction              -> cards turn to the front one by one (autoplay), then stop for good
 *   narrow screens              -> carousel: one card centred, neighbours leaning away
 * Reduced motion: no physics, no autoplay; cards snap to their places.
 */
(function () {
  'use strict';

  var VB_W = 200;
  var VB_H = 310;
  var ASPECT = VB_W / VB_H;
  var REST = -70;           // resting angle (deg): turned away from the viewer
  var PERSPECTIVE = 1100;
  var GAP = 0.035;
  var SIDE_W = 0.34;        // width of a resting card, as a share of its front width
  var MAX_H = 360;
  var MIN_WIDE_H = 215;
  var CAROUSEL_H = 330;
  var RAIL_Y = 16;          // px from the top of the stage to the top of every hanger

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lambert(angle) {
    var r = (angle * Math.PI) / 180;
    return 0.66 + 0.34 * Math.max(0, Math.sin(r) * 0.42 + Math.cos(r) * 0.91);
  }
  function footprint(h, angle) {
    var e = clamp(1 - angle / REST, 0, 1);
    var ease = e * e * (3 - 2 * e);
    return h * ASPECT * (SIDE_W + (0.94 - SIDE_W) * ease);
  }

  var HOOK = 'M100,36 L100,-0.4 C100,-3.4 102.2,-4.2 103.9,-2.8 C104.9,-2 105.4,-1.2 105.6,-0.2';
  var BAR = 'M38,57 Q70,38 100,36 Q130,38 162,57';
  var DEFS =
    '<svg class="pr-defs" aria-hidden="true" width="0" height="0" focusable="false"><defs>' +
    '<linearGradient id="pr-wood" gradientUnits="userSpaceOnUse" x1="0" y1="36" x2="0" y2="58">' +
    '<stop offset="0" stop-color="#c98a55"/><stop offset="0.5" stop-color="#8e5a33"/><stop offset="1" stop-color="#5e3a20"/></linearGradient>' +
    '<linearGradient id="pr-chrome" gradientUnits="userSpaceOnUse" x1="98.5" y1="0" x2="101.7" y2="0">' +
    '<stop offset="0" stop-color="#b9b9b9"/><stop offset="0.35" stop-color="#ffffff"/><stop offset="0.78" stop-color="#6d6d6d"/><stop offset="1" stop-color="#a5a5a5"/></linearGradient>' +
    '</defs></svg>';
  var HANGER =
    '<svg class="pr-hanger" viewBox="0 0 200 60" aria-hidden="true" focusable="false">' +
    '<path d="' + BAR + '" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="9.5" stroke-linecap="round" transform="translate(.6 1.6)"/>' +
    '<path d="' + BAR + '" fill="none" stroke="url(#pr-wood)" stroke-width="8.5" stroke-linecap="round"/>' +
    '<path d="M40,54.5 Q71,35.5 100,33.5 Q129,35.5 160,54.5" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.1" stroke-linecap="round"/>' +
    '<path d="' + HOOK + '" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="3.4" stroke-linecap="round" transform="translate(.9 1.1)"/>' +
    '<path d="' + HOOK + '" fill="none" stroke="url(#pr-chrome)" stroke-width="2.6" stroke-linecap="round"/>' +
    '<rect x="96" y="27" width="8" height="9" rx="2" fill="url(#pr-chrome)"/>' +
    '<rect x="42" y="53" width="9" height="9" rx="2" fill="url(#pr-chrome)"/><rect x="149" y="53" width="9" height="9" rx="2" fill="url(#pr-chrome)"/>' +
    '</svg>';

  function colorOf(card) {
    if (card.classList.contains('coral')) return 'var(--coral)';
    if (card.classList.contains('teal')) return 'var(--teal)';
    return 'var(--yellow)';
  }

  function build() {
    var grid = document.querySelector('#projects .project-grid');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.previewable'));
    var n = cards.length;
    if (n < 2) return;

    var root = document.createElement('div');
    root.className = 'pr-root';
    root.innerHTML =
      DEFS +
      '<h3 class="grp-label"><span data-i18n="rail_label">Featured work</span></h3>' +
      '<div class="pr-stage" role="group" aria-label="Featured projects"><div class="pr-rail" aria-hidden="true"></div></div>' +
      '<div class="pr-caption" aria-live="polite"><h4 class="pr-cap-title"></h4><p class="pr-cap-tag"></p>' +
      '<button type="button" class="pr-cap-open" data-i18n="rail_open">Open preview ↗</button></div>' +
      '<p class="pr-hint" data-i18n="rail_hint">Hover a card to turn it · click to open</p>';
    grid.parentNode.insertBefore(root, grid);

    // The rail replaces these cards on screen. They stay in the DOM (hidden): the rail reads their text
    // and images, and opening a rail card clicks the original so the preview dialog keeps working.
    cards.forEach(function (card) { card.hidden = true; });
    var labels = Array.prototype.slice.call(grid.querySelectorAll('.grp-label'));
    labels.forEach(function (label) {
      var shown = false;
      for (var el = label.nextElementSibling; el && !el.classList.contains('grp-label'); el = el.nextElementSibling) {
        if (!el.hidden) shown = true;
      }
      label.hidden = !shown; // a group with nothing left in it loses its heading too
    });

    var stage = root.querySelector('.pr-stage');
    var capTitle = root.querySelector('.pr-cap-title');
    var capTag = root.querySelector('.pr-cap-tag');
    var capOpen = root.querySelector('.pr-cap-open');
    var slots = [];
    var swings = [];
    var turns = [];
    var sides = [];

    cards.forEach(function (card, i) {
      var slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'pr-slot';
      slot.style.setProperty('--c', colorOf(card));
      slot.setAttribute('aria-label', card.dataset.previewTitle || 'Project');
      slot.tabIndex = i === 0 ? 0 : -1;
      slot.innerHTML =
        '<span class="pr-swing"><span class="pr-turn">' + HANGER +
        '<span class="pr-card"><img class="pr-shot" alt="" draggable="false" loading="lazy">' +
        '<span class="pr-label"><span class="pr-name"></span></span></span>' +
        '<span class="pr-shade"></span></span></span>';
      slot.querySelector('.pr-shot').src = card.dataset.preview;
      slot.querySelector('.pr-name').textContent = card.dataset.previewTitle || '';
      stage.appendChild(slot);
      slots.push(slot);
      swings.push(slot.querySelector('.pr-swing'));
      turns.push(slot.querySelector('.pr-turn'));
      sides.push(slot.querySelector('.pr-shade'));
    });

    // ---------------------------------------------------------------- state
    var sim = { x: [], vx: [], tx: [], turn: [], vturn: [], tturn: [], swing: [], vswing: [], last: 0, raf: 0, free: 0 };
    var size = { width: 0, h: 280, carousel: false };
    var active = null;
    var carouselIndex = 0;
    var swipe = { id: -1, x: 0, y: 0, moved: false, suppress: false };
    var playing = !reduced;
    var visible = false;
    var brushed = false;
    var timer = 0;

    function targets() {
      var h = size.h;
      var front = size.carousel ? (active === null ? carouselIndex : active) : active;
      var feet = slots.map(function (_, i) { return footprint(h, i === front ? 0 : REST) + h * GAP; });
      var xs = [];
      var i;
      if (size.carousel) {
        var c = front === null ? 0 : front;
        for (i = 0; i < n; i++) xs[i] = 0;
        xs[c] = size.width / 2;
        for (i = c + 1; i < n; i++) xs[i] = xs[i - 1] + (feet[i - 1] + feet[i]) / 2;
        for (i = c - 1; i >= 0; i--) xs[i] = xs[i + 1] - (feet[i + 1] + feet[i]) / 2;
        return xs;
      }
      var total = feet.reduce(function (s, f) { return s + f; }, 0);
      var cursor = (size.width - total) / 2;
      feet.forEach(function (f) { xs.push(cursor + f / 2); cursor += f; });
      return xs;
    }

    function paint(i) {
      var h = size.h;
      var w = h * ASPECT;
      var angle = sim.turn[i];
      slots[i].style.transform = 'translate3d(' + (sim.x[i] - w / 2).toFixed(2) + 'px,0,0)';
      swings[i].style.transform = 'rotate(' + sim.swing[i].toFixed(3) + 'deg)';
      turns[i].style.transform = 'perspective(' + PERSPECTIVE + 'px) rotateY(' + angle.toFixed(2) + 'deg)';
      sides[i].style.opacity = ((1 - lambert(angle)) * 1.1).toFixed(3);
    }

    function step(now) {
      var dt = sim.last ? Math.min(0.034, (now - sim.last) / 1000) : 1 / 60;
      sim.last = now;
      var h = size.h;
      var busy = false;
      var sub = 2;
      var sdt = dt / sub;
      var i, k, pass;
      for (k = 0; k < sub; k++) {
        for (i = 0; i < n; i++) {
          var before = sim.vx[i];
          var restoring = now > sim.free;
          var stiff = restoring ? 130 : 0;
          var damp = restoring ? 2 * Math.sqrt(130) * 0.86 : 3.2;
          sim.vx[i] = before + (-stiff * (sim.x[i] - sim.tx[i]) - damp * before) * sdt;
          sim.x[i] += sim.vx[i] * sdt;
          var accel = (sim.vx[i] - before) / sdt;
          var ta = -150 * (sim.turn[i] - sim.tturn[i]) - 2 * Math.sqrt(150) * 0.78 * sim.vturn[i];
          sim.vturn[i] += ta * sdt;
          sim.turn[i] += sim.vturn[i] * sdt;
          var sa = -24 * sim.swing[i] - 2.1 * sim.vswing[i] - clamp(accel, -6000, 6000) * 0.0045;
          sim.vswing[i] += sa * sdt;
          sim.swing[i] = clamp(sim.swing[i] + sim.vswing[i] * sdt, -12, 12);
        }
        for (pass = 0; pass < 2; pass++) {
          for (i = 0; i < n - 1; i++) {
            var minGap = (footprint(h, sim.turn[i]) + footprint(h, sim.turn[i + 1])) / 2 + h * 0.012;
            var overlap = minGap - (sim.x[i + 1] - sim.x[i]);
            if (overlap <= 0) continue;
            sim.x[i] -= overlap / 2;
            sim.x[i + 1] += overlap / 2;
            var shared = (sim.vx[i] + sim.vx[i + 1]) / 2;
            if (sim.vx[i] > sim.vx[i + 1]) { sim.vx[i] = shared; sim.vx[i + 1] = shared; }
          }
        }
        if (!size.carousel) {
          var edge = h * 0.06;
          var first = edge + footprint(h, sim.turn[0]) / 2;
          var last = size.width - edge - footprint(h, sim.turn[n - 1]) / 2;
          if (sim.x[0] < first) { sim.x[0] = first; sim.vx[0] = Math.abs(sim.vx[0]) * 0.3; }
          if (sim.x[n - 1] > last) { sim.x[n - 1] = last; sim.vx[n - 1] = -Math.abs(sim.vx[n - 1]) * 0.3; }
        }
      }
      for (i = 0; i < n; i++) {
        paint(i);
        if (Math.abs(sim.vx[i]) > 0.4 || Math.abs(sim.x[i] - sim.tx[i]) > 0.25 || Math.abs(sim.turn[i] - sim.tturn[i]) > 0.05 ||
            Math.abs(sim.vturn[i]) > 0.05 || Math.abs(sim.swing[i]) > 0.02 || Math.abs(sim.vswing[i]) > 0.05) busy = true;
      }
      if (busy) sim.raf = requestAnimationFrame(step);
      else {
        sim.raf = 0;
        sim.last = 0;
        for (i = 0; i < n; i++) { sim.x[i] = sim.tx[i]; sim.swing[i] = 0; sim.vswing[i] = 0; paint(i); }
      }
    }

    function kick() {
      if (reduced) {
        for (var i = 0; i < n; i++) {
          sim.x[i] = sim.tx[i]; sim.turn[i] = sim.tturn[i]; sim.vx[i] = 0; sim.vturn[i] = 0; sim.swing[i] = 0; sim.vswing[i] = 0;
          paint(i);
        }
        return;
      }
      if (!sim.raf) { sim.last = 0; sim.raf = requestAnimationFrame(step); }
    }

    function impulse(i, amount) {
      if (reduced || i < 0 || i >= n) return;
      sim.vswing[i] += amount;
      kick();
    }

    function layout() {
      if (!size.width) return;
      var xs = targets();
      var front = size.carousel ? (active === null ? carouselIndex : active) : active;
      var fresh = sim.x.length !== n;
      for (var i = 0; i < n; i++) {
        sim.tx[i] = xs[i] + (size.carousel ? swipe.dx || 0 : 0);
        sim.tturn[i] = i === front ? 0 : REST;
        if (fresh || reduced) {
          sim.x[i] = sim.tx[i]; sim.vx[i] = 0; sim.turn[i] = sim.tturn[i]; sim.vturn[i] = 0; sim.swing[i] = 0; sim.vswing[i] = 0;
        }
      }
      if (fresh) for (var j = 0; j < n; j++) paint(j);
      kick();
    }

    function measure() {
      var width = stage.clientWidth;
      if (!width) return;
      var restK = footprint(1, REST) + GAP;
      var activeK = footprint(1, 0) + GAP;
      var fit = (width - 24) / (n * restK + (activeK - restK));
      var carousel = fit < MIN_WIDE_H;
      var h = carousel ? Math.min(CAROUSEL_H, Math.max(230, width * 0.86)) : Math.min(MAX_H, fit);
      h = Math.round(h);
      if (Math.abs(size.width - width) < 0.5 && size.carousel === carousel && size.h === h) return;
      size = { width: width, h: h, carousel: carousel };
      stage.style.setProperty('--u', (h / VB_H).toFixed(4) + 'px');
      stage.style.height = h + RAIL_Y + 34 + 'px';
      slots.forEach(function (s) { s.style.width = h * ASPECT + 'px'; s.style.height = h + 'px'; });
      stage.classList.toggle('pr-carousel', carousel);
      layout();
    }

    // ---------------------------------------------------------------- selection
    function updateCaption() {
      var card = active === null ? null : cards[active];
      if (!card) {
        capTitle.textContent = '';
        capTag.textContent = '';
        capOpen.hidden = true;
        root.classList.remove('pr-has-active');
        return;
      }
      var tag = card.querySelector('.tagline');
      capTitle.textContent = card.dataset.previewTitle || '';
      capTag.textContent = tag ? tag.textContent : '';
      capOpen.hidden = false;
      root.classList.add('pr-has-active');
    }

    function choose(index) {
      if (index === active) return;
      var old = active;
      if (index !== null) { impulse(index - 1, -30); impulse(index + 1, 30); carouselIndex = index; }
      if (old !== null && old !== index) { impulse(old - 1, 14); impulse(old + 1, -14); }
      active = index;
      slots.forEach(function (s, i) { s.style.zIndex = i === index ? 5 : 1; });
      updateCaption();
      layout();
    }

    function stopAutoplay() {
      playing = false;
      window.clearTimeout(timer);
    }

    function scheduleAutoplay(delay) {
      window.clearTimeout(timer);
      if (!playing || reduced || !visible) return;
      timer = window.setTimeout(function () {
        if (!playing || !visible) return;
        choose(active === null ? 0 : (active + 1) % n);
        scheduleAutoplay(2600);
      }, delay);
    }

    function openCard(i) {
      stopAutoplay();
      cards[i].click(); // the original card opens the preview dialog (links, note, focus handling)
    }

    // ---------------------------------------------------------------- input
    function nearest(clientX, clientY) {
      var box = stage.getBoundingClientRect();
      var x = clientX - box.left;
      var y = clientY - box.top;
      if (y < 0 || y > size.h + RAIL_Y + 30) return null;
      var best = null;
      var dist = Infinity;
      for (var i = 0; i < n; i++) {
        var half = footprint(size.h, sim.turn[i]) / 2 + 4;
        var d = Math.abs(x - sim.x[i]);
        if (d < half && d < dist) { best = i; dist = d; }
      }
      return best;
    }

    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || size.carousel) return;
      stopAutoplay();
      var i = nearest(e.clientX, e.clientY);
      if (i !== null) choose(i);
    });
    stage.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse' && !size.carousel && !stage.contains(document.activeElement)) choose(null);
    });

    // swipe in carousel mode
    stage.addEventListener('pointerdown', function (e) {
      swipe.id = e.pointerId;
      swipe.x = e.clientX;
      swipe.y = e.clientY;
      swipe.moved = false;
      swipe.suppress = false;
      swipe.dx = 0;
    });
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerId !== swipe.id || !size.carousel) return;
      var dx = e.clientX - swipe.x;
      if (!swipe.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - swipe.y)) {
        swipe.moved = true;
        stopAutoplay();
        try { stage.setPointerCapture(e.pointerId); } catch (err) { /* capture is only a nicety */ }
      }
      if (swipe.moved) {
        swipe.dx = clamp(dx, -size.h * 0.6, size.h * 0.6);
        var xs = targets();
        for (var i = 0; i < n; i++) sim.tx[i] = xs[i] + swipe.dx;
        sim.free = 0;
        kick();
      }
    });
    function endSwipe(e) {
      if (e.pointerId !== swipe.id) return;
      swipe.id = -1;
      if (swipe.moved) {
        swipe.suppress = true;
        var current = active === null ? carouselIndex : active;
        if (swipe.dx < -40) choose(Math.min(n - 1, current + 1));
        else if (swipe.dx > 40) choose(Math.max(0, current - 1));
        swipe.dx = 0;
        layout();
      }
    }
    stage.addEventListener('pointerup', endSwipe);
    stage.addEventListener('pointercancel', endSwipe);

    slots.forEach(function (slot, i) {
      slot.addEventListener('click', function () {
        if (swipe.suppress) { swipe.suppress = false; return; }
        if (size.carousel && active !== i) { stopAutoplay(); choose(i); return; }
        openCard(i);
      });
      slot.addEventListener('focus', function () { stopAutoplay(); choose(i); });
      slot.addEventListener('keydown', function (e) {
        var to = null;
        if (e.key === 'ArrowRight') to = Math.min(n - 1, i + 1);
        else if (e.key === 'ArrowLeft') to = Math.max(0, i - 1);
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = n - 1;
        if (to === null) return;
        e.preventDefault();
        slots.forEach(function (s, k) { s.tabIndex = k === to ? 0 : -1; });
        slots[to].focus();
      });
    });
    stage.addEventListener('focusout', function (e) {
      if (!stage.contains(e.relatedTarget)) choose(null);
    });
    capOpen.addEventListener('click', function () { if (active !== null) openCard(active); });

    // the EN/TR switch rewrites the original card text: refresh the caption
    if (window.MutationObserver) {
      new MutationObserver(updateCaption).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }

    // ---------------------------------------------------------------- lifecycle
    if (window.ResizeObserver) new ResizeObserver(measure).observe(stage);
    window.addEventListener('resize', measure);
    measure();

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        visible = entries[0] ? entries[0].isIntersecting : true;
        if (visible && !brushed && !reduced) {
          brushed = true; // a first brush along the rail when it scrolls into view
          for (var i = 0; i < n; i++) (function (k) { window.setTimeout(function () { impulse(k, 40 - k * 2); }, 100 + k * 45); })(i);
        }
        if (visible) scheduleAutoplay(1400);
        else window.clearTimeout(timer);
      }, { threshold: 0.35 }).observe(stage);
    } else {
      visible = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
