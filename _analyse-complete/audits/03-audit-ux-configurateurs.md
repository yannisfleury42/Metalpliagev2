# Audit UX — Configurateurs Metal Pliage

**Site audité :** https://metal-pliage.fr
**Date :** 2026-05-15
**Périmètre :** `configurateur-pliage.html` (838 l.), `configurateur.html` (961 l. — c'est ce fichier qui sert pour Couvertine), `couvertines.html` (275 l.), `accessoires.html` (347 l.), `commande-confirmee.html`. JS : `js/configurateur.js` (764 l.), `js/pliage.js` (865 l.), `js/cart.js` (262 l.).
**Référentiels mentaux :** Tylko (configurateur meuble), Made.com (sofa builder), Nike By You, Schüco (menuiserie), Roto (couvertines), KingZip.

---

## 1. Vue d'ensemble — ce qu'on a vraiment

Le site propose en réalité **deux configurateurs distincts**, plus une page accessoires :

| Page | Rôle réel | Architecture |
|---|---|---|
| `couvertines.html` | Vitrine produit + bouton "Lancer le configurateur" | Statique, pas de config |
| `configurateur.html` | **Configurateur Couvertine** (acier 0,75 / alu 1,5, 4 étapes : Matière → Dimensions → Couleur → Accessoires) | 961 lignes, riches schémas SVG perspective des accessoires (talon, éclisse, angle, cornière), prix temps réel, sidebar récap |
| `configurateur-pliage.html` | **Configurateur Pliage** (formes U/L/Z/Appui, 6 étapes : Forme → Matière+Épaisseur → Dimensions+Sens laquage → Couleur → Accessoires (vis) → Quantité) | 838 lignes, SVG dynamique du profil, switch "sens de laquage" pédagogique |
| `accessoires.html` | Catalogue éditorial des 7 accessoires, **sans achat direct** (renvoie au formulaire de contact) | 347 lignes, aucun schéma technique |
| `commande-confirmee.html` | Page post-paiement Stripe : message texte, délai 5-10 j ouvrés, lien retour boutique/accueil | 114 lignes, très sobre |

**Tunnel d'achat constaté :** ajout au panier → drawer panier (FAB en bas à droite) → "Passer la commande" → POST `/api/create-checkout-session` → `stripe.redirectToCheckout` → `commande-confirmee.html`.

---

## 2. Audit du **Configurateur Couvertine** (`configurateur.html`)

### Compréhension

- Étape 1 — Matière : excellente lisibilité (deux grosses cartes Acier/Alu, épaisseur fixe lisible, micro-baseline "Résistance élevée, prix compétitif"). **Note 8/10.**
- Étape 2 — Dimensions : 4 champs (B largeur support, A hauteur retour, C largeur tôle, L longueur) + R rejet d'eau fixe à 10 mm. Le SVG temps réel avec muret béton et rejet à 45° est **très bon** pour le novice.
  - **Friction MAJEURE :** le champ **C "Largeur de tôle"** n'est compris ni par le particulier ni par l'artisan ; le hint "B+50 par défaut · max 400 mm" n'explique pas le pourquoi (= largeur totale développée incluant les deux retours). Un particulier modifie C sans savoir si ça change le rendu, et risque de saisir B et C identiques, créant une couvertine sans dépassement.
  - **Friction MINEURE :** le label "R 10 mm (fixe)" pose la question "pourquoi ce n'est pas modifiable ?" sans réponse.
- Étape 3 — Couleur : 5 RAL avec swatches + lien "Autre RAL — Demander un devis". Très clair. **Note 9/10.**
- Étape 4 — Accessoires : 4 blocs (talon, éclisse, angle, cornière) avec **schémas SVG 3D perspective remarquables** (gradients, ombres, hachures béton, parpaings). Le talon avec sa flèche "glisse dans le U" est pédagogique. **Note 9/10.**

### Jargon technique relevé
"développé", "rejet d'eau", "muret", "talon embout", "éclisse de jonction", "cornière de départ", "angle rentrant/sortant", "RAL", "tôle". Tout est défini textuellement sauf "développé" (affiché brut dans l'info-bar et le récap, sans tooltip).

### Validation / feedback
- Inputs HTML5 `min`/`max`/`step` corrects. Pas d'aide contextuelle si valeur invalide — l'input passe rouge en CSS, sans message.
- Pas de message d'erreur explicite type "C doit être ≥ B+40 pour permettre les retours".
- Le bouton "Ajouter au panier" est désactivé tant que tout n'est pas valide, **sans tooltip indiquant ce qui manque.** L'utilisateur peut rester bloqué sans comprendre pourquoi.

### Calcul prix temps réel
- Présent et lisible : prix HT (gros) + TTC (petit), répété dans la sidebar et dans le step 5. Mention "Prix indicatif HT, hors livraison" en bas.
- Pas de détail dépliable "prix matière X € + accessoires Y € + min 35 €". L'utilisateur ne peut pas auditer le prix.

### Progression
- Pas de **stepper visuel** type "1·2·3·4·5·6" sticky en haut. Les sections sont juste désactivées via `step-section--disabled`.
- Pas de bouton "← Retour à l'étape précédente". On peut scroller, mais aucun fil rouge ne dit où on en est.
- Pas de pourcentage de complétion.

### Mobile
- Media queries présentes (900px et 600px). Sidebar passe au-dessus du contenu sur mobile (`order: -1`). Sur smartphone, **la sidebar récap perd son caractère "sticky"** et l'utilisateur doit remonter pour voir le prix.
- Le FAB panier (bas-droite) reste accessible.
- Les schémas SVG d'accessoires (viewBox 600×300) peuvent devenir illisibles en dessous de 400 px.

### Sauvegarde / reprise
- **Aucune** : pas de `localStorage`, pas d'URL paramétrée pour partager une config. Si l'utilisateur ferme l'onglet, tout est perdu.

### Sortie funnel
- "Ajouter au panier" → drawer → "Passer la commande" → Stripe → page de confirmation. **Standard et propre.**
- Pas d'option "Demander un devis avec ces dimensions" pour les pros qui veulent une facturation B2B.

### Accompagnement
- Aucune pop-up d'aide, pas de chat, pas de tooltip "?". Le lien Contact existe mais n'est pas contextuel.

---

## 3. Audit du **Configurateur Pliage** (`configurateur-pliage.html`)

### Compréhension

- Étape 1 — Forme : 4 cartes (U, L, Z, Appui de fenêtre) avec petits SVG schématiques et lettres A/B/H. **Très bien.** Le sous-titre ("Canal · Habillage · Cornière" pour le U) aide à projeter un usage.
- Étape 2 — Matière + Épaisseur : 3 cartes (Acier 0,75/1,5, Alu 1,5/2, Inox 1/2/3). Le sélecteur d'épaisseur apparaît après le clic. **Bon mais subtil** : un utilisateur peut ne pas remarquer que le sélecteur d'épaisseur s'est affiché plus bas.
- Étape 3 — Dimensions : SVG dynamique du profil + inputs selon la forme.
  - **Friction MAJEURE :** pour la forme **Appui de fenêtre**, on demande "Retour A", "Profondeur B", "Nez C" — 3 mesures techniques. Aucun visuel n'explique ce qu'est le nez à 92° ni la pince de 12 mm (constante codée en dur). Un débutant abandonne.
  - **Switch "Sens de laquage"** (extérieur/intérieur) avec aide contextuelle "Recommandé · 90 % des poses" et flèches sur le SVG : **excellent**, c'est exemplaire UX.
- Étape 4 — Couleur : 5 RAL ou panneau "Inox brut" auto-sélectionné. OK.
- Étape 5 — Accessoires (vis inox auto-foreuses) avec swatches RAL : OK mais **une seule référence d'accessoire** alors que dans la vraie vie un pliage peut nécessiter éclisses, etc.
- Étape 6 — Quantité + bouton commande.

### Jargon technique
"développé", "laquage", "tôle", "RAL", "pince" (non visible mais documenté côté JS), "auto-foreuses", "âme" (pour la forme Z, label "Hauteur de l'âme"). **"Âme"** est inconnu d'un particulier.

### Validation
- Mêmes limites que le configurateur couvertine. Pas de message d'erreur explicite.
- L'inox n'est pas disponible pour l'appui de fenêtre — l'UI grise la carte avec un `title=` HTML (tooltip natif uniquement). **Friction mineure** : si on a déjà sélectionné inox puis qu'on change vers appui, on est silencieusement reset.

### Calcul prix
- Identique : HT/TTC en grand, prix mini 35 € HT. Pas de breakdown.

### Progression
- Même problème : pas de stepper sticky. Les 6 étapes (vs 4 sur Couvertine) rendent ce manque plus pénalisant.

### Cohérence entre les deux configurateurs
- **Architectures différentes :** Couvertine commence par la Matière, Pliage commence par la Forme. C'est logique mais non explicité.
- Pliage a la quantité comme étape 6 explicite ; Couvertine la cache dans le step 5 du même nom.
- Pliage a "Sens de laquage" avec aide visuelle. Couvertine n'a **pas** cette notion (le rejet d'eau dicte la face). Là aussi cohérent mais non documenté.
- Le **CSS partagé** (`configurateur.css`) homogénéise visuellement, mais le configurateur pliage utilise un overlay CSS (315 lignes dans `<style>` du HTML) qui ré-aligne le style. Difficile à maintenir.

### Mobile
- Identique au configurateur couvertine, mêmes limites.

### Sauvegarde
- Bonus : le pliage accepte `?forme=U|L|Z|appui` dans l'URL (preselection). C'est partageable, mais limité à la forme. Le reste de la config n'est pas dans l'URL.

---

## 4. Audit de la page **Couvertines** (`couvertines.html`)

Page de **présentation** sobre, pas de configurateur. Photo couvertine plate, "à partir de 28 € / ml HT", 4 specs avec checkmark, 5 swatches RAL, CTA "Lancer le configurateur →".

- **Friction MINEURE :** un visiteur peut chercher à cliquer sur la photo ou les swatches en pensant configurer directement. Il faut faire défiler pour trouver le CTA.
- **Pas de schéma technique** de la couvertine (coupe avec retours, dépassement, rejet d'eau). Seulement une photo. Pour un produit aussi technique, c'est dommage — un schéma 2D coté augmenterait fortement la confiance.
- Le lien navigation principal pointe vers `couvertines.html` mais c'est `configurateur.html` qui contient le configurateur. **Risque de confusion** dans le nommage.

---

## 5. Audit de la page **Accessoires** (`accessoires.html`)

Catalogue éditorial avec 7 cartes (éclisses, angles, cornières, supports, embouts, colle, visserie). Belle direction artistique mais :

- **Friction CRITIQUE :** aucun prix affiché, aucun bouton "Ajouter au panier", aucun lien vers le configurateur. La seule action possible est "Demander un devis" via la nav. Pour un visiteur qui sait ce qu'il veut, c'est une **fuite de conversion massive**.
- **Friction MAJEURE :** zéro schéma technique malgré que les schémas SVG existent déjà dans `configurateur.html`. C'est une perte sèche de patrimoine visuel.
- Doublons : "Talon / embout de fermeture" (5 € dans le configurateur) vs "Embouts de Couvertine" (sans prix sur la page accessoires). Risque d'incohérence sémantique.
- Les badges "19 coloris RAL" contredisent le configurateur ("5 RAL standard").

---

## 6. Audit de **commande-confirmee.html**

- Message clair, ton rassurant, icône check, délai annoncé (5-10 j ouvrés), email contact en lien direct.
- **Manque :**
  - le **numéro de commande** est mentionné comme "envoyé par email" mais pas affiché à l'écran. Or l'utilisateur attend la confirmation visuelle immédiate (UX standard Stripe).
  - aucune **récap des articles** commandés. Si l'email n'arrive pas (spam, faute de frappe), l'utilisateur n'a aucune trace.
  - pas de **timeline visuelle** ("Commande reçue → Fabrication → Expédition → Livraison") qui rassure énormément.
  - pas de **CTA "Suivre ma commande"** ou "Contacter pour modifier".
  - pas de mention "Vous recevrez un email de suivi" / "Modification possible dans les 2h".

---

## 7. Trois parcours utilisateurs simulés

### Parcours A — Particulier, muret de 6 m, débutant total
1. Arrive sur `couvertines.html`, voit "à partir de 28 € / ml". Clique "Lancer le configurateur".
2. Dans `configurateur.html`, choisit Acier. OK.
3. Saisit dimensions : **bloque sur "B largeur du support"** — il sort un mètre, mesure 28 cm de muret, saisit 280. OK.
4. **Bloque sur "C largeur de tôle"** : il saisit la même valeur, comprenant pas la nuance avec B. Le SVG bouge mais il ne le relie pas à son muret.
5. **Bloque sur "L longueur de pièce"** : max 3000 mm. Or son muret fait 6000 mm. **Aucun message ne lui dit "vous devrez utiliser 2 longueurs + 1 éclisse".** Friction CRITIQUE.
6. Choisit RAL 7016. Voit le prix. Ajoute au panier. Quitte sans commander car incertain qu'une seule couvertine couvrira 6 m.

**Verdict :** abandon probable. Solution : **module "Calculer ma longueur totale + jonctions"** en amont de l'étape Dimensions.

### Parcours B — Artisan métallier, 50 ml, RAL 7016, angles + about
1. Arrive directement sur `configurateur.html`. Configure une pièce de 3000 mm.
2. Bloque sur la quantité : il faut 17 pièces. Saisit 17 dans la quantité. OK.
3. **Frustration MAJEURE :** doit calculer mentalement ses accessoires (combien d'angles, d'éclisses, de talons). Aucune suggestion automatique ("Pour 17 pièces, prévoir 16 éclisses + 2 talons").
4. Doit ajouter 16 éclisses, 2 talons, 4 angles. Tous les boutons +/- sont des clics unitaires. Pour 16 éclisses → 16 clics. **Pas de champ direct éditable** (readonly).
5. Choisit RAL 7016. Va au paiement. Stripe. Bien.

**Verdict :** fonctionne mais lent. Solution : **input numérique éditable + suggestion algorithmique** "Vous avez configuré 17 pièces, recommandation : 16 éclisses, 2 talons". + **mode "Pro" avec import CSV / devis B2B + IBAN.**

### Parcours C — Particulier veut un pliage custom, ne connaît pas son rayon
1. Arrive sur `configurateur-pliage.html`.
2. Choisit "Appui de fenêtre" car c'est son cas.
3. **Bloque sur "Nez (C)" et la pente 10°.** Le sous-titre dit "Retour · Pente 10° · Nez 92°" mais aucune explication interactive de ce qu'est le nez ou la pente.
4. Cherche une aide. **Aucun bouton "?"**, aucun lien "Besoin d'aide ?". La navigation a un lien "Guide de pose" mais il n'est pas contextuel.
5. Abandonne et utilise le formulaire contact.

**Verdict :** abandon probable pour profil non-pro. Solution : **bouton "?" sur chaque champ** ouvrant une mini-vidéo ou un schéma annoté.

---

## 8. Liste de frictions consolidée

| # | Configurateur / page | Étape | Sévérité | Description | Solution UX |
|---|---|---|---|---|---|
| 1 | Couvertine | Dim. C "Largeur de tôle" | **MAJEUR** | Champ incompris, aucune explication du lien avec B | Tooltip "?" + auto-calcul "C = B + 2×retour + 50 mm" en lecture seule par défaut, modifiable en mode avancé |
| 2 | Couvertine | Dim. L | **CRITIQUE** | Max 3000 mm, aucun message "pour > 3 m, ajoutez des éclisses" | Helper proactif au-dessus de 2800 mm : "Pour 6 m, prévoir 2× 3000 mm + 1 éclisse" |
| 3 | Pliage | Étape 3 Appui | **MAJEUR** | Jargon (nez, pente 10°, pince 12 mm) sans aide visuelle | Schéma annoté cliquable + tooltip sur chaque champ |
| 4 | Les deux | Bouton commande désactivé | **MAJEUR** | Aucun message "il manque X" | Tooltip dynamique "Choisir une couleur" sur hover du bouton disabled |
| 5 | Les deux | Progression | **MAJEUR** | Pas de stepper sticky | Stepper horizontal sticky en haut, cliquable pour revenir en arrière |
| 6 | Les deux | Sauvegarde | **MAJEUR** | Aucune persistance, aucun share link | `localStorage` autosave + URL paramétrée (`?conf=base64...`) |
| 7 | Accessoires.html | Toute la page | **CRITIQUE** | Pas de prix, pas d'achat direct | Ajouter prix unitaires + bouton "Ajouter à mon devis" |
| 8 | Pliage | Accessoires | **MAJEUR** | Une seule référence (vis) | Ajouter au moins éclisses + talons mutualisés avec couvertine |
| 9 | Les deux | Aide contextuelle | **MAJEUR** | Aucun "?", aucun chat | Bouton "Besoin d'aide ?" flottant ouvrant chat / formulaire pré-rempli |
| 10 | Confirmation | Toute la page | **MAJEUR** | Pas de numéro commande affiché, pas de récap | Numéro visible + récap items + timeline 4 étapes |
| 11 | Couvertine | Prix | MINEUR | Pas de breakdown | "Détail" dépliable : matière + accessoires + min |
| 12 | Couvertine vs Pliage | Cohérence | MINEUR | Ordres d'étapes différents | Documenter dans une FAQ ou homogénéiser progressivement |
| 13 | Mobile | Sidebar récap | MINEUR | Perd le sticky, prix invisible pendant la saisie | Bandeau prix sticky bas mobile |
| 14 | Pliage | Inox/Appui incompatibles | MINEUR | Reset silencieux | Toast "Inox non disponible pour appui, choix réinitialisé" |
| 15 | Couvertines.html | Pas de schéma technique | MINEUR | Confiance perdue | Ajouter schéma SVG 2D coté du profil |
| 16 | Pliage | Forme Z "âme" | MINEUR | Jargon "âme" | Renommer "Hauteur centrale" + (?) "âme = partie verticale" |
| 17 | Accessoires.html | "19 coloris RAL" | MINEUR | Contredit le configurateur (5 RAL) | Harmoniser la promesse |
| 18 | Les deux | Bouton Quantité accessoires | MINEUR | Readonly, +/- unitaires | Permettre la saisie directe |
| 19 | Confirmation | Pas de contact prioritaire | MINEUR | Email seul | Ajouter téléphone + WhatsApp si applicable |
| 20 | Configurateur Couvertine | Manque le pro mode | MAJEUR | Pas de devis B2B / IBAN | Toggle "Je suis professionnel" → devis PDF + facturation différée |

---

## 9. TOP 10 priorisé (Effort × Impact)

| Rang | Action | Effort | Impact | ROI |
|------|--------|--------|--------|-----|
| 1 | **Tooltip dynamique sur bouton CTA désactivé** ("Il manque : couleur") | S | 5/5 | Évite l'abandon silencieux |
| 2 | **Helper L > 2800 mm** : message "Pour 6 m, prévoir éclisses" + lien pré-rempli | S | 5/5 | Récupère le parcours A |
| 3 | **Stepper sticky horizontal cliquable** en haut des deux configurateurs | M | 5/5 | Sentiment de contrôle, taux d'achèvement +15-25% |
| 4 | **Autosave `localStorage` + URL partageable** (`?conf=...`) | M | 5/5 | Reprise possible, partage devis collègue, abandon panier email |
| 5 | **Page accessoires : prix + bouton "Ajouter à ma config"** | M | 4/5 | Débloque une fuite de conversion totale |
| 6 | **Tooltips "?" sur champs jargonneux** (C, R, A, nez, pente, âme, développé) | M | 4/5 | Élargit l'audience aux particuliers |
| 7 | **Confirmation commande : numéro + récap + timeline 4 étapes** | S | 4/5 | Réassurance post-paiement, baisse des emails support |
| 8 | **Champs quantité accessoires éditables directement** + suggestion algorithmique ("Pour 17 pièces, 16 éclisses recommandées") | M | 4/5 | Productivité pro × 5 |
| 9 | **Bandeau prix sticky bas mobile** | S | 3/5 | Mobile = 60% du trafic e-commerce métier |
| 10 | **Bouton "Besoin d'aide ?" flottant** ouvrant chat ou contact pré-rempli avec contexte de l'étape | M | 4/5 | Capture les abandons sur jargon |

**Légende :** Effort S = ≤ 1 jour dev, M = 2-5 jours, L = > 1 semaine.

---

## 10. Recommandations stratégiques

### A. Unifier les deux configurateurs sous un même moteur
Aujourd'hui `configurateur.js` (couvertine) et `pliage.js` ont du code redondant (RAL_COLORS dupliqué, calcul prix similaire, drawSVG dupliqué, gestion panier dupliquée). À 1500 lignes cumulées, c'est ingérable. **Refactoring vers un moteur unique `config-engine.js`** avec configuration produit déclarative (étapes, champs, contraintes, prix). Permettrait d'ajouter un nouveau produit (chapeaux de piliers, habillages bandeaux) en quelques heures.

### B. Mode "Pro" différencié
Toggle "Je suis professionnel" → champ SIRET, devis PDF téléchargeable, paiement à 30 j, panier "import CSV", prix HT par défaut. C'est 30% du marché couvertine et ils paient mieux que les particuliers.

### C. Schémas annotés interactifs
Les SVG accessoires de `configurateur.html` (talon, éclisse, angle, cornière) sont **excellents** mais cachés tout en bas. Les exporter en composants réutilisables sur la page produit, la page accessoires et le guide de pose. Ajouter du `<title>` SVG pour le SEO et l'accessibilité (lecteurs d'écran).

### D. Tunnel post-commande
- Email Brevo confirmation déjà branché — bien.
- Manque : email J+1 "Votre commande est en fabrication", J+5 "Expédiée", J+10 "Livrée, comment l'avez-vous trouvée ?". Augmente la satisfaction et déclenche les avis Google.

### E. Analytics & A/B testing
Aucun event tracking configurateur visible. **Brancher Plausible/Umami/PostHog avec events :** `config_step_completed`, `config_field_changed`, `config_abandoned`, `cart_added`, `checkout_started`. Permettra de chiffrer chaque friction de ce rapport et de prioriser sur la donnée.

### F. Persona "artisan en chantier sur mobile"
50 % des configurations sont probablement faites mobile, terrain, sous la pluie. Tester avec un gros doigt, gant fin, sous le soleil direct. Ajouter mode haut contraste, augmenter les zones de tap (44 px mini sur les +/- accessoires).

---

## 11. Synthèse

Les deux configurateurs sont **techniquement solides** (calculs prix corrects, SVG dynamiques, Stripe branché, validation HTML5). La direction artistique des schémas accessoires est même remarquable.

Les **frictions sont presque toutes pédagogiques et procédurales** : jargon non expliqué, absence de stepper, pas de tooltip d'erreur, pas de sauvegarde, page accessoires sans achat direct, confirmation laconique.

**90 % du chemin est fait.** Les 20 actions listées (dont 10 prioritaires) peuvent être livrées en 3 sprints (~6 semaines) et devraient passer le taux de conversion configurateur → commande de 1-2 % typique à 4-6 % attendu sur un produit technique de niche bien outillé.

---

*Fin de l'audit — c:/Users/Utilisateur/Documents/Metal-pliage/_analyse-complete/audits/03-audit-ux-configurateurs.md*
