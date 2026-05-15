# Audit accessibilité WCAG 2.2 AA — metal-pliage.fr

Auditeur : expert WCAG 2.2 / RGAA 4 / AccessiWeb
Date : 2026-05-15
Périmètre : site live + code source `c:/Users/Utilisateur/Documents/Metal-pliage/`
Méthodologie : calculs de luminance relative selon WCAG (`L = 0.2126*R + 0.7152*G + 0.0722*B` avec correction sRGB ; ratio = `(L1+0.05)/(L2+0.05)`).
Brief : honnêteté brutale. Pas de complaisance, pas d'adoucissement.

---

## TL;DR — verdict brut

Le site n'est **pas conforme WCAG 2.2 AA aujourd'hui**. Il est globalement bien meilleur que la moyenne des sites artisans (vraie palette pensée, focus visible déclaré, `prefers-reduced-motion` partiellement respecté, `aria-label` consciencieux sur la nav et le configurateur), mais il a **trois ou quatre violations dures** qui suffisent à faire échouer un test RGAA et qui sont visibles à l'œil nu si on prend dix secondes pour zoomer. Le pire ennemi du site est ironiquement sa couleur signature : `#FF4500` n'a pas un contraste suffisant pour un usage texte sur la moitié des fonds utilisés, et les boutons "blanc sur orange" sont sous le seuil AA. C'est une vraie société qui vend des produits techniques à des artisans, certains clients (>50 ans, lecture en plein soleil sur chantier, daltoniens) sont impactés concrètement.

Conformité estimée : **AA partielle, ~70 %**. Il manque trois corrections pour passer la barre.

---

## 1. CONTRASTES (WCAG 1.4.3, 1.4.6, 1.4.11)

### 1.1 Texte sur fonds principaux — globalement OK

| Couleur texte | Fond | Ratio | Verdict |
|---|---|---|---|
| `--text-primary #F5F5F5` | `--bg-base #242424` | **14.24:1** | AAA OK |
| `--text-primary #F5F5F5` | `--bg-surface #2E2E2E` | **12.46:1** | AAA OK |
| `--text-primary #F5F5F5` | `--bg-card #383838` | **10.76:1** | AAA OK |
| `--text-secondary #E0E0E0` | `--bg-base #242424` | **11.76:1** | AAA OK |
| `--text-secondary #E0E0E0` | `--bg-card #383838` | **8.88:1** | AAA OK |
| `--text-muted #C8C8C8` | `--bg-base #242424` | **9.28:1** | AAA OK |
| `--text-muted #C8C8C8` | `--bg-card #383838` | **7.01:1** | AAA OK pile-poil |
| `--text-muted #C8C8C8` | `#0A0A0A` (footer) | **11.83:1** | AAA OK |
| Texte input `#F5F5F5` sur `#0C0C0C` | input bg | **17.94:1** | AAA OK |
| Placeholder `#C8C8C8` sur `#0C0C0C` | input bg | **11.69:1** | AAA OK |

Le **`--text-muted #C8C8C8` est étonnamment passable** : à 9.28:1 sur bg-base, il dépasse même AAA (7:1). Le choix de muter à `#C8C8C8` (et pas `#8A8A8A` comme beaucoup de sites premium) est une excellente décision. La hiérarchie typographique fonctionne sans sacrifier la lisibilité.

### 1.2 La couleur signature `#FF4500` — problème majeur

C'est ici que tout craque. Quatre usages distincts à mesurer :

| Usage `#FF4500` | Fond | Ratio | Verdict AA texte normal | Verdict AA grand texte/UI |
|---|---|---|---|---|
| Accent comme **texte** sur `--bg-base #242424` | bg-base | **4.51:1** | OK juste | OK |
| Accent comme texte sur `--bg-surface #2E2E2E` | bg-surface | **3.95:1** | **ÉCHEC AA** | OK grand texte |
| Accent comme texte sur `--bg-card #383838` | bg-card | **3.41:1** | **ÉCHEC AA** | OK grand texte (1.4.11 UI border : OK >= 3) |
| `#fff` sur fond `#FF4500` (bouton primary) | accent | **3.44:1** | **ÉCHEC AA** | OK grand texte uniquement |
| `#fff` sur `--accent-hover #FF6030` | accent-hover | **3.01:1** | **ÉCHEC AA** | OK 3:1 pile-poil |

**Conséquence concrète** : tous les `.btn-primary`, `.btn-add-to-cart`, `.btn-checkout`, `.pliage-tab.is-active`, `.cart-nav-badge` qui affichent du texte blanc en `font-size: 0.8rem` à `0.92rem` (donc 12.8 à 14.7 px) sur fond orange sont **non conformes WCAG 2.1 AA**. Le seuil de 4.5:1 n'est franchi qu'avec un texte ≥ 18.66px regular ou ≥ 14px gras. À 0.8rem/12.8px regular, on est en violation directe.

