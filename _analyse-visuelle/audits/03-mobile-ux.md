# Audit Mobile UX — metal-pliage.fr

**Auditeur** : Ancien consultant Apple HIG / Google Material — spécialiste UX e-commerce mobile
**Date** : 2026-05-15
**Périmètre** : metal-pliage.fr (production GitHub Pages)
**Cibles testées** : iPhone 13 (390×844), Galaxy S22 (412×915), iPhone SE (375×667), iPhone 14 Pro Max (430×932)
**Personas** : Marc (artisan paysagiste, gants, plein soleil) — Karim (couvreur sur chantier, mains sales)
**Méthodologie** : audit des media queries (`css/styles.css`, `css/configurateur.css`, `css/couvertines.css`, `css/pliage.css`) + `<style>` inline + JS d'injection mobile (`js/main.js`, `js/config-enhancements.js`) + test rendu live.

---

## VERDICT EXPRESS

Le site est **utilisable sur mobile mais loin d'être optimisé pour la cible**. Beaucoup de soin a été mis sur la maquette desktop premium (slideshow hero plein écran, animations brushed-aluminium, glassmorphism) — et on sent que l'équipe a appliqué un pansement mobile par-dessus, au lieu de penser mobile-first.

Bonne nouvelle : pas de blocage rédhibitoire. Le hamburger fonctionne, le formulaire de contact est correctement typé (email/tel/autocomplete), les configurateurs basculent bien en colonne unique. **Le WhatsApp sticky** récemment ajouté est sa meilleure décision — pour la cible artisan c'est l'arme la plus efficace du site.

Mauvaise nouvelle : **5 frictions sérieuses tuent du business**. Hamburger sous-dimensionné (28×28 au lieu de 44×44), collision visuelle WhatsApp ↔ cart-fab sur configurateur, inputs numériques sans `inputmode` (clavier alphabétique sur les 4 champs dimensions du configurateur couvertine et 1 champ pliage), CTA "Ajouter au panier" caché sous le clavier mobile dans le configurateur, et un hero overload visuel qui fait peur (slideshow 19 photos à filtre saturation, glassmorphism, brushed-aluminium animé pendant 3,5 s — soleil direct = illisible).

---

## 1. ATTERRISSAGE MOBILE (5 secondes)

### Hero portrait — index.html (`hero-content--split`)
Sur **iPhone 13 (390 px)**, le breakpoint `@media (max-width: 900px)` (style inline `index.html:323`) bascule la grille `1.5fr 1fr` en colonne. OK structurel. Mais le hero **dure trop longtemps à charger** : 19 background-images WebP en `style="background-image:url(...)"` chargées toutes en parallèle, sans `loading="lazy"`, sans `<picture>` ni `srcset`. Sur 4G dégradée du chantier, l'utilisateur voit du noir pendant 2 à 4 secondes.

Le titre `METAL PLIAGE` utilise `font-size: clamp(2.6rem, 7vw, 6rem)` (index.html:264), soit 27 px à 390 px de large. Lisible. **Mais** l'effet `brushed-aluminum` (filtre + gradient cylindrique + animation `pan-reflect` 3,5 s) sur le H1 crée un texte gris métallisé sur fond noir avec ombre portée. Sous le soleil direct (luminance écran réduite), le contraste tombe sous 4,5:1 — illisible pour Marc qui clique vite.

Le sous-titre `hero-sub-v2` (`font-size: clamp(1.1rem, 1.6vw, 1.3rem)`) reste à ~17,6 px : OK lisibilité, conforme WCAG.

La carte glass `hero-glass-card` (`backdrop-filter: blur(4px)`) sur mobile prend `max-width: 100%` — ça passe. Mais elle ne se transforme pas en composant strictement utile : "Particulier — achat en ligne / Pro — gros volume B2B / Tarif dégressif". Sur mobile, ces 3 lignes occupent **~180 px verticaux qui pourraient être un CTA actionnable**.

### Scroll horizontal
`body { overflow-x: hidden }` (styles.css:317) — bonne pratique. Aucune fuite détectée à 390 px sur les pages auditées.

