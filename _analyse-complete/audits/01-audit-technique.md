# Audit technique — Metal Pliage

Date : 2026-05-15
Auditeur : Claude Code (Opus 4.7)
Périmètre : `https://metal-pliage.fr` + sources `C:/Users/Utilisateur/Documents/Metal-pliage/`
Méthode : lecture du code source (HTML/CSS/JS), inspection du site live, comparaison aux bonnes pratiques web 2024/2026 (WCAG 2.2, Core Web Vitals, OWASP).

---

## 1. Vue d'ensemble

Le site est un site statique HTML/CSS/JS multi-pages hébergé sur GitHub Pages avec un domaine custom (`metal-pliage.fr`). Un backend Express (`server.js`) gère l'envoi d'emails via Brevo, mais **il n'est pas déployé en ligne** : le formulaire de contact en production pointe vers `/api/contact` qui n'existe pas sur GitHub Pages.

**Métriques brutes du dépôt :**

| Élément | Valeur |
|---|---|
| Pages HTML en racine | 26 (dont 6 backups/old + 3 confirmations) |
| Pages réellement utilisées en navigation | 11 (`index`, `couvertines`, `pliage`, `configurateur`, `configurateur-pliage`, `guides`, `contact`, `forme-libre`, + légales) |
| Fichiers CSS | 6 (`styles.css` 76 ko / 2712 lignes, `configurateur.css` 23 ko, `couvertines.css` 18 ko, `futuriste.css` 24 ko, `pliage.css` 5 ko, `preloader.css` 3 ko) |
| Fichiers JS | 8 (dont `pliage-backup-avant-patches.js`) |
| Total ligne CSS+JS | ~9 000 lignes |
| Poids du dossier `assets/` | **94 Mo** (photos 64 Mo, vidéos 31 Mo) |
| Plus grosse page HTML | `configurateur.html` = 60 ko (1500+ lignes) |
| Plus gros JS | `configurateur.js` = 38 ko |
| Plus gros CSS | `styles.css` = 76 ko |
| Sitemap / robots / favicon / manifest | **AUCUN** |

**Constat global :** la qualité visuelle/produit est très soignée (design system cohérent, animations propres, configurateurs interactifs), mais la couche infra/SEO/perf reste à un niveau "prototype" : pas de sitemap, pas de favicon, pas d'images optimisées, fichiers backup committés, formulaire mort en prod, clé Stripe test embarquée dans le bundle.

---

## 2. Défauts critiques

### CR-1 — Formulaire de contact non fonctionnel en production
**Sévérité : CRITIQUE**
**Fichiers : `js/main.js:182`, `server.js`, déploiement GitHub Pages**

Le formulaire `contact.html` poste vers `POST /api/contact` (`js/main.js:182-189`). Or GitHub Pages ne sert que des fichiers statiques — `server.js` (le seul handler de `/api/contact`) n'est jamais exécuté côté production. Résultat : toute soumission renvoie une 404 et le `catch` affiche `alert("Erreur d'envoi du message")`. **Tout prospect qui remplit ce formulaire perd son lead.**

**Solution :** déporter l'envoi vers un endpoint hébergé (Cloudflare Worker, Vercel function, Netlify Function) qui rappellera Brevo, OU utiliser un service no-code type FormSubmit / Formspree comme c'est déjà fait sur `forme-libre.html:431`. À court terme :

```html
<form class="contact-form"
      action="https://formsubmit.co/contact@metal-pliage.fr"
      method="POST"
      enctype="multipart/form-data">
  <input type="hidden" name="_subject" value="Demande de contact — Metal Pliage">
  <input type="hidden" name="_template" value="table">
  <input type="hidden" name="_next" value="https://metal-pliage.fr/contact.html?sent=1">
  <input type="text" name="_honey" style="display:none">
  ...
```

Puis dans `main.js`, retirer le `fetch('/api/contact')` ou le laisser en fallback si la prop `action` est présente.

---

### CR-2 — Schema.org pointe vers le mauvais domaine
**Sévérité : CRITIQUE (SEO)**
**Fichier : `index.html:29`**

