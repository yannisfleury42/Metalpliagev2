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
  const form = document.querySelector('.contact-form');
  const successMsg = document.querySelector('.form-success-msg');

  if (form && successMsg) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) return;

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
        const res = await fetch('https://formsubmit.co/ajax/contact@metal-pliage.fr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            ...data,
            _subject: 'Demande de contact — Metal Pliage',
            _captcha: 'false',
          }),
        });
        if (!res.ok) throw new Error("Erreur d'envoi");
        form.hidden = true;
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        alert("Erreur d'envoi. Réessayez ou écrivez directement à contact@metal-pliage.fr");
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });

    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('focus', () => { field.style.borderColor = ''; });
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


  /* ── RGPD COOKIE NOTICE ──────────────────────────────────────── */
  (function () {
    if (localStorage.getItem('mp-cookie-ok')) return;
    const banner = document.createElement('div');
    banner.id = 'cookie-notice';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Notice cookies');
    banner.innerHTML = '<p style="margin:0 1rem 0 0;font-size:.85rem;color:#e5e7eb;">Ce site utilise des cookies d\'analyse (Plausible, sans suivi publicitaire) et un outil d\'e-mail (Brevo) pour vous recontacter. <a href="/confidentialite.html" style="color:#fff;text-decoration:underline;">En savoir plus</a></p><button id="cookie-accept" style="flex-shrink:0;padding:.5rem 1.2rem;border:none;border-radius:6px;background:#f97316;color:#fff;font-size:.85rem;font-weight:600;cursor:pointer;white-space:nowrap;">J\'accepte</button><button id="cookie-refuse" style="flex-shrink:0;padding:.5rem 1rem;border:1px solid #6b7280;border-radius:6px;background:transparent;color:#9ca3af;font-size:.85rem;cursor:pointer;white-space:nowrap;margin-left:.5rem;">Refuser</button>';
    const s = document.createElement('style');
    s.textContent = '#cookie-notice{position:fixed;bottom:0;left:0;right:0;z-index:1000;display:flex;align-items:center;padding:1rem clamp(1rem,4vw,2rem);background:#1f2937;border-top:1px solid #374151;box-shadow:0 -4px 24px rgba(0,0,0,.3);}@media(max-width:600px){#cookie-notice{flex-direction:column;align-items:flex-start;gap:.75rem;}}';
    document.head.appendChild(s);
    document.body.appendChild(banner);

    function dismiss(accepted) {
      if (accepted) localStorage.setItem('mp-cookie-ok', '1');
      else localStorage.setItem('mp-cookie-ok', 'no');
      banner.remove();
    }
    document.getElementById('cookie-accept').addEventListener('click', () => dismiss(true));
    document.getElementById('cookie-refuse').addEventListener('click', () => dismiss(false));
  })();


  /* ── WHATSAPP STICKY BUTTON ──────────────────────────────────── */
  (function () {
    const btn = document.createElement('a');
    btn.href = 'https://wa.me/33643218201?text=Bonjour%2C%20j%27ai%20une%20question%20sur%20une%20commande%20Metal%20Pliage.';
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Nous contacter sur WhatsApp');
    btn.id = 'wa-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
    const style = document.createElement('style');
    style.textContent = '#wa-btn{position:fixed;bottom:1.5rem;right:1.5rem;z-index:999;width:56px;height:56px;border-radius:50%;background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.25);text-decoration:none;transition:transform .2s,box-shadow .2s;}#wa-btn:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(0,0,0,.3);}@media(max-width:768px){#wa-btn{bottom:1rem;right:1rem;width:50px;height:50px;}}';
    document.head.appendChild(style);
    document.body.appendChild(btn);
  })();


  /* ── LEAD MAGNET — Guide PDF capture email ───────────────────── */
  (function () {
    var SESSION_KEY = 'mp-lead-shown';
    var SUBMIT_URL = 'https://formsubmit.co/ajax/contact@metal-pliage.fr';
    if (sessionStorage.getItem(SESSION_KEY)) return;
    var skipPaths = ['/contact', '/cgv', '/confidentialite', '/mentions-legales', '/livraison', '/commande-confirmee', '/configurateur'];
    var path = window.location.pathname;
    for (var i = 0; i < skipPaths.length; i++) {
      if (path.indexOf(skipPaths[i]) !== -1) return;
    }

    var shown = false;
    function show() {
      if (shown) return;
      shown = true;
      sessionStorage.setItem(SESSION_KEY, '1');

      var overlay = document.createElement('div');
      overlay.id = 'mp-lead-overlay';
      var sheet = document.createElement('div');
      sheet.id = 'mp-lead-sheet';
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-modal', 'true');
      sheet.setAttribute('aria-label', 'Guide gratuit couvertine sur mesure');
      sheet.innerHTML =
        '<button id="mp-lead-close" aria-label="Fermer">&times;</button>' +
        '<div style="display:flex;gap:1.2rem;align-items:flex-start;flex-wrap:wrap;">' +
          '<div style="flex:0 0 auto;width:48px;height:48px;border-radius:10px;background:var(--accent,#f97316);display:flex;align-items:center;justify-content:center;">' +
            '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' +
          '</div>' +
          '<div style="flex:1;min-width:220px;">' +
            '<p style="margin:0 0 .3rem;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted,#9ca3af);">Gratuit</p>' +
            '<h3 style="margin:0 0 .4rem;font-size:1.05rem;font-weight:600;color:var(--text-primary,#f9fafb);line-height:1.3;">Guide de pose couvertine sur mesure</h3>' +
            '<p style="margin:0 0 1rem;font-size:.85rem;color:var(--text-secondary,#d1d5db);line-height:1.5;">Mesures, profils, fixation : le guide complet en PDF. Envoy\xe9 directement dans votre bo\xeete mail.</p>' +
            '<form id="mp-lead-form" style="display:flex;gap:.5rem;flex-wrap:wrap;">' +
              '<input type="email" id="mp-lead-email" name="email" required autocomplete="email" placeholder="votre@email.fr" style="flex:1;min-width:180px;padding:.55rem .9rem;border:1px solid var(--border,#374151);border-radius:6px;background:var(--bg-card,#1f2937);color:var(--text-primary,#f9fafb);font-size:.9rem;outline:none;" />' +
              '<button type="submit" style="padding:.55rem 1.2rem;border:none;border-radius:6px;background:var(--accent,#f97316);color:#fff;font-size:.9rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:opacity .2s;">Recevoir le guide</button>' +
            '</form>' +
            '<p id="mp-lead-msg" style="margin:.6rem 0 0;font-size:.8rem;color:var(--text-muted,#9ca3af);display:none;"></p>' +
          '</div>' +
        '</div>';

      var style = document.createElement('style');
      style.textContent =
        '#mp-lead-overlay{position:fixed;inset:0;z-index:1100;pointer-events:none;}' +
        '#mp-lead-sheet{position:fixed;bottom:-220px;left:0;right:0;z-index:1101;padding:clamp(1.2rem,4vw,2rem);background:var(--bg-surface,#111827);border-top:1px solid var(--border,#374151);box-shadow:0 -8px 40px rgba(0,0,0,.4);transition:bottom .4s cubic-bezier(.22,.61,.36,1);pointer-events:all;}' +
        '#mp-lead-sheet.mp-open{bottom:0;}' +
        '#mp-lead-close{position:absolute;top:.8rem;right:1rem;border:none;background:none;color:var(--text-muted,#9ca3af);font-size:1.5rem;cursor:pointer;line-height:1;padding:.25rem .5rem;}' +
        '#mp-lead-close:hover{color:var(--text-primary,#f9fafb);}' +
        '#mp-lead-email:focus{border-color:var(--accent,#f97316);}';
      document.head.appendChild(style);
      document.body.appendChild(overlay);
      document.body.appendChild(sheet);
      setTimeout(function () { sheet.classList.add('mp-open'); }, 80);

      document.getElementById('mp-lead-close').addEventListener('click', dismiss);
      overlay.addEventListener('click', dismiss);

      document.getElementById('mp-lead-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('mp-lead-email').value.trim();
        var msg = document.getElementById('mp-lead-msg');
        var btn = this.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.style.opacity = '.5';
        msg.style.display = 'block';
        msg.textContent = 'Envoi en cours…';
        fetch(SUBMIT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email: email, _subject: 'T\xe9l\xe9chargement guide couvertine', message: 'Demande de guide PDF couvertine — ' + window.location.href })
        })
          .then(function (r) { return r.json(); })
          .then(function () {
            msg.style.color = '#4ade80';
            msg.textContent = 'Guide envoy\xe9 ! V\xe9rifiez votre bo\xeete mail.';
            setTimeout(dismiss, 2500);
          })
          .catch(function () {
            msg.style.color = 'var(--accent,#f97316)';
            msg.textContent = 'Erreur — r\xe9essayez ou \xe9crivez-nous \xe0 contact@metal-pliage.fr';
            btn.disabled = false;
            btn.style.opacity = '1';
          });
      });
    }

    function dismiss() {
      var sheet = document.getElementById('mp-lead-sheet');
      if (sheet) { sheet.style.bottom = '-220px'; setTimeout(function () { sheet.remove(); }, 420); }
      var ov = document.getElementById('mp-lead-overlay');
      if (ov) ov.remove();
    }

    // Trigger: 40% scroll OR 25s timer, whichever comes first
    var timer = setTimeout(show, 25000);
    function onScroll() {
      var scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled >= 0.4) { clearTimeout(timer); window.removeEventListener('scroll', onScroll); show(); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

})();
