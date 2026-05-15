# SYNTHÈSE BRUTALE — Audit visuel & design Metal Pliage

**Date** : 2026-05-15
**Mandat** : "Honnêteté à 100 %, vérité concrète, pas de complaisance"
**Méthode** : 6 agents IA indépendants (designer senior, accessibilité WCAG, mobile UX, benchmark concurrents, 2 personas exigeants)

---

## TL;DR — Le verdict en 1 minute

**Tous les angles convergent : ton site est moyen.** Il est techniquement propre mais visuellement il dégage du "semi-pro qui empile des effets pour paraître premium", pas du "premium silencieux".

### Notes attribuées par chaque agent

| Auditeur | Note | Verdict |
|---|---|---|
| Designer Senior (refs Pentagram) | **5,5 / 10** | "Startup tech 2018 qui a découvert le dark mode" |
| Accessibilité WCAG 2.2 AA | **~70 % conformité** | Non conforme AA |
| Mobile UX | **6,5 / 10** | OK sans plus, 3 frictions critiques |
| Benchmark concurrents | **Leader sur 0 axe** | "Conforama qui rêve de BoConcept" |
| Élodie architecte d'intérieur Lyon | **4,5 / 10** | "Je contacte parce que recommandée, sinon je pars" |
| Antoine cadre sup Versailles | **6,5 / 10** | "Je passe par mon architecte plutôt qu'acheter ici" |

**Note moyenne pondérée : 5,5 / 10.** Pour un site qui doit vendre du sur-mesure premium, c'est insuffisant.

---

## Les 5 vérités qui dérangent — convergences 4+ agents

### 🔴 VÉRITÉ #1 — L'orange `#FF4500` est mauvais (4 agents)
**Constats convergents** :
- **Designer** : "Orange Web 1.0, celui de Reddit et Hacker News. Daté."
- **WCAG** : `#FF4500` sur blanc = ratio **3,44:1** → **échec AA** (besoin 4,5:1). Le bouton "Ajouter au panier" texte blanc sur orange est techniquement illisible pour 8 % de la population.
- **Élodie architecte** : "Orange qui criait Reddit, pas atelier d'art."
- **Antoine acheteur** : "Palette orange inadaptée à une clientèle archi/déco."

**Action** : passer à **`#E63E00`** (5,18:1 avec blanc, conforme AA, teinte signature conservée). Ou plus radical : **changer pour un orange acier corten profond `#B85838`** qui est déjà dans `index.html:174` (classe `.fx-corten` inutilisée). Ironique : tu as le bon orange dans ton code mais tu utilises le mauvais.

---

### 🔴 VÉRITÉ #2 — Les photos hero sont visiblement IA (5 agents)
**Constats convergents** :
- **Designer** : "Le code admet officiellement (commentaire `index.html:92`) tenter de les camoufler par filtre CSS." Tu as écrit dans ton propre code : *"Traitement homogène (réduit le rendu IA générique et lie les images entre elles)"* → tu sais que c'est de l'IA et tu essaies de cacher.
- **Élodie** : "Photos IA flagrantes — un œil d'archi le voit en 2 secondes."
- **Antoine** : "Photos hero ressemblent à des images IA, pas à de vrais chantiers."
- **Benchmark** : "Une seule photo authentique sur tout le site."
- **Mobile UX** : "Le hero charge 19 background-images WebP en parallèle — sans intérêt si elles ne sont pas crédibles."

**Action** : **journée photo pro à Saint-Étienne (~1000 €)** pour 8-12 vraies photos d'atelier + de chantiers. Ça règle 30 % des problèmes du site à lui seul. **Aucune autre action ne compense ça.**

---

### 🔴 VÉRITÉ #3 — Page "Réalisations" absente = éliminatoire pour les pros (4 agents)
**Constats convergents** :
- **Élodie architecte** : "Aucune référence projet visible. C'est presque éliminatoire en l'état."
- **Antoine** : "Pas de galerie de réalisations, pas de visages humains, pas d'avis."
- **Benchmark** : "Manque #1 vs tous les concurrents."
- **Designer** : "Le manque de photos de chantiers réels se voit dans tout le site."

**Action** : créer la page Réalisations (mockup déjà fait dans `_analyse-complete/mockups/mockup-3-section-realisations.html`). **Sans photos clients, le sprint TRUST ne peut pas démarrer.** C'est ton plus gros bloqueur business.

---

### 🔴 VÉRITÉ #4 — Identité de marque inexistante (4 agents)
**Constats convergents** :
- **Designer** : "Inter en titres = même typo que 60% des SaaS. Aucune identité."
- **Élodie** : "Marque sans personnalité. Aucun parti pris graphique."
- **Antoine** : "Le nom 'Metal Pliage' est banal, le logo industriel-cheap."
- **Benchmark** : "Positionnement de fait : 'petite boîte stéphanoise propre mais oubliable'."

