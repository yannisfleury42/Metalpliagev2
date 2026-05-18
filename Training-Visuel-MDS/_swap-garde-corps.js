#!/usr/bin/env node
// Garde-corps.html :
// 1) Remplace "3 familles" par section "polyvalence" (matériaux + styles + finitions)
// 2) Remplace galerie SVG par 6 vraies photos garde-corps
// 3) Étend CSS pour <img> dans la galerie

const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'garde-corps.html');
let html = fs.readFileSync(filePath, 'utf8');
const before = html;

// ─── 1. CSS : étendre la règle img comme svg ───────────────────────
html = html.replace(
  '.mds-gallery-item svg { width: 100%; height: 100%; display: block; }',
  `.mds-gallery-item svg, .mds-gallery-item img { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform .5s var(--ease, ease); }
    .mds-gallery-item:hover img { transform: scale(1.04); }`
);

// ─── 2. Remplacer section "3 familles" ─────────────────────────────
const newPolyvalence = `  <section class="mds-section" aria-labelledby="types-title">
    <div class="mds-section-inner">
      <header class="mds-section-header animate-fadeup">
        <span class="section-label">NOTRE SAVOIR-FAIRE</span>
        <h2 id="types-title">Tous types de garde-corps, sur mesure</h2>
        <p>Nous concevons et fabriquons tout type de garde-corps selon vos plans, votre style et votre budget. Acier, inox, aluminium, verre — barreaudé, tôlé, perforé, vitré, fer forgé. Toutes les configurations sont possibles.</p>
      </header>

      <div class="mds-polyvalence-grid">

        <article class="mds-polyvalence-card animate-fadeup">
          <h3>Matériaux</h3>
          <ul>
            <li>Acier laqué (toutes teintes RAL)</li>
            <li>Inox brossé (AISI 304 / 316L)</li>
            <li>Aluminium thermolaqué</li>
            <li>Fer forgé patiné</li>
            <li>Verre feuilleté trempé (10+10+2 mm)</li>
            <li>Combinaisons mixtes (acier + verre, inox + bois)</li>
          </ul>
        </article>

        <article class="mds-polyvalence-card animate-fadeup" style="--delay: 0.05s">
          <h3>Styles &amp; remplissages</h3>
          <ul>
            <li>Barreaudage vertical, horizontal, diagonal</li>
            <li>Tôle pleine (acier laqué, brut)</li>
            <li>Tôle perforée (motifs ronds, carrés, motifs sur mesure)</li>
            <li>Découpe laser (motifs design, sur plan, sur photo)</li>
            <li>Panneaux verre feuilleté (pinces inox)</li>
            <li>Fer forgé classique (rinceaux, arabesques)</li>
            <li>Rampants et droits, formes courbes possibles</li>
          </ul>
        </article>

        <article class="mds-polyvalence-card animate-fadeup" style="--delay: 0.1s">
          <h3>Configurations</h3>
          <ul>
            <li>Escaliers intérieurs (droit, hélicoïdal, rampant)</li>
            <li>Mezzanines, paliers, coursives</li>
            <li>Terrasses, balcons, loggias</li>
            <li>Acrotères, garde-corps extérieurs</li>
            <li>Piscines (conformes NF P 90-306)</li>
            <li>Bord de mer (inox 316L)</li>
            <li>Conformes <strong>NF P 01-012</strong> (hauteur 1 m mini, espacement ≤ 11 cm)</li>
          </ul>
        </article>

      </div>

      <p class="mds-polyvalence-note">
        Aucune configuration n'est figée. Si vous avez une idée précise, un plan d'architecte, ou une inspiration, nous l'étudions et la fabriquons. <a href="devis.html" style="color:var(--accent);font-weight:600;">Envoyez-nous votre projet</a>.
      </p>
    </div>
  </section>

  <style>
    .mds-polyvalence-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.6rem;
      margin: 2rem 0 1.5rem;
    }
    .mds-polyvalence-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 1.6rem 1.4rem;
    }
    .mds-polyvalence-card h3 {
      font-size: 1.05rem;
      color: var(--text-primary);
      margin-bottom: 1rem;
      padding-bottom: 0.6rem;
      border-bottom: 2px solid var(--accent);
    }
    .mds-polyvalence-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .mds-polyvalence-card li {
      font-size: 0.88rem;
      color: var(--text-secondary);
      line-height: 1.55;
      padding: 6px 0 6px 18px;
      position: relative;
    }
    .mds-polyvalence-card li::before {
      content: "→";
      position: absolute;
      left: 0;
      color: var(--accent);
      font-weight: 700;
    }
    .mds-polyvalence-card strong { color: var(--text-primary); }
    .mds-polyvalence-note {
      text-align: center;
      font-size: 0.92rem;
      color: var(--text-secondary);
      margin: 1.6rem auto 0;
      max-width: 720px;
      padding: 1rem;
      background: rgba(230, 62, 0, 0.06);
      border-left: 3px solid var(--accent);
      border-radius: 4px;
    }
    @media (max-width: 860px) {
      .mds-polyvalence-grid { grid-template-columns: 1fr; }
    }
  </style>`;