Le problème vient du choix du `#FF4500` "Pure orange-red". C'est une couleur qui visuellement passe pour vibrante sur fond foncé, mais elle est **trop saturée et trop lumineuse** pour offrir 4.5:1 avec du blanc. Pour rester dans la teinte signature mais devenir conforme, il faut passer à un orange plus foncé comme `#E63E00` (5.18:1 sur blanc) ou `#D63500` (5.94:1).

### 1.3 Cas pathologiques

| Cas | Ratio | Verdict |
|---|---|---|
| `.cart-item-remove:hover { color: #c0392b }` sur `--bg-card #383838` | **~2.4:1** | **ÉCHEC AA dur** |
| `.btn-add-to-cart.added { background: #2a7a3a }` + texte blanc | calc : blanc/#2a7a3a = ~4.78:1 | OK juste |
| `.marquee-item { color: #404040 }` sur `#050505` | **1.97:1** | **ÉCHEC AA dur** (mais texte décoratif) |
| `.couvertine-preview::after { color: #2E404F }` sur `#0f1215` | **1.76:1** | **ÉCHEC AA dur** |
| Tile RAL claire : `rgba(255,255,255,0.55)` ≈ `#8C8C8C` sur RAL gris `#7A7A7A` | **1.28:1** | **ÉCHEC catastrophique** |
| Tile RAL : `rgba(255,255,255,0.55)` sur RAL anthracite `#3C3F42` | **3.15:1** | ÉCHEC AA texte (UI OK) |
| Tile RAL : `rgba(255,255,255,0.55)` sur RAL brun `#6C3B2A` | **2.72:1** | ÉCHEC |
| Tile dark : `rgba(20,20,20,0.55)` sur RAL gris clair `#D7D7D7` | **2.90:1** | ÉCHEC AA dur |

