# Commercialisation & Hébergement — Metal Pliage V2

> Document de référence pour la mise en vente du site.
> Recommandations argumentées + plan d'action concret.
> Dernière révision : 2026-05-13

---

## SOMMAIRE

1. [Verdict — Shopify ou pas ?](#1-verdict--shopify-ou-pas-)
2. [Analyse posée du projet](#2-analyse-posée-du-projet)
3. [Pourquoi Shopify n'est pas adapté](#3-pourquoi-shopify-nest-pas-adapté)
4. [Migration vers Shopify : ce qui passe et ce qui casse](#4-migration-vers-shopify--ce-qui-passe-et-ce-qui-casse)
5. [Architecture recommandée](#5-architecture-recommandée)
6. [Comparatif hébergeurs](#6-comparatif-hébergeurs)
7. [Ma reco finale](#7-ma-reco-finale)
8. [Ce qu'il faut ajouter au site](#8-ce-quil-faut-ajouter-au-site)
9. [Paiement & encaissement](#9-paiement--encaissement)
10. [Logistique & expédition](#10-logistique--expédition)
11. [Service après-vente](#11-service-après-vente)
12. [Conformité légale obligatoire](#12-conformité-légale-obligatoire)
13. [Plan de mise en production en 7 jours](#13-plan-de-mise-en-production-en-7-jours)
14. [Budget mensuel récurrent](#14-budget-mensuel-récurrent)
15. [Plan B si tu veux quand même tester Shopify](#15-plan-b-si-tu-veux-quand-même-tester-shopify)

---

## 1. Verdict — Shopify ou pas ?

**Réponse courte : NON, pas pour Metal Pliage.**

Shopify est excellent pour des produits **standardisés** (t-shirts, bougies, livres). Ton produit est **du sur-mesure technique avec calcul prix dynamique**. Tu perdrais 70 % de la valeur unique de ton site (configurateurs SVG, calcul prix temps réel) pour gagner... un panneau admin que tu peux te coder en 2 jours.

**Garde ton site actuel. Héberge-le sérieusement. Ajoute un mini-admin.** Tu économises **2000-5000 €/an** et tu gardes le contrôle total.

---

## 2. Analyse posée du projet

### Ce que ton site fait déjà
- ✅ Configurateur couvertine (5 étapes, calcul prix temps réel)
- ✅ Configurateur pliage (formes U/L/Z, SVG dynamique du profil)
- ✅ Catalogue 28 produits + accessoires
- ✅ Panier
- ✅ Paiement Stripe Checkout
- ✅ Page commande confirmée
- ✅ Identité visuelle forte
- ✅ 32 finitions RAL avec preview

### Ce qui te manque
- ⏳ Hébergement production (HTTPS, domaine, scalabilité)
- ⏳ Réception structurée des commandes (BDD + email auto)
- ⏳ Mini-admin pour suivre/exporter
- ⏳ Génération automatique de factures
- ⏳ Suivi logistique (étiquettes transporteur)
- ⏳ Mentions légales + CGV
- ⏳ Programme avis client après livraison

**Conclusion :** tu n'as pas besoin d'une nouvelle plateforme. Tu as besoin de **finaliser celle que tu as**.

---

## 3. Pourquoi Shopify n'est pas adapté

### Le coût caché de Shopify

| Poste | Coût mensuel |
|---|---|
| Plan Shopify Basic | 36 €/mois |
| Plan Shopify (recommandé) | 105 €/mois |
| Plan Advanced (multi-devises, rapports) | 432 €/mois |
| Thème premium | 200-400 € (achat unique) |
| App "Configurateur produit" (Infinite Options / Bold) | 30-50 €/mois |
| App "Calcul prix dynamique" (Pricing Calculator) | 20-40 €/mois |
| App "SVG produit personnalisé" | 30-80 €/mois |
| App "Devis avant achat" | 25 €/mois |
| App email avancée | 20-50 €/mois |
| **Total réaliste pour Metal Pliage** | **250-700 €/mois** |

Soit **3000-8400 €/an** juste pour... la plateforme. Avant la moindre publicité ou vente.

### Les limites techniques pour TON cas

| Besoin Metal Pliage | Réalité Shopify |
|---|---|
| Calculer un prix en temps réel selon longueur × largeur × matière × RAL | Nécessite app + JS custom, performances dégradées |
| Afficher un SVG du profil de pliage qui se met à jour pendant que l'utilisateur change les dimensions | ⚠️ Quasi impossible sans code custom hors-app |
| Avoir un configurateur en 5 étapes avec validation | App payante limitée |
| Personnaliser totalement le HTML/CSS | Bridé par le thème + Liquid (langage Shopify) |
| Vitesse mobile | Souvent dégradée à cause des apps |

### Lock-in (dépendance)

Une fois sur Shopify :
- Tes données sont chez eux
- Tu paies à vie tant que tu vends
- Migrer vers autre chose = projet de 2-3 mois
- Tu acceptes leurs CGV qui peuvent changer
- Frais transactionnels supplémentaires (0.5-2 %) si tu n'utilises pas Shopify Payments

---

## 4. Migration vers Shopify : ce qui passe et ce qui casse

| Élément actuel | Migration Shopify |
|---|---|
| Catalogue accessoires (CSV produits) | ✅ Export CSV facile |
| Photos produits | ✅ Réutilisables |
| Textes / descriptions | ✅ Recopiables |
| Configurateur couvertine | ❌ **À refaire entièrement** avec apps payantes |
| Configurateur pliage (SVG dynamique) | ❌ **À refaire entièrement**, qualité inférieure attendue |
| Calcul prix temps réel | ❌ **À refaire**, dépendant d'apps |
| Design custom (thème sombre + orange) | ❌ **À refaire** dans un thème Shopify |
| Animations scroll, micro-interactions | ❌ Souvent perdues |
| Stripe Checkout | ⚠️ Remplacé par Shopify Payments (frais en plus) |
| Code Express.js (`server.js`) | ❌ **Jeté**, Shopify gère tout |
| Données SEO (URLs, meta) | ⚠️ Migration possible mais redirections à gérer |

**Verdict :** tu remplacerais 6 mois de développement custom par 2-3 mois de reconstruction sur une plateforme bridée, et tu paierais 5000 €/an à vie pour la perte de qualité. **Mauvais deal.**

---

## 5. Architecture recommandée

```
                  ┌─────────────────────────────────┐
                  │      VISITEUR / CLIENT          │
                  └─────────────────────────────────┘
                              │
                              ▼ (HTTPS)
              ┌─────────────────────────────────────┐
              │    CLOUDFLARE (CDN + DDoS gratuit)   │
              └─────────────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────────────┐
              │       SITE Metal Pliage             │
              │   ───────────────────────────       │
              │   • HTML/CSS/JS (frontend)          │
              │   • Express.js (server.js)          │
              │   • Configurateurs custom           │
              │   Hébergé sur : Railway ou OVH VPS  │
              └─────────────────────────────────────┘
                  │                       │
        ┌─────────┴─────────┐    ┌────────┴─────────┐
        ▼                   ▼    ▼                  ▼
   ┌─────────┐         ┌────────┐  ┌────────┐  ┌─────────┐
   │ Stripe  │         │ Brevo  │  │ BDD    │  │ Sendcloud│
   │ Paiement│         │ Emails │  │ SQLite │  │ Colis    │
   │ Factures│         │ + Marketing │ ou PG│  │ Étiquettes│
   └─────────┘         └────────┘  └────────┘  └─────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │  MINI-ADMIN         │
                              │  (interface simple) │
                              │  • Commandes        │
                              │  • Stock            │
                              │  • Prix produits    │
                              └─────────────────────┘
```

**Tout est modulaire.** Tu peux changer chaque brique sans toucher au reste.

---

## 6. Comparatif hébergeurs

### Pour Node.js + Express (ton stack)

| Hébergeur | Type | Prix | Setup | RGPD/FR | Note |
|---|---|---|---|---|---|
| **Railway** ⭐ | PaaS | 5-20 $/mois | ⭐⭐⭐⭐⭐ ultra simple | US | Push GitHub → déploiement auto, BDD intégrée. Le plus simple. |
| **Render** | PaaS | 7-25 $/mois | ⭐⭐⭐⭐⭐ | US | Plan gratuit pour tester. Très similaire Railway. |
| **OVH VPS** ⭐ | VPS | 5-15 €/mois | ⭐⭐⭐ technique | 🇫🇷 oui | Français, RGPD natif, idéal pour clients pros FR. |
| **Hetzner Cloud** | VPS | 4-10 €/mois | ⭐⭐⭐ technique | 🇩🇪 oui | Allemand, meilleur rapport qualité/prix. |
| **Vercel** | Serverless | Gratuit-20 $ | ⭐⭐⭐⭐⭐ | US | ⚠️ **Pas adapté** pour Express long-running. |
| **Fly.io** | PaaS | 5-30 $/mois | ⭐⭐⭐⭐ | EU possible | Performant, déploiement multi-régions. |
| **DigitalOcean App** | PaaS | 5-12 $/mois | ⭐⭐⭐⭐ | US | Fiable, bonne doc. |
| **O2switch** | Mutualisé | 7 €/mois | ⭐⭐ | 🇫🇷 oui | Français, mais Node mal supporté. Plutôt pour PHP/WordPress. |
| **AWS / GCP / Azure** | Cloud | Variable | ⭐ complexe | Régions EU dispo | Surdimensionné pour ton volume actuel. |

### Pour le domaine

| Registrar | Prix `.fr` | Avantages |
|---|---|---|
| **OVH** ⭐ | ~7 €/an | Français, simple, fiable |
| **Gandi** | ~15 €/an | Français historique, support excellent |
| **Cloudflare Registrar** | ~9 €/an | Prix coûtant, DNS ultra-rapide, déjà ton CDN |

**Recommandation :** acheter le `.fr` sur **OVH** ou **Cloudflare** (ne JAMAIS chez GoDaddy ou registrar opaque).

---

## 7. Ma reco finale

### Stack que je choisirais pour toi

| Brique | Choix | Pourquoi |
|---|---|---|
| **Domaine** | `metalpliage.fr` via Cloudflare | 9 €/an, DNS rapide |
| **Hébergement site** | **Railway** | Push GitHub → déploiement auto en 2 min |
| **CDN + sécurité** | Cloudflare (gratuit) | DDoS, cache, certif SSL auto |
| **Paiement** | Stripe Checkout (déjà en place) | Standard mondial, factures auto |
| **Base de données** | PostgreSQL sur Railway (inclus) | Robuste, simple |
| **Email transactionnel** | Brevo (300/jour gratuit) | Français, RGPD, devient marketing aussi |
| **Logistique** | Sendcloud ou Boxtal | Étiquettes Chronopost/DHL en 1 clic |
| **Analytics** | GA4 + Microsoft Clarity | Gratuit, complet |
| **Mini-admin** | Page `/admin` codée à la main | 2-3 jours de dev, sur mesure |

### Alternative si tu préfères 100 % français

| Brique | Choix |
|---|---|
| **Domaine** | OVH |
| **Hébergement** | **OVH VPS** (5 €/mois) ou Cleverwave/Clever Cloud (FR, ~10 €/mois) |
| **Email** | Brevo (français, basé à Paris) |
| **Tout le reste** | Idem |

> **Si je devais choisir une seule option : Railway.** Tu pousses sur GitHub, c'est en ligne. Pas de serveur à administrer. 10 €/mois tout compris. Tu peux migrer vers OVH plus tard si tu deviens vraiment grand.

---

## 8. Ce qu'il faut ajouter au site

### 8.1 Base de données pour les commandes
Actuellement Stripe Checkout reçoit les paiements mais tu n'as pas de stockage structuré des commandes côté toi.

**Ajouter une table `orders`** :
```
- id
- date
- client (nom, email, téléphone, adresse)
- panier (JSON des produits)
- montant total
- statut (en attente / payée / expédiée / livrée / problème)
- numéro de suivi
- notes internes
```

### 8.2 Webhook Stripe → BDD + email
À chaque paiement réussi :
1. Stripe envoie un webhook à ton serveur
2. Tu enregistres la commande en BDD
3. Tu envoies un email confirmation au client (via Brevo)
4. Tu envoies un email notification à toi-même

### 8.3 Mini-admin (page `/admin` protégée par mot de passe)
Vues à coder :
- Liste des commandes (filtrable par statut, date)
- Fiche commande détaillée (impression devis/BL)
- Changement de statut (passer "expédié" + ajouter numéro suivi)
- Gestion produits (prix, stock, désactiver)
- Export CSV pour comptable

**Temps de dev estimé :** 3-5 jours à temps plein.

### 8.4 Génération facture PDF
Stripe le fait nativement avec **Stripe Invoicing** (gratuit pour Stripe Checkout). Activer dans le dashboard Stripe.

### 8.5 Devis avant paiement
Pour les **commandes pros > 1000 €**, certains clients voudront un devis officiel avant de payer.

À ajouter : bouton "Demander un devis" à côté de "Payer maintenant" → envoie un email avec récap PDF → tu valides → lien de paiement envoyé.

---

## 9. Paiement & encaissement

### 9.1 Stripe (recommandé, déjà en place)
- ✅ Carte bancaire, Apple Pay, Google Pay
- ✅ SEPA virement
- ✅ Frais : **1.4 % + 0.25 €** par transaction CB (UE)
- ✅ Factures auto
- ✅ Remboursement en 1 clic
- ✅ Dashboard complet
- ✅ Versement 7 jours après paiement

### 9.2 Alternatives à ajouter en complément
- **Virement bancaire direct** : pour grosses commandes pros (économise 1.4 %)
- **Paiement 3 ou 4 fois** : via **Alma** (français, intégration Stripe) — boost conversion de 20-30 % sur paniers > 500 €
- **PayPal** : optionnel, 3.4 % de frais (cher) mais rassure certains clients

### 9.3 Pas besoin pour démarrer
- ❌ Cryptomonnaies
- ❌ Klarna (jeune public, pas ta cible)
- ❌ Solutions sur mesure

---

## 10. Logistique & expédition

### 10.1 Transporteurs adaptés à la métallurgie
Tes produits sont **longs** (jusqu'à 3-4 m), **lourds** (kg/ml), parfois **fragiles** (laquage).

| Transporteur | Pour quoi | Coût approx. |
|---|---|---|
| **Chronopost** | Colis < 30 kg, < 1.5 m | 15-30 € |
| **DHL Freight** | Palette / longueurs > 2 m | 50-150 € |
| **Geodis Calberson** | Spécial BTP/pro, palette | 40-120 € |
| **Schenker** | International | Variable |
| **Affrètement direct** | Très grosses commandes | À négocier |

### 10.2 Plateformes de gestion
- **Sendcloud** (PaaS expédition, intégration Stripe) — 23 €/mois, étiquettes en 1 clic
- **Boxtal** (français, tarifs négociés transporteurs) — gratuit, marge sur transport
- **Mondial Relay** pour petits colis accessoires

### 10.3 Emballage
- Tubes carton ou caisses bois pour longueurs
- Coins protecteurs angles RAL
- Film bulle + film étirable
- Sangles polyester

**Bonus marketing :** mettre une carte de remerciement + QR code "Donnez votre avis Google" dans chaque colis. **+200 % de taux d'avis.**

---

## 11. Service après-vente

### 11.1 Canaux à activer
- [ ] Email pro : `contact@metalpliage.fr` (via OVH ou Brevo)
- [ ] WhatsApp Business (gratuit, conversion forte)
- [ ] Téléphone fixe géolocalisé (idéal : ligne dédiée)
- [ ] Chat en direct sur le site : **Crisp.chat** (gratuit jusqu'à 2 agents) ou **Tawk.to** (100 % gratuit)
- [ ] Formulaire contact + FAQ

### 11.2 Gestion des retours / litiges
- CGV claires sur les retours (sur mesure = pas de rétractation légale, à mentionner explicitement)
- Garantie défaut de fabrication 2 ans (obligatoire en France)
- Procédure SAV documentée (gain de temps quand ça arrive)

---

## 12. Conformité légale obligatoire

### À ajouter AVANT mise en vente (sinon illégal en France)

- [ ] **Mentions légales** : nom société, SIRET, capital, siège, directeur publication, hébergeur
- [ ] **CGV** (conditions générales de vente) — obligatoires pour B2C
- [ ] **CGU** (conditions générales d'utilisation)
- [ ] **Politique de confidentialité** RGPD
- [ ] **Politique cookies** + bannière consentement (CNIL)
- [ ] Mention **droit de rétractation 14 jours** (sauf sur-mesure → mention explicite "pas de rétractation pour produits personnalisés")
- [ ] Mention **garantie légale de conformité 2 ans**
- [ ] **Médiateur de la consommation** désigné (obligatoire B2C)
- [ ] **Prix TTC affichés** avec mention "TVA 20 %"
- [ ] Délais de livraison clairs
- [ ] Coordonnées de contact accessibles en 2 clics

### Outils pour générer
- **legalplace.fr** : générateur mentions/CGV (~50 €)
- **captain-contrat.com** : idem
- **Avocat spécialisé** : ~300-600 € pour CGV BTP sur mesure (recommandé si CA > 100 k€/an)

### Statut juridique
Si pas encore créé :
- **Micro-entreprise** : si CA < 188 700 € (vente de biens). Très simple. Pas de TVA si CA < 91 900 €.
- **SASU/EURL** : si CA prévu > 100 k€ ou besoin d'investissement, recrutement.
- **SARL/SAS** : si plusieurs associés.

**Demande à ton expert-comptable** ou via **dougs.fr** / **shine.fr** pour création en ligne.

---

## 13. Plan de mise en production en 7 jours

### Jour 1 — Domaine & hébergement
- [ ] Acheter `metalpliage.fr` sur OVH ou Cloudflare (9-15 €)
- [ ] Créer compte Railway, connecter le repo GitHub `site-pierre-zinc`
- [ ] Configurer variables d'environnement (clés Stripe, Brevo)
- [ ] Premier déploiement automatique
- [ ] Pointer le domaine vers Railway
- [ ] Vérifier HTTPS actif

### Jour 2 — Cloudflare & sécurité
- [ ] Mettre Cloudflare en proxy du domaine (gratuit)
- [ ] Activer le pare-feu basique
- [ ] Activer cache + minification CSS/JS
- [ ] Tester vitesse sur PageSpeed Insights

### Jour 3 — Base de données + webhook Stripe
- [ ] Provisionner PostgreSQL sur Railway
- [ ] Créer table `orders`
- [ ] Coder le webhook Stripe → enregistre commande
- [ ] Tester paiement de bout en bout (mode test)
- [ ] Passer Stripe en mode **production**

### Jour 4 — Email transactionnel
- [ ] Compte Brevo + vérification domaine
- [ ] Template email "Confirmation commande client"
- [ ] Template email "Nouvelle commande" (pour toi)
- [ ] Branchement webhook Stripe → Brevo

### Jour 5 — Conformité légale
- [ ] Rédiger mentions légales, CGV, politique cookies (legalplace ou avocat)
- [ ] Intégrer pages au site
- [ ] Bannière cookies (Tarteaucitron.js ou Axeptio)
- [ ] Désigner médiateur (FEVAD ou CMAP)

### Jour 6 — Logistique
- [ ] Compte Sendcloud
- [ ] Branchement compte Chronopost ou Geodis
- [ ] Test étiquette d'expédition
- [ ] Définir tarifs port dans le panier (forfait ou calculé)

### Jour 7 — Tests & soft launch
- [ ] Test parcours complet : visite → configurateur → panier → paiement → email reçu → admin → expédition
- [ ] Test sur mobile (iOS + Android)
- [ ] Test depuis 3 navigateurs (Chrome, Safari, Firefox)
- [ ] Inviter 5-10 proches à passer une commande test
- [ ] Corriger les frictions remontées
- [ ] **Soft launch** = annoncer uniquement à ton entourage avant pub

---

## 14. Budget mensuel récurrent

### Stack minimale (mois 1-6)

| Poste | Coût |
|---|---|
| Domaine `.fr` | 1 €/mois |
| Railway (hébergement + BDD) | 10 €/mois |
| Cloudflare | 0 € |
| Stripe | 0 € fixe (frais variable 1.4 %) |
| Brevo | 0 € (puis ~25 € si > 300 emails/jour) |
| Sendcloud | 0-23 €/mois selon volume |
| **Total fixe** | **~10-60 €/mois** |

### Stack à vitesse de croisière (mois 6+, CA significatif)

| Poste | Coût |
|---|---|
| Hébergement (Railway upgrade) | 25 €/mois |
| Brevo Marketing | 25 €/mois |
| Sendcloud Pro | 23 €/mois |
| Stripe Atlas (compta auto) | 0 € |
| Alma (paiement N fois) | 0 % (commission sur ventes) |
| Crisp (chat) | 25 €/mois |
| Backup BDD | 5 €/mois |
| **Total fixe** | **~100-150 €/mois** |

**Comparaison Shopify équivalent : 300-700 €/mois.**
Économie annuelle : **2400-6600 €/an**.

---

## 15. Plan B si tu veux quand même tester Shopify

Je te déconseille mais si tu insistes, voici comment minimiser les dégâts :

### Option hybride : Shopify uniquement pour les accessoires
- Garde ton site actuel pour **couvertines + pliage sur mesure** (la valeur)
- Crée un sous-domaine `shop.metalpliage.fr` sur Shopify pour les **accessoires standard** (éclisses, visserie, colle)
- Avantage : tu testes Shopify sans détruire ton custom
- Inconvénient : 2 systèmes à maintenir, 2 paniers, 2 comptes client

### Plan Shopify minimum
- **Shopify Basic** : 36 €/mois
- Thème gratuit (Dawn, Sense)
- Apps gratuites uniquement au début
- Frais transactionnel : 0 % avec Shopify Payments, sinon 2 %

### Verdict honnête
Même cette option hybride n'est pas optimale. **Tes accessoires peuvent rester sur ton site actuel sans problème.** Tu te compliques la vie pour rien.

---

## 16. Décision à prendre cette semaine

**3 chemins possibles, choisis-en UN :**

### Chemin A — Recommandé ⭐
**Railway + ton site actuel + mini-admin**
- 7 jours de mise en prod
- ~10 €/mois
- Garde 100 % du custom
- Évolutif

### Chemin B — Si tu veux 100 % français
**OVH VPS + ton site actuel + mini-admin**
- 10-15 jours de mise en prod (plus technique)
- ~6 €/mois
- Garde 100 % du custom
- Sérénité RGPD

### Chemin C — Shopify
**Reconstruction complète**
- 2-3 mois de boulot
- 250-700 €/mois
- Perte de qualité sur les configurateurs
- Lock-in plateforme
- ❌ **Déconseillé pour ton cas**

---

## 17. Prochaine action concrète

**Aujourd'hui :**
1. Décider entre Chemin A (Railway) ou Chemin B (OVH)
2. Acheter le domaine `metalpliage.fr` (10 min, 9-15 €)
3. Créer le compte Railway ou OVH

**Cette semaine :**
- Suivre le [plan jour par jour](#13-plan-de-mise-en-production-en-7-jours)

> 👉 Dans 7 jours, ton site est en ligne, encaisse de l'argent en direct, et tu n'as pas payé 250 €/mois à Shopify.

---

*Document créé le 2026-05-13 — à mettre à jour selon le chemin choisi.*