Le JSON-LD LocalBusiness déclare `"url": "https://metalpliage.fr"` (sans tiret) alors que le site est sur `https://metal-pliage.fr` (CNAME confirmé). Pour Google, le LocalBusiness pointe donc vers un domaine inexistant — le Knowledge Graph et le rich snippet ne se rattacheront pas au bon site.

**Solution :**

```diff
- "url": "https://metalpliage.fr",
+ "url": "https://metal-pliage.fr",
```

Idem dans `_mockup/*` (8 occurrences) si ces pages ne sont pas exclues du crawl (voir CR-4).

---

### CR-3 — Photos hero non optimisées : 35+ Mo téléchargés à l'ouverture
**Sévérité : CRITIQUE (performance)**
**Fichiers : `index.html:451-470`, `assets/photos/`**

Le slideshow du hero charge **19 slides PNG/JPG**, chaque image pesant **1,7 à 2,8 Mo**. Le dossier `assets/photos/` totalise **64 Mo**. Toutes les images sont définies en `background-image` dans des `<div class="hs-slide">` simultanément présents dans le DOM, donc le navigateur les pré-télécharge ou les charge dès qu'elles deviennent actives. Aucune n'est en WebP/AVIF, aucune n'a de version `srcset`.

**Impact :**
- LCP estimé > 5s sur 4G.
- Bande passante mobile gaspillée (~40 Mo cumulés sur une visite complète du site).
- Score Lighthouse Performance attendu : < 40.

**Solution :**
1. Re-encoder en WebP/AVIF (objectif 150–300 ko par image en 1920px max width).
2. Charger uniquement la slide 0 d'entrée, lazy-load les suivantes via JS (déjà fait pour le cycle, mais l'image elle-même est inline en CSS donc précharchée).
3. Migrer les `<div style="background-image">` vers `<img loading="lazy" decoding="async" src="…" srcset="…">`.
4. La vidéo `hero 2.mp4` pèse **27 Mo** et est référencée dans `main.js:283` — la supprimer si pas utilisée ou la transcoder en H.265 / AV1.

---

### CR-4 — Fichiers backup et dossiers dev committés sur la production
**Sévérité : MAJEUR (SEO + sécurité)**
**Fichiers concernés :**
- `configurateur-backup-avant-schemas.html` (62 ko)
- `configurateur-pliage-backup-avant-patches.html` (27 ko)
- `index-backup-avant-d3.html` (62 ko)
- `index-original.html` (59 ko)
- `couvertines-old-catalogue.html` (46 ko, contient **20+ liens cassés `href="#"`**)
- `js/pliage-backup-avant-patches.js` (29 ko)
- `_mockup/` (19 fichiers HTML)
- `_dev/` (39 fichiers HTML)

Ces fichiers sont accessibles publiquement (`https://metal-pliage.fr/index-backup-avant-d3.html`, etc.) et seront crawlés par Google : **contenu dupliqué massif** + dilution SEO. `couvertines-old-catalogue.html` expose 20+ liens `href="#"` (anti-pattern).

**Solution :**
1. Supprimer du repo (`git rm`) tous les fichiers `*-backup-*`, `*-original*`, `*-old-*`, `pliage-backup-avant-patches.js`.
2. Ajouter dans `.gitignore` :
   ```
   _dev/
   _mockup/
   *-backup-*.html
   *-old-*.html
   *-original.html
   ```
3. Créer `robots.txt` :
   ```
   User-agent: *
   Disallow: /_dev/
   Disallow: /_mockup/
   Disallow: /*-backup-*
   Sitemap: https://metal-pliage.fr/sitemap.xml
   ```

---

### CR-5 — Aucun sitemap.xml ni robots.txt
**Sévérité : MAJEUR (SEO)**
**Confirmé via WebFetch :** `https://metal-pliage.fr/sitemap.xml` → 404, idem `/robots.txt`.

Google n'a aucun moyen de découvrir l'arborescence du site et finira par indexer aussi les pages mockup/backup (cf CR-4).

