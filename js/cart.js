/* ═══════════════════════════════════════════════════════════════
   cart.js — Panier + demande de commande (sans paiement immédiat)
   Metal Pliage
   Flux : le client valide sa demande → email à MDS via FormSubmit →
          MDS vérifie et envoie un lien de paiement (carte ou virement).
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── CONFIG ───────────────────────────────────────────────── */
  const ORDER_EMAIL = 'contact@metal-pliage.fr';

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

    // Retour à l'état normal du panier (au cas où le formulaire de demande était ouvert)
    const leftoverForm = document.getElementById('order-form');
    if (leftoverForm) leftoverForm.remove();

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
    // Repartir d'un panier propre : on retire le formulaire de demande s'il était ouvert
    const f = document.getElementById('order-form');
    if (f) f.remove();
    if (cartFooter) cartFooter.hidden = cart.length === 0;
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

  /* ── DEMANDE DE COMMANDE (sans paiement immédiat) ─────────────
     Le client envoie sa demande (récap panier + coordonnées) par email
     via FormSubmit. MDS vérifie puis renvoie un lien de paiement. ── */
  function cartSummaryText() {
    const lines = cart.map((it, i) =>
      `${i + 1}. ${it.name || 'Couvertine métallique'} | ${it.finish} | ${it.length} | qté ${it.qty} | ${formatPrice(it.price)}/u = ${formatPrice(it.price * it.qty)}`
    );
    const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
    lines.push(`TOTAL : ${formatPrice(total)}`);
    return lines.join('\n');
  }

  // Référence de demande lisible : MP-AAMMJJ-HHMM-XX (date+heure+2 car. aléatoires)
  function genRef() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    const rnd = Math.random().toString(36).slice(2, 4).toUpperCase();
    return `MP-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}-${rnd}`;
  }

  function injectOrderStyles() {
    if (document.getElementById('order-form-styles')) return;
    const st = document.createElement('style');
    st.id = 'order-form-styles';
    st.textContent = `
      .order-form{display:flex;flex-direction:column;gap:.65rem;padding:1rem 0 0;}
      .order-form label{display:flex;flex-direction:column;gap:.25rem;font-size:.82rem;color:var(--text-secondary,#bbb);}
      .order-form input,.order-form textarea{padding:.6rem .7rem;border:1px solid #3a3a3a;background:#161616;color:#fff;border-radius:5px;font-size:.95rem;font-family:inherit;}
      .order-form input:focus,.order-form textarea:focus{outline:none;border-color:var(--accent,#FF4500);}
      .order-reassure{font-size:.84rem;line-height:1.5;background:rgba(255,69,0,.08);border:1px solid rgba(255,69,0,.32);padding:.65rem .8rem;border-radius:5px;color:var(--text-secondary,#ccc);margin:0;}
      .order-mini{font-size:.72rem;color:var(--text-muted,#888);line-height:1.45;margin:.2rem 0 0;}
      .order-error{font-size:.82rem;line-height:1.45;background:rgba(220,38,38,.1);border:1px solid rgba(220,38,38,.45);color:#fca5a5;padding:.6rem .75rem;border-radius:5px;margin:0;}
      .order-error a{color:#fca5a5;text-decoration:underline;}
    `;
    document.head.appendChild(st);
  }

  function showOrderForm() {
    if (!cartDrawer) return;
    const host = cartDrawer.querySelector('.cart-drawer-body')
      || (cartItemsList && cartItemsList.parentElement)
      || cartDrawer;
    const existing = host.querySelector('#order-form');
    if (existing) {
      existing.querySelector('[name="Recapitulatif commande"]').value = cartSummaryText();
      existing.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    injectOrderStyles();
    if (cartFooter) cartFooter.hidden = true;
    const form = document.createElement('form');
    form.id = 'order-form';
    form.className = 'order-form';
    form.method = 'POST';
    form.action = 'https://formsubmit.co/' + ORDER_EMAIL;
    form.innerHTML = `
      <p class="order-reassure">Vous ne payez rien maintenant. Après vérification de votre commande, vous recevrez votre <strong>lien de paiement</strong> (carte bancaire ou virement), généralement sous 24&nbsp;h ouvrées.</p>
      <label>Nom complet*<input type="text" name="Nom" required autocomplete="name"></label>
      <label>Email*<input type="email" name="Email" required autocomplete="email"></label>
      <label>Téléphone*<input type="tel" name="Telephone" inputmode="tel" required autocomplete="tel"></label>
      <label>Code postal &amp; ville*<input type="text" name="Code postal et ville" required></label>
      <label>Message (accès, délai souhaité…)<textarea name="Message" rows="2"></textarea></label>
      <p class="order-error" id="order-error" hidden></p>
      <button type="submit" class="btn-primary btn-full">Envoyer ma demande</button>
      <p class="order-mini">Produits fabriqués sur mesure : ni repris, ni échangés (art. L221-28 du Code de la consommation). Le prix indiqué est ferme.</p>
    `;
    host.appendChild(form);
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Envoi en AJAX : permet de DÉTECTER un échec (sinon une commande peut se perdre
    // en silence) et déclenche un accusé de réception automatique au client (_autoresponse).
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = form.querySelector('button[type="submit"]');
      const errEl = form.querySelector('#order-error');
      if (errEl) errEl.hidden = true;

      const ref = genRef();
      const order = {
        ref,
        date: new Date().toLocaleString('fr-FR'),
        items: cart.map((it) => ({
          name: it.name || 'Couvertine métallique',
          finish: it.finish, length: it.length, price: it.price, qty: it.qty,
        })),
        total: cart.reduce((s, it) => s + it.price * it.qty, 0),
        client: {
          nom: form.querySelector('[name="Nom"]').value,
          email: form.querySelector('[name="Email"]').value,
          tel: form.querySelector('[name="Telephone"]').value,
          adresse: form.querySelector('[name="Code postal et ville"]').value,
          message: form.querySelector('[name="Message"]').value,
        },
      };
      try { localStorage.setItem('mp_last_order', JSON.stringify(order)); } catch (err) {}

      const payload = {
        Reference: ref,
        Nom: order.client.nom,
        Email: order.client.email,
        Telephone: order.client.tel,
        'Code postal et ville': order.client.adresse,
        Message: order.client.message,
        'Recapitulatif commande': cartSummaryText(),
        _subject: 'Demande de commande ' + ref + ' — Metal Pliage',
        _template: 'table',
        _captcha: 'false',
        _autoresponse:
          'Bonjour,\n\nNous avons bien reçu votre demande de commande (référence ' + ref + ') sur Metal Pliage. Merci !\n\n'
          + 'Après vérification, nous vous enverrons votre lien de paiement (carte bancaire ou virement), généralement sous 24 h ouvrées. '
          + 'La fabrication sur mesure démarre dès réception du règlement.\n\n'
          + 'À très vite,\nMetal Pliage / MDS\ncontact@metal-pliage.fr — 06 43 21 82 01',
      };

      if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }
      try {
        const res = await fetch('https://formsubmit.co/ajax/' + ORDER_EMAIL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !(data && (data.success === 'true' || data.success === true))) {
          throw new Error('FormSubmit a renvoyé une erreur');
        }
        window.location.href = 'commande-confirmee.html?order=' + encodeURIComponent(ref);
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = 'Envoyer ma demande'; }
        if (errEl) {
          errEl.innerHTML = "L'envoi a échoué. Réessayez, ou contactez-nous directement : "
            + '<a href="mailto:contact@metal-pliage.fr">contact@metal-pliage.fr</a> · '
            + '<a href="tel:+33643218201">06 43 21 82 01</a>.';
          errEl.hidden = false;
          errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!cart.length) return;
      showOrderForm();
    });
  }

  /* ── BOUTON « CONTINUER MES ACHATS » ─────────────────────────
     Ajouté dans le pied du tiroir pour pouvoir fermer le panier et
     reconfigurer / ajouter un autre article (manquait avant). ── */
  function injectContinueButton() {
    if (!cartFooter || !checkoutBtn || document.getElementById('btn-continue-shopping')) return;
    const cont = document.createElement('button');
    cont.id = 'btn-continue-shopping';
    cont.type = 'button';
    cont.textContent = '← Continuer mes achats';
    cont.style.cssText = 'display:block;width:100%;margin-bottom:.6rem;padding:.7rem 1rem;'
      + 'background:transparent;border:1px solid #3a3a3a;border-radius:5px;color:var(--text-secondary,#bbb);'
      + 'font-family:inherit;font-size:.9rem;cursor:pointer;transition:border-color .2s,color .2s;';
    cont.addEventListener('mouseover', () => { cont.style.borderColor = 'var(--accent,#FF4500)'; cont.style.color = 'var(--accent,#FF4500)'; });
    cont.addEventListener('mouseout',  () => { cont.style.borderColor = '#3a3a3a'; cont.style.color = 'var(--text-secondary,#bbb)'; });
    cont.addEventListener('click', closeCart);
    checkoutBtn.parentElement.insertBefore(cont, checkoutBtn);
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  renderCart();
  injectContinueButton();

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
