/* ═══════════════════════════════════════════════════════════════
   Metal Pliage — main.js
   Scroll animations · Nav behavior · Form · Hamburger
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── SCROLL-TRIGGERED FADE-UP ANIMATIONS ─────────────────── */
  const fadeEls = document.querySelectorAll('.animate-fadeup');

  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: make all elements visible immediately
    fadeEls.forEach((el) => el.classList.add('in-view'));
  }


  /* ── HERO: force visible on load (no scroll needed) ──────── */
  document.querySelectorAll('#hero .animate-fadeup').forEach((el) => {
    el.classList.add('in-view');
  });


  /* ── NAV: solid background on scroll ─────────────────────── */
  const navbar = document.getElementById('navbar');

  function updateNav() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();


  /* ── NAV: active link highlight ───────────────────────────── */
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('#nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.style.color = isActive ? 'var(--text-primary)' : '';
          });
        }
      });
    },
    { threshold: 0.35 }
  );
  sections.forEach((s) => sectionObserver.observe(s));


  /* ── SMOOTH SCROLL ────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });

      // Close mobile nav if open
      navbar.classList.remove('nav-open');
      const btn = navbar.querySelector('.nav-hamburger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });


  /* ── DROPDOWN MENUS ──────────────────────────────────────── */
  const dropdownItems = document.querySelectorAll('.nav-item--dropdown');

  dropdownItems.forEach((item) => {
    const trigger = item.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = item.classList.contains('is-open');

      // Close all other dropdowns
      dropdownItems.forEach((d) => {
        d.classList.remove('is-open');
        const t = d.querySelector('.nav-dropdown-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item--dropdown')) {
      dropdownItems.forEach((d) => {
        d.classList.remove('is-open');
        const t = d.querySelector('.nav-dropdown-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });


  /* ── HAMBURGER / MOBILE NAV ───────────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navbar.classList.contains('nav-open')) {
        navbar.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navbar.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
        dropdownItems.forEach((d) => {
          d.classList.remove('is-open');
          const t = d.querySelector('.nav-dropdown-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }


  /* ── CONTACT FORM ─────────────────────────────────────────── */
  // URL de l'API backend (server.js sur Render). En dev local on cible localhost.
  const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? ''  // server.js Express sert le même host en dev
    : 'https://metal-pliage-api.onrender.com';  // À remplacer par l'URL Render après déploiement

  const form = document.querySelector('.contact-form');
  const successMsg = document.querySelector('.form-success-msg');

  if (form && successMsg) {
    // Warmup : réveille le free tier Render (cold start ~30s) dès l'arrivée sur la page
    // pour éviter l'attente au moment du submit.
    if (API_BASE) {
      fetch(`${API_BASE}/api/health`, { method: 'GET', mode: 'cors' }).catch(() => {});
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot anti-spam : si le champ caché est rempli, c'est un bot.
      const honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) return;

      // Validation côté client
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach((field) => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#c0392b';
          valid = false;
        }
      });
      if (!valid) return;

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;

      try {
        const data = Object.fromEntries(new FormData(form));
        delete data._honey;
        const res = await fetch(`${API_BASE}/api/contact`, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || "Erreur d'envoi");
        }
        form.hidden = true;
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        alert(err.message || "Erreur d'envoi du message. Réessayez ou écrivez à contact@metal-pliage.fr");
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });

    // Clear red border on focus
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('focus', () => {
        field.style.borderColor = '';
      });
    });
  }


  /* ── FOOTER YEAR ──────────────────────────────────────────── */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ── FAQ ACCORDION ───────────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('is-open');

      // Close all
      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('is-open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        const a = i.querySelector('.faq-answer');
        if (a) a.hidden = false;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.hidden = false;
      }
    });
  });


  /* ── STATS COUNTER ANIMATION ──────────────────────────────── */
  const statEls = document.querySelectorAll('.stat-number[data-target]');

  if (statEls.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(eased * target);
          el.textContent = prefix + value + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    statEls.forEach((el) => counterObserver.observe(el));
  }


  /* ── ONGLETS MATIÈRE (Acier / Aluminium / Inox) ─────────────── */
  const pliageTabs = document.querySelectorAll('.pliage-tab');
  pliageTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      pliageTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
    });
  });


  /* ── VIDEO SEQUENCE ───────────────────────────────────────── */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    const videos = ['assets/video/hero.mp4', 'assets/video/hero 2.mp4'];
    let current = 0;

    heroVideo.addEventListener('ended', () => {
      current = (current + 1) % videos.length;
      heroVideo.src = videos[current];
      heroVideo.play();
    });

    heroVideo.addEventListener('error', () => {
      heroVideo.remove();
    });
  }

})();