**Solution :** générer un `sitemap.xml` minimal :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://metal-pliage.fr/</loc><priority>1.0</priority></url>
  <url><loc>https://metal-pliage.fr/couvertines.html</loc><priority>0.9</priority></url>
  <url><loc>https://metal-pliage.fr/pliage.html</loc><priority>0.9</priority></url>
  <url><loc>https://metal-pliage.fr/configurateur.html</loc><priority>0.8</priority></url>
  <url><loc>https://metal-pliage.fr/configurateur-pliage.html</loc><priority>0.8</priority></url>
  <url><loc>https://metal-pliage.fr/guides.html</loc><priority>0.7</priority></url>
  <url><loc>https://metal-pliage.fr/contact.html</loc><priority>0.7</priority></url>
  <url><loc>https://metal-pliage.fr/forme-libre.html</loc><priority>0.6</priority></url>
  <url><loc>https://metal-pliage.fr/cgv.html</loc><priority>0.2</priority></url>
  <url><loc>https://metal-pliage.fr/mentions-legales.html</loc><priority>0.2</priority></url>
  <url><loc>https://metal-pliage.fr/confidentialite.html</loc><priority>0.2</priority></url>
  <url><loc>https://metal-pliage.fr/livraison-retours.html</loc><priority>0.2</priority></url>
</urlset>
```

---

## 3. Défauts majeurs

### MA-1 — Aucun favicon ni manifest PWA
**Sévérité : MAJEUR**
**Fichiers : toutes pages HTML**

`grep favicon` = 0 résultat. Conséquence : icône générique grise dans les onglets, mauvaise impression de finition, partage social cassé (pas d'`og:image` non plus — voir MA-2).

**Solution :**
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#FF4500">
```

---

### MA-2 — Aucune `og:image` ni `twitter:image`
**Sévérité : MAJEUR (réseaux sociaux)**
`index.html:9-15` déclare `og:title` + `og:description` + `twitter:card="summary_large_image"` mais **aucune image n'est fournie**. Sur Facebook/LinkedIn/WhatsApp, le partage affichera un encart vide. Le `summary_large_image` Twitter refusera carrément le rendu.

**Solution :** créer une image de partage 1200×630 (`og-cover.jpg`) et ajouter :
```html
<meta property="og:image" content="https://metal-pliage.fr/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:image" content="https://metal-pliage.fr/og-cover.jpg">
<meta property="og:url" content="https://metal-pliage.fr/">
```

---

### MA-3 — Aucune balise canonical
**Sévérité : MAJEUR (SEO)**
0 occurrence de `<link rel="canonical">` dans les pages. Combiné avec CR-4 (pages backup) et le fait que GitHub Pages sert aussi sur `*.github.io`, on a un risque réel de contenu dupliqué.

**Solution :** sur chaque page :
```html
<link rel="canonical" href="https://metal-pliage.fr/couvertines.html">
```

---

### MA-4 — Clé Stripe publique en dur dans le JS et test mode en prod
**Sévérité : MAJEUR (commerce)**
**Fichier : `js/cart.js:10`**

```js
const STRIPE_PK = 'pk_test_51TTNAxAgv3zk...';
```

C'est une clé publique (donc OK d'être exposée), **mais c'est une clé de test** (`pk_test_`). Tout client qui clique "Procéder au paiement" se verra refuser la transaction si vous passez en `pk_live_` côté serveur. De plus, le checkout appelle `/api/create-checkout-session` (`cart.js:210`) qui — comme CR-1 — n'existe pas en prod. **Le paiement est complètement cassé en ligne.**

**Solution :**
1. Décider du modèle commercial : devis manuel ou e-commerce direct. Si devis : retirer Stripe, retirer le panier, remplacer "Procéder au paiement" par "Demander un devis avec ce panier".
2. Si e-commerce : déployer un endpoint serveur (Vercel/Cloudflare) et passer la clé `pk_live_` via une variable globale injectée au build.

---

### MA-5 — Aucune protection anti-spam sur le formulaire de contact
**Sévérité : MAJEUR**
**Fichier : `contact.html:262-304`**

Pas de honeypot, pas de reCAPTCHA, pas de rate-limit. Le serveur Express (`server.js`) valide juste le format email — facilement contournable par un bot.

**Solution honeypot :**
```html
<input type="text" name="_honey" tabindex="-1" autocomplete="off"
       style="position:absolute;left:-9999px" aria-hidden="true">
```
Côté serveur (ou FormSubmit qui gère automatiquement `_honey`) : refuser si rempli. Optionnel : `hCaptcha` ou `Cloudflare Turnstile`.

