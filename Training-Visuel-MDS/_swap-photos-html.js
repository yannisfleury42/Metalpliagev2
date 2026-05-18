#!/usr/bin/env node
// Remplace les 6 cartes SVG de la galerie home par 6 vraies photos.
// Remplace aussi les 3 témoignages fake par les vrais avis Google.

const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

// ─── 1. CSS : étendre la règle img comme svg ────────────────────────
html = html.replace(
  '.mds-realisation-card svg { width: 100%; height: 100%; display: block; }',
  `.mds-realisation-card svg, .mds-realisation-card img { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform .5s var(--ease, ease); }
    .mds-realisation-card:hover img { transform: scale(1.04); }`
);

// ─── 2. Remplacer les 6 cartes réalisations ─────────────────────────
const newGrid = `      <div class="mds-realisations-grid">

        <a href="realisations.html" class="mds-realisation-card animate-fadeup" aria-label="Escalier suspendu marches bois, garde-corps verre">
          <img src="assets/photos-chantiers/escalier-suspendu-bois-verre.webp" alt="Escalier suspendu en marches bois avec garde-corps en verre, intérieur contemporain" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-realisation-caption">Escalier suspendu bois &amp; verre<span>Auvergne-Rhône-Alpes · 2025</span></div>
        </a>

        <a href="realisations.html" class="mds-realisation-card animate-fadeup" style="--delay: 0.05s" aria-label="Portails noirs sur mur en pierre, accès piscine">
          <img src="assets/photos-chantiers/portails-noir-pierre-piscine.webp" alt="Portails métalliques noirs intégrés dans un mur en pierre, accès piscine" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-realisation-caption">Portails sur mur en pierre<span>Loire · 2024</span></div>
        </a>

        <a href="realisations.html" class="mds-realisation-card animate-fadeup" style="--delay: 0.1s" aria-label="Escalier hélicoïdal blanc avec câbles inox">
          <img src="assets/photos-chantiers/escalier-helicoidal-blanc.webp" alt="Escalier hélicoïdal blanc avec garde-corps à câbles inox tendus" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-realisation-caption">Escalier hélicoïdal blanc<span>Saint-Étienne · 2024</span></div>
        </a>

        <a href="realisations.html" class="mds-realisation-card animate-fadeup" aria-label="Garde-corps en tôle découpée laser motifs géométriques">
          <img src="assets/photos-chantiers/garde-corps-laser-motifs-geometriques.webp" alt="Garde-corps en tôle découpée laser avec motifs géométriques arabesques" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-realisation-caption">Garde-corps tôle laser sur mesure<span>Particulier · 2024</span></div>
        </a>

        <a href="realisations.html" class="mds-realisation-card animate-fadeup" style="--delay: 0.05s" aria-label="Garde-corps fer forgé sur rénovation grange">
          <img src="assets/photos-chantiers/garde-corps-fer-forge-grange.webp" alt="Garde-corps en fer forgé intégré dans une rénovation de grange avec charpente bois" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-realisation-caption">Garde-corps fer forgé<span>Rénovation grange · 2023</span></div>
        </a>

        <a href="realisations.html" class="mds-realisation-card animate-fadeup" style="--delay: 0.1s" aria-label="Verrière acier noir style atelier dans une salle de bain">
          <img src="assets/photos-chantiers/verriere-noir-salle-de-bain-bois.webp" alt="Verrière acier noir style atelier séparant une salle de bain, avec suspensions en raphia" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-realisation-caption">Verrière atelier salle de bain<span>2024</span></div>
        </a>

      </div>`;

// Regex multi-ligne pour matcher TOUT le bloc <div class="mds-realisations-grid">...</div>
const gridRegex = /<div class="mds-realisations-grid">[\s\S]*?(?=\n\s*<div class="mds-cta-row)/;
html = html.replace(gridRegex, newGrid + '\n\n      ');

// ─── 3. Remplacer les 3 témoignages fake par les vrais avis Google ──
const reviewsRegex = /<div class="mds-reviews-grid">[\s\S]*?(?=\n\s*<\/div>\n\n      <div class="mds-reviews-link">)/;
const newReviews = `      <div class="mds-reviews-grid">

        <article class="mds-review-card animate-fadeup">
          <div class="mds-review-stars" aria-label="5 sur 5">★★★★★</div>
          <p class="mds-review-text">« De supers professionnels. Yannis et Dimitri sont intervenus sur un chantier compliqué. Ils ont été à la hauteur. »</p>
          <p class="mds-review-author">David Breysse<span>Avis Google · octobre 2025</span></p>
        </article>

        <article class="mds-review-card animate-fadeup" style="--delay: 0.05s">
          <div class="mds-review-stars" aria-label="5 sur 5">★★★★★</div>
          <p class="mds-review-text">« Seconde fois que MDS intervient chez nous et le travail est toujours soigné et le rendu au top. Merci. »</p>
          <p class="mds-review-author">Jessica Di Prospero<span>Avis Google · décembre 2022</span></p>
        </article>

        <article class="mds-review-card animate-fadeup" style="--delay: 0.1s">
          <div class="mds-review-stars" aria-label="5 sur 5">★★★★★</div>
          <p class="mds-review-text">« Très contente de travailler avec MDS ! Rendu propre et solide ! »</p>
          <p class="mds-review-author">Lila Demarcq<span>Avis Google</span></p>
        </article>

      </div>`;
html = html.replace(reviewsRegex, newReviews);

if (html === before) {
  console.log('⚠️ Aucun changement (regex no match)');
  process.exit(1);
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ index.html : galerie + avis remplacés');
console.log(`   Diff : ${(before.length - html.length > 0 ? '-' : '+')}${Math.abs(before.length - html.length)} chars`);