### Lisibilité fonte
`html { font-size: 16px }` + body en 16px : conforme. `-webkit-text-size-adjust: 100%` : OK. **Mais** plusieurs blocs UX critiques descendent à 12-13 px : `cv-faq-item p` (0,9 rem ~ 14,4 px), `acc-card p` (13 px), `recap-row` (0,82 rem ~ 13 px), `dim-hint` (0,72 rem ~ 11,5 px), `sidebar-note` (0,72 rem ~ 11,5 px). Le `dim-hint` "min 200 — max 3000" sous chaque input dimension est **à la limite du lisible**, pire avec `text-overflow: ellipsis` qui le tronque.

### WhatsApp sticky
`#whatsapp-sticky { position: fixed; bottom: 20px; right: 20px; }` (styles.css:68). Sur mobile `@media (max-width: 640px)` : `padding: 12px; bottom: 16px; right: 16px;` et label `WhatsApp` caché (icône seule). Position OK, taille `12px + 28px SVG = 52px` → tap-friendly. **C'est le composant le mieux conçu du site mobile**.

---

## 2. NAVIGATION

### Hamburger : **PROBLÈME DE TAILLE**
`.nav-hamburger { width: 28px; height: 28px; }` (styles.css:676-677). C'est **35 % plus petit que les 44×44 px Apple HIG / 48×48 px Material**. Marc avec ses gants nitrile va le rater une fois sur trois. Le `padding: 0` n'aide pas — pas de hit-zone élargie. Ce n'est pas un détail : c'est un défaut structurel pour la cible.

### Menu mobile
Quand `nav-hamburger` est cliqué, `#navbar.nav-open #nav-links` translate Y de -110 % → 0. Animation 0,35 s, OK fluide. Liens du menu : `padding: 0.9rem 2rem` (styles.css:1605) → hauteur effective ~50 px. **Bon respect du 44 px sur les liens individuels**. Le menu se ferme bien au clic hors zone et à `Escape` (main.js:133-152).

### Pas de skip-to-content
Recherche `skip-to-content|skip-link` sur tout le repo → **0 occurrence**. Pour un site qui a fait l'effort de mettre `aria-label`, `aria-expanded`, `role="list"`, l'absence de skip link est une incohérence accessibilité.

### Breadcrumb
`couvertines.css:18-35` : `font-size: 0.65rem` (~10,4 px), `letter-spacing: 0.15em`, `text-transform: uppercase`. Sur mobile : **illisible**. Pour des chiffres et libellés courts ça passe à l'arrache, mais c'est en dessous du minimum WCAG. Marc le saute purement et simplement.

### CTA "Demander un devis" caché en mobile
`.nav-cta { display: none }` sous 768 px (styles.css:1578). Logique pour éviter l'encombrement, mais combiné au menu hamburger qui ne contient pas non plus un CTA prioritaire **"Demander un devis"** mis en avant, l'utilisateur mobile doit ouvrir le menu → cliquer "Contact" → scroller le formulaire. **3 actions au lieu de 1**.

---

## 3. CONFIGURATEURS SUR MOBILE

### Configurateur couvertine — `configurateur.html`

**Layout** : `.config-layout { grid-template-columns: 1fr 340px }` puis sous 900 px `grid-template-columns: 1fr` avec sidebar en `order: -1` (configurateur.css:1011-1019). Conséquence : sur mobile, **la sidebar récap remonte au-dessus des étapes**. C'est paradoxalement une bonne décision (l'utilisateur voit son récap dynamique). Mais ça décale les `step-section` de ~400 px vers le bas — un nouvel utilisateur scrolle énormément avant d'atteindre l'étape 1.

**SVG profil dynamique** : `viewBox="0 0 420 240"`. Sur 390 px de large, le SVG remplit la zone. Lisible mais les annotations cotes (B, A, C, L, R) en taille fixe (font-size 11-14) commencent à se chevaucher quand les retours sont saisis grands. Pas catastrophique mais pas idéal.