---

### MA-6 — Stripe.js chargé sur l'index alors qu'inutile
**Sévérité : MAJEUR (performance)**
**Fichier : `index.html:705`**

`<script src="https://js.stripe.com/v3/"></script>` charge ~100 ko de JS Stripe sur la page d'accueil, alors que le checkout n'est déclenché que depuis le panier (cf MA-4). Sur les autres pages (`couvertines.html`, `pliage.html`, `contact.html`, etc.) le script n'est même pas inclus — preuve qu'il n'est pas utile à l'index.

**Solution :** charger Stripe à la demande (lazy) seulement quand `btn-checkout` est cliqué :
```js
async function loadStripe() {
  if (window.Stripe) return window.Stripe;
  await new Promise((res) => {
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.onload = res;
    document.head.appendChild(s);
  });
  return window.Stripe;
}
```

---

### MA-7 — Hiérarchie des titres incohérente sur configurateur-pliage
**Sévérité : MAJEUR (accessibilité, SEO)**
**Fichier : `configurateur-pliage.html`**

La page contient 1 `<h1>` (header), puis enchaîne directement avec **13 occurrences de `<h2>`** dont certaines à l'intérieur d'autres `<h2>` parents (Étape 1, 2, 3…). Pas d'erreur structurelle mais hiérarchie plate. La page `configurateur.html` n'a que **9 occurrences** de h1/h2/h3 confondus (vérifié).

**Solution :** transformer les "Étape X" en `<h2>` et le titre principal de page en `<h1>` unique (déjà fait), mais utiliser des `<h3>` pour les sous-blocs (Sens de laquage, Quantité…). Vérifier avec `axe DevTools`.

---

### MA-8 — Lazy-loading quasi inexistant sur les images
**Sévérité : MAJEUR (performance)**
Sur les 26 occurrences `<img>` du repo, seules **5 ont `loading="lazy"`** (`index.html:610`, `couvertines.html:206`, `index-backup`, etc.). Tous les fonds CSS du hero (CR-3) ne sont évidemment pas lazy. Aucune image n'utilise `decoding="async"` ni `fetchpriority`.

**Solution :**
- Toutes les `<img>` non-hero : `loading="lazy" decoding="async"`.
- Image hero principale : `fetchpriority="high"`.
- `width` et `height` explicites pour réserver l'espace et éviter le CLS.

---

### MA-9 — Liens cassés `href="#"` sur la page couvertines-old
**Sévérité : MAJEUR (UX, SEO)**
**Fichier : `couvertines-old-catalogue.html`** — 20+ liens `<a class="prod-link" href="#">`. Cette page est servie publiquement (CR-4) et tous les liens "Voir le produit" sont morts.

**Solution :** voir CR-4 (suppression du fichier).

---

### MA-10 — Animations bloquantes sans `prefers-reduced-motion` global
**Sévérité : MAJEUR (accessibilité)**
**Fichiers : `index.html:47-205` (reflet acier brossé, 3.5s, animations multiples), `js/main.js`, `js/preloader.js:69`**

Le preloader respecte `prefers-reduced-motion: reduce` (`preloader.js:69`) — bien. Mais les animations CSS dans `index.html` (`pan-reflect`, `fadeUp`, `pan-reflect-sub`) ne sont jamais désactivées pour un utilisateur qui a demandé "moins d'animations". WCAG 2.2 critère 2.3.3.

**Solution :** ajouter en CSS global :
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 4. Défauts mineurs

### MI-1 — Cache-Control `no-cache` en local
**Fichier : `server.js:34`** — `Cache-Control: no-cache` est OK pour le dev, mais le déploiement en prod (GitHub Pages) gère ses propres en-têtes. Note : pas d'impact en ligne.

### MI-2 — `font-display:swap` implicite mais pas de subsetting
**Fichier : `index.html:19`** — La requête Google Fonts charge `Inter` poids 300/400/500/600/700/800. Six graisses = 6 fichiers. Si seules 3-4 sont réellement utilisées, alléger l'URL : `family=Inter:wght@400;500;600;700&display=swap`.

