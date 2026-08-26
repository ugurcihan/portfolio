document.addEventListener('DOMContentLoaded', () => {
  const nameEl = document.getElementById('bbdName');
  const decor = document.getElementById('bbdDecor');
  if (!nameEl || !decor) return;

  const ASSETS_BASE = 'https://cdn.jsdelivr.net/gh/gughigug/broken-by-design-assets@main';
  const ATLAS_URL = `${ASSETS_BASE}/atlas-desktop.png`;
  const ATLAS_SIZE = { w: 900, h: 2807 };
  const PIECES = [
    { id: 'd01a', x: 80.214, y: 5.299, w: 15.445, h: 72.943, ring: 2 },
    { id: 'd01b', x: 92.39, y: 31.004, w: 6.144, h: 52.762, ring: 2 },
    { id: 'd02a', x: 31.285, y: 7.44, w: 15.614, h: 40.023, ring: 1 },
    { id: 'd02b', x: 5.073, y: 6.313, w: 31.567, h: 39.572, ring: 1 },
    { id: 'd02c', x: 4.791, y: 9.808, w: 19.786, h: 25.93, ring: 1 },
    { id: 'd03a', x: 18.771, y: 38.444, w: 28.636, h: 52.649, ring: 1 },
    { id: 'd03b', x: 4.735, y: 35.964, w: 15.558, h: 11.612, ring: 1 },
    { id: 'd03c', x: 3.044, y: 46.111, w: 26.719, h: 45.547, ring: 1 },
    { id: 'd04a', x: 42.785, y: 7.892, w: 25.536, h: 36.077, ring: 0 },
    { id: 'd04b', x: 50.057, y: 7.554, w: 34.16, h: 29.876, ring: 0 },
    { id: 'd05a', x: 37.655, y: 46.786, w: 14.149, h: 18.489, ring: 0 },
    { id: 'd05b', x: 46.11, y: 37.88, w: 34.611, h: 26.945, ring: 0 },
    { id: 'd06a', x: 44.645, y: 68.659, w: 32.694, h: 24.464, ring: 0 },
    { id: 'd06b', x: 47.238, y: 66.404, w: 26.945, h: 12.852, ring: 0 },
    { id: 'd07a', x: 74.972, y: 57.61, w: 12.12, h: 34.498, ring: 2 },
    { id: 'd07b', x: 84.273, y: 66.855, w: 10.654, h: 25.028, ring: 2 },
  ];
  const ATLAS_RECTS = {
    d01a: [2,2,274,647], d01b: [278,2,109,468], d02a: [478,651,277,355], d02b: [2,1057,560,351],
    d02c: [2,2240,351,230], d03a: [389,2,508,467], d03b: [482,2691,276,103], d03c: [2,651,474,404],
    d04a: [2,1410,453,320], d04b: [2,1732,606,265], d05a: [584,2472,251,164], d05b: [2,1999,614,239],
    d06a: [2,2472,580,217], d06b: [2,2691,478,114], d07a: [457,1410,215,306], d07b: [355,2240,189,222],
  };
  const CRACKS = { w: 1774, h: 887,
    main: ["M1616 807L1432 812L1402 805L1397 797L1385 790","M769 404L812 402L1359 327L1381 321","M1381 321L1390 300L1443 241L1467 231","M1381 321L1386 326L1410 329L1435 338","M695 402L701 391L724 374L747 365","M656 484L629 473L611 455L604 434","M1436 339L1436 379L1428 438L1404 489","M1122 817L1135 817","M832 590L835 587L854 586L895 587","M657 484L660 481L664 443L670 430","M696 403L706 403L708 408","M75 501L89 329L102 318L124 310L136 298","M1318 543L1321 583","M110 765L78 711","M918 817L1014 817","M62 661L66 629","M852 646L846 640L832 591","M129 61L814 67L842 90","M173 805L720 807L735 803L756 778L777 770","M819 816L809 814L789 801L783 775L778 770","M1174 818L1331 818","M853 646L870 639L888 615L895 588","M834 816L877 816","M1667 796L1681 773L1688 750","M748 365L762 385L768 403","M1436 338L1442 331L1467 265L1470 237","M94 267L87 239L92 100","M1320 584L1283 582L1274 573","M1403 490L1358 504L1331 525L1318 542","M1689 749L1716 741L1729 732","M1273 572L910 581L896 587","M1274 571L1293 550L1317 543","M696 420L763 409L768 404","M1673 115L1674 131","M1621 806L1640 806","M75 503L66 597L66 628","M1508 127L1500 119L1497 105L1487 86L1480 79L1465 75L1286 69L884 64L867 68L853 84L842 90","M1508 127L1527 115L1541 80L1556 63L1579 56L1633 54","M1508 127L1502 152L1468 230","M778 769L781 757L843 671L852 647","M1675 133L1736 671","M1404 490L1434 526L1688 749","M1384 789L1380 759L1321 585","M604 433L608 429L664 429","M1383 790L1370 806L1341 818","M842 90L835 131L753 337L748 364","M95 268L112 280L125 284L136 298","M831 590L819 587L685 518L664 502L657 485","M688 418L694 403","M136 298L494 342L510 351L603 433","M687 419L670 430"],
    fine: ["M82 502L76 502","M1468 231L1469 236","M1653 60L1665 71","M94 268L88 272","M1671 98L1671 103","M63 685L66 691","M1039 817L1029 817","M664 430L652 442","M1457 249L1468 237","M696 418L705 409","M665 430L670 430","M93 97L93 93","M1737 680L1737 675","M1672 111L1672 106","M61 666L61 674","M688 419L695 419","M1670 89L1670 93","M117 777L111 767","M1738 689L1738 684","M93 85L93 89","M1739 697L1739 692"],
  };
  const BASE_POSE = { d05a: { rx: 3.2, ry: -4.6, tz: 12 }, d07b: { rx: -2.4, ry: 3.8, tz: 8 } };

  function jitter(seed) {
    const r = (n) => { const s = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453; return s - Math.floor(s); };
    return { tx: (r(1) - 0.5) * 6, ty: (r(2) - 0.5) * 4, rot: (r(3) - 0.5) * 1.6 };
  }
  function baseOf(id, seed) {
    const r = (n) => { const s = Math.sin(seed * 91.7 + n * 269.5) * 43758.5453; return s - Math.floor(s); };
    return { rx: (r(1) - 0.5) * 3, ry: (r(2) - 0.5) * 3.6, tz: r(3) * 8, px: 0, py: 0, sc: 1, ...(BASE_POSE[id] || {}) };
  }
  function toTransform(s) {
    return `translate3d(${s.px.toFixed(2)}px, ${s.py.toFixed(2)}px, ${s.tz.toFixed(2)}px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg) scale(${s.sc.toFixed(4)})`;
  }
  function spriteStyle(id) {
    const rect = ATLAS_RECTS[id];
    const sx = rect[0], sy = rect[1], fw = rect[2], fh = rect[3];
    const sizeX = (ATLAS_SIZE.w / fw) * 100, sizeY = (ATLAS_SIZE.h / fh) * 100;
    const posX = ATLAS_SIZE.w > fw ? (sx / (ATLAS_SIZE.w - fw)) * 100 : 0;
    const posY = ATLAS_SIZE.h > fh ? (sy / (ATLAS_SIZE.h - fh)) * 100 : 0;
    return { size: sizeX.toFixed(3) + '% ' + sizeY.toFixed(3) + '%', pos: posX.toFixed(3) + '% ' + posY.toFixed(3) + '%' };
  }

  function buildDecor() {
    const cracksSVG = `<svg class="bbd2-cracks" viewBox="0 0 ${CRACKS.w} ${CRACKS.h}" preserveAspectRatio="none">`
      + `<g class="bbd2-cracks-glow">${CRACKS.main.map((d) => `<path d="${d}"/>`).join('')}</g>`
      + `<g class="bbd2-cracks-line">${CRACKS.main.map((d) => `<path d="${d}"/>`).join('')}</g>`
      + `<g class="bbd2-cracks-fine">${CRACKS.fine.map((d) => `<path d="${d}"/>`).join('')}</g>`
      + `</svg>`;
    const shardsHTML = PIECES.map((p) => {
      const sprite = spriteStyle(p.id);
      const sliceStyle = `width:${10000 / p.w}%;height:${10000 / p.h}%;left:${-(p.x / p.w) * 100}%;top:${-(p.y / p.h) * 100}%`;
      return `<div data-shard data-id="${p.id}" class="bbd2-shard" style="left:${p.x}%;top:${p.y}%;width:${p.w}%;height:${p.h}%;z-index:${10 + (2 - p.ring)}">`
        + `<div class="bbd2-inlay" style="-webkit-mask-image:url(${ATLAS_URL});mask-image:url(${ATLAS_URL});-webkit-mask-size:${sprite.size};mask-size:${sprite.size};-webkit-mask-position:${sprite.pos};mask-position:${sprite.pos}">`
        + `<div class="bbd2-glassimg" style="background-image:url(${ATLAS_URL});background-size:${sprite.size};background-position:${sprite.pos}"></div>`
        + `<span class="bbd2-slice" style="${sliceStyle}">Ugur Cihan Cekic</span>`
        + `<div class="bbd2-specular"></div>`
        + `</div></div>`;
    }).join('');
    decor.innerHTML = cracksSVG + `<div class="bbd2-pane">${shardsHTML}</div>`;
    PIECES.forEach((p, i) => {
      const j = jitter(i + 1);
      const slice = decor.querySelector(`[data-id="${p.id}"] .bbd2-slice`);
      if (slice) slice.style.setProperty('--jt', `translate(${j.tx.toFixed(1)}px, ${j.ty.toFixed(1)}px) rotate(${j.rot.toFixed(2)}deg)`);
    });
  }

  function wireInteractions() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shards = Array.from(decor.querySelectorAll('[data-shard]'));
    shards.forEach((el, i) => { el.style.transform = toTransform(baseOf(PIECES[i].id, i + 1)); });

    if (!reduced) {
      shards.forEach((el, i) => {
        const rest = toTransform(baseOf(PIECES[i].id, i + 1));
        el.animate([
          { opacity: 0, transform: 'translate3d(0,0,90px) scale(1.08)', filter: 'brightness(1.8) blur(1.5px)' },
          { opacity: 1, transform: rest, filter: 'brightness(1) blur(0px)', offset: 0.72 },
          { opacity: 1, transform: rest, filter: 'none' },
        ], { duration: 900, delay: 120, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      });
    }

    if (reduced) return;

    const cur = shards.map((_, i) => baseOf(PIECES[i].id, i + 1));
    const tgt = shards.map((_, i) => baseOf(PIECES[i].id, i + 1));
    const hovered = new Set();
    let raf = 0, running = false;

    function wake() { if (!running) { running = true; raf = requestAnimationFrame(tick); } }
    function tick() {
      let alive = false; const k = 0.14;
      for (let i = 0; i < shards.length; i++) {
        const c = cur[i], t = tgt[i];
        c.rx += (t.rx - c.rx) * k; c.ry += (t.ry - c.ry) * k; c.tz += (t.tz - c.tz) * k;
        c.px += (t.px - c.px) * k; c.py += (t.py - c.py) * k; c.sc += (t.sc - c.sc) * k;
        const d = Math.abs(t.rx - c.rx) + Math.abs(t.ry - c.ry) + Math.abs(t.tz - c.tz) + Math.abs(t.px - c.px) + Math.abs(t.py - c.py);
        if (d > 0.01) alive = true;
        shards[i].style.transform = toTransform(c);
      }
      if (alive) raf = requestAnimationFrame(tick); else running = false;
    }

    shards.forEach((el, i) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const lx = (e.clientX - r.left) / r.width - 0.5, ly = (e.clientY - r.top) / r.height - 0.5;
        const b = baseOf(PIECES[i].id, i + 1);
        tgt[i].rx = b.rx - ly * 10; tgt[i].ry = b.ry + lx * 12; tgt[i].tz = b.tz + 32; tgt[i].sc = 1.02;
        el.style.setProperty('--mx', `${((lx + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${((ly + 0.5) * 100).toFixed(1)}%`);
        wake();
      });
      el.addEventListener('pointerenter', () => { hovered.add(i); el.classList.add('bbd2-shard--hot'); });
      el.addEventListener('pointerleave', () => {
        hovered.delete(i); el.classList.remove('bbd2-shard--hot');
        Object.assign(tgt[i], baseOf(PIECES[i].id, i + 1)); wake();
      });
    });
  }

  const probe = new Image();
  probe.onload = probe.onerror = () => { buildDecor(); wireInteractions(); };
  probe.src = ATLAS_URL;
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
