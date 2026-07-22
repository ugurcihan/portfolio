document.getElementById('year').textContent = new Date().getFullYear();

// Typing effect for terminal lines
const typeLines = document.querySelectorAll('.type-line');
let delay = 300;
typeLines.forEach((el) => {
  const text = el.dataset.text;
  let i = 0;
  setTimeout(function tick() {
    el.textContent = text.slice(0, i);
    i++;
    if (i <= text.length) {
      setTimeout(tick, 55);
    }
  }, delay);
  delay += text.length * 55 + 500;
});

// Falling binary / code glyph background
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let w, h, columns, drops;
const glyphs = '01</>{}[]#$_'.split('');

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  columns = Math.floor(w / 22);
  drops = new Array(columns).fill(0).map(() => Math.random() * -100);
}
window.addEventListener('resize', resize);
resize();

function draw() {
  ctx.fillStyle = 'rgba(6,7,13,0.06)';
  ctx.fillRect(0, 0, w, h);
  ctx.font = '14px JetBrains Mono, monospace';

  for (let i = 0; i < columns; i++) {
    const text = glyphs[Math.floor(Math.random() * glyphs.length)];
    const x = i * 22;
    const y = drops[i] * 22;
    const grad = ctx.createLinearGradient(0, y - 20, 0, y);
    grad.addColorStop(0, 'rgba(77,216,255,0)');
    grad.addColorStop(1, 'rgba(155,107,255,0.55)');
    ctx.fillStyle = grad;
    ctx.fillText(text, x, y);

    if (y > h && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
  requestAnimationFrame(draw);
}
draw();

// Reveal on scroll
const revealTargets = document.querySelectorAll('.project-card, .mini-card, .stack-item');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  io.observe(el);
});
