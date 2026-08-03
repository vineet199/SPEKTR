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
})();
