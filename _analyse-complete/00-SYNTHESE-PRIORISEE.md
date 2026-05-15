# SYNTHÈSE PRIORISÉE — Metal Pliage

**Date** : 2026-05-15
**Sources** : 3 audits techniques + 4 personas clients simulés = 7 rapports indépendants
**Méthode** : croisement systématique des findings, isolation des thèmes convergents (mentionnés par 3+ sources)

---

## TL;DR — 1 minute

Le site Metal Pliage est **techniquement propre et esthétiquement sobre**, avec des configurateurs interactifs et un design system cohérent. Mais il **n'est pas prêt pour vendre en l'état** à cause de **6 problèmes structurels** qui touchent à la fois SEO, conversion, confiance et conformité légale :

1. **Formulaire contact mort** en production → 100% des leads tombent dans le vide.
2. **Trust signals quasi inexistants** : pas de SIRET, pas d'adresse, pas un seul avis client, pas une photo de chantier réel.
3. **Pages légales non conformes** (mentions et confidentialité = copier-coller des CGV) → risque LCEN + RGPD.
4. **60 Mo de photos non optimisées** sur la home → LCP > 5s, Lighthouse < 40, déclassement Google.
5. **SEO foncier absent** : pas de sitemap.xml, robots.txt, canonical, og:image, favicon. Schema.org pointe sur le mauvais domaine.
6. **Configurateur trop technique pour les particuliers** + **inadapté aux pros** (pas d'espace pro, pas de devis B2B, pas d'upload plan).

**Tous les personas testés ont décliné l'achat en ligne immédiat** — ils auraient appelé avant. C'est la définition d'un site qui perd ses ventes.

---

## 1. Les 6 blocages structurels (convergence 3+ sources)

### 🔴 BLOCAGE 1 — Trust / preuves sociales totalement absentes
**Mentionné par : audit SEO+Marketing, audit technique (footer), persona Pierre, persona Marc, persona Sophie, persona Karim**

Ce qui manque :
- ❌ SIRET, raison sociale, statut juridique, capital, RCS, TVA intra
- ❌ Adresse précise de l'atelier (juste "France")
- ❌ Numéro de téléphone fixe (uniquement un 06)
- ❌ Avis Google, Trustpilot ou Avis Vérifiés (zéro étoile)
- ❌ Témoignages clients écrits
- ❌ Photos de réalisations réelles (chantiers terminés)
- ❌ Note moyenne ou compteur "X chantiers livrés"
- ❌ Certifications (Origine France Garantie, Qualibat…)
- ❌ Page "Réalisations" / "Nos chantiers"

**Conséquence directe** : Pierre (particulier) refuse d'acheter pour 700 €. Marc (pro) doute de la capacité à encaisser un volume B2B avec un simple 06. Sophie (architecte) ne contacte pas faute de portfolio. Karim (paysagiste) ne peut pas vendre à sa cliente sans visuels d'inspiration.

**Risque chiffré** : taux de conversion plombé de **-20 à -30 %** (étude BrightLocal 2024 : 87 % des acheteurs consultent les avis avant achat).

---

### 🔴 BLOCAGE 2 — Formulaire contact non fonctionnel en production
**Mentionné par : audit technique (CR-1), audit SEO+Marketing, persona Marc, persona Karim, brief utilisateur**

Le formulaire de `contact.html` poste vers `POST /api/contact` qui n'existe que dans `server.js` (backend local Express). En production sur GitHub Pages, toute soumission renvoie 404 et le client voit `alert("Erreur d'envoi du message")`. **Tous les leads sont perdus depuis la mise en ligne.**

