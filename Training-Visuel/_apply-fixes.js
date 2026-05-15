#!/usr/bin/env node
// Applique les corrections Phase 1-3 sur les fichiers de Training-Visuel/
// (sans toucher au site live à la racine du repo).
// Exécution : node _apply-fixes.js

const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

const PAGES = [
  'index.html', 'couvertines.html', 'pliage.html', 'configurateur.html',
  'configurateur-pliage.html', 'contact.html', 'guides.html',
  'accessoires.html', 'chapeaux-de-piliers.html', 'appuis-de-fenetre.html',
  'habillages-bandeaux.html', 'forme-libre.html', 'cgv.html',
  'mentions-legales.html', 'confidentialite.html', 'livraison-retours.html',
  'commande-confirmee.html',
];

let stats = { filesChanged: 0, replacements: 0 };

function patchFile(filepath, transformations) {
  if (!fs.existsSync(filepath)) return false;
  let content = fs.readFileSync(filepath, 'utf8');
  const before = content;
  let count = 0;
  for (const [from, to] of transformations) {
    if (from instanceof RegExp) {
      const matches = content.match(from);
      if (matches) { count += matches.length; content = content.replace(from, to); }
    } else {
      const occurrences = content.split(from).length - 1;
      if (occurrences > 0) { count += occurrences; content = content.split(from).join(to); }
    }
  }
  if (content !== before) {
    fs.writeFileSync(filepath, content, 'utf8');
    stats.filesChanged++;
    stats.replacements += count;
    return count;
  }
  return 0;
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('PHASE 1 — Couleurs WCAG + hamburger');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 1.1 + 1.2 : Variables CSS dans styles.css
const stylesPath = path.join(ROOT, 'css/styles.css');
let n = patchFile(stylesPath, [
  ['--accent:        #FF4500',     '--accent:        #E63E00'],
  ['--accent-hover:  #FF6030',     '--accent-hover:  #C53600'],
  ['--accent-glow:   rgba(255, 69, 0, 0.12)',    '--accent-glow:   rgba(230, 62, 0, 0.12)'],
  ['--accent-glow-lg:rgba(255, 69, 0, 0.25)',    '--accent-glow-lg:rgba(230, 62, 0, 0.25)'],
  // 1.3 — Bordures plus contrastées
  ['--border:        #2E2E2E',     '--border:        #4A4A4A'],
  // 1.4 — Hamburger 44x44 (WCAG 2.5.5)
  // Le hamburger est ~ligne 671 : on cible le sélecteur .nav-hamburger
]);
console.log(`  css/styles.css : ${n} remplacements`);

// 1.4 — Hamburger : on patche par sélecteur via regex
n = patchFile(stylesPath, [
  [/\.nav-hamburger\s*\{[^}]*?width:\s*[\d.]+px[^}]*?height:\s*[\d.]+px[^}]*?\}/g, (match) => {
    return match.replace(/width:\s*[\d.]+px/, 'width: 44px').replace(/height:\s*[\d.]+px/, 'height: 44px');
  }]
]);
console.log(`  hamburger 44x44 patché`);

// 1.5 — Skip-link CSS + dans toutes les pages
patchFile(stylesPath, [
  [/\/\* ── ACCESSIBILITÉ \(WCAG 2\.2\) ──────────── \*\//,
   `/* ── ACCESSIBILITÉ (WCAG 2.2) ──────────────────────────────── */
/* Skip-link : visible au focus clavier, permet d'aller direct au contenu */
.skip-link {
  position: absolute;
  top: -40px;
  left: 8px;
  z-index: 10000;
  padding: 10px 16px;
  background: var(--accent);
  color: #fff;
  border-radius: 0 0 6px 6px;
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
  transition: top 0.2s;
}
.skip-link:focus,
.skip-link:focus-visible { top: 0; }

`]
]);
console.log(`  skip-link CSS ajouté`);

