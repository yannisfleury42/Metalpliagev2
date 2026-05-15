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


  /* ── WHATSAPP STICKY (mobile-first, cible artisans/paysagistes en chantier) ── */
  function injectWhatsAppSticky() {
    if (document.getElementById('whatsapp-sticky')) return;
    const a = document.createElement('a');
    a.id = 'whatsapp-sticky';
    a.href = 'https://wa.me/33643218201?text=' + encodeURIComponent('Bonjour, je souhaite un devis pour ');
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Discuter sur WhatsApp');
    a.innerHTML = `
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <path fill="#fff" d="M16 3C8.82 3 3 8.82 3 16c0 2.31.6 4.49 1.66 6.39L3 29l6.84-1.62A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.6c-2.07 0-4-.57-5.66-1.55l-.4-.24-4.06.96.97-3.96-.26-.41A10.6 10.6 0 1 1 26.6 16c0 5.85-4.75 10.6-10.6 10.6zm5.84-7.94c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.84 1.05-1.03 1.27-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.8-2.22-.19-.32-.02-.5.14-.66.14-.14.32-.38.48-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.57-.08-.16-.73-1.76-1-2.41-.27-.63-.54-.55-.73-.56l-.62-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.4 5.39 4.77.75.32 1.34.51 1.8.66.76.24 1.45.21 2 .13.61-.09 1.9-.78 2.16-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37z"/>
      </svg>
      <span class="ws-label">WhatsApp</span>
    `;
    document.body.appendChild(a);
  }
  // N'affiche pas sur la page contact (déjà couverte par le formulaire)
  if (!location.pathname.endsWith('/contact.html')) {
    injectWhatsAppSticky();
  }


  /* ── HELPER LONGUEUR > 2800 MM (configurateur couvertine) ────────────── */
  // Quand l'utilisateur saisit une longueur proche du max (3000 mm),
  // on lui propose une solution pour les murs plus longs (éclisses).
  const inputL = document.getElementById('input-L');
  const isCouvertineConfig = location.pathname.endsWith('/configurateur.html');
  if (inputL && isCouvertineConfig) {
    const helper = document.createElement('div');
    helper.className = 'dim-helper-proactive';
    helper.hidden = true;
    helper.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="#E63E00" stroke-width="1.5"/>
        <path d="M8 4v5M8 11.5v.5" stroke="#E63E00" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span><strong>Mur plus long que 3 m ?</strong> Une couvertine fait <b>3 m max</b> en une pièce. Pour un mur de 6 m, prévoyez 2 longueurs + 1 éclisse de jonction (étape 4).</span>
    `;
    inputL.closest('.dim-row').appendChild(helper);
    const updateHelper = () => {
      helper.hidden = Number(inputL.value) < 2800;
    };
    inputL.addEventListener('input', updateHelper);
    updateHelper();
  }


  /* ── TOOLTIP CTA DISABLED (configurateurs) ────────────────────────────── */
  // Quand le bouton "Ajouter au panier" est désactivé, on indique
  // au survol/clic ce qu'il manque (au lieu de laisser l'user deviner).
  function setupDisabledTooltip() {
    document.querySelectorAll('.btn-add-cart, .btn-add-to-cart, [data-add-cart]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (!btn.disabled) return;
        e.preventDefault();
        const missing = [];
        if (document.querySelector('#step-2 .step-section--disabled, [data-step="2"][data-valid="false"]')) missing.push('dimensions');
        if (document.querySelector('#step-3 .step-section--disabled, [data-step="3"][data-valid="false"]')) missing.push('couleur');
        // Fallback : on regarde quelle section step est encore disabled
        const lastDisabled = document.querySelector('.step-section--disabled .step-header h2');
        if (missing.length === 0 && lastDisabled) missing.push(lastDisabled.textContent.toLowerCase());
        const message = missing.length
          ? `Avant d'ajouter au panier, complétez : ${missing.join(', ')}.`
          : "Complétez toutes les étapes avant d'ajouter au panier.";
        const note = btn.querySelector('.btn-disabled-note') || document.createElement('span');
        note.className = 'btn-disabled-note';
        note.textContent = message;
        if (!btn.querySelector('.btn-disabled-note')) btn.appendChild(note);
        setTimeout(() => note.remove(), 3500);
      });
    });
  }
  setupDisabledTooltip();


  /* ── LOCALSTORAGE : SAUVEGARDE STATE CONFIGURATEUR ────────────────── */
  // Sauvegarde l'état des inputs du configurateur pour reprise après F5/onglet fermé.
  const configForm = document.getElementById('dim-inputs') || document.querySelector('.config-form');
  if (configForm) {
    const storageKey = 'mp-config-' + location.pathname.replace(/[^a-z0-9-]/gi, '');
    // Restaure les valeurs au chargement
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      for (const [id, val] of Object.entries(saved)) {
        const el = document.getElementById(id);
        if (el && el.tagName === 'INPUT' && el.type === 'number') {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    } catch {}
    // Sauvegarde au changement (debounce 400ms)
    let saveTimer;
    configForm.addEventListener('input', () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const state = {};
        configForm.querySelectorAll('input[type="number"][id]').forEach((el) => {
          state[el.id] = el.value;
        });
        try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
      }, 400);
    });
  }

})();
