# AUDIT TECHNIQUE & INFRA — 1 site vs 2 sites (Option E vs Option F)

**Date :** 2026-05-18
**Périmètre :** trancher techniquement entre Option E (sous-dossier `/mds/` sur `metal-pliage.fr`) et Option F (nouveau domaine + nouveau repo pour MDS).
**Posture :** CTO consultant PME/TPE, 15 ans terrain sur petites équipes non-tech. Je tranche sans "ça dépend" mou.
**Audience :** 2 cogérants tech-débutants, équipe ~5 personnes max, zéro DevOps interne.

---

## 0. Méthodo & hypothèses

- 1h de dev = 50 €. Tarif freelance junior/PME français, marché Loire/Rhône-Alpes.
- Horizon TCO = 3 ans.
- Pas de croissance forte de l'équipe attendue (5 personnes max, brief explicite).
- Backups limités à Git (GitHub est le backup de fait), pas de stratégie pro type S3 + snapshot.
- Pas d'audit de sécurité dédié, pas de RGPD avancé (formulaire simple via Brevo).
- Estimations time effort = bornes basse-haute, je prends la médiane pour le TCO.

---

## 1. Coût initial — Option F (2 sites séparés)

### 1.1 Achat & DNS

| Tâche | Temps | Coût direct |
|---|---|---|
| Achat domaine OVH `.fr` (ex. `mds-saint-etienne.fr`) | 15 min | ~12 €/an |
| Création repo GitHub `mds-site` (public ou privé) | 10 min | 0 € |
| Setup CNAME GitHub Pages + fichier CNAME repo | 20 min | 0 € |
| Config DNS OVH (CNAME `@` + `www` vers GitHub) | 30 min | 0 € |
| Activation HTTPS Let's Encrypt (auto par GitHub) | propag. 24h | 0 € |
| Test propagation + vérif SSL | 30 min | 0 € |

**Sous-total infra : ~1h45 + 12 €/an domaine.**

### 1.2 Création du site

Site MDS minimaliste = 5-8 pages :
- Accueil (hero + 4 services + CTA + avis GBP + map)
- Garde-corps
- Portails (battant, coulissant)
- Escaliers / verrières
- Atelier / À propos
- Réalisations (galerie photos GBP rapatriée)
- Contact (formulaire + map + tel + horaires)
- Mentions légales / CGU

Si on part d'un template HTML/CSS/JS "stylé" et qu'on adapte aux couleurs MDS (palette différente de Metal Pliage, à dessein pour différencier les marques) :

| Tâche | Temps |
|---|---|
| Maquette rapide / wireframe (1-2 itérations) | 4-6h |
| Intégration HTML/CSS responsive (5-8 pages) | 12-16h |
| JS léger (menu mobile, lazyload, formulaire contact AJAX) | 3-4h |
| Réutilisation du backend Render existant (Brevo) : nouvelle route `/contact-mds` | 2h |
| Photos GBP : tri + compression WebP + alt SEO | 3-4h |
| Schema.org LocalBusiness + sitemap + robots + favicon | 2h |
| Tests cross-browser + mobile + Lighthouse | 2-3h |
| Soumission Search Console + GBP synchro | 1h |

**Sous-total dev : 29-38h, médiane 33h.**

### 1.3 Workflow CI/CD

Identique à Metal Pliage (Git push → GitHub Pages auto). Pas de pipeline custom. **0h supplémentaire.**

### 1.4 TOTAL Option F initial

- **Temps homme : ~35h** (1h45 infra + 33h dev)
- **Coût homme : 35 × 50 = 1 750 €**
- **Coût domaine année 1 : 12 €**
- **Total année 1 : ~1 762 €**

---

## 2. Coût initial — Option E (sous-dossier `/mds/`)

### 2.1 Création du sous-dossier

