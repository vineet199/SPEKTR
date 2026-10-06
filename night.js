/* ============================================================
   NIGHT PROTOCOL — elaborate cinematic upgrade (JS)
   Drives three staggered headlight sweeps (each paired with a
   travelling lens flare + a flashed speed-streak at peak), a slow
   parallax bokeh field, and progressive "energy flow" activation
   of the reflective piping as sweeps pass over it.
   ============================================================ */
(function () {
  'use strict';
  const C = window.Cine;
  if (!C) return;

  const section = document.querySelector('.night');
  if (!section) return;
  const sweep   = section.querySelector('.night-sweep');
  const sweep2  = section.querySelector('.night-sweep2');
  const sweep3  = section.querySelector('.night-sweep3');
  const flare1  = section.querySelector('.night-flare-1');
  const flare2  = section.querySelector('.night-flare-2');
  const flare3  = section.querySelector('.night-flare-3');
  const streaks = [...section.querySelectorAll('.night-streak')];
  const shade   = section.querySelector('.night-shade');
  const piping  = section.querySelector('.night-piping');
  const hud     = section.querySelector('.night-hud b');
  const hudExtra = section.querySelector('.night-hud-extra b');
  const bokehWrap = section.querySelector('.night-bokeh');

  /* ---- parallax bokeh field: generated once, drifts with scroll ---- */
  const bokehDots = [];
  if (bokehWrap && !C.noMot()) {
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      const size = 6 + Math.random() * 22;
      s.style.width = size + 'px'; s.style.height = size + 'px';
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (10 + Math.random() * 80) + '%';
      s.style.opacity = (0.15 + Math.random() * 0.4).toFixed(2);
      bokehWrap.appendChild(s);
      bokehDots.push({ el: s, speed: 20 + Math.random() * 60 });
    }
  }

  let sweepCount = 0;
  function pulseStreak (el) {
    if (!el || C.noMot()) return;
    el.style.top = (20 + Math.random() * 60) + '%';
    C.flash(el, 220);
  }
  function registerSweepPass () {
    sweepCount++;
    if (hudExtra) hudExtra.textContent = '+' + (sweepCount * 34) + 'M';
  }

  if (C.hasST && !C.noMot() && C.isWide() && sweep) {
    C.whenSettled(() => {
      const tl = gsap.timeline();
      // Three staggered sweeps across the pin's scrub range, each with its
      // own flare that tracks the light source.
      tl.fromTo(sweep,  { xPercent: -20 }, { xPercent: 520, duration: 1, ease: 'none' }, 0);
      tl.fromTo(sweep2, { xPercent: -20, opacity: 0 }, { xPercent: 520, opacity: 1, duration: 0.75, ease: 'none' }, 0.15);
      tl.to(sweep2, { opacity: 0, duration: 0.1 }, 0.85);
      tl.fromTo(sweep3, { xPercent: -20, opacity: 0 }, { xPercent: 520, opacity: 1, duration: 0.6, ease: 'none' }, 0.4);
      tl.to(sweep3, { opacity: 0, duration: 0.1 }, 0.95);

      if (flare1) tl.fromTo(flare1, { xPercent: -20, opacity: 0 }, { xPercent: 520, opacity: 1, duration: 1, ease: 'none' }, 0);
      if (flare2) tl.fromTo(flare2, { xPercent: -20, opacity: 0 }, { xPercent: 520, opacity: 0.8, duration: 0.75, ease: 'none' }, 0.15);
      if (flare3) tl.fromTo(flare3, { xPercent: -20, opacity: 0 }, { xPercent: 520, opacity: 0.7, duration: 0.6, ease: 'none' }, 0.4);

      tl.to(shade, { backgroundColor: 'rgba(0,0,0,.68)', duration: 1, ease: 'none' }, 0);

      let fired = { s1: false, s2: false, s3: false };
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=160%',
        pin: true,
        pinType: 'transform',
        anticipatePin: 1,
        scrub: 1,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate (self) {
          const p = self.progress;
          const lit = p > 0.1;
          if (piping) piping.classList.toggle('is-lit', lit);
          if (hud) hud.textContent = p >= 0.98 ? 'ACTIVE' : (p > 0.05 ? 'SWEEPING' : 'STANDBY');

          if (!fired.s1 && p > 0.5)  { fired.s1 = true; pulseStreak(streaks[0]); registerSweepPass(); }
          if (!fired.s2 && p > 0.62) { fired.s2 = true; pulseStreak(streaks[1]); registerSweepPass(); }
          if (!fired.s3 && p > 0.72) { fired.s3 = true; pulseStreak(streaks[2]); registerSweepPass(); }
          if (p < 0.4) fired = { s1: false, s2: false, s3: false }; // allow re-trigger scrolling back up then down

          bokehDots.forEach(d => { d.el.style.transform = `translateX(${-(p * d.speed)}px)`; });
        },
      });
    });
  } else if (!C.noMot()) {
    // Mobile: one-shot reveal on scroll-into-view, no scroll-jacking
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        if (piping) piping.classList.add('is-lit');
        if (hud) hud.textContent = 'ACTIVE';
        if (hudExtra) hudExtra.textContent = '+150M';
        obs.unobserve(e.target);
      });
    }, { threshold: 0.4 }).observe(section);
  } else if (piping) {
    piping.classList.add('is-lit');
  }
})();
