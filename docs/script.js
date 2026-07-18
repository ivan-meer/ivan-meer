// ── Ivan Meer — shared JS ──
// Progressive enhancement: page is fully readable without any of this.

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Nav border on scroll ──
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ── Reveal on scroll (varied, per data-reveal) ──
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  if (REDUCED) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
})();

// ── Hero headline line-mask reveal ──
(function () {
  const lines = document.querySelectorAll('.mask-line');
  if (!lines.length) return;
  if (REDUCED) { lines.forEach(l => l.classList.add('in')); return; }
  lines.forEach((l, i) => {
    l.querySelector('span').style.transitionDelay = `${0.08 + i * 0.09}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => l.classList.add('in')));
  });
})();

// ── Layers accordion (home stack diagram) ──
(function () {
  const layers = document.querySelectorAll('.layer');
  if (!layers.length) return;
  layers.forEach(layer => {
    const head = layer.querySelector('.layer-head');
    head.addEventListener('click', () => {
      const isOpen = layer.classList.contains('open');
      layers.forEach(l => {
        l.classList.remove('open');
        l.querySelector('.layer-head').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        layer.classList.add('open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

// ── Orchestration graph (hero canvas) ──
// A layered DAG: nodes are agents/services, vermilion pulses travel the
// edges. Static single render under prefers-reduced-motion.
(function () {
  const canvas = document.getElementById('orchestra');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;

  const css = getComputedStyle(document.documentElement);
  const INK = css.getPropertyValue('--ink-3').trim() || '#7a7a85';
  const LINE = css.getPropertyValue('--line').trim() || '#d4d4da';
  const ACCENT = css.getPropertyValue('--accent').trim() || '#e05a2b';

  let W = 0, H = 0, dpr = 1;
  let nodes = [], edges = [], pulses = [];
  const mouse = { x: -1e4, y: -1e4 };

  // ponytail: fixed 4-column DAG, no physics — enough for a hero motif
  function build() {
    nodes = []; edges = [];
    const cols = 4;
    const rows = [3, 4, 3, 2];
    const padX = W * 0.08, padY = H * 0.1;
    const seeded = (i, j) => {
      // deterministic jitter so layout is stable between resizes
      const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows[c]; r++) {
        nodes.push({
          x: padX + (W - padX * 2) * (c / (cols - 1)) + (seeded(c, r) - 0.5) * W * 0.05,
          y: padY + (H - padY * 2) * (rows[c] === 1 ? 0.5 : r / (rows[c] - 1)) + (seeded(r, c) - 0.5) * H * 0.06,
          col: c,
          rr: 3 + seeded(c, r + 9) * 2.5,
        });
      }
    }
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (b.col === a.col + 1 && Math.abs(a.y - b.y) < H * 0.6) {
          if (seeded(i, j) > 0.35) edges.push([i, j]);
        }
      });
    });
    // guarantee every node is connected
    nodes.forEach((n, i) => {
      if (n.col < cols - 1 && !edges.some(e => e[0] === i)) {
        let best = -1, bd = 1e9;
        nodes.forEach((m, j) => {
          if (m.col === n.col + 1) { const d = Math.abs(m.y - n.y); if (d < bd) { bd = d; best = j; } }
        });
        if (best >= 0) edges.push([i, best]);
      }
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = wrap.clientWidth; H = wrap.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (REDUCED) draw(0);
  }

  function spawnPulse() {
    // cap + hidden-tab guard: rAF pauses draw, so unbounded spawns would
    // burst all at once when the tab returns
    if (!edges.length || document.hidden || pulses.length > 24) return;
    pulses.push({ edge: edges[(Math.random() * edges.length) | 0], t: 0, speed: 0.004 + Math.random() * 0.006 });
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    ctx.lineWidth = 1;
    edges.forEach(([a, b]) => {
      const na = nodes[a], nb = nodes[b];
      ctx.strokeStyle = LINE;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      const mx = (na.x + nb.x) / 2;
      ctx.bezierCurveTo(mx, na.y, mx, nb.y, nb.x, nb.y);
      ctx.stroke();
    });

    pulses = pulses.filter(p => p.t <= 1);
    pulses.forEach(p => {
      p.t += p.speed;
      const na = nodes[p.edge[0]], nb = nodes[p.edge[1]];
      const mx = (na.x + nb.x) / 2;
      const t = p.t, u = 1 - t;
      // cubic bezier point (same control points as the stroke)
      const x = u * u * u * na.x + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * nb.x;
      const y = u * u * u * na.y + 3 * u * u * t * na.y + 3 * u * t * t * nb.y + t * t * t * nb.y;
      ctx.fillStyle = ACCENT;
      ctx.globalAlpha = Math.sin(p.t * Math.PI);
      ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });

    nodes.forEach(n => {
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const near = Math.max(0, 1 - Math.hypot(dx, dy) / 120);
      const wob = REDUCED ? 0 : Math.sin(now / 900 + n.x) * 1.2;
      ctx.fillStyle = near > 0.05 ? ACCENT : INK;
      ctx.beginPath();
      ctx.arc(n.x, n.y + wob, n.rr + near * 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  let raf;
  function loop(now) {
    draw(now);
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });

  resize();
  if (!REDUCED) {
    setInterval(spawnPulse, 420);
    // pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(loop);
    });
    raf = requestAnimationFrame(loop);
  }
})();
