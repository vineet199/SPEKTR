/* ================================================================
   SPEKTR — SPHERE GALLERY  (clean rewrite)
   Orthographic sphere. Camera looks from +Z toward origin.
   Visible tiles: those whose surface normal faces +Z (z > 0 after rotation).
   ================================================================ */
(function sphereGallery () {
  if (!window.SpektrEnv?.SPHERE_GALLERY) return;

  const sec = document.querySelector('.sphere-gallery');
  const cv  = sec?.querySelector('.sg-canvas');
  if (!sec || !cv) return;
  const ctx = cv.getContext('2d');

  /* ── image pool ─────────────────────────────────────────── */
  const SRCS = [
    'assets/home/alcove-ducati.jpg','assets/home/alcove-jacket.jpg',
    'assets/home/alcove-suit.jpg','assets/home/alcove-white.jpg',
    'assets/home/creed-01.jpg','assets/home/creed-02.jpg',
    'assets/home/creed-03.jpg','assets/home/creed-04.jpg',
    'assets/home/creed-05.jpg','assets/home/hero-night-track.jpg',
    'assets/home/standard.jpg',
    'assets/products/basic-hoodie/black-front.png',
    'assets/products/basic-hoodie/red-front.png',
    'assets/products/riding-zipper-hoodie/graphite-front.png',
    'assets/products/riding-zipper-hoodie/marine-front.png',
    'assets/products/riding-pullover/blue-front.png',
    'assets/products/riding-pullover/red-front.png',
    'assets/products/riding-jeans/black-front.png',
    'assets/products/riding-cargo/black-front.png',
    'assets/products/balaclava/red-angle.png',
    'assets/products/base-liner/red-front.png',
    'assets/products/riding-jeans/black-side.png',
    'assets/products/balaclava/green-front.png',
    'assets/products/riding-pullover/grey-front.png',
    'assets/products/base-liner/grey-angle.png',
  ];
  const imgs = SRCS.map(s => { const i = new Image(); i.src = s; return i; });

  /* ── grid ───────────────────────────────────────────────── */
  const ROWS = 8, COLS = 14;        /* 112 tiles on the sphere   */
  const TILE_MAX = 240;             /* longest edge cap (px)     */

  const tiles = [];
  for (let r = 0; r < ROWS; r++) {
    /* latitude –70° … +70°, evenly spaced */
    const phi = (r / (ROWS - 1) - 0.5) * Math.PI * 0.78;
    for (let c = 0; c < COLS; c++) {
      const theta = (c / COLS) * Math.PI * 2;
      tiles.push({ phi, theta, img: imgs[(r * COLS + c) % imgs.length] });
    }
  }

  /* ── state ──────────────────────────────────────────────── */
  let W = 0, H = 0, cx0 = 0, cy0 = 0, R = 0;
  /* rotX = 0  →  equator centred; rotY = 0  →  first column front-facing */
  let rotX = 0, rotY = 0;
  let velX = 0, velY = 0;
  let dragging = false, lastMX = 0, lastMY = 0;

  function resize () {
    W = cv.width  = sec.offsetWidth  || window.innerWidth;
    H = cv.height = sec.offsetHeight || window.innerHeight * 0.75;
    cx0 = W / 2;  cy0 = H / 2;
    /* R controls tile spacing on screen; ~3 tiles visible across the width */
    R = W * 0.55;
  }

  /* ── projection ─────────────────────────────────────────── */
  /* Camera sits at +Z infinity looking toward origin.
     Visible tiles have z > 0 after rotation (they face the camera). */
  function project (phi, theta) {
    /* point on unit sphere, scaled to R */
    const x0 =  Math.cos(phi) * Math.sin(theta) * R;
    const y0 =  Math.sin(phi) * R;   /* +y = up in world space  */
    const z0 =  Math.cos(phi) * Math.cos(theta) * R;

    /* rotate around Y (horizontal pan) */
    const x1 =  x0 * Math.cos(rotY) + z0 * Math.sin(rotY);
    const z1 = -x0 * Math.sin(rotY) + z0 * Math.cos(rotY);

    /* rotate around X (vertical tilt) */
    const y2 =  y0 * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 =  y0 * Math.sin(rotX) + z1 * Math.cos(rotX);

    /* cull tiles facing away (z2 ≤ 0 = back hemisphere) */
    if (z2 <= 0) return null;

    return {
      sx    : cx0 + x1,
      sy    : cy0 - y2,   /* canvas y is inverted */
      depth : z2,
    };
  }

  /* ── draw loop ──────────────────────────────────────────── */
  let raf = null;

  function draw () {
    ctx.clearRect(0, 0, W, H);

    /* project all tiles, keep front-facing, sort back→front */
    const projected = [];
    for (const t of tiles) {
      const p = project(t.phi, t.theta);
      if (p) projected.push({ t, p });
    }
    projected.sort((a, b) => a.p.depth - b.p.depth); /* back first */

    for (const { t, p } of projected) {
      const loaded = t.img.complete && t.img.naturalWidth > 0;
      const iw = loaded ? t.img.naturalWidth  : 200;
      const ih = loaded ? t.img.naturalHeight : 200;
      const sc = Math.min(1, TILE_MAX / Math.max(iw, ih));
      const dw = iw * sc, dh = ih * sc;
      const dx = p.sx - dw / 2, dy = p.sy - dh / 2;

      /* skip if wholly off canvas */
      if (dx + dw < 0 || dx > W || dy + dh < 0 || dy > H) continue;

      if (loaded) {
        ctx.drawImage(t.img, dx, dy, dw, dh);
      } else {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(dx, dy, dw, dh);
      }
    }

    /* inertia */
    if (!dragging) {
      rotY += velY; rotX += velX;
      velX *= 0.92; velY *= 0.92;
    }

    raf = requestAnimationFrame(draw);
  }

  /* ── input ──────────────────────────────────────────────── */
  const SENS = 0.0008;

  cv.addEventListener('mousedown', e => {
    dragging = true; velX = velY = 0;
    lastMX = e.clientX; lastMY = e.clientY;
    cv.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastMX, dy = e.clientY - lastMY;
    rotY += dx * SENS * 5; rotX -= dy * SENS * 5;
    velY = dx * SENS; velX = -dy * SENS;
    lastMX = e.clientX; lastMY = e.clientY;
  });
  window.addEventListener('mouseup', () => { dragging = false; cv.style.cursor = 'grab'; });

  sec.addEventListener('wheel', e => {
    e.preventDefault(); e.stopPropagation();
    rotY += e.deltaX * SENS * 0.4;
    rotX -= e.deltaY * SENS * 0.4;
    velY += e.deltaX * SENS * 0.15;
    velX -= e.deltaY * SENS * 0.15;
  }, { passive: false });

  let ltx = 0, lty = 0;
  cv.addEventListener('touchstart', e => {
    const t = e.touches[0]; ltx = t.clientX; lty = t.clientY; velX = velY = 0;
  }, { passive: true });
  cv.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - ltx, dy = t.clientY - lty;
    rotY += dx * SENS * 5; rotX -= dy * SENS * 5;
    velY = dx * SENS; velX = -dy * SENS;
    ltx = t.clientX; lty = t.clientY;
  }, { passive: false });

  /* ── Lenis lock/unlock ──────────────────────────────────── */
  const lock   = () => window.__lenis?.stop();
  const unlock = () => window.__lenis?.start();
  sec.addEventListener('mouseenter',  lock,   { passive: true });
  sec.addEventListener('mouseleave',  unlock, { passive: true });
  sec.addEventListener('touchstart',  lock,   { passive: true });
  sec.addEventListener('touchend',    unlock, { passive: true });
  sec.addEventListener('touchcancel', unlock, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) unlock(); });

  /* ── hint ───────────────────────────────────────────────── */
  const hint = sec.querySelector('.sg-hint');
  cv.addEventListener('mousedown', () => { if (hint) hint.style.opacity = '0'; }, { once: true });

  /* ── lifecycle ──────────────────────────────────────────── */
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      resize();
      if (!raf) raf = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(raf); raf = null;
    }
  }, { threshold: 0.01 }).observe(sec);

  window.addEventListener('resize', resize, { passive: true });
  resize();
})();
