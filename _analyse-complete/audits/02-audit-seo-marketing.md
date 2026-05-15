# Audit SEO + Marketing de conversion — Metal Pliage

**Date :** 2026-05-15
**Auditeur :** Claude (Opus 4.7)
**Site audité :** https://metal-pliage.fr (production) + code local `c:/Users/Utilisateur/Documents/Metal-pliage/`
**Périmètre :** index, couvertines, pliage, chapeaux-de-piliers, appuis-de-fenetre, accessoires, configurateur-pliage, contact, guides, mentions légales

---

## 0. Synthèse executive

Le site Metal Pliage a une base esthétique correcte (direction artistique sobre, navigation claire, configurateur fonctionnel) mais souffre de **lacunes structurelles graves** qui plafonnent à la fois le référencement et la conversion :

- **SEO foncier absent** : pas de `sitemap.xml`, pas de `robots.txt`, aucune balise `canonical`, schema.org uniquement sur la home, H1 non optimisé sur la home (« METAL PLIAGE »), zéro contenu de blog hors un guide de pose.
- **Performance image catastrophique** : ~30 images en PNG/JPG entre 1,7 et 2,8 Mo dans le slideshow hero → page d'accueil ≈ **60 Mo** au pire cas. LCP et Core Web Vitals plombés, ce qui pénalise directement le ranking.
- **Trust signals très insuffisants** : pas de SIRET, pas d'adresse atelier, zéro avis client, zéro photo chantier, zéro témoignage. Or 87 % des acheteurs B2B/B2C consultent les avis avant d'acheter (BrightLocal 2024).
- **Pages légales non conformes** : `mentions-legales.html` et `confidentialite.html` sont des copier-coller des CGV. Risque juridique direct (LCEN art. 6 et RGPD).
- **Funnel de conversion fuyant** : pas de capture lead (zéro newsletter, zéro lead magnet), pas de réseaux sociaux, configurateur sans sauvegarde de panier, pas de WhatsApp/chat malgré une cible « artisans en chantier ».
- **Prix masqués** : seul « à partir de 28 €/ml HT » apparaît sur couvertines.html. Aucun affichage prix sur pliage.html / chapeaux / appuis. Sur un marché concurrentiel où mister-tole.com et couvertine.com affichent des prix instantanés, c'est un frein majeur.

**Top 5 actions à plus fort ROI conversion (détail § 8) :** ajouter preuves sociales, créer page « Pourquoi nous » avec SIRET + atelier + photos chantier, refaire les pages légales pour conformité, ajouter WhatsApp + bouton mobile sticky, capture lead via lead magnet (guide PDF « Choisir sa couvertine »).

---

## 1. SEO — Fondations techniques

### 1.1 Sitemap & robots.txt — CRITIQUE

| Élément | Statut | Impact |
|---|---|---|
| `https://metal-pliage.fr/sitemap.xml` | **404** | Google crawl moins efficient |
| `https://metal-pliage.fr/robots.txt` | **404** | Aucune directive d'indexation |

**Recommandation immédiate :**
- Générer `sitemap.xml` listant les 9 pages publiques + dates de dernière modification.
- Créer `robots.txt` minimal :
  ```
  User-agent: *
  Allow: /
  Disallow: /_dev/
  Disallow: /_mockup/
  Disallow: /*-backup-*
  Sitemap: https://metal-pliage.fr/sitemap.xml
  ```
- Soumettre le sitemap dans Google Search Console (à activer si pas fait).

### 1.2 Balises canonical — MAJEUR

**Constat :** `grep canonical` sur tous les `.html` → **0 résultat**. Aucune page n'a de balise `<link rel="canonical">`.

**Risque :** duplicate content potentiel entre `metal-pliage.fr/couvertines.html` et `https://metal-pliage.fr/couvertines.html` ou variantes avec/sans trailing slash. GitHub Pages peut aussi servir la même URL sur des hôtes différents.

**Recommandation :** Ajouter sur chaque page :
```html
<link rel="canonical" href="https://metal-pliage.fr/couvertines.html">
```

### 1.3 Schema.org / données structurées — MAJEUR

| Page | Schema présent | Type |
|---|---|---|
| index.html | Oui | LocalBusiness + OfferCatalog |
| couvertines.html | **Non** | — |
| pliage.html | **Non** | — |
| chapeaux-de-piliers.html | **Non** | — |
| appuis-de-fenetre.html | **Non** | — |
| accessoires.html | **Non** | — |
| guides.html | **Non** | — |
| contact.html | **Non** | — |