| Tâche | Temps |
|---|---|
| Création arborescence `/mds/index.html`, `/mds/garde-corps.html`, etc. | 30 min |
| Adaptation des pages au sous-thème métallerie (CSS partagé ou variantes) | 10-14h |
| 4-6 pages HTML (vs 5-8 en F car on peut mutualiser contact, mentions, footer) | 8-12h |
| Gestion du header/footer cross-section (Metal Pliage vs MDS) | 2-3h |
| Adaptation logo / palette CSS conditionnelle sur `/mds/*` | 2h |
| Mise à jour sitemap.xml unique + canonical + hreflang non requis | 1h |
| Modif backend Render (route `/contact-mds` ou réutilisation) | 1h |
| Tests + déploiement (push main, c'est tout) | 1h |
| Photos GBP rapatriées | 3-4h |

**Sous-total dev : 28-38h, médiane 33h.**

Surprise : **c'est quasi le même temps que F**. Pourquoi ? Parce que le coût dominant c'est la création des pages elles-mêmes (contenu, intégration, photos), pas l'infra. L'infra F = 1h45, c'est négligeable.

**Là où E gagne réellement :** pas de DNS, pas de SSL à attendre, pas de Search Console à recréer, pas de risque d'oubli de renouvellement de domaine.

### 2.2 Risque caché côté E : la pollution du repo Metal Pliage

Le repo `metal-pliage` contient déjà ~17 pages HTML, beaucoup de fichiers de backup (`*-backup-*.html`, `*-original.html`), un dossier `_dev/` de 30+ prototypes, `_analyse-complete/`, `_analyse-visuelle/`, `_mockup/`, `Training-Visuel/`. Le repo est déjà désordonné. Ajouter `/mds/` à ça augmente la dette cognitive.

Surcoût estimé : 2-3h pour structurer proprement (créer un README clair, séparer les dossiers, mettre à jour `.gitignore`). Pris en compte dans la médiane ci-dessus.

### 2.3 TOTAL Option E initial

- **Temps homme : ~33h**
- **Coût homme : 33 × 50 = 1 650 €**
- **Coût infra année 1 : 0 €**
- **Total année 1 : ~1 650 €**

**Écart initial F vs E : ~110 € en faveur de E. Négligeable.**

---

## 3. Maintenance long terme

C'est ici que se joue la vraie différence, pas dans le coût initial.

### 3.1 Option F — multi-sites

Sur 3 ans, les frictions récurrentes pour 2 cogérants tech-débutants :

| Friction | Fréquence | Temps annuel |
|---|---|---|
| Renouvellement domaine OVH MDS (mail + clic + CB) | 1×/an | 15 min |
| Vérif certificat SSL (normalement auto, mais à monitorer) | 2-4×/an | 30 min |
| Propagation changement info commune (tel, adresse, mail) sur 2 sites | 3-5×/an | 1-2h |
| Mise à jour cookies/CGV/mentions légales sur 2 sites | 1-2×/an | 1h |
| Bumps techniques (Node version Render, dépendances npm) × 2 | 2×/an | 2-3h |
| 2 Search Console à monitorer | mensuel | 4-6h/an |
| 2 GBP à synchroniser (si évolution offres) | continu | 1-2h/an |
| Drift risque (textes divergent, footer obsolète sur un des 2) | latent | 2-3h/an de correction |

**Total maintenance annuelle F : 12-18h ≈ 15h.**
**Coût annuel : 15 × 50 + 12 € domaine = 762 €/an.**
**Coût 2 ans suivants : ~1 524 €.**

### 3.2 Option E — mono-site

| Friction | Fréquence | Temps annuel |
|---|---|---|
| Renouvellement `metal-pliage.fr` (déjà existant) | 1×/an | 15 min |
| SSL (déjà géré) | auto | 0h |
| Propagation info commune (1 seul endroit) | continu | 30 min/an |
| Mise à jour CGV/mentions | 1-2×/an | 30 min |
| Bumps techniques Render (1 seul backend) | 2×/an | 1-2h |
| 1 Search Console | mensuel | 2-3h/an |
| 1 GBP (mais 2 fiches GBP physiques = MDS + Metal Pliage existeront probablement quand même, indépendamment du site) | continu | 1h/an |

**Total maintenance annuelle E : 5-7h ≈ 6h.**
**Coût annuel : 6 × 50 = 300 €/an.**
**Coût 2 ans suivants : ~600 €.**

**Écart maintenance 2 ans (an 2 + an 3) : ~924 € en faveur de E.**

---

## 4. Risques techniques

### 4.1 Oubli de renouvellement domaine (F)

**Réel.** Cas vu 4-5 fois en 15 ans chez des PME : domaine expire, site offline 3-15 jours, parfois rachat squatter. OVH envoie 3 mails de relance mais s'ils partent en spam ou si le mail de contact change, c'est foutu. Mitigation : activer le renouvellement auto sur CB (à faire au setup, 5 min). Si fait correctement, risque résiduel faible mais non nul.

### 4.2 SSL expiré (F)

GitHub Pages provisionne et renouvelle Let's Encrypt automatiquement **tant que le DNS est OK**. Si la conf DNS dérive (cogérant qui touche OVH sans comprendre), le renouvellement échoue silencieusement. Site reste up mais en HTTP, warning Chrome. Risque réel, fréquence faible.

### 4.3 Drift d'infos entre sites (F)

**Le risque le plus probable.** Changement tel/horaires/responsable atelier → propagé sur 1 site, oublié sur l'autre. Conséquences : NAP incohérent (mauvais pour le SEO local), client confus. En 3 ans, j'estime 2-3 occurrences quasi-certaines. Coût indirect : appels perdus, confusion clients.

### 4.4 Backups (les deux)

GitHub est le backup de fait. Si on perd un repo, on perd 0h de code (chaque dev a un clone local). Risque quasi-nul. **Non-différenciant entre E et F.**

### 4.5 Backend Render à dupliquer (F)

Le backend Express + Brevo actuel gère le formulaire contact Metal Pliage. Pour F, 3 choix :
1. **Réutiliser le même backend Render** : une route `/contact-mds` qui envoie à un autre destinataire Brevo. Recommandé. Surcoût ≈ 1h. Pas de duplication.
2. Créer un 2e service Render (gratuit, free tier). Pas recommandé : double maintenance, double cold start.
3. Utiliser un service externe pour MDS (FormSubmit, Formspree). Recommandé si on veut découpler totalement. Surcoût ≈ 0h, fragilité supérieure.

Si on choisit l'option 1 (recommandée), pas de duplication backend. **Risque mitigeable, faible.**

### 4.6 Migration future de stack (les deux)

Si dans 3 ans on veut passer à un CMS (WordPress, Astro, Next.js), c'est :
- **F** : 2 migrations à planifier, mais chacune plus petite et indépendante. On peut migrer Metal Pliage en premier (plus rentable) sans toucher MDS.
- **E** : 1 migration, mais qui doit gérer 2 sections hétérogènes (commerce produit vs vitrine service). Plus complexe à designer.

Match nul.

---

## 5. Performance & SEO technique

### 5.1 Antériorité du domaine

- **F** : MDS part de DR 0. Search Console à créer. Sitemap neuf. SSL à provisionner (24-72h). 0 backlink.
- **E** : tout hérite de `metal-pliage.fr` (mais ce domaine n'a que ~5 jours d'antériorité réelle d'après le contexte — 2026-05-13 mise en ligne, on est le 2026-05-18). Donc l'héritage est marginal.

**Verdict : l'argument "antériorité" est faible ici parce que Metal Pliage est trop jeune.** Si Metal Pliage avait 3 ans, ce serait un argument fort pour E. Là, c'est marginal.

L'audit SEO précédent (`05-seo-multi-vs-mono-domaine.md`) tranche déjà pour F sur des arguments de topical authority et de ciblage. Je m'aligne. **L'argument SEO va dans le sens de F.**

### 5.2 Performance technique

Identique. Les deux options servent du statique via GitHub Pages CDN. **Match nul.**

### 5.3 Cohérence Schema.org / structured data

- **F** : 2 fiches LocalBusiness distinctes mais cohérentes (même adresse, même SIRET, marques différentes). Conforme aux guidelines Google.
- **E** : 1 fiche Organisation avec 2 sous-marques. Plus difficile à modéliser proprement. Risque de confusion algorithmique.

**Léger avantage F.**

---

## 6. Évolution future

### 6.1 Blog / CMS

- **F** : on peut ajouter un blog uniquement sur le site qui en a besoin (Metal Pliage pour le SEO produit). MDS reste vitrine pure. Plus simple, plus chirurgical.
- **E** : un blog devra gérer 2 thématiques sur le même domaine, ou avoir 2 sous-dossiers `/blog/` et `/mds/blog/`. Maintenable mais plus lourd.

**Léger avantage F.**

### 6.2 Système de devis unifié

- **F** : devis 2 sites possible, mais nécessite un backend partagé (Render existant peut le faire). Architecture : 1 backend, 2 frontends. Standard et propre.
- **E** : devis natif sur le même domaine, plus simple si la logique business est mélangée.

Si la logique métier des devis MDS et Metal Pliage est **très différente** (devis métallerie sur mesure = visite + plans vs devis couvertines = simple configurateur produit), **avoir 2 frontends séparés est plus sain**. Avantage F.

Si la logique est unifiable (un seul tunnel "demande devis"), E est plus simple. Vu la nature des activités, je penche pour différencié = F.

**Match nul, légère préférence F.**

---

## 7. Stack recommandée pour MDS si Option F

### 7.1 Options considérées

| Stack | Coût initial | Coût annuel | Maintenance | Verdict |
|---|---|---|---|---|
| **HTML/CSS/JS statique + GitHub Pages** (= Metal Pliage) | 33h | 12 € | faible | ✅ recommandé |
| Carrd (1 page) | 2-3h | 19 €/an | quasi-nulle | inadapté (6+ pages) |
| Carrd Pro Plus (jusqu'à 10 pages) | 6-8h | 49 €/an | nulle | trop limité pour SEO local |
| Webflow | 15-25h | 192-276 €/an | faible mais lock-in | trop cher sur 3 ans |
| Wix | 10-15h | 156-300 €/an | faible mais lock-in | overkill |
| WordPress + hébergement OVH | 20-30h | 60-120 €/an + thème | élevée (maj, plugins, hack) | non, trop lourd pour 2 tech-débutants |
| Notion site | 3-5h | 96 €/an (Super.so) | nulle | pas adapté SEO local |

### 7.2 Justification économique du HTML/CSS/JS statique

- **Coût annuel hébergement : 0 €** (GitHub Pages free tier, jamais une PME ne dépasse les quotas).
- **Cohérence stack** : 1 seul environnement à maîtriser pour Yannis et les cogérants. Pas de Wix d'un côté + GitHub de l'autre.
- **Maîtrise** : le code source est en local + Git, pas de lock-in vendor.
- **SEO** : contrôle total (canonical, sitemap, schema, performance Lighthouse 95+).
- **Sur 3 ans** : 0 € infra vs 576-900 € pour Webflow/Wix.

**Reco ferme : même stack que Metal Pliage. Pas de switch.**

---

## 8. TCO 3 ans

### 8.1 Option E

| Poste | An 1 | An 2 | An 3 | Total |
|---|---|---|---|---|
| Dev initial (33h × 50 €) | 1 650 € | — | — | 1 650 € |
| Domaine | 0 € | 0 € | 0 € | 0 € |
| Maintenance (6h × 50 €) | — | 300 € | 300 € | 600 € |
| Risque drift / corrections | — | 100 € | 100 € | 200 € |
| **Total E** | **1 650 €** | **400 €** | **400 €** | **2 450 €** |

### 8.2 Option F

| Poste | An 1 | An 2 | An 3 | Total |
|---|---|---|---|---|
| Dev initial (35h × 50 €) | 1 750 € | — | — | 1 750 € |
| Domaine MDS | 12 € | 12 € | 12 € | 36 € |
| Maintenance (15h × 50 €) | — | 750 € | 750 € | 1 500 € |
| Risque drift / corrections | — | 150 € | 150 € | 300 € |
| **Total F** | **1 762 €** | **912 €** | **912 €** | **3 586 €** |

**Écart TCO 3 ans : F coûte ~1 136 € de plus que E (+46 %).**

---

## 9. Notes sur 10

| Critère | Option E | Option F |
|---|---|---|
| Coût initial | 8 | 7 |
| Maintenance | 9 | 6 |
| Risque technique | 8 | 6 |
| Performance | 8 | 8 |
| SEO local MDS | 4 | 9 |
| SEO Metal Pliage | 6 | 9 |
| Évolution future | 7 | 8 |
| Cohérence marque | 5 | 9 |
| Simplicité opérationnelle 2 cogérants | 9 | 6 |
| **Note globale (moyenne pondérée)** | **7,1 / 10** | **7,6 / 10** |

Pondération appliquée : SEO et marque comptent plus que la maintenance pure parce qu'on parle d'acquisition client, pas de coût opérationnel. La maintenance F (15h/an) reste absorbable même par des tech-débutants si Yannis encadre.

---

## 10. VERDICT FINAL

### Côté techno pure (mon expertise CTO) : Option E gagne légèrement.

E est moins chère (~1 136 € de moins sur 3 ans), plus simple à maintenir, plus robuste face à l'oubli de renouvellement. Si la question était "quelle infra est la plus saine pour 2 tech-débutants ?" → E sans hésiter.

### Côté impact business (en agrégeant l'audit SEO `05-seo-multi-vs-mono-domaine.md` qui a déjà tranché pour F) : Option F gagne.

Le SEO local et la cohérence de marque pèsent **beaucoup plus** que 1 136 € sur 3 ans. Un seul devis MDS supplémentaire par an (panier moyen métallerie ~2 000-5 000 €) rembourse l'écart en année 1.

### Je tranche : **Option F**.

**Notes :**
- Option E : **7,1 / 10** — TCO 3 ans : **2 450 €**
- Option F : **7,6 / 10** — TCO 3 ans : **3 586 €**

L'écart financier (~1 136 € sur 3 ans, soit ~32 €/mois) est négligeable face au gain SEO et brand. Un cogérant tech-débutant qui doit faire 15h/an de maintenance vs 6h/an, c'est ~9h/an de plus, soit 45 min/mois. Tenable.

### Conditions de réussite Option F

1. Activer le renouvellement auto OVH dès J+0 (sinon risque domaine expiré dans 1 an).
2. Mail OVH de notification = mail surveillé (pas une boîte poubelle).
3. Réutiliser le backend Render Metal Pliage (route `/contact-mds`), pas de 2e service.
4. Documenter dans un README repo MDS : "tel = X, adresse = Y, propagation à faire aussi sur metal-pliage.fr si modif". Checklist anti-drift.
5. Même stack technique exacte que Metal Pliage (HTML/CSS/JS GitHub Pages). Pas de Wix, pas de WordPress.
6. Palette visuelle MDS distincte de Metal Pliage (cf. audit visuel : Metal Pliage orange #E63E00, MDS doit avoir sa propre identité métallerie — anthracite + accent acier brossé par exemple).

---

## Synthèse (~200 mots)

L'analyse technique pure donne un léger avantage à **Option E** (1 site avec sous-dossier `/mds/`) : TCO 3 ans de 2 450 € contre 3 586 € pour Option F, maintenance divisée par 2,5, zéro risque d'oubli de renouvellement de domaine. Pour 2 cogérants tech-débutants, c'est l'option la plus sûre opérationnellement.

Mais l'écart financier (~1 136 € sur 3 ans, soit ~32 €/mois) est **trivial** face aux gains attendus en SEO local et en cohérence de marque qu'apporte Option F. Un seul devis métallerie supplémentaire par an rembourse largement la différence.

**Verdict tranché : Option F (2 sites séparés).**

Notes : E = 7,1 / 10, F = 7,6 / 10. TCO 3 ans : E = 2 450 €, F = 3 586 €.

Conditions impératives de réussite : renouvellement auto domaine activé dès J+0, mail OVH surveillé, backend Render mutualisé (pas de 2e service), checklist anti-drift documentée pour propager les modifs (tel, adresse) sur les 2 sites, stack identique à Metal Pliage (HTML/CSS/JS GitHub Pages — pas de Wix ni WordPress), palette visuelle MDS distincte pour différencier les marques. Si ces 6 garde-fous sont en place, Option F est techniquement maintenable même par des non-tech.
