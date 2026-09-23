/* ──────────────────────────────────────────────────────────────
 * accessoires.js — Ajout au panier depuis la page accessoires.html
 * Lit les data-attributes des boutons .acc-add-btn et appelle
 * window.CartAddItem (exposée par cart.js).
 * ─────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  // EUR formatter (cohérent avec cart.js qui stocke les prix en centimes)
  function formatEuro(value) {
    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €';
  }

  function flashFeedback(btn, message, ok) {
    const original = btn.dataset.originalLabel || btn.textContent;
    if (!btn.dataset.originalLabel) btn.dataset.originalLabel = original;
    btn.classList.toggle('acc-add-btn--ok', !!ok);
    btn.classList.toggle('acc-add-btn--err', !ok);
    btn.textContent = message;
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = btn.dataset.originalLabel;
      btn.disabled = false;
      btn.classList.remove('acc-add-btn--ok', 'acc-add-btn--err');
    }, 1600);
  }

  function handleAdd(btn) {
    const name    = btn.dataset.productName  || 'Accessoire';
    const length  = btn.dataset.productLength || '—';

    // Teinte. Les 5 accessoires laques portent desormais un selecteur RAL dans
    // leur carte ; avant, `data-product-finish` valait « RAL au choix » en dur et
    // l'atelier recevait une commande sans couleur, donc infabricable. Les deux
    // autres produits (support inox/galva, colle) n'ont pas de teinte a choisir
    // et gardent la valeur de l'attribut.
    const card   = btn.closest('.acc-card') || btn.closest('article');
    const ralSel = card && card.querySelector('.acc-ral-select');
    if (ralSel && !ralSel.value) {
      ralSel.classList.add('is-missing');
      ralSel.focus();
      flashFeedback(btn, 'Choisissez une teinte', false);
      return;
    }
    if (ralSel) ralSel.classList.remove('is-missing');
    const finish = ralSel ? 'RAL ' + ralSel.value : (btn.dataset.productFinish || '—');
    const priceHt = parseFloat(btn.dataset.productPrice || '0');
    if (!priceHt || isNaN(priceHt)) {
      flashFeedback(btn, 'Erreur prix', false);
      return;
    }

    // TVA 20 % — on stocke le TTC en centimes (cohérent avec configurateur.js)
    const priceTtcCents = Math.round(priceHt * 1.20 * 100);

    if (typeof window.CartAddItem !== 'function') {
      console.error('[accessoires] window.CartAddItem indisponible — cart.js non chargé ?');
      flashFeedback(btn, 'Panier indisponible', false);
      return;
    }

    window.CartAddItem({
      name:   name,
      finish: finish,
      length: length,
      price:  priceTtcCents,
      qty:    1,
    });

    flashFeedback(btn, '✓ Ajouté au panier', true);
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.acc-add-btn');
    if (!btn) return;
    e.preventDefault();
    handleAdd(btn);
  });

  // Export utile (formatEuro) pour debug éventuel
  window.AccessoiresAddToCart = { formatEuro };
})();
