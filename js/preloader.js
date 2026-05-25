/* ═══════════════════════════════════════════════════════════════
   PRELOADER + TRANSITIONS DE PAGES
   Animation : couvertine se pose sur muret + goutte d'eau + check
   Auto-injecté dans le <body>, rejoué à chaque navigation interne.
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const PRELOADER_HTML = `
<div id="preloader" aria-hidden="true">
  <div class="pl-scene">
    <svg class="pl-svg" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="pl-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="pl-glow-o">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- M -->
      <polyline class="pl-letter-m"
        points="20,100 20,20 52,65 84,20 84,100"
        stroke="#EEF3F8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"
        fill="none" filter="url(#pl-glow)"/>
      <!-- Point laser fin du M -->
      <circle class="pl-dot-m" cx="84" cy="100" r="4.5" fill="#fff" filter="url(#pl-glow)"/>
      <!-- Séparateur -->
      <line class="pl-sep" x1="100" y1="18" x2="100" y2="102"
            stroke="#FF4500" stroke-width="1.5" opacity="0"/>
      <!-- P -->
      <path class="pl-letter-p"
        d="M 116,100 L 116,20 L 152,20 Q 180,20 180,48 Q 180,76 152,76 L 116,76"
        stroke="#FF4500" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"
        fill="none" filter="url(#pl-glow-o)"/>
      <!-- Point laser fin du P -->
      <circle class="pl-dot-p" cx="116" cy="76" r="4.5" fill="#FF4500" filter="url(#pl-glow-o)"/>
    </svg>
    <div class="pl-label">
      <span class="pl-name">METAL</span><span class="pl-accent"> PLIAGE</span>
    </div>
    <div class="preloader-bar-wrap">
      <div class="preloader-bar-fill"></div>
    </div>
  </div>
</div>`;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    let preloader = document.getElementById('preloader');
    if (!preloader) {
      document.body.insertAdjacentHTML('afterbegin', PRELOADER_HTML);
      preloader = document.getElementById('preloader');
    }
    document.body.classList.add('is-loading');

    const hidePreloader = () => {
      preloader.classList.add('done');
      document.body.classList.remove('is-loading');
    };

    // Anim complète ≈ 1.85s + buffer
    const delay = prefersReducedMotion() ? 200 : 2100;
    setTimeout(hidePreloader, delay);

    window.addEventListener('load', () => {
      setTimeout(hidePreloader, prefersReducedMotion() ? 100 : 400);
    }, { once: true });

    /* ── Transition entre pages internes ── */
    const replayPreloader = () => {
      preloader.classList.remove('done');
      preloader.querySelectorAll(
        '.pl-letter-m, .pl-letter-p, .pl-sep, .pl-dot-m, .pl-dot-p, .pl-svg, .pl-label, .preloader-bar-fill'
      ).forEach(el => {
        el.style.animation = 'none';
        void el.offsetWidth; // reflow → réamorce l'animation
        el.style.animation = '';
      });
    };

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank') return;
      const isHtml = href.endsWith('.html') || /\.html#/.test(href) || /\.html\?/.test(href);
      if (!isHtml) return;
      const currentPath = window.location.pathname.split('/').pop();
      if (href === currentPath) return;

      e.preventDefault();
      replayPreloader();
      setTimeout(() => { window.location.href = link.href; }, 900);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
