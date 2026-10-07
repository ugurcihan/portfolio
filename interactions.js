document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('glowNameWrap');
  if (wrap) {
    wrap.addEventListener('pointermove', (e) => {
      const r = wrap.getBoundingClientRect();
      wrap.style.setProperty('--mx', `${e.clientX - r.left}px`);
      wrap.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.previewable');
  const modal = document.getElementById('previewModal');
  const backdrop = document.getElementById('previewBackdrop');
  const closeBtn = document.getElementById('previewClose');
  const img = document.getElementById('previewImage');
  const titleEl = document.getElementById('previewTitle');
  const linksEl = document.getElementById('previewLinks');
  const liveLabelEl = document.getElementById('previewLiveLabel');
  const noteEl = document.getElementById('previewNote');
  const LINK_LABELS = { appstore: 'App Store ↗', play: 'Google Play ↗', github: 'GitHub ↗' };

  // data-links="appstore|https://…;;play|https://…" — a card can point to
  // several real destinations; data-live is kept as the single-link shorthand.
  function cardLinks(card) {
    if (card.dataset.links) {
      return card.dataset.links.split(';;').map((pair) => {
        const [kind, url] = pair.split('|');
        return { url, label: LINK_LABELS[kind] || url };
      });
    }
    if (card.dataset.live) {
      return [{ url: card.dataset.live, label: liveLabelEl ? liveLabelEl.textContent : 'View live site ↗' }];
    }
    return [];
  }
  if (!cards.length || !modal) return;

  let lastFocused = null;

  function openPreview(card) {
    lastFocused = card;
    img.src = card.dataset.preview;
    img.alt = card.dataset.previewTitle + ' — design preview';
    titleEl.textContent = card.dataset.previewTitle;
    const links = cardLinks(card);
    if (linksEl) {
      linksEl.replaceChildren(...links.map(({ url, label }) => {
        const a = document.createElement('a');
        a.className = 'preview-live-link';
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = label;
        return a;
      }));
      linksEl.hidden = links.length === 0;
    }
    // The static note claims "not a live, browsable site" — true for the
    // screenshot-only cards, but false for any card with real links.
    if (noteEl) noteEl.hidden = links.length > 0;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closePreview() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => openPreview(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPreview(card);
      }
    });
  });

  closeBtn.addEventListener('click', closePreview);
  backdrop.addEventListener('click', closePreview);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closePreview();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('.logo-type');
  if (!el) return;
  const full = el.dataset.full || '';
  let i = 0, deleting = false;
  function tick() {
    el.textContent = full.slice(0, i);
    let delay = 140;
    if (!deleting) {
      if (i >= full.length) { deleting = true; delay = 1000; }
      else { i++; }
    } else {
      if (i <= 0) { deleting = false; delay = 500; }
      else { i--; }
    }
    setTimeout(tick, delay);
  }
  tick();
});

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  function closeMenu(returnFocus) {
    toggle.classList.remove('open');
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    // nav-links sits before nav-toggle in the DOM (needed so it lays out
    // between the logo and the lang/menu controls on desktop), which means
    // a keyboard user who reaches the toggle and opens the menu can never
    // Tab forward into the now-visible links — forward Tab only ever moves
    // later in the DOM, and there's nothing after the toggle. Move focus
    // into the panel directly so opening it keyboard-reachably also makes
    // its contents keyboard-reachable.
    if (isOpen) {
      const firstLink = links.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  });

  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeMenu(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      closeMenu(true);
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => io.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.hero-video');
  const canvas = document.querySelector('.hero-video-el');
  const overlay = document.querySelector('.hero-video-overlay');
  const hint = document.querySelector('.hero-scroll-hint');
  const ambientBg = document.getElementById('ambientBg');
  if (!wrapper || !canvas) return;

  const cols = parseInt(canvas.dataset.cols, 10);
  const rows = parseInt(canvas.dataset.rows, 10);
  const totalFrames = parseInt(canvas.dataset.frames, 10);
  const ctx = canvas.getContext('2d');
  const sprite = new Image();
  sprite.decoding = 'async';
  // Decorative, non-LCP asset (canvas isn't an LCP candidate and is
  // aria-hidden) — hint the browser to fetch it after higher-priority
  // resources like fonts and CSS.
  if ('fetchPriority' in sprite) sprite.fetchPriority = 'low';
  let spriteReady = false;
  let frameW = 0, frameH = 0;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ambient background: fetched lazily (idle/after-load) instead of on
  // first paint, since it's a fixed decorative layer that only becomes
  // visible near the end of the hero scroll (or immediately, but still
  // non-critical, under prefers-reduced-motion). Tries WebP first and
  // falls back to JPEG automatically if no WebP file has been published.
  let ambientBgRequested = false;
  function loadAmbientBg() {
    if (ambientBgRequested || !ambientBg) return;
    ambientBgRequested = true;
    const base = 'assets/server-bg-v2';
    const applyBg = (ext) => {
      ambientBg.style.backgroundImage =
        `linear-gradient(rgba(23,19,15,0.88), rgba(23,19,15,0.88)), url('${base}.${ext}')`;
    };
    const probe = new Image();
    probe.onload = () => applyBg('webp');
    probe.onerror = () => applyBg('jpg');
    probe.src = `${base}.webp`;
  }
  function scheduleAmbientBg() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadAmbientBg, { timeout: 3000 });
    } else {
      window.addEventListener('load', loadAmbientBg, { once: true });
    }
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(wrapper.clientWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
  }

  function drawFrame(index) {
    if (!spriteReady) return;
    index = Math.max(0, Math.min(totalFrames - 1, Math.round(index)));
    const col = index % cols;
    const row = Math.floor(index / cols);

    // Cover-fit: scale the source frame to fill the canvas, cropping overflow.
    const scale = Math.max(canvas.width / frameW, canvas.height / frameH);
    const drawW = frameW * scale;
    const drawH = frameH * scale;
    const dx = (canvas.width - drawW) / 2;
    const dy = (canvas.height - drawH) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      sprite,
      col * frameW, row * frameH, frameW, frameH,
      dx, dy, drawW, drawH
    );
  }

  let currentFrame = 0;
  let targetFrame = 0;

  sprite.onload = () => {
    frameW = sprite.naturalWidth / cols;
    frameH = sprite.naturalHeight / rows;
    spriteReady = true;
    resizeCanvas();
    targetFrame = reduceMotion ? totalFrames * 0.85 : 0;
    currentFrame = targetFrame;
    drawFrame(currentFrame);
  };

  // Prefer a WebP version of the sprite sheet (much smaller at this
  // resolution) if one has been published alongside the JPEG; fall back
  // to the original JPEG automatically if it 404s or the browser can't
  // decode it. Drop hero-sprite-v2.webp next to hero-sprite-v2.jpg to activate —
  // no further code changes needed.
  const jpgSrc = canvas.dataset.sprite;
  const webpSrc = jpgSrc.replace(/\.jpe?g$/i, '.webp');
  sprite.onerror = () => {
    if (sprite.src.indexOf(webpSrc) !== -1 && sprite.src.indexOf(jpgSrc) === -1) {
      sprite.onerror = null;
      sprite.src = jpgSrc;
    }
  };
  sprite.src = webpSrc !== jpgSrc ? webpSrc : jpgSrc;

  scheduleAmbientBg();

  if (reduceMotion) {
    wrapper.classList.add('reduced-motion');
    if (ambientBg) ambientBg.classList.add('visible');
    return;
  }

  let ticking = false;
  function computeTarget() {
    ticking = false;
    const scrollable = wrapper.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const rect = wrapper.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / scrollable));

    targetFrame = progress * (totalFrames - 1);
    if (overlay) overlay.style.opacity = String(Math.max(0, 1 - progress / 0.18));
    if (hint) hint.style.opacity = progress < 0.05 ? '1' : '0';
    if (ambientBg) ambientBg.classList.toggle('visible', progress >= 0.98);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(computeTarget);
    }
  }

  // Smoothly ease the drawn frame toward the scroll-derived target every
  // animation frame, so a large mouse-wheel jump doesn't snap abruptly.
  function tick() {
    currentFrame += (targetFrame - currentFrame) * 0.2;
    if (Math.abs(targetFrame - currentFrame) < 0.05) currentFrame = targetFrame;
    drawFrame(currentFrame);
    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { resizeCanvas(); onScroll(); });
  requestAnimationFrame(tick);
});

