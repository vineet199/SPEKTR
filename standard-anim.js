/* ================================================================
   SPEKTR -- ARMOUR STRESS TEST  (.standard section)
   Entry trigger  : particles drift in across full section as it scrolls up
   Beat trigger   : pins section, cards glide from sides, energy lines, stats
   ================================================================ */
(function armourStressTest () {
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches
               || document.body.classList.contains('no-motion');
  if (reduce) return;
  const sec = document.querySelector('.standard');
  if (!sec || !window.gsap || !window.ScrollTrigger) return;

  /* ---- elements ---- */
  const label = sec.querySelector('.std-head .label');
  const h2    = sec.querySelector('.std-head h2');
  const para  = sec.querySelector('.std-head p');
  const cards = [...sec.querySelectorAll('.std')];
  const bEls  = [...sec.querySelectorAll('.std b')];
  [label, h2, para, ...cards].forEach(el => el?.classList.remove('reveal'));

  /* ---- particle canvas (atmospheric layer only, no solid overlay) ---- */
  const cv = document.createElement('canvas');
  cv.className = 'ast-canvas';
  sec.appendChild(cv);
  const cx = cv.getContext('2d');

  /* ---- energy lines canvas ---- */
  const ecv = document.createElement('canvas');
  ecv.className = 'ast-energy';
  sec.appendChild(ecv);
  const ecx = ecv.getContext('2d');

  /* ---- initial content state ---- */
  gsap.set([label, para, h2], { opacity: 0 });
  gsap.set(cards, { opacity: 0 });

  /* ---- weight-drop h2 ---- */
  const rawLines = h2.innerHTML.split(/<br\s*\/?>/i);
  h2.innerHTML   = rawLines.map(l =>
    `<span class="wdrop-line"><span class="wdrop-inner">${l}</span></span>`).join('');
  gsap.set(h2.querySelectorAll('.wdrop-inner'), { y: '-110%' });

  /* ======= PARTICLES ======= */
  /* Varied palette — visible against the bg image but not opaque blocks */
  const PALETTE = [
    'rgba(215,43,43,0.7)','rgba(215,43,43,0.5)','rgba(180,30,30,0.6)',
    'rgba(255,60,60,0.4)','rgba(100,100,100,0.5)','rgba(140,140,140,0.4)',
    'rgba(80,80,80,0.55)','rgba(60,60,60,0.6)','rgba(200,200,200,0.3)',
    'rgba(215,43,43,0.35)',
  ];
  let parts = [];

  function buildParticles () {
    const W = cv.width  = sec.offsetWidth;
    const H = cv.height = sec.offsetHeight;
    parts = [];
    const N = Math.min(280, Math.round(W * H / 4000));
    const edges = ['T', 'B', 'L', 'R'];
    for (let i = 0; i < N; i++) {
      const edge = edges[i % 4];
      let sx, sy;
      if      (edge === 'T') { sx = Math.random() * W; sy = -10 - Math.random() * 80; }
      else if (edge === 'B') { sx = Math.random() * W; sy = H + 10 + Math.random() * 80; }
      else if (edge === 'L') { sx = -10 - Math.random() * 80; sy = Math.random() * H; }
      else                   { sx = W + 10 + Math.random() * 80; sy = Math.random() * H; }
      /* targets spread across the ENTIRE section — no clustering */
      parts.push({
        sx, sy,
        tx  : Math.random() * W,
        ty  : Math.random() * H,
        sz  : 1.5 + Math.random() * 3.5,
        col : PALETTE[Math.floor(Math.random() * PALETTE.length)],
      });
    }
  }

  function drawParticles (p) {
    const W = cv.width, H = cv.height;
    cx.clearRect(0, 0, W, H);
    p = Math.max(0, Math.min(1, p));
    if (p <= 0) return;
    const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    parts.forEach(pt => {
      cx.fillStyle   = pt.col;
      cx.globalAlpha = ease * 0.9;        /* semi-transparent — bg image shows through */
      cx.fillRect(
        pt.sx + (pt.tx - pt.sx) * ease - pt.sz / 2,
        pt.sy + (pt.ty - pt.sy) * ease - pt.sz / 2,
        pt.sz, pt.sz
      );
    });
    cx.globalAlpha = 1;
  }

  /* ======= ENERGY LINES ======= */
  function drawEnergyLines () {
    const W = ecv.width  = sec.offsetWidth;
    const H = ecv.height = sec.offsetHeight;
    ecx.clearRect(0, 0, W, H);
    const sr = sec.getBoundingClientRect();
    const centers = cards.map(c => {
      const r = c.getBoundingClientRect();
      return { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2 };
    });
    if (!centers.length) return;
    gsap.set(ecv, { opacity: 1 });
    const segs = [];
    for (let i = 0; i < centers.length - 1; i++) segs.push([centers[i], centers[i + 1]]);
    segs.push([centers[0], centers[centers.length - 1]]);

    segs.forEach(([a, b], i) => {
      const o = { t: 0 };
      gsap.to(o, {
        t: 1, duration: 0.38, delay: i * 0.13, ease: 'power2.inOut',
        onUpdate () {
          ecx.strokeStyle = '#D72B2B';
          ecx.shadowColor = '#D72B2B';
          ecx.shadowBlur  = 10;
          ecx.lineWidth   = 1.4;
          ecx.beginPath();
          ecx.moveTo(a.x, a.y);
          ecx.lineTo(a.x + (b.x - a.x) * o.t, a.y + (b.y - a.y) * o.t);
          ecx.stroke();
        },
      });
    });
    gsap.to(ecv, { opacity: 0, duration: 0.55, delay: segs.length * 0.13 + 0.5 });
  }

  /* ======= COUNTERS ======= */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%-+';
  const ctrs  = [
    { el: bEls[0], type: 'num', prefix: 'CE-', from: 0,   to: 1,  peak: 6   },
    { el: bEls[1], type: 'txt', final: 'KEVLAR\u00ae'                         },
    { el: bEls[2], type: 'txt', final: 'INDIA'                                },
    { el: bEls[3], type: 'num', suffix: '%',   from: 100, to: 0,  peak: -10  },
  ];
  ctrs.forEach(c => {
    c.el.textContent = c.type === 'num'
      ? (c.prefix || '') + c.from + (c.suffix || '')
      : [...c.final].map(ch => ch === '\u00ae' ? '\u00ae' : CHARS[~~(Math.random() * CHARS.length)]).join('');
  });
  function fireNum (c) {
    const o = { v: c.from }, f = v => (c.prefix || '') + Math.round(v) + (c.suffix || '');
    gsap.to(o, { v: c.peak, duration: .45, ease: 'power2.out',
      onUpdate () { c.el.textContent = f(o.v); },
      onComplete () { gsap.to(o, { v: c.to, duration: .3, ease: 'power3.in',
        onUpdate () { c.el.textContent = f(o.v); },
        onComplete () { c.el.textContent = f(c.to); } }); } });
  }
  function fireTxt (c) {
    let n = 0;
    const id = setInterval(() => {
      if (n++ >= 20) {
        clearInterval(id); c.el.textContent = c.final;
        gsap.fromTo(c.el, { scaleY: .05 }, { scaleY: 1, duration: .14, ease: 'back.out(3)' });
        return;
      }
      c.el.textContent = [...c.final].map(ch =>
        ch === '\u00ae' ? '\u00ae' : CHARS[~~(Math.random() * CHARS.length)]).join('');
    }, 60);
  }

  /* ======= HEADLINE ======= */
  function fireHeadline () {
    gsap.set(h2, { opacity: 1 });
    [...h2.querySelectorAll('.wdrop-inner')].forEach((el, i) =>
      gsap.to(el, { y: '0%', duration: .5, ease: 'power4.in', delay: i * .14 }));
  }

  /* ======= CARDS — smooth glide from alternating sides ======= */
  function glideCards () {
    const VW = window.innerWidth;
    gsap.set(cards, { opacity: 1 });
    cards.forEach((card, i) => {
      const fromX = i % 2 === 0 ? -VW * 0.65 : VW * 0.65;
      gsap.fromTo(card,
        { x: fromX, opacity: 1 },
        { x: 0, duration: 0.85, ease: 'power3.out', delay: i * 0.09 }
      );
    });
  }

  /* ======= MILESTONES ======= */
  const BEATS    = { text: 0.12, cards: 0.40, stats: 0.58, energy: 0.68, breathe: 0.88 };
  const firedFwd = {};

  function milestone (key, progress, fn) {
    if (progress >= BEATS[key] && !firedFwd[key])         { firedFwd[key] = true; fn(); }
    if (progress <  BEATS[key] - 0.04 && firedFwd[key])  { firedFwd[key] = false; }
  }

  /* ======= ENTRY UPDATE (no overlay — particles only) ======= */
  function onEntryUpdate (p) {
    drawParticles(p);
    /* canvas fades once section is fully in view */
    gsap.set(cv, { opacity: Math.max(0, 1 - (p - 0.55) / 0.35) });
  }

  /* ======= BEAT UPDATE ======= */
  function onBeatUpdate (progress) {
    milestone('text',    progress, () => {
      gsap.to([label, para], { opacity: 1, y: 0, duration: .45, stagger: .12, ease: 'power2.out' });
      fireHeadline();
    });
    milestone('cards',   progress, glideCards);
    milestone('stats',   progress, () =>
      ctrs.forEach((c, i) => setTimeout(() => (c.type === 'num' ? fireNum : fireTxt)(c), i * 160))
    );
    milestone('energy',  progress, drawEnergyLines);
    milestone('breathe', progress, () =>
      gsap.to(sec, { scale: 1.01, duration: .4, ease: 'sine.inOut',
        onComplete: () => gsap.to(sec, { scale: 1, duration: .4, ease: 'sine.inOut' }) }));
  }

  /* ======= INIT ======= */
  gsap.set([label, para], { y: 20 });

  window.addEventListener('spektr:ready', () => {
    buildParticles();

    /* entry — particles drift in as section scrolls into view */
    ScrollTrigger.create({
      trigger : sec,
      start   : 'top bottom',
      end     : 'top top',
      scrub   : true,
      onUpdate (self)  { onEntryUpdate(self.progress); },
      onLeaveBack ()   { gsap.set(cv, { opacity: 1 }); cx.clearRect(0, 0, cv.width, cv.height); },
    });

    /* beat — pins section, fires all post-reveal actions */
    ScrollTrigger.create({
      trigger    : sec,
      start      : 'top top',
      end        : '+=110%',
      pin        : true,
      pinSpacing : true,
      scrub      : true,
      onUpdate (self) { onBeatUpdate(self.progress); },
      onLeaveBack () {
        Object.keys(firedFwd).forEach(k => delete firedFwd[k]);
        gsap.set([label, para, h2, ...cards], { opacity: 0 });
        gsap.set(cards, { x: 0 });
        gsap.set(h2.querySelectorAll('.wdrop-inner'), { y: '-110%' });
        gsap.set(ecv, { opacity: 0 });
        ecx.clearRect(0, 0, ecv.width, ecv.height);
      },
    });
  });

  window.addEventListener('resize', buildParticles, { passive: true });
})();
