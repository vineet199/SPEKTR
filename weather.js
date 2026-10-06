/* ============================================================
   WEATHER LAB — elaborate cinematic upgrade (JS)
   Rain zone gets random lightning strobes; heat zone gets a
   shimmer-distortion overlay + rising fog + camera micro-shake;
   frost zone gets a corner ice-creep overlay + sideways wind-gust
   particle bursts. A semicircle gauge needle sweeps with the
   temperature and a 3-segment "torture meter" fills cumulatively.
   ============================================================ */
(function () {
  'use strict';
  const C = window.Cine;
  if (!C) return;

  const section = document.querySelector('.weather');
  if (!section) return;
  const stage      = section.querySelector('.wthr-stage');
  const stageInner = section.querySelector('.wthr-stage-inner');
  const canvas   = section.querySelector('.wthr-canvas');
  const condEl   = section.querySelector('.wthr-cond');
  const tempEl   = section.querySelector('.wthr-temp');
  const humEl    = section.querySelector('.wthr-hum');
  const lightning = section.querySelector('.wthr-lightning');
  const shimmer  = section.querySelector('.wthr-shimmer');
  const fog      = section.querySelector('.wthr-fog');
  const frost    = section.querySelector('.wthr-frost-creep');
  const gaugeFill  = section.querySelector('.wthr-gauge .g-fill');
  const gaugeNeedle = section.querySelector('.wthr-gauge .g-needle');
  const meterSegs = [...section.querySelectorAll('.wthr-meter i')];
  if (!canvas) return;

  const ZONES = [
    { name: 'MONSOON DOWNPOUR', temp: '24°C', tempN: 24,  hum: '96% RH', bg: '#0c1218' },
    { name: 'DESERT HEAT',      temp: '46°C', tempN: 46,  hum: '11% RH', bg: '#160e08' },
    { name: 'ALPINE FROST',     temp: '-9°C', tempN: -9,  hum: '38% RH', bg: '#0a1014' },
  ];
  const GAUGE_MIN = -20, GAUGE_MAX = 55;
  const ARC_LEN = gaugeFill && gaugeFill.getTotalLength ? gaugeFill.getTotalLength() : 132;
  if (gaugeFill) { gaugeFill.style.strokeDasharray = String(ARC_LEN); gaugeFill.style.strokeDashoffset = String(ARC_LEN); }

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

  const N = 90;
  const particles = Array.from({ length: N }, () => ({
    x: Math.random(), y: Math.random(), v: 0.3 + Math.random() * 0.7, s: Math.random(),
  }));
  let zoneIdx = 0, running = false, rafId = null;
  let gustBurst = null, lightningTimer = null, gustTimer = null;

  function drawFrame () {
    ctx.clearRect(0, 0, W, H);
    if (zoneIdx === 0) { // rain — fast diagonal streaks
      ctx.strokeStyle = 'rgba(180,210,255,.55)';
      ctx.lineWidth = 1.4 * dpr;
      particles.forEach(p => {
        p.y += 0.018 * p.v; p.x -= 0.006 * p.v;
        if (p.y > 1) { p.y = -0.05; p.x = Math.random(); }
        const x = p.x * W, y = p.y * H;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10 * dpr, y + 26 * dpr); ctx.stroke();
      });
    } else if (zoneIdx === 1) { // heat — rising shimmer waves
      particles.forEach((p, i) => {
        p.y -= 0.006 * p.v; if (p.y < -0.05) p.y = 1.05;
        const x = (p.x * W) + Math.sin((p.y * 8) + i) * 8 * dpr;
        ctx.beginPath(); ctx.arc(x, p.y * H, 1.6 * dpr, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,150,60,.18)'; ctx.fill();
      });
    } else { // frost — drifting flecks
      ctx.fillStyle = 'rgba(220,240,255,.75)';
      particles.forEach(p => {
        p.y += 0.004 * p.v; p.x += Math.sin(p.y * 6) * 0.0007;
        if (p.y > 1) { p.y = -0.02; p.x = Math.random(); }
        ctx.beginPath(); ctx.arc(p.x * W, p.y * H, (1 + p.s * 1.6) * dpr, 0, Math.PI * 2); ctx.fill();
      });
    }
    if (gustBurst && !gustBurst.step(0.02)) gustBurst = null;
    if (running) rafId = requestAnimationFrame(drawFrame);
  }
  function start () { if (!running) { running = true; rafId = requestAnimationFrame(drawFrame); } }
  function stop  () { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }

  function clearZoneFX () {
    if (shimmer) shimmer.classList.remove('is-on');
    if (fog) fog.classList.remove('is-on');
    if (frost) frost.classList.remove('is-on');
    if (lightningTimer) { clearInterval(lightningTimer); lightningTimer = null; }
    if (gustTimer) { clearInterval(gustTimer); gustTimer = null; }
  }

  function armZoneFX (i) {
    if (C.noMot()) return;
    if (i === 0) {
      lightningTimer = setInterval(() => {
        if (Math.random() < 0.45) { C.flash(lightning, 340 + Math.random() * 200); C.shake(stageInner || stage); }
      }, 1400);
    } else if (i === 1) {
      if (shimmer) shimmer.classList.add('is-on');
      if (fog) fog.classList.add('is-on');
    } else {
      if (frost) frost.classList.add('is-on');
      gustTimer = setInterval(() => {
        gustBurst = C.makeBurst(ctx, W, H, {
          x: -10, y: H * (0.2 + Math.random() * 0.6), n: 14, color: '220,240,255',
          minSpd: 3, maxSpd: 7, upBias: 0, minR: 1, maxR: 2,
        });
        gustBurst.parts.forEach(p => { p.vx = Math.abs(p.vx) + 2; }); // force rightward gust
      }, 2200);
    }
  }

  function setGauge (tempN) {
    const pct = Math.max(0, Math.min(1, (tempN - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)));
    if (gaugeFill) gaugeFill.style.strokeDashoffset = String(ARC_LEN * (1 - pct));
    if (gaugeNeedle) gaugeNeedle.style.transform = `rotate(${(-90 + pct * 180).toFixed(1)}deg)`;
  }

  function applyZone (i, isImpact) {
    zoneIdx = i;
    const z = ZONES[i];
    if (condEl) condEl.textContent = z.name;
    if (tempEl) tempEl.innerHTML = 'TEMP <b>' + z.temp + '</b>';
    if (humEl)  humEl.innerHTML  = 'HUMIDITY <b>' + z.hum + '</b>';
    section.style.backgroundColor = z.bg;
    setGauge(z.tempN);
    meterSegs.forEach((seg, si) => { seg.style.transform = si <= i ? 'scaleX(1)' : 'scaleX(0)'; });
    clearZoneFX();
    armZoneFX(i);
    if (isImpact) C.shake(stageInner || stage);
  }
  applyZone(0, false);

  if (C.noMot()) return; // static first zone only, no particle loop / FX

  if (C.hasST && C.isWide()) {
    C.whenSettled(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=220%',
        pin: '.wthr-stage',
        pinType: 'transform',
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate (self) {
          const idx = Math.min(ZONES.length - 1, Math.floor(self.progress * ZONES.length));
          if (idx !== zoneIdx) applyZone(idx, true);
        },
      });
    });
    new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? start() : stop());
    }, { threshold: 0.05 }).observe(section);
  } else {
    // Mobile: gentle auto-cycle, particle loop only while in view (perf-friendly)
    let i = 0;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          start();
          if (!obs._t) obs._t = setInterval(() => { i = (i + 1) % ZONES.length; applyZone(i, true); }, 2800);
        } else { stop(); if (obs._t) { clearInterval(obs._t); obs._t = null; } }
      });
    }, { threshold: 0.3 });
    obs.observe(section);
  }
})();