// Book waitlist: posts the email to Formspree (data-endpoint on the form).
// Until an endpoint is configured, falls back to a prefilled mailto.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookForm');
  if (!form) return;
  const input = document.getElementById('bookEmail');
  const msg = document.getElementById('bookMsg');
  const btn = form.querySelector('button[type="submit"]');
  const t = (key) => {
    const lang = document.documentElement.lang === 'tr' ? 'tr' : 'en';
    return (typeof translations !== 'undefined' && translations[lang][key]) || '';
  };
  const show = (key, isError) => {
    msg.textContent = t(key);
    msg.classList.toggle('is-error', !!isError);
  };

  input.addEventListener('input', () => input.removeAttribute('aria-invalid'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!input.checkValidity()) {
      input.setAttribute('aria-invalid', 'true');
      show('book_invalid', true);
      input.focus();
      return;
    }
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      const body = encodeURIComponent('Merhaba, kitap çıktığında bana haber verir misin? E-postam: ' + input.value);
      window.location.href = 'mailto:ugurcihancekic@gmail.com?subject=Makineyle%20Ayn%C4%B1%20Masada%20-%20Haber%20ver&body=' + body;
      return;
    }
    btn.disabled = true;
    msg.textContent = '';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      show('book_ok', false);
    } catch (err) {
      show('book_err', true);
    } finally {
      btn.disabled = false;
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const dlg = document.getElementById('certDialog');
  if (!dlg) return;
  const img = document.getElementById('certImg');
  document.querySelectorAll('.cert-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      img.src = btn.dataset.cert;
      img.alt = btn.dataset.alt || '';
      dlg.showModal();
    });
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
});

