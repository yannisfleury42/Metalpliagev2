#!/usr/bin/env node
// Convertit les photos hero en WebP qualité 80, max 1920px de large.
// Garde les originaux dans assets/photos/_orig/ pour rollback.
// Génère un mapping JSON pour mettre à jour les références dans index.html.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..', '..');
const PHOTOS_DIR = path.join(ROOT, 'assets', 'photos');
const ORIG_DIR = path.join(PHOTOS_DIR, '_orig');

// Liste des images utilisées (parsée depuis index.html — extrait du grep)
const USED = [
  'slide-01.jpg', 'slide-02.jpg', 'slide-08.jpg', 'slide-15.jpg',
  'ChatGPT Image 11 mai 2026, 11_41_54 (1).png',
  'ChatGPT Image 11 mai 2026, 11_41_55 (3).png',
  'ChatGPT Image 11 mai 2026, 11_41_55 (5).png',
  'ChatGPT Image 11 mai 2026, 11_41_56 (6).png',
  'ChatGPT Image 11 mai 2026, 11_46_19 (2).png',
  'ChatGPT Image 11 mai 2026, 11_46_19 (3).png',
  'ChatGPT Image 11 mai 2026, 11_46_20 (4).png',
  'ChatGPT Image 11 mai 2026, 11_46_20 (5).png',
  'ChatGPT Image 11 mai 2026, 11_46_20 (7).png',
  'ChatGPT Image 11 mai 2026, 11_46_23 (8).png',
  'ChatGPT Image 11 mai 2026, 11_49_42.png',
  'ChatGPT Image 11 mai 2026, 11_49_50.png',
  'ChatGPT Image 11 mai 2026, 11_49_57.png',
  'ChatGPT Image 11 mai 2026, 11_50_07.png',
  'ChatGPT Image 11 mai 2026, 12_05_07.png',
];

// Mapping : nom original -> slug SEO
function toSlug(filename, index) {
  if (filename.startsWith('slide-')) {
    return `metal-pliage-atelier-${filename.replace('.jpg', '.webp').replace('slide-', '')}`;
  }
  // ChatGPT Image -> slug numéroté (on garde l'info que c'est de l'IA, mais slug court)
  return `metal-pliage-hero-${String(index).padStart(2, '0')}.webp`;
}

if (!fs.existsSync(ORIG_DIR)) fs.mkdirSync(ORIG_DIR, { recursive: true });

const mapping = {};
let totalBefore = 0, totalAfter = 0;

(async () => {
  let idx = 0;
  for (const filename of USED) {
    idx++;
    const srcPath = path.join(PHOTOS_DIR, filename);
    if (!fs.existsSync(srcPath)) { console.log(`SKIP missing: ${filename}`); continue; }

    const slug = toSlug(filename, idx);
    const destPath = path.join(PHOTOS_DIR, slug);
    const origBackup = path.join(ORIG_DIR, filename);

    // Backup original si pas déjà fait
    if (!fs.existsSync(origBackup)) {
      fs.copyFileSync(srcPath, origBackup);
    }

    const sizeBefore = fs.statSync(srcPath).size;
    totalBefore += sizeBefore;

    try {
      await sharp(srcPath)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toFile(destPath);

      const sizeAfter = fs.statSync(destPath).size;
      totalAfter += sizeAfter;
      mapping[filename] = slug;
      const ratio = ((1 - sizeAfter / sizeBefore) * 100).toFixed(0);
      console.log(`OK: ${filename} → ${slug} (${(sizeBefore/1024).toFixed(0)} → ${(sizeAfter/1024).toFixed(0)} KB, -${ratio}%)`);
    } catch (e) {
      console.error(`FAIL: ${filename} — ${e.message}`);
    }
  }

  // Écrit le mapping pour réutilisation
  fs.writeFileSync(
    path.join(__dirname, 'webp-mapping.json'),
    JSON.stringify(mapping, null, 2)
  );

  console.log(`\nDone.`);
  console.log(`Avant : ${(totalBefore/1024/1024).toFixed(1)} MB`);
  console.log(`Après : ${(totalAfter/1024/1024).toFixed(1)} MB`);
  console.log(`Gain  : ${((1 - totalAfter/totalBefore) * 100).toFixed(0)}% (-${((totalBefore - totalAfter)/1024/1024).toFixed(1)} MB)`);
  console.log(`Mapping écrit dans _analyse-complete/scripts/webp-mapping.json`);
})();
