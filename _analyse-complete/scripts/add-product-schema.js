#!/usr/bin/env node
// Ajoute un JSON-LD Product sur les fiches produits.
// Insertion : juste après </script> de la canonical / favicons (avant le bloc <style> ou </head>).

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const PRODUCTS = {
  'couvertines.html': {
    name: 'Couvertine acier sur mesure',
    description: 'Couvertine acier laqué prélaqué pour protection de tête de mur. Sur mesure, retours latéraux, rejet d\'eau intégré, 5 coloris RAL standard. Fabrication française.',
    lowPrice: '28',
    priceUnit: 'metre linéaire HT',
    url: 'https://metal-pliage.fr/couvertines.html',
    image: 'https://metal-pliage.fr/assets/couvertine-photo/couvertine plate.jpg',
  },
  'pliage.html': {
    name: 'Pliage acier sur mesure',
    description: 'Pliage CNC acier, aluminium et inox sur mesure. Formes U, L, Z, appuis de fenêtre, jusqu\'à 6 m de longueur. Tolérance ±0,5 mm.',
    lowPrice: '75',
    priceUnit: 'm² HT',
    url: 'https://metal-pliage.fr/pliage.html',
    image: 'https://metal-pliage.fr/og-cover.svg',
  },
  'chapeaux-de-piliers.html': {
    name: 'Chapeau de pilier acier sur mesure',
    description: 'Chapeau de pilier acier laqué pour couverture de pilier maçonné. 4 faces fraisées, ajustement au millimètre, 5 coloris RAL.',
    url: 'https://metal-pliage.fr/chapeaux-de-piliers.html',
    image: 'https://metal-pliage.fr/og-cover.svg',
  },
  'appuis-de-fenetre.html': {
    name: 'Appui de fenêtre acier sur mesure',
    description: 'Appui de fenêtre acier laqué avec larmier intégré, pente ajustable de 3° à 15°, protection contre les infiltrations.',
    url: 'https://metal-pliage.fr/appuis-de-fenetre.html',
    image: 'https://metal-pliage.fr/og-cover.svg',
  },
  'habillages-bandeaux.html': {
    name: 'Habillage bandeau acier — Type U & L',
    description: 'Habillage bandeau acier laqué type U ou L pour protection de bois de façade et bandeaux de toiture. Étanchéité garantie.',
    url: 'https://metal-pliage.fr/habillages-bandeaux.html',
    image: 'https://metal-pliage.fr/og-cover.svg',
  },
};

function buildSchema(p) {
  const base = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.image,
    url: p.url,
    brand: { "@type": "Brand", name: "Metal Pliage" },
    manufacturer: {
      "@type": "Organization",
      name: "METALLIER DESIGN SERVICE - M.D.S.",
      url: "https://metal-pliage.fr"
    },
    countryOfOrigin: { "@type": "Country", name: "France" },
  };
  if (p.lowPrice) {
    base.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: p.lowPrice,
      offerCount: "1",
      availability: "https://schema.org/InStock",
      url: p.url,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: p.lowPrice,
        priceCurrency: "EUR",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: p.priceUnit }
      },
      seller: { "@type": "Organization", name: "Metal Pliage" }
    };
  }
  return base;
}

// Anchor : on insère juste après la fermeture du dernier <meta name="twitter:image"> bloc
const ANCHOR_RE = /(<meta name="twitter:image" content="[^"]+">\r?\n  )/;

let touched = 0, skipped = 0;
for (const [page, product] of Object.entries(PRODUCTS)) {
  const filePath = path.join(ROOT, page);
  if (!fs.existsSync(filePath)) { console.log(`SKIP missing: ${page}`); skipped++; continue; }
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('"@type": "Product"')) { console.log(`SKIP already: ${page}`); skipped++; continue; }
  if (!ANCHOR_RE.test(html)) { console.log(`SKIP no-anchor: ${page}`); skipped++; continue; }

  const schema = buildSchema(product);
  const block = `<script type="application/ld+json">\n  ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n  ')}\n  </script>\n  `;
  html = html.replace(ANCHOR_RE, `$1${block}`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`OK: ${page}`);
  touched++;
}
console.log(`\nDone. ${touched} files updated, ${skipped} skipped.`);