/* Visitor + hello counters (abacus.jasoncameron.dev). Counts each browser once:
   visits once per 24h, hello once ever. Fails silently (the counters just stay hidden).
   Add ?nocount to the URL once to exclude your own browser. */
document.addEventListener('DOMContentLoaded', () => {
  const API = 'https://abacus.jasoncameron.dev';
  const NS = 'ugurcihancekic-com';
  const VISITS_BASE = 0; // add a real historical total here if you have one
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const live = /^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname);
  if (/[?&]nocount\b/.test(location.search)) store.set('nocount', '1');
  const counting = live && !store.get('nocount') && !navigator.webdriver;

  const call = async (action, key) => {
    const r = await fetch(`${API}/${action}/${NS}/${key}`);
    if (!r.ok) throw new Error(r.status);
    return (await r.json()).value;
  };
  const fmt = (n) => Number(n).toLocaleString(document.documentElement.lang === 'tr' ? 'tr-TR' : 'en-US');

  const visitorsEl = document.getElementById('visitors');
  const visitorCount = document.getElementById('visitorCount');
  const helloCount = document.getElementById('helloCount');
  const helloBtn = document.getElementById('helloBtn');
  const DAY = 24 * 60 * 60 * 1000;

  const lastVisit = Number(store.get('visit-at') || 0);
  const countVisit = counting && Date.now() - lastVisit > DAY;
  call(countVisit ? 'hit' : 'get', 'visits').then((v) => {
    if (countVisit) store.set('visit-at', String(Date.now()));
    visitorCount.textContent = fmt(v + VISITS_BASE);
    visitorsEl.hidden = false;
  }).catch(() => {});

  call('get', 'hellos').then((v) => {
    helloCount.textContent = fmt(v);
    helloCount.hidden = false;
  }).catch(() => {});

  if (helloBtn) helloBtn.addEventListener('click', () => {
    if (!counting || store.get('hello-sent')) return;
    store.set('hello-sent', '1');
    call('hit', 'hellos').then((v) => { helloCount.textContent = fmt(v); helloCount.hidden = false; }).catch(() => store.set('hello-sent', ''));
  });
});
