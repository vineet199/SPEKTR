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
    if (!noMotion()) draw(); else { /* one static frame */ draw(); cancelAnimationFrame(raf); }
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
    const rooms = track.querySelectorAll('.room');
    const n = rooms.length;
    const pbar = document.querySelector('.alcoves .progress .ptrack i');
    const pnum = document.querySelector('.alcoves .progress .pnum');
    let cur = 0;
    gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: '.alcoves', start: 'top top', end: () => '+=' + (track.scrollWidth - window.innerWidth + window.innerHeight),
        scrub: 1, pin: '.alcoves .pin', pinType: 'transform', anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const prog = self.progress;
          if (pbar) pbar.style.transform = `scaleX(${0.25 + prog*0.75})`, pbar.style.transformOrigin='left', pbar.style.width='100%';
          const idx = Math.min(n-1, Math.floor(prog * n + 0.0001));
          if (idx !== cur){ cur = idx; if (window.SpektrSound) window.SpektrSound.click(); if (pnum) pnum.textContent = String(idx+1).padStart(2,'0') + ' / 0' + n; }
        }
      }
    });
    // subtle product parallax per room
    rooms.forEach((room) => {
      const prod = room.querySelector('.product');
      if (prod) gsap.fromTo(prod, { y: 40 }, { y: -40, ease:'none', scrollTrigger: { trigger: '.alcoves', start:'top top', end:()=>'+='+(track.scrollWidth - innerWidth + innerHeight), scrub: 1 } });
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
})();
