/* ============================================================
   REDLINE — sound-reactive waveform + rev-counter cinematic (JS)
   Scroll-scrubbed: a canvas waveform grows more violent as
   progress climbs, an RPM gauge needle sweeps toward redline, a
   digital counter ticks up, background shifts blue->red, and
   crossing into the redline zone (rpm >= 9200) fires a flash +
   shake + streak burst.
   ============================================================ */
(function () {
  'use strict';
  const C = window.Cine;
  if (!C) return;

  const section = document.querySelector('.redline');
  if (!section) return;
  const pin      = section.querySelector('.redline-pin');
  const canvas   = section.querySelector('.redline-wave');
  const rpmEl    = section.querySelector('.rl-rpm');
  const needle   = section.querySelector('.rl-gauge .g-needle');
  const flashEl  = section.querySelector('.cine-flash');
  const streaksWrap = section.querySelector('.redline-streaks');
  if (!canvas) return;

  const MAX_RPM = 11000, REDLINE_AT = 9200;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize () {
    const r = canvas.getBoundingClientRect();
    W = canvas.width  = r.width * dpr;
    H = canvas.height = r.height * dpr;
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  // pre-build a handful of streak divs so we're not creating DOM every frame
  const streakEls = [];
  if (streaksWrap) {
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('div');
      s.className = 'rl-streak';
      s.style.top = (Math.random() * 100) + '%';
      s.style.width = '0';
      streaksWrap.appendChild(s);
      streakEls.push(s);
    }
  }

  let phase = 0, curProgress = 0, rafId = null, running = false;
  function drawWave () {
    ctx.clearRect(0, 0, W, H);
    const bars = 64;
    const bw = W / bars;
    const intensity = 0.15 + curProgress * 0.85; // calmer at rest, violent near redline
    const isRed = curProgress > (REDLINE_AT / MAX_RPM);
    ctx.fillStyle = isRed ? 'rgba(215,43,43,.9)' : 'rgba(255,255,255,.75)';
    for (let i = 0; i < bars; i++) {
      const n = Math.sin(i * 0.7 + phase) * 0.5 + Math.sin(i * 0.31 - phase * 1.7) * 0.5;
      const h = Math.max(2 * dpr, Math.abs(n) * H * 0.5 * intensity + (Math.random() * 6 * intensity * dpr));
      const x = i * bw;
      ctx.fillRect(x, (H - h) / 2, Math.max(1, bw - 2 * dpr), h);
    }
    phase += 0.12 + curProgress * 0.35;
    if (running) rafId = requestAnimationFrame(drawWave);
  }
  function start () { if (!running) { running = true; rafId = requestAnimationFrame(drawWave); } }
  function stop  () { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }
  new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? start() : stop());
  }, { threshold: 0.05 }).observe(section);

  function fireStreaks () {
    if (C.noMot()) return;
    streakEls.forEach((s, i) => {
      setTimeout(() => {
        s.style.top = (Math.random() * 100) + '%';
        s.style.width = (40 + Math.random() * 50) + '%';
        C.flash(s, 260);
      }, i * 28);
    });
  }

  let hasHitRedline = false;
  function onUpdate (p) {
    curProgress = p;
    const rpm = Math.round((p * MAX_RPM) / 100) * 100;
    if (rpmEl) {
      rpmEl.textContent = String(rpm).padStart(5, '0');
      rpmEl.classList.toggle('is-red', rpm >= REDLINE_AT);
    }
    if (needle) needle.style.transform = `rotate(${(-90 + p * 180).toFixed(1)}deg)`;
    if (pin) {
      const hue = 210 - p * 210; // 210 (blue) -> 0 (red)
      pin.style.backgroundColor = `hsl(${hue.toFixed(0)}, 45%, ${(4 + p * 3).toFixed(0)}%)`;
    }
    if (rpm >= REDLINE_AT && !hasHitRedline) {
      hasHitRedline = true;
      C.flash(flashEl, 300);
      C.shake(pin);
      fireStreaks();
    } else if (rpm < REDLINE_AT - 400) {
      hasHitRedline = false; // allow re-trigger scrolling back up then down
    }
  }
  onUpdate(0);

  if (C.hasST && !C.noMot() && C.isWide()) {
    C.whenSettled(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=180%',
        pin: true,
        pinType: 'transform',
        anticipatePin: 1,
        scrub: 0.7,
        invalidateOnRefresh: true,
        onUpdate (self) { onUpdate(self.progress); },
      });
    });
  } else if (!C.noMot()) {
    // Mobile: gentle auto-rev loop while in view, no scroll-jacking
    let dir = 1, p = 0;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!obs._t) obs._t = setInterval(() => {
            p += dir * 0.045;
            if (p >= 1) { p = 1; dir = -1; }
            if (p <= 0) { p = 0; dir = 1; }
            onUpdate(p);
          }, 120);
        } else if (obs._t) { clearInterval(obs._t); obs._t = null; }
      });
    }, { threshold: 0.3 });
    obs.observe(section);
  }
})();