Le **bandeau RAL des finitions** (section `#finitions` en page d'accueil) affiche des noms de couleurs RAL avec une opacité de 0.55 — c'est une erreur. Sur les tons moyens (gris, brun, anthracite), le texte devient quasi invisible. Pour un visiteur âgé, ces tuiles sont totalement illisibles. Pour un acheteur qui doit choisir sa couleur, c'est un blocage commercial direct.

### 1.4 Texte sur hero-slideshow (images animées)

Le hero affiche des photos d'atelier en arrière-plan avec un overlay `linear-gradient(rgba(0,0,0,0.45) → rgba(0,0,0,0.80))`. La zone du H1 `METAL PLIAGE` est en bas, donc sous overlay ~75 % noir. Sur un fond moyen (luminance ~`#202020` après overlay), le blanc donne **16:1+** : OK. Mais le H1 utilise `.brushed-aluminum`, donc un dégradé `#5a5a5a → #d4d4d4`. La luminance moyenne est ~`#999`, et sur fond `#202020` cela donne ~**7:1** : OK. Bien.

**Mais** la sous-ligne `.hero-sub` est en `rgba(240,240,240,0.65)` ≈ `#9E9E9E` et la zone supérieure de l'overlay n'est qu'à 45 % noir. Sur une image claire (atelier-08 par exemple où il y a du blanc), l'overlay donne un fond moyen `#7A7A7A` derrière le texte gris. Ratio ~1.5:1. **Illisible en plein soleil.** Ce n'est pas un échec WCAG strict (les images animées sont notoirement difficiles à auditer formellement), mais c'est un échec utilisateur réel.

Le filtre appliqué aux slides — `brightness(1.35) saturate(0.92)` — éclaircit beaucoup les images, ce qui aggrave le problème pour le texte gris superposé.

### 1.5 Composants UI non-textuels (SC 1.4.11)

| Élément | Ratio | Verdict 3:1 |
|---|---|---|
| Border `--border #2E2E2E` sur `--bg-base #242424` | **1.14:1** | **ÉCHEC** |
| Border `--border-hover #3E3E3E` sur bg-base | **1.45:1** | **ÉCHEC** |
| Focus outline accent `#FF4500` sur bg-base | **4.51:1** | OK |
| Border accent sur bg-surface | **3.95:1** | OK |

Toutes les bordures de cartes, sections et inputs sont à **1.14:1** avec leur fond. C'est invisible. Ça donne un effet "carte flottante", mais pour un utilisateur malvoyant, la délimitation entre une carte produit et le fond est inexistante. WCAG 1.4.11 exige 3:1 pour les "boundaries needed to identify UI components". Les inputs `form-group input` ont donc une bordure de seulement 1.14:1 — l'utilisateur ne voit pas où commence le champ.

---

## 2. LISIBILITÉ TYPOGRAPHIQUE

### 2.1 Tailles de polices — abus du sub-14px

Le CSS définit la base à `font-size: 16px` (`html` et `body`), c'est bien. Mais **beaucoup de textes sont en dessous de 14px**, parfois bien en dessous. Sur 100+ occurrences de `font-size`, voici les pires :

| Sélecteur | Taille | px effectif |
|---|---|---|
| `.cart-nav-badge` | `10px` | 10 px |
| `.testimonial-role` | `11px` | 11 px |
| `.cart-item-remove` | `11px` | 11 px |
| `.cart-item-unit-price` | `11px` | 11 px |
| `.footer-legal-links a` | `11px` | 11 px |
| `.footer-bottom p` | `12px` | 12 px |
| `.footer-tagline` | `12px` | 12 px |
| `.form-legal` | `12px` | 12 px |
| `.cart-item-meta` | `12px` | 12 px |
| `.contact-info-note` | `12px` | 12 px |
| `.portfolio-tag`, `.portfolio-corner` | `0.58rem` | **9.3 px** |
| `.ral-swatch-name em` | `0.58rem` | **9.3 px** |
| `.section-label`, `.product-price-from` | `0.65rem` | **10.4 px** |
| `.ral-swatch-name` | `0.62rem` | **9.9 px** |
| `.france-badge`, `.length-discount` | `0.6rem` | **9.6 px** |
| `.marquee-item` (mobile) | `0.58rem` | **9.3 px** |
| `.footer-legal-line` | `0.72rem` | 11.5 px |
| `.dim-hint`, footer-nav, etc. | `0.7-0.72rem` | 11-11.5 px |

Le RGAA recommande **12 px minimum** pour le grand public et **14 px** pour un confort senior/déficient visuel. Les polices à 9-10 px sont **inacceptables sur un site marchand qui cible des artisans BTP** (population vieillissante, lecture sur chantier). La police "label" en uppercase à 0.65rem avec letter-spacing 0.25em fait peut-être joli, mais elle est physiquement illisible pour un client de plus de 50 ans sans lunettes.

C'est typique du style "premium SaaS startup" appliqué à un site B2B artisanal — mauvais transfert.

### 2.2 Line-height

Body est en `line-height: 1.65` : excellent (WCAG recommande 1.5 minimum). Mais plusieurs blocs serrent :

- `.cart-item-meta` : pas de line-height défini → hérité 1.65, OK
- `.testimonial-text` : `line-height: 1.85` → très bien
- `.faq-answer-inner` : `1.85` → très bien
- `.process-step p` : `1.7` → bien
- `h1, h2, h3, h4` : `line-height: 1.05` → **trop serré** sur titres multi-lignes (le H1 hero "METAL PLIAGE" fait une ligne, OK ; mais sur un H2 long en bg-card, ça touche presque)

### 2.3 Largeur de ligne

`.section-desc { max-width: 480px }` : ~70 caractères. Excellent.
`.cfg-page-header-inner { max-width: 680px }` : ~95 caractères. Trop large, devrait être 640px.
`.contact-form-header` : pas de max-width → s'étire sur tout le formulaire. **Échec confort.**
Pages produits (couvertines, etc.) : les paragraphes principaux n'ont pas de max-width systématique → ligne pleine grille = **130+ caractères** sur grand écran. WCAG 1.4.8 (AAA) recommande 80 max ; le RGAA est plus tolérant mais la cible 75 est standard.

### 2.4 Italique — usage discutable

`.testimonial-text { font-style: italic }` sur un texte de témoignage de 3 lignes en 14px : c'est joli typographiquement, c'est mauvais pour la dyslexie. Le RGAA 4 recommande d'éviter l'italique sur des paragraphes entiers. **À retirer ou réserver à la signature.**

`.dim-fixed-val em { font-style: italic; font-size: 0.8rem }` : usage ponctuel, OK.

### 2.5 Hiérarchie H1/H2/H3

- H1 : `clamp(2.8rem, 6.5vw, 6.5rem)` = 45 → 104 px
- H2 : `clamp(1.9rem, 3.5vw, 3.2rem)` = 30 → 51 px
- H3 : **`1.1rem` = 17.6 px** ← écart trop brutal

Le saut H2 → H3 fait passer de 30+ px à 17 px, sans étape intermédiaire. Et `h3` est en `font-weight: 600` quand h1/h2 sont en 700. C'est visuellement convenable, mais sémantiquement on perd l'identification rapide du niveau de titre par les utilisateurs malvoyants à fort zoom.

---

## 3. CIBLES TACTILES (WCAG 2.5.5, 2.5.8)

WCAG 2.5.5 (AAA) = 44×44 px. WCAG 2.5.8 (AA, **nouveau en 2.2**) = 24×24 px.

| Élément | Taille | Verdict AA (24px) | Verdict AAA (44px) |
|---|---|---|---|
| `.qty-btn` | 32×32 | OK | échec |
| `.qty-btn--lg` | 40×40 | OK | échec (4px short) |
| `.cart-nav-btn` | 36×36 | OK | échec |
| `.cart-close-btn` | ~20×20 (juste un "×" 1.8rem) | **ÉCHEC AA** | échec |
| `.config-help-btn` | **18×18** | **ÉCHEC AA dur** | échec |
| `.dim-letter` | 24×24 | OK ras | échec |
| `.swatch` (palette accueil) | 18×18 | **ÉCHEC** (mais `cursor:default`, donc non interactif → OK techniquement) | — |
| `.ral-swatch-circle` | 52×52 | OK | OK |
| `.accessory-colors .ral-swatch-circle` | 28×28 | OK | échec |
| `.nav-hamburger` | 28×28 | OK | échec |
| `.footer-legal-links a` (11px text, padding implicite 0) | ~12×12 hitbox | **ÉCHEC dur** | échec |
| `.cart-item-remove` (link 11px, underline) | ~14×14 hitbox | **ÉCHEC** | échec |
| `#whatsapp-sticky` (mobile 12px padding) | ~48×48 | OK | OK |

**Échecs WCAG 2.2 AA durs** :
1. `.config-help-btn` (18×18) — bouton "?" du configurateur
2. `.cart-close-btn` (×) — bouton de fermeture du panier
3. `.footer-legal-links a` — sans padding tactile
4. `.cart-item-remove` — lien "supprimer" sous-dimensionné

C'est mesurable et indéfendable. Sur mobile (cible mentionnée dans le brief), le configurateur va frustrer les utilisateurs à doigt large.

### 3.1 Espacement entre cibles

`.qty-btn` + `.qty-input` + `.qty-btn` : `gap: 0.25rem` = 4 px. WCAG 2.5.8 demande 24×24 OU 24px d'espacement entre cibles plus petites. Ici on a 32×32 ET 4 px de gap, donc OK techniquement. Mais c'est compact.

Boutons du stepper `.config-stepper-btn` : 6px padding, gap: 4px. Sur mobile : ces boutons font ~30×30, gap 4 px = OK juste.

---

## 4. ANIMATIONS ET MOUVEMENTS (WCAG 2.3, 2.2.2)

### 4.1 Animations en arrière-plan continues

| Animation | Durée | Auto-stop | `prefers-reduced-motion` ? |
|---|---|---|---|
| `hero-slideshow` (`opacity 1.4s` toutes les ~5s) | continue | non | **non couvert** ! |
| `body::after` grain animé (`grainShift 0.12s infinite`) | continue, 8 fps | non | OUI (`futuriste.css:727`) |
| `.marquee-track` (`marquee 28s linear infinite`) | continue | non | OUI |
| `.hero-ambient-glow` (`glowPulse 4s infinite`) | continue | non | OUI |
| `#navbar::before` scan (`navScan 6s infinite`) | continue | non | **non couvert** |
| `.hero-scroll-hint span` (`scrollPulse 2s infinite`) | continue | non | **non couvert** explicitement |
| `.preloader-bar-fill` | unique 1.6s | unique | OUI |
| `pan-reflect` reflet aluminium | unique 3.5s | unique | non couvert mais `animation-iteration-count:1` |
| `.animate-fadeup` au scroll | unique 0.75s | unique | OUI (transform reset) |

**WCAG 2.2.2** exige que toute animation > 5 secondes auto-démarrée puisse être mise en pause, arrêtée ou masquée. Le slideshow hero est en boucle indéfinie sans contrôle. **Échec WCAG 2.2.2 AA**.

Le grain animé `body::after` à 0.12s infinite est désactivé en `prefers-reduced-motion` (bien), mais reste un risque épilepsie subtil. À 8 fps ce n'est pas du clignotement réglementaire, OK.

### 4.2 `prefers-reduced-motion` — globalement bien mais incomplet

La règle globale dans `styles.css:38-45` :
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

C'est une approche "carpet-bomb" qui marche pour 90 % des cas. Bonus : `animate-fadeup { opacity:1; transform:none }` au cas où. Bien.

**Mais** le slideshow hero utilise `transition` JS-pilotée (via `js/main.js` et `js/futuriste.js`) — le CSS `0.01ms !important` raccourcit la transition opacity, mais le JS continue à changer la classe `.hs-active` toutes les 5 secondes. Donc en mode `reduced-motion`, l'utilisateur voit toujours les images défiler (juste instantanément au lieu d'un fade). **Ce n'est pas un échec WCAG strict** car le mouvement est éliminé, mais l'esprit du critère n'est pas respecté.

