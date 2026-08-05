/* ================================================================
   SPEKTR -- ALCOVES: cinematic room animations
   Runs alongside home.js horizontal scroll. Second ScrollTrigger
   reads the same trigger/end so progress is always in sync.

   Per room, as it centres:
     - bg image: scale 1.14 -> 1.0 (depth zoom in) -> 0.94 (exits)
     - bg image: horizontal drift opposite to scroll direction
     - copy block: stagger fade + y slide up
     - product:   float up from y:50
     - vertical red wipe line on room change
   ================================================================ */
(function alcovesCinema () {
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  const track  = document.querySelector('.alcoves .track');
  const rooms  = track ? [...track.querySelectorAll('.room')] : [];
  if (!rooms.length) return;

  const N = rooms.length;

  /* ---- gather per-room animatable elements ---- */
  const els = rooms.map(room => ({
    bg      : room.querySelector('.room-bg .bg-media'),
    idx     : room.querySelector('.idx'),
    cat     : room.querySelector('.cat'),
    h3      : room.querySelector('h3'),
    para    : room.querySelector('.r-copy p'),
    specs   : [...room.querySelectorAll('.specs .s')],
    product : room.querySelector('.product'),
    tag     : room.querySelector('.r-tag'),
  }));

  /* ---- set initial state ---- */
  els.forEach(({ bg, idx, cat, h3, para, specs, product, tag }) => {
    if (bg)      gsap.set(bg,      { scale: 1.14, x: 60 });
    if (idx)     gsap.set(idx,     { opacity: 0, y: 16 });
    if (cat)     gsap.set(cat,     { opacity: 0, y: 12 });
    if (h3)      gsap.set(h3,      { opacity: 0, y: 32 });
    if (para)    gsap.set(para,    { opacity: 0, y: 18 });
    if (specs.length) gsap.set(specs, { opacity: 0, y: 14 });
    if (product) gsap.set(product, { opacity: 0, y: 50 });
    if (tag)     gsap.set(tag,     { opacity: 0 });
  });

  /* ---- reveal first room immediately on ready ---- */
  function revealRoom (i, instant) {
    const e = els[i];
    const d = instant ? 0 : 1;
    if (e.bg)   gsap.to(e.bg, { scale:1, x:0, duration: d*1.1, ease:'power3.out' });
    if (e.idx)  gsap.to(e.idx,  { opacity:1, y:0, duration: d*.4, ease:'power2.out', delay: d*.0  });
    if (e.cat)  gsap.to(e.cat,  { opacity:1, y:0, duration: d*.45, ease:'power2.out', delay: d*.07 });
    if (e.h3)   gsap.to(e.h3,   { opacity:1, y:0, duration: d*.55, ease:'power3.out', delay: d*.14 });
    if (e.para) gsap.to(e.para, { opacity:1, y:0, duration: d*.5,  ease:'power2.out', delay: d*.22 });
    if (e.specs.length)
      gsap.to(e.specs, { opacity:1, y:0, duration: d*.4, ease:'power2.out', stagger: d*.08, delay: d*.3 });
    if (e.product) gsap.to(e.product, { opacity:1, y:0, duration: d*.7, ease:'expo.out', delay: d*.1 });
    if (e.tag) gsap.to(e.tag,  { opacity:1, duration: d*.5, delay: d*.4 });
  }

  function hideRoom (i) {
    const e = els[i];
    if (e.bg)   gsap.to(e.bg, { scale: 0.94, x: -60, duration: .7, ease:'power2.in' });
    if (e.idx)  gsap.to(e.idx,  { opacity:0, y:-10, duration:.3, ease:'power2.in' });
    if (e.cat)  gsap.to(e.cat,  { opacity:0, y:-8,  duration:.3, ease:'power2.in' });
    if (e.h3)   gsap.to(e.h3,   { opacity:0, y:-20, duration:.35, ease:'power2.in' });
    if (e.para) gsap.to(e.para, { opacity:0, y:-10, duration:.3, ease:'power2.in' });
    if (e.specs.length) gsap.to(e.specs, { opacity:0, y:-8, duration:.25, ease:'power2.in', stagger:.04 });
    if (e.product) gsap.to(e.product, { opacity:0, y:-30, duration:.4, ease:'power2.in' });
    if (e.tag) gsap.to(e.tag,  { opacity:0, duration:.2 });
  }

  /* ---- vertical wipe line ---- */
  const wipe = document.createElement('div');
  wipe.className = 'alcove-wipe';
  document.querySelector('.alcoves .pin')?.appendChild(wipe);

  function fireWipe () {
    gsap.fromTo(wipe,
      { scaleY: 0, opacity: 1, transformOrigin: 'top center' },
      { scaleY: 1, opacity: 0, duration: .55, ease: 'power3.out' }
    );
  }

  /* ---- track active room ---- */
  let activeIdx = 0;
  revealRoom(0, true);

  /* ---- bg parallax on scroll (separate ticker) ---- */
  let lastProg = 0;
  function onScroll (prog) {
    const rawIdx  = prog * (N - 1);
    const newIdx  = Math.round(rawIdx);
    const localP  = rawIdx - Math.floor(rawIdx); // 0→1 within current room

    /* bg depth + drift per room */
    els.forEach((e, i) => {
      if (!e.bg) return;
      const dist   = rawIdx - i;        /* -1 (left of screen) → 0 (centred) → 1 (right) */
      const scale  = 1 + Math.abs(dist) * 0.09;
      const driftX = dist * 55;
      gsap.set(e.bg, { scale, x: driftX });
    });

    /* room change */
    if (newIdx !== activeIdx) {
      hideRoom(activeIdx);
      revealRoom(newIdx, false);
      fireWipe();
      activeIdx = newIdx;
    }

    lastProg = prog;
  }

  /* ---- second ScrollTrigger — same geometry as home.js horizontal one ---- */
  window.addEventListener('spektr:ready', () => {
    if (!track) return;
    ScrollTrigger.create({
      trigger : '.alcoves',
      start   : 'top top',
      end     : () => '+=' + (track.scrollWidth - window.innerWidth - window.innerHeight),
      scrub   : true,
      invalidateOnRefresh: true,
      onUpdate (self) { onScroll(self.progress); },
    });
  });
})();
