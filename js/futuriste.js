/* ═══════════════════════════════════════════════════════════════
   FUTURISTE.JS — Interactions premium
   Preloader · Curseur · Scroll progress · Split text
   Boutons magnétiques · Drag scroll matières
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ── PRELOADER ──────────────────────────────────────────────── */
  const preloader = document.getElementById('preloader');

  if (preloader) {
    document.body.classList.add('is-loading');

    const removePreloder = () => {
      preloader.classList.add('done');
      document.body.classList.remove('is-loading');
      setTimeout(() => preloader.remove(), 700);
    };

    // Attendre la fin de l'animation de la barre (1.1s + 0.3s delay = 1.4s) + petit buffer
    const delay = prefersReducedMotion() ? 200 : 1600;
    setTimeout(removePreloder, delay);

    // Fallback si la page met trop longtemps
    window.addEventListener('load', () => {
      setTimeout(removePreloder, prefersReducedMotion() ? 100 : 400);
    }, { once: true });
  }


  /* ── SCROLL PROGRESS BAR ────────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');

  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }


  /* ── CURSEUR CUSTOM ─────────────────────────────────────────── */
  if (!isTouchDevice()) {
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.id  = 'cursor-dot';
    ring.id = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;
    let raf;

    const lerp = (a, b, n) => a + (b - a) * n;

    const updateCursor = () => {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);

      dot.style.left  = mouseX + 'px';
      dot.style.top   = mouseY + 'px';
      ring.style.left = ringX  + 'px';
      ring.style.top  = ringY  + 'px';

      raf = requestAnimationFrame(updateCursor);
    };
    raf = requestAnimationFrame(updateCursor);

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.classList.remove('is-hidden');
      ring.classList.remove('is-hidden');
    });

    document.addEventListener('mouseleave', () => {
      dot.classList.add('is-hidden');
      ring.classList.add('is-hidden');
    });

    // Hover state sur éléments interactifs
    const hoverEls = document.querySelectorAll('a, button, [role="button"], .faq-question, .portfolio-item, .finish-btn, .length-btn');
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        dot.classList.add('is-hovering');
        ring.classList.add('is-hovering');
      });
      el.addEventListener('mouseleave', () => {
        dot.classList.remove('is-hovering');
        ring.classList.remove('is-hovering');
      });
    });
  }


  /* ── SPLIT TEXT ─────────────────────────────────────────────── */
  if (!prefersReducedMotion()) {
    const splitTargets = document.querySelectorAll(
      '#products h2, #fabrication h2, .stats-section h2, .process-section h2, ' +
      '.portfolio-section h2, .testimonials-section h2, .faq-section h2, #contact h2, ' +
      '.materials-section h2'
    );

    splitTargets.forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = '1';

      const text = el.innerHTML;
      const parts = text.split(/<br\s*\/?>/i);

      el.innerHTML = parts.map((line) => {
        const chars = [...line]; // Support unicode
        return chars.map((char, i) => {
          if (char === ' ') return '<span class="char-space"> </span>';
          return `<span class="char" style="--i:${i}"><span class="char-inner">${char}</span></span>`;
        }).join('');
      }).join('<br>');

      el.classList.add('split-ready');
    });

    // Observer pour déclencher l'animation au scroll
    if ('IntersectionObserver' in window) {
      const splitObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            splitObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

      document.querySelectorAll('.split-ready').forEach((el) => splitObs.observe(el));
    }
  }


  /* ── BOUTONS MAGNÉTIQUES ────────────────────────────────────── */
  if (!isTouchDevice() && !prefersReducedMotion()) {
    const magnetBtns = document.querySelectorAll('.btn-hero-primary, .btn-outline, .btn-primary');

    magnetBtns.forEach((btn) => {
      btn.classList.add('btn-magnetic');

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 90;

        if (dist < radius) {
          const power = (radius - dist) / radius;
          btn.style.transform = `translate(${dx * power * 0.35}px, ${dy * power * 0.35}px)`;
        }
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }


  /* ── DRAG SCROLL — Section matières ────────────────────────── */
  const matScroll = document.querySelector('.materials-scroll-container');

  if (matScroll && !isTouchDevice()) {
    let isDown = false;
    let startX, scrollLeft;

    matScroll.addEventListener('mousedown', (e) => {
      isDown = true;
      matScroll.classList.add('is-grabbing');
      startX = e.pageX - matScroll.offsetLeft;
      scrollLeft = matScroll.scrollLeft;
      e.preventDefault();
    });

    document.addEventListener('mouseup', () => {
      isDown = false;
      matScroll.classList.remove('is-grabbing');
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x    = e.pageX - matScroll.offsetLeft;
      const walk = (x - startX) * 1.4;
      matScroll.scrollLeft = scrollLeft - walk;
    });
  }


  /* ── SECTION DIVIDERS — Observer ────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const dividers = document.querySelectorAll('.section-divider');
    if (dividers.length) {
      const divObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            divObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.5 });
      dividers.forEach((d) => divObs.observe(d));
    }
  }


  /* ── PARALLAX HERO CONTENT (subtle) ────────────────────────── */
  if (!isTouchDevice() && !prefersReducedMotion()) {
    const heroContent = document.querySelector('.hero-content');
    const heroGhost   = document.querySelector('.hero-ghost');

    if (heroContent) {
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          heroContent.style.transform = `translateY(${y * 0.18}px)`;
          if (heroGhost) heroGhost.style.transform = `translateY(${y * -0.08}px)`;
        }
      }, { passive: true });
    }
  }

})();
