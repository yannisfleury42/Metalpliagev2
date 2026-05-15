#!/usr/bin/env node
// Ajoute favicon + apple-touch-icon + manifest + og:image + twitter:image
// sur toutes les pages publiques. Idempotent.
//
// Stratégie d'insertion : juste après <link rel="canonical"> (présent partout depuis sprint précédent).

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const PAGES = [
  'index.html', 'couvertines.html', 'pliage.html', 'configurateur.html',
  'configurateur-pliage.html', 'contact.html', 'guides.html',
  'accessoires.html', 'chapeaux-de-piliers.html', 'appuis-de-fenetre.html',
  'habillages-bandeaux.html', 'forme-libre.html', 'cgv.html',
  'mentions-legales.html', 'confidentialite.html', 'livraison-retours.html',
  'commande-confirmee.html',
];

const META_BLOCK = `<!-- Favicons + manifest -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#1a1a1a">
  <!-- Open Graph / partages sociaux -->
  <meta property="og:image" content="https://metal-pliage.fr/og-cover.svg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Metal Pliage — Couvertines et pliage acier sur mesure">
  <meta name="twitter:image" content="https://metal-pliage.fr/og-cover.svg">
  `;

// On insère après le canonical (assuré présent sur toutes les pages).
const ANCHOR_RE = /(<link rel="canonical" href="[^"]+">\r?\n  )/;

let touched = 0, skipped = 0;
for (const page of PAGES) {
  const filePath = path.join(ROOT, page);
  if (!fs.existsSync(filePath)) { console.log(`SKIP missing: ${page}`); skipped++; continue; }
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('rel="icon" type="image/svg+xml"')) { console.log(`SKIP already: ${page}`); skipped++; continue; }
  if (!ANCHOR_RE.test(html)) { console.log(`SKIP no-canonical: ${page}`); skipped++; continue; }
  html = html.replace(ANCHOR_RE, `$1${META_BLOCK}`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`OK: ${page}`);
  touched++;
}
console.log(`\nDone. ${touched} files updated, ${skipped} skipped.`);
