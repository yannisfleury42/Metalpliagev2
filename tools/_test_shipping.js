/* Verification du modele d'expedition de js/cart.js sur des commandes REELLES.
   Le code teste n'est pas recopie : il est extrait du fichier de production,
   sinon le test valide une copie et pas ce qui tourne chez le client.

   Revise le 06/10/2026 — bareme GEODIS signe (ref. client MY50). Ce qui change
   par rapport au jeu de tests precedent :
     — la base de facturation est le POIDS TAXABLE = max(brut ; volume x 150),
       plus le poids brut. Une couvertine alu de 2 m pese 2,4 kg et en taxe 7.
     — les bornes de tranches sont celles de Geodis (4/9/14/19/29/39/...99).
     — franco unique a 300 EUR TTC, SANS plafond de poids.
     — une seule grille : Geodis n'a pas d'offre colis sous 1,20 m.

   Lancer : node tools/_test_shipping.js                               */
'use strict';
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'cart.js'), 'utf8');
const debut = src.indexOf('  const TVA = 1.20;');
const fin   = src.indexOf('  const RESEAU_LABEL = {');
if (debut < 0 || fin < 0) throw new Error('bloc modele d expedition introuvable dans cart.js');

const modele = src.slice(debut, fin);
const ctx = new Function('cart', modele + '\n return { expedition, poidsUnitaireKg, longueurMm, kgParM2 };');

const eur = (c) => (c / 100).toFixed(2).replace('.', ',') + ' €';
let echecs = 0;

function scenario(titre, items, cp, attendu) {
  const m = ctx(items);
  const total = items.reduce((s, it) => s + it.price * it.qty + (it.extrasCents || 0), 0);
  const e = m.expedition(total, cp);
  console.log('\n── ' + titre);
  console.log('   marchandise      : ' + eur(total) + ' TTC');
  console.log('   poids net pieces : ' + e.kgNet.toFixed(2) + ' kg');
  console.log('   poids brut colis : ' + e.kgBrut.toFixed(2) + ' kg');
  console.log('   POIDS TAXABLE    : ' + e.kgTaxable + ' kg  (volume ' + e.volM3.toFixed(3) + ' m³)');
  console.log('   gabarit declare  : ' + e.gabarit);
  console.log('   port             : ' + (e.gratuit ? 'OFFERT (franco ' + e.franco / 100 + ' € TTC)'
                                        : e.surDevis ? 'A COTER' : eur(e.portTtcCents) + ' TTC / ' + eur(e.portHtCents) + ' HT'));
  console.log('   total client     : ' + eur(total + e.portTtcCents) + ' TTC');
  if (attendu) {
    for (const k of Object.keys(attendu)) {
      const got = typeof e[k] === 'number' ? Math.round(e[k] * 100) / 100 : e[k];
      const ok = got === attendu[k];
      if (!ok) { echecs++; console.log('   ✗ ' + k + ' attendu ' + attendu[k] + ', obtenu ' + got); }
      else console.log('   ✓ ' + k + ' = ' + got);
    }
  }
  return e;
}

/* ── 1. DOUISSARD MP-260922-1420-1O indice D (reelle) ──────────────────────
   3 pieces de 2 000 mm. Colis 2 060 x 260 x 150 = 0,080 m³ -> 13 kg taxables
   pour 4,2 kg reels : c'est bien le volume qui paie. Tranche <= 14 kg = 70 €.
   Le prix spot de 63,27 € facture le 30/09 etait HORS bareme (applicable au
   01/10) : il ne sert plus de reference. */
