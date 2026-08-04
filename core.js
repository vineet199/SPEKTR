/* ============================================================
   SPEKTR RACING — CORE (shared shell)
   ============================================================ */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll piped to GSAP ticker ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, lerp: 0.09 });
    if (hasGSAP) {
      lenis.on('scroll', () => ScrollTrigger.update());
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  window.__lenis = lenis;

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  if (loader) {
    const bar = loader.querySelector('.bar i');
    const pct = loader.querySelector('.pct');
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 16 + 6;
      if (p >= 100) { p = 100; clearInterval(tick); finish(); }
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = String(Math.floor(p)).padStart(3, '0');
    }, 160);
    function finish() {
      setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.add('loaded');
        window.dispatchEvent(new Event('spektr:ready'));
      }, 280);
    }
    // safety
    setTimeout(() => { if (!loader.classList.contains('done')) { clearInterval(tick); if(bar) bar.style.width='100%'; finish(); } }, 3200);
  } else {
    window.dispatchEvent(new Event('spektr:ready'));
  }

  /* ---------- Custom cursor ---------- */
  if (window.matchMedia('(pointer:fine)').matches) {
    const ring = document.createElement('div'); ring.className = 'cursor';
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    document.body.append(ring, dot);
    let rx = innerWidth/2, ry = innerHeight/2, dx = rx, dy = ry;
    addEventListener('mousemove', (e) => { dx = e.clientX; dy = e.clientY; dot.style.transform = `translate(${dx}px,${dy}px)`; });
    (function loop(){ rx += (dx-rx)*0.18; ry += (dy-ry)*0.18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    const hot = 'a,button,.reel,.card,.tab,input,.btn,[data-hot]';
    document.addEventListener('mouseover', (e)=>{ if (e.target.closest(hot)) ring.classList.add('hot'); });
    document.addEventListener('mouseout', (e)=>{ if (e.target.closest(hot)) ring.classList.remove('hot'); });
  }

  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => { if (nav) nav.classList.toggle('scrolled', scrollY > 40); };
  addEventListener('scroll', onScroll); onScroll();

  /* ---------- Mobile menu ---------- */
  if (nav) {
    const links = nav.querySelector('.links');
    const navRight = nav.querySelector('.nav-right');
    if (links && navRight) {
      const burger = document.createElement('button');
      burger.className = 'nav-burger'; burger.setAttribute('aria-label', 'Menu'); burger.setAttribute('aria-expanded', 'false');
      burger.innerHTML = '<span class="blabel">Menu</span><span class="bl"><span></span><span></span></span>';
      navRight.appendChild(burger);

      const menu = document.createElement('nav');
      menu.className = 'mobile-menu';
      const items = Array.from(links.querySelectorAll('a'));
      menu.innerHTML = items.map((a, i) => `<a class="mlink" href="${a.getAttribute('href')}"><span class="mi">0${i+1}</span>${a.textContent}</a>`).join('')
        + '<div class="m-foot"><span class="tag">Wear Confidence · Ride Fearless</span></div>';
      document.body.appendChild(menu);

      const blabel = burger.querySelector('.blabel');
      const close = () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded','false'); if (blabel) blabel.textContent = 'Menu'; if (window.__lenis) window.__lenis.start(); };
      const toggle = () => {
        const open = !document.body.classList.contains('menu-open');
        document.body.classList.toggle('menu-open', open);
        burger.setAttribute('aria-expanded', String(open));
        if (blabel) blabel.textContent = open ? 'Close' : 'Menu';
        if (window.__lenis) { open ? window.__lenis.stop() : window.__lenis.start(); }
        if (window.SpektrSound) window.SpektrSound.click();
      };
      burger.addEventListener('click', toggle);
      menu.querySelectorAll('.mlink').forEach(a => a.addEventListener('click', close));
      addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }
  }

  /* ---------- Reveal on view ---------- */
  const io = new IntersectionObserver((ents) => {
    ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('shown'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- SOUND MANAGER (synthesized ambient) ---------- */
  const SoundManager = (function(){
    let ctx, master, layers = [], on = false, started = false;
    function build(){
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      // sub-bass drone (heartbeat-ish)
      const sub = ctx.createOscillator(); sub.type='sine'; sub.frequency.value=46;
      const subG = ctx.createGain(); subG.gain.value=0.12; sub.connect(subG).connect(master); sub.start();
      // mechanical hum
      const hum = ctx.createOscillator(); hum.type='sawtooth'; hum.frequency.value=58;
      const humF = ctx.createBiquadFilter(); humF.type='lowpass'; humF.frequency.value=180;
      const humG = ctx.createGain(); humG.gain.value=0.05; hum.connect(humF).connect(humG).connect(master); hum.start();
      // wind: filtered noise
      const buf = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate);
      const d = buf.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
      const noise = ctx.createBufferSource(); noise.buffer=buf; noise.loop=true;
      const nf = ctx.createBiquadFilter(); nf.type='bandpass'; nf.frequency.value=620; nf.Q.value=0.7;
      const ng = ctx.createGain(); ng.gain.value=0.04; noise.connect(nf).connect(ng).connect(master); noise.start();
      // slow LFO on wind
      const lfo = ctx.createOscillator(); lfo.frequency.value=0.08; const lfoG=ctx.createGain(); lfoG.gain.value=300;
      lfo.connect(lfoG).connect(nf.frequency); lfo.start();
      layers = [subG, humG, ng];
      started = true;
    }
    return {
      toggle(){
        if (!started) build();
        if (ctx.state === 'suspended') ctx.resume();
        on = !on;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(on?0.5:0, ctx.currentTime + 0.6);
        return on;
      },
      click(){ // gear-click transition sound
        if (!started || !on) return;
        const o = ctx.createOscillator(); o.type='square'; o.frequency.value=1400;
        const g = ctx.createGain(); g.gain.value=0.0; o.connect(g).connect(master);
        const t = ctx.currentTime; g.gain.setValueAtTime(0.06,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.07);
        o.start(t); o.stop(t+0.08);
      },
      get isOn(){ return on; }
    };
  })();
  window.SpektrSound = SoundManager;

  const sbtn = document.querySelector('.sound-btn');
  if (sbtn) sbtn.addEventListener('click', () => { const on = SoundManager.toggle(); sbtn.classList.toggle('on', on); sbtn.querySelector('.txt').textContent = on ? 'Sound On' : 'Sound Off'; });

  /* ---------- TWEAKS PANEL ---------- */
  const TWEAKS = /*EDITMODE-BEGIN*/{
    "accent": "#D72B2B",
    "heroLine1": "BUILT FOR",
    "heroLine2": "THE LIMIT.",
    "motion": "On",
    "grain": 0.06,
    "scan": 0.4
  }/*EDITMODE-END*/;

  function applyTweaks(t){
    const r = document.documentElement.style;
    if (t.accent){ r.setProperty('--spektr-red', t.accent);
      // recompute glow rgb
      const m = t.accent.replace('#',''); const bigint = parseInt(m.length===3? m.split('').map(c=>c+c).join(''):m,16);
      r.setProperty('--red-glow', `${(bigint>>16)&255}, ${(bigint>>8)&255}, ${bigint&255}`); }
    if (t.grain!=null) r.setProperty('--grain-strength', t.grain);
    if (t.scan!=null) r.setProperty('--scan-strength', t.scan);
    const l1 = document.querySelector('[data-hero-l1]'); const l2 = document.querySelector('[data-hero-l2]');
    if (l1 && t.heroLine1!=null) l1.textContent = t.heroLine1;
    if (l2 && t.heroLine2!=null) l2.innerHTML = t.heroLine2.replace(/\.$/, '<em>.</em>');
    document.body.classList.toggle('no-motion', t.motion === 'Off');
  }
  applyTweaks(TWEAKS);
  window.__applyTweaks = applyTweaks; window.__tweaks = TWEAKS;

  function persist(edits){ try { window.parent.postMessage({type:'__edit_mode_set_keys', edits}, '*'); } catch(e){} }

  function buildPanel(){
    if (document.getElementById('tweaks')) return;
    const isHome = !!document.querySelector('[data-hero-l1]');
    const p = document.createElement('div'); p.id='tweaks';
    p.innerHTML = `
      <div class="tk-head"><b>Tweaks</b><button id="tkClose">✕</button></div>
      <div class="tk-body">
        <div class="tk"><label>Accent / Ignition</label><div class="swatches" data-k="accent">
          ${['#D72B2B','#EE3024','#FF5A1F','#E8C24B','#3D7DFF'].map(c=>`<button data-v="${c}" style="background:${c}" class="${c===TWEAKS.accent?'sel':''}"></button>`).join('')}
        </div></div>
        ${isHome?`<div class="tk"><label>Hero line 1</label><input type="text" data-k="heroLine1" value="${TWEAKS.heroLine1}"></div>
        <div class="tk"><label>Hero line 2</label><input type="text" data-k="heroLine2" value="${TWEAKS.heroLine2}"></div>`:''}
        <div class="tk"><label>Motion</label><div class="seg" data-k="motion">
          ${['On','Off'].map(v=>`<button data-v="${v}" class="${v===TWEAKS.motion?'sel':''}">${v}</button>`).join('')}
        </div></div>
        <div class="tk"><label>Film grain · <span data-o="grain">${TWEAKS.grain}</span></label><input type="range" min="0" max="0.18" step="0.01" value="${TWEAKS.grain}" data-k="grain"></div>
        <div class="tk"><label>Scanlines · <span data-o="scan">${TWEAKS.scan}</span></label><input type="range" min="0" max="1" step="0.05" value="${TWEAKS.scan}" data-k="scan"></div>
      </div>`;
    document.body.appendChild(p);
    p.querySelector('#tkClose').onclick = () => { p.classList.remove('open'); try{window.parent.postMessage({type:'__edit_mode_dismissed'},'*');}catch(e){} };
    p.querySelectorAll('.swatches button').forEach(b=>b.onclick=()=>{ const k=b.parentElement.dataset.k,v=b.dataset.v; b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); TWEAKS[k]=v; applyTweaks(TWEAKS); persist({[k]:v}); });
    p.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{ const k=b.parentElement.dataset.k,v=b.dataset.v; b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); TWEAKS[k]=v; applyTweaks(TWEAKS); persist({[k]:v}); });
    p.querySelectorAll('input[type=text]').forEach(i=>i.oninput=()=>{ const k=i.dataset.k; TWEAKS[k]=i.value; applyTweaks(TWEAKS); persist({[k]:i.value}); });
    p.querySelectorAll('input[type=range]').forEach(i=>i.oninput=()=>{ const k=i.dataset.k,v=parseFloat(i.value); TWEAKS[k]=v; const o=p.querySelector(`[data-o="${k}"]`); if(o)o.textContent=v; applyTweaks(TWEAKS); persist({[k]:v}); });
    // drag
    const head = p.querySelector('.tk-head'); let dragging=false,ox,oy;
    head.addEventListener('mousedown',e=>{ if(e.target.tagName==='BUTTON')return; dragging=true; ox=e.clientX-p.offsetLeft; oy=e.clientY-p.offsetTop; });
    addEventListener('mousemove',e=>{ if(!dragging)return; p.style.left=(e.clientX-ox)+'px'; p.style.top=(e.clientY-oy)+'px'; p.style.right='auto'; });
    addEventListener('mouseup',()=>dragging=false);
  }

  addEventListener('message', (e)=>{
    const d = e.data || {};
    if (d.type === '__activate_edit_mode'){ buildPanel(); document.getElementById('tweaks').classList.add('open'); }
    else if (d.type === '__deactivate_edit_mode'){ const p=document.getElementById('tweaks'); if(p)p.classList.remove('open'); }
  });
  try { window.parent.postMessage({type:'__edit_mode_available'},'*'); } catch(e){}

  /* ---------- SPEKTR hover highlight — wrap every text occurrence ---------- */
  (function wrapSpektr () {
    const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','SVG','TEXTAREA','INPUT']);
    const RE   = /SPEKTR/g;

    function walk (node) {
      if (node.nodeType === 3) {               // text node
        if (!RE.test(node.textContent)) return;
        RE.lastIndex = 0;
        const text = node.textContent;
        const frag = document.createDocumentFragment();
        let last = 0, m;
        RE.lastIndex = 0;
        while ((m = RE.exec(text)) !== null) {
          if (m.index > last)
            frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          const sp = document.createElement('span');
          sp.className   = 'spektr-hl';
          sp.textContent = m[0];
          frag.appendChild(sp);
          last = RE.lastIndex;
        }
        if (last < text.length)
          frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      } else if (
        node.nodeType === 1 &&
        !SKIP.has(node.tagName) &&
        !node.classList.contains('spektr-hl')
      ) {
        // snapshot children before walking (replaceChild shifts live list)
        Array.from(node.childNodes).forEach(walk);
      }
    }

    // Run after full DOM is painted so catalog-injected content is present
    window.addEventListener('spektr:ready', () => walk(document.body));
  })();

  /* ---------- SPEKTR brand-word — diagonal letter-to-letter lightning ---------- */
  (function spektrWordStrand () {
    const cv = document.createElement('canvas');
    cv.id    = 'spektr-strand';
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(cv);
    const cx = cv.getContext('2d');
    let W = cv.width = innerWidth;
    let H = cv.height = innerHeight;
    window.addEventListener('resize', () => { W = cv.width = innerWidth; H = cv.height = innerHeight; }, { passive: true });

    let bolt    = null;
    let frameId = null;
    let hovered = false;

    // Midpoint displacement in both axes — makes it read as a jagged diagonal slash
    function mkBolt (x1, y1, x2, y2, depth, segs) {
      if (depth <= 0) { segs.push([x1, y1, x2, y2]); return; }
      const len = Math.hypot(x2 - x1, y2 - y1);
      const mx  = (x1 + x2) / 2 + (Math.random() - 0.5) * len * 0.28;
      const my  = (y1 + y2) / 2 + (Math.random() - 0.5) * len * 0.28;
      mkBolt(x1, y1, mx, my, depth - 1, segs);
      mkBolt(mx, my, x2, y2, depth - 1, segs);
    }

    // Use Range API to get real per-character bounding boxes — no DOM rewrite needed
    function letterRects () {
      const word = document.querySelector('.brand .word');
      if (!word) return null;
      // Descend into child nodes to find the raw text node
      function findTextNode (node) {
        for (const c of node.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim()) return c;
          if (c.nodeType === 1) { const t = findTextNode(c); if (t) return t; }
        }
        return null;
      }
      const tn = findTextNode(word);
      if (!tn) return null;
      return tn.textContent.split('').map((_, i) => {
        const range = document.createRange();
        range.setStart(tn, i); range.setEnd(tn, i + 1);
        return range.getBoundingClientRect();
      });
    }

    function spawn () {
      const rects = letterRects();
      if (!rects || rects.length < 2) return;

      // Pick two distinct letter indices
      const iA = Math.floor(Math.random() * rects.length);
      let iB;
      do { iB = Math.floor(Math.random() * rects.length); } while (iB === iA);

      const rA = rects[iA], rB = rects[iB];
      // Origin: near the top of letter A, x jittered within the glyph
      const x0 = rA.left + rA.width * (0.2 + Math.random() * 0.6);
      const y0 = rA.top  + rA.height * (Math.random() * 0.25);
      // Destination: near the bottom of letter B
      const x1 = rB.left + rB.width * (0.2 + Math.random() * 0.6);
      const y1 = rB.bottom - rB.height * (Math.random() * 0.25);

      const rawSegs = [];
      mkBolt(x0, y0, x1, y1, 4, rawSegs);

      // Precompute cumulative path length for the progressive-reveal technique
      let cum = 0;
      const segs = rawSegs.map(([ax, ay, bx, by]) => {
        const len = Math.hypot(bx - ax, by - ay);
        const s = { ax, ay, bx, by, start: cum, end: cum + len };
        cum += len;
        return s;
      });

      bolt = {
        segs,
        totalLen:   cum,
        phase:      'grow',
        progress:   0,
        life:       1.0,
        growRate:   1 / (24 + Math.random() * 14), // ~24-38 frames to slash across
        holdFrames: 4 + Math.floor(Math.random() * 5),
        heldFrames: 0,
        decayRate:  1 / (12 + Math.random() * 10), // ~12-22 frames to dissolve
      };

      if (!frameId) frameId = requestAnimationFrame(draw);
    }

    // Draw only the portion of each segment that falls within the revealed length
    function drawSeg (seg, revealed) {
      if (seg.start >= revealed) return;
      cx.beginPath();
      cx.moveTo(seg.ax, seg.ay);
      if (seg.end <= revealed) {
        cx.lineTo(seg.bx, seg.by);
      } else {
        const t = (revealed - seg.start) / (seg.end - seg.start);
        cx.lineTo(seg.ax + (seg.bx - seg.ax) * t, seg.ay + (seg.by - seg.ay) * t);
      }
      cx.stroke();
    }

    function draw () {
      cx.clearRect(0, 0, W, H);

      if (!bolt) {
        frameId = null;
        return;
      }
      const s = bolt;

      // Phase state machine
      if (s.phase === 'grow') {
        s.progress = Math.min(1, s.progress + s.growRate);
        if (s.progress >= 1) { s.phase = 'hold'; s.heldFrames = 0; }
      } else if (s.phase === 'hold') {
        s.heldFrames++;
        if (s.heldFrames >= s.holdFrames) s.phase = 'fade';
      } else {
        s.life -= s.decayRate;
        if (s.life <= 0) {
          bolt = null;
          // Chain immediately into next bolt if still hovered
          if (hovered) spawn();
          frameId = requestAnimationFrame(draw);
          return;
        }
      }

      // Squared falloff on fade — stays vivid longer then drops off softly
      const alpha    = s.phase === 'fade' ? s.life * s.life : 1.0;
      const revealed = s.progress * s.totalLen;

      // Layer 1 — diffuse dark red halo
      cx.strokeStyle = `rgba(160,10,10,${(alpha * 0.50).toFixed(3)})`;
      cx.lineWidth   = 2.0;
      cx.shadowColor = '#8B0000';
      cx.shadowBlur  = 8;
      s.segs.forEach(seg => drawSeg(seg, revealed));

      // Layer 2 — dark red core channel
      cx.strokeStyle = `rgba(200,25,25,${(alpha * 0.78).toFixed(3)})`;
      cx.lineWidth   = 0.8;
      cx.shadowBlur  = 3;
      s.segs.forEach(seg => drawSeg(seg, revealed));

      // Layer 3 — pale blush filament at the very center
      cx.strokeStyle = `rgba(230,120,120,${(alpha * 0.55).toFixed(3)})`;
      cx.lineWidth   = 0.3;
      cx.shadowBlur  = 1;
      s.segs.forEach(seg => drawSeg(seg, revealed));

      cx.shadowBlur = 0;
      frameId = requestAnimationFrame(draw);
    }

    window.addEventListener('spektr:ready', () => {
      const word = document.querySelector('.brand .word');
      if (!word) return;
      word.addEventListener('mouseenter', () => {
        hovered = true;
        spawn();
      });
      word.addEventListener('mouseleave', () => {
        hovered = false;
        // Let the current bolt finish its fade naturally — don’t kill it
      });
    });
  })();

})();
