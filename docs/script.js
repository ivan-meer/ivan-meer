// ── Shared JS for ivan-meer.github.io/ivan-meer/ ──

// Nav border & hide on scroll
(function() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  let lastScroll = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.style.borderBottomColor = y > 20 ? 'oklch(26% 0.014 265)' : 'transparent';
    if (y > lastScroll && y > 200) nav.classList.add('hidden');
    else nav.classList.remove('hidden');
    lastScroll = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Scroll reveals
(function() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (!els.length) return;
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(26px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)';
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
})();

// Accordion
(function() {
  document.querySelectorAll('[data-acc]').forEach((acc, i) => {
    const head = acc.querySelector('[data-acc-head]');
    const body = acc.querySelector('[data-acc-body]');
    const icon = acc.querySelector('[data-acc-icon]');
    if (!head || !body) return;
    const set = open => {
      body.style.gridTemplateRows = open ? '1fr' : '0fr';
      if (icon) { icon.style.transform = open ? 'rotate(45deg)' : 'none'; icon.style.color = open ? 'var(--ac)' : 'oklch(66% 0.012 265)'; }
      acc.dataset.open = open ? '1' : '';
    };
    if (i === 0) set(true);
    head.addEventListener('click', () => set(!acc.dataset.open));
  });
})();

// Magnetic buttons
(function() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  document.querySelectorAll('[data-magnet]').forEach(btn => {
    const mv = e => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.12}px, ${dy * 0.18}px)`;
    };
    const out = () => { btn.style.transform = 'none'; };
    btn.addEventListener('mousemove', mv);
    btn.addEventListener('mouseleave', out);
  });
})();

// FAQ rotate icons
(function() {
  document.querySelectorAll('.faq-item').forEach(d => {
    const mark = d.querySelector('.faq-icon');
    if (!mark) return;
    const h = () => { mark.style.transform = d.open ? 'rotate(45deg)' : 'none'; };
    d.addEventListener('toggle', h);
  });
})();

// Orchestra canvas
(function() {
  const cv = document.querySelector('canvas.orchestra');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: -9999, y: -9999 };
  cv.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  const nodes = [
    { x: 0.5, y: 0.5, r: 26, label: 'ORCH', core: true },
    { x: 0.18, y: 0.28, r: 15, label: 'AGENT-01' },
    { x: 0.3, y: 0.72, r: 15, label: 'AGENT-02' },
    { x: 0.12, y: 0.52, r: 12, label: 'AGENT-03' },
    { x: 0.72, y: 0.24, r: 16, label: 'MEM / RAG' },
    { x: 0.86, y: 0.5, r: 14, label: 'MCP' },
    { x: 0.74, y: 0.76, r: 14, label: 'MODEL' },
    { x: 0.92, y: 0.22, r: 9, label: 'CRM' },
    { x: 0.95, y: 0.68, r: 9, label: 'DB' },
    { x: 0.4, y: 0.16, r: 10, label: 'UI' }
  ];
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[4,5],[5,7],[5,8],[0,9],[6,4],[1,9]];
  const pulses = edges.map((e, i) => ({ e, t: (i * 0.37) % 1, sp: 0.0022 + (i % 4) * 0.0007 }));
  let time = 0;

  const hue = 128;
  const acColor = `oklch(88% 0.19 ${hue})`;

  function draw() {
    time += 1;
    ctx.clearRect(0, 0, W, H);
    nodes.forEach((n, i) => {
      let bx = n.x * W + Math.sin(time * 0.008 + i * 1.7) * 7;
      let by = n.y * H + Math.cos(time * 0.007 + i * 2.3) * 7;
      const dx = bx - mouse.x, dy = by - mouse.y, d = Math.hypot(dx, dy);
      if (d < 140 && d > 0.01) { const f = (140 - d) / 140 * 24; bx += dx / d * f; by += dy / d * f; }
      n.bx = bx; n.by = by;
    });
    ctx.lineWidth = 1;
    edges.forEach(([a, b]) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.09)';
      ctx.beginPath(); ctx.moveTo(nodes[a].bx, nodes[a].by); ctx.lineTo(nodes[b].bx, nodes[b].by); ctx.stroke();
    });
    if (!reduced) pulses.forEach(p => {
      p.t = (p.t + p.sp) % 1;
      const [a, b] = p.e;
      const x = nodes[a].bx + (nodes[b].bx - nodes[a].bx) * p.t;
      const y = nodes[a].by + (nodes[b].by - nodes[a].by) * p.t;
      ctx.fillStyle = acColor;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.font = '10.5px "JetBrains Mono", monospace';
    nodes.forEach(n => {
      ctx.strokeStyle = n.core ? acColor : 'rgba(255,255,255,0.3)';
      ctx.fillStyle = 'oklch(14.5% 0.012 265)';
      ctx.lineWidth = n.core ? 1.5 : 1;
      ctx.beginPath(); ctx.arc(n.bx, n.by, n.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (n.core) {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.arc(n.bx, n.by, n.r + 6 + Math.sin(time * 0.05) * 2.5, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = n.core ? acColor : 'oklch(60% 0.012 265)';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.bx, n.by + n.r + 16);
    });
    if (!reduced) requestAnimationFrame(draw);
  }
  draw();
})();