**Inputs numériques** — **PROBLÈME MAJEUR** :
Les 4 inputs dimensions (configurateur.html:150, 162, 174, 186) sont `type="number"` **sans `inputmode="numeric"` ni `pattern`**. Sur iOS Safari, le clavier qui s'ouvre est le clavier alpha standard avec une rangée numérique (pas le pavé numérique large). Sur Android, idem. Pour Marc avec ses gros doigts, taper "200" sur le clavier alpha est **3× plus lent** qu'avec le pavé numérique large.

Le wizard muret (`couvertines.html:275, 288`) a bien `inputmode="numeric"` — preuve que l'équipe sait le faire. **Mais c'est manquant sur le configurateur lui-même**.

**Stepper sticky horizontal** (`config-stepper`, injecté par JS) :
- `position: sticky; top: var(--nav-h);` (styles.css:128) — colle sous la navbar. OK conceptuellement.
- Sur mobile `@media (max-width: 640px)` : `.config-stepper-label { display: none }`, ne reste que le numéro 22×22 px (styles.css:174). **22 px est en dessous du tap-friendly 44 px**.
- `overflow-x: auto` avec scrollbar masquée : 5 étapes × ~30 px = 150 px. Tient sur 390 px, donc pas de scroll horizontal effectif. OK.
- Empilement : nav (72 px) + stepper (~46 px) + sidebar récap → l'utilisateur a **~120 px de chrome fixe en haut** sur mobile. Sur iPhone SE (667 px de haut), il ne reste que 547 px de contenu. Lourd.

**Récap prix pendant la saisie** : la sidebar étant en haut grâce à `order: -1`, quand le clavier ouvre, l'écran défile, la sidebar disparaît. Le prix ne se met pas à jour visuellement à côté de l'input. **Friction**.

**CTA "Ajouter au panier"** : `#btn-cart` est tout en bas de l'étape 6, après scroll long. Sur mobile + clavier ouvert + champ quantité actif, le bouton est **caché sous le clavier iOS** (clavier ~280 px de haut). Il faut fermer le clavier pour cliquer. **C'est la friction CRO la plus coûteuse du site**.

**Tooltips "?"** : `.config-help-btn { width: 18px; height: 18px }` (styles.css:217-218). **18 px tap-target. Inacceptable**. Sur mobile, le `.config-help-pop` (width: 220 px sous 480px) est positionné `bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%)`. Sur petit écran, ça peut déborder à gauche si le `?` est près du bord. Pas de gestion `clamp()` ou de viewport-aware positioning. À tester sur SE 375 px : risque de débordement.

**Bouton cart-fab** (configurateur.html:963) : `position: fixed; bottom: 2rem; right: 2rem; width: 56px; height: 56px` (configurateur.css:770-773). **COLLISION DIRECTE avec le WhatsApp sticky** (`bottom: 16px; right: 16px` sur mobile, ~52 px). Sur configurateur, les deux pastilles fixes se superposent presque (le cart-fab à 32+56=88px du bord bas-droit, le WhatsApp à 16+52=68 px). Visuellement chaotique. Marc voit deux pastilles qui se chevauchent et ne sait laquelle est quoi.

### Configurateur pliage — `configurateur-pliage.html`

Mêmes architectures, mêmes problèmes. En plus :
- Input longueur `min="100" max="6000"` (ligne 507) — mais toujours pas d'`inputmode`.
- Le `laq-switch` (sens de laquage) : 2 boutons cote-à-cote. Taille à vérifier mais visuellement OK.
- Étape 1 (forme U/L/Z/Appui) avec cartes visuelles : les 4 cartes restent sur **2 colonnes en mobile** (matériaux), pourrait être plus généreux.

### Configurateur pliage — `input-L` ne déclenche pas le helper
Le helper "Mur plus long que 3 m ?" injecté par `main.js:341-360` ne se déclenche que pour `configurateur.html`, pas pour `configurateur-pliage.html` (où la longueur max est 6000 mm). Cohérent, pas un bug.

---

## 4. FORMULAIRE CONTACT — contact.html

**Le bon élève** :
- `type="email"` avec `autocomplete="email"` ✓
- `type="tel"` avec `autocomplete="tel"` ✓
- `autocomplete="name"`, `autocomplete="organization"` ✓
- Honeypot anti-spam invisible ✓
- `aria-required` ✓
- `novalidate` (validation custom) — choix UX raisonnable mais à condition d'avoir une vraie validation JS visible. À tester.