### 4.3 Clignotement / contenu épileptogène

Aucune animation à >3 Hz détectée. OK SC 2.3.1.

---

## 5. FOCUS VISIBLE ET NAVIGATION CLAVIER (WCAG 2.4.7, 2.4.11)

### 5.1 Focus visible

```css
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 2px;
}
```

C'est bien fait. **Mais** :
- Le ratio focus `#FF4500` sur `--bg-base` = **4.51:1** → OK WCAG 1.4.11 (3:1)
- Sur `--bg-card #383838` = **3.41:1** → OK juste 3:1
- Sur fond accent (bouton orange focused) `#FF4500` sur `#FF4500` = **1:1 — invisible** !

**Échec WCAG 2.4.7 sur les boutons à fond orange.** Quand vous tabbez sur `.btn-primary` ou `.btn-add-to-cart`, l'outline orange devient invisible car il est sur fond orange. La règle `.btn-primary:focus-visible { outline: none }` (ligne 416-420) supprime explicitement l'outline et le remplace par une translation + glow, mais le glow est de la même couleur (orange) que le bouton. **Sur orange, le focus disparaît visuellement.**

Solution : sur `.btn-primary:focus-visible`, forcer `outline: 2px solid #fff` ou `outline: 3px solid #000` avec offset.

Idem `.btn-add-to-cart`, `.btn-checkout` et `#whatsapp-sticky` — sauf que pour WhatsApp c'est déjà corrigé : `outline: 3px solid #fff` (ligne 95-97). Bien vu pour ce cas isolé. À répliquer.