scenario('DOUISSARD — couvertine dev. 650 L2000 + 2 profils L L2000 + 2 talons + visserie', [
  { name: 'Couvertine', price: 12480, qty: 1, extrasCents: 1200, length: 'L=2000mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 650, lenMm: 2000, accKg: 0.20, accLenMm: 200 } },
  { name: 'Pliage L 70x50', price: 4200, qty: 2, extrasCents: 3840, length: 'L=2000mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 120, lenMm: 2000, accKg: 0.60, accLenMm: 120 } },
], '88400', { hors: false, gratuit: false, kgTaxable: 13, portHtCents: 7000 });

/* ── 2. FRUMHOLTZ MP-260920-1154-0I (reelle) ───────────────────────────────
   1 couvertine alu de 2 000 mm, le cas le plus frequent du catalogue.
   Colis 2 060 x 260 x 90 = 0,048 m³ -> 8 kg taxables pour 1,8 kg reels.
   Tranche <= 9 kg = 60 €. Au bareme Geodis, cet envoi vers le 57 coute 41,74 €
   (chiffre par Cedric a 42,03) : la marge couvre la surcharge energie
   provisionnee et l'ecart de zone jusqu'au Finistere. */
scenario('FRUMHOLTZ — 1 couvertine alu 1,5 RAL 9006, dev. 330, L 2000', [
  { name: 'Couvertine', price: 7128, qty: 1, length: 'L=2000mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 330, lenMm: 2000 } },
], '57360', { hors: false, gratuit: false, kgTaxable: 8, portHtCents: 6000 });

/* ── 3. Une couvertine de 3 m seule : 10 kg taxables, on passe a 70 € ──────
   C'est la demonstration que la longueur ne compte QUE par le volume qu'elle
   cree : meme piece, 1 000 mm de plus, une tranche de plus. */
scenario('1 couvertine alu 3 m seule', [
  { name: 'Couvertine', price: 9720, qty: 1, length: 'L=3000mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 300, lenMm: 3000 } },
], '29200', { kgTaxable: 11, portHtCents: 7000, gratuit: false });

/* ── 4. La commande moyenne, celle que l'ancienne grille massacrait ────────
   4 couvertines acier 2 m : 125 € de port avant le 06/10, 80 € maintenant,
   pour un envoi qui en coute 74 pire metropole. */
scenario('4 couvertines acier 2 m, 244,80 EUR TTC — sous le franco, port facture', [
  { name: 'Couvertine', price: 6120, qty: 4, length: 'L=2000mm',
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 300, lenMm: 2000 } },
], '42100', { gratuit: false, kgTaxable: 15, portHtCents: 8000 });

/* ── 5. Le franco a 300 EUR TTC se declenche, et seulement au bon endroit ── */
scenario('5 couvertines alu 2,5 m, 405 EUR TTC — franco atteint (payait 125 EUR avant)', [
  { name: 'Couvertine', price: 8100, qty: 5, length: 'L=2500mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 300, lenMm: 2500 } },
], '42100', { gratuit: true, portHtCents: 0 });

scenario('4 couvertines alu 2,5 m, 324 EUR TTC — juste au-dessus du franco', [
  { name: 'Couvertine', price: 8100, qty: 4, length: 'L=2500mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 300, lenMm: 2500 } },
], '42100', { gratuit: true, portHtCents: 0 });

scenario('3 couvertines alu 2,5 m, 243 EUR TTC — sous le franco', [
  { name: 'Couvertine', price: 8100, qty: 3, length: 'L=2500mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 300, lenMm: 2500 } },
], '42100', { gratuit: false, portHtCents: 8000 });

/* ── 6. LE PLAFOND DE POIDS A SAUTE ────────────────────────────────────────
   10 couvertines acier de 3 m : 74 kg reels, 958 EUR HT. Avant le 06/10 cette
   commande — la plus rentable du lot — basculait en « cotation » a cause du
   plafond a 50 kg, donc en formulaire de contact, donc en commande perdue.
   Elle doit maintenant partir en port OFFERT. */
scenario('10 couvertines acier 3 m, 1 149 EUR TTC et 74 kg — franco, plus de plafond', [
  { name: 'Couvertine', price: 11491, qty: 10, length: 'L=3000mm',
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 420, lenMm: 3000 } },
], '42100', { gratuit: true, surDevis: false, portHtCents: 0 });

/* ── 7. Au-dela de la derniere tranche du bareme : on cote ─────────────────
   > 99 kg taxables, il n'y a plus de prix au forfait chez Geodis (il passe au
   prix aux 100 kg). On ne devine pas. */
scenario('30 couvertines acier 3 m — au-dela de 99 kg taxables', [
  { name: 'Couvertine', price: 11491, qty: 30, length: 'L=3000mm',
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 420, lenMm: 3000 } },
], '42100', { surDevis: true, portHtCents: 0 });

/* Au-dela des 4 m du bareme : on cote. */
scenario('1 piece de 4 500 mm — hors limite du bareme', [
  { name: 'Pliage', price: 20000, qty: 1, length: 'L=4500mm',
    ship: { material: 'alu', thicknessMm: 2, devMm: 300, lenMm: 4500 } },
], '42100', { surDevis: true, portHtCents: 0, hors: true });

/* ── 8. Outre-mer : jamais de franco, jamais de prix devine ────────────── */
scenario('Envoi a La Reunion (97400) au-dessus du franco', [
  { name: 'Couvertine', price: 9180, qty: 5, length: 'L=2000mm',
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 300, lenMm: 2000 } },
], '97400', { surDevis: true, gratuit: false, portHtCents: 0 });

/* ── 9. Accessoire seul : Geodis n'a pas d'offre colis, c'est 55 EUR ─────
   L'ancienne grille facturait 11 EUR un envoi qui en coute 45 pire metropole.
   Ce test documente une perte evitee, pas un tarif attractif : la seule facon
   de descendre cette tranche est d'ouvrir un compte Colissimo. */
scenario('1 cartouche de colle MS seule', [
  { name: 'Colle MS Polymère', price: 1680, qty: 1, length: '600 ml',
    ship: { kg: 0.90, lenMm: 250 } },
], '42100', { reseau: 'petit', portHtCents: 5500 });

/* ── 10. Panier ancien, sans `ship` : doit retomber sur un defaut prudent ─ */
scenario('Panier legacy sans champ ship (localStorage d avant le 28/09)', [
  { name: 'Couvertine métallique', price: 9180, qty: 2, length: '2,5 m' },
], '42100', { lMax: 2500, reseau: 'long', hors: false });

/* ── 11. INVARIANTS DU BAREME ─────────────────────────────────────────────
   Trois proprietes qui doivent tenir quoi qu'il arrive, et dont la violation
   signifierait qu'on vend du port en dessous de son cout. */
console.log('\n── INVARIANTS');
const m = ctx([]);
function check(libelle, ok) {
  if (ok) { console.log('   ✓ ' + libelle); }
  else { echecs++; console.log('   ✗ ' + libelle); }
}

// a) Le poids taxable ne peut jamais etre inferieur au poids brut reel.
let viol = 0;
for (const n of [1, 2, 3, 5, 8, 12, 20]) {
  for (const L of [2000, 2500, 3000]) {
    const items = [{ name: 'C', price: 9180, qty: n, length: 'L=' + L + 'mm',
      ship: { material: 'acier', thicknessMm: 1.5, devMm: 520, lenMm: L } }];
    const e = ctx(items).expedition(0, '42100');
    if (e.kgTaxable < e.kgBrut) viol++;
  }
}
check('poids taxable >= poids brut sur 21 combinaisons', viol === 0);

// b) La grille est strictement croissante : aucune tranche ne doit couter
//    moins que la precedente, sinon il devient rentable d'alourdir un colis.
const grilleSrc = /const GRILLE = \[([\s\S]*?)\];/.exec(src);
const paires = [...grilleSrc[1].matchAll(/maxKg:\s*(\d+),\s*ht:\s*(\d+)/g)]
  .map((x) => [Number(x[1]), Number(x[2])]);
check('grille strictement croissante (' + paires.length + ' tranches)',
  paires.every((p, i) => i === 0 || (p[0] > paires[i - 1][0] && p[1] > paires[i - 1][1])));

// c) Les bornes sont celles du bareme Geodis. Si quelqu'un les « arrondit »
//    a 5/10/20/30, on refacture une tranche de moins que Geodis sur chaque
//    envoi qui tombe juste au-dessus.
check('bornes alignees sur le bareme Geodis',
  JSON.stringify(paires.map((p) => p[0])) === JSON.stringify([4, 9, 14, 19, 29, 39, 49, 59, 69, 79, 99]));

console.log('\n' + (echecs ? '✗ ' + echecs + ' assertion(s) en echec' : '✓ toutes les assertions passent'));
process.exit(echecs ? 1 : 0);