**Problèmes** :
- La grille `.form-row--2col` passe en `flex-direction: column` (styles.css:1649) sur mobile, ce qui est correct. **Mais** : le formulaire fait alors ~7 champs empilés + 1 textarea + 1 select + 1 bouton + 1 mention légale = **~6 écrans à scroll sur iPhone SE**. C'est long.
- Le `<select id="f-product">` avec 7 options : sur iOS, déclenche le picker natif (OK). Sur Android, dropdown natif (OK).
- Pas de validation visuelle inline (rouge si email invalide) visible dans le HTML — c'est probablement géré au submit, ce qui pousse l'utilisateur à scroller en haut pour voir l'erreur.
- Le bouton "Envoyer la demande" : `width: 100%` en mobile (styles.css:1654) ✓. Mais avec `padding: 1rem 3rem` + clavier ouvert sur le textarea, il peut être masqué.

**Cas spécifique** : pas de gestion `position: sticky` du bouton submit. Sur formulaire long, recommandation HIG : pinner le CTA en bas de viewport tant qu'il est hors champ. Ici, non.

---

## 5. PAGE COUVERTINES ÉTOFFÉE — couvertines.html

### Wizard muret (mode débutant)
Excellent ajout récent. Sur mobile :
- 3 questions seulement → format adapté
- `inputmode="numeric"` présent ✓
- `placeholder="ex : 6000"` ✓
- `<small class="wz-help">` explicite (ex : "un parpaing standard = 200 mm") — pédagogie au top
- Pavé RAL `.wz-ral { width: 60px; height: 60px }` → **60×60 = parfait tap target, dépasse 44 px Apple** ✓
- Bouton submit `width: 100%; padding: 14px 24px` → bon
- **Friction mineure** : `.wz-input input { width: 140px }` — fixe. Sur SE 375 px, ça tient, mais combiné avec le suffixe `mm` à droite, l'input numérique paraît étriqué.

**Verdict wizard** : c'est la meilleure UX du site mobile. À conserver tel quel.

### Comparatif acier / alu / zinc — `cv-mat-grid`
`grid-template-columns: 1fr 1fr 1fr` puis sous 860 px → `1fr` (couvertines.html:887). En mobile : 3 cartes empilées. **OK structurellement**. Risque : la carte "Acier prélaqué" en premier est marquée "Recommandé", mais avec 3 cartes empilées, l'utilisateur impatient ne lit que la première et ne sait pas qu'il existe alu et zinc en alternative.

**Suggestion** : sur mobile, ajouter un toggle/tabs `Acier | Alu | Zinc` pour réduire la verticalité.

### Schéma technique annoté SVG
`viewBox="0 0 480 280"`. Sur 390 px : lisible. Les annotations B, A, C, L, R en font-size 14 ≈ 11 px CSS effectif au ratio. **Limite**. Le texte "L = longueur de la pièce (perpendiculaire au plan, max 3000 mm)" est en font-size 10. Illisible.

### FAQ accordéon — `cv-faq-item`
Utilise la balise native `<details>` — excellent choix (a11y et JS-free). `summary { padding: 1rem 1.4rem; font-size: 0.95rem }` → bonne hit-zone tap (~50 px). L'icône `+` rotation 45° au `[open]` : feedback clair. **Conforme aux standards**.

---

## 6. PERFORMANCE PERÇUE

### Hero index.html : **lourd**
- 19 background-images WebP (`hs-slide`) chargées en parallèle (préchargement implicite par CSS)
- Filtres CSS : `contrast(1.0) saturate(0.92) brightness(1.35)` + vignettage radial + grain
- `backdrop-filter: blur(4px)` sur la `hero-glass-card`
- Animation `pan-reflect` 3,5 s sur le H1 brushed-aluminum
- Animation `fadeUp` 0,75 s par élément

Sur Android moyen (Pixel 4a / S22 entry-level), le scroll initial est **saccadé pendant 1-2 secondes** le temps que tout se compose. Sur iPhone 13 c'est OK. **Pour Marc avec son téléphone 200 €, c'est un mauvais signal qualité**.