**Action** : **changement de typo pour les titres** uniquement. Suggestions :
- **GT America** ou **Söhne** (caractère industriel premium)
- **Tobias** ou **Schoolbook** (serif éditoriale pour contraste sophistiqué)
- Ou même **un display gratuit** comme **Fraunces** ou **Bricolage Grotesque**

Garder Inter pour le corps. **2 polices = identité doublée à coût zéro.**

---

### 🔴 VÉRITÉ #5 — Trop d'effets visuels gadget (3 agents + designer +++)
**Inventaire** que tu fais subir au visiteur EN PERMANENCE :
1. **Grain animé global** à ~8 fps qui clignote (`futuriste.css:11-36`)
2. **Marquee infini** 28s qui défile (`futuriste.css:208`)
3. **Shimmer orange** en boucle 3s sur certains éléments
4. Slideshow qui change toutes les 5 s
5. Reflet aluminium brossé 3,5 s au chargement
6. Fade-up au scroll sur quasi tous les blocs
7. Hovers translateY/translateX/scale partout
8. Backdrop-filter blur en 4 endroits

**Verdict designer** : *"L'œil n'a aucun moment de calme. C'est l'antithèse du luxe. Aesop, Bottega Veneta, Hermès en ligne : zéro animation hors interaction."*

**Action** : supprimer **grain animé**, **marquee**, **shimmer en boucle**, **brushed-aluminum H1**. Garder uniquement les fade-up scroll + les hovers fonctionnels. Gain : page beaucoup plus calme, plus rapide, **plus crédible**.

---

## Top 10 problèmes concrets (avec correction prête)

| # | Problème | Source | Fix |
|---|---|---|---|
| 1 | `#FF4500` ratio 3,44:1 sur blanc (échec WCAG) | WCAG, Designer | `#E63E00` partout (1 ligne CSS) |
| 2 | Bordures `#2E2E2E` sur `#242424` = 1,14:1 (échec critique) | WCAG | `--border: #4A4A4A` (3,2:1 OK) |
| 3 | Photos hero IA-générées visibles | Designer, Élodie, Antoine | Photo shoot atelier 1 jour |
| 4 | 5 styles différents de "bouton primaire orange" | Designer | Refactor `.btn-primary` unique, 3 tailles max |
| 5 | 34 `!important` dans `couvertines.html` | Designer | Refactor des spécificités CSS |
| 6 | Hamburger 28×28 (norme WCAG 44×44) | Mobile, WCAG | `width/height: 44px` |
| 7 | Configurateur sans `inputmode="numeric"` | Mobile | Ajouter sur les 4 inputs (`configurateur.html:150,162,174,186`) |
| 8 | CTA configurateur caché sous clavier mobile | Mobile | Sticky bottom bar `position:fixed` |
| 9 | Collision WhatsApp + Cart FAB sur configurateur | Mobile | Décaler WhatsApp en `bottom: 80px` sur pages configurateur |
| 10 | Skip-link "Aller au contenu" absent | WCAG, Mobile | `<a href="#main" class="skip-link">…</a>` (10 min) |

---

## Ce qui marche (les vrais points positifs honnêtes)

Pour ne pas être que dans le négatif — les 5 trucs que les 6 agents reconnaissent **vraiment** comme bons :

1. ✅ **Le mode "wizard muret"** (récemment ajouté) → unanimement loué (Designer, Mobile, Antoine, Élodie). C'est **le composant le mieux conçu du site**.
2. ✅ **Bouton WhatsApp sticky** → "sauve une grande partie des leads" (Mobile).
3. ✅ **`prefers-reduced-motion`** implémenté → bon réflexe accessibilité (WCAG).
4. ✅ **FAQ `<details>` natif** sur couvertines (récent) → choix a11y irréprochable.
5. ✅ **Vocabulaire technique juste** dans le configurateur → "ils savent au moins de quoi ils parlent" (Élodie).

À conserver tel quel.

---

## Sentiment global par persona

### Élodie, architecte d'intérieur Lyon (4,5/10)
> *"Conforama qui rêve de BoConcept. Je contacte uniquement parce que recommandée par un confrère. Sinon je serais déjà chez un concurrent. L'orange criard, l'Inter générique et l'absence de réalisations me ferment toutes les portes pour la cliente bourgeoise."*

**Décision** : tente UN appel téléphonique, jamais ne commande en ligne.

### Antoine, cadre sup Versailles (6,5/10)
> *"Le mode débutant est bien accroché, la photo atelier est authentique. Mais aucun avis client, aucun visage humain, palette orange qui jure avec ma maison contemporaine, prix non dynamique dans le configurateur. Je ne commande pas en ligne — je passe par mon architecte ou j'envoie le formulaire et j'évalue la qualité du contact humain."*