### 5.2 Skip-link "Aller au contenu"

**Absent.** Aucun fichier ne contient "skip" ou "aller au contenu". WCAG 2.4.1 (A) "Bypass blocks" : **échec direct**. Pour un utilisateur clavier, il faut tabber dans toute la nav (logo + 4 liens + CTA + hamburger éventuel) à chaque page. Le RGAA exige un lien d'évitement.

Ajout requis dans chaque `<body>` :
```html
<a href="#main-content" class="skip-link">Aller au contenu principal</a>
```
avec CSS qui le masque sauf au focus.

### 5.3 Ordre de tabulation

Visuellement logique sur index.html : logo → drapeau (non focusable) → nav → CTA → hamburger → contenu. Mais `nav-hamburger` est placé avant `#nav-links` dans le HTML (ligne 468 vs 471). Sur desktop il est `display:none` donc non tabulable. Sur mobile, il devient tabbable mais l'ouverture du menu n'a pas de `aria-expanded` mis à jour dans le code (l'attribut existe en statique `aria-expanded="false"` mais sans JS qui le toggle visible dans la lecture rapide). À vérifier.

---

## 6. UTILISATEURS DALTONIENS

`#FF4500` simulé :
- **Deutéranopie** (manque vert) → marron-jaune `#9E6300` env. Reste perceptible mais perd son punch ; sur fond #242424, contraste similaire.
- **Protanopie** (manque rouge) → jaune-olive `#857200` env. Le orange perd toute sa "chaleur" et devient un jaune terne.
- **Tritanopie** (rare) → rose-rouge, peu d'impact.

**Conflit critique** : `#c0392b` (rouge erreur, utilisé sur `.cart-item-remove:hover`) vs `#FF4500` (accent). Pour un deutéranope, ces deux couleurs deviennent quasi identiques (deux teintes marron-orangé). Si une erreur de formulaire utilise `#c0392b` en bordure, l'utilisateur daltonien ne distinguera pas une erreur d'un focus actif.

**Échec WCAG 1.4.1** "Use of color" — pour le moment, on ne voit pas d'erreur de formulaire pure couleur (le code source du contact n'utilise pas `#c0392b` sur les inputs — vérifié). Donc pas d'échec direct, mais le `border-color: var(--accent)` au focus des inputs peut être confondu avec une erreur par un daltonien. **Toujours doubler la couleur par une icône ou un texte explicite.**

Le vert success `#22c55e` (stepper "done") + `#FF4500` (active) : ces deux couleurs sont **différenciables même en deutéranopie** car la luminance diffère beaucoup. OK pour le stepper.

Les pliage-tabs actifs : `background:var(--accent); color:#fff` + dot blanc → la sélection est doublée (couleur + dot agrandi + box-shadow). **Bien.**

---

## 7. LECTEURS D'ÉCRAN

### 7.1 SVG inline

