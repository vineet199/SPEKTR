/* ============================================================
   SPEKTR RACING — PRODUCT DETAIL (data-driven from catalog)
   Reads ?p=<slug> and renders that product. Falls back to first.
   ============================================================ */
(function () {
  const cat = window.SPEKTR_CATALOG, money = window.SPEKTR_MONEY;
  const params = new URLSearchParams(location.search);
  const slug = params.get('p');
  const P = window.SPEKTR_PRODUCT(slug);

  const state = { size: P.sizeDefault, color: P.colors[0].name, cart: 0 };
  const hasMedia = !!P.media;
  let curImages = hasMedia ? P.media[P.colors[0].name].slice() : null;

  /* ---------- RENDER ---------- */
  document.title = 'SPEKTR RACING — ' + titleCase(P.name);
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', titleCase(P.name) + ' — ' + P.lede);

  function titleCase(s){ return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }

  // crumb
  const crumbName = document.querySelector('.crumb .crumb-name');
  if (crumbName) crumbName.textContent = titleCase(P.name);

  // gallery — hero image + grid of remaining shots, first 4 grid cells visible, rest behind "Show More"
  const gHero = document.getElementById('gHero');
  const gGrid = document.getElementById('gGrid');
  const gMore = document.getElementById('gMore');
  const GRID_VISIBLE = 4;
  function renderGallery(){
    const labels = P.thumbs;
    const heroInner = hasMedia
      ? '<img id="pdpHeroImg" src="' + curImages[0] + '" alt="' + titleCase(P.name) + ' — ' + labels[0] + '">'
      : '<image-slot id="slot-' + P.slug + '-main" shape="rect" placeholder="Drop ' + titleCase(P.name) + ' (' + labels[0] + ')"></image-slot>';
    if (gHero) gHero.querySelectorAll('img,image-slot').forEach(function(n){ n.remove(); });
    if (gHero) gHero.insertAdjacentHTML('beforeend', heroInner);
    if (gGrid) {
      gGrid.innerHTML = labels.slice(1).map(function(lbl, i){
        const inner = hasMedia
          ? '<img src="' + curImages[i+1] + '" alt="' + titleCase(P.name) + ' — ' + lbl + '">'
          : '<image-slot id="slot-' + P.slug + '-t' + (i+1) + '" shape="rect" placeholder="' + lbl + '"></image-slot>';
        return '<div class="g-cell' + (i >= GRID_VISIBLE ? ' hide' : '') + '">' + inner + '</div>';
      }).join('');
    }
    const extra = Math.max(0, labels.length - 1 - GRID_VISIBLE);
    if (gMore) gMore.hidden = extra <= 0;
  }
  renderGallery();
  if (gMore) gMore.addEventListener('click', function(){
    gGrid.querySelectorAll('.g-cell.hide').forEach(function(c){ c.classList.remove('hide'); });
    gMore.hidden = true;
    if (window.ScrollTrigger) setTimeout(function(){ window.ScrollTrigger.refresh(); }, 200);
  });

  // info
  const accentPill = document.querySelector('.pdp-badges .pill.accent');
  if (accentPill) accentPill.textContent = P.assure[0];
  setText('.info .cat', '// ' + P.cat);
  setText('.info h1', P.name);
  const priceEl = document.querySelector('.info .price');
  if (priceEl) priceEl.innerHTML = money(P.price) + ' <span class="tax">' + P.tax + '</span>';
  setText('.info .lede', P.lede);
  const ratingEl = document.querySelector('.info .rating');
  if (ratingEl) ratingEl.innerHTML = '<span class="stars">★★★★★</span> ' + P.rating.toFixed(1) + ' · ' + P.reviews + ' verified riders';

  // colours — photo swatches when we have real media, plain circles otherwise
  const colorPick = document.getElementById('colorPick');
  if (colorPick) colorPick.textContent = P.colors[0].name;
  const vswatches = document.getElementById('vswatches');
  const swcolors = document.getElementById('swcolors');
  if (hasMedia && vswatches) {
    vswatches.hidden = false; if (swcolors) swcolors.hidden = true;
    vswatches.innerHTML = P.colors.filter(c => P.media[c.name]).map((c, i) =>
      '<button class="vsw' + (i === 0 ? ' sel' : '') + '" data-name="' + c.name + '"><span class="vimg"><img src="' + P.media[c.name][0] + '" alt="' + c.name + '"></span><span class="vname">' + c.name + '</span></button>'
    ).join('');
  } else if (swcolors) {
    swcolors.innerHTML = P.colors.map((c, i) =>
      '<button class="sw' + (i === 0 ? ' sel' : '') + '" style="background:' + c.hex + '" data-name="' + c.name + '" aria-label="' + c.name + '"></button>'
    ).join('');
  }

  // size label + sizes
  const sizeTtl = document.querySelector('.opt .opt-head .ttl[data-size-label]');
  if (sizeTtl) sizeTtl.textContent = P.sizeLabel;
  const sizes = document.querySelector('.sizes');
  if (sizes) sizes.innerHTML = P.sizes.map(s => {
    const out = P.sizeOut.includes(s);
    const sel = s === P.sizeDefault && !out;
    return '<button class="size' + (sel ? ' sel' : '') + (out ? ' out' : '') + '">' + s + '</button>';
  }).join('');

  // assurance
  const assure = document.querySelector('.assure');
  if (assure) assure.innerHTML = P.assure.map(a => '<span>' + a + '</span>').join('');

  // accordion
  const acc = document.querySelector('.acc');
  if (acc) acc.innerHTML = P.acc.map(it =>
    '<div class="item' + (it.open ? ' open' : '') + '"><button class="q">' + it.q + ' <span class="pm">+</span></button>' +
    '<div class="a"><div class="pad">' + it.html + '</div></div></div>'
  ).join('');

  // spec sheet
  const spec = document.querySelector('.spectable');
  if (spec) spec.innerHTML = P.specs.map(r => '<div class="r"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>').join('');

  // recommendations — 3 other products
  const recGrid = document.querySelector('.rec-grid');
  if (recGrid) {
    const others = cat.filter(x => x.slug !== P.slug).slice(0, 3);
    // prefer same-group complements first
    const ordered = cat.filter(x => x.slug !== P.slug).sort((a,b)=> (a.group===P.group?-1:0) - (b.group===P.group?-1:0)).slice(0,3);
    recGrid.innerHTML = (ordered.length ? ordered : others).map(x =>
      '<a class="card reveal" href="product.html?p=' + x.slug + '">' +
        '<div class="c-img"><span class="badge">' + x.badge + '</span>' + cardMedia(x) + '</div>' +
        '<div class="c-body"><h4>' + x.name + '</h4><p class="desc">' + shorten(x.lede) + '</p>' +
        '<div class="c-foot"><span class="price">' + money(x.price) + '</span><span class="qv">Quick View →</span></div></div>' +
      '</a>'
    ).join('');
  }
  function cardMedia(x){
    const src = window.SPEKTR_CARD_IMG && window.SPEKTR_CARD_IMG(x);
    return src ? '<img class="c-photo" src="' + src + '" alt="' + titleCase(x.name) + '">'
               : '<image-slot id="rec-' + x.slug + '" radius="0" shape="rect" placeholder="' + titleCase(x.name) + '"></image-slot>';
  }

  // sticky mobile price
  const mp = document.querySelector('.mcta .mp');
  if (mp) mp.textContent = money(P.price);

  function shorten(s){ return s.length > 64 ? s.slice(0, 61).trimEnd() + '…' : s; }
  function setText(sel, txt){ const el = document.querySelector(sel); if (el) el.textContent = txt; }

  /* ---------- INTERACTIONS ---------- */

  // wishlist (top of gallery)
  const wishTop = document.getElementById('wishBtnTop');
  if (wishTop) wishTop.addEventListener('click', () => { wishTop.classList.toggle('active'); if (window.SpektrSound) window.SpektrSound.click(); });
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) shareBtn.addEventListener('click', () => { if (navigator.share) navigator.share({ title: titleCase(P.name), url: location.href }).catch(()=>{}); if (window.SpektrSound) window.SpektrSound.click(); });

  // colour click handling (event delegation — content is rendered dynamically)
  function selectColor(name, btn, group){
    group.querySelectorAll('.vsw, .sw').forEach(x => x.classList.remove('sel'));
    btn.classList.add('sel'); state.color = name;
    if (colorPick) colorPick.textContent = state.color;
    if (hasMedia && P.media[state.color]) { curImages = P.media[state.color].slice(); renderGallery(); }
    if (window.SpektrSound) window.SpektrSound.click();
  }
  if (vswatches) vswatches.addEventListener('click', e => { const b = e.target.closest('.vsw'); if (b) selectColor(b.dataset.name, b, vswatches); });
  if (swcolors) swcolors.addEventListener('click', e => { const b = e.target.closest('.sw'); if (b) selectColor(b.dataset.name, b, swcolors); });

  // size
  document.querySelectorAll('.size:not(.out)').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.size').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel'); state.size = b.textContent.trim();
    if (window.SpektrSound) window.SpektrSound.click();
  }));

  // accordion
  document.querySelectorAll('.acc .item').forEach(item => {
    const q = item.querySelector('.q'); const a = item.querySelector('.a');
    const set = () => { a.style.maxHeight = item.classList.contains('open') ? a.scrollHeight + 'px' : '0px'; };
    if (item.classList.contains('open')) requestAnimationFrame(set);
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.acc .item').forEach(i => { i.classList.remove('open'); i.querySelector('.a').style.maxHeight = '0px'; });
      if (!wasOpen) { item.classList.add('open'); set(); }
      if (window.SpektrSound) window.SpektrSound.click();
    });
  });
  addEventListener('resize', () => { const o = document.querySelector('.acc .item.open .a'); if (o) o.style.maxHeight = o.scrollHeight + 'px'; });

  // add to cart
  const toast = document.getElementById('toast');
  function addToCart() {
    state.cart++;
    const n = document.getElementById('cartN'); if (n) n.textContent = state.cart;
    if (toast) { toast.textContent = `Added — ${titleCase(P.name)} · ${state.size} · ${state.color}`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); }
    if (window.SpektrSound) window.SpektrSound.click();
  }
  ['addBtn', 'addBtnM'].forEach(id => { const b = document.getElementById(id); if (b) b.addEventListener('click', addToCart); });

  // reveal recs + refresh scroll triggers now that DOM changed
  document.querySelectorAll('.rec-grid .reveal').forEach(el => {
    new IntersectionObserver((ents, ob) => ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('shown'); ob.unobserve(en.target); } }), { threshold: 0.12 }).observe(el);
  });
  if (window.ScrollTrigger) setTimeout(() => window.ScrollTrigger.refresh(), 300);
})();