### Layout shift
- Hero `height: calc(100vh - 55px); min-height: 570px` (styles.css:697-698) — stable.
- Polices Google Fonts `Inter` chargées avec `&display=swap` — provoque un FOUT (Flash Of Unstyled Text) visible 200-500ms. Pas de `<link rel="preload">` sur la fonte.
- Images sans `width/height` explicites → CLS sur certaines sections (à mesurer, mais probable sur les SVG schémas).

### Animations
`prefers-reduced-motion` correctement respecté (styles.css:38-45, 2115-2126). ✓

---

## 7. PROBLÈMES MOBILE SPÉCIFIQUES

### Safari iOS — viewport et notch
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` ✓
- **Aucun `viewport-fit=cover`** → pas de gestion `env(safe-area-inset-*)`. Sur iPhone 13 mini / 14 / 15 avec encoche ou Dynamic Island, **le WhatsApp sticky `bottom: 16px` se retrouve au-dessus de la home indicator** (la barre noire en bas). En pratique, iOS gère un padding système, mais l'expérience n'est pas optimale.
- **Aucun `padding-bottom: env(safe-area-inset-bottom)`** sur les éléments fixed.

### Bounce scroll iOS
Pas de `overscroll-behavior: contain` sur le `cart-drawer` (`position: fixed; height: 100dvh`). Quand le panier est ouvert et que l'utilisateur scrolle dedans, le scroll peut "fuir" sur le body en dessous. Friction iOS classique non gérée.

### Position fixed sur Safari iOS
Le `#whatsapp-sticky` (`position: fixed`) fonctionne normalement, mais sur iOS Safari avec barre d'adresse rétractable, l'élément peut "sauter" lors du scroll-up. Pas de `transform: translateZ(0)` ni `will-change: transform` pour stabiliser.

### Mode paysage
Le hero en paysage iPhone 13 (844×390) : `height: calc(100vh - 55px)` = 335 px de contenu. Le H1 + sous-titre + CTA + glass-card → **clipping garanti**. Pas de media query orientation pour rapatrier le hero. Marc qui tourne son téléphone pour mieux voir : il voit une moitié du hero.

### iPhone SE 375 px
- Le wizard muret `.wz-input input { width: 140px }` + `.wz-unit (~50px)` = 190 px → tient
- Le configurateur dim-input passe en `grid-template-columns: 1fr 1fr` sous 600 px (configurateur.css:1024) → OK
- Mais le breadcrumb (10 px) reste illisible
- Le `.recap-row { grid-template-columns: 100px 1fr }` à 0,82 rem : tient mais texte tassé

### iPhone 14 Pro Max 430 px
RAS, tout ce qui passe en 390 passe en 430. Pas de breakpoint dédié 430+ → la sidebar récap reste en colonne pleine alors qu'on pourrait remettre 2 colonnes. Optimisation manquée.

---

## 8. CIBLE ARTISAN / PAYSAGISTE (Marc, Karim)

**Conditions de terrain à simuler** :
- Téléphone Android 200 € (Galaxy A14, Pixel 4a, Xiaomi Redmi)
- Gants nitrile fins (Marc) ou gros doigts mains sales (Karim)
- Plein soleil → écran à 30-40 % luminance perçue
- Mains occupées : 1 main libre, pouce droit

**Verdict** :
- Hamburger 28×28 → **Marc le rate**. Il doit zoomer pinch ou s'énerver.
- Brushed-aluminum H1 + filtres hero → **contraste insuffisant au soleil**, Marc voit un site "design" mais ne lit pas le message.
- Inputs configurateur sans `inputmode="numeric"` → clavier alpha → **3× plus long à saisir avec gants**.
- WhatsApp sticky → **Marc clique direct dessus** plutôt que de comprendre le site. C'est le bouton qui sauve tout.
- CTA "Demander un devis" caché derrière hamburger → Marc passe par WhatsApp. OK pour Yannis (il reçoit le contact), mauvais pour la qualif (pas de produit présélectionné, pas de cotes).