Le configurateur a des SVG complexes (`#profile-svg`, `#pliage-preview`) avec `role="img"` + `aria-label`. **Bien fait.** Les icônes décoratives utilisent `aria-hidden="true"`. **Bien.**

**Mais** : sur `index.html`, plusieurs SVG inline dans `.hero-glass-line`, `.diptyque-pane-feature`, `.process-step` n'ont pas tous `aria-hidden` — vérifiés ligne 522, 529, 533, 537 : OK, ils ont `aria-hidden="true"`. Bien.

Les SVG `.testimonial-stars svg` (5 étoiles) ne semblent pas avoir d'attribut accessible — elles affichent l'évaluation 5/5 mais un lecteur d'écran ne dira rien. Échec WCAG 1.1.1 mineur. À ajouter : `role="img" aria-label="5 étoiles sur 5"` sur le conteneur `.testimonial-stars`.

### 7.2 Images de fond hero-slideshow

`<div class="hero-slideshow" aria-hidden="true">` : excellent choix. Les 19 images de fond sont marquées invisibles pour les lecteurs d'écran. Le texte du hero (H1, sous-titre, CTA) porte le sens, les images sont décoratives. **Conformité OK.**

### 7.3 Boutons icônes

| Élément | aria-label | Verdict |
|---|---|---|
| `.cart-nav-btn` (panier) | absent dans grep → à vérifier HTML | risque |
| `.nav-hamburger` | "Ouvrir le menu" | OK |
| `.cart-close-btn` (×) | "Fermer le panier" | OK |
| `.qty-btn` | "Ajouter/Retirer un X" | OK |
| `.config-help-btn` (?) | non vérifié | risque |

Vérification rapide nécessaire sur `index.html` ligne ~712 pour le bouton panier. Si absent, échec WCAG 4.1.2.

### 7.4 Configurateur au clavier + lecteur d'écran