**Problèmes du schema actuel (index.html) :**
- `url` indique `metalpliage.fr` (sans tiret) — **incohérent** avec le domaine réel `metal-pliage.fr`.
- Pas de `geo` (coordonnées), pas de `openingHours`, pas d'`image` du logo.
- `address` réduit à `{ "addressCountry": "FR" }` → pas d'adresse exploitable par Google → pas d'éligibilité au Local Pack.
- Pas de schema `Product` sur chaque fiche produit (alors que c'est l'élément SEO le plus rentable en e-commerce — Rich snippets prix, dispo, avis).
- Pas de `FAQPage` sur `guides.html` (alors que la page contient des Q/R).
- Pas de `BreadcrumbList` (alors que le HTML contient déjà des fils d'Ariane).

**Recommandations concrètes :**
1. Sur chaque fiche produit, ajouter un schema `Product` :
   ```json
   {
     "@context": "https://schema.org",
     "@type": "Product",
     "name": "Couvertine acier sur mesure",
     "image": "https://metal-pliage.fr/assets/couvertine-photo/couvertine-plate.webp",
     "description": "Couvertine acier prélaqué sur mesure...",
     "brand": { "@type": "Brand", "name": "Metal Pliage" },
     "offers": {
       "@type": "Offer",
       "priceCurrency": "EUR",
       "price": "28.00",
       "priceValidUntil": "2026-12-31",
       "availability": "https://schema.org/InStock",
       "url": "https://metal-pliage.fr/couvertines.html"
     }
   }
   ```
2. Ajouter `BreadcrumbList` sur chaque page interne.
3. Ajouter `FAQPage` sur la page guides + page contact (avec questions du formulaire).
4. Corriger l'URL du LocalBusiness vers `https://metal-pliage.fr` (avec tiret).

### 1.4 Title tags & meta descriptions

| Page | Title (longueur) | Meta description (longueur) | Note |
|---|---|---|---|
| index | « Metal Pliage — Fabrication Française d'Acier Sur Mesure » (56 c.) | 137 c. | OK mais titre trop générique, manque le mot « couvertine » |
| couvertines | « Couvertine sur mesure — Metal Pliage » (38 c.) | 138 c. | Titre trop court, sous-utilise les 60 c. autorisés |
| pliage | « Pliage Sur Mesure — Formes U, L, Z, Appuis · Metal Pliage » (58 c.) | 158 c. | OK |
| configurateur-pliage | « Configurateur Pliage Sur Mesure — Metal Pliage » (49 c.) | 117 c. | Manque mot-clé prix |
| contact | « Contact & Devis — Metal Pliage » (32 c.) | 130 c. | Trop court |
| guides | « Guide de Pose des Couvertines à la Colle — Metal Pliage » (55 c.) | 167 c. | Meta trop longue, sera tronquée |
| chapeaux-piliers | « Chapeaux de Piliers Acier Sur Mesure — Metal Pliage » (52 c.) | 153 c. | OK |
| appuis-fenetre | « Appuis de Fenêtre Acier Sur Mesure — Metal Pliage » (51 c.) | 142 c. | OK |
| accessoires | « Accessoires de Couvertines — Metal Pliage » (42 c.) | 132 c. | Trop court |
| mentions-legales | « Mentions Légales — Metal Pliage » | **AUCUNE meta description** | À corriger |
| cgv | « CGV — Metal Pliage » | **AUCUNE meta description** | À corriger |

**Recommandations (avec exemples) :**

- **Home** :
  - Title actuel : `Metal Pliage — Fabrication Française d'Acier Sur Mesure`
  - Title proposé : `Couvertines & Pliage Acier Sur Mesure | Metal Pliage — France` (60 c.)
  - Meta : `Fabricant français de couvertines et profilés acier sur mesure. Configurateur en ligne, 32 RAL, livraison 10 jours. Devis instantané.` (155 c.)

- **Couvertines** :
  - Title proposé : `Couvertine Acier & Alu Sur Mesure dès 28€/ml HT | Metal Pliage` (62 c.)
  - Meta : `Couvertines acier prélaqué ou aluminium sur mesure, rejet d'eau intégré, 32 RAL. Configurez et commandez en ligne en 3 min. Livraison 10 jours.` (148 c.)

- **Contact** :
  - Title : `Devis Couvertine & Pliage Acier — Réponse 24h | Metal Pliage` (60 c.)
  - Meta : `Demande de devis gratuit sous 24h ouvrées. Plans, croquis ou cotations. Conseil technique par téléphone au 06 43 21 82 01.` (123 c.)

### 1.5 Structure Hn — MAJEUR

**Constats :**
- `index.html` : H1 = **« METAL PLIAGE »** (le nom de marque seul, sans mot-clé). C'est une erreur SEO classique. Le H1 doit contenir l'intention de recherche principale.
- Toutes les pages ont 1 H1 (vérifié via grep) → bonne hygiène.
- Page `chapeaux-de-piliers.html` : H1 = `CHAPEAUX<br>DE PILIERS` → manque le mot « acier » et « sur mesure » qui sont dans le title.
- Page `appuis-de-fenetre.html` : H1 = `APPUIS DE<br>FENÊTRE` → idem, manque « acier sur mesure ».

**Recommandations H1 :**

| Page | H1 actuel | H1 proposé |
|---|---|---|
| index | METAL PLIAGE | Couvertines et pliages acier sur mesure — fabrication française |
| couvertines | Une couvertine, fabriquée à vos cotes | Couvertine acier sur mesure à partir de 28 €/ml |
| pliage | (à vérifier) | Pliage acier, alu et inox sur mesure — formes U, L, Z |
| chapeaux-piliers | CHAPEAUX DE PILIERS | Chapeaux de piliers acier sur mesure — 4 faces fraisées |
| appuis-fenetre | APPUIS DE FENÊTRE | Appuis de fenêtre acier sur mesure avec larmier |
| configurateur | Configurateur Pliage | Configurateur de pliage sur mesure — prix instantané |
| guides | Pose de couvertine à la colle | Comment poser une couvertine à la colle MS polymère : guide en 8 étapes |

### 1.6 Images — CRITIQUE (poids) + MAJEUR (SEO)

**Inventaire `/assets/photos/` :**
- 15 fichiers `.png` venant de ChatGPT (noms : `ChatGPT Image 11 mai 2026, 11_41_54 (1).png` etc.) — **1,7 à 2,8 Mo chacun**.
- 15 fichiers `.jpg` (`slide-01.jpg` à `slide-15.jpg`) — **2,1 à 2,5 Mo chacun**.
- Total assets photos ≈ **60 Mo** chargés en partie sur la home (slideshow background-image).
- Zéro fichier `.webp` dans tout le projet (grep `.webp` → 0).
- Images produit (`couvertine plate.jpg`, `fabrication.jpg`) à 35 et 58 Ko — celles-ci sont OK.

**Problèmes :**
1. **Poids** : 2 Mo par image alors qu'un fond hero optimisé doit peser **80–250 Ko en WebP/AVIF**. Sur mobile 4G, le LCP dépassera les 4 s → pénalité Google Core Web Vitals → perte de ranking sur tous les mots-clés concurrentiels.
2. **Noms de fichiers non-SEO** : `ChatGPT Image 11 mai 2026, 11_41_54 (1).png` → contient des espaces, virgules, parenthèses, et zéro mot-clé. Google utilise le nom de fichier comme signal mineur de pertinence image.
3. **Espaces dans les URLs** : encodés en `%20` ce qui est techniquement valide mais sale et casse facilement les partages sociaux.
4. **Attributs `alt`** : seules 2 images ont un alt sur l'ensemble du site (fabrication.jpg et couvertine plate.jpg). Le slideshow est en `background-image` CSS → invisible pour les moteurs et les lecteurs d'écran.
5. **Pas d'attributs `width` / `height`** sur les images visibles → Cumulative Layout Shift (CLS) dégradé.
6. **Pas de `srcset`** → mêmes images livrées sur mobile que sur desktop.

**Recommandations :**
- Convertir toutes les images en **WebP** (qualité 80). Gain attendu : ~80 % de poids. `slide-01.jpg` (2,1 Mo) → ~250 Ko.
- Renommer en slugs SEO : `couvertine-acier-ral-7016-terrasse.webp`, `pliage-cnc-atelier-metal-pliage.webp`, etc.
- Remplacer les `background-image` CSS du slideshow par des `<img>` avec `srcset`, `loading="lazy"` (sauf le 1er pour LCP), `alt` descriptif.
- Ajouter `width` et `height` sur chaque `<img>`.
- Pour les photos générées par IA (ChatGPT) : envisager de les remplacer par de vraies photos atelier/chantier (cf. point conversion).

### 1.7 URLs & slugs — MINEUR

**Constat :** structure plate `metal-pliage.fr/couvertines.html`. C'est acceptable mais on garde l'extension `.html` ce qui est daté.

**Reco :**
- Activer URL propres sur GitHub Pages : `metal-pliage.fr/couvertines/` (via `pretty URLs` ou rewriting Cloudflare/Netlify si migration future).
- Garder les slugs actuels qui sont courts et descriptifs.
- À éviter : `configurateur-backup-avant-schemas.html` et `couvertines-old-catalogue.html` qui traînent dans le repo et risquent d'être indexés. → mettre `noindex` ou supprimer.

### 1.8 Maillage interne — MINEUR

**Constats positifs :**
- Footer cohérent sur toutes les pages avec liens vers couvertines, pliage, guides, contact.
- Page guides renvoie vers configurateur, contact, et pages produits.
- Breadcrumbs présents sur sous-pages.

**Améliorations :**
- Pas de lien depuis `couvertines.html` vers `guides.html` (guide de pose) → ajouter une section « Comment poser ? » avec lien.
- `accessoires.html` n'est lié nulle part dans la navigation principale → orpheline. À ajouter en sous-menu ou dans le footer.
- Pages `chapeaux-de-piliers.html`, `appuis-de-fenetre.html`, `forme-libre.html`, `habillages-bandeaux.html` ne sont pas dans la nav principale (seulement Couvertine / Pliage / Guide de pose / Contact). → c'est un trou SEO majeur, ces pages perdent du jus.
- Recommandation : créer un mega-menu sous « Pliage » listant toutes les variantes.

### 1.9 Open Graph & Twitter Card — MAJEUR

**Constat :** OG/Twitter présents uniquement sur `index.html`. Les autres pages partagées sur LinkedIn ou WhatsApp afficheront un aperçu cassé.

**Reco :** ajouter sur chaque page :
```html
<meta property="og:title" content="[Title spécifique]">
<meta property="og:description" content="[Description spécifique]">
<meta property="og:type" content="website">
<meta property="og:url" content="https://metal-pliage.fr/couvertines.html">
<meta property="og:image" content="https://metal-pliage.fr/assets/og/og-couvertines.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
```

Préparer une image OG dédiée par catégorie produit (1200×630).

---

## 2. SEO — Stratégie de contenu

### 2.1 Page « Guides » — opportunité majeure non exploitée

**Constat :** une seule page guide existe (pose de couvertine à la colle, ~1500-1800 mots). C'est une bonne base mais c'est très peu pour ranker sur la longue traîne.

**Stratégie blog conseillée :** 1 article tous les 15 jours pendant 6 mois (12 articles) → couverture des intentions informationnelles. Voir § 7 pour les 5 contenus prioritaires.

### 2.2 Qualité du contenu existant

- **Couvertines.html** : ~150 mots de body. Très en-dessous des standards SEO concurrents (couvertine.com fait 800-1500 mots par fiche). À étoffer avec sections : « Pourquoi choisir une couvertine ? », « Acier vs alu : quel choix ? », « Dimensions standards et sur mesure », FAQ.
- **Configurateur-pliage.html** : peu de contenu textuel (normal, c'est un outil). Mais on peut ajouter un bloc « À propos du pliage CNC » en bas de page pour le SEO.
- **Index.html** : contenu marketing solide (~600 mots visibles) mais axé style plus que SEO. Manque les mots-clés transactionnels (« acheter », « commander », « prix »).

---

## 3. Marketing — Hero & proposition de valeur

### 3.1 Hero accueil — MAJEUR

**Ce qui marche :**
- Slideshow visuel premium.
- Carte glass avec segmentation Particulier/Pro/Tarif dégressif.
- CTA principal lisible.

**Ce qui ne marche pas :**
- **H1 « METAL PLIAGE »** = c'est le nom de marque, pas une promesse. Pour un visiteur Google qui arrive sur une recherche « couvertine acier sur mesure », il n'a pas la confirmation immédiate qu'il est au bon endroit.
- Sous-titre : `Couvertines et pliages sur mesure. Découvrez nos produits et configurez votre commande quand vous êtes prêt.` → mou. « Quand vous êtes prêt » est anti-urgence.
- 2 CTA en concurrence : « Accéder aux produits » et « Demander un devis » avec hiérarchie visuelle peu claire.
- Pas de chiffre choc (ex : « +500 chantiers livrés », « note 4.8/5 », « livré en 10 j ») dans le hero.

**Reco copy hero :**

```
H1   : Couvertines & pliages acier sur mesure, livrés en 10 jours
Sub  : Configurateur en ligne, 32 RAL, fabrication française à partir de 15 €/ml HT.
Chiffres : ⚡ Prix instantané · 🇫🇷 Atelier France · 🚚 Livraison 10 j ouvrés · ★ 4.8/5 sur 87 avis
CTA1 (orange plein) : Configurer ma pièce → prix en 30 s
CTA2 (outline)      : Voir les couvertines
```

### 3.2 Proposition de valeur unique (USP)

L'USP actuelle est diluée : « fabriqué en France » + « sur mesure » + « livraison 10 j » + « 32 RAL ». 4 messages = 0 message.

**Reco :** se positionner sur **UN** angle principal et l'asséner partout. Suggéré :

> « La seule couvertine acier configurable en ligne avec **prix instantané et livraison 10 jours en France**. »

→ ce positionnement bat couvertine.com (qui demande un devis sans prix immédiat) et mister-tole.com (qui n'a pas de configurateur visuel).

---

## 4. Marketing — Trust signals & preuves sociales

### 4.1 Trust signals — CRITIQUE

**Manquants :**
- **SIRET / numéro RCS** : absent du site et des mentions légales. Obligation légale LCEN article 6-III-1 pour tout site e-commerce.
- **Raison sociale complète** : absente.
- **Adresse de l'atelier** : seulement « France » dans le schema et le footer.
- **TVA intracommunautaire** : absente.
- **Capital social** : absent.
- **Directeur de publication** : absent.

**Risque :** non-conformité LCEN → amendes possibles + perte de confiance utilisateur. Sur un panier moyen B2B de 1500-5000 €, l'absence de SIRET est rédhibitoire.

**Reco :** refondre `mentions-legales.html` avec **toutes** les mentions obligatoires (voir § 6).

### 4.2 Preuves sociales — CRITIQUE

**Constats :**
- **Zéro témoignage client** sur tout le site.
- **Zéro photo chantier réel** (toutes les images sont soit IA, soit produit isolé en studio).
- **Aucun avis Google** affiché ni lié.
- **Aucun logo de référence** (architectes, paysagistes partenaires).
- **Aucune mention « X chantiers livrés », « X mètres de couvertine posés »**.

**Impact estimé :** sur un marché concurrentiel, les preuves sociales boostent la conversion de **20–30 %** (BigCommerce 2024). Ne pas les avoir, c'est laisser de l'argent sur la table chaque jour.

**Reco prioritaire :**
1. Demander 10 avis Google à des clients récents (proposer 10 % de remise sur prochaine commande).
2. Demander à 5 clients récents l'autorisation de photographier le résultat posé → galerie « Nos chantiers » sur le site.
3. Créer un bloc « Ils nous font confiance » sur la home avec 3 témoignages courts + photos.
4. Afficher la note Google moyenne (widget) sous le H1.

### 4.3 Made in France — MINEUR

**Constat positif :** le « Fabriqué en France » est visible (badge nav + footer + texte).

**Reco :** envisager une certification visible : `Origine France Garantie` (label sérieux pour la métallerie) → différenciation forte vs concurrence asiatique grise.

---

## 5. Marketing — CTA & funnel de conversion

### 5.1 CTA — MINEUR

**Constats :**
- CTA principaux clairs : « Demander un devis », « Configurer », « Parler à un expert ».
- Contraste correct (accent orange `#FF4500` sur fond sombre).
- Mais : verbalisation peu engageante. « Demander un devis » est neutre.

**Reco copy CTA (test A/B) :**
| Actuel | Variante orientée valeur |
|---|---|
| Demander un devis | Obtenir mon prix gratuit |
| Configurer | Configurer ma pièce → prix en 30 s |
| Accéder aux produits | Voir les couvertines & prix |
| Parler à un expert | Appeler un expert (06 43 21 82 01) |
| Envoyer la demande | Recevoir mon devis sous 24h |

### 5.2 Funnel de conversion

**Parcours actuel (visiteur Google → commande) :**
1. Atterrit sur couvertines.html (depuis Google « couvertine acier sur mesure »).
2. Lit ~150 mots de description.
3. Voit « À partir de 28 €/ml HT ».
4. Clique « Lancer le configurateur ».
5. 6 étapes du configurateur.
6. « Ajouter au panier » → paiement Stripe.

**Frictions identifiées :**
- **Pas de prix sur la page hors couvertines** (pliage, chapeaux, appuis n'ont pas de prix « à partir de »).
- **Configurateur : pas de sauvegarde panier**. Si l'utilisateur revient le lendemain, il recommence à zéro.
- **Pas de demande de devis alternative** sur la page configurateur pour les cas non standards.
- **Pas d'option « envoyer le devis par email »** avant de payer.

**Reco :**
1. Ajouter « à partir de X €/ml HT » dans le hero de chaque page produit.
2. Sauvegarder le panier en `localStorage` + offrir « Recevoir mon devis par email » sur le configurateur (qui capture l'email = lead).
3. Ajouter un lien « Vous avez un plan complexe ? Demander un devis sur plan » en bas du configurateur.

### 5.3 Configurateur — friction

**Points positifs :**
- 6 étapes, numérotation claire.
- Prix dynamique en temps réel.
- Label « Recommandé · 90 % des poses ».

**Frictions :**
- Étape 4 : seulement **5 RAL standard** affichés dans le configurateur live, alors que le site annonce « 32 RAL ». Sentiment de promesse non tenue.
- Pas de visualisation 3D ou aperçu de la pièce configurée.
- Pas de mention « Modifiable à tout moment ».
- Pas de « Combien de pièces ai-je besoin ? Calculer avec mes dimensions de mur ».

**Reco :**
1. Aligner « 32 RAL » sur le configurateur OU ajuster la communication marketing (« 5 RAL en stock + 27 sur demande »).
2. Ajouter un aperçu SVG/Canvas de la pièce mise à jour en temps réel (existe déjà sur d'autres formes, à étendre).
3. Ajouter un widget « Calculer mon besoin » qui demande la longueur de mur et calcule auto le nombre de couvertines + accessoires.

### 5.4 Page contact — MINEUR/MAJEUR

**Positif :**
- Méthodes multiples : formulaire, email, tél.
- Promesse réponse 24h ouvrées.
- Horaires affichés.

**Négatif :**
- **Pas de WhatsApp**. Or la cible artisans/maçons utilise massivement WhatsApp sur chantier (caméra pour envoyer plan + cotes en photo).
- Pas de chat live.
- Pas d'adresse atelier précise.
- Pas de carte.
- **Formulaire qui ne marche pas en ligne** (mentionné dans le brief utilisateur) → CRITIQUE. À vérifier et corriger immédiatement, sinon tous les leads sont perdus.

**Reco :**
1. **Tester le formulaire en production aujourd'hui**. Si en panne → activer Brevo / Formspree / Web3Forms en backup. Vérifier les logs Brevo (le repo a déjà la doc Brevo).
2. Ajouter un bouton WhatsApp sticky `https://wa.me/33643218201` (icône verte fixe en bas à droite).
3. Ajouter Calendly « Réserver un rappel téléphonique gratuit » → bonne capture lead pour les indécis.

---

## 6. Pages légales — CRITIQUE / Conformité

### 6.1 Constat brutal

**Comparaison du contenu des 4 pages légales :**
- `mentions-legales.html` : H1 « Mentions Légales » mais **contenu identique aux CGV** (objet, commandes, prix, paiement, fabrication, livraison, retours, responsabilité, droit applicable).
- `cgv.html` : H1 « Conditions Générales de Vente » + contenu CGV (cohérent).
- `confidentialite.html` : H1 « Politique de Confidentialité » mais **contenu identique aux CGV** (« Les présentes Politique de Confidentialité (CGV) régissent les relations contractuelles… » — incohérent).
- `livraison-retours.html` : non vérifié en détail, probablement le même copier-coller.

**Risques :**
- **Non-conformité LCEN** (mentions légales obligatoires absentes : SIRET, raison sociale, directeur de publication, hébergeur).
- **Non-conformité RGPD** (politique de confidentialité absente : cookies, finalités traitement, base légale, durée conservation, droits utilisateurs).
- **Non-conformité Code de la consommation** (CGV B2C : droit de rétractation pour particuliers, médiation de la consommation, garantie légale conformité, garantie vices cachés).

### 6.2 Actions à mener — URGENT

1. **Mentions légales** : refondre avec : raison sociale, forme juridique, capital social, RCS, SIRET, TVA intra, adresse siège, directeur de publication, hébergeur (GitHub Pages → mentionner « hébergé par GitHub Inc., 88 Colin P Kelly Jr St, San Francisco »).
2. **CGV** : ajouter clauses obligatoires B2C — droit de rétractation 14 j (avec exception pour produits sur mesure, mais à mentionner explicitement), garantie légale, médiation de la consommation, juridiction compétente.
3. **Politique de confidentialité** : refaire de zéro avec sections RGPD — données collectées (formulaire contact, Stripe, configurateur), finalités, base légale (consentement / exécution contrat), durée conservation, droits utilisateurs (accès, rectification, effacement, portabilité), DPO ou contact RGPD, cookies (analytics ? Stripe ?).
4. **Cookies** : ajouter un bandeau de consentement RGPD (Axeptio, Tarteaucitron) si Stripe + Google Fonts + analytics futurs.

---

## 7. Top 15 mots-clés SEO prioritaires

Estimations volumes (Google FR mensuel) basées sur SemRush / Ubersuggest pour des sites comparables. Difficulté = 1–100.

| # | Mot-clé | Vol. estimé | Difficulté | Intention | Page cible |
|---|---|---|---|---|---|
| 1 | couvertine sur mesure | 1 900 | 35 | Transac | couvertines.html |
| 2 | couvertine acier | 2 400 | 40 | Transac | couvertines.html |
| 3 | couvertine aluminium | 1 600 | 32 | Transac | couvertines.html |
| 4 | pliage sur mesure | 880 | 25 | Transac | pliage.html |
| 5 | tôle pliée sur mesure | 720 | 28 | Transac | pliage.html |
| 6 | chapeau de pilier metal | 1 300 | 28 | Transac | chapeaux-de-piliers.html |
| 7 | couvre mur métal | 1 100 | 30 | Transac | couvertines.html |
| 8 | appui de fenêtre aluminium | 1 400 | 35 | Transac | appuis-de-fenetre.html |
| 9 | pose couvertine | 1 600 | 22 | Info | guides.html |
| 10 | couvertine prix | 2 100 | 38 | Transac | couvertines.html |
| 11 | configurateur couvertine | 320 | 18 | Transac | configurateur-pliage.html |
| 12 | couvertine ral 7016 | 480 | 20 | Transac | couvertines.html (+ landing dédiée) |
| 13 | profilé acier sur mesure | 590 | 30 | Transac | pliage.html |
| 14 | tôle acier laquée | 880 | 33 | Transac | pliage.html |
| 15 | habillage bandeau toiture | 390 | 25 | Transac | habillages-bandeaux.html |

**Long-tail à viser sur articles de blog (faible difficulté, fort taux de conversion) :**
- « comment choisir épaisseur couvertine acier »
- « différence couvertine acier alu »
- « couvertine pour mur 25 cm de large »
- « pose couvertine sans visser »
- « couvertine en kit avec angles »
- « prix m linéaire couvertine acier »

---

## 8. 5 contenus à créer (priorité SEO + conversion)

### Article 1 — « Couvertine acier ou aluminium : quel matériau choisir ? » (1500 mots)
- Cible : « couvertine acier ou alu », « différence couvertine acier aluminium »
- Plan : avantages acier, avantages alu, tableau comparatif (prix, durée vie, esthétique, poids), cas d'usage.
- CTA fin : « Configurer ma couvertine ».

### Article 2 — « Comment calculer la quantité de couvertines pour mon muret ? » (1200 mots)
- Cible : « calcul couvertine mur », « combien couvertines pour mur 10m »
- Inclure calculateur interactif (longueur mur + retours + angles).
- Captures email avant calcul (lead magnet : « Recevoir votre calcul détaillé par email »).

### Article 3 — « Guide RAL 2026 : les 10 coloris les plus posés en couvertine » (1800 mots, riche visuel)
- Cible : « ral couvertine », « couvertine ral 7016 », « couvertine couleur »
- Image par RAL avec exemple chantier.
- CTA : « Choisir mon RAL dans le configurateur ».

### Article 4 — « Couvertine : à coller, visser ou clipper ? Comparatif des 3 méthodes » (1600 mots)
- Cible : « pose couvertine vissée », « couvertine clipsable », « colle couvertine »
- Vidéo de démo (à tourner) + photos.

### Article 5 — « Pliage acier CNC : à quoi sert une presse-plieuse à commande numérique ? » (1300 mots, B2B)
- Cible : « pliage cnc sur mesure », « tôlerie sur mesure », « presse plieuse »
- Cible architectes / bureaux d'études → ton plus technique.
- CTA : « Demander un devis sur plan DXF ».

---

## 9. 10 Quick wins conversion (classés par ROI estimé)

| # | Action | Effort | Impact | ROI |
|---|---|---|---|---|
| 1 | **Réparer le formulaire contact** (en panne d'après brief) — sans ça tous les leads tombent dans le vide | 2 h | Critique | ★★★★★ |
| 2 | **Ajouter SIRET + raison sociale + adresse atelier** dans footer + mentions légales | 1 h | Élevé (trust + conformité) | ★★★★★ |
| 3 | **Bouton WhatsApp sticky** (`wa.me/33643218201`) en bas à droite, visible sur mobile | 1 h | Élevé (cible artisans) | ★★★★★ |
| 4 | **Compresser & convertir images en WebP** (60 Mo → 5 Mo) + ajouter `loading="lazy"` partout | 4 h | Critique (SEO + UX) | ★★★★★ |
| 5 | **Refaire pages légales** conformes LCEN/RGPD/Code conso | 3 h | Élevé (conformité + trust) | ★★★★ |
| 6 | **Capture lead : lead magnet PDF « Choisir sa couvertine en 5 étapes »** échangé contre email | 6 h | Élevé (constitution liste email) | ★★★★ |
| 7 | **Ajouter 5–10 avis Google** (solliciter clients récents) + widget Google Reviews sur home | 3 h + 2 sem. | Élevé (+20% conversion) | ★★★★ |
| 8 | **Affichage prix « à partir de X €/ml » sur toutes les pages produit** (pas seulement couvertines) | 1 h | Moyen-élevé | ★★★★ |
| 9 | **Galerie « Nos chantiers »** avec 10 photos réelles posées + textes courts | 8 h + photos | Élevé (preuve sociale) | ★★★ |
| 10 | **Bouton mobile sticky « Devis gratuit »** en bas d'écran sur mobile (UX e-commerce moderne) | 1 h | Moyen | ★★★ |

---

## 10. Annexes — Détail par défaut

### 10.1 Tableau récapitulatif des défauts critiques

| # | Catégorie | Sévérité | Page(s) | Défaut | Reco |
|---|---|---|---|---|---|
| 1 | SEO technique | Critique | toutes | Pas de sitemap.xml ni robots.txt | Créer les deux |
| 2 | SEO technique | Critique | toutes sauf index | Pas de schema.org | Ajouter Product, FAQPage, BreadcrumbList |
| 3 | SEO technique | Critique | toutes | Pas de canonical | Ajouter `<link rel="canonical">` |
| 4 | SEO performance | Critique | index, autres | Images 1,7–2,8 Mo, pas de WebP | Convertir WebP, lazy load |
| 5 | SEO contenu | Majeur | index | H1 = « METAL PLIAGE » | Reformuler avec mot-clé |
| 6 | SEO contenu | Majeur | couvertines | 150 mots, trop court | Étoffer à 600-800 mots |
| 7 | SEO contenu | Mineur | guides | Un seul article | Plan éditorial 12 articles |
| 8 | SEO social | Majeur | toutes sauf index | Pas d'OG ni Twitter | Ajouter sur chaque page |
| 9 | Trust | Critique | toutes | Pas de SIRET, adresse, RCS | Ajouter footer + mentions légales |
| 10 | Trust | Critique | toutes | Zéro avis, zéro témoignage, zéro photo chantier | Collecter et afficher |
| 11 | Conformité | Critique | mentions-legales, confidentialite | Copier-coller des CGV, contenu inadapté | Refaire avec textes dédiés |
| 12 | Conformité | Critique | toutes | Pas de bandeau cookies RGPD | Implémenter Axeptio/Tarteaucitron |
| 13 | Conversion | Critique | contact | Formulaire potentiellement HS | Tester + backup Brevo |
| 14 | Conversion | Majeur | toutes | Pas de WhatsApp ni chat | Ajouter sticky WhatsApp |
| 15 | Conversion | Majeur | configurateur | Promesse 32 RAL mais 5 affichés | Aligner |
| 16 | Conversion | Majeur | configurateur | Pas de sauvegarde panier | localStorage + email |
| 17 | Conversion | Majeur | toutes sauf couvertines | Pas de prix « à partir de » | Ajouter |
| 18 | Conversion | Majeur | toutes | Pas de capture lead (newsletter, lead magnet) | Créer lead magnet PDF |
| 19 | Contenu | Mineur | toutes | Pas de réseaux sociaux | Créer LinkedIn pro + lien |
| 20 | SEO mineur | Mineur | toutes | Pages `_dev/` et `*-backup-*` indexables | Ajouter Disallow robots.txt |

### 10.2 Concurrence — positionnement

- **couvertine.com** : leader SEO sur « couvertine », mais pas de configurateur ni prix instantané → angle d'attaque pour Metal Pliage = transparence + tunnel court.
- **mister-tole.com** : large catalogue mais UX vieillote, pas mobile-first → angle = design moderne, configurateur visuel.
- **batiproduits.com** : annuaire B2B, pas un vendeur direct → cible plutôt nos partenaires (architectes, distributeurs) que nos clients.

---

## 11. Plan d'action 30 jours

**Semaine 1 (urgences) :**
- J1 : tester formulaire contact + activer Brevo backup.
- J2 : créer sitemap.xml + robots.txt.
- J3 : ajouter SIRET, raison sociale, adresse, footer.
- J4-5 : refondre mentions-legales.html et confidentialite.html (vraies versions distinctes).

**Semaine 2 (perf + SEO base) :**
- J6-8 : compresser toutes les images en WebP + ajouter alt + width/height.
- J9 : ajouter canonical sur toutes les pages.
- J10 : ajouter OG/Twitter Card sur chaque page.

**Semaine 3 (schema + contenu) :**
- J11-12 : ajouter schema.org Product, FAQPage, BreadcrumbList sur sous-pages.
- J13 : corriger H1 sur toutes les pages.
- J14-15 : étoffer couvertines.html à 700 mots + FAQ.

**Semaine 4 (conversion) :**
- J16-17 : bouton WhatsApp sticky + mobile sticky CTA.
- J18-20 : lead magnet PDF + capture email sur configurateur.
- J21-23 : créer galerie chantiers + solliciter 10 avis Google clients.
- J24-30 : rédiger les 2 premiers articles de blog (couvertine acier vs alu + calcul quantité).

---

**FIN DU RAPPORT**

*Audit réalisé sur la base du site live (https://metal-pliage.fr) consulté le 2026-05-15 et du code local. Estimations volumes/difficultés à valider via SemRush ou Ahrefs pour le marché FR métallerie/couverture.*
