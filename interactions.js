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

  function closeMenu() {
    toggle.classList.remove('open');
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
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
  let spriteReady = false;
  let frameW = 0, frameH = 0;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  sprite.src = canvas.dataset.sprite;

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
