/* ============================================================
   SPEKTR RACING — CHECKOUT behaviour
   ============================================================ */
(function () {
  const fmt = n => '$' + n.toLocaleString('en-US');
  const SUBTOTAL = 2480;
  let shipCost = 0;
  let current = 1;

  const panels = document.querySelectorAll('.panel');
  const steps = document.querySelectorAll('.steps-bar .sp');
  const lines = document.querySelectorAll('.steps-bar .ln i');

  function showStep(n) {
    current = n;
    panels.forEach(p => {
      const on = +p.dataset.panel === n;
      p.classList.toggle('active', on);
      if (on) { p.classList.add('entering'); p.addEventListener('animationend', () => p.classList.remove('entering'), { once: true }); }
    });
    steps.forEach(s => {
      const sn = +s.dataset.step;
      s.classList.toggle('active', sn === n);
      s.classList.toggle('done', sn < n);
    });
    lines.forEach((l, i) => { l.style.width = (i < n - 1) ? '100%' : '0'; });
    if (window.SpektrSound) window.SpektrSound.click();
    const top = document.querySelector('.steps-bar');
    if (top) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- floating-label filled state ---- */
  document.querySelectorAll('.fld input').forEach(inp => {
    const sync = () => inp.closest('.fld').classList.toggle('filled', !!inp.value);
    inp.addEventListener('input', () => { sync(); inp.closest('.fld').classList.remove('err'); });
    inp.addEventListener('blur', sync);
  });

  /* ---- validation per active panel ---- */
  function validatePanel(n) {
    const panel = document.querySelector(`.panel[data-panel="${n}"]`);
    let ok = true;
    panel.querySelectorAll('.fld[data-req]').forEach(f => {
      const inp = f.querySelector('input');
      let valid = inp.value.trim().length > 0;
      if (inp.type === 'email') valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value);
      f.classList.toggle('err', !valid);
      if (!valid && ok) { inp.focus(); ok = false; }
      else if (!valid) ok = false;
    });
    return ok;
  }

  /* ---- next / back ---- */
  document.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => {
    if (validatePanel(current)) showStep(current + 1);
  }));
  document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => showStep(current - 1)));

  /* ---- step bar click (go back only) ---- */
  steps.forEach(s => s.addEventListener('click', () => { const n = +s.dataset.step; if (n < current) showStep(n); }));

  /* ---- shipping selection ---- */
  function recalc() {
    document.getElementById('sub').textContent = fmt(SUBTOTAL);
    const shipEl = document.getElementById('ship');
    shipEl.textContent = shipCost === 0 ? 'Free' : fmt(shipCost);
    shipEl.classList.toggle('free', shipCost === 0);
    const total = SUBTOTAL + shipCost;
    document.getElementById('grand').textContent = fmt(total);
    document.querySelectorAll('.po-total').forEach(e => e.textContent = fmt(total));
  }
  document.querySelectorAll('[data-ship]').forEach(card => card.addEventListener('click', () => {
    document.querySelectorAll('[data-ship]').forEach(c => c.classList.remove('sel'));
    card.classList.add('sel');
    shipCost = +card.dataset.price;
    recalc();
    if (window.SpektrSound) window.SpektrSound.click();
  }));

  /* ---- payment method ---- */
  document.querySelectorAll('[data-pay]').forEach(card => card.addEventListener('click', () => {
    document.querySelectorAll('[data-pay]').forEach(c => c.classList.remove('sel'));
    card.classList.add('sel');
    if (window.SpektrSound) window.SpektrSound.click();
  }));

  /* ---- promo ---- */
  document.getElementById('applyPromo').addEventListener('click', () => {
    const inp = document.getElementById('promo');
    const btn = document.getElementById('applyPromo');
    if (inp.value.trim()) { btn.textContent = 'Applied'; btn.style.color = 'var(--spektr-red)'; inp.disabled = true; }
  });

  /* ---- place order ---- */
  document.getElementById('placeOrder').addEventListener('click', () => {
    if (!validatePanel(3)) return;
    const no = 'SPKTR—' + Math.floor(100000 + Math.random() * 899999);
    document.getElementById('ordno').textContent = 'ORDER #' + no;
    document.getElementById('confirm').classList.add('show');
    if (window.SpektrSound) window.SpektrSound.click();
  });

  recalc();
})();
