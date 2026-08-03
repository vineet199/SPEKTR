/* ============================================================
   SPEKTR RACING — ABOUT behaviour
   Mirrors the homepage animation vocabulary:
   split-reveal headlines, scroll reveals, scrubbed timeline.
   ============================================================ */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasST = window.gsap && window.ScrollTrigger;

  /* ---- split headlines into sliding word units (same as homepage) ---- */
  function splitHead(el) {
    var out = [];
    el.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (w) {
          if (w === '') return;
          if (w.trim() === '') { out.push(document.createTextNode(w)); return; }
          var wrap = document.createElement('span'); wrap.className = 'word';
          var inner = document.createElement('span'); inner.textContent = w;
          wrap.appendChild(inner); out.push(wrap);
        });
      } else if (node.nodeName === 'BR') {
        out.push(document.createElement('br'));
      } else {
        var wrap2 = document.createElement('span'); wrap2.className = 'word';
        wrap2.appendChild(node.cloneNode(true)); out.push(wrap2);
      }
    });
    el.innerHTML = '';
    out.forEach(function (n) { el.appendChild(n); });
    var i = 0;
    el.querySelectorAll(':scope > .word > span').forEach(function (s) {
      s.style.transitionDelay = (i * 0.05) + 's'; i++;
    });
  }

  var heads = document.querySelectorAll('[data-split]');
  heads.forEach(splitHead);

  if (reduce) {
    heads.forEach(function (h) { h.classList.add('shown'); });
  } else {
    /* hero headline animates in on load */
    var heroHead = document.querySelector('.ab-hero [data-split]');
    var fired = false;
    function revealHero() { if (!fired && heroHead) { fired = true; heroHead.classList.add('shown'); } }
    window.addEventListener('spektr:ready', function () { setTimeout(revealHero, 150); });
    if (document.body.classList.contains('loaded')) setTimeout(revealHero, 150);
    setTimeout(revealHero, 1400); /* safety */

    /* the rest reveal as they scroll into view */
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('shown'); io.unobserve(en.target); } });
    }, { threshold: 0.35 });
    heads.forEach(function (h) { if (!h.closest('.ab-hero')) io.observe(h); });
  }

  /* ---- RECEIPTS timeline: scrub the line + light the dots ---- */
  var fill = document.querySelector('.timeline .tl-line i');
  var items = document.querySelectorAll('.tl-item');
  if (!hasST || reduce) {
    if (fill) fill.style.height = '100%';
    items.forEach(function (i) { i.classList.add('lit'); });
  } else {
    if (fill) gsap.to(fill, {
      height: '100%', ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 75%', scrub: 1 }
    });
    items.forEach(function (it) {
      ScrollTrigger.create({
        trigger: it, start: 'top 80%',
        onEnter: function () { it.classList.add('lit'); if (window.SpektrSound) window.SpektrSound.click(); },
        onLeaveBack: function () { it.classList.remove('lit'); }
      });
    });
  }

  /* ---- subtle parallax on founder photos (echoes homepage product parallax) ---- */
  if (hasST && !reduce) {
    document.querySelectorAll('.oper-photo').forEach(function (ph) {
      var slot = ph.querySelector('image-slot');
      if (slot) gsap.fromTo(slot, { y: 24 }, {
        y: -24, ease: 'none',
        scrollTrigger: { trigger: ph, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  if (hasST) window.addEventListener('spektr:ready', function () { setTimeout(function () { ScrollTrigger.refresh(); }, 400); });
})();
