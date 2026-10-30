/* About section — a Matrix-style chat screen and a bank of lockers.
 *
 * The screen: someone asks "who are you?", then the answer types itself out over a faint glyph rain.
 * The lockers (inspired by the 21st.dev / hairline "Lockers"): one door is always ajar; the locker
 * under the pointer opens and the one open before it swings shut. What sits inside pops out of the
 * open locker and is also written on the screen's last line. Until the visitor touches a locker the
 * doors open one after another.
 *
 * The real text stays in the page (transparent, in flow) so layout never jumps and screen readers,
 * SEO and the EN/TR switch keep working; the typed text is an aria-hidden overlay on top of it.
 * Without JS, or with reduced motion, the answer is plain text and nothing types or autoplays.
 * Click the screen to skip the typing.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function whenVisible(el, threshold, fn) {
    if (!window.IntersectionObserver) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0] && entries[0].isIntersecting) { io.disconnect(); fn(); }
    }, { threshold: threshold });
    io.observe(el);
  }

  /* ---------- glyph rain behind the text ---------- */
  function rain(canvas, host) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
    var SIZE = 14;
    var w = 0;
    var h = 0;
    var drops = [];
    var visible = false;
    var raf = 0;
    var last = 0;

    function fit() {
      w = canvas.width = host.clientWidth;
      h = canvas.height = host.clientHeight;
      var cols = Math.ceil(w / SIZE);
      while (drops.length < cols) drops.push(Math.random() * -40);
      drops.length = cols;
      ctx.font = SIZE + 'px monospace';
    }

    function frame(now) {
      raf = 0;
      if (!visible) return;
      if (now - last > 70) {
        last = now;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.16)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
        for (var i = 0; i < drops.length; i++) {
          var y = drops[i] * SIZE;
          var g = GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
          ctx.fillStyle = '#d8fff0';
          ctx.fillText(g, i * SIZE, y);
          if (y > h && Math.random() > 0.97) drops[i] = 0;
          else drops[i] += 1;
        }
      }
      raf = requestAnimationFrame(frame);
    }

    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(host);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        visible = entries[0] ? entries[0].isIntersecting : true;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      }).observe(host);
    }
  }

  /* ---------- the chat screen ---------- */
  function bootTerm(term) {
    var qReal = $('.term-q .term-real', term);
    var qLive = $('.term-q .term-live', term);
    var aReal = $('.term-a .term-real', term);
    var aLive = $('.term-a .term-live', term);
    var think = $('.term-think', term);
    var token = 0;
    var finished = false;

    /* Types `text` in about `total` ms: a few characters per frame, so long text is still quick. */
    function typeText(el, text, total, my) {
      return new Promise(function (resolve) {
        var t0 = performance.now();
        el.classList.add('caret');
        (function frame(now) {
          if (my !== token) { el.classList.remove('caret'); resolve(); return; }
          var k = Math.min(text.length, Math.ceil(text.length * ((now - t0) / total)));
          el.textContent = text.slice(0, k);
          if (k >= text.length) { resolve(); return; }
          requestAnimationFrame(frame);
        })(t0);
      });
    }

    function showAll() {
      token += 1;
      qLive.textContent = qReal.textContent;
      aLive.textContent = aReal.textContent;
      qLive.classList.remove('caret');
      aLive.classList.add('caret');
      think.hidden = true;
      done();
    }

    function done() {
      if (finished) return;
      finished = true;
      document.dispatchEvent(new CustomEvent('about:typed'));
    }

    async function play() {
      var my = ++token;
      qLive.textContent = '';
      aLive.textContent = '';
      await wait(150);
      if (my !== token) return;
      await typeText(qLive, qReal.textContent, 420, my);
      if (my !== token) return;
      qLive.classList.remove('caret');
      think.hidden = false;
      await wait(380);
      if (my !== token) return;
      think.hidden = true;
      await typeText(aLive, aReal.textContent, 2300, my);
      if (my !== token) return;
      done();
    }

    term.classList.add('is-armed');
    $('.term-screen', term).addEventListener('click', function () { if (!finished) showAll(); });
    whenVisible(term, 0.4, play);

    // EN/TR switch rewrote the real text: show the new language at once
    return function onLang() { showAll(); };
  }

  /* ---------- the lockers ---------- */
  function bootLockers(bank) {
    var lks = $$('.lk', bank);
    var n = lks.length;
    if (!n) return function () {};
    var logEl = document.getElementById('termLogText');
    var openIdx = -1;
    var ajarIdx = 0;
    var lastLog = -1;
    var user = false;
    var auto = 0;
    var seq = 0;
    var visible = true;
    var logRun = 0;

    function apply() {
      lks.forEach(function (el, i) {
        var o = i === openIdx;
        el.classList.toggle('is-open', o);
        el.classList.toggle('is-ajar', openIdx < 0 && i === ajarIdx);
        el.setAttribute('aria-expanded', o ? 'true' : 'false');
      });
    }

    function logText(i) {
      return $('.lk-t', lks[i]).textContent + ' — ' + $('.lk-d', lks[i]).textContent;
    }

    function writeLog(i, instant) {
      if (!logEl) return;
      logEl.removeAttribute('data-i18n'); // from now on this line is ours, not the translation table's
      lastLog = i;
      var text = logText(i);
      var my = ++logRun;
      if (instant || reduced) { logEl.textContent = text; return; }
      var k = 0;
      (function step() {
        if (my !== logRun) return;
        k += 2;
        logEl.textContent = text.slice(0, k);
        if (k < text.length) setTimeout(step, 14);
      })();
    }

    function open(i, fromUser) {
      if (fromUser && !user) { user = true; clearTimeout(auto); }
      if (openIdx === i) return;
      openIdx = i;
      ajarIdx = i;
      apply();
      writeLog(i, false);
    }

    function rest() { openIdx = -1; apply(); }

    lks.forEach(function (el, i) {
      el.addEventListener('pointerenter', function () { open(i, true); });
      el.addEventListener('focus', function () { open(i, true); });
      el.addEventListener('click', function () { open(i, true); });
    });
    bank.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') rest(); });
    bank.addEventListener('focusout', function (e) { if (!bank.contains(e.relatedTarget)) rest(); });

    function tick() {
      if (user) return;
      if (visible) { open(seq % n, false); seq += 1; }
      auto = setTimeout(tick, 2800);
    }

    apply();
    if (!reduced) {
      if (window.IntersectionObserver) {
        new IntersectionObserver(function (entries) {
          visible = entries[0] ? entries[0].isIntersecting : true;
        }).observe(bank);
      }
      // start the show once the answer has been typed
      document.addEventListener('about:typed', function () {
        if (!user && !auto) auto = setTimeout(tick, 500);
      });
    }

    return function onLang() { if (lastLog >= 0) writeLog(lastLog, true); };
  }

  function boot() {
    var term = document.getElementById('aboutTerm');
    var bank = document.getElementById('lockerBank');
    var handlers = [];
    if (bank) handlers.push(bootLockers(bank));
    if (term && !reduced) {
      var canvas = $('.term-rain', term);
      if (canvas) rain(canvas, $('.term-screen', term));
      handlers.push(bootTerm(term));
    }
    if (!handlers.length || !window.MutationObserver) return;

    // the language switch rewrites these nodes (never our own overlays)
    var timer = 0;
    var mo = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () { handlers.forEach(function (h) { h(); }); }, 30);
    });
    $$('.term-real, .lk-t, .lk-d').forEach(function (el) { mo.observe(el, { childList: true, characterData: true, subtree: true }); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
