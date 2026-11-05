/* /business/ fiyat hesaplayıcı.
 *
 * !!! FİYATLAR ÖRNEKTİR (yer tutucu). Gerçek fiyatlarını aşağıdaki PRICING bölümünden değiştir;
 * başka hiçbir yere dokunmana gerek yok. Tutarlar TL, KDV hariç; süreler hafta.
 *
 * Çalışma şekli:
 *  - Proje tipi seçilir (temel fiyat + süre). Tipe uygun ek seçenekler 6 grupta listelenir.
 *  - İşaretlenen her seçenek toplama eklenir.
 *  - Revizyon hakkı ve bakım/destek "kademelidir" (biri seçilir): revizyon, toplamın yüzdesi olarak eklenir; bakım aylık ayrı gösterilir.
 *  - "Hızlı teslim" tek seferlik toplamı %25 artırır, süreyi kısaltır.
 *  - Toplamın yanında olası aralık gösterilir (RANGE_LOW / RANGE_HIGH).
 *  - Seçim adres çubuğuna yazılır: "Seçimimi paylaş" bağlantısı aynı kapsamı başkasına açar.
 *  - "Teklif iste" seçimleri hazır bir e-postaya çevirir.
 */
(function () {
  'use strict';

  /* =============================== PRICING (düzenle) =============================== */
  var EMAIL = 'ugurcihancekic@gmail.com';
  var RUSH_RATE = 0.25;   // hızlı teslim: tek seferlik toplama eklenen oran
  var RUSH_TIME = 0.55;   // hızlı teslim: süre çarpanı
  var RANGE_LOW = 0.9;    // olası aralık: toplamın altı
  var RANGE_HIGH = 1.25;  // olası aralık: toplamın üstü
  var BAR_MAX = 450000;   // çubuğun dolu sayıldığı tutar

  var TYPES = [
    { id: 'kurumsal', name: 'Kurumsal web sitesi', desc: '5 sayfaya kadar, mobil uyumlu, iletişim formu', base: 30000, weeks: 3,
      icon: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>' },
    { id: 'startup', name: 'Startup / tanıtım sayfası', desc: 'Tek sayfa, hızlı yayın, etkileyici anlatım', base: 18000, weeks: 2,
      icon: '<path d="M5 15c-1.5 1.3-2 4-2 4s2.7-.5 4-2M9 15l-3-3c1-3 4-7 9-8l5-1-1 5c-1 5-5 8-8 9z"/><circle cx="15" cy="9" r="1.2"/>' },
    { id: 'eticaret', name: 'E-ticaret sitesi', desc: 'Ürün kataloğu, sepet, ödeme, sipariş yönetimi', base: 65000, weeks: 6,
      icon: '<path d="M3 4h2l2.4 11h10.2l2-8H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>' },
    { id: 'mobil', name: 'Mobil uygulama', desc: 'iOS ve Android, tek kod tabanından', base: 150000, weeks: 10,
      icon: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M10.5 18.5h3"/>' },
    { id: 'yazilim', name: 'Özel yazılım / SaaS', desc: 'Panel, kullanıcı hesapları, size özel iş akışı', base: 200000, weeks: 12,
      icon: '<path d="M8 7 3 12l5 5M16 7l5 5-5 5M13.5 5l-3 14"/>' },
    { id: 'iyilestir', name: 'Mevcut siteyi iyileştir', desc: 'Hız, güvenlik ve yenileme: yeni site yapmadan', base: 8000, weeks: 1.5,
      icon: '<path d="M4 17a8 8 0 1 1 16 0M12 17l4-6"/><circle cx="12" cy="17" r="1.4"/>' }
  ];

  var GROUPS = [
    { id: 'brand', name: 'Tasarım ve marka' },
    { id: 'feat', name: 'Özellikler' },
    { id: 'integ', name: 'Entegrasyonlar' },
    { id: 'grow', name: 'Büyüme ve uyum' },
    { id: 'launch', name: 'Yayın ve teslim' },
    { id: 'care', name: 'Bakım ve destek' }
  ];

  // price: tek sayı (tüm tipler) ya da { tipId: tutar } (yalnızca o tiplerde görünür)
  function five(n) { return { kurumsal: n, startup: n, eticaret: n, mobil: n, yazilim: n }; }
  var ADDONS = [
    // --- Tasarım ve marka
    { id: 'design', group: 'brand', name: 'Özel tasarım', desc: 'Şablon yok, markana sıfırdan tasarım (mevcut sitede: yenileme tasarımı)', weeks: 1, tier: 'rec',
      price: { kurumsal: 15000, startup: 8000, eticaret: 22000, mobil: 25000, yazilim: 25000, iyilestir: 8000 } },
    { id: 'logo', group: 'brand', name: 'Logo ve marka kimliği', desc: 'Logo, renk ve yazı seti, kullanım rehberi', weeks: 1, tier: 'full', price: five(12000) },
    { id: 'copy', group: 'brand', name: 'İçerik yazımı', desc: 'Sayfa metinleri ve ürün açıklamaları, SEO uyumlu', weeks: 0.5, tier: 'full',
      price: { kurumsal: 6000, startup: 3000, eticaret: 8000, iyilestir: 4000 } },
    { id: 'anim', group: 'brand', name: 'Gelişmiş animasyonlar', desc: 'Kaydırma ve etkileşim animasyonları', weeks: 0.5, tier: 'full',
      price: { kurumsal: 6000, startup: 4000, eticaret: 8000, iyilestir: 4000 } },

    // --- Özellikler
    { id: 'lang', group: 'feat', name: 'Çoklu dil (TR / EN)', desc: 'İki dilde içerik ve dil değiştirme', weeks: 0.5, tier: 'rec',
      price: { kurumsal: 6000, startup: 3000, eticaret: 12000, mobil: 12000, yazilim: 15000, iyilestir: 5000 } },
    { id: 'auth', group: 'feat', name: 'Üyelik / giriş sistemi', desc: 'Kayıt, giriş, şifre sıfırlama', weeks: 1, tier: 'full', price: { kurumsal: 8000, startup: 8000, mobil: 8000 } },
    { id: 'admin', group: 'feat', name: 'Yönetim paneli', desc: 'İçeriği kendin güncelle', weeks: 1.5, tier: 'rec', price: { kurumsal: 10000, startup: 8000, mobil: 25000 } },
    { id: 'pay', group: 'feat', name: 'Online ödeme', desc: 'Kart ile ödeme: yerel ödeme sağlayıcısı entegrasyonu', weeks: 1, tier: 'full', price: { kurumsal: 8000, startup: 8000 } },
    { id: 'products', group: 'feat', name: 'İlk 50 ürünün girişi', desc: 'Başlık, açıklama, görsel ve fiyat girişi', weeks: 0.5, tier: 'rec', price: { eticaret: 4000 } },
    { id: 'blog', group: 'feat', name: 'Blog / haber modülü', desc: 'Yazı yayınlama, kategoriler ve arama', weeks: 0.5, tier: 'full', price: { kurumsal: 5000, startup: 4000, eticaret: 5000 } },
    { id: 'booking', group: 'feat', name: 'Randevu / rezervasyon sistemi', desc: 'Takvim, müsaitlik ve onay akışı', weeks: 1, tier: 'full', price: { kurumsal: 12000, mobil: 15000, yazilim: 15000 } },
    { id: 'push', group: 'feat', name: 'Anlık bildirimler', desc: 'Push bildirim altyapısı', weeks: 0.5, tier: 'rec', price: { mobil: 5000 } },
    { id: 'iap', group: 'feat', name: 'Uygulama içi satın alma / abonelik', desc: 'Mağaza ödemeleri ve abonelik yönetimi', weeks: 1.5, tier: 'full', price: { mobil: 15000 } },
    { id: 'maps', group: 'feat', name: 'Harita ve konum', desc: 'Harita gösterimi, konum seçimi ve yakındakiler', weeks: 0.5, tier: 'full', price: { kurumsal: 3000, mobil: 8000 } },
    { id: 'ai', group: 'feat', name: 'Yapay zeka entegrasyonu', desc: 'Sohbet, özetleme ya da sınıflandırma özelliği', weeks: 1.5, tier: 'full', price: five(15000) },

    // --- Entegrasyonlar
    { id: 'crm', group: 'integ', name: 'CRM entegrasyonu', desc: 'Form ve müşteri verisinin CRM sistemine otomatik aktarımı (tek yönlü; çift yönlü senkron ayrı teklif)', weeks: 1, tier: 'full',
      price: { kurumsal: 12000, startup: 10000, eticaret: 15000, mobil: 18000, yazilim: 18000 } },
    { id: 'erp', group: 'integ', name: 'Ön muhasebe / ERP ve e-fatura entegrasyonu', desc: 'Sipariş, fatura ve stok bilgisinin muhasebe sistemiyle senkronu (sisteme göre kapsam teklifte netleşir)', weeks: 1.5, tier: 'full',
      price: { kurumsal: 12000, eticaret: 18000, mobil: 22000, yazilim: 25000 } },
    { id: 'cargo', group: 'integ', name: 'Kargo entegrasyonu', desc: 'Anlaşmalı kargo firmalarıyla etiket, takip ve durum bildirimi', weeks: 1, tier: 'full', price: { eticaret: 9000 } },
    { id: 'market', group: 'integ', name: 'Pazaryeri entegrasyonu', desc: 'Pazaryeri mağazalarıyla ürün, stok ve sipariş eşitleme (pazaryeri sayısına göre)', weeks: 1.5, tier: 'full', price: { eticaret: 25000 } },
    { id: 'notify', group: 'integ', name: 'SMS / e-posta bildirimleri', desc: 'Sipariş, randevu ve hatırlatma mesajları', weeks: 0.5, tier: 'full',
      price: { kurumsal: 4000, eticaret: 5000, mobil: 5000, yazilim: 6000 } },

    // --- Büyüme ve uyum
    { id: 'seo', group: 'grow', name: 'SEO altyapısı', desc: 'Başlık, schema, site haritası, Search Console kurulumu', weeks: 0, tier: 'rec',
      price: { kurumsal: 5000, startup: 4000, eticaret: 8000, iyilestir: 4000 } },
    { id: 'analytics', group: 'grow', name: 'Analitik ve dönüşüm takibi', desc: 'Google Analytics 4, Search Console ve reklam pikselleri kurulumu', weeks: 0.5, tier: 'rec',
      price: { kurumsal: 4000, startup: 3500, eticaret: 5000, mobil: 5000, yazilim: 4000, iyilestir: 3500 } },
    { id: 'kvkk', group: 'grow', name: 'KVKK ve çerez uyumu', desc: 'Çerez onayı, aydınlatma ve gizlilik metinlerinin yerleşimi (metinlerin hukuki onayı sana aittir)', weeks: 0.5, tier: 'full',
      price: { kurumsal: 3000, startup: 3000, eticaret: 5000, mobil: 4000, yazilim: 5000, iyilestir: 3000 } },
    { id: 'perf', group: 'grow', name: 'Hız ve performans optimizasyonu', desc: 'Core Web Vitals, görsel ve kod optimizasyonu, ölçüm raporu', weeks: 0.5, tier: 'rec',
      price: { kurumsal: 5000, startup: 3000, eticaret: 8000, iyilestir: 6000 } },
    { id: 'sec', group: 'grow', name: 'Güvenlik sertleştirme ve yedekleme', desc: 'Güvenlik başlıkları, otomatik yedekleme ve geri yükleme testi', weeks: 0.5, tier: 'full',
      price: { kurumsal: 4000, eticaret: 7000, mobil: 6000, yazilim: 9000, iyilestir: 5000 } },

    // --- Yayın ve teslim
    { id: 'setup', group: 'launch', name: 'Alan adı, barındırma ve e-posta kurulumu', desc: 'Satın alma ücretleri ayrıdır; bu kalem kurulum ve yönlendirme işçiliğidir', weeks: 0, tier: 'rec',
      price: { kurumsal: 3000, startup: 2000, eticaret: 4000, iyilestir: 2500 } },
    { id: 'store', group: 'launch', name: 'App Store + Google Play yayını', desc: 'Mağaza hazırlığı, gönderim ve onay süreci', weeks: 1, tier: 'rec', price: { mobil: 6000 } },
    { id: 'train', group: 'launch', name: 'Yönetim eğitimi', desc: 'Canlı oturum ve kayıtlı video ile paneli kullanmayı öğren', weeks: 0, tier: 'full',
      price: { kurumsal: 2500, startup: 2000, eticaret: 3500, mobil: 3500, yazilim: 5000 } }
  ];

  // Kademeli seçimler (biri seçilir). pct: tek seferlik toplamın yüzdesi; price: aylık tutar (tip bazlı)
  var TIERS = [
    { key: 'rev', group: 'launch', title: 'Revizyon hakkı (tur = bir seferde ilettiğin toplu geri bildirim; kapsam değişikliği revizyon sayılmaz)', options: [
      { id: 'rev_std', name: 'Standart: 2 revizyon turu', desc: 'Tasarım onayından önce 2 tur geri bildirim ve düzeltme', label: 'Dahil', pct: 0, weeks: 0 },
      { id: 'rev_ext', name: 'Genişletilmiş: 4 revizyon turu', desc: 'Tasarım ve geliştirme aşamalarında toplam 4 tur; içerik ve ince ayar için esnek süreç', label: '+%8', pct: 0.08, weeks: 0.5 },
      { id: 'rev_unl', name: 'Sınırsız revizyon', desc: 'Proje süresince sınırsız tur; sayfa ve özellik kapsamı değişmediği sürece. Yeni kapsam ayrıca fiyatlanır', label: '+%15', pct: 0.15, weeks: 1 }
    ] },
    { key: 'care', group: 'care', title: 'Bakım ve destek', options: [
      { id: 'care_none', name: 'Şimdilik gerek yok', desc: 'Yayından sonra ihtiyaç olunca ayrıca konuşuruz', price: 0 },
      { id: 'care_std', name: 'Standart bakım', desc: 'Güvenlik güncellemeleri, yedekleme ve çalışma takibi, ayda küçük içerik değişiklikleri',
        price: { kurumsal: 5000, startup: 3500, eticaret: 8000, mobil: 7500, yazilim: 10000, iyilestir: 3000 } },
      { id: 'care_pro', name: 'Premium destek', desc: 'Standart bakımın tamamı + öncelikli yanıt, ayda 2 saate kadar geliştirme ve aylık durum raporu',
        price: { kurumsal: 9000, startup: 6500, eticaret: 14000, mobil: 14000, yazilim: 18000, iyilestir: 5500 } }
    ] }
  ];
  /* ================================================================================== */

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var state = { type: 'kurumsal', picked: {}, tier: { rev: 'rev_std', care: 'care_none' }, rush: false, open: { brand: true, feat: true } };
  var shown = { total: 0 };
  var rafId = 0;
  var touched = false;

  function $(id) { return document.getElementById(id); }
  var el = {
    types: $('bzTypes'), opts: $('bzOpts'), presets: $('bzPresets'), total: $('bzTotal'), bar: $('bzBar'),
    lines: $('bzLines'), weeks: $('bzWeeks'), monthly: $('bzMonthly'), monthlyRow: $('bzMonthlyRow'),
    sumType: $('bzSumType'), rush: $('bzRush'), cta: $('bzCta'), bottom: $('bzBottom'),
    bottomTotal: $('bzBottomTotal'), bottomCta: $('bzBottomCta'), calc: $('fiyat'), range: $('bzRange'), share: $('bzShare')
  };
  if (!el.types || !el.opts) return;

  function tl(n) { return Math.round(n).toLocaleString('tr-TR') + ' ₺'; }
  function typeOf(id) { return TYPES.filter(function (t) { return t.id === id; })[0]; }
  function priceOf(a, t) {
    if (typeof a.price === 'number') return a.price;
    return a.price[t] === undefined ? null : a.price[t];
  }
  function available() { return ADDONS.filter(function (a) { return priceOf(a, state.type) !== null; }); }
  function tierOpt(tier) {
    var id = state.tier[tier.key];
    return tier.options.filter(function (o) { return o.id === id; })[0] || tier.options[0];
  }
  function tierPrice(o) { return o.price === undefined ? null : priceOf(o, state.type); }

  /* ---- hesap ---- */
  function compute() {
    var t = typeOf(state.type);
    var sub = t.base;
    var weeks = t.weeks;
    var monthly = 0;
    var items = [];
    available().forEach(function (a) {
      if (!state.picked[a.id]) return;
      var p = priceOf(a, state.type);
      sub += p; weeks += a.weeks;
      items.push({ name: a.name, price: p });
    });
    var revFee = 0;
    TIERS.forEach(function (tier) {
      var o = tierOpt(tier);
      if (tier.key === 'rev' && o.pct) {
        revFee = Math.round(sub * o.pct / 100) * 100; weeks += o.weeks || 0;
        items.push({ name: o.name, price: revFee });
      }
      if (tier.key === 'care' && o.id !== 'care_none') {
        var mp = tierPrice(o);
        if (mp) { monthly = mp; items.push({ name: o.name, price: mp, monthly: true }); }
      }
    });
    var once = sub + revFee;
    var rushFee = 0;
    if (state.rush) { rushFee = Math.round(once * RUSH_RATE / 100) * 100; once += rushFee; weeks = weeks * RUSH_TIME; }
    return { type: t, once: once, weeks: Math.max(1, Math.ceil(weeks)), monthly: monthly, items: items, rushFee: rushFee,
             low: Math.round(once * RANGE_LOW / 1000) * 1000, high: Math.round(once * RANGE_HIGH / 1000) * 1000 };
  }

  /* ---- çizim ---- */
  // kart çizimleri: hizmet vitrinindeki canlı illüstrasyonların kopyası
  var ART_PANEL = { kurumsal: 0, startup: 1, eticaret: 2, mobil: 3, yazilim: 4, iyilestir: 6 };
  var ACCENT = { kurumsal: '#2fb8a6', startup: '#ff7a5c', eticaret: '#ffcf56', mobil: '#2fb8a6', yazilim: '#ff7a5c', iyilestir: '#ffcf56' };
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

  function checkOpt(a, i, animate) {
    var p = priceOf(a, state.type);
    return '<label class="bz-opt' + (animate ? ' is-new' : '') + '" style="--i:' + i + '">' +
      '<input type="checkbox" value="' + a.id + '"' + (state.picked[a.id] ? ' checked' : '') + '>' +
      '<span class="bz-box">' + CHECK + '</span>' +
      '<span class="bz-opt-text"><b>' + a.name + '</b><small>' + a.desc + '</small></span>' +
      '<span class="bz-opt-price">+' + tl(p) + '</span></label>';
  }
  function tierOptHtml(tier, o, i, animate) {
    var checked = state.tier[tier.key] === o.id;
    var mp = tierPrice(o);
    var lab = o.label || (o.id === 'care_none' ? '—' : '+' + tl(mp) + ' /ay');
    return '<label class="bz-opt radio' + (animate ? ' is-new' : '') + '" style="--i:' + i + '">' +
      '<input type="radio" name="tier_' + tier.key + '" value="' + o.id + '"' + (checked ? ' checked' : '') + '>' +
      '<span class="bz-box">' + CHECK + '</span>' +
      '<span class="bz-opt-text"><b>' + o.name + '</b><small>' + o.desc + '</small></span>' +
      '<span class="bz-opt-price">' + lab + '</span></label>';
  }
  function renderOpts(animate) {
    var av = available();
    var i = 0;
    var html = '';
    GROUPS.forEach(function (g) {
      var items = av.filter(function (a) { return a.group === g.id; });
      var tiers = TIERS.filter(function (t) { return t.group === g.id; });
      if (!items.length && !tiers.length) return;
      html += '<details class="bz-grp-wrap" data-g="' + g.id + '"' + (state.open[g.id] ? ' open' : '') + '><summary class="bz-grp"><span>' + g.name + '</span><em class="bz-count"></em></summary>';
      items.forEach(function (a) { html += checkOpt(a, i++, animate); });
      tiers.forEach(function (tier) {
        html += '<p class="bz-tier-title">' + tier.title + '</p>';
        tier.options.forEach(function (o) { html += tierOptHtml(tier, o, i++, animate); });
      });
      html += '</details>';
    });
    el.opts.innerHTML = html;
    updateCounts();
  }
  // her grup başlığında kaç seçim yapıldığı (kapalı grupta da görünsün)
  function updateCounts() {
    Array.prototype.forEach.call(el.opts.querySelectorAll('.bz-grp-wrap'), function (w) {
      var n = 0;
      Array.prototype.forEach.call(w.querySelectorAll('input:checked'), function (inp) {
        if (inp.value !== 'rev_std' && inp.value !== 'care_none') n++;
      });
      var c = w.querySelector('.bz-count');
      if (c) c.textContent = n ? n + ' seçili' : '';
    });
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
    if (el.bottomTotal) el.bottomTotal.textContent = s;
  }

  /* ---- paylaşılabilir seçim (adres çubuğu) ---- */
  function hashOf() {
    var picks = Object.keys(state.picked).filter(function (k) { return state.picked[k]; });
    var h = 't=' + state.type;
    if (picks.length) h += '&a=' + picks.join(',');
    h += '&r=' + state.tier.rev + '&c=' + state.tier.care;
    if (state.rush) h += '&x=1';
    return h;
  }
  function shareUrl() { return location.origin + location.pathname + '#' + hashOf(); }
  function fromHash() {
    var h = location.hash.replace(/^#/, '');
    if (h.indexOf('t=') !== 0) return false;
    var p = {};
    h.split('&').forEach(function (kv) { var a = kv.split('='); p[a[0]] = a[1]; });
    if (!typeOf(p.t)) return false;
    state.type = p.t;
    state.picked = {};
    (p.a || '').split(',').filter(Boolean).forEach(function (id) {
      var a = ADDONS.filter(function (x) { return x.id === id; })[0];
      if (a && priceOf(a, state.type) !== null) state.picked[id] = true;
    });
    TIERS.forEach(function (tier) {
      var v = p[tier.key === 'rev' ? 'r' : 'c'];
      if (v && tier.options.some(function (o) { return o.id === v; })) state.tier[tier.key] = v;
    });
    state.rush = p.x === '1';
    if (el.rush) el.rush.checked = state.rush;
    return true;
  }

  var lastItems = {};
  function update() {
    var c = compute();
    el.sumType.textContent = c.type.name;
    countTo(c.once);
    var pct = Math.max(4, Math.min(100, (c.once / BAR_MAX) * 100));
    el.bar.style.width = pct + '%';
    if (el.range) el.range.textContent = 'Olası aralık: ' + tl(c.low) + ' – ' + tl(c.high);

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
    if (el.bottomCta) el.bottomCta.setAttribute('href', href);
    el.total.classList.remove('pop'); void el.total.offsetWidth; if (!reduced) el.total.classList.add('pop');
    markPreset();
    updateCounts();
    if (touched) { try { history.replaceState(null, '', '#' + hashOf()); } catch (e) { /* adres çubuğu yazılamıyorsa paylaşım düğmesi yine çalışır */ } }
  }

  function message(c) {
    var lines = ['Merhaba Uğur,', '', 'Fiyat hesaplayıcıyla şu kapsamı seçtim:', '', 'Proje tipi: ' + c.type.name + ' (' + tl(c.type.base) + ')'];
    if (c.items.length) {
      lines.push('', 'Ek seçenekler:');
      c.items.forEach(function (it) { lines.push('- ' + it.name + ': +' + tl(it.price) + (it.monthly ? ' /ay' : '')); });
    }
    if (c.rushFee) lines.push('', 'Hızlı teslim: evet');
    lines.push('', 'Tahmini toplam: ' + tl(c.once) + ' (KDV hariç)', 'Olası aralık: ' + tl(c.low) + ' – ' + tl(c.high), 'Tahmini süre: ≈ ' + c.weeks + ' hafta');
    if (c.monthly) lines.push('Aylık bakım: ' + tl(c.monthly) + ' /ay');
    lines.push('', 'Seçimim: ' + shareUrl(), '',
      'Projem hakkında (kısaca): ', 'Mevcut site / uygulama (varsa): ', 'Hedef tarih: ', 'Bütçe beklentim: ');
    return { subject: 'Teklif talebi: ' + c.type.name + ' (≈ ' + tl(c.once) + ')', body: lines.join('\n') };
  }
  var current = null;
  function mailto(c) {
    current = message(c);
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(current.subject) + '&body=' + encodeURIComponent(current.body);
  }

  /* ---- teklif penceresi: e-posta uygulaması yoksa da çalışsın ---- */
  var dlg = $('bzDlg');
  function copyText(text, okMsg, target) {
    var ok = target || $('bzDlgOk');
    function done() { if (ok) { ok.textContent = okMsg; setTimeout(function () { if (ok.textContent === okMsg) ok.textContent = ''; }, 3500); } }
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { if (ok) ok.textContent = 'Kopyalanamadı, metni elle seçip kopyala.'; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
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
    if (el.bottomCta) el.bottomCta.addEventListener('click', openDlg);
    $('bzDlgClose').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    $('bzCopy').addEventListener('click', function () { copyText($('bzDlgText').value, 'Metin kopyalandı ✓ E-postana yapıştırabilirsin.'); });
    $('bzCopyAddr').addEventListener('click', function () { copyText(EMAIL, 'Adres kopyalandı ✓'); });
  }
  if (el.share) el.share.addEventListener('click', function () {
    var label = el.share.textContent;
    function ok() { el.share.textContent = 'Bağlantı kopyalandı ✓'; setTimeout(function () { el.share.textContent = label; }, 3000); }
    var url = shareUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(ok); return; }
    var ta = document.createElement('textarea'); ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { /* bağlantı adres çubuğunda zaten var */ } document.body.removeChild(ta);
  });
  var cc = $('bzCopyContact');
  if (cc) cc.addEventListener('click', function () {
    var label = cc.textContent;
    function ok() { cc.textContent = 'Adres kopyalandı ✓'; setTimeout(function () { cc.textContent = label; }, 3000); }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(EMAIL).then(ok); return; }
    var ta = document.createElement('textarea'); ta.value = EMAIL; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { /* adres zaten ekranda */ } document.body.removeChild(ta);
  });

  /* ---- hazır kombinasyonlar ---- */
  function presetWants(kind, a) { return kind === 'full' || (kind === 'rec' && a.tier === 'rec'); }
  var PRESET_TIERS = { basic: { rev: 'rev_std', care: 'care_none' }, rec: { rev: 'rev_std', care: 'care_std' }, full: { rev: 'rev_ext', care: 'care_pro' } };
  function applyPreset(kind) {
    touched = true;
    state.picked = {};
    available().forEach(function (a) { if (presetWants(kind, a)) state.picked[a.id] = true; });
    state.tier = { rev: PRESET_TIERS[kind].rev, care: PRESET_TIERS[kind].care };
    renderOpts(false);
    update();
  }
  function markPreset() {
    var av = available();
    var set = function (kind) {
      return av.every(function (a) { return !!state.picked[a.id] === presetWants(kind, a); }) &&
        state.tier.rev === PRESET_TIERS[kind].rev && state.tier.care === PRESET_TIERS[kind].care;
    };
    Array.prototype.forEach.call(el.presets.querySelectorAll('button'), function (b) {
      b.classList.toggle('on', set(b.getAttribute('data-preset')));
    });
  }

  /* ---- olaylar ---- */
  el.types.addEventListener('change', function (e) {
    if (e.target.name !== 'ptype') return;
    touched = true;
    state.type = e.target.value;
    var keep = {};
    available().forEach(function (a) { if (state.picked[a.id]) keep[a.id] = true; });
    state.picked = keep;
    renderOpts(true);
    update();
  });
  el.opts.addEventListener('change', function (e) {
    touched = true;
    if (e.target.type === 'checkbox') state.picked[e.target.value] = e.target.checked;
    else if (e.target.type === 'radio') state.tier[e.target.name.replace('tier_', '')] = e.target.value;
    else return;
    update();
  });
  el.opts.addEventListener('toggle', function (e) {
    var w = e.target;
    if (w && w.classList && w.classList.contains('bz-grp-wrap')) state.open[w.getAttribute('data-g')] = w.open;
  }, true);
  el.presets.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-preset]');
    if (b) applyPreset(b.getAttribute('data-preset'));
  });
  el.rush.addEventListener('change', function () { touched = true; state.rush = el.rush.checked; update(); });

  /* ---- hizmet vitrininden gelen "Fiyatını hesapla" ---- */
  document.addEventListener('bz:select', function (e) {
    var d = e.detail || {};
    if (!typeOf(d.type)) return;
    touched = true;
    state.type = d.type;
    state.picked = {};
    state.tier = { rev: 'rev_std', care: 'care_none' };
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

  fromHash();
  renderTypes();
  renderOpts(false);
  update();
})();