### MI-3 — Logo retour-haut redirige vers `#` au lieu de `index.html`
**Fichier : `index.html:638`** — `<a href="#" class="logo footer-logo">` au lieu de `href="#hero"` ou `href="/"`. Sur Safari iOS, cliquer `href="#"` peut produire un scroll erratique.

### MI-4 — `target="_blank"` jamais utilisé mais le code prévoit ce cas (`preloader.js:110`)
Pas d'impact réel mais incohérent — supprimer la branche si jamais utilisée.

### MI-5 — `console.error` et `alert` en prod
**Fichiers : `cart.js:229`, `main.js:195`** — `alert()` est obsolète UX (modal bloquante). À remplacer par un `<div role="alert">` inline avec animation.

### MI-6 — 613 occurrences `style="…"` (CSS inline)
Pourrait être refactorisé en classes pour faciliter la maintenance, mais sans urgence puisque le projet est statique.

### MI-7 — Pas d'ID unique sur les inputs `name="..."`
**Fichier : `forme-libre.html`** — Les inputs ont des `name` accentués (`name="Société"`, `name="Matière"`) qui peuvent poser problème selon les parseurs CGI. Préférer `name="societe"`, `name="matiere"`.

### MI-8 — Multiple `<style>` blocks en tête de page au lieu d'un seul fichier CSS
**Fichiers : `index.html:47-406` (360 lignes inline), `contact.html:14-176`, `couvertines.html:14-154`, `configurateur-pliage.html:20-282`, `pliage.html:14+`** — Tout ce CSS spécifique-page pourrait être déporté dans un `page-{name}.css` chargé seulement sur la page concernée. Améliore aussi le cache navigateur.

### MI-9 — `aria-hidden="true"` sur `cart-drawer` initialement, mais aussi `hidden`
Convention HTML : utilisez l'un OU l'autre (`hidden` ferme l'arbre accessible). Sur `configurateur-pliage.html:659`, `<div id="cart-drawer" hidden>` + `aria-modal="true"` mais `aria-hidden` absent — incohérence.

### MI-10 — `<select>` sans option par défaut "vide" accessible
**Fichier : `contact.html:286`** — `<option value="" disabled selected>Sélectionner un produit</option>` : OK pour le visuel mais `disabled` + `selected` est anti-pattern. Préférer `<option value="">Sélectionner un produit</option>` puis valider côté JS.

### MI-11 — Année footer en dur
**Fichier : `index.html:658`** — `© <span id="footer-year">2026</span>` : la valeur est écrasée par `main.js:212` (`yearEl.textContent = new Date().getFullYear()`), donc si JS désactivé l'année reste 2026 (OK aujourd'hui mais cassera en 2027). Acceptable mais non robuste.

### MI-12 — Préchargement Inter sur toutes les pages mais pas de `preload` woff2
Pour gagner du LCP : `<link rel="preload" as="font" href="…woff2" crossorigin>` sur les graisses critiques.

---

## 5. Sécurité

### SE-1 — `.env` exclu de git mais `.env.example` expose la structure
**Fichier : `.env.example`** — Comportement normal et attendu. Ce n'est pas une fuite. Le `.gitignore` exclut bien `.env` (`l.3`).

### SE-2 — `pliage.html` et autres injectent du HTML via `innerHTML` non-échappé
**Fichier : `js/pliage.js:807` (`help.innerHTML = HELP[sens]`)** — Le contenu est statique (constante locale), donc pas de risque XSS, mais on prend une mauvaise habitude. Préférer `textContent` quand possible.

### SE-3 — Form contact côté serveur : XSS bien géré
**Fichier : `server.js:38-42`** — La fonction `escapeHtml` est correctement appliquée à tous les champs avant injection dans l'email. **Bon point.**

### SE-4 — Pas de Content-Security-Policy
**Fichier : tous HTML** — Aucune `<meta http-equiv="Content-Security-Policy">`. Sur un site statique avec Stripe + Google Fonts + Brevo, on peut au moins poser :
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.brevo.com https://api.stripe.com;
  frame-src https://js.stripe.com;
