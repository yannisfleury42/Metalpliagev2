/* ═══════════════════════════════════════════════════════════════
   cart.js — Shop configurator, cart state, Stripe checkout
   Metal Pliage
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── CONFIG ───────────────────────────────────────────────── */
  const STRIPE_PK = 'pk_test_51TTNAxAgv3zk1c5zHucUyiIp9RooJL8skChklmgRDMyB1pFsMHLzPldvvLInb3cB2SryURPBuGl724drLsrKd8zt00VTLr5mVx';

  /* ── STATE ────────────────────────────────────────────────── */
  let cart = [];
  let selectedFinish = { id: 'ral7016', label: 'RAL 7016 Anthracite' };
  let selectedPrice = 2500; // cents
  let selectedLengthLabel = '2 mètres';
  let qty = 1;

  /* ── DOM REFS ─────────────────────────────────────────────── */
  const finishBtns     = document.querySelectorAll('.finish-btn');
  const lengthBtns     = document.querySelectorAll('.length-btn');
  const qtyInput       = document.getElementById('shop-qty');
  const qtyMinus       = document.getElementById('qty-minus');
  const qtyPlus        = document.getElementById('qty-plus');
  const priceUnitEl    = document.getElementById('price-unit-display');
  const priceTotalEl   = document.getElementById('price-total-display');
  const addToCartBtn   = document.getElementById('add-to-cart-btn');
  const cartOpenBtn    = document.getElementById('cart-open-btn');
  const cartDrawer     = document.getElementById('cart-drawer');
  const cartBackdrop   = document.getElementById('cart-backdrop');
  const cartCloseBtn   = document.getElementById('cart-close-btn');
  const cartItemsList  = document.getElementById('cart-items-list');
  const cartEmptyState = document.getElementById('cart-empty');
  const cartFooter     = document.getElementById('cart-footer');
  const cartTotalEl    = document.getElementById('cart-total-display');
  const cartCountBadge = document.getElementById('cart-count-badge');
  const checkoutBtn    = document.getElementById('btn-checkout');

  /* ── HELPERS ──────────────────────────────────────────────── */
  function formatPrice(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  function updatePriceDisplay() {
    if (priceUnitEl) priceUnitEl.textContent = formatPrice(selectedPrice);
    if (priceTotalEl) priceTotalEl.textContent = formatPrice(selectedPrice * qty);
  }

  function updateCartBadge() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountBadge) {
      cartCountBadge.textContent = total;
      cartCountBadge.classList.toggle('has-items', total > 0);
    }
    if (cartOpenBtn) {
      cartOpenBtn.setAttribute('aria-label', `Panier (${total} article${total !== 1 ? 's' : ''})`);
    }
  }

  /* ── CART RENDER ──────────────────────────────────────────── */
  function renderCart() {
    if (!cartItemsList) return;
    cartItemsList.innerHTML = '';

    const isEmpty = cart.length === 0;
    if (cartEmptyState) cartEmptyState.hidden = !isEmpty;
    if (cartFooter) cartFooter.hidden = isEmpty;

    let total = 0;

    cart.forEach((item, index) => {
      const lineTotal = item.price * item.qty;
      total += lineTotal;

      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <span class="cart-item-name">${item.name || 'Couvertine métallique'}</span>
        <div class="cart-item-price">
          <span>${formatPrice(lineTotal)}</span>
          <span class="cart-item-unit-price">${formatPrice(item.price)} / u.</span>
        </div>
        <div class="cart-item-meta">
          <span>${item.finish}</span>
          <span>${item.length} &mdash; qté&nbsp;: ${item.qty}</span>
        </div>
        <button class="cart-item-remove" data-index="${index}" aria-label="Supprimer cet article">Supprimer</button>
      `;
      cartItemsList.appendChild(el);
    });

    if (cartTotalEl) cartTotalEl.textContent = formatPrice(total);
    updateCartBadge();
  }

  /* ── FINISH SELECTOR ──────────────────────────────────────── */
  finishBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      finishBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      selectedFinish = { id: btn.dataset.finish, label: btn.dataset.label };
    });
  });

  /* ── LENGTH SELECTOR ──────────────────────────────────────── */
  lengthBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      lengthBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      selectedPrice = parseInt(btn.dataset.price, 10);
      selectedLengthLabel = btn.dataset.label;
      updatePriceDisplay();
    });
  });

  /* ── QUANTITY ─────────────────────────────────────────────── */
  function setQty(val) {
    qty = Math.max(1, parseInt(val, 10) || 1);
    if (qtyInput) qtyInput.value = qty;
    updatePriceDisplay();
  }

  if (qtyMinus) qtyMinus.addEventListener('click', () => setQty(qty - 1));
  if (qtyPlus)  qtyPlus.addEventListener('click',  () => setQty(qty + 1));
  if (qtyInput) qtyInput.addEventListener('input',  (e) => setQty(e.target.value));

  updatePriceDisplay();

  /* ── ADD TO CART ──────────────────────────────────────────── */
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const existing = cart.find(
        (i) => i.finish === selectedFinish.label && i.price === selectedPrice
      );
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({
          finish: selectedFinish.label,
          length: selectedLengthLabel,
          price: selectedPrice,
          qty,
        });
      }

      addToCartBtn.classList.add('added');
      addToCartBtn.innerHTML = '✓&nbsp;Ajouté au panier';
      setTimeout(() => {
        addToCartBtn.classList.remove('added');
        addToCartBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Ajouter au panier`;
      }, 1800);

      renderCart();
      openCart();
    });
  }

  /* ── CART OPEN / CLOSE ────────────────────────────────────── */
  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    if (cartBackdrop) cartBackdrop.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    if (cartBackdrop) cartBackdrop.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  if (cartOpenBtn)  cartOpenBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  /* ── REMOVE FROM CART ─────────────────────────────────────── */
  if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.cart-item-remove');
      if (!btn) return;
      cart.splice(parseInt(btn.dataset.index, 10), 1);
      renderCart();
    });
  }

  /* ── STRIPE CHECKOUT ──────────────────────────────────────── */
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (!cart.length) return;

      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Redirection…';

      try {
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.map((item) => ({
              finish: item.finish,
              length: item.length,
              price: item.price,
              quantity: item.qty,
            })),
          }),
        });

        if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);

        const { id } = await res.json();
        // Lazy-load Stripe.js seulement quand on en a besoin (sortir du chemin critique)
        if (!window.Stripe) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://js.stripe.com/v3/';
            s.async = true;
            s.onload = resolve;
            s.onerror = () => reject(new Error('Échec chargement Stripe'));
            document.head.appendChild(s);
          });
        }
        const stripe = Stripe(STRIPE_PK);
        await stripe.redirectToCheckout({ sessionId: id });
      } catch (err) {
        console.error(err);
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Procéder au paiement';
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    });
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  renderCart();

  /* ── GLOBAL API for configurateur.js ─────────────────────── */
  window.CartAddItem = function (item) {
    const existing = cart.find(
      (i) => i.finish === item.finish && i.price === item.price && i.length === item.length
    );
    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      cart.push({
        name:   item.name   || 'Pliage sur mesure',
        finish: item.finish || '—',
        length: item.length || '—',
        price:  item.price  || 0,
        qty:    item.qty    || 1,
      });
    }
    renderCart();
    openCart();
  };

  document.addEventListener('cart:add', (e) => window.CartAddItem(e.detail));

})();
