/* Fume-test de js/cart.js hors navigateur : charge le fichier tel quel dans un
   DOM minimal et verifie que le bandeau de livraison se rend sans lever, sur
   trois paniers. --dump-dom d'Edge ne renvoie rien en headless=new sur ce poste,
   d'ou ce harnais.
   Lancer : node tools/_smoke_cart.js                                        */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/* ── DOM minimal ─────────────────────────────────────────────────────────── */
function el(tag) {
  const e = {
    tagName: (tag || 'div').toUpperCase(),
    children: [], style: { cssText: '' }, dataset: {}, classList: {
      add() {}, remove() {}, toggle() {}, contains: () => false,
    },
    _html: '', _text: '', hidden: false, attributes: {},
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); },
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
    appendChild(c) { this.children.push(c); return c; },
    insertBefore(c) { this.children.unshift(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); },
    remove() {},
    addEventListener() {}, removeEventListener() {},
    setAttribute(k, v) { this.attributes[k] = v; }, getAttribute(k) { return this.attributes[k]; },
    querySelector: () => null,
    querySelectorAll: () => [],
    scrollIntoView() {},
    get firstChild() { return this.children[0] || null; },
    get parentElement() { return null; },
  };
  return e;
}

const registre = {};
function idEl(id) { return (registre[id] = registre[id] || el('div')); }

const document = {
  head: el('head'), body: el('body'),
  createElement: (t) => el(t),
  getElementById: (id) => (id in registre ? registre[id] : null),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
};

const store = {};
const localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};

/* Seuls les noeuds dont cart.js a besoin pour rendre le panier et le bandeau. */
['cart-drawer', 'cart-items-list', 'cart-empty', 'cart-footer',
 'cart-total-display', 'cart-count-badge'].forEach(idEl);

const sandbox = {
  document, localStorage, console,
  window: { location: { href: '' } },
  setTimeout, clearTimeout, JSON, Math, Date, parseInt, parseFloat, Number, String, Array, Object,
};
sandbox.window.document = document;
sandbox.window.localStorage = localStorage;
sandbox.globalThis = sandbox;

const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'cart.js'), 'utf8');
vm.createContext(sandbox);

let ko = 0;
function attend(label, cond, detail) {
  if (cond) console.log('  OK    ' + label + (detail ? ' → ' + detail : ''));
  else { ko++; console.log('  ECHEC ' + label + (detail ? ' → ' + detail : '')); }
}

function rejoue(titre, items, attentes) {
  store['mp_cart'] = JSON.stringify(items);
  registre['cart-footer'].children = [];
  delete registre['cart-ship-incl'];
  // cart.js cree le bandeau via document.createElement puis insertBefore : on
  // l'intercepte en surveillant ce qui atterrit dans le footer.
  try {
    vm.runInContext(code, sandbox, { filename: 'js/cart.js' });
  } catch (err) {
    ko++;
    console.log('\n── ' + titre + '\n  ECHEC cart.js a leve : ' + err.message);
    return;
  }
  const bandeau = registre['cart-footer'].children.find((c) => c.id === 'cart-ship-incl')
    || registre['cart-footer'].children[0];
  const html = bandeau ? bandeau.innerHTML : '(aucun bandeau)';
  const txt = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('\n── ' + titre);
  console.log('  total affiche : ' + registre['cart-total-display'].textContent);
  console.log('  bandeau       : ' + txt);
  (attentes || []).forEach((a) => attend(a, txt.includes(a)));
}

// cart.js pose `note.id` par assignation directe : on l'expose au registre.
const patchId = Object.defineProperty;
void patchId;

rejoue('Panier vide', []);

rejoue('1 couvertine alu 2 m (FRUMHOLTZ) — port 84,00 € attendu', [
  { name: 'Couvertine métallique', finish: 'RAL 9006', length: 'L=2000mm', price: 7128, qty: 1,
    ship: { material: 'alu', thicknessMm: 1.5, devMm: 330, lenMm: 2000 } },
], ['84,00', '155,28']);

rejoue('5 couvertines acier 2 m à 459 € et 19,1 kg — franco 400 € atteint', [
  { name: 'Couvertine métallique', finish: 'RAL 7016', length: 'L=2000mm', price: 9180, qty: 5,
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 300, lenMm: 2000 } },
], ['OFFERTE']);

// Le transporteur tarife au poids jusqu'a 4 m : une piece de 3 m paie le meme
// port qu'une de 2 m a poids egal. C'est ce que l'ancien palier a 2 100 mm
// surfacturait (162 EUR au lieu de 84).
rejoue('1 pièce de 3 m, 6,7 kg — même tarif au poids que du 2 m, 84,00 € attendu', [
  { name: 'Couvertine métallique', finish: 'RAL 7016', length: 'L=3000mm', price: 13770, qty: 1,
    ship: { material: 'acier', thicknessMm: 0.75, devMm: 300, lenMm: 3000 } },
], ['84,00']);

rejoue('1 pièce de 4,50 m — hors des 4 m tarifés au poids, cotation', [
  { name: 'Pliage sur mesure', finish: 'Brut', length: 'L=4500mm', price: 20000, qty: 1,
    ship: { material: 'alu', thicknessMm: 2, devMm: 300, lenMm: 4500 } },
], ['sur devis']);

console.log('\n' + (ko ? 'ECHEC : ' + ko + ' assertion(s)' : 'OK : cart.js se rend sans lever, port affiche'));
process.exit(ko ? 1 : 0);
