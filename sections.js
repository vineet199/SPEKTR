/* ============================================================
   SPEKTR RACING — New Sections: ANATOMY · VELOCITY · CIRCUIT
   ============================================================ */
(function () {
  'use strict';
  const hasST   = !!(window.gsap && window.ScrollTrigger);
  const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const noMot   = () => document.body.classList.contains('no-motion') || reduce;

  /* ============================================================
     ANATOMY — scroll-scrubbed exploded gear view
  ============================================================ */
  const anSection = document.querySelector('.anatomy');
  if (anSection && hasST && !noMot()) {
    const layers  = [...anSection.querySelectorAll('.an-layer')];
    const lbls    = [...anSection.querySelectorAll('.an-lbl')];
    const counter = anSection.querySelector('.an-counter');
    const anHud   = anSection.querySelector('.an-hud');

    // Vertical offsets (px) from the stacked center: top layers negative, bottom positive
    const offsets = [-200, -100, 0, 100, 200];
    const names   = ['OUTER SHELL', 'ARAMID LINING', 'CE-1 ARMOUR', 'WIND BLOCKER', 'MESH LINER'];

    // Prime initial state via GSAP so transforms don't conflict with CSS
    gsap.set(layers, { y: 0 });
    gsap.set(lbls,   { opacity: 0, x: -14 });
    if (anHud) gsap.set(anHud, { opacity: 0 });

    const tl = gsap.timeline();
    // Fan layers apart
    layers.forEach((layer, i) => {
      tl.to(layer, { y: offsets[i], duration: 1, ease: 'none' }, 0);
    });
    // Staggered label fade-in starts at 30% of the scroll
    lbls.forEach((lbl, i) => {
      tl.fromTo(lbl,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
        0.25 + i * 0.1
      );
    });
    // HUD fade in
    if (anHud) {
      tl.to(anHud, { opacity: 1, duration: 0.3 }, 0.1);
    }

    ScrollTrigger.create({
      trigger: anSection,
      start: 'top top',
      end: '+=240%',
      pin: '.anatomy-pin',
      pinType: 'transform',
      anticipatePin: 1,
      scrub: 1.4,
      animation: tl,
      invalidateOnRefresh: true,
      onUpdate(self) {
        if (!counter) return;
        const idx = Math.min(4, Math.floor(self.progress * 5.5));
        counter.textContent = names[Math.min(4, idx)];
      },
    });
  } else if (anSection && noMot()) {
    // Reduced motion: show everything static
    const layers = [...anSection.querySelectorAll('.an-layer')];
    const lbls   = [...anSection.querySelectorAll('.an-lbl')];
    const offs   = [-180, -90, 0, 90, 180];
    layers.forEach((l, i) => { l.style.transform = `translateY(${offs[i]}px)`; });
    lbls.forEach(l => { l.style.opacity = '1'; l.style.transform = 'none'; });
  }

  /* ============================================================
     VELOCITY — animated stat counters
  ============================================================ */
  const velStats = [...document.querySelectorAll('.vel-stat')];

  function countUp(el, target, isDown, duration) {
    const start    = isDown ? 82 : 0;
    const startTs  = performance.now();
    const GLYPHS   = '0123456789';
    function frame(now) {
      const t    = Math.min(1, (now - startTs) / duration);
      const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
      const cur  = Math.round(isDown ? start * (1 - ease) : target * ease);
      // Scramble last digit until 85% resolved
      const s    = String(cur);
      el.textContent = t < 0.85
        ? s.slice(0, -1) + GLYPHS[Math.floor(Math.random() * 10)]
        : s;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = String(isDown ? 0 : target);
    }
    requestAnimationFrame(frame);
  }

  if (velStats.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const stat    = entry.target;
        const isRaw   = stat.dataset.raw === 'true';
        const isDown  = stat.dataset.down === 'true';
        const val     = parseInt(stat.dataset.val, 10);
        const numEl   = stat.querySelector('.vs-count');
        const bar     = stat.querySelector('.vs-bar i');

        // Reveal number
        const vsNum = stat.querySelector('.vs-num');
        if (vsNum) {
          vsNum.style.transition = 'opacity .45s var(--ease-out), transform .45s var(--ease-out)';
          vsNum.style.opacity    = '1';
          vsNum.style.transform  = 'translateY(0)';
        }
        // Count animation (skip for static text like "CE-1")
        if (!isRaw && numEl && !noMot()) countUp(numEl, val, isDown, 1100);
        else if (numEl && !isRaw) numEl.textContent = isDown ? '0' : String(val);

        // Progress bar sweep
        if (bar) {
          bar.style.transition = 'transform 1.1s cubic-bezier(0.16,1,0.3,1) .15s';
          bar.style.transform  = 'scaleX(1)';
        }
      });
    }, { threshold: 0.55 });

    velStats.forEach(s => {
      const vsNum = s.querySelector('.vs-num');
      if (vsNum) { vsNum.style.opacity = '0'; vsNum.style.transform = 'translateY(18px)'; }
      const bar = s.querySelector('.vs-bar i');
      if (bar)  { bar.style.transformOrigin = 'left'; bar.style.transform = 'scaleX(0)'; }
      obs.observe(s);
    });
  }

  /* ============================================================
     CIRCUIT — India riding routes interactive map
  ============================================================ */
  const cirSection = document.querySelector('.circuit');
  if (!cirSection) return;

  const ROUTES = {
    'leh-manali': {
      terrain: 'HIGH ALTITUDE PASS', distance: '490 KM', elevation: '↑ 5,328M PEAK',
      conditions: 'Thin air, cold, unpaved passes Jul–Sep only',
      kit: ['Riding Zipper Hoodie', 'Base Liner', 'Balaclava'],
      desc: 'Manali to Leh via Baralacha La and Tanglang La. The crown jewel of Indian motorcycle touring — where preparation is not optional and the gear earns every rupee.',
    },
    'spiti': {
      terrain: 'MOUNTAIN CIRCUIT', distance: '320 KM', elevation: '↑ 4,551M PEAK',
      conditions: 'Remote valley, cold mornings, loose gravel',
      kit: ['Riding Pullover', 'Riding Jeans', 'Balaclava'],
      desc: 'Shimla to Kaza via Reckong Peo — India\'s most desolate valley circuit. The kind of ride that changes how you think about gear. Every layer matters.',
    },
    'mumbai-goa': {
      terrain: 'COASTAL HIGHWAY', distance: '590 KM', elevation: '↑ 820M PEAK',
      conditions: 'Humid, monsoon-possible, 35°C+',
      kit: ['Basic Hoodie', 'Riding Cargo', 'Base Liner'],
      desc: 'NH66 hugs the Konkan coast from Mumbai to Goa — 12 hours of ocean air, ghats, and bridges. India\'s most ridden weekend escape.',
    },
    'coorg': {
      terrain: 'HILL CIRCUIT', distance: '280 KM', elevation: '↑ 1,748M PEAK',
      conditions: 'Mist, light rain, moderate cold',
      kit: ['Riding Zipper Hoodie', 'Riding Jeans'],
      desc: 'Bengaluru to Madikeri through Mysuru — coffee estates, mist-draped ghats, roads that reward precision. SPEKTR\'s home circuit.',
    },
    'ecr': {
      terrain: 'COASTAL FLAT', distance: '170 KM', elevation: '↑ 42M PEAK',
      conditions: 'Hot, humid, crosswinds all day',
      kit: ['Basic Hoodie', 'Riding Cargo'],
      desc: 'Chennai to Pondicherry along East Coast Road — flat, fast, and unforgiving in the heat. Perfect for testing how your base layer actually holds up.',
    },
  };

  // Animate route paths on section enter via stroke-dashoffset
  const routePaths = [...cirSection.querySelectorAll('.route-path')];
  routePaths.forEach(p => {
    const len = p.getTotalLength ? p.getTotalLength() : 200;
    p.style.strokeDasharray  = len;
    p.style.strokeDashoffset = len;
    p.style.transition       = 'none';
  });

  const pathObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    pathObs.disconnect();
    routePaths.forEach((p, i) => {
      const len = parseFloat(p.style.strokeDasharray) || 200;
      setTimeout(() => {
        p.style.transition      = 'stroke-dashoffset 1.3s cubic-bezier(0.16,1,0.3,1)';
        p.style.strokeDashoffset = '0';
      }, 120 + i * 200);
    });
  }, { threshold: 0.25 });
  pathObs.observe(cirSection);

  // Route selection UI
  const routeBtns = [...cirSection.querySelectorAll('.cir-route')];
  const cdInner   = document.getElementById('cdInner');
  const mapGroups = [...cirSection.querySelectorAll('.route-group')];

  function renderRoute(key) {
    const data = ROUTES[key];
    if (!data || !cdInner) return;
    mapGroups.forEach(g => g.classList.toggle('route-active', g.dataset.route === key));
    routeBtns.forEach(b => b.classList.toggle('active', b.dataset.route === key));
    cdInner.innerHTML = `
      <div class="cd-meta">
        <span class="cd-badge">${data.terrain}</span>
        <span class="cd-dist">${data.distance}</span>
        <span class="cd-elev">${data.elevation}</span>
      </div>
      <p class="cd-desc">${data.desc}</p>
      <div class="cd-row"><span class="cd-lbl">CONDITIONS</span><span class="cd-val">${data.conditions}</span></div>
      <div class="cd-row cd-kit-row">
        <span class="cd-lbl">RECOMMENDED KIT</span>
        <div class="cd-tags">${data.kit.map(k => `<span class="cd-tag">${k}</span>`).join('')}</div>
      </div>`;
  }

  routeBtns.forEach(btn => btn.addEventListener('click', () => renderRoute(btn.dataset.route)));
  renderRoute('leh-manali'); // init

})();
