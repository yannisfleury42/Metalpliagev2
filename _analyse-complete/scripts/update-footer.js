#!/usr/bin/env node
// Met à jour le footer de toutes les pages :
// 1. Remplace "<p>France</p>" par l'adresse complète atelier
// 2. Ajoute une ligne mentions légales (SARL, RCS, TVA) dans .footer-bottom
// Idempotent : ne touche pas si déjà fait.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// Pages qui ont un footer (vérifié par grep). On exclut les pages backup/old.
const PAGES = [
  'index.html', 'contact.html', 'pliage.html', 'guides.html',
  'accessoires.html', 'chapeaux-de-piliers.html', 'appuis-de-fenetre.html',
  'habillages-bandeaux.html', 'forme-libre.html', 'cgv.html',
  'mentions-legales.html', 'confidentialite.html', 'livraison-retours.html',
];

const OLD_ADDRESS = '<p>France</p>';
const NEW_ADDRESS = '<p>8 Rue Édouard Martel<br>42000 Saint-Étienne</p>';

const FOOTER_LEGAL_LINE = '<p class="footer-legal-line">METALLIER DESIGN SERVICE - M.D.S. · SARL au capital de 5 000 € · RCS Saint-Étienne 844 258 178 · TVA FR77844258178</p>\n      ';

const COPYRIGHT_PATTERN = /(<p>© <span id="footer-year">\d{4}<\/span> Metal Pliage — Tous droits réservés<\/p>\n)/;

let touched = 0, skipped = 0;
for (const page of PAGES) {
  const filePath = path.join(ROOT, page);
  if (!fs.existsSync(filePath)) { console.log(`SKIP missing: ${page}`); skipped++; continue; }
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html;

  // 1. Address atelier
  if (html.includes(NEW_ADDRESS)) {
    // déjà fait
  } else if (html.includes(OLD_ADDRESS)) {
    html = html.replace(OLD_ADDRESS, NEW_ADDRESS);
  }

  // 2. Ligne mentions légales
  if (!html.includes('footer-legal-line')) {
    html = html.replace(COPYRIGHT_PATTERN, `$1      ${FOOTER_LEGAL_LINE}`);
  }

  if (html === before) { console.log(`SKIP unchanged: ${page}`); skipped++; continue; }
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`OK: ${page}`);
  touched++;
}
console.log(`\nDone. ${touched} files updated, ${skipped} skipped.`);
