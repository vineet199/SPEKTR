/* ============================================================
   SPEKTR RACING — SHOP (listing) behaviour
   ============================================================ */
(function () {
  const cat = window.SPEKTR_CATALOG, groups = window.SPEKTR_GROUPS, money = window.SPEKTR_MONEY;
  function titleCase(s){ return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
  function shorten(s){ return s.length > 70 ? s.slice(0, 67).trimEnd() + '…' : s; }
  function cardMedia(p){
    const src = window.SPEKTR_CARD_IMG && window.SPEKTR_CARD_IMG(p);
    return src ? '<img class="c-photo" src="' + src + '" alt="' + titleCase(p.name) + '">'
               : '<image-slot id="shop-' + p.slug + '" radius="0" shape="rect" placeholder="' + titleCase(p.name) + '"></image-slot>';
  }

  // tabs
  const tabsEl = document.getElementById('shopTabs');
  tabsEl.innerHTML = groups.map((g, i) =>
    '<button class="tab' + (i === 0 ? ' active' : '') + '" data-cat="' + g.id + '">' + g.label + '</button>'
  ).join('');

  // cards
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = cat.map(p =>
    '<a class="card" data-cat="' + p.group + '" href="product.html?p=' + p.slug + '">' +
      '<div class="c-img"><span class="badge">' + p.badge + '</span>' + cardMedia(p) + '</div>' +
      '<div class="c-body"><h4>' + p.name + '</h4><p class="desc">' + shorten(p.lede) + '</p>' +
        '<div class="c-foot"><span class="price">' + money(p.price) + '</span><span class="qv">View →</span></div></div>' +
    '</a>'
  ).join('');

  // footer shop links
  const footShop = document.getElementById('footShop');
  if (footShop) footShop.innerHTML = cat.map(p => '<a href="product.html?p=' + p.slug + '">' + titleCase(p.name) + '</a>').join('');

  // count + filter
  const countEl = document.getElementById('shopCount');
  const cards = Array.from(grid.querySelectorAll('.card'));
  const tabs = Array.from(tabsEl.querySelectorAll('.tab'));

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active')); tab.classList.add('active');
    if (window.SpektrSound) window.SpektrSound.click();
    const c = tab.dataset.cat;
    const matches = cards.filter(card => c === 'all' || card.dataset.cat === c);
    cards.forEach(card => card.classList.add('hiding'));
    setTimeout(() => {
      cards.forEach(card => { card.style.display = (c === 'all' || card.dataset.cat === c) ? '' : 'none'; });
      requestAnimationFrame(() => matches.forEach((card, i) => setTimeout(() => card.classList.remove('hiding'), i * 45)));
      if (countEl) countEl.textContent = matches.length;
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, 200);
  }));

  if (countEl) countEl.textContent = cards.length;
})();
