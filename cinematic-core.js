/* ============================================================
   SPEKTR RACING — Cinematic Sections: SHARED CORE (JS)
   Exposes window.Cine — tiny shared helpers used by forge.js,
   weather.js, night.js, redline.js and droptest.js. Keeps the
   "defer pin creation until spektr:ready" fix and other repeated
   plumbing in exactly one place (DRY).
   ============================================================ */
(function () {
  'use strict';
  const hasST  = !!(window.gsap && window.ScrollTrigger);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const noMot  = () => document.body.classList.contains('no-motion') || reduce;
  const isWide = () => window.matchMedia('(min-width:821px)').matches;

  // home.js (hero pin) and neural-diamond.js (neural pin) both create their
  // GSAP pins *inside* a `spektr:ready` listener — their pin-spacers land in
  // the DOM asynchronously (~1.8s in), shifting every section below them by
  // 900-2500px. A fixed delay or "poll until stable" both fail here (the
  // page looks falsely settled for many samples right before the shift).
  // Fix: piggyback on the same event. Every cinematic-*.js file is
  // <script>-included after home.js/neural-diamond.js, so by the time our
  // listener runs, their spacers already exist.
  function whenSettled (fn) {
    window.addEventListener('spektr:ready', () => setTimeout(fn, 150));
  }

  /* ---- quick flash-pop overlay (impact / lightning / stage-change) ----
     Restarting a CSS animation classically uses `void el.offsetWidth` to
     force a synchronous layout flush. On a page this size (10 pinned
     ScrollTrigger sections) that forced reflow recomputes layout for a
     large chunk of the DOM and can cost 50-150ms -- brutal when it fires
     on a recurring timer (e.g. weather.js's lightning strikes every
     ~1.4s). A rAF-deferred class toggle restarts the animation just as
     reliably (the browser naturally flushes styles at the frame
     boundary) without ever forcing a synchronous reflow. */
  function flash (el, duration) {
    if (!el) return;
    el.classList.remove('is-firing');
    if (duration) el.style.animationDuration = duration + 'ms';
    requestAnimationFrame(() => el.classList.add('is-firing'));
  }

  /* ---- quick camera-shake on a container ---- */
  function shake (el) {
    if (!el || noMot()) return;
    el.classList.remove('cine-shake');
    requestAnimationFrame(() => el.classList.add('cine-shake'));
  }

  /* ---- generic spark/particle burst on a 2D canvas, gravity + fade ---- */
  function makeBurst (ctx, W, H, opts) {
    const n = opts.n || 24;
    const parts = [];
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (opts.minSpd || 2) + Math.random() * (opts.maxSpd || 6);
      parts.push({
        x: opts.x, y: opts.y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - (opts.upBias || 2),
        life: 1, decay: 0.012 + Math.random() * 0.02,
        r: (opts.minR || 1) + Math.random() * (opts.maxR || 2.4),
        color: opts.color || '255,140,60',
      });
    }
    return {
      parts,
      step (gravity) {
        ctx.save();
        parts.forEach(p => {
          p.vy += gravity != null ? gravity : 0.12;
          p.x += p.vx; p.y += p.vy; p.life -= p.decay;
          if (p.life <= 0) return;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = `rgba(${p.color},${Math.max(0, p.life)})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
        return parts.some(p => p.life > 0);
      },
    };
  }

  window.Cine = { hasST, noMot, isWide, whenSettled, flash, shake, makeBurst };
})();
