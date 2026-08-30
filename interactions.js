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
  const liveLink = document.getElementById('previewLiveLink');
  const noteEl = document.getElementById('previewNote');
  if (!cards.length || !modal) return;

  let lastFocused = null;

  function openPreview(card) {
    lastFocused = card;
    img.src = card.dataset.preview;
    img.alt = card.dataset.previewTitle + ' — design preview';
    titleEl.textContent = card.dataset.previewTitle;
    const isLive = Boolean(card.dataset.live);
    if (liveLink) {
      liveLink.href = card.dataset.live || '#';
      liveLink.hidden = !isLive;
    }
    // The static note claims "not a live, browsable site" — true for the
    // screenshot-only cards, but actively false for one that has a real
    // data-live URL, so the two must never show at once.
    if (noteEl) noteEl.hidden = isLive;
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
    const base = 'assets/server-bg';
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
  // decode it. Drop hero-sprite.webp next to hero-sprite.jpg to activate —
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