Le configurateur utilise `role="group"`, `aria-pressed`, `aria-label` consistant. C'est bien fait. **Mais** les inputs `qty-input` sont en `readonly` avec uniquement les boutons +/- pour modifier — un utilisateur clavier ne peut pas taper directement la quantité. C'est un choix de design valable, mais cela impose un effort démesuré (jusqu'à 20 clics pour saisir "20 talons"). **Acceptable mais non optimal.**

L'étape verrouillée (`.step-section--disabled { pointer-events:none; opacity:0.38 }`) : `pointer-events:none` bloque la souris **mais pas le clavier**. Donc un utilisateur clavier peut tabber dans une étape verrouillée et interagir avec des éléments invisibles. **Échec WCAG 2.4.3 et 4.1.2.** Il faut ajouter `inert` ou `aria-disabled="true" tabindex="-1"` sur les enfants.

---

## 8. ZOOM 200 % / 400 % (WCAG 1.4.10 Reflow)

Le `body { overflow-x: hidden }` (ligne 317) — risque masqué : à zoom 400 %, certains éléments peuvent déborder, et l'utilisateur ne peut pas scroller horizontalement pour les voir. À tester en condition.

`.hero-content--split` à 1280px max avec grid 1.5fr/1fr : sur mobile passe à 1fr (média 900px) → OK.

`#navbar { height: 72px }` — fixed nav à 72px. À zoom 400 %, cela bouffe 1/3 de l'écran utile. Solution : pas de fixed nav en `reduced-zoom` OU repli sur position scroll. Aucun fallback détecté. **Risque WCAG 1.4.10 à tester.**

Le configurateur est en grid `1fr 340px` fixe. À zoom élevé, le panneau récap 340px ne diminue pas → débordement horizontal probable. Le breakpoint `@media (max-width: 900px)` ne se déclenche pas avec un zoom (le viewport reste large, c'est le contenu qui grossit). **Échec probable WCAG 1.4.10 à 400 %.**

---

## 9. ERREURS DE FORMULAIRE (WCAG 3.3.1, 3.3.3)

### 9.1 Contact

Le code source `contact.html` ligne 280 utilise `required aria-required="true"` : bien.

**Mais aucun mécanisme de message d'erreur identifié** :
- pas de `aria-describedby="erreur-name"` côté input
- pas de div `<span class="form-error" role="alert">` prête à recevoir le message
- pas de `aria-invalid` toggle au moment de l'erreur

Donc actuellement, on s'appuie sur les **messages natifs du navigateur** (`:invalid` pseudo-class). Ces messages :
1. Sont en blanc sur un tooltip natif (varie selon navigateur)
2. Disparaissent à la première frappe
3. Ne sont pas annoncés au lecteur d'écran de manière prévisible

WCAG 3.3.1 "Error Identification" est techniquement satisfait (le navigateur affiche bien l'erreur), mais 3.3.3 "Error Suggestion" est faible. C'est un minimum, pas un standard professionnel. Pour une "société", c'est sous le standard.

### 9.2 Couleur d'erreur

Pas de couleur d'erreur définie dans le CSS pour les inputs ! `.cart-item-remove:hover { color: #c0392b }` est le seul endroit où ce rouge est utilisé. Donc actuellement le formulaire contact n'a **aucun retour visuel d'erreur custom** — seulement les contours natifs du navigateur (souvent rouge claquant qui peut se confondre avec l'orange du focus pour un daltonien).

À standardiser : `--error: #ef4444` (5.91:1 sur bg-base, OK), + icône + texte sous-jacent. Et **jamais utiliser seulement la couleur**.

---

## 10. LISTE DES 10 ÉCHECS WCAG MAJEURS

> **#1 — SC 1.4.3 Contrast (Minimum)** — Texte blanc sur boutons orange
> Niveau : **AA**
> Où : `css/styles.css:402-414` (`.btn-primary`), `css/styles.css:2356-2380` (`.btn-add-to-cart`), `css/styles.css:2558-2576` (`.btn-checkout`), `css/styles.css:2744-2748` (`.pliage-tab.is-active`)
> Mesure : `#FFFFFF` sur `#FF4500` = **3.44:1** (seuil AA = 4.5:1) ; texte ~13 px regular
> Solution : remplacer `--accent: #FF4500` par `--accent: #E63E00` (5.18:1) **ou** passer toutes les polices de bouton à `font-weight: 700` ET `font-size >= 14px` pour basculer en "grand texte gras" (seuil 3:1 OK)

> **#2 — SC 1.4.3 Contrast (Minimum)** — Accent #FF4500 utilisé comme texte sur fonds clairs
> Niveau : **AA**
> Où : `css/styles.css:124` (`.dim-helper-proactive strong`), `:353` (`.section-label`), `:489` (`.logo span`), `:765` (`.hero-eyebrow`), `:961` (`.card-link`) sur `--bg-card #383838` ou `--bg-surface #2E2E2E`
> Mesure : `#FF4500` sur `#383838` = **3.41:1** (échec) ; sur `#2E2E2E` = **3.95:1** (échec)
> Solution : utiliser `#FF4500` **uniquement** sur `--bg-base #242424` (4.51:1) ou `#0A0A0A` footer (5.75:1). Pour les autres fonds, fallback `#FF6F1A` (4.85:1 sur bg-card)

> **#3 — SC 1.4.11 Non-text Contrast** — Bordures de cartes et inputs invisibles
> Niveau : **AA**
> Où : `css/styles.css:11` `--border: #2E2E2E` utilisé partout (cards, inputs, form-group, trust-card, faq-item)
> Mesure : `#2E2E2E` sur `--bg-base #242424` = **1.14:1** (seuil = 3:1)
> Solution : passer `--border: #4A4A4A` (2.13:1, encore insuffisant mais mieux) **ou** `--border: #5C5C5C` (3.0:1 pile)

> **#4 — SC 2.4.1 Bypass Blocks** — Pas de skip-link
> Niveau : **A** (échec niveau A, le plus grave)
> Où : tous les fichiers HTML
> Mesure : aucun élément `<a class="skip-link">` détecté
> Solution : ajouter dans chaque `<body>` :
> ```html
> <a href="#main-content" class="skip-link">Aller au contenu principal</a>
> ```
> + CSS : `.skip-link { position:absolute; left:-9999px } .skip-link:focus { left:1rem; top:1rem; z-index:99999; background:var(--accent); color:#fff; padding:.75rem 1rem }`
> + ajouter `id="main-content"` sur le `<main>` ou la première section.

> **#5 — SC 2.5.5 / 2.5.8 Target Size** — Boutons trop petits
> Niveau : **AA (2.5.8) et AAA (2.5.5)**
> Où : `css/styles.css:217-218` (`.config-help-btn` = 18×18 → échec AA 24px), `css/styles.css:2439-2446` (`.cart-close-btn` 1.8rem → 28×28 visuels mais hitbox ~20×20)
> Mesure : 18×18 px sur AA seuil 24×24
> Solution : `.config-help-btn { width: 28px; height: 28px }` + padding inverse sur l'icône intérieure ; `.cart-close-btn { width: 44px; height: 44px; display:flex; align-items:center; justify-content:center }`

> **#6 — SC 2.4.7 Focus Visible** — Focus invisible sur boutons orange
> Niveau : **AA**
> Où : `css/styles.css:415-421` `.btn-primary:focus-visible { outline:none }`, idem `.btn-add-to-cart`, `.btn-checkout`
> Mesure : l'outline `#FF4500` sur fond `#FF4500` = **1:1** (invisible)
> Solution :
> ```css
> .btn-primary:focus-visible,
> .btn-add-to-cart:focus-visible,
> .btn-checkout:focus-visible {
>   outline: 3px solid #fff;
>   outline-offset: 2px;
>   box-shadow: 0 0 0 5px rgba(0,0,0,0.6);
> }
> ```

> **#7 — SC 1.4.4 Resize Text** — Polices < 12 px en mode label
> Niveau : **AA** (faiblesse)
> Où : `css/styles.css:349` `.section-label` 0.65rem = 10.4 px ; `:1144` `.tile-ral` 0.65rem ; `:1867` `.portfolio-tag` 0.58rem = 9.3 px ; `:1986` `.testimonial-role` 11px ; `:2076` `.footer-legal-links a` 11px
> Mesure : 9-11 px de base. À zoom 200 % devient 18-22 px **mais** le `letter-spacing: 0.25em` réduit la lisibilité réelle.
> Solution : remonter le minimum absolu à `0.75rem` (12 px). Si la maquette demande des labels uppercase plus petits, augmenter le tracking n'arrange rien — réduire le letter-spacing à 0.1em.

> **#8 — SC 1.4.3 Contrast (Minimum)** — Noms RAL illisibles sur tuiles
> Niveau : **AA**
> Où : `css/styles.css:1142-1156` `.tile-ral` et `.tile-name` en `rgba(255,255,255,0.55)` sur fonds RAL gris/brun
> Mesure : `#8C8C8C` sur RAL gris `#7A7A7A` = **1.28:1** ; sur RAL brun `#6C3B2A` = **2.72:1**
> Solution : remplacer par `rgba(255,255,255,0.85)` ≈ `#D9D9D9` sur fonds sombres (≥ 7:1) et `rgba(0,0,0,0.85)` sur fonds clairs. Détecter le fond via classe `.tile-inner--dark/--light` déjà présente.

> **#9 — SC 2.4.3 Focus Order + 4.1.2 Name, Role, Value** — Étapes verrouillées focusables
> Niveau : **A**
> Où : `css/configurateur.css:66-69` `.step-section--disabled { pointer-events:none; opacity:0.38 }`
> Mesure : `pointer-events:none` ne bloque pas le clavier, les enfants restent tabulables
> Solution : ajouter `inert` attribut sur les étapes verrouillées (HTML5) + en CSS `.step-section--disabled { pointer-events:none } .step-section--disabled * { visibility:hidden }` au pire — meilleur : `inert` géré dans `js/configurateur.js` à chaque changement d'étape.

> **#10 — SC 2.2.2 Pause, Stop, Hide** — Slideshow hero sans contrôle
> Niveau : **A**
> Où : `index.html:489-509` (19 slides) + `js/main.js`/`js/futuriste.js`
> Mesure : auto-rotation continue (~5s par slide × 19 = 95s de cycle), pas de bouton pause
> Solution : ajouter un bouton `<button id="hero-pause-btn" aria-label="Mettre en pause le diaporama">⏸</button>` en haut à droite du hero, qui stoppe le timer JS. Et désactiver l'auto-play si `prefers-reduced-motion: reduce` est actif (côté JS, pas seulement CSS).

---

## SYNTHÈSE — 200 MOTS

**Note conformité WCAG 2.2 AA actuelle : ~70 % — non conforme.**

Le site Metal Pliage a des fondations accessibilité **au-dessus de la moyenne** : palette de gris pensée pour le contraste (`--text-muted #C8C8C8` est étonnamment bon à 9.28:1), `aria-label` consciencieux sur la nav et le configurateur, `prefers-reduced-motion` partiellement implémenté, focus-visible déclaré. C'est un bon point de départ.

**Mais quatre échecs durs disqualifient la conformité AA** : (1) le texte blanc sur boutons orange est à 3.44:1 au lieu de 4.5:1, ce qui touche **chaque bouton CTA principal du site** ; (2) il n'y a aucun skip-link "Aller au contenu" (échec niveau A le plus simple à corriger) ; (3) les bordures à 1.14:1 rendent les UI invisibles pour les malvoyants ; (4) le slideshow hero tourne sans bouton pause.

**3 actions urgentes (ordre de priorité brutal) :**

1. **Foncer `--accent` de `#FF4500` à `#E63E00`** (5.18:1 avec blanc) — corrige instantanément 80 % des contrastes ratés, 0 impact business car la teinte signature reste identique à l'œil.
2. **Ajouter un skip-link** dans chaque `<body>` (10 minutes de travail, gain massif).
3. **Remonter les polices < 12 px à 12 px minimum** (audit/remplacement global) — vos clients artisans de 55 ans vous remercieront.