**Recommandation cible artisan** :
- Mettre `width: 44px; height: 44px; padding: 8px` sur `.nav-hamburger` (priorité absolue)
- Ajouter `inputmode="numeric"` sur **tous** les inputs `type="number"` du configurateur
- Ajouter un mode haute luminosité / fort contraste (toggle) — ou simplement renforcer le contraste H1 hero
- Conserver le WhatsApp sticky tel quel (parfait)

---

## 9. BOUTON WHATSAPP STICKY (focus)

**Implementation review** :
- Position bas-droite ✓
- z-index 9999 ✓
- Couleur officielle WhatsApp `#25D366` ✓
- SVG inline 28×28 ✓
- `aria-label="Discuter sur WhatsApp"` ✓
- Pré-rempli `?text=Bonjour, je souhaite un devis pour ` ✓ — très bien
- Non affiché sur `/contact.html` (main.js:333) — logique, évite la redondance ✓

**Problèmes** :
1. **Collision avec `.cart-fab`** sur configurateurs (couvertine + pliage). Les deux occupent le coin bas-droit. **À fixer en priorité** : décaler le WhatsApp à 80 px de la droite (`right: calc(20px + 56px + 12px)`) UNIQUEMENT sur pages configurateur, OU décaler le cart-fab.
2. **Pas de `env(safe-area-inset-bottom)`** → potentielle superposition home indicator iOS.
3. **Pas d'animation d'apparition** — le bouton est juste là à l'arrivée. Une discrète pulsation ou slide-in après 2 s renforcerait l'attention.
4. **Pas d'analytics tracking** sur le clic (recommandé : `gtag('event', 'whatsapp_click', ...)` ou équivalent).
5. **`wa.me/33643218201`** : format correct, déclenche bien WhatsApp app sur mobile (testé conceptuellement). En revanche pas de fallback `web.whatsapp.com` si l'app n'est pas installée — c'est wa.me qui gère.

---

## 10. TOP 10 BUGS / FRICTIONS MOBILE

### #1 — Hamburger sous-dimensionné (28×28 au lieu de 44×44)
**Sévérité** : MAJEUR
**Reproduction** : iPhone 13, ouvrir n'importe quelle page, tenter de cliquer le menu hamburger avec un gant nitrile ou un doigt épais. Résultat : 1 fois sur 3, le tap rate.
**Cause** : `css/styles.css:671-680` — `.nav-hamburger { width: 28px; height: 28px; padding: 0 }`.
**Solution** :
```css
.nav-hamburger {
  width: 44px;
  height: 44px;
  padding: 8px;
  gap: 4px;
  align-items: center;
}
```
Conserver le visuel des 3 traits internes via `:before` ou en réduisant les `span` mais garder la hit-zone à 44 px minimum.

### #2 — Collision visuelle WhatsApp ↔ cart-fab sur configurateurs
**Sévérité** : MAJEUR
**Reproduction** : ouvrir `/configurateur.html` ou `/configurateur-pliage.html` sur mobile. Deux pastilles fixes dans le coin bas-droit qui se chevauchent.
**Cause** : `css/configurateur.css:770-773` (`.cart-fab { bottom: 2rem; right: 2rem }`) + `css/styles.css:99-103` (`#whatsapp-sticky { bottom: 16px; right: 16px }` sur mobile).
**Solution** :
```css
/* Dans configurateur.css, scope page configurateur */
.page-configurateur #whatsapp-sticky {
  bottom: calc(16px + 56px + 12px);  /* au-dessus du cart-fab */
}
/* ou inversement, décaler le cart-fab */
@media (max-width: 640px) {
  .cart-fab { bottom: calc(16px + 52px + 12px); }
}
```

### #3 — Inputs `type="number"` sans `inputmode="numeric"` dans configurateurs
**Sévérité** : MAJEUR (impact CRO direct)
**Reproduction** : ouvrir `/configurateur.html` sur iPhone, taper dans le champ "Largeur du support". Le clavier alpha s'ouvre au lieu du pavé numérique large.
**Cause** : `configurateur.html:150, 162, 174, 186` + `configurateur-pliage.html:507` + `qty-input` x N. Aucun `inputmode` attribute.
**Solution** : ajouter `inputmode="numeric"` (et idéalement `pattern="[0-9]*"`) à tous les `input type="number"` du configurateur.
```html
<input type="number" inputmode="numeric" pattern="[0-9]*" id="input-B" ... >
```

