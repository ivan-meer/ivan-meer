// ── Shared JS for ivan-meer.github.io/ivan-meer/ ──

// Particles
(function() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const particles = [];
  let mouse = { x: -1000, y: -1000 };

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.size = Math.random() * 1.5 + 0.5;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; }
    }
    draw() {
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const glow = Math.max(0, 1 - Math.sqrt(dx*dx+dy*dy) / 200);
      ctx.fillStyle = `rgba(0, 229, 255, ${this.opacity + glow * 0.4})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size + glow * 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  for (let i = 0; i < 60; i++) particles.push(new Particle());

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 120) { ctx.strokeStyle = `rgba(0, 229, 255, ${(1 - dist / 120) * 0.06})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

// Scroll reveal
(function() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => { if (entry.isIntersecting) { setTimeout(() => entry.target.classList.add('visible'), i * 50); observer.unobserve(entry.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => observer.observe(el));
})();

// Nav hide on scroll
(function() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 200) nav.classList.add('hidden');
    else nav.classList.remove('hidden');
    lastScroll = current;
  });
})();

// Focus cards mouse glow
(function() {
  document.querySelectorAll('.focus-card').forEach(card => {
    card.addEventListener('mousemove', e => { const rect = card.getBoundingClientRect(); card.style.setProperty('--mx', `${e.clientX - rect.left}px`); card.style.setProperty('--my', `${e.clientY - rect.top}px`); });
  });
})();

// Hero card tilt
(function() {
  const heroCard = document.getElementById('hero-card');
  if (!heroCard) return;
  document.addEventListener('mousemove', e => {
    const rect = heroCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (Math.abs(x) < 0.6 && Math.abs(y) < 0.6) heroCard.style.transform = `rotateY(${x * 16 - 8}deg) rotateX(${-y * 12 + 4}deg)`;
  });
})();
