# Audit Visuel — Metal Pliage
## Regard d'un Senior UI/UX Designer (refs : Pentagram, Studio Dumbar, Wieden+Kennedy)

**Auditeur** : Designer senior, agence luxe
**Date** : 2026-05-15
**Périmètre** : metal-pliage.fr (index, couvertines, configurateur, pliage, contact)
**Mandat** : honnêteté brutale, zéro complaisance.

---

## Avertissement liminaire au client

Le site est **techniquement propre et au-dessus de la moyenne du secteur métallurgie/BTP** (qui est, soyons clairs, le pire secteur du web français en 2026). Mais le mandat est de comparer aux standards du design web premium 2024-2026, pas aux concurrents. Et à cette aune, Metal Pliage est aujourd'hui un site **"semi-pro qui essaie de paraître premium en empilant des effets"**, pas un site premium qui n'aurait pas besoin de les empiler. Tout ce qui suit part de là.

---

## 1. PREMIÈRE IMPRESSION (5 secondes au-dessus de la flottaison)

**Ce que le site dégage** : "Startup tech 2018 qui a découvert le dark mode + agence de com qui a vu un Awwwards en 2022".

Décomposition de ce que voit l'œil dans les 5 premières secondes (desktop, 1440px) :
1. Un slideshow plein écran d'images traitées (filter `contrast(1.0) saturate(0.92) brightness(1.35)`, `index.html:94-97`) → effet "vue par drone qui survole un atelier IA".
2. Un titre `METAL PLIAGE` avec **effet aluminium brossé animé sur 3,5s** (lignes 116-160 du `<style>` inline) — gimmick coûteux à l'attention.
3. Un sous-titre fade-up.
4. Un bouton orange "Accéder aux produits" pointant vers la section suivante (#diptyque).
5. Une carte glassmorphism "Sur mesure · sans engagement" à droite, type fintech.
6. Une barre de progression de scroll orange en haut.
7. Un grain animé global (`futuriste.css:11-22`) qui clignote à ~8 fps sur tout l'écran.
8. Un bouton WhatsApp vert fluo en bas à droite.

**Verdict 5 secondes** : trop d'éléments simultanés réclament l'attention. Aucun n'est dominant. C'est exactement ce que **Pentagram, Bureau Mirko Borsche ou Studio Dumbar refusent par principe** : ils choisissent UN geste fort, pas dix gestes moyens.

**Référence absente** : le site ne ressemble pas à un atelier. Il ressemble à un site "qui veut se vendre comme un atelier". Comparer avec **Hutchison Locke** (ferronnerie UK), **Strang Inc** (architecte métal US), **Atelier de Ricou** (FR) : ces sites n'ont **aucun** des effets ci-dessus. Ils ont des photos, de la typo, du blanc, point.

**Note esthétique globale : 5,5/10**.

Justification :
- +1 pour la palette dark cohérente
- +1 pour la grille (quand elle est respectée)
- +1 pour le slideshow non-stéréotypé
- +0,5 pour l'effort sur la microtypo (clamp, letter-spacing)
- +1 pour les SVG inline propres
- +1 pour le respect de `prefers-reduced-motion`

Retraits :
- -1 pour le grain animé (gadget)
- -1 pour l'effet aluminium brossé sur le H1 (kitsch)
- -1 pour l'incohérence du système (cf. section 2)
- -1 pour les photos d'atelier IA reconnaissables
- -0,5 pour le WhatsApp vert qui jure

**Comment gagner 3 points (passer à 8,5/10)** :
1. **Supprimer le grain animé** (`futuriste.css:11-36`) et **désactiver l'effet brushed-aluminum** sur le H1. Remplacer par un H1 typo blanche pure, plus gros, plus aéré.
2. **Refondre les photos hero** avec 4-5 vraies images de chantier (pas IA), uniformisées en colorimétrie. Supprimer le filter CSS hack.
3. **Trancher entre 2 typographies maximum** (titre + corps), avec une vraie échelle modulaire au lieu des 35+ tailles ad-hoc actuelles.

---

## 2. SYSTÈME DE DESIGN

### 2.1 Palette de couleurs

**Variables déclarées** (`styles.css:7-21`) :
- `--bg-base #242424` (gris foncé, pas noir)
- `--bg-surface #2E2E2E`
- `--bg-card #383838`
- `--accent #FF4500` (orange vif)
- `--text-primary #F5F5F5`

**Verdict** : moyenne.

- Le choix `#242424` au lieu d'un vrai noir `#0A0A0A` ou pur `#000` est **mou**. C'est ni assidu (le vrai noir industriel), ni élégant (le anthracite profond façon Bottega). Ça rappelle Material Design 2018.
- Le `#FF4500` (orangered HTML) est **datée**. C'est l'orange Web 1.0, celui de Reddit et d'Hacker News. Un atelier métal ferait penser à **un orange acier corten profond `#B85838`** (déjà présent dans `index.html:174` sous `.fx-corten` mais inutilisé !), ou un **orange brûlé `#D2691E`**.
- Surtout, l'orange est **systématiquement saturé à 100%**, sans jamais le désaturer pour les états secondaires. Résultat : il crie partout. On a 17 occurrences orange visibles sur la home (titres, picto, swatchs, badges, traits, soulignages, dots).
- Le `--accent-hover #FF6030` est plus clair que le base — c'est l'inverse de la convention industrie premium (un hover doit assombrir, pas éclaircir, sauf cas explicite). **Mauvais réflexe**.

**Aberration palette** : 4 noirs/gris différents pour les fonds (`#242424`, `#2E2E2E`, `#383838`, `#050505` apparaît dans futuriste.css:46, plus le `#0f0f0f` hard-codé dans `index.html:339` pour `.diptyque-section`). C'est **cinq nuances de quasi-noir** sans logique sémantique claire.

### 2.2 Typographie

**Inter, 6 graisses** (300-800). Verdict : **moyen-bas**.

- Inter est devenu **le Helvetica de la décennie 2020** : 60% des sites SaaS l'utilisent. C'est neutre, fonctionnel, mais **zéro identité**. Un atelier d'art ne devrait pas avoir la même typo qu'un dashboard Stripe.
- Pas de typo titrage différenciée. Studio Dumbar, Pentagram, ou même un atelier comme **Bureau Borsche** utilisent toujours 2 familles minimum, dont au moins une **avec caractère** (serif éditoriale, grotesk industrielle type GT America/Söhne, ou display).
- **6 graisses chargées (300→800), mais seules 4 sont vraiment utilisées** (400, 500, 600, 700). C'est ~80 Ko de webfont gaspillé.
- **Hiérarchie typo incohérente** : le H1 home fait `clamp(2.8rem, 6.5vw, 6.5rem)` (`styles.css:338`) en `font-weight: 700`, MAIS le H1 de `couvertines.html:88-96` fait `clamp(1.5rem, 3vw, 2.4rem)` en `font-weight: 300` et `text-transform: none`. **Deux H1 conceptuellement opposés sur le même site**. C'est une faute de système.
- Pareil pour `pliage.html:88-96` : `font-weight: 300`, là où la home fait 700. Aucune règle.

**Compteur de font-sizes** sur `styles.css` (extrait grep) : font-size apparaît **80+ fois**, avec des valeurs en `rem` (0.58, 0.6, 0.62, 0.65, 0.68, 0.7, 0.72, 0.75, 0.78, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.95, 1, 1.05, 1.1, 1.2, 1.25, 1.4, 1.7, 1.8, 2.2, 2.5, 4, 4.5, 6.5...) **ET en px** (11, 12, 13, 14, 15, 16). **C'est un patchwork, pas un système.**

Un design system propre exposerait une **échelle modulaire à 8-10 paliers**, jamais 30. Référence : Tailwind type scale, ou ratio 1,25 (major third) qui donne 12 → 14 → 16 → 20 → 24 → 32 → 40 → 56 → 80.

### 2.3 Espacements

**Mauvais.**

- Mélange `rem`, `px`, `clamp()`, et constantes magiques (1.6rem, 1.8rem, 1.2rem, 2.4rem, 2.5rem, 2.6rem, 2.8rem, 3rem, 3.5rem...).
- Pas d'échelle 4 / 8 / 16 / 24 / 32 / 48 / 64 (la base de TOUS les design systems modernes : 8-point grid).
- `couvertines.html` ligne 117 : `border-radius: 14px !important` — pourquoi 14, alors que la home utilise 12, le configurateur 6, les boutons primaires 4, et les radius des cercles 50% ? **Cinq valeurs de radius pour un produit qui devrait en avoir DEUX maximum** (zéro radius "industriel", ou un radius unique).
- Le fichier `couvertines.html` contient **34 `!important`** dans son `<style>` inline (`couvertines.html:117-156`). C'est un drapeau rouge énorme : ça signifie que le designer écrase son propre design system parce qu'il ne le maîtrise plus. Dette de design.

### 2.4 Composants — boutons

**Patchwork sévère.** Audit des "boutons orange primaires" :

| Composant | Source | font-size | padding | radius | letter-spacing |
|---|---|---|---|---|---|
| `.btn-primary` global | `styles.css:402-414` | 0.8rem | 1rem 3rem | (aucun) | 0.18em |
| `.btn-hero-primary` | (variant non lue mais distincte) | ~1rem | ~1.2rem 2.5rem | 4px env. | 0.18em |
| `.diptyque-pane-cta` | `index.html:421-435` | 0.82rem | 1.05rem 2rem | 4px | 0.18em |
| `.couvertine-featured-ctas .btn-primary` | `styles.css:2928-2942` | 0.85rem | 0.8rem 1.4rem | **6px** | 0.05em |
| `.muret-wizard-submit` | `couvertines.html:455-460` | 0.95rem (!important) | 14px 24px | hérité | hérité |

**5 "boutons primaires orange" avec 5 signatures différentes.** Aucun client ne peut distinguer "ce bouton est un CTA principal" d'"un secondaire" parce qu'ils sont tous styles différemment. **C'est une faute fondamentale.**

### 2.5 Iconographie

SVG inline, stroke 2 à 2.5 selon les cas, line-cap round, line-join round. Globalement propre, mais :

- **Inconsistance** : certains check `polyline 20 6 / 9 17 / 4 12` sont en stroke 2, d'autres en 2.5, d'autres avec `stroke-linejoin="round"` parfois omis. Sur `couvertines.html:548-580` j'ai dénombré 4 versions du même picto check.
- Tailles : 14, 14, 14, 16, 18, 22 → **aucune raison technique** à ces variations.
- **Aucune librairie unifiée** (Lucide, Phosphor, Feather, Heroicons). Tout est dessiné à la main.

### 2.6 Animations

**C'est ici que ça part en vrille.**

Inventaire (non exhaustif) :
1. Slideshow auto 5s (`index.html:731-741`)
2. `pan-reflect` 3.5s sur le H1 (aluminium brossé)
3. `pan-reflect-sub` 3.5s sur sous-titre
4. `fadeUp` au scroll, sur quasi tous les blocs
5. `grainShift` 0.12s steps infini (grain animé global)
6. `marquee` 28s linear infini (`futuriste.css:208`)
7. `shimmer` 3s linear infini (`futuriste.css:277`) — gradient orange qui glisse en boucle
8. `helpPopIn`, `ctaNoteFadeIn`, `plCouvDrop`, `plWaterDrip`, `plCheckPop`, `plLabelIn`, `plAppear`, `preloaderBar`
9. Hovers translateY(-1px), translateX(4px), scale(1.03), scale(1.2)
10. Box-shadow glow orange au hover de bouton
11. Backdrop-filter blur sur navbar, glass-card, stepper

**Critique** : **trop**. Une fois la page chargée, il y a en permanence :
- Le grain qui clignote (8 fps)
- Le marquee qui défile
- Le shimmer du gradient orange en boucle
- Le slideshow qui change toutes les 5s

→ **L'œil n'a aucun moment de calme**. C'est l'antithèse du luxe. Le luxe = silence visuel. Aesop, Bottega Veneta, Hermès en ligne : zéro animation hors interaction.

---

## 3. HIÉRARCHIE VISUELLE

### Home
- **Focus visuel intentionné** : H1 "METAL PLIAGE" + CTA "Accéder aux produits".
- **Focus réel** : disputé entre le H1 brossé qui shimmer, le slideshow qui change, la carte glass à droite, le scroll-hint en bas, et le WhatsApp vert.
- Le **CTA primaire principal est faible** : libellé générique ("Accéder aux produits") qui ne vend rien. Standard premium = verbe d'action + bénéfice ("Configurer ma couvertine en 2 min").
- **Section diptyque 50/50** : très bien conceptuellement (deux couloirs clairs Couvertine / Pliage), mais l'exécution gâche le geste — les deux pavés ont des photos hero d'atelier identiques en teinte, donc l'œil ne distingue pas les deux univers. Le geste "diptyque" suppose **contraste**. Là, c'est un duo de jumeaux.

### Couvertines
- Header en `font-weight: 300, text-transform: none` qui rompt avec la navbar et le footer en uppercase 600/700. **Schizophrénie typographique**.
- Module "Couvertine featured" : grille 1fr/1fr, image à gauche, body à droite. Standard correct. Mais le `border-radius: 14px !important` (`couvertines.html:117`) flotte au milieu de la page, sans contexte (rien autour n'a de coins arrondis comparable).
- Wizard muret (3 questions) : intéressant, mais la section ressemble à un formulaire SaaS importé, pas à un produit artisanal.

### Configurateur
- Header `cfg-page-header` avec badge "SUR MESURE" + H1 uppercase + paragraphe. Très "page produit SaaS B2B générique". OK fonctionnellement, **zéro émotion**.
- Stepper sticky (`styles.css:127-210`) : bien implémenté techniquement. Mais 5+ étapes avec pastilles rondes orange + checks verts → **mix de codes couleur** (orange = focus, vert = done). Pas réfléchi en système.
- Cards matière (acier/alu) : tout petits SVG à 36×36 dans des cards larges. **Sous-dimensionné** → l'œil les survole sans accrocher. Un atelier digne de ce nom montrerait une **vraie photo de chant de tôle** à côté du nom matière.

### Pliage
- Header identique au couvertines (font 300, lowercase). Idem critique.
- Cartes "5 formes" en grille auto-fit minmax(280px). Standard.
- Tabs acier/alu/inox : voir doublon CSS (`styles.css:2717` + `styles.css:2788`) — la même classe `.pliage-tab` est redéfinie deux fois avec des propriétés contradictoires. **Bug de design system.**

### Contact
- Choix entre 2 cards (devis sur plan / commande directe). Bien.
- Mais le `.contact-choice-card--accent` (`contact.html:80-86`) utilise un `linear-gradient(135deg, rgba(255,69,0,0.07), transparent)` — l'opacité 0,07 est tellement faible que le gradient est invisible sur dark background. **Effort inutile** ou bug visuel.

### Scroll → mène à quoi ?
- Home : hero → diptyque → process 4 étapes → fabrication → footer. **C'est plat**. Aucun "wow moment" après le hero. Pas de scroll-jacking justifié, pas de transition narrative, pas de chiffre clé qui éclate, pas de témoignage architecte avec photo.
- **Sites premium 2024-2026 alternent les hauteurs, les fonds, les zooms** (cf. Heydey, Studio Lugen, l'agence Cymbal, ou même Apple). Ici, c'est 4 sections de hauteur ~équivalente avec le même fond `#242424`.

### Fréquence wow / plat
- Wow moments : 1 (hero slideshow + brushed-aluminum) → et il est trop chargé.
- Plats : 5+ sections (process, fabrication, footer).
- Ratio dramatique : **1/5**. Référence premium : 1/2.

---

## 4. PHOTOGRAPHIE & IMAGERIE

**Le maillon le plus faible du site, et de loin.**

### Slideshow hero
19 slides WebP préfixés `metal-pliage-atelier-*.webp` et `metal-pliage-hero-*.webp`. À l'œil :
- **Origine IA évidente** sur plusieurs : géométries de presses-plieuses qui n'existent pas en vrai, opérateurs aux mains à 6 doigts ou bras en position impossible, étincelles "physiquement fausses" (trop régulières), reflets de tôle non-causaux.
- Le **filter CSS** `contrast(1.0) saturate(0.92) brightness(1.35)` (`index.html:94-97`) est appliqué **précisément pour cacher l'aspect IA** (citation dans le commentaire CSS lui-même ligne 92 : *"réduit le rendu IA générique"*). C'est l'aveu officiel. **Le client tente de camoufler la nature artificielle de ses photos.**
- Le vignettage et le grain ajoutés (lignes 100-110) renforcent l'effet "photo de stock retouchée".

**Effet sur la cible architecte (Sophie)** : un architecte voit en 2 secondes que ce sont des images IA. Et un architecte qui voit des images IA sur un site d'artisan métal pense **"si ils trichent sur les photos, ils tricheront sur les côtes"**. Conversion B2B haute valeur : **détruite**.

**Effet sur le particulier (Pierre)** : il ne remarque pas que c'est IA, mais il sent que "c'est trop beau pour être vrai". Légère méfiance. Conversion B2C : abaissée de 10-15%.

### Photo couvertine `assets/couvertine-photo/couvertine plate.jpg`
La seule photo "réelle" probable du site. Et l'URL contient un **espace** (`couvertine plate.jpg`). C'est sale et c'est un risque tooling (encodage, scripts). **À renommer en `couvertine-plate.jpg`** immédiatement.

### Photos atelier qui dégradent l'image de marque
Toutes les images IA d'atelier sont problématiques. La photo `assets/images/fabrication.jpg` (`index.html:648`) appelée pour la section "Notre expertise" : si elle existe et est en `.jpg`, elle n'est pas optimisée (le reste du site est en WebP). Incohérence pipeline.

### Manque de photos de chantier réelles
**Oui, ça se voit.** Énormément. Il n'y a **aucune photo de chantier réel** :
- pas de couvertine posée sur un vrai muret de maison
- pas de pliage installé sur un bandeau de toiture
- pas de close-up sur un pli, sur une soudure, sur une finition RAL
- pas de photo de l'équipe (alors qu'il y a un patron, Yannis, et un atelier réel à Saint-Étienne)

→ Pour un client architecte ou particulier exigeant, **ce site ne prouve rien**. Tout est revendiqué, rien n'est documenté.

---

## 5. COHÉRENCE AVEC LE SECTEUR

**Positionnement revendiqué** : sur-mesure premium pour particuliers + pros.

**Réalité perçue** : *"site e-commerce métal moderne, avec configurateur sympa, mais sans aura artisanale"*.

### Test "Sophie l'architecte reviendrait-elle ?"

Sophie cherche un fournisseur pour habiller un bandeau d'acrotère sur un chantier R+2 à Lyon. Elle veut :
1. Voir des **références** (chantiers déjà livrés, idéalement bâtiments connus).
2. Une **fiche technique complète** (tolérance ±, type d'alliage, certificat matière, fiche RAL avec test brouillard salin).
3. Un **interlocuteur identifié** (nom + photo + téléphone direct).
4. Un **délai garanti contractuellement**.

Sur metal-pliage.fr :
1. **Aucune référence chantier.** Page galerie inexistante. → Sophie quitte.
2. Fiches techniques partielles, dispersées dans le configurateur.
3. Pas de nom d'interlocuteur. Mail `contact@` générique. Pas de photo.
4. "Sous 10 jours ouvrés" affiché, sans engagement contractuel visible.

**Verdict Sophie** : **non, elle ne revient pas**. Elle va sur le site de **Joris Ide**, **Dani Alu**, ou **Roma Couvertines**, qui ont des fiches techniques PDF en téléchargement.

### Test "Pierre le particulier rénove"

Pierre veut couvrir un muret de jardin de 12 m. Il veut :
1. Voir à quoi **ressemble** le produit posé.
2. Comprendre **quels accessoires** sont nécessaires (éclisses, talons).
3. Avoir un **prix** clair.
4. **Acheter** sans appeler.

Sur metal-pliage.fr :
1. **Une seule photo produit posée**. Insuffisant.
2. Le wizard 3 questions sur la home couvertines explique éclisses/talons → **bon point**.
3. Prix immédiat via configurateur → **bon point**.
4. Stripe checkout → **bon point**.

**Verdict Pierre** : **OUI, il peut convertir**, à condition d'avoir confiance. Et la confiance vient des photos. **C'est le point bloquant.**

### Conclusion section 5
Le site **trahit son positionnement premium**. Il a la mécanique e-commerce d'un acteur sérieux mais l'apparence d'un site générique IA-friendly. Les vrais sites d'artisans premium (cf. **Atelier Bouvier**, **Forges de Strasbourg**, **Métal Déployé Français**) misent sur **photo + signature humaine + références**, pas sur les effets brossé-aluminium en CSS.

---

## 6. DÉTAILS QUI SAUTENT AUX YEUX D'UN DESIGNER

(Ces points sont invisibles au client mais sabotent la crédibilité auprès d'un pair pro.)

1. **Letter-spacing en uppercase trop violent** : `0.32em` sur `.hero-glass-eyebrow` (index.html:307), `0.34em` sur `.cv-header-eyebrow`, `0.35em` sur `.pliage-eyebrow` (`pliage.html:83`), `0.28em` sur le marquee, `0.25em` sur `.section-label`. **Cinq valeurs pour une fonction unique** (eyebrow uppercase). Un designer pro aurait une variable `--tracking-eyebrow: 0.22em` et basta.

2. **`text-transform: uppercase` sur des paragraphes français contenant des accents** (cas du marquee, des labels) : sans `font-feature-settings: "case"` ou la version `Inter Display`, les accents en majuscule sont mal positionnés sur Inter (À, É). Effet "pas pro".

3. **Le H1 brushed-aluminum** (`index.html:514`) : l'animation `pan-reflect` dure 3,5s **mais commence avec un délai de fadeUp** (`--delay: 0.15s`). Donc pendant les 150 premières millisecondes, le visiteur voit un H1 **invisible**. Sur connexion lente, c'est pire. Mauvais pour LCP et pour l'impression de robustesse.

4. **Mélange `rem` / `px`** : `font-size: 16px` (`styles.css:313`) sur le body, puis tout le reste en `rem`. Pourquoi `13px` ligne 894 et `0.82rem` ligne 540 qui valent **pareil** (13,12px) ? Réponse : copier-coller chaotique.

5. **Border-radius patchwork** : 2, 4, 6, 8, 10, 12, 14, 20, 32, 50% utilisés sans logique sémantique. Un pro déclarerait `--radius-sm: 2px; --radius-md: 6px; --radius-lg: 12px; --radius-pill: 999px;`.

6. **Couleurs en dur dans le code** : `#FFB347` (orange clair) apparaît dans la nav hover (`styles.css:582`), dans la barre preloader (`futuriste.css:148`), dans le scroll progress (`futuriste.css:166`) — **3 fois en littéral**, jamais en variable. Si demain on change l'accent, il faut chasser le orange dans 50 endroits.

7. **`overflow-x: hidden` sur le body** (`styles.css:317`) : c'est un cache-misère classique qui dit *"j'ai des éléments qui débordent et je préfère masquer plutôt que régler la cause"*. Symptôme de code mal aligné.

8. **`z-index` chaotique** : 999 (navbar), 9998 (grain), 9999 (scroll-progress), 99999 (preloader), 100 (popovers), 50 (stepper), 9999 (WhatsApp). **Pas d'échelle**. Un pro déclare `--z-nav: 100; --z-overlay: 200; --z-modal: 300; --z-toast: 400;`.

9. **Le grain SVG via data-URI** (`futuriste.css:20`) avec `baseFrequency='0.85'` est trop fin pour être perçu mais consomme du GPU sur mobile bas de gamme. C'est un effet **invisible et coûteux**.

10. **`#preloader` sur fond `#050505`** (`futuriste.css:46`) alors que le reste du site est `#242424`. Le visiteur voit un **flash** entre la fin du preloader et le début de la page. C'est mauvais.

11. **`couvertines.html` contient 34 `!important`** dans son `<style>` inline. Quand un designer en arrive là, c'est qu'il a perdu le contrôle de sa cascade CSS.

12. **Footer flag emoji 🇫🇷** (`index.html:703`) : émoji système, donc rendu différent sur Mac/Win/Android. Sur un site qui se veut premium, **on dessine son drapeau** (et il existe déjà un `.france-flag` propre dans la navbar ligne 459 — pourquoi pas le réutiliser ?).

13. **Le badge "France" en navbar** a une taille de drapeau `13×20px` (`styles.css:510-512`). À 13px de haut, le bleu/blanc/rouge se confondent en gris. Inutile.

14. **Carte glassmorphism hero** : `backdrop-filter: blur(4px)` (`index.html:289-290`). 4px de blur, c'est invisible. Soit on fait du glass à 16-24px (Apple-like), soit on en fait pas. Là, c'est tiède.

---

## 7. LES 10 PROBLÈMES VISUELS MAJEURS

### #1 — Photos atelier d'origine IA visibles
**Sévérité : CRITIQUE**
**Où** : 19 slides hero `assets/photos/metal-pliage-*.webp`, masquées par filtre CSS (`index.html:93-97`)
**Pourquoi c'est mauvais** : un architecte ou un client B2B identifie l'origine IA en 2 secondes. Le filter CSS qui tente de camoufler ne fait que confirmer le problème (et le commentaire dans le code l'admet). Mensonge visuel = perte de confiance = perte de conversion premium.
**Solution concrète** : commander 1 séance photo pro chez Yannis (1 journée, ~800-1200€ Saint-Étienne), 25 vrais clichés atelier + 10 clichés détail produit. Retirer toutes les images IA. En attendant, garder **3 slides max** (les moins reconnaissables IA) et virer les autres.

### #2 — Effet "brushed-aluminum" animé sur le H1
**Sévérité : MAJEUR**
**Où** : `index.html:116-160`, classe `.brushed-aluminum` appliquée au H1 "METAL PLIAGE"
**Pourquoi c'est mauvais** : 80 lignes de CSS pour un effet métallique sur le titre = **gadget Web 2008**. Aesop, Hermès, Bottega Veneta ne font jamais ça. Le luxe = typo plate, large, blanche, point. L'effet brossé hurle "j'essaie de faire premium" → produit l'effet inverse.
**Solution** : supprimer la classe `brushed-aluminum` sur le H1. Mettre `color: #fff; font-weight: 800; letter-spacing: -0.03em;` et laisser respirer. Gain instant en classe.

### #3 — Grain animé global à 8 fps
**Sévérité : MAJEUR**
**Où** : `css/futuriste.css:11-36`
**Pourquoi c'est mauvais** : (1) opacity 0.038 = quasi-invisible donc l'effort est gaspillé, (2) repaint constant sur tout l'écran = batterie mobile drainée, (3) `position: fixed; inset: -50%; width: 200%; height: 200%;` = couvre toute la surface d'écran à 9998 = au-dessus de tout. Sur un MacBook Pro c'est imperceptible, sur un Android entrée de gamme c'est un ralentisseur.
**Solution** : supprimer purement. Aucune marque luxe n'a de grain animé. Si on tient à l'effet "matière", utiliser un SVG noise **statique** en background-image sur le hero uniquement.

### #4 — Système de boutons primaires incohérent (5 variantes)
**Sévérité : MAJEUR**
**Où** : `styles.css:402` (.btn-primary), `:421` (.diptyque-pane-cta), `:2928` (.couvertine-featured-ctas .btn-primary), `couvertines.html:455` (.muret-wizard-submit), variant hero
**Pourquoi c'est mauvais** : 5 boutons "primaires" différents → le visiteur ne peut pas pré-attentivement identifier "le bouton qui m'engage". Les pages se contredisent.
**Solution** : un seul `.btn-primary` avec **3 tailles** (`-sm`, `-md`, `-lg`) — pas 5 signatures. Refactor CSS : 1 sprint d'1 jour suffit.

### #5 — Patchwork d'échelle typographique (35+ tailles)
**Sévérité : MAJEUR**
**Où** : `styles.css` (80+ occurrences `font-size:`)
**Pourquoi c'est mauvais** : empêche toute lecture hiérarchique. L'œil n'a pas de repère "ça c'est petit / ça c'est moyen / ça c'est grand". Tout flotte.
**Solution** : refonte avec échelle 8 paliers : 12/14/16/18/22/28/36/48/64. Variables CSS : `--text-xs --text-sm --text-base --text-lg --text-xl --text-2xl --text-3xl --text-4xl`. Migration progressive page par page.

### #6 — H1 de couvertines.html et pliage.html en font-weight 300 vs H1 home en 700
**Sévérité : MAJEUR**
**Où** : `couvertines.html:88-96`, `pliage.html:88-96`
**Pourquoi c'est mauvais** : le visiteur perçoit **deux sites différents**. La home est virile (700 uppercase brossé), les pages produit sont light éditoriales (300 lowercase). Schizophrénie de marque.
**Solution** : trancher. Soit la marque est "industrielle masculine" (uppercase 700 partout), soit "éditoriale élégante" (light 300 partout). Mon conseil : **light 400-500 sentence-case partout**, c'est plus moderne 2026 et plus crédible artisan.

### #7 — Section diptyque sans contraste visuel entre les 2 univers
**Sévérité : MAJEUR**
**Où** : `index.html:556-604`, classes `.diptyque-pane--couvertine` et `.diptyque-pane--pliage`
**Pourquoi c'est mauvais** : les deux pavés ont des photos hero atelier similaires en teinte/lumière + le même overlay orange + le même background. Le geste "deux choix" est annulé visuellement.
**Solution** : forcer un contraste. Couvertine = photo d'un muret/terrasse en lumière jour bleutée. Pliage = photo d'atelier en lumière orangée chaude. Et différencier les overlays.

### #8 — 34 `!important` dans le `<style>` inline de couvertines.html
**Sévérité : MAJEUR (dette technique)**
**Où** : `couvertines.html:112-156`
**Pourquoi c'est mauvais** : marque officielle de perte de contrôle. À chaque modif future, ça va exploser.
**Solution** : refactor en classes spécifiques (`.cv-featured`, `.cv-featured-img--tall`, etc.) avec spécificité élevée mais sans `!important`. 2-3h de travail.

### #9 — Palette : 4 noirs/gris fonds sans logique sémantique
**Sévérité : MINEUR (mais multiplié sur tout le site)**
**Où** : `styles.css:8-10`, plus literals `#0f0f0f` (`index.html:339`), `#050505` (`futuriste.css:46`)
**Pourquoi c'est mauvais** : on a 5 fonds différents sans qu'aucun ne porte de sens (lequel = surface ? lequel = élevé ? lequel = inset ?).
**Solution** : 3 fonds max, nommés sémantiquement : `--surface-base`, `--surface-raised`, `--surface-sunken`. Supprimer le reste.

### #10 — CTA primaire de la home faible et générique
**Sévérité : MINEUR (mais impact conversion direct)**
**Où** : `index.html:520-523` "Accéder aux produits"
**Pourquoi c'est mauvais** : verbe neutre, pas de bénéfice, pas d'urgence, pas de chiffre. Standard agence luxe 2025 : "Configurer ma couvertine — devis 30s" ou "Recevoir un échantillon métal".
**Solution** : tester "Configurer ma pièce sur-mesure" ou "Voir le configurateur (2 min, prix immédiat)".

---

## 8. LES 5 CHOSES À NE PLUS JAMAIS FAIRE

### Règle 1 — Ne jamais empiler un effet pour cacher une faiblesse.
*Le filter CSS qui camoufle des photos IA est un mensonge visuel. Soit on a la photo, soit on ne la met pas. On ne maquille pas un défaut, on le retire.*

### Règle 2 — Pas d'effet animé permanent en arrière-plan.
*Grain qui clignote, marquee qui défile, shimmer orange qui boucle, slideshow auto qui change : choisir UN seul, jamais tous. Le silence visuel est un luxe.*

### Règle 3 — Un seul `.btn-primary`, un seul `.btn-secondary`, sans `!important`.
*Si on doit utiliser `!important` plus de 2 fois dans tout le site, c'est qu'on a perdu son design system. Refactor obligatoire.*

### Règle 4 — Une échelle, pas un patchwork.
*Type scale : 8 paliers max. Espacement : multiples de 8. Radius : 4 valeurs max. Couleurs : 3 fonds + 1 accent + 3 textes. Tout le reste est interdit.*

### Règle 5 — La même règle typographique sur toutes les pages.
*Si la home est uppercase 700, alors la page produit aussi. Pas de "page produit en font 300 sentence-case" qui rompt l'identité. Une marque = une voix typo.*

---

## 9. NOTE FINALE

### Ventilation

| Critère | Note /10 | Commentaire |
|---|---|---|
| **Esthétique** | 5,5 | Effort visible, mais codes 2018-2021, gadgets, photos IA. |
| **Cohérence** | 4 | Système de design embryonnaire écrasé par 34 `!important` et 5 variantes de bouton primaire. |
| **Conversion** | 6,5 | Wizard couvertine + Stripe + prix instantané = bon pipeline e-com. CTA principal faible. |
| **Mobile** | 6 | Navbar mobile OK. Mais grain animé + 19 slides + backdrop-filter = perf médiocre sur Android entrée de gamme. Pas auditer ici en profondeur. |
| **Accessibilité** | 7 | `prefers-reduced-motion` géré, `focus-visible` propre, ARIA labels présents. Contraste à vérifier sur orange/dark. |
| **Premium feel** | 4 | Loin des standards luxe 2024-2026. C'est un site "pro qui essaie", pas "pro qui assume". |

### **Note globale : 5,5 / 10**

Traduction : *"site fonctionnel et au-dessus de la moyenne sectorielle BTP/métal, mais nettement en dessous de son ambition premium revendiquée. Travail à reprendre sur l'identité (typo, photo, palette) avant d'investir sur de nouvelles features."*

---

# SYNTHÈSE — 200 mots

**Note globale : 5,5/10.**

Metal Pliage v2 est un site **fonctionnellement solide** (configurateur, wizard, Stripe, structure sémantique, accessibilité de base) mais **visuellement immature**. Il accumule les effets (grain animé, aluminium brossé, shimmer, glassmorphism, slideshow 19 slides traitées) pour compenser une **identité graphique non aboutie**. Le système de design est un patchwork : 5 boutons primaires différents, 35+ tailles de police, 5 nuances de fond, 34 `!important` dans une seule page. Les photos d'atelier sont d'origine IA et le code admet lui-même tenter de le camoufler par filtre CSS — ce qui détruit la confiance des architectes (cible Sophie).

**Trois priorités absolues, par ordre de retour sur investissement :**

1. **Refaire les photos.** Une journée photo pro à Saint-Étienne (≈1000€) + 1 chantier filmé. Sans ça, rien d'autre ne compte.

2. **Désactiver les effets gadget** (grain animé, brushed-aluminum, marquee infini) et **simplifier le hero** : 1 photo, 1 H1 typo claire, 1 CTA précis. Le luxe est silencieux.

3. **Refactor du design system** : 8 tokens (couleurs, fonts, spacings, radius), 1 seul `.btn-primary`, supprimer les 34 `!important`. 2-3 jours dev, énorme gain de cohérence durable.
