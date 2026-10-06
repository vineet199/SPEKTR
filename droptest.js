/* ============================================================
   THE DROP TEST — impact / G-force crash-test cinematic (JS)
   Scroll-scrubbed: the suspended item accelerates downward with a
   gravity-eased curve, slams into the deck at progress ~0.55
   (shockwave ring + camera shake + debris burst fire once), the
   G-force readout spikes then settles, and a "PASSED" stamp thumps
   into place as the section finishes.
   ============================================================ */
(function () {
  'use strict';
  const C = window.Cine;
  if (!C) return;

  const section = document.querySelector('.droptest');
  if (!section) return;
  const pin        = section.querySelector('.droptest-pin');
  const item       = section.querySelector('.dt-item');
  const cable      = section.querySelector('.dt-cable');
  const shockwave  = section.querySelector('.dt-shockwave');
  const debrisCv   = section.querySelector('.dt-debris');
  const gforceEl   = section.querySelector('.dt-gforce');
  const stamp      = section.querySelector('.dt-stamp');
  const progressFill = section.querySelector('.dt-progress i');
  if (!item) return;

  const FALL_END = 0.55;   // progress at which impact happens
  const SETTLE_END = 0.85; // progress at which G reading settles
  const FALL_TOP_PCT = 8;   // matches .dt-item top in CSS
  const FALL_BOTTOM_PCT = 76; // lands just above the deck line

  let dctx = null, dW = 0, dH = 0;
  if (debrisCv) {
    dctx = debrisCv.getContext('2d');
    function sizeDebris () {
      const r = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dW = debrisCv.width = r.width * dpr;
      dH = debrisCv.height = r.height * dpr;
      debrisCv.style.width = r.width + 'px';
      debrisCv.style.height = r.height + 'px';
    }
    sizeDebris();
    window.addEventListener('resize', sizeDebris, { passive: true });
  }

  let activeBurst = null, burstRaf = null;
  function runDebrisBurst () {
    if (!dctx || C.noMot()) return;
    const r = section.getBoundingClientRect();
    const x = r.width * 0.68 * (dW / Math.max(1, r.width));
    const y = r.height * 0.76 * (dH / Math.max(1, r.height));
    activeBurst = C.makeBurst(dctx, dW, dH, {
      x, y, n: 34, color: '210,210,210', minSpd: 3, maxSpd: 9, upBias: 4, minR: 1, maxR: 3,
    });
    if (burstRaf) cancelAnimationFrame(burstRaf);
    function step () {
      dctx.clearRect(0, 0, dW, dH);
      const alive = activeBurst.step(0.2);
      if (alive) burstRaf = requestAnimationFrame(step);
      else { activeBurst = null; dctx.clearRect(0, 0, dW, dH); }
    }
    burstRaf = requestAnimationFrame(step);
  }

  let hasImpacted = false;
  function onUpdate (p) {
    if (progressFill) progressFill.style.width = (p * 100).toFixed(1) + '%';

    if (p <= FALL_END) {
      // gravity-eased fall: ease-in quad, plus a little pendulum wobble
      const fp = p / FALL_END;
      const eased = fp * fp;
      const topPct = FALL_TOP_PCT + eased * (FALL_BOTTOM_PCT - FALL_TOP_PCT);
      const wobble = Math.sin(fp * Math.PI * 3) * (1 - fp) * 6;
      item.style.top = topPct + '%';
      item.style.transform = `rotate(${wobble.toFixed(2)}deg)`;
      if (cable) cable.style.height = (fp * 40) + '%';
      if (gforceEl) gforceEl.textContent = '0.0';
      if (stamp) stamp.classList.remove('is-stamped');
      if (hasImpacted && p < FALL_END - 0.02) hasImpacted = false; // allow re-trigger on scroll-back
    } else {
      // resting at the deck; cable stays retracted/hidden
      item.style.top = FALL_BOTTOM_PCT + '%';
      item.style.transform = 'rotate(0deg)';
      if (cable) cable.style.height = '0%';

      if (!hasImpacted) {
        hasImpacted = true;
        if (shockwave) { shockwave.classList.remove('is-firing'); void shockwave.offsetWidth; shockwave.classList.add('is-firing'); }
        C.shake(pin);
        runDebrisBurst();
      }

      const settleP = Math.max(0, Math.min(1, (p - FALL_END) / (SETTLE_END - FALL_END)));
      // spike hard then decay toward a resting value, like a real accelerometer trace
      const spike = Math.sin(settleP * Math.PI) * 18.4;
      const resting = settleP * 2.1;
      const g = Math.max(resting, spike);
      if (gforceEl) {
        gforceEl.textContent = g.toFixed(1);
        gforceEl.classList.toggle('is-peak', g > 10);
      }
      if (stamp) stamp.classList.toggle('is-stamped', p >= SETTLE_END);
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
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate (self) { onUpdate(self.progress); },
      });
    });
  } else if (!C.noMot()) {
    // Mobile: one-shot drop-and-settle animation on scroll-into-view
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        let p = 0;
        const iv = setInterval(() => {
          p += 0.045;
          if (p >= 1) { p = 1; clearInterval(iv); }
          onUpdate(p);
        }, 40);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.4 }).observe(section);
  } else {
    onUpdate(1);
  }
})();