**Décision** : envoie le formulaire, attend la réponse, pas d'achat impulsif.

---

## Comparaison concurrents (résumé)

**Sur 5 axes stratégiques** (prix volume / SEO / premium / catalogue / config temps réel), **Metal Pliage est leader sur 0**.

| Axe | Leader actuel | Position Metal Pliage |
|---|---|---|
| Prix volume / catalogue | mister-tole.com | Loin derrière |
| SEO "couvertine" | couvertine.com | Outsider |
| Premium / patrimoine | zinc-france.com | Pas dans la course |
| Configurateur temps réel | Aucun (opportunité !) | **Potentiel #1** si on push |
| Made in France crédible | Tous se réclament FR | À peu près à égalité, **avantage à creuser** |

**Stratégie recommandée par l'auditeur benchmark** : ne PAS essayer de battre `couvertine.com` ou `mister-tole.com` sur leur terrain. **Creuser l'angle "fabricant français direct, configurateur prix temps réel, livraison 10j"**. Mais ça suppose d'avoir **un prix dynamique réel** dans le configurateur (actuellement annoncé "à partir de 28 €/ml" mais pas calculé en live).

---

## Roadmap honnête — Si tu avais 4 semaines

### Semaine 1 — Stop the bleeding (~8h)
- [ ] Remplacer `#FF4500` → `#E63E00` (1 ligne CSS, ratio AA OK)
- [ ] Foncer les bordures `#2E2E2E` → `#4A4A4A` (1 ligne)
- [ ] Hamburger 28→44 px (1 ligne)
- [ ] Skip-link sur toutes pages (template)
- [ ] `inputmode="numeric"` sur les 4 inputs configurateur (1 ligne)
- [ ] Sticky bottom CTA mobile sur configurateur (~1h dev)
- [ ] **Désactiver le grain animé** (`futuriste.css:11-36`) — 1 ligne
- [ ] **Désactiver le brushed-aluminum H1** (80 lignes inline à virer)
- [ ] **Désactiver le marquee + shimmer infinis**

### Semaine 2 — Photos & identité (~16h + journée photo)
- [ ] **Photo shoot atelier + portraits Dimitry & Yannis + 3 chantiers** (1 journée pro)
- [ ] Remplacer 19 slides hero IA par 5-6 vraies photos
- [ ] Ajouter typo titres distinctive (GT America trial, Söhne, ou Fraunces gratuite)
- [ ] Page "L'atelier" avec les vraies photos + équipe

### Semaine 3 — Page Réalisations (~12h)
- [ ] Solliciter 5 clients pour autoriser photos chantiers terminés
- [ ] Implémenter la vraie page Réalisations à partir du mockup
- [ ] Ajouter widget Google Reviews quand 5-10 avis collectés

### Semaine 4 — Prix temps réel + finitions (~20h)
- [ ] **Vrai prix dynamique** dans configurateur (calcul en JS, affichage live)
- [ ] Upload de plan DWG/PDF sur formulaire contact
- [ ] Mention "Échantillon RAL gratuit" pour les pros
- [ ] Refactor design tokens (1 fichier `tokens.css` avec 8 couleurs / 8 paliers typo / 4 radius / 6 spacings)

**Total : 4 semaines + ~1000 € photo + bouteille de vin pour les clients qui posent**. Résultat attendu : passage du 5,5/10 au 8/10. Site **enfin** au niveau de ce que M.D.S. peut produire en atelier.

---

## Conclusion — Le mot brutal de fin

Le site Metal Pliage **n'est pas mauvais** au sens où il fonctionne. Mais il est **moyen** au sens où il ne fait gagner aucun avantage à M.D.S. Tous tes concurrents directs sont au même niveau ou meilleurs sur leur axe. Tu n'es leader nulle part.

**Le problème n'est pas dans la technique** — on a tout corrigé en 5 sprints aujourd'hui (perf, conformité, UX). Le problème est dans **l'identité visuelle** et la **preuve sociale**.

Tu peux investir 10 sprints techniques supplémentaires : tant que tu n'auras pas

1. de vraies photos
2. une identité graphique forte
3. une page de réalisations clients

...le site restera **un bon outil technique qui ne convainc personne d'acheter en ligne**. Les leads continueront à arriver par téléphone parce que c'est ton seul vrai canal de conversion aujourd'hui.

**La bonne nouvelle** : ces 3 actions sont parfaitement à ta portée. La mauvaise : aucune ne dépend de code. Toutes dépendent de toi sortir l'appareil photo, créer une vraie identité, et solliciter tes clients.

---

*Fin de la synthèse. Détail dans `audits/01-designer-senior.md`, `audits/02-accessibilite-wcag.md`, `audits/03-mobile-ux.md`, `audits/04-benchmark-concurrents.md`, `personas/persona-architecte-elodie.md`, `personas/persona-acheteur-antoine.md`.*