// Ajouter le skip-link HTML dans chaque page (juste après <body>)
for (const page of PAGES) {
  const fp = path.join(ROOT, page);
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes('class="skip-link"')) continue;  // idempotent
  // Insertion juste après <body...>
  const newHtml = html.replace(
    /<body([^>]*)>/,
    `<body$1>\n  <a href="#main-content" class="skip-link">Aller au contenu principal</a>`
  );
  if (newHtml !== html) {
    fs.writeFileSync(fp, newHtml, 'utf8');
    stats.filesChanged++;
    stats.replacements++;
  }
}
console.log(`  skip-link inséré dans ${PAGES.length} pages`);

// 1.1 (suite) — remplacer #FF4500 partout dans CSS et JS (hardcoded)
const cssFiles = ['styles.css', 'futuriste.css', 'configurateur.css', 'couvertines.css', 'pliage.css', 'preloader.css'];
for (const f of cssFiles) {
  const fp = path.join(ROOT, 'css', f);
  const c = patchFile(fp, [
    [/#FF4500/g, '#E63E00'],
    [/#ff4500/g, '#e63e00'],
    [/#FF6030/g, '#C53600'],
    [/rgba\(255,\s*69,\s*0,/g, 'rgba(230, 62, 0,'],
    [/rgba\(255,69,0,/g, 'rgba(230,62,0,'],
  ]);
  console.log(`  css/${f} : ${c} remplacements`);
}

// Idem dans les HTML (styles inline + SVG inline)
for (const page of PAGES) {
  const fp = path.join(ROOT, page);
  const c = patchFile(fp, [
    [/#FF4500/g, '#E63E00'],
    [/#ff4500/g, '#e63e00'],
    [/#FF6030/g, '#C53600'],
    [/rgba\(255,\s*69,\s*0,/g, 'rgba(230, 62, 0,'],
    [/rgba\(255,69,0,/g, 'rgba(230,62,0,'],
  ]);
  if (c > 0) console.log(`  ${page} : ${c} remplacements`);
}

// Idem JS
for (const f of fs.readdirSync(path.join(ROOT, 'js'))) {
  if (!f.endsWith('.js')) continue;
  const fp = path.join(ROOT, 'js', f);
  patchFile(fp, [
    [/#FF4500/g, '#E63E00'],
    [/#ff4500/g, '#e63e00'],
    [/#FF6030/g, '#C53600'],
    [/rgba\(255,\s*69,\s*0,/g, 'rgba(230, 62, 0,'],
  ]);
}

// SVG fichiers
for (const f of ['favicon.svg', 'apple-touch-icon.svg', 'og-cover.svg']) {
  const fp = path.join(ROOT, f);
  patchFile(fp, [[/#FF4500/g, '#E63E00']]);
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('PHASE 2 — Désactiver effets gadget');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 2.1 — Grain animé global (futuriste.css)
const futuristePath = path.join(ROOT, 'css/futuriste.css');
if (fs.existsSync(futuristePath)) {
  let c = fs.readFileSync(futuristePath, 'utf8');
  const before = c;
  // Désactiver l'animation grainShift en commentant ou en posant animation: none
  c = c.replace(/(body::before\s*\{[^}]*animation:[^;]+;)/g, (match) => match.replace(/animation:[^;]+;/, 'animation: none; /* DÉSACTIVÉ — Phase 2 */'));
  c = c.replace(/(@keyframes grainShift[^}]*\{[^}]*\}[^}]*\})/g, '/* @keyframes grainShift DÉSACTIVÉ (Phase 2)\n$1\n*/');
  // 2.3 — Marquee infini
  c = c.replace(/(animation:\s*marquee[^;]+;)/g, 'animation: none; /* DÉSACTIVÉ — Phase 2 */');
  // 2.4 — Shimmer
  c = c.replace(/(animation:\s*shimmer[^;]+;)/g, 'animation: none; /* DÉSACTIVÉ — Phase 2 */');
  if (c !== before) {
    fs.writeFileSync(futuristePath, c, 'utf8');
    stats.filesChanged++;
    console.log(`  futuriste.css : grainShift + marquee + shimmer désactivés`);
  }
}

// 2.2 — Brushed-aluminum H1 sur index.html
const indexPath = path.join(ROOT, 'index.html');
if (fs.existsSync(indexPath)) {
  let c = fs.readFileSync(indexPath, 'utf8');
  // Désactiver l'animation pan-reflect en posant animation: none
  c = c.replace(/(animation:\s*pan-reflect[^;]+;)/g, 'animation: none; /* DÉSACTIVÉ — Phase 2 */');
  // La classe brushed-aluminum reste pour les couleurs, mais l'effet animé est coupé
  fs.writeFileSync(indexPath, c, 'utf8');
  console.log(`  index.html : brushed-aluminum H1 animation désactivée`);
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('PHASE 3 — Mobile fixes');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 3.1 — inputmode="numeric" sur les inputs des configurateurs
for (const page of ['configurateur.html', 'configurateur-pliage.html', 'couvertines.html']) {
  const fp = path.join(ROOT, page);
  if (!fs.existsSync(fp)) continue;
  let c = fs.readFileSync(fp, 'utf8');
  const before = c;
  c = c.replace(/<input(\s[^>]*?)type="number"(?![^>]*inputmode)/g, '<input$1type="number" inputmode="numeric"');
  if (c !== before) {
    fs.writeFileSync(fp, c, 'utf8');
    stats.filesChanged++;
    console.log(`  ${page} : inputmode="numeric" ajouté`);
  }
}

// 3.3 + 3.4 — viewport-fit + preload Inter dans toutes les pages
for (const page of PAGES) {
  const fp = path.join(ROOT, page);
  if (!fs.existsSync(fp)) continue;
  let c = fs.readFileSync(fp, 'utf8');
  const before = c;

  // 3.4 — viewport-fit=cover (pour env(safe-area-inset-*))
  c = c.replace(
    /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/,
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
  );

  // 3.5 — Préchargement Inter (woff2). On insère après le rel="preconnect" gstatic
  if (!c.includes('rel="preload"') || !c.includes('Inter')) {
    c = c.replace(
      /(<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>)/,
      '$1\n  <link rel="preload" as="font" href="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.woff2" type="font/woff2" crossorigin>'
    );
  }

  if (c !== before) {
    fs.writeFileSync(fp, c, 'utf8');
    stats.filesChanged++;
  }
}
console.log(`  viewport-fit + preload Inter ajoutés sur les pages`);

// 3.3 — Collision WhatsApp vs cart-fab : ajouter dans styles.css un override
// pour les pages configurateur uniquement
const cssExtra = `
/* ── Phase 3 : éviter collision WhatsApp sticky / cart-fab sur configurateurs ── */
body.page-configurateur #whatsapp-sticky,
body.page-pliage #whatsapp-sticky {
  bottom: 90px;  /* laisse la place au cart-fab en dessous */
}
@media (max-width: 640px) {
  body.page-configurateur #whatsapp-sticky,
  body.page-pliage #whatsapp-sticky {
    bottom: 80px;
  }
}

/* ── Safe area iOS (notch / home indicator) ── */
#whatsapp-sticky {
  bottom: max(20px, env(safe-area-inset-bottom));
}
@media (max-width: 640px) {
  #whatsapp-sticky {
    bottom: max(16px, env(safe-area-inset-bottom));
  }
}

/* ── Phase 3 : sticky bottom CTA mobile sur configurateurs ── */
.config-mobile-cta-bar {
  display: none;
}
@media (max-width: 720px) {
  body.page-configurateur .config-mobile-cta-bar,
  body.page-pliage .config-mobile-cta-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 99;
    padding: 12px 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    background: rgba(26, 26, 26, 0.98);
    backdrop-filter: blur(8px);
    border-top: 1px solid var(--accent);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
  }
  .config-mobile-cta-price {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  .config-mobile-cta-price small {
    font-size: 0.72rem;
    color: var(--text-muted);
    font-weight: 500;
    display: block;
  }
  .config-mobile-cta-btn {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 12px 18px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.88rem;
    cursor: pointer;
    white-space: nowrap;
  }
}
`;
const stylesContent = fs.readFileSync(stylesPath, 'utf8');
if (!stylesContent.includes('Phase 3 : éviter collision WhatsApp')) {
  fs.appendFileSync(stylesPath, cssExtra, 'utf8');
  console.log(`  styles.css : CSS Phase 3 (safe-area + collision + mobile CTA) appendé`);
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`TOTAL : ${stats.filesChanged} fichiers modifiés, ${stats.replacements} remplacements`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