**Pareil pour le panier Stripe** (`cart.js` poste vers `/api/create-checkout-session` qui n'existe pas) — le paiement est cassé.

**Solution rapide (déjà appliquée sur `forme-libre.html`)** : basculer vers FormSubmit ou Web3Forms — service no-code gratuit qui forward vers `contact@metal-pliage.fr`.

---

### 🔴 BLOCAGE 3 — Non-conformité légale grave (LCEN + RGPD + Code conso)
**Mentionné par : audit SEO+Marketing (§6), persona Pierre**

État réel des pages légales :
- `mentions-legales.html` → **contenu identique aux CGV** (copier-coller raté)
- `confidentialite.html` → texte commence par *« Les présentes Politique de Confidentialité (CGV) régissent les relations contractuelles… »* (manifestement copié des CGV, mots-clés RGPD absents)
- `cgv.html` → cohérent mais manque droit de rétractation 14 j (même pour le sur-mesure, on doit mentionner l'exception)
- `livraison-retours.html` → règles restrictives (5 j seulement pour signaler un problème) sans contre-balance légale

**Risques** :
- LCEN art. 6 : amende possible (75 000 € personne morale, 1 an de prison personne physique).
- RGPD : sanctions CNIL.
- Code conso B2C : nullité de clauses abusives, médiation obligatoire non prévue.

**Action urgente** : refonte complète des 3 pages avec mentions obligatoires correctes (cf annexe Solutions).

---

### 🔴 BLOCAGE 4 — Performance images catastrophique
**Mentionné par : audit technique (CR-3), audit SEO+Marketing (§1.6)**

- **19 slides PNG/JPG de 1,7 à 2,8 Mo** chacune dans le hero `index.html`
- Total `assets/photos/` = **64 Mo**
- Total `assets/video/` = **31 Mo** (vidéo hero `mp4` de 27 Mo)
- **Zéro fichier WebP / AVIF** dans tout le projet
- Aucune image n'a `srcset`, `width`, `height` (CLS dégradé)
- Seules 5 sur 26 `<img>` ont `loading="lazy"`

**Impact estimé** :
- LCP > 5 s sur 4G mobile (limite Google : 2,5 s)
- Lighthouse Performance attendu : < 40 / 100
- Google déclasse les pages lentes → -20 à -40 % de trafic organique sur mots-clés concurrentiels

**Gain potentiel** : passage en WebP qualité 80 → **80 % de poids en moins** (60 Mo → 5-8 Mo) → Lighthouse 90+, LCP < 2 s.

---

### 🔴 BLOCAGE 5 — SEO foncier inexistant
**Mentionné par : audit technique (CR-2, CR-5, MA-1/2/3), audit SEO+Marketing (§1.1 à §1.9)**

Manquants confirmés via WebFetch :
- ❌ `sitemap.xml` → 404
- ❌ `robots.txt` → 404
- ❌ Favicon (icône grise dans les onglets)
- ❌ `og:image` et `twitter:image` → partages sociaux cassés sur LinkedIn/WhatsApp/Facebook
- ❌ Balises `canonical` sur toutes les pages (0 occurrence)
- ❌ Schema.org Product, FAQPage, BreadcrumbList (présent uniquement LocalBusiness sur home)

**Bug critique** : `index.html:29` déclare `"url": "https://metalpliage.fr"` (sans tiret) alors que le site vit sur `metal-pliage.fr` → le Knowledge Graph Google se rattache à un domaine inexistant.

**Bonus** : 60+ pages parasites indexables (`_dev/` 39 fichiers, `_mockup/` 19 fichiers, `*-backup-*.html`, `couvertines-old-catalogue.html` avec 20+ liens cassés) qui diluent le SEO.

---

### 🔴 BLOCAGE 6 — Configurateurs : friction massive pour les non-experts
**Mentionné par : audit UX configurateurs (intégral), persona Pierre, persona Marc, persona Karim**

**Configurateur couvertine (`configurateur.html`)** :
- Champ "C — Largeur de tôle" incompris (le hint cryptique ne dit pas que c'est le développé total)
- Longueur max 3 000 mm sans message proactif "Pour un muret de 6 m, prévoir 2 longueurs + 1 éclisse"
- Bouton "Ajouter au panier" désactivé sans tooltip indiquant ce qui manque

**Configurateur pliage (`configurateur-pliage.html`)** :
- Forme "Appui de fenêtre" : "Nez 92°", "Pente 10°", "Pince 12 mm" sans aide visuelle
- Forme Z : champ "Hauteur de l'âme" (jargon technique)
- Une seule référence d'accessoire (vis) — pas d'éclisses, talons, angles intégrés
- Reset silencieux quand on choisit Inox puis Appui de fenêtre (incompatibles)

**Page Accessoires (`accessoires.html`)** :
- **CRITIQUE** : aucun prix affiché, aucun bouton "Ajouter au panier" → fuite de conversion totale
- Aucun schéma technique alors que les SVG existent dans le configurateur

**Page commande-confirmee.html** :
- Pas de numéro de commande affiché à l'écran
- Pas de récap des articles commandés
- Pas de timeline ("Commande reçue → Fabrication → Expédition → Livrée")

**Incohérences transverses signalées par 3 sources** :
- 32 RAL annoncés sur la home / 19 RAL sur appuis-de-fenetre / 5 RAL dans le configurateur
- 3 000 mm max sur page couvertines / 6 000 mm dans le configurateur pliage
- HT par défaut sur couvertines / TTC par défaut dans le configurateur

---

## 2. Friction spécifique par profil client (synthèse des 4 personas)

| Profil | Probabilité d'achat en ligne | Blocage n°1 perçu | Action manquante |
|---|---|---|---|
| **Pierre — particulier débutant** (muret 12m, 700€ budget) | 0 % | Aucun avis client + mentions légales vides | Mode "Je veux couvrir mon muret" guidé + 10 avis Google |
| **Marc — artisan maçon** (40-80ml/mois, B2B) | 30 % après appel | Pas d'espace pro + remise volume non quantifiée | Espace pro + grille tarifaire publique + paiement 30j |
| **Sophie — architecte** (projets pointus, RAL spécifiques) | < 20 % | Aucune réalisation visible + pas d'upload plan | Page Architectes + portfolio 10 chantiers + DWG/PDF |
| **Karim — paysagiste mobile** (Pinterest, cliente déco) | 10 % | Aucune photo inspirante + pas de "jardinière" sur le site | Galerie photo style Pinterest + extension catalogue mobilier |

**Constat** : **aucun des 4 personas ne déclenche un achat en ligne immédiat.** Le site fonctionne au mieux comme un déclencheur d'appel téléphonique — ce qui n'est pas son objectif affiché ("commandez en ligne en 3 min").

---

## 3. Roadmap priorisée (effort vs impact)

### Phase 1 — Sprint URGENT (J0 à J3, ~10h de travail)
**Objectif : réparer ce qui est cassé / illégal / bloquant pour la conversion**

| # | Action | Effort | Impact | Bloqueur ? |
|---|---|---|---|---|
| 1.1 | Basculer le formulaire contact sur FormSubmit (`contact@metal-pliage.fr`) | 1 h | CRITIQUE | OUI — leads perdus aujourd'hui |
| 1.2 | Corriger `schema.org` : `metalpliage.fr` → `metal-pliage.fr` (`index.html:29`) | 5 min | CRITIQUE | Knowledge Graph |
| 1.3 | Créer `sitemap.xml` + `robots.txt` à la racine | 30 min | MAJEUR | Indexation Google |
| 1.4 | Supprimer fichiers backup + `_dev/` + `_mockup/` du repo + .gitignore | 1 h | MAJEUR | Pollution SEO |
| 1.5 | Refondre mentions-legales.html + confidentialite.html (conformité LCEN + RGPD) | 3 h | CRITIQUE | Risque légal |
| 1.6 | Ajouter SIRET + adresse atelier + raison sociale dans le footer | 30 min | CRITIQUE | Trust |
| 1.7 | Créer favicon.svg / favicon-32.png / apple-touch-icon | 30 min | MAJEUR | Branding |
| 1.8 | Ajouter `<link rel="canonical">` sur toutes les pages | 30 min | MAJEUR | SEO |
| 1.9 | Désactiver le panier Stripe (clé test + endpoint mort) ou décider du modèle | 1 h | MAJEUR | Paiement cassé |
| 1.10 | Aligner les incohérences chiffrées (32 RAL / longueurs max / HT vs TTC) | 1 h | MAJEUR | Cohérence |

**Total : ~10 h pour repasser au statut "site qui peut accepter une commande sans casser"**.

### Phase 2 — Sprint TRUST (J4 à J10, ~25h)
**Objectif : crédibiliser le site pour qu'un visiteur tiède devienne client**

| # | Action | Effort |
|---|---|---|
| 2.1 | Solliciter 10 avis Google clients récents (mail + code promo -10 %) | 2 h + 2 sem. wait |
| 2.2 | Demander à 5 clients photos de chantiers terminés (envoyer photographe ou autoriser téléphone) | 4 h + 2 sem. wait |
| 2.3 | Créer page "Réalisations" / "Nos chantiers" avec galerie 10 photos + textes courts | 8 h |
| 2.4 | Créer page "L'atelier" avec photos vraies de l'atelier + machines + équipe | 4 h |
| 2.5 | Ajouter widget Google Reviews sur la home (sous le hero) | 1 h |
| 2.6 | Bouton WhatsApp sticky mobile (`wa.me/33643218201`) | 1 h |
| 2.7 | Ajouter mentions Made in France + Origine France Garantie (label visuel) | 2 h |
| 2.8 | Ajouter bandeau cookies RGPD (Axeptio gratuit ou Tarteaucitron) | 3 h |

### Phase 3 — Sprint PERF + SEO (J11 à J18, ~25h)
**Objectif : faire passer Lighthouse de 40 à 90+ et capturer le trafic organique**

| # | Action | Effort |
|---|---|---|
| 3.1 | Compresser toutes les images en WebP (Squoosh) → 60 Mo à 5-8 Mo | 4 h |
| 3.2 | Ajouter `loading="lazy"`, `decoding="async"`, `width`/`height` sur toutes les `<img>` | 2 h |
| 3.3 | Migrer les `background-image` du hero vers `<img srcset>` avec fetchpriority="high" sur la 1re | 4 h |
| 3.4 | Renommer les images en slugs SEO (`couvertine-acier-ral-7016.webp`) | 1 h |
| 3.5 | Ajouter Schema.org Product sur les 5 fiches produits + FAQPage sur guides | 4 h |
| 3.6 | Ajouter BreadcrumbList sur toutes les sous-pages | 2 h |
| 3.7 | Ajouter OG + Twitter Card avec og:image dédiée sur chaque page | 3 h |
| 3.8 | Corriger les H1 (mots-clés au lieu du nom de marque) | 1 h |
| 3.9 | Étoffer le contenu de couvertines.html à 700-800 mots + FAQ | 3 h |
| 3.10 | Plan éditorial : rédiger 2 articles SEO (couvertine acier vs alu + calcul quantité) | 8 h |

### Phase 4 — Sprint UX CONFIGURATEUR (J19 à J30, ~40h)
**Objectif : récupérer les abandons silencieux dans le tunnel**

| # | Action | Effort |
|---|---|---|
| 4.1 | Stepper sticky horizontal cliquable en haut des configurateurs | 4 h |
| 4.2 | Sauvegarde localStorage + URL paramétrable `?conf=base64` | 6 h |
| 4.3 | Helper proactif "Pour 6 m, prévoir 2× 3000 mm + 1 éclisse" sur étape Dimensions | 2 h |
| 4.4 | Tooltips "?" sur tous les champs jargonneux (C, R, A, nez, pente, âme, développé) | 4 h |
| 4.5 | Tooltip dynamique sur bouton CTA disabled ("Il manque : couleur") | 2 h |
| 4.6 | Mode "Je veux couvrir mon muret" (assistant 3 questions → préremplit le configurateur) | 8 h |
| 4.7 | Page accessoires : ajouter prix unitaires + bouton "Ajouter à ma config" | 6 h |
| 4.8 | Intégrer éclisses + talons + angles dans le configurateur pliage | 4 h |
| 4.9 | Refonte page `commande-confirmee.html` : numéro commande, récap, timeline 4 étapes | 4 h |

### Phase 5 — Sprint B2B (J31+, ~50h)
**Objectif : ouvrir le canal Marc & Sophie**

- Espace pro avec compte (SIRET, historique, adresses livraison multiples)
- Grille tarifaire dégressive publique (10-30ml, 30-60ml, 60ml+)
- Devis sur plan en upload (DWG/PDF/DXF)
- Devis PDF téléchargeable avec mentions HT + TVA
- Paiement à 30 jours fin de mois sur acceptation dossier
- Page Architectes dédiée + portfolio par typologie de projet

---

## 4. Indicateurs cibles post-corrections (3 mois)

| Métrique | Avant (estimé) | Cible après Phase 1+2+3 |
|---|---|---|
| Lighthouse Performance | < 40 | > 85 |
| LCP (4G mobile) | > 5 s | < 2,5 s |
| Taux conversion visiteur → lead | < 1 % | 3-5 % |
| Taux abandon configurateur | ~70 % (estimé) | 40-50 % |
| Pages indexées Google | ~10 (avec parasites) | 12 propres + sitemap |
| Avis Google moyens | 0 | 10-15 |
| Trust signals visibles home | 1 (Made in France) | 6+ |

---

## 5. Top 10 quick wins absolus (à faire en premier)

1. ⚡ **Réparer le formulaire contact** (FormSubmit) → 1 h, récupère 100 % des leads
2. ⚡ **Schema.org `metalpliage.fr` → `metal-pliage.fr`** → 5 min
3. ⚡ **Ajouter SIRET + adresse footer** → 30 min, débloque la confiance
4. ⚡ **Créer `sitemap.xml` + `robots.txt`** → 30 min
5. ⚡ **Supprimer fichiers backup + `_dev/` + `_mockup/`** → 1 h
6. ⚡ **Refondre 3 pages légales** → 3 h, sort de la zone illégale
7. ⚡ **Compresser images en WebP** (Squoosh batch) → 4 h, gain Lighthouse massif
8. ⚡ **Bouton WhatsApp sticky mobile** → 1 h, +15-20 % conversion cible artisans
9. ⚡ **Aligner les chiffres (RAL, longueurs, HT/TTC)** → 1 h, cohérence interne
10. ⚡ **Solliciter 10 avis Google** → 2 h actif + 2 sem. wait

**Total : 14 h actif → débloque 80 % des frictions critiques.**

---

## 6. Risques résiduels après Phase 1

Même corrigés des 6 blocages structurels, deux gros chantiers restent :

1. **Pas de vraies photos de chantier** : sans cela, Sophie et Karim ne reviendront pas. À planifier **maintenant** (commencer la collecte aujourd'hui, ça prend 2 à 4 semaines).
2. **Pas de mode B2B** : Marc ne deviendra pas client récurrent sans grille tarifaire publique + paiement différé. Décision commerciale à prendre côté gestion.

---

*Fin de la synthèse. Voir les 7 rapports détaillés dans `_analyse-complete/audits/` et `_analyse-complete/personas/` pour le détail de chaque finding.*