const oldTypesRegex = /<section class="mds-section" aria-labelledby="types-title">[\s\S]*?<\/section>(?=\n\n  <!-- ═+\n {7}PROCESS)/;
html = html.replace(oldTypesRegex, newPolyvalence);

// ─── 3. Remplacer galerie de 6 SVG par 6 vraies photos ─────────────
const newGallery = `      <div class="mds-gallery-grid">

        <div class="mds-gallery-item animate-fadeup">
          <img src="assets/photos-chantiers/garde-corps-verre-terrasse-jardin.webp" alt="Garde-corps en verre sécurité sur terrasse extérieure avec vue jardin" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-gallery-cap">Garde-corps verre — Terrasse jardin</div>
        </div>

        <div class="mds-gallery-item animate-fadeup" style="--delay: 0.05s">
          <img src="assets/photos-chantiers/garde-corps-laser-motifs-geometriques.webp" alt="Garde-corps en tôle découpée laser, motifs géométriques arabesques blancs" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-gallery-cap">Tôle découpée laser — Motifs sur mesure</div>
        </div>

        <div class="mds-gallery-item animate-fadeup" style="--delay: 0.1s">
          <img src="assets/photos-chantiers/garde-corps-fer-forge-grange.webp" alt="Garde-corps en fer forgé classique avec verrière atelier sur rénovation grange" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-gallery-cap">Fer forgé — Rénovation grange</div>
        </div>

        <div class="mds-gallery-item animate-fadeup">
          <img src="assets/photos-chantiers/garde-corps-barreaux-bleu-terrasse.webp" alt="Garde-corps extérieur à barreaux verticaux bleu pâle sur terrasse panoramique en pierre" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-gallery-cap">Barreaudage vertical — Terrasse extérieure</div>
        </div>

        <div class="mds-gallery-item animate-fadeup" style="--delay: 0.05s">
          <img src="assets/photos-chantiers/garde-corps-fer-forge-comble.webp" alt="Garde-corps fer forgé classique noir avec rinceaux sur palier de comble" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-gallery-cap">Fer forgé rinceaux — Palier comble</div>
        </div>

        <div class="mds-gallery-item animate-fadeup" style="--delay: 0.1s">
          <img src="assets/photos-chantiers/escalier-beton-garde-corps-verre.webp" alt="Garde-corps en verre transparent avec main courante bois sur escalier béton ciré" loading="lazy" decoding="async" width="400" height="300">
          <div class="mds-gallery-cap">Verre + main courante bois — Escalier béton</div>
        </div>

      </div>`;

const oldGalleryRegex = /<div class="mds-gallery-grid">[\s\S]*?(?=\n\s*<\/div>\n\s*<\/div>\n\s*<\/section>)/;
html = html.replace(oldGalleryRegex, newGallery);

if (html === before) {
  console.log('⚠️ Aucun changement (regex no match)');
  process.exit(1);
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ garde-corps.html : polyvalence + galerie remplacées');
console.log(`   Diff : ${(before.length - html.length > 0 ? '-' : '+')}${Math.abs(before.length - html.length)} chars`);
