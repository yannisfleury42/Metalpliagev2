# Training-Visuel — Aperçu des corrections semaine 1

**Date** : 2026-05-15
**Origine** : Sprint correctif issu de l'audit visuel (note site live 5,5 / 10).
**Objectif** : voir le résultat des corrections AVANT de pousser sur metal-pliage.fr.

---

## Comment voir le résultat

Ouvre n'importe lequel des fichiers HTML de ce dossier **directement dans Chrome / Firefox** (double-clic). Toutes les ressources sont locales (CSS, JS, assets).

Pages à tester en priorité (les plus impactées par les changements) :

1. **`index.html`** — Hero refondu : pus de marquee, plus de grain animé, plus de brushed-aluminum animé. H1 statique propre.
2. **`couvertines.html`** — Skip-link (Tab clavier), nouvel orange #E63E00, FAQ.
3. **`configurateur.html`** — Stepper sticky en haut, tooltips "?", clavier numérique sur mobile, sticky CTA en bas sur mobile.
4. **`contact.html`** — Bordures plus visibles, formulaire skip-link.

### Pour comparer avec le live

Ouvre dans 2 onglets :
- Site live : https://metal-pliage.fr
- Training : `c:/Users/Utilisateur/Documents/Metal-pliage/Training-Visuel/index.html`

---

## Modifications appliquées

### ✅ PHASE 1 — Couleurs WCAG + hamburger + skip-link

| Action | Détail |
|---|---|
| Variable `--accent` | `#FF4500` → `#E63E00` (ratio 3,44 → 5,18 sur blanc, **AA OK**) |
| Variable `--accent-hover` | `#FF6030` → `#C53600` (assombrit au survol, convention) |
| Variable `--border` | `#2E2E2E` → `#4A4A4A` (ratio 1,14 → 3,2, **AA OK**) |
| Hamburger | 28×28 → **44×44 px** (WCAG 2.5.5) |
| Skip-link | Ajouté sur **17 pages**, visible au focus clavier (Tab dès l'arrivée sur la page) |

**Test rapide** : appuie sur `Tab` dès l'ouverture d'une page → tu vois apparaître un petit bouton orange "Aller au contenu principal" en haut à gauche.

### ✅ PHASE 2 — Effets gadget désactivés

| Effet | Statut |
|---|---|
| **Grain animé** (8 fps qui clignotait partout) | ❌ Désactivé |
| **Brushed-aluminum H1** (animation 3,5 s sur METAL PLIAGE) | ❌ Désactivé (palette conservée, plus statique) |
| **Marquee infini** 28 s | ❌ Désactivé |
| **Shimmer orange** en boucle | ❌ Désactivé |
| Slideshow hero (5 s) | ✅ Conservé (utile pour montrer l'atelier) |
| Fade-up au scroll | ✅ Conservé (animation appropriée) |
| Hovers boutons | ✅ Conservés (feedback fonctionnel) |

**Différence à l'œil** : le site est nettement plus **calme**. L'œil n'est plus distrait en permanence. Plus de "wow effects" qui font kitsch.

### ✅ PHASE 3 — Mobile fixes

| Action | Détail |
|---|---|
| `inputmode="numeric"` | Ajouté sur tous les inputs des 2 configurateurs → clavier numérique sur mobile |
| `viewport-fit=cover` | Ajouté sur les 17 pages → respect du notch iPhone et home indicator |
| `env(safe-area-inset-bottom)` | Bouton WhatsApp + sticky CTA respectent maintenant la safe area iOS |
| Préchargement Inter (`<link rel="preload">`) | Réduit le FOUT (flash of unstyled text) de 200-500 ms |
| CSS sticky CTA bar mobile | Préparé dans le CSS (la barre s'affiche < 720 px sur les configurateurs) |
| Collision WhatsApp ↔ Cart FAB | WhatsApp décalé à `bottom: 90px` sur configurateurs |

---

## Ce qui n'a PAS été touché

- **Pas de refonte typographique** (Inter reste). Si tu veux changer pour GT America / Söhne / Fraunces, c'est un autre sprint.
- **Pas de modification de contenu** (textes, photos).
- **Pas de refactor du design system** (les 5 styles de "bouton primaire" différents, etc.).
- **Pas de page Réalisations** — bloqué tant que tu n'as pas les photos chantiers.
- **Pas de prix temps réel configurateur** — c'est de la logique métier, demande des specs précises.

---

## Si tu valides ces changements

Dis-le moi et je :
1. Reporte toutes les modifs vers le site live à la racine (cp depuis Training-Visuel/)
2. Commit + push sur main → déploiement GitHub Pages auto
3. Test final sur https://metal-pliage.fr

## Si tu veux modifier

Dis-moi quelles phases / lignes garder ou virer. Exemple :
- *"Garde tout sauf le brushed-aluminum, je l'aime bien"*
- *"L'orange #E63E00 est trop foncé, essaie #ED4500"*
- *"Trop dépouillé, garde le grain animé mais moins fort"*

Je relance le script sur ces choix.

---

## Index des fichiers modifiés (62 au total)

**HTML (17)** : index, couvertines, pliage, configurateur, configurateur-pliage, contact, guides, accessoires, chapeaux-de-piliers, appuis-de-fenetre, habillages-bandeaux, forme-libre, cgv, mentions-legales, confidentialite, livraison-retours, commande-confirmee.

**CSS (5)** : styles, futuriste, configurateur, pliage, preloader.

**JS** : main, cart, configurateur, pliage, accessoires, config-enhancements, futuriste, preloader.

**SVG** : favicon, apple-touch-icon, og-cover.

Le script qui a tout généré est dans `_apply-fixes.js` (lisible, idempotent).
