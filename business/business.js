/* /business/ fiyat hesaplayıcı.
 *
 * !!! FİYATLAR ÖRNEKTİR (yer tutucu). Gerçek fiyatlarını aşağıdaki PRICING bölümünden değiştir;
 * başka hiçbir yere dokunmana gerek yok. Tutarlar TL, KDV hariç; süreler hafta.
 *
 * Çalışma şekli: proje tipi seçilir (temel fiyat + süre), tipe uygun ek seçenekler listelenir,
 * işaretlenen her seçenek toplama eklenir. "Hızlı teslim" tek seferlik toplamı %25 artırır, süreyi kısaltır.
 * Aylık bakım tek seferlik toplama girmez, ayrı gösterilir.
 * "Teklif iste" düğmesi seçimleri hazır bir e-postaya çevirir.
 */
(function () {
  'use strict';

  /* =============================== PRICING (düzenle) =============================== */
  var EMAIL = 'ugurcihancekic@gmail.com';
  var RUSH_RATE = 0.25;   // hızlı teslim: tek seferlik toplama eklenen oran
  var RUSH_TIME = 0.55;   // hızlı teslim: süre çarpanı
  var BAR_MAX = 350000;   // çubuğun dolu sayıldığı tutar

  var TYPES = [
    { id: 'kurumsal', name: 'Kurumsal web sitesi', desc: '5 sayfaya kadar, mobil uyumlu, iletişim formu', base: 25000, weeks: 3,
      icon: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>' },
    { id: 'startup', name: 'Startup / tanıtım sayfası', desc: 'Tek sayfa, hızlı yayın, etkileyici anlatım', base: 12000, weeks: 2,
      icon: '<path d="M5 15c-1.5 1.3-2 4-2 4s2.7-.5 4-2M9 15l-3-3c1-3 4-7 9-8l5-1-1 5c-1 5-5 8-8 9z"/><circle cx="15" cy="9" r="1.2"/>' },
    { id: 'eticaret', name: 'E-ticaret sitesi', desc: 'Ürün kataloğu, sepet, ödeme, sipariş yönetimi', base: 60000, weeks: 6,
      icon: '<path d="M3 4h2l2.4 11h10.2l2-8H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>' },
    { id: 'mobil', name: 'Mobil uygulama', desc: 'iOS ve Android, tek kod tabanından', base: 120000, weeks: 10,
      icon: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M10.5 18.5h3"/>' },
    { id: 'yazilim', name: 'Özel yazılım / SaaS', desc: 'Panel, kullanıcı hesapları, size özel iş akışı', base: 150000, weeks: 12,
      icon: '<path d="M8 7 3 12l5 5M16 7l5 5-5 5M13.5 5l-3 14"/>' }
  ];

  // price: tek sayı (tüm tipler) ya da { tipId: tutar } (yalnızca o tiplerde görünür)
  var ADDONS = [
    { id: 'design',  name: 'Özel tasarım', desc: 'Şablon yok, markana sıfırdan tasarım', weeks: 1, tier: 'rec',
      price: { kurumsal: 12000, startup: 6000, eticaret: 20000, mobil: 25000, yazilim: 25000 } },
    { id: 'logo',    name: 'Logo ve marka kimliği', desc: 'Logo, renk ve yazı seti, kullanım rehberi', weeks: 1, tier: 'full', price: 8000 },
    { id: 'lang',    name: 'Çoklu dil (TR / EN)', desc: 'İki dilde içerik ve dil değiştirme', weeks: 0.5, tier: 'rec',
      price: { kurumsal: 6000, startup: 3000, eticaret: 12000, mobil: 12000, yazilim: 15000 } },
    { id: 'seo',     name: 'SEO altyapısı', desc: 'Başlık, schema, site haritası, Search Console kurulumu', weeks: 0, tier: 'rec',
      price: { kurumsal: 5000, startup: 4000, eticaret: 8000 } },
    { id: 'anim',    name: 'Gelişmiş animasyonlar', desc: 'Kaydırma ve etkileşim animasyonları', weeks: 0.5, tier: 'full',
      price: { kurumsal: 6000, startup: 4000, eticaret: 8000 } },
    { id: 'auth',    name: 'Üyelik / giriş sistemi', desc: 'Kayıt, giriş, şifre sıfırlama', weeks: 1, tier: 'full',
      price: { kurumsal: 8000, startup: 8000, mobil: 8000 } },
    { id: 'admin',   name: 'Yönetim paneli', desc: 'İçeriği kendin güncelle', weeks: 1.5, tier: 'rec',
      price: { kurumsal: 10000, startup: 8000, mobil: 25000 } },
    { id: 'pay',     name: 'Online ödeme', desc: 'Kart ile ödeme altyapısı entegrasyonu', weeks: 1, tier: 'full',
      price: { kurumsal: 8000, startup: 8000 } },
    { id: 'products', name: 'İlk 50 ürünün girişi', desc: 'Başlık, açıklama, görsel ve fiyat girişi', weeks: 0.5, tier: 'rec', price: { eticaret: 4000 } },
    { id: 'push',    name: 'Anlık bildirimler', desc: 'Push bildirim altyapısı', weeks: 0.5, tier: 'rec', price: { mobil: 5000 } },
    { id: 'store',   name: 'App Store + Google Play yayını', desc: 'Mağaza hazırlığı, gönderim ve onay süreci', weeks: 1, tier: 'rec', price: { mobil: 6000 } },
    { id: 'ai',      name: 'Yapay zeka entegrasyonu', desc: 'Sohbet, özetleme ya da sınıflandırma özelliği', weeks: 1.5, tier: 'full', price: 15000 },
    { id: 'support', name: 'Aylık bakım ve destek', desc: 'Güncelleme, hata düzeltme, izleme', weeks: 0, tier: 'rec', monthly: true,
      price: { kurumsal: 3000, startup: 3000, eticaret: 5000, mobil: 8000, yazilim: 8000 } }
  ];
  /* ================================================================================== */

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var state = { type: 'kurumsal', picked: {}, rush: false };
  var shown = { total: 0 };
  var rafId = 0;

  function $(id) { return document.getElementById(id); }
  var el = {
    types: $('bzTypes'), opts: $('bzOpts'), presets: $('bzPresets'), total: $('bzTotal'), bar: $('bzBar'),
    lines: $('bzLines'), weeks: $('bzWeeks'), monthly: $('bzMonthly'), monthlyRow: $('bzMonthlyRow'),
    sumType: $('bzSumType'), rush: $('bzRush'), cta: $('bzCta'), bottom: $('bzBottom'),
    bottomTotal: $('bzBottomTotal'), bottomCta: $('bzBottomCta'), calc: $('fiyat')
  };
  if (!el.types || !el.opts) return;

  function tl(n) { return Math.round(n).toLocaleString('tr-TR') + ' ₺'; }
  function typeOf(id) { return TYPES.filter(function (t) { return t.id === id; })[0]; }
  function priceOf(a, t) {
    if (typeof a.price === 'number') return a.price;
    return a.price[t] === undefined ? null : a.price[t];
  }
  function available() {
    return ADDONS.filter(function (a) { return priceOf(a, state.type) !== null; });
  }

  /* ---- hesap ---- */
  function compute() {
    var t = typeOf(state.type);
    var once = t.base;
    var weeks = t.weeks;
    var monthly = 0;
    var items = [];
    available().forEach(function (a) {
      if (!state.picked[a.id]) return;
      var p = priceOf(a, state.type);
      if (a.monthly) { monthly += p; } else { once += p; weeks += a.weeks; }
      items.push({ name: a.name, price: p, monthly: !!a.monthly });
    });
    var rushFee = 0;
    if (state.rush) { rushFee = Math.round(once * RUSH_RATE / 100) * 100; once += rushFee; weeks = weeks * RUSH_TIME; }
    return { type: t, once: once, weeks: Math.max(1, Math.ceil(weeks)), monthly: monthly, items: items, rushFee: rushFee };
  }

  /* ---- çizim ---- */
  // kart çizimleri: hizmet vitrinindeki canlı illüstrasyonların kopyası (kurumsal, startup, e-ticaret, mobil, yazılım)
  var ART_PANEL = { kurumsal: 0, startup: 1, eticaret: 2, mobil: 3, yazilim: 4 };
  var ACCENT = { kurumsal: '#2fb8a6', startup: '#ff7a5c', eticaret: '#ffcf56', mobil: '#2fb8a6', yazilim: '#ff7a5c' };
  function artFor(t) {
    var s = document.querySelector('#svcPanel' + ART_PANEL[t.id] + ' .art');
    return s ? s.outerHTML : '<svg viewBox="0 0 24 24" class="bz-type-fallback" aria-hidden="true">' + t.icon + '</svg>';
  }
  function renderTypes() {
    el.types.innerHTML = TYPES.map(function (t) {
      return '<label class="bz-type" style="--ac:' + ACCENT[t.id] + '"><input type="radio" name="ptype" value="' + t.id + '"' + (t.id === state.type ? ' checked' : '') + '>' +
        '<span class="bz-type-body"><span class="bz-type-art">' + artFor(t) + '</span>' +
        '<span class="bz-type-info"><span class="bz-type-name">' + t.name + '</span><span class="bz-type-desc">' + t.desc + '</span></span>' +
        '<span class="bz-type-price"><small>başlangıç</small><b>' + tl(t.base) + '</b></span></span>' +
        '<span class="bz-tick">' + CHECK + '</span></label>';
    }).join('');
  }

  function renderOpts(animate) {
    var list = available();
    el.opts.innerHTML = list.map(function (a, i) {
      var p = priceOf(a, state.type);
      return '<label class="bz-opt' + (animate ? ' is-new' : '') + '" style="--i:' + i + '">' +
        '<input type="checkbox" value="' + a.id + '"' + (state.picked[a.id] ? ' checked' : '') + '>' +
        '<span class="bz-box">' + CHECK + '</span>' +
        '<span class="bz-opt-text"><b>' + a.name + '</b><small>' + a.desc + '</small></span>' +
        '<span class="bz-opt-price">+' + tl(p) + (a.monthly ? ' /ay' : '') + '</span></label>';
    }).join('');
  }

  function countTo(target) {
    cancelAnimationFrame(rafId);
    var from = shown.total;
    if (reduced || from === target) { shown.total = target; paintTotal(target); return; }
    var t0 = performance.now();
    var dur = 520;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      shown.total = from + (target - from) * e;
      paintTotal(shown.total);
      if (k < 1) rafId = requestAnimationFrame(step); else { shown.total = target; paintTotal(target); }
    })(t0);
  }
  function paintTotal(v) {
    var s = tl(v);
    el.total.textContent = s;
    el.bottomTotal.textContent = s;
  }

  var lastItems = {};
  function update() {
    var c = compute();
    el.sumType.textContent = c.type.name;
    countTo(c.once);
    var pct = Math.max(4, Math.min(100, (c.once / BAR_MAX) * 100));
    el.bar.style.width = pct + '%';

    var next = {};
    var html = '<li class="bz-line-base">' + CHECK + '<span>' + c.type.name + ' (temel paket)</span><em>' + tl(c.type.base) + '</em></li>';
    c.items.forEach(function (it) {
      var key = it.name; next[key] = true;
      html += '<li class="' + (lastItems[key] ? '' : 'is-new') + '">' + CHECK + '<span>' + it.name + '</span><em>+' + tl(it.price) + (it.monthly ? ' /ay' : '') + '</em></li>';
    });
    if (c.rushFee) { next['rush'] = true; html += '<li class="' + (lastItems['rush'] ? '' : 'is-new') + '">' + CHECK + '<span>Hızlı teslim</span><em>+' + tl(c.rushFee) + '</em></li>'; }
    el.lines.innerHTML = html;
    lastItems = next;

    el.weeks.textContent = '≈ ' + c.weeks + ' hafta';
    el.monthlyRow.hidden = !c.monthly;
    el.monthly.textContent = tl(c.monthly) + ' /ay';

    var href = mailto(c);
    el.cta.setAttribute('href', href);
    el.bottomCta.setAttribute('href', href);
    el.total.classList.remove('pop'); void el.total.offsetWidth; if (!reduced) el.total.classList.add('pop');
    markPreset();
  }

  function message(c) {
    var lines = ['Merhaba Uğur,', '', 'Fiyat hesaplayıcıyla şu kapsamı seçtim:', '', 'Proje tipi: ' + c.type.name + ' (' + tl(c.type.base) + ')'];
    if (c.items.length) {
      lines.push('', 'Ek seçenekler:');
      c.items.forEach(function (it) { lines.push('- ' + it.name + ': +' + tl(it.price) + (it.monthly ? ' /ay' : '')); });
    }
    if (c.rushFee) lines.push('', 'Hızlı teslim: evet');
    lines.push('', 'Tahmini toplam: ' + tl(c.once) + ' (KDV hariç)', 'Tahmini süre: ≈ ' + c.weeks + ' hafta');
    if (c.monthly) lines.push('Aylık bakım: ' + tl(c.monthly) + ' /ay');
    lines.push('', 'Projem hakkında: ');
    return { subject: 'Teklif talebi: ' + c.type.name + ' (≈ ' + tl(c.once) + ')', body: lines.join('\n') };
  }
  var current = null;
  function mailto(c) {
    current = message(c);
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(current.subject) + '&body=' + encodeURIComponent(current.body);
  }

  /* ---- teklif penceresi: e-posta uygulaması yoksa da çalışsın ---- */
  var dlg = $('bzDlg');
  function copyText(text, okMsg) {
    var ok = $('bzDlgOk');
    function done() { if (ok) { ok.textContent = okMsg; setTimeout(function () { if (ok.textContent === okMsg) ok.textContent = ''; }, 3500); } }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { if (ok) ok.textContent = 'Kopyalanamadı, metni elle seçip kopyala.'; }
      document.body.removeChild(ta);
    }
  }
  function openDlg(e) {
    if (!dlg || typeof dlg.showModal !== 'function' || !current) return; // pencere yoksa normal mailto çalışır
    e.preventDefault();
    var text = 'Konu: ' + current.subject + '\n\n' + current.body;
    $('bzDlgText').value = text;
    $('bzDlgOk').textContent = '';
    $('bzMailto').setAttribute('href', 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(current.subject) + '&body=' + encodeURIComponent(current.body));
    $('bzGmail').setAttribute('href', 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL) +
      '&su=' + encodeURIComponent(current.subject) + '&body=' + encodeURIComponent(current.body));
    dlg.showModal();
  }
  if (dlg) {
    el.cta.addEventListener('click', openDlg);
    el.bottomCta.addEventListener('click', openDlg);
    $('bzDlgClose').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    $('bzCopy').addEventListener('click', function () { copyText($('bzDlgText').value, 'Metin kopyalandı ✓ E-postana yapıştırabilirsin.'); });
    $('bzCopyAddr').addEventListener('click', function () { copyText(EMAIL, 'Adres kopyalandı ✓'); });
  }
  var cc = $('bzCopyContact');
  if (cc) cc.addEventListener('click', function () {
    var label = cc.textContent;
    function ok() { cc.textContent = 'Adres kopyalandı ✓'; setTimeout(function () { cc.textContent = label; }, 3000); }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(EMAIL).then(ok); return; }
    var ta = document.createElement('textarea'); ta.value = EMAIL; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { /* adres zaten ekranda */ } document.body.removeChild(ta);
  });

  /* ---- hazır kombinasyonlar ---- */
  function applyPreset(kind) {
    state.picked = {};
    available().forEach(function (a) {
      if (kind === 'full' || (kind === 'rec' && a.tier === 'rec')) state.picked[a.id] = true;
    });
    renderOpts(false);
    update();
  }
  function markPreset() {
    var av = available();
    var set = function (kind) {
      return av.every(function (a) { return !!state.picked[a.id] === (kind === 'full' || (kind === 'rec' && a.tier === 'rec')); });
    };
    Array.prototype.forEach.call(el.presets.querySelectorAll('button'), function (b) {
      b.classList.toggle('on', set(b.getAttribute('data-preset')));
    });
  }

  /* ---- olaylar ---- */
  el.types.addEventListener('change', function (e) {
    if (e.target.name !== 'ptype') return;
    state.type = e.target.value;
    var keep = {};
    available().forEach(function (a) { if (state.picked[a.id]) keep[a.id] = true; });
    state.picked = keep;
    renderOpts(true);
    update();
  });
  el.opts.addEventListener('change', function (e) {
    if (e.target.type !== 'checkbox') return;
    state.picked[e.target.value] = e.target.checked;
    update();
  });
  el.presets.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-preset]');
    if (b) applyPreset(b.getAttribute('data-preset'));
  });
  el.rush.addEventListener('change', function () { state.rush = el.rush.checked; update(); });

  /* ---- hizmet vitrininden gelen "Fiyatını hesapla" ---- */
  document.addEventListener('bz:select', function (e) {
    var d = e.detail || {};
    if (!typeOf(d.type)) return;
    state.type = d.type;
    state.picked = {};
    (d.add || []).forEach(function (id) {
      var a = ADDONS.filter(function (x) { return x.id === id; })[0];
      if (a && priceOf(a, state.type) !== null) state.picked[id] = true;
    });
    renderTypes();
    renderOpts(true);
    update();
    el.calc.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });

  // mobil alt çubuk: hesaplayıcı görünürken göster
  if (window.IntersectionObserver && el.bottom) {
    new IntersectionObserver(function (entries) {
      el.bottom.classList.toggle('show', entries[0].isIntersecting);
    }, { threshold: 0.05 }).observe(el.calc);
  }
  var y = $('bzYear'); if (y) y.textContent = new Date().getFullYear();

  renderTypes();
  renderOpts(false);
  update();
})();
