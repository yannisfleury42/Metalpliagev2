#!/usr/bin/env node
// Aligne les chiffres incohérents de RAL : 32/19 → 5 partout.
// Décision validée : "5 RAL standard en stock + autres sur devis sans surcoût".
// Idempotent : ne touche pas si déjà 5.

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const PAGES = [
  'index.html', 'pliage.html', 'accessoires.html',
  'appuis-de-fenetre.html', 'chapeaux-de-piliers.html', 'habillages-bandeaux.html',
];

// Replacements appliqués en ordre (du plus spécifique au plus générique).
const REPLACEMENTS = [
  [/\b32 finitions RAL\b/g, '5 finitions RAL standard + autres sur devis'],
  [/\b32 coloris RAL\b/g, '5 coloris RAL standard + autres sur devis'],
  [/\b19 coloris RAL\b/g, '5 coloris RAL standard'],
];

let touched = 0;
for (const page of PAGES) {
  const filePath = path.join(ROOT, page);
  if (!fs.existsSync(filePath)) { console.log(`SKIP missing: ${page}`); continue; }
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html;
  for (const [re, by] of REPLACEMENTS) html = html.replace(re, by);
  if (html === before) { console.log(`SKIP unchanged: ${page}`); continue; }
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`OK: ${page}`);
  touched++;
}
console.log(`\nDone. ${touched} files updated.`);
