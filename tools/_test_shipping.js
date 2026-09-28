/* Verification du modele d'expedition de js/cart.js sur des commandes REELLES.
   Le code teste n'est pas recopie : il est extrait du fichier de production,
   sinon le test valide une copie et pas ce qui tourne chez le client.
   Lancer : node tools/_test_shipping.js                               */
'use strict';
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'cart.js'), 'utf8');
const debut = src.indexOf('  const TVA = 1.20;');
const fin   = src.indexOf('  function livraisonLigne(order)');
if (debut < 0 || fin < 0) throw new Error('bloc modele d expedition introuvable dans cart.js');

let cart = [];
const modele = src.slice(debut, fin);
const api = new Function('getCart', modele + '\n return { expedition, poidsUnitaireKg, longueurMm, kgParM2 };')
  .call(null, () => cart);
// `cart` est une globale dans l'IIFE de production : on la recree ici.
global.cart = [];
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
  const RES = { petit: 'colis compact', long: 'fardeau colis long (tarif au poids)' };
  console.log('   longueur maxi    : ' + e.lMax + ' mm  → ' + RES[e.reseau]);
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
}

/* ── 1. DOUISSARD MP-260922-1420-1O indice D (reelle, port paye 63,27 € HT) ── */
scenario('DOUISSARD — couvertine dev. 650 L2000 + 2 profils L L2000 + 2 talons + visserie', [
  { name: 'Couvertine', price: 12480, qty: 1, extrasCents: 1200, length: 'L=2000mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 650, lenMm: 2000, accKg: 0.20, accLenMm: 200 } },
  { name: 'Pliage L 70x50', price: 4200, qty: 2, extrasCents: 3840, length: 'L=2000mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 120, lenMm: 2000, accKg: 0.60, accLenMm: 120 } },
], '88400', { hors: false, gratuit: false });

/* ── 2. DOUISSARD tel qu'il etait AVANT l'indice D : une barre de 3 000 mm ── */
scenario('DOUISSARD version 3 000 mm (celle qui faisait sortir du reseau colis)', [
  { name: 'Couvertine', price: 12480, qty: 1, extrasCents: 1200, length: 'L=2000mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 650, lenMm: 2000, accKg: 0.20, accLenMm: 200 } },
  { name: 'Pliage L 70x50', price: 4200, qty: 1, extrasCents: 3840, length: 'L=3000mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 120, lenMm: 3000, accKg: 0.60, accLenMm: 120 } },
  { name: 'Pliage L 70x50', price: 4200, qty: 1, extrasCents: 0, length: 'L=2000mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 120, lenMm: 2000 } },
], '88400', { reseau: 'long', hors: false, gratuit: false, portHtCents: 7000 });

/* ── 3. FRUMHOLTZ MP-260920-1154-0I (reelle) ────────────────────────────── */
scenario('FRUMHOLTZ — 1 couvertine alu 1,5 RAL 9006, dev. 330, L 2000', [
  { name: 'Couvertine', price: 7128, qty: 1, length: 'L=2000mm',
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 330, lenMm: 2000 } },
], '57360', { hors: false, gratuit: false, portHtCents: 7000, reseau: 'long' });

/* ── 4. Le franco doit se declencher, et seulement au bon endroit ──────── */
scenario('4 couvertines acier 2 m, 367,20 EUR TTC — sous le franco de 400, port facture', [
  { name: 'Couvertine', price: 9180, qty: 4, length: 'L=2000mm',
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 300, lenMm: 2000 } },
], '42100', { gratuit: false, reseau: 'long', portHtCents: 8600 });

scenario('5 couvertines acier 2 m, 459 EUR TTC et 19,1 kg — franco atteint', [
  { name: 'Couvertine', price: 9180, qty: 5, length: 'L=2000mm',
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 300, lenMm: 2000 } },
], '42100', { gratuit: true, reseau: 'long', portHtCents: 0 });

scenario('Meme commande en 3 000 mm — meme circuit, tarif au poids (plus de palier)', [
  { name: 'Couvertine', price: 13770, qty: 4, length: 'L=3000mm',
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 300, lenMm: 3000 } },
], '42100', { reseau: 'long', hors: false, gratuit: false, portHtCents: 10000 });

/* Le franco est borne par le POIDS : un panier tres au-dessus du seuil en euros
   mais trop lourd ne doit PAS passer en port offert. */
scenario('8 couvertines acier 3 m, 1 100 EUR TTC mais 42 kg — franco hors de portee', [
  { name: 'Couvertine', price: 13770, qty: 8, length: 'L=3000mm',
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 300, lenMm: 3000 } },
], '42100', { gratuit: false, portHtCents: 13000 });

/* Au-dela des 4 m que le transporteur annonce tarifer au poids : on cote. */
scenario('1 piece de 4 500 mm — hors limite annoncee', [
  { name: 'Pliage', price: 20000, qty: 1, length: 'L=4500mm',
    ship: { material: 'alu', thicknessMm: 2, devMm: 300, lenMm: 4500 } },
], '42100', { surDevis: true, portHtCents: 0 });

/* ── 5. Outre-mer : jamais de franco, jamais de prix devine ────────────── */
scenario('Envoi a La Reunion (97400) au-dessus du franco', [
  { name: 'Couvertine', price: 9180, qty: 5, length: 'L=2000mm',
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 300, lenMm: 2000 } },
], '97400', { surDevis: true, gratuit: false, portHtCents: 0 });

/* ── 6. Accessoire seul : ne doit pas etre pese comme une couvertine ───── */
scenario('1 cartouche de colle MS seule', [
  { name: 'Colle MS Polymère', price: 1680, qty: 1, length: '600 ml',
    ship: { kg: 0.90, lenMm: 250 } },
], '42100', { reseau: 'petit', portHtCents: 1100 });

/* ── 7. Panier ancien, sans `ship` : doit retomber sur un defaut prudent ─ */
scenario('Panier legacy sans champ ship (localStorage d avant le 28/09)', [
  { name: 'Couvertine métallique', price: 9180, qty: 2, length: '2,5 m' },
], '42100', { lMax: 2500, reseau: 'long', hors: false });

console.log('\n' + (echecs ? '✗ ' + echecs + ' assertion(s) en echec' : '✓ toutes les assertions passent'));
process.exit(echecs ? 1 : 0);
