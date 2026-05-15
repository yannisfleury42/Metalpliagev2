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
    <svg class="pl-svg" viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="plWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#7a766e"/>
          <stop offset="100%" stop-color="#4a463e"/>
        </linearGradient>
        <linearGradient id="plCouv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#DCE3EA"/>
          <stop offset="45%"  stop-color="#A8B6C4"/>
          <stop offset="100%" stop-color="#5C6878"/>
        </linearGradient>
        <linearGradient id="plEdge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#3E4A56"/>
          <stop offset="100%" stop-color="#171D24"/>
        </linearGradient>
      </defs>
      <rect x="80" y="85" width="100" height="85" fill="url(#plWall)"/>
      <g stroke="rgba(0,0,0,0.3)" stroke-width="0.5">
        <line x1="80" y1="100" x2="180" y2="100"/>
        <line x1="80" y1="115" x2="180" y2="115"/>
        <line x1="80" y1="130" x2="180" y2="130"/>
        <line x1="80" y1="145" x2="180" y2="145"/>
        <line x1="80" y1="160" x2="180" y2="160"/>
      </g>
      <g stroke="rgba(0,0,0,0.18)" stroke-width="0.4">
        <line x1="110" y1="100" x2="110" y2="115"/>
        <line x1="150" y1="100" x2="150" y2="115"/>
        <line x1="100" y1="115" x2="100" y2="130"/>
        <line x1="140" y1="115" x2="140" y2="130"/>
        <line x1="170" y1="115" x2="170" y2="130"/>
      </g>
      <g class="pl-couv">
        <polygon points="74,80 80,80 80,100 74,100" fill="url(#plCouv)"/>
        <rect x="74" y="100" width="6" height="0.8" fill="url(#plEdge)"/>
        <rect x="74" y="74" width="112" height="8" fill="url(#plCouv)"/>
        <rect x="74" y="74" width="112" height="1.5" fill="rgba(255,255,255,0.5)"/>
        <rect x="74" y="82" width="112" height="0.9" fill="url(#plEdge)"/>
        <polygon points="180,80 186,80 186,98 188,102 184,102 180,98" fill="url(#plCouv)"/>
      </g>
      <ellipse class="pl-water" cx="187" cy="106" rx="2.4" ry="3.4" fill="#6AB8E8" opacity="0"/>
      <g class="pl-check">
        <circle cx="220" cy="50" r="11" fill="none" stroke="#3CB371" stroke-width="1.5"/>
        <polyline points="215.5,50 219,53.5 225,47" fill="none" stroke="#3CB371"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
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
        '.pl-couv, .pl-water, .pl-check, .pl-svg, .pl-label, .preloader-bar-fill'
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
