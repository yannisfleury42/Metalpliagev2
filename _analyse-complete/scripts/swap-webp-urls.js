#!/usr/bin/env node
// Remplace les URLs .png/.jpg du slideshow par les .webp générés.
// Lit le mapping créé par convert-photos-webp.js.

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'webp-mapping.json'), 'utf8'));

const PAGES = ['index.html'];

let totalReplaced = 0;
for (const page of PAGES) {
  const filePath = path.join(ROOT, page);
  if (!fs.existsSync(filePath)) { console.log(`SKIP missing: ${page}`); continue; }
  let html = fs.readFileSync(filePath, 'utf8');
  let count = 0;

  for (const [oldName, newName] of Object.entries(mapping)) {
    // Le nom dans le HTML peut être encodé URL (espaces -> %20, virgules -> %2C, etc.)
    const oldEncoded = encodeURI(oldName);
    const oldEncodedComma = oldEncoded.replace(/,/g, '%2C');
    const variants = [oldName, oldEncoded, oldEncodedComma];

    for (const v of variants) {
      while (html.includes(v)) {
        html = html.replace(v, newName);
        count++;
      }
    }
  }

  if (count > 0) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`${page}: ${count} URL(s) remplacée(s)`);
    totalReplaced += count;
  } else {
    console.log(`${page}: aucun changement`);
  }
}
console.log(`\nTotal : ${totalReplaced} URL(s) remplacée(s).`);
