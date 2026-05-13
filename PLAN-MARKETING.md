# Dossier Marketing Complet — Metal Pliage V2

> Document de référence — à reprendre, cocher, mettre à jour.
> Objectif : générer un flux régulier de prospects qualifiés et de ventes.
> Dernière révision : 2026-05-13

---

## SOMMAIRE

1. [Vue d'ensemble — l'entonnoir](#1-vue-densemble--lentonnoir)
2. [État des lieux](#2-état-des-lieux)
3. [Stratégie SEO complète](#3-stratégie-seo-complète)
4. [Audit mots-clés des 7 pages principales](#4-audit-mots-clés-des-7-pages-principales)
5. [Contenu & pages à créer](#5-contenu--pages-à-créer)
6. [Référencement externe & autorité](#6-référencement-externe--autorité)
7. [Réseaux sociaux par plateforme](#7-réseaux-sociaux--quel-format-pour-quelle-plateforme)
8. [Publicité payante](#8-publicité-payante)
9. [Marketing visuel](#9-marketing-visuel)
10. [Email marketing & automatisation](#10-email-marketing--automatisation)
11. [Conversion & analytics](#11-conversion--analytics)
12. [Avis & preuve sociale](#12-avis--preuve-sociale)
13. [Actions hors ligne & guérilla](#13-actions-hors-ligne--guérilla)
14. [Stratégie B2B](#14-stratégie-b2b-revendeurs-architectes-promoteurs)
15. [Plan d'action 90 jours](#15-plan-daction--90-jours)
16. [Plan d'action 6 mois](#16-plan-daction--6-mois)
17. [Routine hebdo](#17-routine-hebdo)
18. [Budget détaillé](#18-budget-détaillé)
19. [KPIs & tableau de bord](#19-kpis--tableau-de-bord)
20. [Erreurs à éviter](#20-erreurs-à-éviter)
21. [Checklist de lancement](#21-checklist-de-lancement)

---

## 1. Vue d'ensemble — l'entonnoir

```
        VISIBILITÉ                       (faire venir)
   ┌────────────────────┐
   │ Google (SEO + Ads) │  ───┐
   │ Réseaux sociaux    │     │
   │ Annuaires métier   │     ▼
   │ Marketplaces       │   TRAFIC site
   │ Bouche-à-oreille   │     │
   └────────────────────┘     │
                              ▼
                       ENGAGEMENT             (convaincre)
                   ┌──────────────────┐
                   │ Pages produit    │
                   │ Configurateurs   │
                   │ Avis / preuves   │
                   │ Lead magnets     │
                   └──────────────────┘
                              │
                              ▼
                        CONVERSION             (vendre)
                   ┌──────────────────┐
                   │ Devis / Stripe   │
                   │ Email relance    │
                   │ Retargeting      │
                   └──────────────────┘
                              │
                              ▼
                        FIDÉLISATION           (faire revenir)
                   ┌──────────────────┐
                   │ Avis Google      │
                   │ Parrainage       │
                   │ Newsletter       │
                   └──────────────────┘
```

**Règle d'or :** ne pas attaquer le bas de l'entonnoir si le haut est vide. Trafic d'abord, conversion ensuite.

---

## 2. État des lieux

### Ce qui est déjà en place
- Site V2 quasi terminé (HTML/CSS/JS + Express + Stripe)
- Balises meta `description` / `keywords` / Open Graph sur `index.html`
- JSON-LD `LocalBusiness` (à compléter : téléphone, adresse réelle)
- Configurateurs couvertine et pliage fonctionnels
- 32 finitions RAL, fabrication française mise en avant

### Ce qui manque (bloquants à lever)
- [ ] Domaine `metalpliage.fr` (acheté ? pointé ?)
- [ ] Hébergement HTTPS en production
- [ ] `robots.txt` + `sitemap.xml`
- [ ] Google Search Console + Bing Webmaster Tools + Google Analytics 4
- [ ] Google Business Profile (fiche entreprise)
- [ ] Photos réelles produits (pas que des rendus 3D)
- [ ] Avis clients (Google / Trustpilot)
- [ ] Mentions légales + CGV + politique cookies (obligatoire en France)
- [ ] Comptes réseaux sociaux (Instagram, Pinterest, TikTok, LinkedIn, YouTube)
- [ ] Adresse mail pro (`contact@metal-pliage.fr`)
- [ ] Téléphone professionnel (idéalement numéro fixe géolocalisé)

---

## 3. Stratégie SEO complète

### 3.1 SEO technique (sur le site)

| Élément | Action | Priorité |
|---|---|---|
| HTTPS | Hébergeur avec certificat SSL automatique (OVH, Vercel, Netlify) | 🔴 |
| `robots.txt` | Autoriser tout, pointer vers le sitemap | 🔴 |
| `sitemap.xml` | Lister les 11 pages HTML, soumettre à Search Console + Bing | 🔴 |
| Vitesse | Compresser images (WebP), lazy-load vidéo hero | 🟠 |
| Mobile | Tester chaque page sur smartphone (Lighthouse > 90) | 🔴 |
| Core Web Vitals | LCP < 2.5 s, FID < 100 ms, CLS < 0.1 | 🟠 |
| Balises `<title>` et `<meta description>` | Une unique par page, contenant le mot-clé principal | 🔴 |
| Balises `<h1>` | Une seule par page, contenant le mot-clé | 🟠 |
| Données structurées | JSON-LD `Product`, `FAQ`, `BreadcrumbList`, `Review` | 🟠 |
| URLs propres | `couvertines.html` → préférer `/couvertines/` à terme | 🟡 |
| Images `alt` | Décrire chaque image (ex : "couvertine acier RAL 7016 2 mm") | 🔴 |
| Liens internes | Mailler chaque page produit vers configurateur + accessoires | 🟠 |
| Canonical | `<link rel="canonical">` sur chaque page (évite duplicate) | 🟠 |
| 404 personnalisée | Page d'erreur avec liens utiles | 🟡 |
| Favicon + icône Apple | Visibilité dans onglets et raccourcis | 🟡 |
| `hreflang` | Si version multilingue future (FR/EN) | 🟡 |

### 3.2 SEO de contenu — méthodologie mots-clés (procédure 7 étapes)

#### Étape 1 — Trouver les mots-clés (1 h)

Trois sources gratuites :
1. **Google Suggest** : tape `couvertine` dans Google → note toutes les suggestions auto
2. **Recherches associées** : en bas de la page de résultats Google
3. **Answer The Public** : `answerthepublic.com` → tape "couvertine"

Outils complémentaires :
- **Ubersuggest** (3 req/jour gratuites) — volume + concurrence
- **Google Keyword Planner** (gratuit avec compte Ads) — volumes officiels FR
- **Keywords Everywhere** (extension navigateur, payant léger)
- **AlsoAsked** — questions associées

Pour Metal Pliage : viser une liste de 80-150 mots-clés dans un tableur.

#### Étape 2 — Classer par intention (30 min)

| Intention | Exemple | Type de page |
|---|---|---|
| **Information** | "comment poser une couvertine" | Article de blog |
| **Comparaison** | "couvertine acier vs aluminium" | Guide / comparatif |
| **Achat** | "couvertine acier sur mesure prix" | Page produit / configurateur |
| **Local** | "couvertine sur mesure Lyon" | Page ville / atelier |

#### Étape 3 — 1 page = 1 mot-clé principal

**Règle absolue.** Sinon tu te concurrences toi-même (cannibalisation SEO).

#### Étape 4 — Optimiser la page (15 min/page)

Mot-clé principal aux **5 endroits clés** :
1. **`<title>`** : 50-60 caractères, mot-clé au début
2. **`<meta description>`** : 140-160 caractères, mot-clé + bénéfice + appel à l'action
3. **`<h1>`** : un seul par page, contient le mot-clé
4. **Premier paragraphe** : mot-clé dans les 100 premiers mots
5. **`alt` des images** : description avec mot-clé

Mots-clés secondaires → naturellement dans `<h2>`, `<h3>`, le corps du texte.

#### Étape 5 — Densité et longueur

- **Longueur minimale** : 600 mots par page produit, 1000-1500 pour un article
- **Densité** : mot-clé principal 5-8 fois max sur la page (jamais forcer)
- **Synonymes** : Google les comprend → "couvertine", "couvre-mur", "chaperon" se valent

#### Étape 6 — Mesurer dans Search Console (après 4-6 semaines)

Pour chaque mot-clé : impressions, clics, position moyenne.

**Stratégie d'amélioration :**
- Position 11-20 (page 2) → enrichir le contenu, ajouter 200 mots → souvent ça suffit
- Position 4-10 (page 1 basse) → améliorer le `<title>` pour augmenter le CTR
- Position 1-3 → ne rien toucher, juste maintenir

#### Étape 7 — Itérer chaque mois

1. Repérer 1-2 mots-clés où tu es entre la position 10 et 20
2. Étoffer la page concernée
3. Attendre 3-4 semaines
4. Recommencer

### 3.3 SEO local — Google Business Profile

**LE levier #1 pour un artisan métal.** Gratuit, ultra-rentable.

Étapes :
1. Créer une fiche sur [google.com/business](https://google.com/business)
2. Renseigner : nom, adresse atelier, téléphone, horaires, zone de livraison
3. Catégorie principale : "Atelier de métallurgie" + secondaires "Fournisseur acier", "Quincaillerie"
4. Ajouter ≥ 10 photos (atelier, machines, produits finis, équipe)
5. Publier 1 post / semaine (nouveauté, chantier, promo)
6. **Demander un avis Google après chaque commande** (lien direct dans email)
7. Activer la messagerie directe Google
8. Ajouter les **produits** dans la fiche (visible dans les résultats locaux)

### 3.4 SEO Bing & autres moteurs

Souvent oublié — Bing = 5-10 % du trafic FR, public souvent CSP+ (Edge sur Windows pro).

- [ ] Bing Webmaster Tools (équivalent Search Console)
- [ ] Soumettre le sitemap sur Bing
- [ ] Indexer sur Yandex (peu utile en France mais gratuit)
- [ ] Référencement Qwant (français, automatique via les autres)

### 3.5 SEO vocal & Featured Snippets (position 0)

Optimiser pour les questions complètes : "Comment choisir une couvertine ?", "Quelle épaisseur pour une couvertine acier ?".

- Utiliser des balises `<h2>` sous forme de questions
- Répondre en 40-60 mots juste sous la question
- Listes à puces et tableaux favorisés par Google pour la position 0

---

## 4. Audit mots-clés des 7 pages principales

> Tableau prêt à appliquer. Copier les `<title>`, `<meta description>` et `<h1>` directement dans le HTML.

### Page 1 — `index.html` (accueil)

| Élément | Valeur |
|---|---|
| Mot-clé principal | `couvertine acier sur mesure` |
| Mots-clés secondaires | fabricant français, pliage CNC, RAL 7016 |
| `<title>` | `Couvertine Acier Sur Mesure — Fabricant Français | Metal Pliage` |
| `<meta description>` | `Fabricant français de couvertines acier sur mesure. 32 finitions RAL, configurateur en ligne, livraison sous 10 jours. Devis gratuit.` |
| `<h1>` | `Couvertines acier sur mesure — Fabrication française` |
| URL idéale | `/` |

### Page 2 — `couvertines.html` (catalogue)

| Élément | Valeur |
|---|---|
| Mot-clé principal | `couvertine acier prix` |
| Mots-clés secondaires | couvertine RAL 7016, couvertine 2mm, couvertine aluminium |
| `<title>` | `Couvertine Acier Prix — Catalogue 28 Modèles | Metal Pliage` |
| `<meta description>` | `Catalogue couvertines acier et aluminium au meilleur prix. 19 RAL standard, finitions sablées, sur mesure. Configurez et commandez en ligne.` |
| `<h1>` | `Couvertines acier — Catalogue et prix` |
| URL idéale | `/couvertines/` |

### Page 3 — `pliage.html` (configurateur pliage)

| Élément | Valeur |
|---|---|
| Mot-clé principal | `pliage tôle sur mesure` |
| Mots-clés secondaires | pliage CNC, profilé U L Z, tôle pliée acier |
| `<title>` | `Pliage Tôle Sur Mesure — Profilés U, L, Z | Metal Pliage` |
| `<meta description>` | `Pliage de tôle acier sur mesure : formes U, L, Z, appui de fenêtre. Configurateur en ligne, fabrication CNC française, devis immédiat.` |
| `<h1>` | `Pliage de tôle sur mesure — Configurez votre profil` |
| URL idéale | `/pliage/` |

### Page 4 — `appuis-de-fenetre.html`

| Élément | Valeur |
|---|---|
| Mot-clé principal | `appui de fenêtre métallique sur mesure` |
| Mots-clés secondaires | appui fenêtre acier, appui fenêtre aluminium |
| `<title>` | `Appui de Fenêtre Métallique Sur Mesure — Acier & Alu | Metal Pliage` |
| `<meta description>` | `Appuis de fenêtre métalliques sur mesure en acier ou aluminium. Pliage CNC, finitions RAL, livraison rapide. Devis en ligne en 2 minutes.` |
| `<h1>` | `Appuis de fenêtre sur mesure` |
| URL idéale | `/appuis-de-fenetre/` |

### Page 5 — `chapeaux-de-piliers.html`

| Élément | Valeur |
|---|---|
| Mot-clé principal | `chapeau de pilier acier` |
| Mots-clés secondaires | couvre pilier aluminium, chapeau de pilier sur mesure |
| `<title>` | `Chapeau de Pilier Acier Sur Mesure — Couvre-Pilier RAL | Metal Pliage` |
| `<meta description>` | `Chapeaux de piliers en acier ou aluminium sur mesure. Toutes dimensions, 32 finitions RAL. Fabrication française, livraison sous 10 jours.` |
| `<h1>` | `Chapeaux de piliers sur mesure` |
| URL idéale | `/chapeaux-de-piliers/` |

### Page 6 — `habillages-bandeaux.html`

| Élément | Valeur |
|---|---|
| Mot-clé principal | `habillage bandeau zinc acier` |
| Mots-clés secondaires | habillage façade métal, bandeau acier sur mesure |
| `<title>` | `Habillage Bandeau Zinc & Acier Sur Mesure | Metal Pliage` |
| `<meta description>` | `Habillages de bandeaux en zinc, acier ou aluminium sur mesure. Pliage précis, finitions RAL, devis rapide. Fabricant français.` |
| `<h1>` | `Habillages de bandeaux sur mesure` |
| URL idéale | `/habillages-bandeaux/` |

### Page 7 — `guides.html`

| Élément | Valeur |
|---|---|
| Mot-clé principal | `comment poser une couvertine` |
| Mots-clés secondaires | pose couvertine acier, fixation couvertine, étapes pose |
| `<title>` | `Comment Poser une Couvertine — Guide Complet 2026 | Metal Pliage` |
| `<meta description>` | `Guide pratique pour poser une couvertine acier ou aluminium : outils, fixation, joint, erreurs à éviter. Schémas et vidéos pas à pas.` |
| `<h1>` | `Comment poser une couvertine — Guide complet` |
| URL idéale | `/guides/pose-couvertine/` |

---

## 5. Contenu & pages à créer

### 5.1 Pages produit étoffées (priorité haute)
Pour chaque page produit existante : ajouter 600-1000 mots de contenu unique sous le configurateur.

Structure type :
- Présentation du produit (200 mots)
- Caractéristiques techniques (tableau)
- Choix des matériaux (300 mots)
- Conseils de pose (200 mots)
- FAQ (5 questions)
- CTA final

### 5.2 Pages "ville" (SEO local)

Si tu livres dans toute la France, créer 10-20 pages ville pour capter le trafic local :
- `/couvertine-sur-mesure-lyon/`
- `/couvertine-sur-mesure-bordeaux/`
- `/couvertine-sur-mesure-marseille/`
- etc.

Chaque page : 500-800 mots avec mention de la ville, du département, des chantiers proches, du délai de livraison local.

### 5.3 Blog technique — calendrier éditorial 6 mois

| Mois | Article | Mot-clé visé |
|---|---|---|
| M1 | Comment choisir l'épaisseur d'une couvertine | épaisseur couvertine acier |
| M1 | Couvertine acier vs aluminium : quel matériau choisir ? | couvertine acier ou aluminium |
| M2 | RAL 7016 vs RAL 9005 : guide des couleurs couvertines | couleur couvertine RAL |
| M2 | Pose couvertine : 5 erreurs à éviter | erreur pose couvertine |
| M3 | Couvertine sablée ou lisse : comparatif | couvertine sablée |
| M3 | Quel angle de pliage pour quelle utilisation | angle pliage couvertine |
| M4 | Comment mesurer avant de commander | mesure couvertine |
| M4 | Entretien d'une couvertine acier dans le temps | entretien couvertine |
| M5 | Couvertine pour mur de clôture : guide complet | couvertine mur clôture |
| M5 | Pliage CNC : avantages vs pliage manuel | pliage CNC |
| M6 | Étude de cas : chantier maison contemporaine Lyon | chantier couvertine moderne |
| M6 | Glossaire métallerie : 30 termes à connaître | glossaire métallerie |

**Format type article :** 1000-1500 mots, 3-5 photos, 1-2 schémas techniques, 1 vidéo courte, FAQ en bas, CTA configurateur.

### 5.4 Lead magnets (téléchargements gratuits = capture email)

- [ ] **Nuancier RAL PDF** — toutes les couleurs disponibles, à imprimer
- [ ] **Catalogue PDF complet** — 32 produits avec prix, à envoyer aux pros
- [ ] **Guide PDF "Bien choisir sa couvertine"** — 10 pages, schémas
- [ ] **Calculateur de quantité** — outil web simple (longueur mur → nb couvertines)
- [ ] **Checklist pose couvertine** — 1 page A4 imprimable

---

## 6. Référencement externe & autorité

### 6.1 Annuaires métier (gratuits + payants)

**Gratuits — à faire en priorité :**
- [ ] Pages Jaunes (pagesjaunes.fr)
- [ ] Solocal (ex-PJ Pro)
- [ ] Apple Plans (via Apple Business Connect)
- [ ] Bing Places
- [ ] Yelp France
- [ ] Hoodspot
- [ ] 118000.fr
- [ ] Cylex France

**Spécialisés BTP / Industrie :**
- [ ] Kompass.com (annuaire B2B mondial)
- [ ] Europages.fr
- [ ] Bati-fr.com
- [ ] Batiproduits.com
- [ ] BatiActu (presse + annuaire)
- [ ] Travaux.com
- [ ] Habitatpresto.com
- [ ] Quotatis.fr
- [ ] Mes-Artisans.fr
- [ ] Allotravo.com

**Annuaires locaux (selon ville) :**
- [ ] CCI locale (chambre de commerce)
- [ ] Mairie / page entreprises locales
- [ ] Office de tourisme artisanat
- [ ] Réseaux d'entrepreneurs régionaux (CPME, MEDEF local)

### 6.2 Marketplaces & plateformes de vente

- [ ] **ManoMano Pro** (priorité — clients BTP)
- [ ] **Amazon Pro** (forte visibilité, marges réduites)
- [ ] **Cdiscount Pro**
- [ ] **eBay Pro**
- [ ] **Leroy Merlin Pro Marketplace** (si éligible)
- [ ] **Bricoman / Bricomarché** (marketplace pro)
- [ ] **Made-in-France** (label + marketplace)

### 6.3 Plateformes architectes & déco

- [ ] **Houzz Pro** (architectes, archi d'intérieur, propriétaires aisés)
- [ ] **ArchiExpo** (B2B architecture)
- [ ] **Archicad / BIM Object** (bibliothèque d'objets BIM pour archis)
- [ ] **Pinterest** (compté à part en social mais essentiel pour archi/déco)

### 6.4 Stratégie backlinks (liens entrants)

Google fait confiance à un site **cité ailleurs**. Méthodes :

- [ ] **Échange de liens** avec couvreurs, charpentiers, maçons partenaires
- [ ] **Articles invités** sur blogs BTP / rénovation (1 par mois)
- [ ] **Communiqués de presse** : Communiqué-Presse.com, 24presse.com (gratuit)
- [ ] **HARO / ResponseSource** : répondre à des journalistes qui cherchent des experts métallerie
- [ ] **Wikipedia** : enrichir l'article "Couvertine" avec sources externes (avec parcimonie)
- [ ] **Forums** : ForumConstruire, BricoleurDuDimanche → répondre avec lien (sans spammer)
- [ ] **Reddit** : r/BTP, r/bricolage, r/france (qualité > quantité)
- [ ] **Quora français** : répondre aux questions sur couvertines / pliage
- [ ] **Sponsoring local** : club sportif, association → lien sur leur site

### 6.5 Partenariats artisans (force de vente démultipliée)

- [ ] Identifier 20 couvreurs dans ta région → leur envoyer un échantillon + tarifs pro
- [ ] Programme **revendeur** : -15 % à -25 % avec engagement de volume
- [ ] Programme **prescripteur** : 5 % de commission sur recommandation
- [ ] Cartes de visite à laisser chez les fournisseurs de matériaux (Point.P, Gedimat, Tout Faire)
- [ ] Partenariat menuisiers (pose + couvertine = pack)

### 6.6 Presse & relations publiques

- [ ] Communiqué de lancement → presse régionale (`Le Progrès`, `Le Dauphiné`)
- [ ] Presse spécialisée BTP : `Le Moniteur`, `Bâtirama`, `Batinfo`, `Zepros Bâti`
- [ ] Magazines déco : `Maison & Travaux`, `Côté Maison` (si projet visuel fort)
- [ ] Podcasts BTP / artisans : participer comme invité expert

---

## 7. Réseaux sociaux — quel format pour quelle plateforme

| Plateforme | Cible | Format gagnant | Fréquence |
|---|---|---|---|
| **Instagram** | Particuliers, archis | Reels chantier 30 s, photos avant/après | 3 / sem |
| **TikTok** | Jeunes, viralité | Vidéo machine pli en gros plan, "satisfying" | 2 / sem |
| **Pinterest** | Particuliers en projet | Photos haute qualité, schémas, moodboards | 5-10 pins / sem |
| **LinkedIn** | B2B, archis, promoteurs | Posts études de cas, expertise technique | 1 / sem |
| **YouTube** | SEO long terme + tutos | Vidéos pose, "comment mesurer", visite atelier | 1 / mois |
| **YouTube Shorts** | Découverte rapide | Recyclage Reels Insta | 3 / sem |
| **Facebook** | Local, bouche-à-oreille | Avant/après, partage groupes BTP locaux | 1 / sem |
| **WhatsApp Business** | Conversation directe | Catalogue + devis express | À la demande |
| **X / Twitter** | Veille pro, presse | Partages techniques + actu BTP | 2 / sem (si temps) |
| **Snapchat** | Local jeune | Découverte chantier en direct | Optionnel |

**Règle :** 1 tournage atelier = 5 contenus (Insta + TikTok + Shorts + Pinterest + Facebook).

### Groupes Facebook à rejoindre (gratuits, conversion forte)
- Groupes locaux "Construction maison [ta ville]"
- "Auto-constructeurs France"
- "Rénovation maison ancienne"
- Groupes professionnels couvreurs / maçons

---

## 8. Publicité payante

### 8.1 Google Ads (recherche)
- Budget de test : **150-300 €/mois** sur 4 semaines
- Cibler les mots-clés "achat" : `acheter couvertine acier`, `couvertine sur mesure prix`
- Créer 1 page d'atterrissage dédiée par groupe d'annonces
- Mesurer le coût d'acquisition (CPA) — si CPA < marge brute, scaler
- Activer **Google Shopping** dès que possible (catalogue produits)

### 8.2 Meta Ads (Instagram + Facebook)
- Budget de test : **100-200 €/mois**
- Format : carrousel "avant/après pose" + vidéo atelier
- Cible : propriétaires 35-65 ans, intérêts construction/rénovation, France
- Lookalike audience à partir des clients existants

### 8.3 Pinterest Ads
- Budget : **50 €/mois**
- Pins inspiration "façade moderne couvertine noire"
- Conversion forte sur public féminin 25-55 ans en projet maison

### 8.4 LinkedIn Ads (B2B)
- Budget : **150 €/mois** quand prêt à attaquer le pro
- Cible : architectes, conducteurs de travaux, dirigeants TPE BTP
- Format : post sponsorisé avec étude de cas chantier

### 8.5 YouTube Ads
- Budget : **50-100 €/mois**
- Pré-roll sur chaînes BTP / rénovation
- Vidéo atelier 15 s "skippable"

### 8.6 Retargeting (Pixel Meta + Google Tag)
**Indispensable** dès que tu fais de la pub ou du SEO.
- Visiteur configurateur sans achat → relance Insta/Facebook 3 jours après
- Visiteur fiche produit sans devis → relance Google Display
- Budget : 50-100 €/mois mais **ROI x3 à x5** par rapport à l'acquisition à froid

### 8.7 Push notifications navigateur
- Outil : OneSignal (gratuit jusqu'à 10 000 abonnés)
- Notif "Nouveau RAL disponible" / "Promo flash" → +5 à 10 % de CA récurrent

---

## 9. Marketing visuel

Le visuel **vend** dans la métallerie. Investir ici en priorité.

### À produire en priorité
1. **Photos atelier** (machines de pliage, opérateurs, stocks RAL)
2. **Photos avant/après** sur chantiers réels (avec accord client)
3. **Vidéos courtes** : pliage CNC en action, dépliage carton client, finition laquage
4. **Schémas techniques** propres (tu en as déjà — les valoriser)
5. **Nuancier physique RAL** filmé sous lumière naturelle
6. **Témoignages vidéo** clients (30-60 s)
7. **Time-lapse fabrication** d'une commande (de la commande à l'expédition)
8. **Photos packshot** sur fond blanc pour marketplaces (Amazon, ManoMano)

### Matériel minimum
- Smartphone récent (iPhone 13+ ou Samsung S22+)
- Trépied (30 €)
- Micro-cravate (25 €)
- LED portable (40 €)
- Fond blanc papier 2 m (30 €)

**Total < 150 €** pour une qualité semi-pro.

### Banques d'images à éviter
Ne jamais utiliser de photos stock pour les produits — Google détecte et pénalise. Photos uniques uniquement.

---

## 10. Email marketing & automatisation

- Outil gratuit pour démarrer : **Brevo** (ex-Sendinblue, 300 emails/jour gratuits)
- Capter les emails : popup discrète "Recevez le nuancier RAL PDF" sur le site

### Séquence prospect (devis sans commande)
1. **J+0** : "Merci pour votre devis, voici votre récapitulatif"
2. **J+2** : "Une question ? On vous rappelle"
3. **J+7** : "Toujours intéressé ? -5 % cette semaine"
4. **J+30** : "Nos nouveaux RAL disponibles"

### Séquence client (après commande)
1. **J+0** : "Commande confirmée, suivi colis"
2. **J+3** : "Conseils de pose en vidéo"
3. **J+10** : "Tout s'est bien passé ? Donnez votre avis Google" (lien direct)
4. **J+30** : "Profitez de -10 % sur votre prochaine commande"
5. **J+90** : "Programme parrainage : -X € pour vous et votre filleul"

### Newsletter mensuelle
- 1 nouveauté produit
- 1 chantier client (étude de cas)
- 1 conseil technique
- 1 promo limitée

**Cible long terme** : 2000 abonnés à 12 mois → 5-10 commandes/mois récurrentes.

---

## 11. Conversion & analytics

À installer **avant** de lancer la pub :

| Outil | Rôle | Coût |
|---|---|---|
| Google Search Console | Voir comment Google indexe le site | Gratuit |
| Google Analytics 4 | Mesurer trafic, conversions | Gratuit |
| Microsoft Clarity | Heatmaps + replays sessions | Gratuit |
| Hotjar | Heatmaps avancées + sondages | Gratuit limité |
| Stripe Dashboard | Suivi ventes en temps réel | Inclus |
| Tag Manager | Centraliser tous les tags (Pixel, GA, etc.) | Gratuit |
| Bing Webmaster | Equiv. Search Console pour Bing | Gratuit |
| Brevo | Email + SMS marketing | Gratuit jusqu'à 300/j |

### Optimisation conversion (CRO)
- [ ] Bouton "Demander un devis" toujours visible (sticky)
- [ ] Numéro de téléphone cliquable en haut + footer
- [ ] Chat WhatsApp Business (Meta gratuit)
- [ ] Avis clients visibles dès la home
- [ ] Garanties : "Devis en 24 h", "Livraison 10 j", "Made in France"
- [ ] A/B test sur le bouton CTA (couleur, texte)

---

## 12. Avis & preuve sociale

- [ ] Activer la collecte d'avis Google (lien direct dans emails post-livraison)
- [ ] Compte Trustpilot (gratuit) → widget intégré sur le site
- [ ] Section "Ils nous font confiance" sur l'accueil avec logos clients pros
- [ ] Études de cas chantier (1 par mois sur le blog)
- [ ] Vidéos témoignages courts (30 s) intégrées sur fiches produit
- [ ] Avis Pages Jaunes
- [ ] Avis Facebook
- [ ] Étoiles Google dans les résultats de recherche (via JSON-LD `Review`)
- [ ] **Verisign / Norton** trust badges sur la page de paiement

**Stratégie :** atteindre **20 avis Google 5 étoiles en 6 mois** → +30 % de CTR sur Google.

---

## 13. Actions hors ligne & guérilla

Souvent négligées, fort ROI pour un artisan métal.

### 13.1 QR codes physiques
- [ ] QR code sur le **camion** (autocollant XXL) → renvoie vers le site
- [ ] QR code sur **factures et devis** → demande d'avis Google
- [ ] QR code sur **vitrine atelier** → catalogue mobile
- [ ] QR code sur **goodies** distribués sur chantier

### 13.2 Salons & événements BTP
- [ ] **Batimat** (Paris, biennal) — le plus gros salon BTP français
- [ ] **Artibat** (Rennes, biennal) — Grand Ouest
- [ ] **Salon de l'Habitat** local (votre ville)
- [ ] **Foire de Lyon** / Foire locale
- [ ] **Journées Portes Ouvertes** atelier (1-2 fois/an, communication locale)

Coût stand petit format : 1500-3000 € → ROI excellent si bien préparé.

### 13.3 Marketing direct local
- [ ] Flyers chez fournisseurs matériaux (Point.P, Gedimat, Tout Faire)
- [ ] Cartes de visite **NFC** (modernes, 10 € la carte)
- [ ] Affiche A3 dans la zone d'activité de l'atelier
- [ ] Sponsoring club sportif local (visibilité maillots)
- [ ] Bâche publicitaire sur la façade de l'atelier

### 13.4 Goodies & merchandising
- [ ] Stylos, mètres ruban, casquettes brandés Metal Pliage
- [ ] Petit échantillon RAL chez les couvreurs partenaires
- [ ] Calendriers professionnels (à offrir aux pros en fin d'année)

---

## 14. Stratégie B2B (revendeurs, architectes, promoteurs)

Souvent **40-60 % du CA** dans la métallerie. À ne pas négliger.

### 14.1 Programme revendeur
- Tarifs pro : -15 % à -25 % selon volume annuel
- Compte client dédié sur le site
- Espace téléchargement : catalogue PDF, fiches techniques, photos HD
- Délai de paiement 30 jours pour les comptes établis

### 14.2 Cible architectes
- [ ] Bibliothèque BIM (Revit, Archicad) — fichiers .rfa téléchargeables
- [ ] Catalogue technique PDF (matériaux, normes, tolérances)
- [ ] Présence sur Houzz Pro
- [ ] Newsletter dédiée archis (1/trimestre)
- [ ] Webinaire technique 1/an (live Zoom + replay YouTube)

### 14.3 Cible promoteurs / constructeurs maison
- [ ] Visite commerciale chez les 20 plus gros constructeurs régionaux
- [ ] Contrats-cadres annuels avec remises volume
- [ ] Études de cas chantiers grands volumes
- [ ] Présence sur appels d'offres publics (BOAMP)

---

## 15. Plan d'action — 90 jours

### 🔴 Semaines 1-2 — Fondations techniques
- [ ] Acheter et pointer `metalpliage.fr`
- [ ] Hébergement + HTTPS
- [ ] `robots.txt` + `sitemap.xml`
- [ ] Mentions légales + CGV + cookies
- [ ] Compléter JSON-LD (téléphone, adresse, horaires)
- [ ] Brancher Search Console + Bing Webmaster + GA4 + Clarity
- [ ] `alt` sur toutes les images
- [ ] Lighthouse > 90 sur mobile
- [ ] **Appliquer l'audit mots-clés des 7 pages principales** (section 4)

### 🟠 Semaines 3-4 — Présence & visuels
- [ ] Créer Google Business Profile + 10 photos
- [ ] Créer comptes Insta, TikTok, Pinterest, LinkedIn, YouTube
- [ ] Tournage atelier : 30 photos + 10 vidéos courtes
- [ ] Publier 1er post sur chaque réseau
- [ ] Inscription 5 annuaires métier
- [ ] Brevo configuré + 1ère séquence email
- [ ] Pixel Meta + Google Tag installés
- [ ] WhatsApp Business activé

### 🟢 Semaines 5-8 — Contenu SEO
- [ ] 4 articles de blog (1 / sem) sur les sujets longue traîne
- [ ] Étoffer 4 fiches produit (texte + photos + schémas)
- [ ] 12 posts Insta + 8 TikTok + 30 pins Pinterest
- [ ] Demander 5 premiers avis Google à anciens clients
- [ ] Créer le **nuancier RAL PDF** (lead magnet)
- [ ] Listing sur ManoMano Pro

### 🟢 Semaines 9-12 — Acquisition payante
- [ ] Lancer Google Ads (150 €/mois, test 4 sem)
- [ ] Lancer Meta Ads (100 €/mois, test 4 sem)
- [ ] Activer le retargeting
- [ ] Optimiser pages d'atterrissage en fonction des heatmaps
- [ ] Bilan : CPA, ROAS, taux de conversion → décider scale ou pivot

---

## 16. Plan d'action — 6 mois

### Mois 4 — Approfondir le SEO
- [ ] 4 articles de blog supplémentaires
- [ ] 5 pages "ville" (SEO local)
- [ ] Optimiser pages position 11-20 dans Search Console
- [ ] Lancer LinkedIn Ads (B2B)
- [ ] Premier emailing newsletter mensuelle

### Mois 5 — Élargir le canal social
- [ ] YouTube : 1ère vidéo longue (visite atelier 5 min)
- [ ] Pinterest : 100 pins cumulés
- [ ] Premier partenariat micro-influenceur (rénovateur Insta)
- [ ] Listing Amazon Pro

### Mois 6 — B2B & PR
- [ ] Programme revendeur lancé
- [ ] Premier communiqué de presse régional
- [ ] Bibliothèque BIM disponible (Revit/Archicad)
- [ ] Préparer participation 1er salon BTP
- [ ] Bilan global : trafic, ventes, ROI par canal

---

## 17. Routine hebdo

```
LUNDI       → 1 post Insta + 1 pin Pinterest
MARDI       → 1 post LinkedIn (B2B)
MERCREDI    → 1 vidéo TikTok + 1 Reel Insta (même rush)
JEUDI       → 1 article blog OU 1 fiche produit étoffée
VENDREDI    → 1 post Google Business Profile + relances email
SAMEDI      → Réponses commentaires/messages + avis Google
DIMANCHE    → Bilan KPIs + planification semaine suivante
```

**Temps estimé :** 5-8 h / semaine si seul, 2-3 h si délégué partiellement.

---

## 18. Budget détaillé

### Premier trimestre

| Poste | Coût |
|---|---|
| Domaine + hébergement | 80 €/an |
| Brevo (email) | 0 € (puis ~25 €/mois si > 300/j) |
| Annuaires métier (payants) | 200-500 € |
| Trépied + micro + LED | 100 € |
| Google Ads (test 4 sem) | 150-300 € |
| Meta Ads (test 4 sem) | 100-200 € |
| Pinterest Ads | 50 € |
| Retargeting | 50-100 € |
| Outils SEO (Ubersuggest, etc.) | 0-30 €/mois |
| **Total trimestre 1** | **~700-1400 €** |

### Budget mensuel à vitesse de croisière (mois 4+)

| Poste | Coût mensuel |
|---|---|
| Hébergement + outils | 30 € |
| Email Brevo | 25 € |
| Google Ads | 300-800 € |
| Meta Ads | 200-500 € |
| Pinterest Ads | 50 € |
| LinkedIn Ads (B2B) | 150 € |
| Retargeting | 100 € |
| Influenceurs micro | 100-300 € |
| Annuaires payants | 50 € |
| **Total mensuel** | **~1000-2000 €** |

**Règle :** ne jamais dépenser plus en pub que **20-30 % du CA** généré par cette pub.

---

## 19. KPIs & tableau de bord

À suivre chaque **semaine** :

| Indicateur | Cible mois 3 | Cible mois 6 | Cible mois 12 |
|---|---|---|---|
| Visiteurs uniques / mois | 200 | 1 000 | 5 000 |
| Pages vues / visite | > 3 | > 4 | > 5 |
| Taux de rebond | < 65 % | < 60 % | < 55 % |
| Devis envoyés / mois | 5 | 30 | 100 |
| Commandes Stripe / mois | 1-2 | 8-12 | 30-50 |
| Taux de conversion | 0.5 % | 1 % | 1.5-2 % |
| Avis Google | 5 | 20 | 50+ |
| Followers Insta | 100 | 500 | 2 000 |
| Abonnés newsletter | 50 | 300 | 1 500 |
| Position SEO mots-clés top 10 | 0-2 | 5-10 | 20+ |
| CPA (coût acquisition) | < 50 € | < 30 € | < 20 € |

---

## 20. Erreurs à éviter

- ❌ Lancer des pubs **avant** que le site soit techniquement propre (tu paies pour rien)
- ❌ Vouloir être sur **toutes** les plateformes en même temps (commence par Insta + Pinterest + Google)
- ❌ Ignorer les avis (1 avis négatif sans réponse = client perdu)
- ❌ Photos floues / mal cadrées (mieux vaut 5 belles photos que 50 moyennes)
- ❌ Copier les textes des concurrents (Google pénalise le duplicate)
- ❌ Oublier le mobile (60-70 % du trafic FR vient du smartphone)
- ❌ Mesurer trop tôt : laisser 4-6 semaines avant de juger une action SEO
- ❌ Utiliser des images stock pour les produits
- ❌ Forcer le mot-clé dans le texte (Google détecte la sur-optimisation)
- ❌ Acheter des backlinks en masse (pénalité garantie)
- ❌ Négliger les CGV / mentions légales (illégal en France + perte de confiance)
- ❌ Ne pas répondre aux messages sous 24 h (concurrent gagne le client)
- ❌ Vouloir tout déléguer trop tôt (apprendre à faire avant de payer quelqu'un)

---

## 21. Checklist de lancement

À faire **avant** d'annoncer le site partout :

### Technique
- [ ] HTTPS actif
- [ ] Toutes les pages se chargent en < 3 s sur mobile
- [ ] `robots.txt` + `sitemap.xml` en place
- [ ] Search Console + GA4 + Clarity branchés
- [ ] Pixel Meta + Google Tag installés
- [ ] 404 personnalisée
- [ ] Favicon + icônes Apple
- [ ] Formulaires testés (devis, contact)
- [ ] Paiement Stripe testé en mode prod
- [ ] Email transactionnel testé (confirmation commande)

### Contenu
- [ ] 7 pages principales optimisées (audit section 4 appliqué)
- [ ] Mentions légales + CGV + politique cookies
- [ ] Page "À propos" avec photos atelier + équipe
- [ ] Page contact avec adresse + téléphone + plan
- [ ] Au moins 5 articles de blog publiés
- [ ] Nuancier RAL PDF téléchargeable

### Présence externe
- [ ] Google Business Profile validé
- [ ] Comptes Insta, TikTok, Pinterest, LinkedIn créés
- [ ] 5 annuaires métier validés
- [ ] WhatsApp Business activé
- [ ] Au moins 5 avis Google publiés

### Marketing
- [ ] Brevo configuré + 1ère liste créée
- [ ] Séquence email post-devis active
- [ ] Première campagne Google Ads prête (mais pas lancée)
- [ ] Première campagne Meta prête (mais pas lancée)

---

## 22. Prochaine action concrète

**Cette semaine, choisir UNE chose et la faire jusqu'au bout :**

1. Acheter le domaine + mettre le site en ligne, OU
2. Créer la fiche Google Business Profile, OU
3. Faire la séance photo atelier (smartphone + trépied), OU
4. Appliquer l'audit mots-clés des 7 pages principales (section 4)

> 👉 Le reste découle. Mieux vaut 1 action terminée que 10 commencées.

---

*Document créé le 2026-05-13 — à mettre à jour mensuellement selon les résultats.*
*Auteur : plan élaboré avec Claude — ajustable selon retours terrain.*
