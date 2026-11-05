/* /business/ — hizmet vitrini, süreç akışı ve proje önizleme penceresi.
 *
 *  - Hizmet vitrini: bir hizmete dokun/gel, sağda canlı illüstrasyon ve içerik değişir. Kullanıcı karışmazsa
 *    hizmetler sırayla kendiliğinden döner. "Fiyatını hesapla" hesaplayıcıyı o tipe ayarlar ve oraya kaydırır.
 *  - Süreç akışı: görününce çizgi dolar, adımlar sırayla yanar, sonra vurgu adımlar arasında gezer.
 *  - Proje önizleme: askı galerisinden (project-rail.js) bir kart açılınca ekran görüntüsü ve bağlantılar görünür.
 * Hareket azaltma tercihinde otomatik dönme ve animasyonlar kapanır.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------------- hizmet vitrini ---------------- */
  function services() {
    var box = $('#svc');
    if (!box) return;
    var tabs = $$('.svc-tabs button', box);
    var panels = $$('.svc-panel', box);
    var DUR = 5000;
    var cur = 0;
    var timer = 0;
    var auto = !reduced;
    var visible = false;
    box.style.setProperty('--dur', DUR + 'ms');

    function stop() { auto = false; clearTimeout(timer); box.classList.remove('auto'); }
    function schedule() {
      clearTimeout(timer);
      if (!auto) return;
      timer = setTimeout(function () { if (visible) show((cur + 1) % tabs.length, false); else schedule(); }, DUR);
    }
    function show(i, fromUser) {
      if (fromUser) stop();
      if (i === cur && panels[i] && !panels[i].hidden) return;
      cur = i;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      if (auto) { // ilerleme çubuğunu baştan başlat
        box.classList.remove('auto'); void box.offsetWidth; box.classList.add('auto');
        schedule();
      }
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i, true); });
      t.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) show(i, true); });
      t.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k !== 'ArrowDown' && k !== 'ArrowRight' && k !== 'ArrowUp' && k !== 'ArrowLeft') return;
        e.preventDefault();
        var next = (i + (k === 'ArrowDown' || k === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        show(next, true);
        tabs[next].focus();
      });
    });
    $$('.svc-cta', box).forEach(function (b) {
      b.addEventListener('click', function () {
        stop();
        var add = (b.getAttribute('data-add') || '').split(',').filter(Boolean);
        document.dispatchEvent(new CustomEvent('bz:select', { detail: { type: b.getAttribute('data-type'), add: add } }));
      });
    });
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible && auto && !box.classList.contains('auto')) { box.classList.add('auto'); schedule(); }
      }, { threshold: 0.3 }).observe(box);
    } else {
      visible = true;
      if (auto) { box.classList.add('auto'); schedule(); }
    }
  }

  /* ---------------- süreç akışı ---------------- */
  function flow() {
    var f = $('#flow');
    if (!f) return;
    var steps = $$('.flow-step', f);
    if (reduced || !window.IntersectionObserver) {
      f.classList.add('in');
      steps.forEach(function (s) { s.classList.add('on'); });
      return;
    }
    var io = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      f.classList.add('in');
      steps.forEach(function (s, i) { setTimeout(function () { s.classList.add('on'); }, 350 + i * 430); });
      setTimeout(function () {
        var k = 0;
        (function loop() {
          steps.forEach(function (s, i) { s.classList.toggle('cur', i === k); });
          k = (k + 1) % steps.length;
          setTimeout(loop, 1900);
        })();
      }, 350 + steps.length * 430);
    }, { threshold: 0.35 });
    io.observe(f);
  }

  /* ---------------- proje önizleme penceresi ---------------- */
  function previews() {
    var dlg = $('#pvDlg');
    var cards = $$('.previewable');
    if (!dlg || !cards.length || typeof dlg.showModal !== 'function') return;
    var LABELS = { web: 'Web sitesi ↗', appstore: 'App Store ↗', play: 'Google Play ↗', github: 'GitHub ↗' };
    var img = $('#pvImg');
    var title = $('#pvTitle');
    var note = $('#pvNote');
    var linksEl = $('#pvLinks');

    function open(card) {
      img.src = card.dataset.preview;
      img.alt = card.dataset.previewTitle + ' — tasarım önizlemesi';
      title.textContent = card.dataset.previewTitle;
      var links = (card.dataset.links || '').split(';;').filter(Boolean).map(function (p) {
        var a = p.split('|');
        return { kind: a[0], url: a[1] };
      });
      linksEl.replaceChildren.apply(linksEl, links.map(function (l) {
        var a = document.createElement('a');
        a.href = l.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = LABELS[l.kind] || l.url;
        return a;
      }));
      linksEl.hidden = !links.length;
      note.hidden = links.length > 0;
      dlg.showModal();
    }
    cards.forEach(function (c) { c.addEventListener('click', function () { open(c); }); });
    $('#pvClose').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  function boot() { services(); flow(); previews(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