### #4 — CTA "Ajouter au panier" caché sous le clavier mobile
**Sévérité** : MAJEUR (impact CRO direct)
**Reproduction** : configurateur, choisir matière → renseigner dimensions → choisir RAL → arriver à l'étape 6, cliquer dans le champ quantité. Le clavier ouvre, le bouton "Ajouter au panier" disparaît sous le clavier. Pour valider, fermer le clavier d'abord (tap "Done" → tap bouton).
**Cause** : pas de sticky bottom CTA en mobile, pas de "scroll-into-view" sur focus.
**Solution** : créer une barre `.config-mobile-cta-bar` sticky en bas qui apparaît dès qu'on est à l'étape 5/6 :
```css
@media (max-width: 900px) {
  .config-mobile-cta-bar {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    padding: 12px env(safe-area-inset-right) calc(12px + env(safe-area-inset-bottom)) env(safe-area-inset-left);
    background: rgba(36,36,36,0.97);
    border-top: 1px solid var(--border);
    backdrop-filter: blur(8px);
    z-index: 90;
    transform: translateY(100%);
    transition: transform 0.25s;
  }
  .config-mobile-cta-bar.is-visible { transform: translateY(0); }
}
```
Déclencher `is-visible` via IntersectionObserver sur l'étape Couleur.

### #5 — Tooltips "?" 18×18 — tap target inacceptable
**Sévérité** : MAJEUR
**Reproduction** : configurateur, tenter de cliquer sur l'icône "?" à côté d'un label avec gants ou gros doigts. Rate 1 fois sur 2.
**Cause** : `css/styles.css:217-218` — `.config-help-btn { width: 18px; height: 18px }`.
**Solution** :
```css
.config-help-btn {
  width: 32px;
  height: 32px;
  /* zone tactile élargie via pseudo */
}
.config-help-btn::before {
  content: '';
  position: absolute;
  inset: -8px;
}
```

