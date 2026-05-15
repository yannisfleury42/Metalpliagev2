#!/usr/bin/env node
// Ajoute <link rel="canonical"> juste avant <link rel="stylesheet" href="css/styles.css">
// sur les pages principales — idempotent : ne touche pas si la canonical existe déjà.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = 'https://metal-pliage.fr';

const PAGES = [
  'index.html', 'couvertines.html', 'pliage.html', 'configurateur.html',
  'configurateur-pliage.html', 'contact.html', 'guides.html',
  'accessoires.html', 'chapeaux-de-piliers.html', 'appuis-de-fenetre.html',
  'habillages-bandeaux.html', 'forme-libre.html', 'cgv.html',
  'mentions-legales.html', 'confidentialite.html', 'livraison-retours.html',
  'commande-confirmee.html',
];

const ANCHOR = '<link rel="stylesheet" href="css/styles.css">';

let touched = 0, skipped = 0;
for (const page of PAGES) {
  const filePath = path.join(ROOT, page);
  if (!fs.existsSync(filePath)) { console.log(`SKIP (missing): ${page}`); skipped++; continue; }
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('rel="canonical"')) { console.log(`SKIP (already): ${page}`); skipped++; continue; }
  if (!html.includes(ANCHOR)) { console.log(`SKIP (no anchor): ${page}`); skipped++; continue; }

  const canonicalUrl = page === 'index.html' ? `${BASE}/` : `${BASE}/${page}`;
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}">\n  `;
  html = html.replace(ANCHOR, canonicalTag + ANCHOR);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`OK: ${page} -> ${canonicalUrl}`);
  touched++;
}
console.log(`\nDone. ${touched} files updated, ${skipped} skipped.`);
