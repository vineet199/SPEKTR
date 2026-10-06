/* ============================================================
   THE FORGE — elaborate cinematic upgrade (JS)
   Ember particle atmosphere, diagonal-wipe stage transitions
   (CSS-driven, see forge.css), impact flash+shake+spark burst on
   every stage change, a continuously-gliding rail dot, a giant
   ghost stage-number watermark, staggered letter-reveal captions,
   and a heat-grade colour wash that intensifies through the build.
   ============================================================ */
(function () {
  'use strict';
  const C = window.Cine;
  if (!C) return;

  const section = document.querySelector('.forge');
  if (!section) return;
  const stage      = section.querySelector('.forge-stage');
  const stageInner = section.querySelector('.forge-stage-inner');
  const frames   = [...section.querySelectorAll('.forge-frame')];
  const dots     = [...section.querySelectorAll('.fd')];
  const fill     = section.querySelector('.forge-rail-fill');
  const railDot  = section.querySelector('.forge-rail-dot');
  const ghost    = section.querySelector('.forge-ghost');
  const heatGrade = section.querySelector('.forge-heat-grade');
  const flashEl  = section.querySelector('.cine-flash');
  const emberCv  = section.querySelector('.forge-embers');
  if (!frames.length || !stage) return;

  /* ---- one-time: split each caption's main text into char spans ---- */
  frames.forEach(f => {
    const txt = f.querySelector('.fc-txt');
    if (!txt) return;
    const small = txt.querySelector('small');
    const mainText = txt.childNodes[0] ? txt.childNodes[0].textContent : '';
    const frag = document.createDocumentFragment();
    mainText.split(' ').forEach((word, wi, arr) => {
      const wrap = document.createElement('span'); wrap.className = 'fc-word';
      [...word].forEach(ch => {
        const c = document.createElement('span'); c.className = 'fc-char'; c.textContent = ch;
        wrap.appendChild(c);
      });
      frag.appendChild(wrap);
      if (wi < arr.length - 1) frag.appendChild(document.createTextNode('\u00A0'));
    });
    txt.textContent = '';
    txt.appendChild(frag);
    if (small) txt.appendChild(small);
  });

  function playCaption (frame) {
    const chars = frame.querySelectorAll('.fc-char');
    chars.forEach((c, i) => {
      c.style.animation = 'none';
      void c.offsetWidth;
      c.style.animationDelay = (i * 22) + 'ms';
      c.style.animation = '';
    });
  }
  playCaption(frames[0]);

  /* ---- ambient ember particles: continuous, runs while in view ---- */
  let emberParts = [], emberRaf = null, ectx = null, eW = 0, eH = 0;
  function sizeEmbers () {
    if (!emberCv) return;
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    eW = emberCv.width = r.width * dpr; eH = emberCv.height = r.height * dpr;
    emberCv.style.width = r.width + 'px'; emberCv.style.height = r.height + 'px';
  }
  function seedEmbers () {
    emberParts = Array.from({ length: 26 }, () => ({
      x: Math.random(), y: 0.5 + Math.random() * 0.5,
      vy: 0.15 + Math.random() * 0.35, drift: (Math.random() - 0.5) * 0.06,
      r: 1 + Math.random() * 2.2, flick: Math.random() * Math.PI * 2,
    }));
  }
  function emberStep () {
    if (!ectx) return;
    ectx.clearRect(0, 0, eW, eH);
    emberParts.forEach(p => {
      p.y -= p.vy / 100; p.x += p.drift / 100; p.flick += 0.15;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      const alpha = 0.35 + Math.sin(p.flick) * 0.25;
      ectx.globalAlpha = Math.max(0, alpha);
      ectx.fillStyle = '#ffb066';
      ectx.beginPath(); ectx.arc(p.x * eW, p.y * eH, p.r * (eW / 600 || 1), 0, Math.PI * 2); ectx.fill();
    });
    ectx.globalAlpha = 1;
    emberRaf = requestAnimationFrame(emberStep);
  }
  if (emberCv && !C.noMot()) {
    ectx = emberCv.getContext('2d');
    sizeEmbers(); seedEmbers();
    window.addEventListener('resize', sizeEmbers, { passive: true });
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !emberRaf) emberStep();
        else if (!e.isIntersecting && emberRaf) { cancelAnimationFrame(emberRaf); emberRaf = null; }
      });
    }, { threshold: 0.05 }).observe(section);
  }

  /* ---- stage-change impact: flash + shake + spark burst ---- */
  function stageImpact () {
    if (C.noMot()) return;
    C.flash(flashEl, 260);
    C.shake(stageInner || stage);
    if (ectx) {
      const burst = C.makeBurst(ectx, eW, eH, {
        x: eW * 0.5, y: eH * 0.55, n: 20, color: '255,110,50', minSpd: 1.5, maxSpd: 5, upBias: 3,
      });
      let ticks = 0;
      const iv = setInterval(() => { if (!burst.step(0.15) || ++ticks > 60) clearInterval(iv); }, 16);
    }
  }

  function setActive (i) {
    frames.forEach((f, idx) => f.classList.toggle('is-active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
    if (ghost) { ghost.textContent = String(i + 1).padStart(2, '0'); }
    if (heatGrade) heatGrade.style.opacity = (0.15 + (i / Math.max(1, frames.length - 1)) * 0.55).toFixed(2);
    playCaption(frames[i]);
  }
  setActive(0);

  if (C.hasST && !C.noMot() && C.isWide()) {
    C.whenSettled(() => {
      let cur = 0;
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=200%',
        pin: '.forge-stage',
        pinType: 'transform',
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate (self) {
          const idx = Math.min(frames.length - 1, Math.floor(self.progress * frames.length));
          if (idx !== cur) { cur = idx; setActive(idx); stageImpact(); }
          if (fill) fill.style.height = (self.progress * 100).toFixed(1) + '%';
          if (railDot) railDot.style.top = (self.progress * 100).toFixed(1) + '%';
        },
      });
    });
  } else if (!C.noMot()) {
    // Mobile / no-ST fallback: auto-cycle once the section is visible, no scroll-jacking
    let i = 0, timer = null;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!timer) timer = setInterval(() => { i = (i + 1) % frames.length; setActive(i); }, 2400);
        } else if (timer) { clearInterval(timer); timer = null; }
      });
    }, { threshold: 0.4 });
    obs.observe(section);
  }
})();