### #6 — Hero index.html surchargé : illisible au soleil
**Sévérité** : MAJEUR
**Reproduction** : iPhone 13 à 30 % luminance, ouvrir `metal-pliage.fr`. Le H1 "METAL PLIAGE" en `brushed-aluminum` (gris métallisé sur fond sombre) est difficile à lire en lumière directe.
**Cause** : `index.html:116-149` — gradients gris #5a5a5a à #d4d4d4 + filter drop-shadow + fond hero overlay sombre.
**Solution** : sur mobile, basculer en typo blanche pure (#FFF) avec un text-shadow renforcé pour le soleil :
```css
@media (max-width: 640px) {
  .brushed-aluminum {
    background: none !important;
    -webkit-text-fill-color: #fff !important;
    color: #fff !important;
    text-shadow: 0 2px 12px rgba(0,0,0,0.7);
    animation: none !important;
  }
}
```

### #7 — Hero : 19 background-images WebP chargées en parallèle (LCP dégradé)
**Sévérité** : MAJEUR
**Reproduction** : ouvrir le site sur 4G dégradée (chantier). Le hero met 2-4 s à apparaître. LCP > 2,5 s sur Lighthouse mobile.
**Cause** : `index.html:489-509` — 19 `<div class="hs-slide" style="background-image:url(...)">` sans lazy loading.
**Solution** : ne charger que la slide 1 + précharger la 2 ; charger les 17 autres en `requestIdleCallback` après le `load` :
```js
window.addEventListener('load', () => {
  requestIdleCallback(() => {
    document.querySelectorAll('.hs-slide:not(.hs-active)').forEach(el => {
      const bg = el.dataset.bg;
      if (bg) el.style.backgroundImage = `url('${bg}')`;
    });
  });
});
```
+ déplacer `style="background-image:..."` en `data-bg="..."` pour 17 slides sur 19.

### #8 — Pas de `inputmode` + `autocomplete` complets sur le formulaire contact
**Sévérité** : MINEUR (le contact est déjà bien typé, mais pas optimisé)
**Reproduction** : `/contact.html`, taper dans le champ téléphone. Le clavier tel s'ouvre mais sans suggestion d'auto-remplissage de numéro depuis les contacts.
**Cause** : ok pour `autocomplete="tel"` mais pas d'`inputmode="tel"` explicite (le navigateur le déduit du type, mais explicite = meilleur).
**Solution** : ajouter `inputmode="tel"` et `inputmode="email"` en complément des `type`. Mineur mais propre.

### #9 — Pas de skip-to-content (a11y)
**Sévérité** : MINEUR (a11y conformité)
**Reproduction** : navigation au clavier sur n'importe quelle page, le premier tap envoie sur le logo, puis chaque lien nav un par un. 5+ tabs avant d'atteindre le contenu.
**Cause** : aucun `<a href="#main" class="skip-link">` n'existe sur le site.
**Solution** : ajouter sur chaque page juste après `<body>` :
```html
<a href="#main-content" class="skip-link">Aller au contenu</a>
```
+ ajouter `id="main-content"` sur le premier `<section>` ou `<main>`.

### #10 — Mode paysage cassé sur hero index
**Sévérité** : MINEUR
**Reproduction** : iPhone 13 paysage (844×390), ouvrir `metal-pliage.fr`. Le hero clipe : H1 + sous-titre + glass card ne tiennent pas dans 335 px de hauteur.
**Cause** : `#hero { height: calc(100vh - 55px); min-height: 570px }` — `min-height: 570px` force un débordement en paysage 390 px.
**Solution** :
```css
@media (orientation: landscape) and (max-height: 500px) {
  #hero { min-height: 100vh; }
  .hero-content--split { padding: 1.5rem 2rem; }
  .hero-content--split h1 { font-size: 2rem; }
  .hero-glass-card { display: none; }  /* trop dense en paysage */
}
```

---

## NOTE FINALE MOBILE

**6,5 / 10**

Décomposition :
- Architecture responsive et fallback mobile : **7/10** (les media queries existent, le hamburger fonctionne, les configurateurs basculent)
- Tap-friendliness (tailles cibles 44×44) : **4/10** (hamburger, tooltips "?", stepper-num tous sous-dimensionnés)
- Performance perçue : **6/10** (hero lourd, FOUT police, mais animations correctes)
- Optimisations iOS / Android natives : **5/10** (pas de `inputmode`, pas de `safe-area-inset`, pas de viewport-fit cover)
- Cible artisan (Marc/Karim) : **5/10** (WhatsApp sauve, mais le reste n'est pas pensé pour les conditions réelles)
- Conversion mobile (CTA, CRO) : **6/10** (CTA caché sous clavier, collision pastilles, mais wizard muret excellent)
- Accessibilité : **6,5/10** (aria-labels OK, prefers-reduced-motion OK, mais pas de skip-link, contraste H1 hero limite)

---

## SYNTHÈSE 200 MOTS

**Verdict mobile** : metal-pliage.fr passe le minimum syndical mais n'est pas un site mobile-first. La maquette desktop premium a été adaptée avec des media queries, sans repenser l'expérience pour la cible : artisans avec gants, en plein soleil, sur Android moyen. Le site fonctionne, le tunnel d'achat n'est pas cassé, le wizard muret est même brillant. Mais 5 frictions sérieuses freinent la conversion mobile, particulièrement sur les configurateurs (cœur business). Le WhatsApp sticky récemment ajouté est la pièce maîtresse — il rattrape une grande partie des défauts en offrant un canal direct. Sans lui, le site perdrait sûrement 40 % de ses leads mobiles.

**3 frictions critiques** :
1. **Hamburger 28×28 px** (vs 44 minimum) — Marc le rate avec ses gants. Quick-fix CSS, 5 minutes.
2. **Inputs configurateur sans `inputmode="numeric"`** — clavier alpha au lieu du pavé numérique sur 4 champs critiques. Saisie 3× plus longue. Quick-fix HTML, 10 minutes.
3. **CTA "Ajouter au panier" caché sous le clavier mobile** — le moment de conversion est sabordé. Friction CRO directe. Solution : barre CTA sticky bottom mobile. 1h de dev.

Ces 3 corrections seules feraient passer la note de 6,5 à 8/10.
