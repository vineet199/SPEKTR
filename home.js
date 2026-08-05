/* ============================================================
   SPEKTR RACING — HOMEPAGE behaviour
   ============================================================ */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const noMotion = () => document.body.classList.contains('no-motion') || reduce;
  const hasST = window.gsap && window.ScrollTrigger;

  /* ---------- Hero ignition canvas (cinematic track at dusk) ---------- */
  const cv = document.getElementById('ignition');
  if (cv) {
    const ctx = cv.getContext('2d');
    let W, H, parts = [], streaks = [], raf;
    function size(){ W = cv.width = cv.offsetWidth * devicePixelRatio; H = cv.height = cv.offsetHeight * devicePixelRatio; init(); }
    function init(){
      parts = []; streaks = [];
      const vx = W*0.62, vy = H*0.42; // vanishing point
      for (let i=0;i<90;i++) parts.push({ a: Math.random()*Math.PI*2, r: Math.random()*0.5+0.02, sp: Math.random()*0.004+0.0012, vx, vy, sz: Math.random()*1.6+0.3 });
      for (let i=0;i<14;i++) streaks.push({ a: Math.random()*Math.PI*2, r: Math.random()*0.4+0.05, sp: Math.random()*0.006+0.003, vx, vy, len: Math.random()*40+20 });
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      const vx = W*0.62, vy = H*0.42;
      // depth particles
      parts.forEach(p=>{
        p.r += p.sp; if (p.r>1.25){ p.r=0.02; p.a=Math.random()*Math.PI*2; }
        const x = vx + Math.cos(p.a)*p.r*W*0.9, y = vy + Math.sin(p.a)*p.r*H*0.9;
        const alpha = Math.min(1, p.r*1.4)*0.5;
        ctx.beginPath(); ctx.fillStyle = `rgba(180,190,210,${alpha})`;
        ctx.arc(x,y, p.sz*p.r*devicePixelRatio*1.4, 0, 7); ctx.fill();
      });
      // red light streaks rushing past
      streaks.forEach(s=>{
        s.r += s.sp; if (s.r>1.2){ s.r=0.05; s.a=Math.random()*Math.PI*2; }
        const x = vx + Math.cos(s.a)*s.r*W, y = vy + Math.sin(s.a)*s.r*H;
        const dx = Math.cos(s.a), dy = Math.sin(s.a);
        const g = ctx.createLinearGradient(x,y, x+dx*s.len*s.r, y+dy*s.len*s.r);
        g.addColorStop(0, `rgba(215,43,43,${0.0})`); g.addColorStop(1, `rgba(215,43,43,${0.5*s.r})`);
        ctx.strokeStyle = g; ctx.lineWidth = 1.4*devicePixelRatio*s.r; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+dx*s.len*s.r*devicePixelRatio, y+dy*s.len*s.r*devicePixelRatio); ctx.stroke();
      });
      raf = requestAnimationFrame(draw);
    }
    addEventListener('resize', size); size();
    if (!noMotion()) {
      /* pause RAF when hero is not in view */
      const heroEl = document.querySelector('.hero');
      if (heroEl && 'IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(draw); }
          else { cancelAnimationFrame(raf); raf = null; }
        }, { threshold: 0.01 }).observe(heroEl);
      } else { draw(); }
    } else { draw(); cancelAnimationFrame(raf); }
    window.addEventListener('spektr:ready', ()=>{ cv.style.opacity = 1; });
  }

  /* ---------- Hero intro (split slide-up) ---------- */
  window.addEventListener('spektr:ready', () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (noMotion()) { hero.classList.add('in'); return; }
    setTimeout(()=>hero.classList.add('in'), 120);
  });

  /* ---------- S2 Alcoves: pinned horizontal scroll ---------- */
  const pin = document.querySelector('.alcoves .pin');
  const track = document.querySelector('.alcoves .track');
  if (pin && track && hasST && !noMotion() && window.matchMedia('(min-width:821px)').matches) {
    const rooms   = [...track.querySelectorAll('.room')];
    const stages  = rooms.map(r => r.querySelector('.r-stage')).filter(Boolean);
    const n       = rooms.length;
    const pbar    = document.querySelector('.alcoves .progress .ptrack i');
    const pnum    = document.querySelector('.alcoves .progress .pnum');
    if (pbar) { pbar.style.transformOrigin = 'left'; pbar.style.width = '100%'; }

    /* z-index: each room sits above the previous */
    rooms.forEach((r, i) => { r.style.zIndex = i + 1; });

    const scrollDist = () => (n - 1) * window.innerWidth;
    let cur = 0;

    ScrollTrigger.create({
      trigger: '.alcoves', start: 'top top',
      end: scrollDist,
      scrub: 0.35, pin: '.alcoves .pin', pinType: 'transform',
      anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate (self) {
        const prog = self.progress;                  // 0 → 1
        const rawIdx = prog * (n - 1);              // 0 → n-1

        /* slide each room: room 0 stays put, room i slides in during segment i-1→i */
        rooms.forEach((room, i) => {
          if (i === 0) return;
          const segProg = Math.max(0, Math.min(1, rawIdx - (i - 1)));  // 0→1 per segment
          room.style.transform = `translateX(${(1 - segProg) * 100}%)`;
        });

        /* progress bar */
        if (pbar) pbar.style.transform = `scaleX(${0.25 + prog * 0.75})`;

        /* room counter */
        const idx = Math.min(n - 1, Math.floor(rawIdx + 0.0001));
        if (idx !== cur) {
          cur = idx;
          if (window.SpektrSound) window.SpektrSound.click();
          if (pnum) pnum.textContent = String(idx + 1).padStart(2, '0') + ' / 0' + n;
        }

        /* stage parallax */
        const py = (40 - prog * 80).toFixed(2);
        stages.forEach(s => { s.style.transform = `translateY(${py}px)`; });
      }
    });
  }

  /* ---------- S3 THE CREED — split headlines + staggered reveal ---------- */
  function splitHead(el){
    const out = [];
    el.childNodes.forEach(node => {
      if (node.nodeType === 3){
        node.textContent.split(/(\s+)/).forEach(w => {
          if (w === '') return;
          if (w.trim() === ''){ out.push(document.createTextNode(w)); return; }
          const wrap = document.createElement('span'); wrap.className = 'word';
          const inner = document.createElement('span'); inner.textContent = w;
          wrap.appendChild(inner); out.push(wrap);
        });
      } else if (node.nodeName === 'BR'){ out.push(document.createElement('br')); }
      else { out.push(node.cloneNode(true)); }
    });
    el.innerHTML = '';
    out.forEach(n => el.appendChild(n));
    el.querySelectorAll('.word > span').forEach((s,i)=> s.style.transitionDelay = (i*0.05)+'s');
  }
  document.querySelectorAll('[data-split]').forEach(splitHead);

  const creed = document.querySelector('.creed-home');
  if (creed){
    const values = creed.querySelectorAll('.value');
    if (noMotion()){ values.forEach(v=>v.classList.add('shown')); }
    else {
      const cio = new IntersectionObserver((ents)=>{
        ents.forEach(en=>{ if (en.isIntersecting){ en.target.classList.add('shown'); cio.unobserve(en.target); } });
      }, { threshold: 0.35 });
      values.forEach(v=>cio.observe(v));
      // stacking parallax — each card recedes (scale + dim) as the next slides over it
      if (hasST){
        values.forEach((card, i) => {
          if (i === values.length-1) return;
          const inner = card.querySelector('.v-inner');
          gsap.to(inner, { scale: 0.9, opacity: 0.15, ease: 'none',
            scrollTrigger: { trigger: values[i+1], start: 'top bottom', end: 'top top', scrub: true } });
        });
      }
      // subliminal red pulse on first entry
      const pulse = creed.querySelector('.creed-pulse');
      if (pulse){
        const pio = new IntersectionObserver((ents)=>{
          ents.forEach(en=>{ if (en.isIntersecting){
            if (window.gsap) gsap.fromTo(pulse, { opacity: 0.06 }, { opacity: 0, duration: 1.1, ease: 'power2.out' });
            pio.disconnect();
          }});
        }, { threshold: 0.2 });
        pio.observe(creed);
      }
    }
  }

  /* ---------- S5 WORN & PROVEN — rail reveal handled by .reveal class ---------- */

  /* ---------- S7 PIT WALL — form ---------- */
  const pitForm = document.getElementById('pitForm');
  if (pitForm){
    pitForm.querySelectorAll('input, textarea').forEach(inp => {
      const sync = () => inp.closest('.pfld').classList.toggle('filled', !!inp.value.trim());
      inp.addEventListener('input', () => { sync(); inp.closest('.pfld').classList.remove('err'); });
      inp.addEventListener('blur', sync);
    });
    const sel = document.getElementById('pf-topic');
    if (sel) sel.addEventListener('change', ()=> sel.closest('.pfld').classList.remove('err'));
    const send = document.getElementById('pitSend');
    send.addEventListener('click', () => {
      let ok = true;
      pitForm.querySelectorAll('.pfld[data-req]').forEach(f => {
        const ctl = f.querySelector('input, textarea, select');
        let valid = ctl.value.trim().length > 0;
        if (ctl.type === 'email') valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ctl.value);
        f.classList.toggle('err', !valid);
        if (!valid) ok = false;
      });
      if (!ok){ const e = pitForm.querySelector('.pfld.err input, .pfld.err textarea, .pfld.err select'); if (e) e.focus(); return; }
      if (window.SpektrSound) window.SpektrSound.click();
      const sec = document.querySelector('.pitwall');
      const succ = document.getElementById('pitSuccess');
      sec.classList.add('sent'); succ.classList.add('show'); succ.setAttribute('aria-hidden','false');
      if (hasST) setTimeout(()=>ScrollTrigger.refresh(), 200);
    });
  }

  /* ---------- S5 Product tabs ---------- */
  const tabs = document.querySelectorAll('.tab');
  const grid = document.querySelector('.grid-products');
  if (tabs.length && grid) {
    const cards = Array.from(grid.querySelectorAll('.card'));
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t=>t.classList.remove('active')); tab.classList.add('active');
      if (window.SpektrSound) window.SpektrSound.click();
      const cat = tab.dataset.cat;
      const matches = cards.filter(c => cat==='all' || c.dataset.cat===cat);
      cards.forEach(c => c.classList.add('hiding'));
      grid.classList.toggle('solo', cat!=='all' && matches.length===1);
      setTimeout(() => {
        cards.forEach(c => { const show = cat==='all' || c.dataset.cat===cat; c.style.display = show ? '' : 'none'; });
        requestAnimationFrame(()=> matches.forEach((c,i)=> setTimeout(()=>c.classList.remove('hiding'), i*55)));
      }, 200);
    }));
  }

  /* ---------- S4 Reels (pause video on hover handled inline) ---------- */
  document.querySelectorAll('.reel video').forEach(v => {
    v.addEventListener('mouseenter', ()=>v.pause());
    v.addEventListener('mouseleave', ()=>{ v.play().catch(()=>{}); });
  });

  /* ---------- S6 Ticker: duplicate for seamless loop ---------- */
  const trow = document.querySelector('.ticker .row');
  if (trow) trow.innerHTML += trow.innerHTML;

  if (hasST) window.addEventListener('spektr:ready', ()=> setTimeout(()=>ScrollTrigger.refresh(), 400));

  /* ================================================================
     FX1 — HERO PIXEL DISINTEGRATION  (Hero scrolls out)
     Samples real pixel colours from the filtered hero bg image.
     Each particle is coloured from the actual composited frame.
     Falls back to abstract chips if CORS blocks pixel read.
     ================================================================ */
  (function heroDisintegrate () {
    if (noMotion() || !hasST) return;
    const hero  = document.querySelector('.hero');
    const bgImg = hero && hero.querySelector('.bg-media');
    if (!hero || !bgImg) return;

    // Particle canvas — sits above bg, below hero text (z 4)
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;cursor:auto;z-index:4;opacity:0;';
    hero.appendChild(cv);
    const cx = cv.getContext('2d');

    const inner   = hero.querySelector('.inner');
    const bg      = hero.querySelector('.bg');
    const alcoves = document.querySelector('.alcoves'); // fades in as hero disintegrates
    let W, H, particles = [], ready = false;

    function buildFromPixels () {
      // Offscreen canvas: composite the hero exactly as CSS renders it
      const off = document.createElement('canvas');
      off.width = W; off.height = H;
      const ox = off.getContext('2d');

      ox.fillStyle = '#080808';
      ox.fillRect(0, 0, W, H);

      // Match .hero .bg-media CSS: grayscale(.5) contrast(1.1) brightness(.7), opacity .38
      ox.filter = 'grayscale(0.5) contrast(1.1) brightness(0.7)';
      ox.globalAlpha = 0.38;
      ox.drawImage(bgImg, 0, 0, W, H);
      ox.filter = 'none'; ox.globalAlpha = 1;

      // Approximate the radial vignette overlay
      const vg = ox.createRadialGradient(W * .5, H * .5, H * .06, W * .5, H * .5, W * .78);
      vg.addColorStop(0,   'rgba(8,8,8,0)');
      vg.addColorStop(0.6, 'rgba(8,8,8,0.38)');
      vg.addColorStop(1,   'rgba(8,8,8,0.82)');
      ox.fillStyle = vg; ox.fillRect(0, 0, W, H);

      const STEP = 8;                         // sample every 8 px → ~11 k candidates
      const data = ox.getImageData(0, 0, W, H).data;
      const cxC = W / 2, cyC = H / 2;

      for (let y = 0; y < H; y += STEP) {
        for (let x = 0; x < W; x += STEP) {
          const i = (y * W + x) * 4;
          const r = data[i], g = data[i+1], b = data[i+2];
          if (r + g + b < 20) continue;        // skip near-black void pixels
          // Velocity: outward from centre + strong upward bias
          const dx = (x - cxC) / cxC;
          const dy = (y - cyC) / cyC;
          const spd = 0.55 + Math.random() * 0.9;
          particles.push({
            ox: x, oy: y,
            vx: dx * W * spd * 0.6 + (Math.random() - 0.5) * W * 0.35,
            vy: dy * H * spd * 0.35 - (0.45 + Math.random() * 0.85) * H,
            col: `rgb(${r},${g},${b})`,
            sz : 5 + Math.random() * 4,        // slightly bigger than step for no gaps
          });
        }
      }
      ready = true;
    }

    function buildFallback () {
      // Abstract dark chips when pixel read is blocked (file:// CORS)
      const GRAYS = ['#1c1c1c','#252525','#2e2e2e','#393939','#444','#525252'];
      const REDS  = ['rgba(215,43,43,0.7)'];
      const cxC = W / 2, cyC = H / 2;
      const cols = Math.ceil(W / 28), rows = Math.ceil(H / 28);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c / cols) * W + (Math.random() - 0.5) * 20;
          const y = (r / rows) * H + (Math.random() - 0.5) * 20;
          const dx = (x - cxC) / cxC, dy = (y - cyC) / cyC;
          const spd = 0.55 + Math.random() * 0.9;
          const red = Math.random() < 0.1;
          const pal = red ? REDS : GRAYS;
          particles.push({
            ox: x, oy: y,
            vx: dx * W * spd * 0.6 + (Math.random() - 0.5) * W * 0.35,
            vy: dy * H * spd * 0.35 - (0.45 + Math.random() * 0.85) * H,
            col: pal[Math.floor(Math.random() * pal.length)],
            sz : 3 + Math.random() * 5,
          });
        }
      }
      ready = true;
    }

    function init () {
      W = cv.width = hero.offsetWidth;
      H = cv.height = hero.offsetHeight;
      particles = []; ready = false;
      const run = () => {
        try { buildFromPixels(); }
        catch (_) { buildFallback(); } // tainted canvas → abstract fallback
      };
      bgImg.complete && bgImg.naturalWidth > 0 ? run() : bgImg.addEventListener('load', run, { once: true });
    }

    let painting = false;

    function paint (progress) {
      if (!painting) return;
      cx.clearRect(0, 0, W, H);
      if (!ready) return;
      // 0→15%  freeze-frame swap: canvas fades in, bg fades out
      const swap = Math.min(1, progress / 0.15);
      cv.style.opacity           = String(swap);
      if (bg)    bg.style.opacity    = String(1 - swap);
      if (inner) inner.style.opacity = Math.max(0, 1 - progress / 0.30).toFixed(3);
      // 35%→100%  alcoves fade in as particles finish scattering
      if (alcoves) alcoves.style.opacity =
        String(Math.min(1, Math.max(0, (progress - 0.35) / 0.65)));
      if (progress <= 0.05) return;
      // 15%→100%  particles scatter outward
      const t  = Math.max(0, (progress - 0.15) / 0.85);
      const te = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
      particles.forEach(p => {
        const alpha = (1 - te) * 0.94;
        if (alpha < 0.01) return;
        cx.globalAlpha = alpha;
        cx.fillStyle   = p.col;
        cx.fillRect(p.ox + p.vx * te - p.sz / 2, p.oy + p.vy * te - p.sz / 2, p.sz, p.sz);
      });
      cx.globalAlpha = 1;
    }

    function reset () {
      painting = false;                         // block any lagging scrub onUpdate calls
      cv.style.opacity = '0'; cx.clearRect(0, 0, W, H);
      if (bg)      bg.style.opacity      = '1';
      if (inner)   inner.style.opacity   = '1';
      if (alcoves) alcoves.style.opacity = '';
    }

    window.addEventListener('resize', () => { ready = false; init(); }, { passive: true });
    window.addEventListener('spektr:ready', () => {
      init();
      ScrollTrigger.create({
        trigger    : '.hero',
        start      : 'top top',
        end        : '+=100%',
        pin        : true,
        pinSpacing : false,
        scrub      : true,
        onEnter    ()     { painting = true; },
        onEnterBack()     { painting = true; },
        onUpdate   (self) { paint(self.progress); },
        onLeave    ()     { reset(); },
        onLeaveBack()     { reset(); },
      });
    });
  })();

  /* ================================================================
     FX2 — RAIN ON VISOR  (Creed section is in viewport)
     Fixed canvas toggled by IntersectionObserver. Two layers:
       • Streaks  — fast diagonal lines (falling rain)
       • Beads    — slow circular droplets sitting on the glass
     ================================================================ */
  (function creedRain () {
    if (noMotion()) return;
    const creed = document.querySelector('.creed-home');
    if (!creed) return;

    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;cursor:auto;z-index:10;opacity:0;transition:opacity 0.9s ease;';
    document.body.appendChild(cv);
    const cx = cv.getContext('2d');
    let W = cv.width = innerWidth, H = cv.height = innerHeight;
    let rafId = null, running = false;
    const streaks = [], beads = [];

    window.addEventListener('resize', () => {
      W = cv.width = innerWidth; H = cv.height = innerHeight;
      reset();
    }, { passive: true });

    function mkStreak (randomY) {
      return {
        x    : Math.random() * W * 1.15,
        y    : randomY ? Math.random() * H : -20 - Math.random() * H * 0.4,
        len  : 10 + Math.random() * 30,
        speed: 3.5 + Math.random() * 7,
        alpha: 0.07 + Math.random() * 0.11,
        tilt : Math.PI / 2 + (Math.random() - 0.5) * 0.22,  // nearly vertical, slight lean
      };
    }
    function mkBead () {
      return {
        x: Math.random() * W,  y: Math.random() * H,
        r: 1.2 + Math.random() * 2.5,
        vy: 0.06 + Math.random() * 0.28,
        alpha: 0.05 + Math.random() * 0.09,
        wb: Math.random() * Math.PI * 2,   // wobble phase
        wsp: 0.008 + Math.random() * 0.018,
      };
    }
    function reset () {
      streaks.length = beads.length = 0;
      for (let i = 0; i < 80; i++) streaks.push(mkStreak(true));
      for (let i = 0; i < 30; i++) beads.push(mkBead());
    }
    reset();

    function frame () {
      cx.clearRect(0, 0, W, H);

      streaks.forEach(s => {
        const dx = Math.cos(s.tilt) * s.len, dy = Math.sin(s.tilt) * s.len;
        const g = cx.createLinearGradient(s.x, s.y, s.x + dx, s.y + dy);
        g.addColorStop(0, `rgba(175,210,245,0)`);
        g.addColorStop(1, `rgba(175,210,245,${s.alpha})`);
        cx.strokeStyle = g; cx.lineWidth = 0.7;
        cx.beginPath(); cx.moveTo(s.x, s.y); cx.lineTo(s.x + dx, s.y + dy); cx.stroke();
        s.x += dx / s.len * s.speed * 0.14;
        s.y += s.speed;
        if (s.y > H + 50) Object.assign(s, mkStreak(false));
      });

      beads.forEach(b => {
        b.wb += b.wsp;
        b.y  += b.vy;
        if (b.y > H + 10) { Object.assign(b, mkBead()); b.y = 0; }
        const bx = b.x + Math.sin(b.wb) * 1.5;
        // bead body
        cx.beginPath(); cx.arc(bx, b.y, b.r, 0, Math.PI * 2);
        cx.fillStyle = `rgba(195,220,248,${b.alpha})`; cx.fill();
        // tiny specular highlight
        cx.beginPath(); cx.arc(bx - b.r * 0.28, b.y - b.r * 0.32, b.r * 0.38, 0, Math.PI * 2);
        cx.fillStyle = `rgba(255,255,255,${b.alpha * 1.6})`; cx.fill();
      });

      if (running) rafId = requestAnimationFrame(frame);
    }

    function start () {
      if (running) return;
      running = true; cv.style.opacity = '1';
      rafId = requestAnimationFrame(frame);
    }
    function stop () {
      running = false; cv.style.opacity = '0';
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? start() : stop());
    }, { threshold: 0.05 }).observe(creed);
  })();

  /* ================================================================
     FX4 — SPLIT-FLAP SCRAMBLE  (.s360-title)
     Scroll-driven: chars scramble while the 360° inspection spins,
     resolving left→right as progress increases. Fully reversible —
     scrolling back un-resolves chars and restarts the scramble.
     ================================================================ */
  (function splitFlap () {
    if (noMotion()) return;
    const el = document.querySelector('.s360-title');
    if (!el || !hasST || !window.gsap) return;

    const CHARS   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%-+';
    const SWAP_MS = 80; // ms between random glyph swaps

    // Parse innerHTML preserving <br>, wrap every non-space char in a span
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((line, li) =>
      [...line].map(ch =>
        ch.trim() === ''
          ? '<span class="sf-sp">&nbsp;</span>'
          : `<span class="sf-char" data-f="${ch}"> </span>`
      ).join('') + (li < parts.length - 1 ? '<br>' : '')
    ).join('');

    const spans    = [...el.querySelectorAll('.sf-char')];
    const N        = spans.length;
    const resolved = new Array(N).fill(false);
    let   rafId = null, lastSwap = 0, active = false;

    el.classList.remove('reveal');
    el.style.opacity = '0';

    /* ---- scramble RAF loop: randomises every unresolved char ---- */
    function scrambleLoop (ts) {
      if (!active) return;
      if (ts - lastSwap >= SWAP_MS) {
        lastSwap = ts;
        spans.forEach((sp, i) => {
          if (!resolved[i])
            sp.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        });
      }
      rafId = requestAnimationFrame(scrambleLoop);
    }

    function startLoop () {
      if (active) return;
      active = true;
      rafId = requestAnimationFrame(scrambleLoop);
    }

    function stopLoop () {
      active = false;
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    function resolveChar (i) {
      if (resolved[i]) return;
      resolved[i] = true;
      spans[i].textContent = spans[i].dataset.f;
      gsap.fromTo(spans[i],
        { scaleY: 0.05 },
        { scaleY: 1, duration: 0.14, ease: 'back.out(3)' }
      );
    }

    function unresolveChar (i) {
      if (!resolved[i]) return;
      resolved[i] = false;
      gsap.killTweensOf(spans[i]);
      gsap.set(spans[i], { scaleY: 1 });
      spans[i].textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    window.addEventListener('spektr:ready', () => {
      ScrollTrigger.create({
        trigger : '#reveal360',
        start   : 'top top',
        end     : '+=240%',
        scrub   : true,
        onEnter     () { el.style.opacity = '1'; startLoop(); },
        onEnterBack () { el.style.opacity = '1'; startLoop(); },
        onLeave     () {
          // all done — finalise every char and stop scrambling
          stopLoop();
          spans.forEach((_, i) => resolveChar(i));
        },
        onLeaveBack () {
          // rewound before the section — reset everything
          stopLoop();
          el.style.opacity = '0';
          resolved.fill(false);
          spans.forEach(sp => {
            gsap.killTweensOf(sp);
            gsap.set(sp, { scaleY: 1 });
            sp.textContent = ' ';
          });
        },
        onUpdate (self) {
          const p = self.progress;
          // each char resolves when progress passes its slice
          spans.forEach((_, i) => {
            if (p >= (i + 1) / N) resolveChar(i);
            else                  unresolveChar(i);
          });
        },
      });
    });
  })();

})();