">
```

### SE-5 — `forme-libre.html` envoie à FormSubmit en clair
**Fichier : `forme-libre.html:431`** — `formsubmit.co` est en HTTPS, bon. Mais `_captcha=false` désactive le captcha — c'est volontaire mais expose au spam.

---

## 6. Accessibilité (WCAG 2.2)

| Item | État | Note |
|---|---|---|
| `lang="fr"` sur `<html>` | OK | Présent partout |
| `<title>` unique par page | OK | Bien rédigés |
| `aria-label` sur boutons icônes | OK | Excellent (1600 occurrences) |
| Texte alternatif sur images | Partiel | `assets/images/fabrication.jpg` OK, mais 19 slides en `background-image` non décrites |
| Contraste texte | À vérifier | `--text-muted: #C8C8C8` sur `--bg-base: #242424` = ratio 5.7:1 OK. `--text-secondary: #E0E0E0` sur `--accent: #FF4500` = ratio à mesurer en pied de page |
| Navigation clavier | OK | `tabindex`, `aria-pressed`, `aria-expanded` bien posés sur `contact.html:226` et configurateur |
| Focus visible | À vérifier | Pas de `:focus-visible` global trouvé dans `styles.css` |
| Heading hierarchy | Partiel | Voir MA-7 |
| `prefers-reduced-motion` | Partiel | Voir MA-10 |
| Formulaires : `label` + `for` | OK | `contact.html:265`, `configurateur-pliage.html:490` |

**À ajouter :**
```css
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
```

---

## 7. Configurateurs : qualité du code et UX

### Couvertine (`configurateur.html` + `configurateur.js`)
- Architecture en IIFE propre, state centralisé, MATERIALS/RAL_COLORS bien factorisés.
- `unlockStep(n)` simple et lisible.
- **Manque :** persistance du state (localStorage) — un refresh perd toute la config.
- **Manque :** export PDF / partage de la configuration par URL.
- **Manque :** validation en temps réel des dimensions (juste un `min`/`max` HTML).

### Pliage (`configurateur-pliage.html` + `pliage.js`)
- 865 lignes, plus complexe (4 formes, 3 matières, 3 épaisseurs, sens de laquage).
- Très bon découpage avec `SHAPES` (forme → dimKeys → pts → dev).
- **Bug potentiel** : le `MutationObserver` dans `configurateur-pliage.html:822` se reconnecte avec `setTimeout(50)` après chaque update — si une mise à jour SVG arrive pendant ce délai, elle est perdue. Pas critique mais fragile.
- **Bug** : `RATES['acier-1.5'] = 100` et `RATES['alu-1.5'] = 100` même tarif au m² alors que l'alu coûte 2-3× plus cher au kilo. À valider commercialement.
- **Manque :** sauvegarde panier dans localStorage — vidé au refresh.
- **Manque :** prévisualisation 3D ou photo réelle du résultat (juste un schéma SVG 2D).

### Cart (`cart.js`)
- Design clean, gestion drawer OK.
- `cart` est en variable locale, **non persisté** : un F5 vide le panier.
- `Stripe()` global utilisé mais script chargé seulement sur index (MA-6).
- Pas de protection multi-onglet (deux onglets = deux paniers indépendants).

---

## 8. Liens internes : audit

Vérification de cohérence des liens dans la nav et le footer :

| Lien | Cible | État |
|---|---|---|
| `couvertines.html` | OK | Existe |
| `pliage.html` | OK | Existe |
| `guides.html` | OK | Existe |
| `contact.html` | OK | Existe |
| `configurateur.html` | OK | Existe (couvertine) |
| `configurateur-pliage.html` | OK | Existe |
| `forme-libre.html` | OK | Existe |
| `accessoires.html` | OK | Existe (mais pas en nav) |
| `chapeaux-de-piliers.html` | OK | Existe (mais pas en nav) |
| `appuis-de-fenetre.html` | OK | Existe (mais pas en nav) |
| `habillages-bandeaux.html` | OK | Existe (mais pas en nav) |
| Liens internes "#diptyque", "#fabrication" | OK | Ancres présentes dans `index.html` |
| `couvertines-old-catalogue.html` (`href="#"` × 20) | KO | 20 liens morts (cf MA-9) |

Les pages `accessoires.html`, `chapeaux-de-piliers.html`, `appuis-de-fenetre.html`, `habillages-bandeaux.html` existent mais ne sont liées **nulle part** dans la nav active — orphelines. Soit les supprimer, soit les exposer dans le sous-menu pliage.

