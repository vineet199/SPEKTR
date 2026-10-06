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

  /* ---- no initial gsap.set needed — CSS handles default hidden state ---- */

  /* ---- reveal / hide via CSS class toggle ---- */
  function revealRoom (i) { rooms[i].classList.remove('room--out'); rooms[i].classList.add('room--active'); }
  function hideRoom  (i) { rooms[i].classList.remove('room--active'); rooms[i].classList.add('room--out'); }

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
  revealRoom(0);

  /* ---- bg parallax on scroll (separate ticker) ---- */
  let lastProg = 0;
  function onScroll (prog) {
    const rawIdx  = prog * (N - 1);
    const newIdx  = Math.round(rawIdx);
    const localP  = rawIdx - Math.floor(rawIdx); // 0→1 within current room

    /* bg depth + drift per room — direct style write, no GSAP overhead */
    els.forEach((e, i) => {
      if (!e.bg) return;
      const dist  = rawIdx - i;
      const scale = 1 + Math.abs(dist) * 0.09;
      const driftX = dist * 55;
      e.bg.style.transform = `scale(${scale}) translateX(${driftX}px)`;
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
      end     : () => '+=' + (N - 1) * window.innerWidth,
      scrub   : 0.35,
      invalidateOnRefresh: true,
      onUpdate (self) { onScroll(self.progress); },
    });
  });
})();
