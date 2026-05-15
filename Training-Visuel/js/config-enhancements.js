/* ═══════════════════════════════════════════════════════════════
   Metal Pliage — config-enhancements.js
   Améliorations UX progressives sur les pages de configurateur :
   - Stepper sticky horizontal cliquable
   - Tooltips "?" sur les champs au vocabulaire technique
   Issu de l'audit UX 2026-05-15.
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const sections = document.querySelectorAll('.step-section');
  if (sections.length < 2) return;  // Pas sur une page configurateur

  /* ── 0. PRE-REMPLISSAGE DEPUIS URL (wizard "couvrir mon muret") ─── */
  // Si on arrive depuis couvertines.html?from=wizard&B=200&L=3000&ral=7016&qty=2
  // on pré-remplit les inputs + on déclenche l'event 'input' pour que
  // configurateur.js recalcule prix, SVG, panier.
  (function applyWizardParams() {
    const params = new URLSearchParams(location.search);
    const FIELD_MAP = { B: 'input-B', L: 'input-L', A: 'input-A', C: 'input-C', qty: 'input-qty' };
    let touched = false;
    for (const [param, id] of Object.entries(FIELD_MAP)) {
      const val = params.get(param);
      if (val === null) continue;
      const el = document.getElementById(id);
      if (!el) continue;
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      touched = true;
    }
    const ral = params.get('ral');
    if (ral) {
      // Cherche un swatch dont le data-ral correspond
      const swatch = document.querySelector(`[data-ral="${ral}"], [data-color="${ral}"]`);
      if (swatch) {
        swatch.click();
        touched = true;
      }
    }
    if (touched) {
      // Scroll vers l'étape Dimensions après un court délai (pour laisser
      // le configurateur initialiser)
      setTimeout(() => {
        const dim = document.getElementById('step-2');
        if (dim) {
          const offset = 100;
          window.scrollTo({ top: dim.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
        }
      }, 400);
    }
  })();

  /* ── 1. Stepper sticky horizontal ────────────────────────────── */

  const stepper = document.createElement('nav');
  stepper.className = 'config-stepper';
  stepper.setAttribute('aria-label', 'Progression du configurateur');

  const list = document.createElement('ol');
  list.className = 'config-stepper-list';

  sections.forEach((section, i) => {
    const title = section.querySelector('.step-header h2');
    const label = title ? title.textContent.trim() : `Étape ${i + 1}`;
    const li = document.createElement('li');
    li.className = 'config-stepper-item';
    li.dataset.target = section.id;
    li.innerHTML = `
      <button type="button" class="config-stepper-btn" data-target="${section.id}">
        <span class="config-stepper-num" aria-hidden="true">${i + 1}</span>
        <span class="config-stepper-label">${label}</span>
      </button>
    `;
    list.appendChild(li);
  });
  stepper.appendChild(list);

  // Insertion juste après le header de la page configurateur (avant le main grid)
  const insertAfter = document.querySelector('.cfg-page-header')
    || document.querySelector('.pliage-cfg-page-header')
    || document.querySelector('main')
    || sections[0].parentElement;
  if (insertAfter && insertAfter.parentNode) {
    insertAfter.parentNode.insertBefore(stepper, insertAfter.nextSibling);
  }

  // Click sur un step -> scroll vers la section
  stepper.addEventListener('click', (e) => {
    const btn = e.target.closest('.config-stepper-btn');
    if (!btn) return;
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    const offset = 90;  // hauteur nav + stepper
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  // État actif : observe quelle section est visible
  const items = stepper.querySelectorAll('.config-stepper-item');
  function refreshStepper() {
    sections.forEach((section, i) => {
      const item = items[i];
      const isDisabled = section.classList.contains('step-section--disabled');
      item.classList.toggle('is-locked', isDisabled);
      item.classList.toggle('is-done', !isDisabled && i < activeIndex());
      item.classList.toggle('is-active', !isDisabled && i === activeIndex());
    });
  }
  function activeIndex() {
    const vh = window.innerHeight;
    let idx = 0;
    sections.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.top < vh * 0.45 && r.bottom > 0) idx = i;
    });
    return idx;
  }

  // Update on scroll + on DOM mutation (configurateur déverrouille les sections via JS)
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { refreshStepper(); ticking = false; });
  }, { passive: true });

  const mo = new MutationObserver(refreshStepper);
  sections.forEach((s) => mo.observe(s, { attributes: true, attributeFilter: ['class'] }));

  refreshStepper();

  /* ── 2. Tooltips "?" sur les champs jargonneux ───────────────── */

  // Glossaire des termes techniques (visible au survol/clic du "?")
  const GLOSSARY = {
    'B': "<strong>Largeur du support</strong><br>C'est la largeur de votre muret, mesurée du bord extérieur au bord extérieur, en haut.",
    'A': "<strong>Hauteur de retour</strong><br>Les retours sont les rabats verticaux de chaque côté de la couvertine, qui descendent le long du muret. Plus c'est haut, mieux le muret est protégé des coulures.",
    'C': "<strong>Largeur de tôle (développé)</strong><br>Largeur totale de la tôle avant pliage. Calcul : <em>B + 2× retours + dépassement</em>. Modifier seulement si vous savez ce que vous faites.",
    'L': "<strong>Longueur de la pièce</strong><br>Longueur d'une seule pièce de couvertine (max 3 000 mm). Pour les murs plus longs, on utilise des éclisses de jonction (étape Accessoires).",
    'R': "<strong>Rejet d'eau</strong><br>Petit pli à 45° tout au bord du retour, qui empêche l'eau de revenir vers le muret par capillarité. Fixé à 10 mm.",
    'H': "<strong>Hauteur de l'âme</strong><br>L'âme est la partie verticale centrale d'un profil en Z. C'est la dimension entre les deux pliures.",
    'Nez': "<strong>Nez de l'appui</strong><br>Petit retour vertical en façade qui éloigne l'eau de la maçonnerie (effet larmier). Angle généralement à 92° pour s'écarter naturellement du mur.",
    'Pente': "<strong>Pente</strong><br>Inclinaison de la surface supérieure pour évacuer l'eau de pluie. Standard à 10° (ni trop plat = stagnation, ni trop incliné = peu esthétique).",
    'développé': "<strong>Développé</strong><br>Largeur totale de la tôle <em>à plat</em>, avant pliage. C'est cette mesure qui détermine le prix matière.",
    'laquage': "<strong>Sens de laquage</strong><br>Indique de quel côté de la tôle se trouve la peinture (face visible). Doit toujours être vers l'extérieur, jamais vers le muret."
  };

  function makeTooltipButton(termKey, content) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'config-help-btn';
    btn.setAttribute('aria-label', `Aide sur ${termKey}`);
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M6 6.5c0-1 .8-1.7 2-1.7s2 .7 2 1.7c0 .8-.7 1.2-1.4 1.6-.4.3-.6.6-.6 1.1V9.5M8 11.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>`;
    const pop = document.createElement('span');
    pop.className = 'config-help-pop';
    pop.setAttribute('role', 'tooltip');
    pop.innerHTML = content;
    btn.appendChild(pop);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = btn.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      // Close other tooltips
      document.querySelectorAll('.config-help-btn.is-open').forEach((b) => {
        if (b !== btn) { b.classList.remove('is-open'); b.setAttribute('aria-expanded', 'false'); }
      });
    });
    return btn;
  }

  // Helper : injecte un "?" après un élément donné si pas déjà fait
  function attachHelp(refEl, termKey) {
    if (!refEl || refEl.querySelector('.config-help-btn')) return;
    const content = GLOSSARY[termKey];
    if (!content) return;
    refEl.appendChild(makeTooltipButton(termKey, content));
  }

  // Cible les labels de dimension : .dim-label avec un .dim-letter
  document.querySelectorAll('.dim-label').forEach((lbl) => {
    const letterSpan = lbl.querySelector('.dim-letter');
    if (!letterSpan) return;
    const key = letterSpan.textContent.trim();
    attachHelp(lbl, key);
  });

  // Cible le label "Rejet d'eau" même s'il est en dim-letter--fixed
  document.querySelectorAll('.dim-label .dim-letter--fixed').forEach((el) => {
    attachHelp(el.parentElement, el.textContent.trim());
  });

  // Sur le configurateur pliage : champs spécifiques (nez, pente, âme)
  document.querySelectorAll('label[for]').forEach((lbl) => {
    const text = lbl.textContent.toLowerCase();
    if (text.includes('âme')) attachHelp(lbl, 'H');
    else if (text.includes('nez')) attachHelp(lbl, 'Nez');
    else if (text.includes('pente')) attachHelp(lbl, 'Pente');
    else if (text.includes('sens de laquage') || text.includes('laquage')) attachHelp(lbl, 'laquage');
    else if (text.includes('développé')) attachHelp(lbl, 'développé');
  });

  // Ferme les tooltips au clic ailleurs / Escape
  document.addEventListener('click', (e) => {
    if (e.target.closest('.config-help-btn')) return;
    document.querySelectorAll('.config-help-btn.is-open').forEach((b) => {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.config-help-btn.is-open').forEach((b) => {
        b.classList.remove('is-open');
        b.setAttribute('aria-expanded', 'false');
      });
    }
  });
})();
