/* ═══════════════════════════════════════════════════════════════
   COUVERTINES CATALOGUE — Dynamic Filter Engine
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const grid      = document.getElementById('prod-grid');
  const countEl   = document.getElementById('cat-count');
  const emptyEl   = document.getElementById('cat-empty');
  const sortSel   = document.getElementById('cat-sort-select');
  const chipsEl   = document.getElementById('active-chips');
  const resetBtns = document.querySelectorAll('#filter-reset-btn, #cat-empty-reset');

  if (!grid) return;

  const allCards = Array.from(grid.querySelectorAll('.prod-card'));

  /* ── Read current filter state from DOM ──────────────────── */
  function getState() {
    return {
      finitions: Array.from(document.querySelectorAll('input[name="finition"]:checked')).map(e => e.value),
      couleurs:  Array.from(document.querySelectorAll('input[name="couleur"]:checked')).map(e => e.value),
      largeurs:  Array.from(document.querySelectorAll('input[name="largeur"]:checked')).map(e => e.value),
      epaisseur: (document.querySelector('input[name="epaisseur"]:checked') || {}).value || 'all',
    };
  }

  /* ── Pure: should this card be visible given a state? ─────── */
  function shouldShow(card, state) {
    if (state.finitions.length && !state.finitions.includes(card.dataset.finition)) return false;
    if (state.couleurs.length  && !state.couleurs.includes(card.dataset.couleur))   return false;
    return true;
  }

  /* ── Apply filters — two-phase animated transition ──────── */
  function applyFilters() {
    const state = getState();

    const toShow = [];
    const toHide = [];

    allCards.forEach((card) => {
      const show = shouldShow(card, state);
      if (show && card.hidden)   toShow.push(card);
      else if (!show && !card.hidden) toHide.push(card);
    });

    // Phase 1 — exit: fade + scale down cards being removed
    toHide.forEach((card) => card.classList.add('is-hiding'));

    // Phase 2 — after exit completes, reflow grid then stagger entrances
    const exitDuration = toHide.length ? 230 : 0;

    setTimeout(() => {
      // Commit the hide (triggers CSS grid reflow)
      toHide.forEach((card) => {
        card.hidden = true;
        card.classList.remove('is-hiding');
      });

      // Place entering cards in the DOM but keep them invisible
      toShow.forEach((card) => {
        card.hidden = false;
        card.classList.add('is-entering');
      });

      // Next paint: trigger staggered slide-up entrance
      // Adaptive stagger — total cascade capped at 240ms so large resets feel snappy
      const staggerStep = toShow.length > 1
        ? Math.round(Math.min(50, 240 / (toShow.length - 1)))
        : 0;

      requestAnimationFrame(() => {
        toShow.forEach((card, i) => {
          card.style.setProperty('--enter-delay', `${i * staggerStep}ms`);
          card.classList.remove('is-entering');
          card.classList.add('is-appeared');
          card.addEventListener('animationend', () => {
            card.classList.remove('is-appeared');
            card.style.removeProperty('--enter-delay');
          }, { once: true });
        });
      });

      // Update count immediately after reflow
      const visibleCount = allCards.filter((c) => !c.hidden).length;
      if (countEl) {
        countEl.textContent = visibleCount === 1 ? '1 produit' : `${visibleCount} produits`;
      }

      // Empty state: show after last card's entrance completes
      const lastEntrance = toShow.length ? (toShow.length - 1) * staggerStep + 420 : 0;
      setTimeout(() => {
        if (emptyEl) emptyEl.hidden = allCards.some((c) => !c.hidden);
      }, lastEntrance);

      renderChips(state);
      updateSidebarCounts(state);

    }, exitDuration);
  }

  /* ── Human-readable labels for chip display ──────────────── */
  const CHIP_LABELS = {
    prelaque:   'Prélaqué standard',
    sable:      'Sablé fine texture',
    specifique: 'Finition spécifique',
    '1mm':      '1 mm — 10/10',
    '1.5mm':    '1,5 mm — 15/10',
    '200': '200 mm', '220': '220 mm', '270': '270 mm',
    '280': '280 mm', '320': '320 mm', '400': '400 mm',
  };

  function labelFor(name, value) {
    if (name === 'couleur') {
      const input = document.querySelector(`input[name="couleur"][value="${value}"]`);
      return input
        ? (input.closest('label').querySelector('.color-label')?.textContent.trim() || value)
        : value;
    }
    return CHIP_LABELS[value] || value;
  }

  /* ── Render active-filter chip row ───────────────────────── */
  function renderChips(state) {
    if (!chipsEl) return;
    chipsEl.innerHTML = '';

    const chips = [
      ...state.finitions.map(v => ({ name: 'finition',  value: v })),
      ...state.couleurs.map(v  => ({ name: 'couleur',   value: v })),
      ...state.largeurs.map(v  => ({ name: 'largeur',   value: v, info: true })),
      ...(state.epaisseur !== 'all' ? [{ name: 'epaisseur', value: state.epaisseur, info: true }] : []),
    ];

    if (!chips.length) { chipsEl.hidden = true; return; }
    chipsEl.hidden = false;

    chips.forEach(({ name, value, info }) => {
      const chip = document.createElement('span');
      chip.className = 'chip' + (info ? ' chip--info' : '');

      const labelEl = document.createElement('span');
      labelEl.className = 'chip-label';
      labelEl.textContent = labelFor(name, value);

      const closeBtn = document.createElement('button');
      closeBtn.className = 'chip-close';
      closeBtn.setAttribute('aria-label', 'Supprimer ce filtre');
      closeBtn.textContent = '×';
      closeBtn.dataset.name  = name;
      closeBtn.dataset.value = value;
      closeBtn.addEventListener('click', () => removeFilter(name, value));

      chip.append(labelEl, closeBtn);
      chipsEl.appendChild(chip);
    });

    // "Clear all" when 2+ chips
    if (chips.length > 1) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'chip chip--clear';
      clearBtn.textContent = 'Tout effacer';
      clearBtn.addEventListener('click', resetFilters);
      chipsEl.appendChild(clearBtn);
    }
  }

  /* ── Remove a single filter from DOM state ───────────────── */
  function removeFilter(name, value) {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (!input) return;
    input.checked = false;
    if (input.type === 'radio') {
      const fallback = document.querySelector(`input[name="${name}"][value="all"]`);
      if (fallback) fallback.checked = true;
    }
    applyFilters();
  }

  /* ── Update count badges next to each sidebar option ─────── */
  function updateSidebarCounts(state) {
    // Finition: count cards matching that finition given current couleur filter
    document.querySelectorAll('input[name="finition"]').forEach((input) => {
      const count = allCards.filter(c =>
        shouldShow(c, { ...state, finitions: [input.value] })
      ).length;
      setBadge(input.closest('label'), count);
    });

    // Couleur: count cards matching that couleur given current finition filter
    document.querySelectorAll('input[name="couleur"]').forEach((input) => {
      const count = allCards.filter(c =>
        shouldShow(c, { ...state, couleurs: [input.value] })
      ).length;
      setBadge(input.closest('label'), count);
    });
  }

  function setBadge(label, count) {
    if (!label) return;
    let badge = label.querySelector('.filter-count');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'filter-count';
      label.appendChild(badge);
    }
    badge.textContent = count;
    badge.classList.toggle('filter-count--zero', count === 0);
  }

  /* ── Sort ────────────────────────────────────────────────── */
  function applySort(value) {
    const cards = Array.from(grid.querySelectorAll('.prod-card'));
    cards.sort((a, b) => {
      if (value === 'price-asc')  return (parseInt(a.dataset.price) || 0) - (parseInt(b.dataset.price) || 0);
      if (value === 'price-desc') return (parseInt(b.dataset.price) || 0) - (parseInt(a.dataset.price) || 0);
      if (value === 'name') {
        const na = a.querySelector('.prod-name')?.textContent.trim() || '';
        const nb = b.querySelector('.prod-name')?.textContent.trim() || '';
        return na.localeCompare(nb, 'fr');
      }
      return 0;
    });
    const empty = grid.querySelector('.cat-empty');
    cards.forEach(c => grid.appendChild(c));
    if (empty) grid.appendChild(empty);
  }

  /* ── Reset all filters ───────────────────────────────────── */
  function resetFilters() {
    document.querySelectorAll('.cat-sidebar input[type="checkbox"]').forEach(el => { el.checked = false; });
    const defaultRadio = document.querySelector('input[name="epaisseur"][value="all"]');
    if (defaultRadio) defaultRadio.checked = true;
    if (sortSel) sortSel.value = 'default';
    applyFilters();
    applySort('default');
  }

  /* ── Event listeners ─────────────────────────────────────── */
  document.querySelectorAll('.cat-sidebar input').forEach(input => {
    input.addEventListener('change', applyFilters);
  });
  if (sortSel) sortSel.addEventListener('change', () => applySort(sortSel.value));
  resetBtns.forEach(btn => btn.addEventListener('click', resetFilters));

  /* ── Init ────────────────────────────────────────────────── */
  applyFilters();

})();