---

## 9. TOP 10 corrections prioritaires

| # | Action | Sévérité | Effort | Impact |
|---|---|---|---|---|
| 1 | **Réparer le formulaire contact** (basculer sur FormSubmit ou Netlify Forms) | CRITIQUE | S | Récupère 100% des leads |
| 2 | **Corriger l'URL schema.org** `metalpliage.fr` → `metal-pliage.fr` | CRITIQUE | S | Knowledge Graph Google |
| 3 | **Supprimer les fichiers backup** + ajouter `_dev/` et `_mockup/` au gitignore | MAJEUR | S | Évite indexation parasite |
| 4 | **Optimiser les 19 photos hero** : WebP, 1920×, lazy, max 300 ko/img | CRITIQUE | M | LCP / Lighthouse / data mobile |
| 5 | **Créer `sitemap.xml` + `robots.txt`** | MAJEUR | S | Indexation Google |
| 6 | **Ajouter favicon, og:image, canonical** sur toutes les pages | MAJEUR | M | Partage social + dédup SEO |
| 7 | **Lazy-load Stripe.js** + décider du modèle e-com vs devis | MAJEUR | M | -100 ko sur l'index |
| 8 | **Honeypot anti-spam** sur tous les formulaires | MAJEUR | S | Bloque 95% des bots |
| 9 | **`@media (prefers-reduced-motion)`** + `:focus-visible` global | MAJEUR | S | WCAG 2.2 |
| 10 | **Persister cart + state configurateur** dans localStorage | NICE-TO-HAVE | M | UX (zero perte sur F5) |

**Légende effort :**
- **S** = Small, < 1h
- **M** = Medium, 1-4h
- **L** = Large, > 4h

---

## 10. Recommandations long terme

1. **Pipeline de build** : intégrer un bundler simple (Vite/Parcel) pour minifier CSS/JS automatiquement, hasher les noms de fichiers (cache busting), et purger le CSS inutilisé. Le `styles.css` de 2712 lignes contient probablement 30-40% de règles non utilisées sur chaque page donnée.
2. **Tests automatisés** : Lighthouse CI sur GitHub Actions, Pa11y pour l'a11y, broken-link-checker pour les liens internes.
3. **Monitoring** : Sentry ou Plausible (le second est meilleur pour la RGPD) — actuellement aucun tracking n'est en place, impossible de mesurer la performance réelle ou détecter une erreur JS.
4. **Hébergement backend** : si l'envoi d'email est important, déployer `server.js` sur Render.com (gratuit) ou migrer vers une Cloudflare Worker (gratuit jusqu'à 100k req/jour).
5. **CDN images** : Cloudinary ou Imgix pour les visuels — transformation à la volée, WebP/AVIF auto.

---

## Annexes

### A. Inventaire des fichiers à supprimer
```
configurateur-backup-avant-schemas.html       (62 ko)
configurateur-pliage-backup-avant-patches.html (27 ko)
index-backup-avant-d3.html                    (62 ko)
index-original.html                           (59 ko)
couvertines-old-catalogue.html                (46 ko, +20 liens morts)
js/pliage-backup-avant-patches.js             (29 ko)
_mockup/                                      (~700 ko, 19 fichiers)
_dev/                                         (~1.5 Mo, 39 fichiers)
server.log, server.err                        (déjà gitignorés)
```
**Gain : ~2.5 Mo supprimés du repo + 60+ pages désindexées.**

### B. Inventaire des fichiers à créer
```
robots.txt
sitemap.xml
favicon.svg + favicon-32.png + apple-touch-icon-180.png
og-cover.jpg (1200×630)
site.webmanifest
```

### C. Outils recommandés
- **Squoosh** (Google) : optimisation image one-shot
- **Lighthouse** (Chrome DevTools) : audit perf/a11y/SEO
- **WAVE** (WebAIM) : a11y détaillée
- **axe DevTools** : a11y automatisée
- **PageSpeed Insights** : Core Web Vitals
- **Schema.org Validator** : tester le JSON-LD corrigé

---

*Fin du rapport — Total : ~3 800 mots.*
