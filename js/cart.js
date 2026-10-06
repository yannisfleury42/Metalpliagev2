/* ═══════════════════════════════════════════════════════════════
   cart.js — Panier + demande de commande (sans paiement immédiat)
   Metal Pliage
   Flux : le client valide sa demande → email à MDS via FormSubmit →
          MDS vérifie et envoie un lien de paiement (carte ou virement).
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── CONFIG ───────────────────────────────────────────────── */
  const ORDER_EMAIL = 'contact@metal-pliage.fr';
  const STORAGE_KEY = 'mp_cart';   // panier persistant (survit aux changements de page)

  /* ── MODELE D'EXPEDITION (revise 2026-10-06) ──────────────
     Adosse au BAREME GEODIS SIGNE — offre messageriePlus France, reference
     client MY50, domicile/domicile HT au depart de Saint-Etienne, applicable
     du 01/10/2026 au 30/09/2027. Compte ouvert en facturation mensuelle,
     ENLEVEMENT COMPRIS, delai ~2 jours.

     Ce bareme remplace les deux prix spot (DOUISSARD 63,27 / FRUMHOLTZ 42,03)
     sur lesquels cette grille etait calee, et il invalide ce qu'on en avait
     deduit. A ne plus jamais rouvrir :

     1. LA PENTE A 3,86 EUR/KG N'EXISTE PAS. Entre deux tranches voisines le
        bareme monte de ~1 EUR/kg. Le port est un FIXE DE ZONE, pas un prix au
        kilo. Verification : FRUMHOLTZ 4,1 kg vers le 57 = 41,74 au bareme contre
        42,03 factures (0,7 % d'ecart). DOUISSARD 9,6 kg vers le 88 = 50,55 au
        bareme contre 63,27 factures : c'etait un prix spot d'avant bareme.

     2. LA FACTURATION EST VOLUMETRIQUE. Ligne 116 du bareme : rapport
        poids/volume >= 150 kg/m3. Le poids taxable est donc
        max(poids brut ; volume x 150), arrondi au kg superieur — et sur TOUT
        notre catalogue c'est le volume qui gagne. Une couvertine alu 1,5 de 2 m
        pese 2,4 kg reels et 7 kg TAXABLES. Consequence : alleger l'emballage ne
        fait rien gagner, SEULE LA SECTION DU COLIS FAIT LE PRIX.

     3. LE PIRE CAS METROPOLE N'EST PAS PARIS mais la Bretagne/Normandie des
        5 kg (29 Finistere : 59,08 en 10-14 kg contre 55,45 pour le 75, et
        l'ecart se creuse avec le poids). La surcharge Ouest/Nord-Ouest annoncee
        oralement le 28/09 est donc DEJA INTEGREE EN ZONE.

     Yannis a choisi un PRIX NATIONAL UNIQUE, pas de majoration au code postal
     (le client du 42 paie donc 60 EUR pour un envoi qui en coute 28 ; la reponse
     a ce cas est le retrait atelier gratuit, pas une grille par departement).
     Chaque tranche est donc calee sur le DEPARTEMENT LE PLUS CHER de metropole,
     + 9,9 % de surcharge energie PROVISIONNEE, + 4 EUR d'emballage, arrondi :

       tranche   pire metro   +9,9 %   +4 EUR   retenu
       0-4 kg      45,44       49,94    53,94     55
       5-9 kg      50,70       55,72    59,72     60
       10-14 kg    59,08       64,93    68,93     70
       15-19 kg    67,51       74,19    78,19     80
       20-29 kg    75,90       83,41    87,41     90
       30-39 kg    82,64       90,82    94,82     95

     Pas de +15 % par-dessus : ces 15 % absorbaient une surcharge de zone
     inconnue, elle est maintenant dans le bareme et on se cale sur le maximum.
     Le port est vendu au cout, la marge vient de la piece.

     LES BORNES SONT CELLES DE GEODIS (4/9/14/19/29/39/49/59/69/79/99) et pas
     des chiffres ronds. C'est le defaut qui coutait le plus cher : une tranche
     << <= 10 kg >> facture le tarif 5-9 alors qu'a 10 kg Geodis bascule en 10-14.

     RESERVE ASSUMEE : les 9,9 % de surcharge energie sont PROVISIONNES, pas
     confirmes. Le fichier s'intitule << tout inclus >> mais sa ligne 113 dit
     << hors surcharge energie >> ; le 9,9 vient d'une cellule orpheline de la
     feuille. Si Cedric Chauveau (Geodis, 07 64 56 16 65) confirme le tout
     inclus, chaque tranche peut baisser de ~5 EUR. Reste aussi a chiffrer
     l'AD VALOREM : la responsabilite est plafonnee a 33 EUR/kg et 1 000 EUR par
     colis, soit 79 EUR d'indemnite pour une couvertine alu de 2,4 kg cassee.
     Detail : reference_grille_port_metalpliage en memoire. ── */

  const TVA = 1.20;

  // Masse surfacique. On ne code pas << 4,05 kg/m2 >> en dur : le configurateur
  // pliage vend 3 matieres et 5 epaisseurs, la densite est la seule donnee qui
  // ne se perime pas.
  const DENSITE = { alu: 2700, acier: 7850, inox: 7900 };   // kg/m3
  function kgParM2(material, thicknessMm) {
    const d = DENSITE[material];
    if (!d || !thicknessMm) return null;
    return d * (thicknessMm / 1000);
  }

  /* Emballage : PAPIER BULLE, confirme par Yannis le 06/10/2026. Pas de
     chevron, pas de corniere, pas de fardeau — rien qui ajoute du poids. Ces
     0,2 kg ne servent qu'a declarer un poids brut juste au transporteur : ils
     ne changent AUCUN prix, puisque c'est le volume qui fait le poids taxable. */
  const EMBALLAGE_KG = { petit: 0.1, long: 0.2 };

  /* Ratio de poids taxable impose par le bareme (ligne 116) : 150 kg/m3. */
  const KG_PAR_M3 = 150;

  /* ── GEOMETRIE DU COLIS = GEOMETRIE DU PRIX ────────────────
     Puisque le prix se fait au volume, l'enveloppe declaree EST le tarif. Calee
     sur le seul colis reellement mesure (DOUISSARD : 2 050 x 260 x 120 pour
     2 pieces), d'ou largeur 260 fixe et hauteur 60 + 30 par piece.

     HAUTEUR QUI FAIT CHANGER DE TRANCHE (largeur 260) — le seul parametre a
     surveiller a l'atelier :
       2 000 mm : 60 EUR jusqu'a 112 mm, 70 jusqu'a 174, 80 jusqu'a 236
       2 500 mm : 60 EUR jusqu'a  90 mm, 70 jusqu'a 140, 80 jusqu'a 190
       3 000 mm : 60 EUR jusqu'a  75 mm, 70 jusqu'a 117, 80 jusqu'a 159
     En 3 m, 75 mm d'epaisseur de colis valent 10 EUR.

     A RECALER sur les prochains envois reels (demande de Yannis du 06/10) : si
     l'atelier emballe plus epais que ce qui est declare ici, Geodis refacture et
     la marge part. C'est le seul vrai risque de cette grille. ── */
  const COLIS_LARGEUR_MM = 260;
  const COLIS_HAUTEUR_BASE_MM = 60;
  const COLIS_HAUTEUR_PAR_PIECE_MM = 30;

  /* ── UN SEUL RESEAU, UNE SEULE GRILLE ────────────────────
     Geodis n'a AUCUNE offre colis sous 1,20 m : son 0-4 kg est a 45,44 EUR pire
     metropole. Les 11 / 14 / 18 / 26 EUR de l'ancienne GRILLE_PETIT etaient des
     prix de reseau colis type La Poste, jamais mesures, et une perte seche de
     ~30 EUR par envoi. Tant qu'un compte Colissimo Entreprise n'est pas ouvert,
     TOUT part chez Geodis et tout se tarife avec la meme grille. Un carton de
     visserie seule (42 EUR HT) coute donc 55 EUR de port : dissuasif, mais
     honnete — et c'est le comportement voulu, la visserie voyage GRATUITEMENT
     dans le colis d'une couvertine, elle n'a aucune raison de partir seule.
     Ouvrir Colissimo est la seule facon de descendre cette premiere tranche.

     La longueur ne sert plus qu'a declarer le bon gabarit, plus a choisir un
     tarif. Au-dela de 99 kg taxables, hors metropole ou au-dela de 4 m : pas de
     prix devine, on cote. */
  const SEUIL_PETIT_MM = 1200;
  const SEUIL_MAX_MM   = 4000;

  const GRILLE = [            // bornes = celles du bareme Geodis, en centimes HT
    { maxKg:  4, ht:  5500 },
    { maxKg:  9, ht:  6000 },
    { maxKg: 14, ht:  7000 },
    { maxKg: 19, ht:  8000 },
    { maxKg: 29, ht:  9000 },
    { maxKg: 39, ht:  9500 },
    { maxKg: 49, ht: 10500 },
    { maxKg: 59, ht: 11000 },
    { maxKg: 69, ht: 12000 },
    { maxKg: 79, ht: 12500 },
    { maxKg: 99, ht: 14000 },
  ];                          // > 99 kg : cotation

  /* Franco de port — recale le 06/10/2026 a 300 EUR TTC, SANS PLAFOND DE POIDS.

     Le plafond de poids ne protegeait rien et rendait le franco illisible : il
     supposait que le poids fait le prix du port, ce qui est faux ici (c'est le
     volume), et il oubliait que le poids fait aussi le prix de la MARCHANDISE,
     bien plus vite.

     Verification au seuil, sur les deux pires ratios valeur/poids du catalogue
     (marge fabrication, 15 EUR de frais fixes, port reel de la tranche) :
       250 EUR HT d'acier dev 520 : 26 kg taxables -> port 90 EUR
         0,64 x 250 - 15 - 90 = +47 EUR
       250 EUR HT d'alu dev 520   : 26 kg taxables -> port 90 EUR
         0,51 x 250 - 15 - 90 = +22 EUR
     Positif partout. Et au-dela de 99 kg taxables il n'y a plus de tarif du
     tout, c'est une cotation : le plafond de poids est inutile par construction.

     Ce que le franco a 300 change pour le client : une commande de 5 couvertines
     alu 2,5 m (405 EUR TTC) payait 125 EUR de port, elle est maintenant franco —
     150 EUR d'ecart sur le ticket. L'audit SEO du 28/09 identifie le tunnel
     comme le goulot (540 visites/mois pour 0,28 % de conversion), pas le trafic.

     Jamais de franco hors metropole : le port d'un envoi ultramarin n'a rien a
     voir avec celui d'un envoi continental. ── */
  const FRANCO = 30000;       // 300 EUR TTC de marchandise

  // Departement d'apres le code postal. `cp.slice(0,2)` se trompe deux fois :
  // la Corse (20xxx = 2A/2B) et l'outre-mer, ou le departement tient sur
  // 3 chiffres (97400 = 974, pas 97).
  function departement(cp) {
    cp = String(cp || '');
    if (/^9[78]/.test(cp)) return cp.slice(0, 3);
    if (/^20/.test(cp))    return '2A/2B';
    return cp.slice(0, 2);
  }

  function estMetropole(cp) { return !/^9[78]/.test(String(cp || '')); }

  /* Poids unitaire d'un article. `it.ship` est pose par les configurateurs
     ({material, thicknessMm, devMm, lenMm}) ou par accessoires.js ({kg, lenMm}).
     Un article sans `ship` — panier deja en localStorage avant cette version,
     selecteur simplifie de couvertines.html — retombe sur une estimation
     prudente : compter 0 kg reviendrait a sous-facturer le port. */
  function poidsUnitaireKg(it) {
    const s = it.ship || null;
    if (s && Number.isFinite(s.kg)) return s.kg;
    if (s && s.material && s.devMm && s.lenMm) {
      const kgm2 = kgParM2(s.material, s.thicknessMm);
      if (kgm2) return (s.devMm / 1000) * (s.lenMm / 1000) * kgm2;
    }
    return 4;   // couvertine alu 1,5 de 2 m, developpe 500 — defaut haut
  }

  /* Longueur d'un article, en mm. Le libelle est le dernier recours : les deux
     configurateurs ecrivent « L=2000mm », le selecteur simplifie « 2 m ». */
  function longueurMm(it) {
    const s = it.ship || null;
    if (s && Number.isFinite(s.lenMm)) return s.lenMm;
    const txt = String(it.length || '');
    const mm = /L\s*=\s*(\d{3,4})\s*mm/i.exec(txt) || /(\d{4})\s*mm/.exec(txt);
    if (mm) return parseInt(mm[1], 10);
    const m = /([1-6])\s*(?:[,.]\s*(\d))?\s*m(?![a-z])/i.exec(txt);
    if (m) return parseInt(m[1], 10) * 1000 + (m[2] ? parseInt(m[2], 10) * 100 : 0);
    return 2000;
  }

  /* Synthese d'expedition du panier. Alimente a la fois le bandeau client, la
     ligne « Livraison » du mail et les champs Poids / Gabarit que le
     transporteur reclame pour coter — c'est la seule source de ces chiffres.
     `cp` est facultatif : il n'est connu qu'au moment du formulaire. */
  function expedition(totalCents, cp) {
    // Les accessoires sont un forfait de LIGNE : leur poids ne suit pas la
    // quantite de pieces, exactement comme `extrasCents` pour leur prix.
    const kgPieces = cart.reduce(
      (s, it) => s + poidsUnitaireKg(it) * it.qty + ((it.ship && it.ship.accKg) || 0), 0);
    const lMax = cart.reduce(
      (m, it) => Math.max(m, longueurMm(it), (it.ship && it.ship.accLenMm) || 0), 0) || 0;
    // Nombre de pieces empilees : c'est lui qui fait la hauteur du colis, donc
    // le volume, donc le prix. Un accessoire qui voyage a plat dans le meme
    // colis n'ajoute pas d'epaisseur -> il ne compte pas.
    const nbPieces = cart.reduce((n, it) => n + (it.qty || 1), 0);

    const reseau = lMax <= SEUIL_PETIT_MM ? 'petit' : 'long';
    const kgBrut = cart.length ? kgPieces + EMBALLAGE_KG[reseau] : 0;

    // Enveloppe declaree au transporteur. Elle n'est pas decorative : c'est
    // elle qui fixe le poids taxable, donc le prix.
    const colis = reseau === 'petit'
      ? { l: Math.max(lMax + 40, 200), w: 300, h: 200 }
      : { l: lMax + 60, w: COLIS_LARGEUR_MM,
          h: COLIS_HAUTEUR_BASE_MM + COLIS_HAUTEUR_PAR_PIECE_MM * nbPieces };
    const volM3 = cart.length ? (colis.l / 1000) * (colis.w / 1000) * (colis.h / 1000) : 0;

    /* POIDS TAXABLE — la seule base de facturation Geodis (bareme ligne 116 :
       rapport poids/volume >= 150 kg/m3 ; ligne 114 : arrondi au kg superieur).
       Sur notre catalogue c'est presque toujours le volume qui l'emporte : une
       couvertine alu 1,5 de 2 m pese 2,4 kg reels et 7 kg taxables. */
    const kgTaxable = cart.length
      ? Math.ceil(Math.max(kgBrut, volM3 * KG_PAR_M3))
      : 0;

    const tranche = GRILLE.find((t) => kgTaxable <= t.maxKg) || null;
    const metro   = (cp === undefined || cp === null || cp === '') ? true : estMetropole(cp);
    // Pas de tranche (> 99 kg taxables), piece au-dela des 4 m du bareme, ou
    // envoi ultramarin : on ne devine pas un prix, on cote.
    const surDevis = !tranche || !metro || lMax > SEUIL_MAX_MM;
    // Plus de plafond de poids : au-dela de la derniere tranche il n'y a plus
    // de tarif du tout, donc plus de franco a borner.
    const gratuit = !surDevis && totalCents >= FRANCO;
    const portHt  = (gratuit || surDevis) ? 0 : tranche.ht;

    const gabarit = colis.l + ' \u00d7 ' + colis.w + ' \u00d7 ' + colis.h + ' mm'
      + (reseau === 'petit' ? ' (colis compact)' : ' (colis long, papier bulle)')
      + ' \u2014 ' + volM3.toFixed(3).replace('.', ',') + ' m\u00b3';

    return {
      kgNet: kgPieces, kgBrut: kgBrut, kgTaxable: kgTaxable, volM3: volM3,
      lMax: lMax, nbPieces: nbPieces, reseau: reseau,
      hors: lMax > SEUIL_MAX_MM,
      surDevis: surDevis, gratuit: gratuit, franco: FRANCO, tranche: tranche,
      portHtCents:  portHt,
      portTtcCents: Math.round(portHt * TVA),
      gabarit: gabarit,
    };
  }

  const RESEAU_LABEL = {
    petit: 'colis compact <= 1 200 mm',
    long:  'colis long',
  };

  function livraisonLigne(order) {
    const c = order.client;
    if (c.mode === 'Retrait atelier') {
      return 'RETRAIT A L ATELIER — aucune expedition. Prevenir le client des que la commande est prete '
           + '(8 rue Edouard Martel, 42100 Saint-Etienne).';
    }
    const e = order.exp;
    const tete = e.gratuit
      ? 'Port OFFERT — marchandise >= ' + (e.franco / 100) + ' EUR TTC. Le cout transporteur reste a la charge de MDS.'
      : (e.surDevis
          ? 'A COTER — aucune tranche de la grille ne couvre cet envoi (fardeau hors tranche, ou hors metropole). '
            + 'Demander une cotation au transporteur AVANT d annoncer un prix.'
          : 'Port FACTURE ' + (e.portTtcCents / 100).toFixed(2).replace('.', ',') + ' EUR TTC ('
            + (e.portHtCents / 100).toFixed(2).replace('.', ',') + ' EUR HT) — grille '
            + RESEAU_LABEL[e.reseau]
            + ', tranche <= ' + e.tranche.maxKg + ' kg taxables (poids taxable retenu : '
            + e.kgTaxable + ' kg, dont ' + e.kgBrut.toFixed(1).replace('.', ',') + ' kg reels).');
    const adresse = [c.adresse, c.complement].filter(Boolean).join(' — ');
    return tete + ' | Livrer a : ' + adresse + ', ' + c.cp + ' ' + c.ville
         + ' (departement ' + departement(c.cp) + ')';
  }

  /* ── PERSISTANCE ──────────────────────────────────────────────
     Le panier est enregistré dans localStorage à CHAQUE modification.
     Il survit ainsi au changement de page (pliage ↔ couvertines),
     au rafraîchissement et à la fermeture du navigateur. ── */
  function loadCart() {
    try {
      const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (err) {
      return [];
    }
  }
  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (err) {}
  }

  /* Bouton panier flottant : injecté sur les pages qui n'en ont pas
     (accueil, guides, accessoires…) pour que le panier soit accessible
     depuis n'importe où. Ne fait rien si le bouton existe déjà. */
  injectCartFab();

  /* ── STATE ────────────────────────────────────────────────── */
  let cart = loadCart();
  let selectedFinish = { id: 'ral7016', label: 'RAL 7016 Anthracite' };
  let selectedPrice = 2500; // cents
  let selectedLengthLabel = '2 mètres';
  let qty = 1;

  /* ── DOM REFS ─────────────────────────────────────────────── */
  const finishBtns     = document.querySelectorAll('.finish-btn');
  const lengthBtns     = document.querySelectorAll('.length-btn');
  const qtyInput       = document.getElementById('shop-qty');
  const qtyMinus       = document.getElementById('qty-minus');
  const qtyPlus        = document.getElementById('qty-plus');
  const priceUnitEl    = document.getElementById('price-unit-display');
  const priceTotalEl   = document.getElementById('price-total-display');
  const addToCartBtn   = document.getElementById('add-to-cart-btn');
  const cartOpenBtn    = document.getElementById('cart-open-btn');
  const cartDrawer     = document.getElementById('cart-drawer');
  const cartBackdrop   = document.getElementById('cart-backdrop');
  const cartCloseBtn   = document.getElementById('cart-close-btn');
  const cartItemsList  = document.getElementById('cart-items-list');
  const cartEmptyState = document.getElementById('cart-empty');
  const cartFooter     = document.getElementById('cart-footer');
  const cartTotalEl    = document.getElementById('cart-total-display');
  const cartCountBadge = document.getElementById('cart-count-badge');
  const checkoutBtn    = document.getElementById('btn-checkout');

  /* ── HELPERS ──────────────────────────────────────────────── */
  function formatPrice(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  function updatePriceDisplay() {
    if (priceUnitEl) priceUnitEl.textContent = formatPrice(selectedPrice);
    if (priceTotalEl) priceTotalEl.textContent = formatPrice(selectedPrice * qty);
  }

  function updateCartBadge() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountBadge) {
      cartCountBadge.textContent = total;
      cartCountBadge.classList.toggle('has-items', total > 0);
    }
    if (cartOpenBtn) {
      cartOpenBtn.setAttribute('aria-label', `Panier (${total} article${total !== 1 ? 's' : ''})`);
    }
  }

  /* ── CART RENDER ──────────────────────────────────────────── */
  function renderCart() {
    // renderCart() est le point de passage après chaque mutation du panier
    // (ajout, suppression, changement de quantité) → on persiste ici.
    saveCart();
    if (!cartItemsList) return;
    cartItemsList.innerHTML = '';

    const isEmpty = cart.length === 0;
    if (cartEmptyState) cartEmptyState.hidden = !isEmpty;
    if (cartFooter) cartFooter.hidden = isEmpty;

    // Retour à l'état normal du panier (au cas où le formulaire de demande était ouvert)
    const leftoverForm = document.getElementById('order-form');
    if (leftoverForm) leftoverForm.remove();

    let total = 0;

    cart.forEach((item, index) => {
      // Ligne = pièces (prix × quantité) + forfait accessoires, qui ne suit PAS
      // la quantité : changer la quantité ne doit jamais refacturer les talons,
      // éclisses ou cornières déjà comptés pour ce calepinage.
      const extrasCents = item.extrasCents || 0;
      const lineTotal = item.price * item.qty + extrasCents;
      total += lineTotal;

      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <span class="cart-item-name">${item.name || 'Couvertine métallique'}</span>
        <div class="cart-item-price">
          <span>${formatPrice(lineTotal)}</span>
          <span class="cart-item-unit-price">${formatPrice(item.price)} / u.</span>
        </div>
        <div class="cart-item-meta">
          <span>${item.finish}</span>
          <span>${item.length}</span>
          ${item.extras
            ? `<span>Accessoires : ${item.extras}${extrasCents ? ` — ${formatPrice(extrasCents)}` : ''}</span>`
            : ''}
        </div>
        <div class="cart-item-actions">
          <div class="cart-qty" role="group" aria-label="Quantité">
            <button type="button" class="cart-qty-btn" data-qty-dir="-1" data-index="${index}" aria-label="Diminuer la quantité">−</button>
            <input type="text" inputmode="numeric" class="cart-qty-input" data-index="${index}" value="${item.qty}" aria-label="Quantité">
            <button type="button" class="cart-qty-btn" data-qty-dir="1" data-index="${index}" aria-label="Augmenter la quantité">+</button>
          </div>
          <button class="cart-item-remove" data-index="${index}" aria-label="Supprimer cet article">Supprimer</button>
        </div>
      `;
      cartItemsList.appendChild(el);
    });

    if (cartTotalEl) cartTotalEl.textContent = formatPrice(total);
    renderShippingNote(total);
    updateCartBadge();
  }

  /* ── FINISH SELECTOR ──────────────────────────────────────── */
  finishBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      finishBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      selectedFinish = { id: btn.dataset.finish, label: btn.dataset.label };
    });
  });

  /* ── LENGTH SELECTOR ──────────────────────────────────────── */
  lengthBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      lengthBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      selectedPrice = parseInt(btn.dataset.price, 10);
      selectedLengthLabel = btn.dataset.label;
      updatePriceDisplay();
    });
  });

  /* ── QUANTITY ─────────────────────────────────────────────── */
  function setQty(val) {
    qty = Math.max(1, parseInt(val, 10) || 1);
    if (qtyInput) qtyInput.value = qty;
    updatePriceDisplay();
  }

  if (qtyMinus) qtyMinus.addEventListener('click', () => setQty(qty - 1));
  if (qtyPlus)  qtyPlus.addEventListener('click',  () => setQty(qty + 1));
  if (qtyInput) qtyInput.addEventListener('input',  (e) => setQty(e.target.value));

  updatePriceDisplay();

  /* ── ADD TO CART ──────────────────────────────────────────── */
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      // Même règle que window.CartAddItem : la longueur entre dans la clé,
      // sinon deux longueurs vendues au même prix fusionneraient.
      const existing = cart.find(
        (i) => (i.name || 'Couvertine métallique') === 'Couvertine métallique'
          && i.finish === selectedFinish.label
          && i.price === selectedPrice
          && i.length === selectedLengthLabel
      );
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({
          name: 'Couvertine métallique',
          finish: selectedFinish.label,
          length: selectedLengthLabel,
          price: selectedPrice,
          qty,
        });
      }

      addToCartBtn.classList.add('added');
      addToCartBtn.innerHTML = '✓&nbsp;Ajouté au panier';
      setTimeout(() => {
        addToCartBtn.classList.remove('added');
        addToCartBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Ajouter au panier`;
      }, 1800);

      renderCart();
      openCart();
    });
  }

  /* ── CART OPEN / CLOSE ────────────────────────────────────── */
  /* Deux conventions coexistent dans le HTML : les configurateurs posent
     l'attribut `hidden` sur le tiroir (CSS `.cart-drawer:not([hidden])`),
     les autres pages s'appuient sur la classe `.is-open`. On pilote les
     deux, sinon le tiroir reste marqué `hidden` pour les lecteurs d'écran
     alors qu'il est visible à l'écran. ── */
  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    cartDrawer.removeAttribute('hidden');
    cartDrawer.setAttribute('aria-hidden', 'false');
    if (cartBackdrop) cartBackdrop.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('hidden', '');
    cartDrawer.setAttribute('aria-hidden', 'true');
    if (cartBackdrop) cartBackdrop.classList.remove('is-visible');
    document.body.style.overflow = '';
    // Repartir d'un panier propre : on retire le formulaire de demande s'il était ouvert
    const f = document.getElementById('order-form');
    if (f) f.remove();
    if (cartFooter) cartFooter.hidden = cart.length === 0;
  }

  if (cartOpenBtn)  cartOpenBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  /* ── QUANTITÉ & SUPPRESSION PAR LIGNE ─────────────────────────
     Le stepper +/− par ligne permet de passer de 1 à N directement
     dans le panier, quelle que soit la gamme (couvertine, pliage,
     achat rapide) — tout transite par ce même panier. ── */
  function setLineQty(index, val) {
    if (!cart[index]) return;
    cart[index].qty = Math.max(1, Math.min(999, parseInt(val, 10) || 1));
    renderCart();
  }

  if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
      const qtyBtn = e.target.closest('.cart-qty-btn');
      if (qtyBtn) {
        const idx = parseInt(qtyBtn.dataset.index, 10);
        const dir = parseInt(qtyBtn.dataset.qtyDir, 10);
        if (cart[idx]) setLineQty(idx, cart[idx].qty + dir);
        return;
      }
      const rm = e.target.closest('.cart-item-remove');
      if (!rm) return;
      cart.splice(parseInt(rm.dataset.index, 10), 1);
      renderCart();
    });

    // Filtrage numérique en direct ; on applique la valeur au 'change'
    // (blur / Entrée) pour ne pas perdre le focus pendant la frappe.
    cartItemsList.addEventListener('input', (e) => {
      const input = e.target.closest('.cart-qty-input');
      if (input) input.value = input.value.replace(/[^0-9]/g, '');
    });
    cartItemsList.addEventListener('change', (e) => {
      const input = e.target.closest('.cart-qty-input');
      if (input) setLineQty(parseInt(input.dataset.index, 10), input.value);
    });
  }

  /* ── DEMANDE DE COMMANDE (sans paiement immédiat) ─────────────
     Le client envoie sa demande (récap panier + coordonnées) par email
     via FormSubmit. MDS vérifie puis renvoie un lien de paiement. ── */
  function cartSummaryText() {
    const lines = [];
    cart.forEach((it, i) => {
      const extrasCents = it.extrasCents || 0;
      const piecesCents = it.price * it.qty;
      lines.push(
        `${i + 1}. ${it.name || 'Couvertine métallique'} | ${it.finish} | ${it.length}`
        + ` | qté ${it.qty} × ${formatPrice(it.price)} = ${formatPrice(piecesCents)}`
      );
      // Détail obligatoire : sans lui, impossible de savoir a posteriori quels
      // accessoires ont été commandés (cas DOUISSARD 15/09 et BRÉCHET 20/09).
      if (it.extras || extrasCents) {
        lines.push(
          `   + accessoires : ${it.extras || '(non détaillés)'}`
          + (extrasCents ? ` = ${formatPrice(extrasCents)} — forfait de ligne, non multiplié par la quantité` : '')
        );
        lines.push(`   sous-total ligne : ${formatPrice(piecesCents + extrasCents)}`);
      }
    });
    const total = cart.reduce((s, it) => s + it.price * it.qty + (it.extrasCents || 0), 0);
    lines.push(`TOTAL TTC : ${formatPrice(total)}`);
    return lines.join('\n');
  }

  // Référence de demande lisible : MP-AAMMJJ-HHMM-XX (date+heure+2 car. aléatoires)
  function genRef() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    const rnd = Math.random().toString(36).slice(2, 4).toUpperCase();
    return `MP-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}-${rnd}`;
  }

  function injectCartQtyStyles() {
    if (document.getElementById('cart-qty-styles')) return;
    const st = document.createElement('style');
    st.id = 'cart-qty-styles';
    st.textContent = `
      .cart-item-actions{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-top:.6rem;flex-wrap:wrap;}
      .cart-qty{display:inline-flex;align-items:center;border:1px solid #3a3a3a;border-radius:6px;overflow:hidden;background:#161616;}
      .cart-qty-btn{width:32px;height:32px;border:0;background:transparent;color:#fff;font-size:1.15rem;line-height:1;cursor:pointer;display:grid;place-items:center;transition:background .15s,color .15s;}
      .cart-qty-btn:hover{background:rgba(255,69,0,.14);color:var(--accent,#FF4500);}
      .cart-qty-btn:focus-visible{outline:2px solid var(--accent,#FF4500);outline-offset:-2px;}
      .cart-qty-input{width:42px;height:32px;border:0;border-left:1px solid #3a3a3a;border-right:1px solid #3a3a3a;background:transparent;color:#fff;text-align:center;font-family:inherit;font-size:.92rem;font-weight:600;font-variant-numeric:tabular-nums;-moz-appearance:textfield;}
      .cart-qty-input::-webkit-outer-spin-button,.cart-qty-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
    `;
    document.head.appendChild(st);
  }

  function injectOrderStyles() {
    if (document.getElementById('order-form-styles')) return;
    const st = document.createElement('style');
    st.id = 'order-form-styles';
    st.textContent = `
      .order-form{display:flex;flex-direction:column;gap:.65rem;padding:1rem 0 0;}
      .order-form label{display:flex;flex-direction:column;gap:.25rem;font-size:.82rem;color:var(--text-secondary,#bbb);}
      .order-form input,.order-form textarea{padding:.6rem .7rem;border:1px solid #3a3a3a;background:#161616;color:#fff;border-radius:5px;font-size:.95rem;font-family:inherit;}
      .order-form input:focus,.order-form textarea:focus{outline:none;border-color:var(--accent,#FF4500);}
      .order-reassure{font-size:.84rem;line-height:1.5;background:rgba(255,69,0,.08);border:1px solid rgba(255,69,0,.32);padding:.65rem .8rem;border-radius:5px;color:var(--text-secondary,#ccc);margin:0;}
      .order-mini{font-size:.72rem;color:var(--text-muted,#888);line-height:1.45;margin:.2rem 0 0;}
      .order-error{font-size:.82rem;line-height:1.45;background:rgba(220,38,38,.1);border:1px solid rgba(220,38,38,.45);color:#fca5a5;padding:.6rem .75rem;border-radius:5px;margin:0;}
      .order-error a{color:#fca5a5;text-decoration:underline;}
      .order-mode{border:1px solid #3a3a3a;border-radius:5px;padding:.5rem .7rem .6rem;margin:0;display:flex;flex-direction:column;gap:.35rem;}
      .order-mode legend{font-size:.82rem;color:var(--text-secondary,#bbb);padding:0 .3rem;}
      .order-form label.order-radio{flex-direction:row;align-items:center;gap:.45rem;font-size:.88rem;color:var(--text-primary,#eee);cursor:pointer;}
      .order-form label.order-radio input{width:auto;padding:0;accent-color:var(--accent,#FF4500);}
      .order-form label[hidden]{display:none;}
    `;
    document.head.appendChild(st);
  }

  function showOrderForm() {
    if (!cartDrawer) return;
    const host = cartDrawer.querySelector('.cart-drawer-body')
      || (cartItemsList && cartItemsList.parentElement)
      || cartDrawer;
    const existing = host.querySelector('#order-form');
    if (existing) {
      // Pas de champ « Recapitulatif commande » dans ce formulaire : le recap
      // n'existe que dans le payload AJAX. Y acceder ici levait une TypeError.
      existing.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    injectOrderStyles();
    if (cartFooter) cartFooter.hidden = true;
    const form = document.createElement('form');
    form.id = 'order-form';
    form.className = 'order-form';
    form.method = 'POST';
    form.action = 'https://formsubmit.co/' + ORDER_EMAIL;
    form.innerHTML = `
      <p class="order-reassure">Vous ne payez rien maintenant. Après vérification de votre commande, vous recevrez votre <strong>lien de paiement</strong> (carte bancaire ou virement), généralement sous 24&nbsp;h ouvrées. Les <strong>frais de port affichés ci-dessus sont fermes</strong> pour la France métropolitaine&nbsp;; le <strong>retrait à l'atelier</strong> de Saint-Étienne reste gratuit.</p>
      <label>Nom complet*<input type="text" name="Nom" required autocomplete="name"></label>
      <label>Société (si la facture est au nom d'une entreprise)<input type="text" name="Societe" autocomplete="organization"></label>
      <label>Email*<input type="email" name="Email" required autocomplete="email"></label>
      <label>Téléphone*<input type="tel" name="Telephone" inputmode="tel" required autocomplete="tel"></label>
      <fieldset class="order-mode">
        <legend>Mode de réception*</legend>
        <label class="order-radio"><input type="radio" name="Mode" value="Livraison" checked> Livraison à mon adresse</label>
        <label class="order-radio"><input type="radio" name="Mode" value="Retrait atelier"> Retrait gratuit à l'atelier (Saint-Étienne)</label>
      </fieldset>
      <label id="lbl-adresse">Adresse de livraison*<input type="text" name="Adresse" required
             autocomplete="street-address" placeholder="8 rue Édouard Martel"></label>
      <label id="lbl-complement">Complément (bâtiment, étage, digicode, accès camion)<input type="text"
             name="Complement" autocomplete="address-line2"></label>
      <label>Code postal de livraison*<input type="text" name="Code postal" inputmode="numeric"
             autocomplete="postal-code" pattern="[0-9]{5}" maxlength="5" placeholder="42100" required
             title="5 chiffres — exemple : 42100"></label>
      <label>Ville*<input type="text" name="Ville" autocomplete="address-level2" placeholder="Saint-Étienne" required></label>
      <label>Message (accès, délai souhaité…)<textarea name="Message" rows="2"></textarea></label>
      <p class="order-error" id="order-error" hidden></p>
      <button type="submit" class="btn-primary btn-full">Envoyer ma demande</button>
      <p class="order-mini">Produits fabriqués sur mesure : ni repris, ni échangés (art. L221-28 du Code de la consommation). Le prix indiqué est ferme.</p>
    `;
    host.appendChild(form);

    // Retrait a l'atelier : l'adresse de livraison n'a plus de sens. On masque les
    // deux champs et on retire le `required`, sinon le navigateur refuse d'envoyer
    // le formulaire a cause d'un champ obligatoire invisible, sans rien expliquer.
    const adrLbl = form.querySelector('#lbl-adresse');
    const cplLbl = form.querySelector('#lbl-complement');
    const adrIn  = form.querySelector('[name="Adresse"]');
    function syncMode() {
      const retrait = form.querySelector('[name="Mode"]:checked').value === 'Retrait atelier';
      if (adrLbl) adrLbl.hidden = retrait;
      if (cplLbl) cplLbl.hidden = retrait;
      if (adrIn)  adrIn.required = !retrait;
    }
    form.querySelectorAll('[name="Mode"]').forEach((r) => r.addEventListener('change', syncMode));
    syncMode();

    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Envoi en AJAX : permet de DÉTECTER un échec (sinon une commande peut se perdre
    // en silence) et déclenche un accusé de réception automatique au client (_autoresponse).
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = form.querySelector('button[type="submit"]');
      const errEl = form.querySelector('#order-error');
      if (errEl) errEl.hidden = true;

      const ref = genRef();
      const order = {
        ref,
        date: new Date().toLocaleString('fr-FR'),
        items: cart.map((it) => ({
          name: it.name || 'Couvertine métallique',
          finish: it.finish, length: it.length, price: it.price, qty: it.qty,
          extras: it.extras || '', extrasCents: it.extrasCents || 0,
        })),
        total: cart.reduce((s, it) => s + it.price * it.qty + (it.extrasCents || 0), 0),
        client: {
          nom: form.querySelector('[name="Nom"]').value,
          email: form.querySelector('[name="Email"]').value,
          tel: form.querySelector('[name="Telephone"]').value,
          societe: form.querySelector('[name="Societe"]').value.trim(),
          mode: form.querySelector('[name="Mode"]:checked').value,
          adresse: form.querySelector('[name="Adresse"]').value.trim(),
          complement: form.querySelector('[name="Complement"]').value.trim(),
          cp: form.querySelector('[name="Code postal"]').value.trim(),
          ville: form.querySelector('[name="Ville"]').value.trim(),
          message: form.querySelector('[name="Message"]').value,
        },
      };
      // Synthese d'expedition (poids, gabarit, port) : calculee une seule fois,
      // puis relue par livraisonLigne() et par le payload. Le CP est connu ici,
      // donc un envoi ultramarin basculera bien en « a coter ».
      order.exp = expedition(order.total, order.client.cp);
      order.portTtcCents = order.client.mode === 'Retrait atelier' ? 0 : order.exp.portTtcCents;
      order.totalAvecPort = order.total + order.portTtcCents;
      try { localStorage.setItem('mp_last_order', JSON.stringify(order)); } catch (err) {}

      const payload = {
        Reference: ref,
        Nom: order.client.nom,
        Email: order.client.email,
        Telephone: order.client.tel,
        Societe: order.client.societe || '—',
        'Mode de reception': order.client.mode,
        'Adresse de livraison': order.client.mode === 'Retrait atelier'
          ? 'RETRAIT A L ATELIER — aucune expedition'
          : order.client.adresse,
        'Complement adresse': order.client.complement || '—',
        'Code postal': order.client.cp,
        Ville: order.client.ville,
        Departement: departement(order.client.cp),
        Message: order.client.message,
        'Recapitulatif commande': cartSummaryText(),
        // Les 4 champs que le transporteur reclame pour coter un enlevement. Ils
        // etaient absents du mail : il fallait rouvrir le dossier et repeser la
        // commande a la main a chaque demande de prix (cas FRUMHOLTZ, 28/09).
        'Poids net pieces': order.exp.kgNet.toFixed(1).replace('.', ',') + ' kg',
        'Poids brut colis': order.exp.kgBrut.toFixed(1).replace('.', ',') + ' kg (papier bulle compris)',
        // C'est CE poids que Geodis facture : max(brut ; volume x 150 kg/m3),
        // arrondi au kg superieur. Sur un colis long c'est toujours le volume
        // qui l'emporte — sans ce champ, la facture transporteur est illisible.
        'Poids taxable': order.exp.kgTaxable + ' kg (base de facturation Geodis, 150 kg/m³)',
        'Gabarit du colis': order.exp.gabarit,
        'Frais de port': order.client.mode === 'Retrait atelier'
          ? 'RETRAIT ATELIER — 0,00 EUR'
          : (order.exp.gratuit
              ? 'OFFERT (franco ' + (order.exp.franco / 100) + ' EUR TTC)'
              : (order.exp.surDevis
                  ? 'A COTER — hors grille'
                  : formatPrice(order.exp.portTtcCents) + ' TTC')),
        'TOTAL a encaisser': formatPrice(order.totalAvecPort) + ' TTC'
          + (order.exp.surDevis && order.client.mode !== 'Retrait atelier' ? ' + port a coter' : ''),
        Livraison: livraisonLigne(order),
        _subject: 'Demande de commande ' + ref + ' — Metal Pliage',
        _template: 'table',
        _captcha: 'false',
        _autoresponse:
          'Bonjour,\n\nNous avons bien reçu votre demande de commande (référence ' + ref + ') sur Metal Pliage. Merci !\n\n'
          + 'Après vérification, nous vous enverrons votre lien de paiement (carte bancaire ou virement), généralement sous 24 h ouvrées. '
          + 'La fabrication sur mesure démarre dès réception du règlement.\n\n'
          + 'À très vite,\nMetal Pliage / MDS\ncontact@metal-pliage.fr — 06 43 21 82 01',
      };

      if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }
      try {
        const res = await fetch('https://formsubmit.co/ajax/' + ORDER_EMAIL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !(data && (data.success === 'true' || data.success === true))) {
          throw new Error('FormSubmit a renvoyé une erreur');
        }
        // Commande partie : on vide le panier. Sans ca le client la retrouve
        // intacte a sa prochaine visite, pastille allumee, et la renvoie — ou
        // ajoute un article a un panier qu'il croit vide. `mp_last_order` est
        // deja enregistre, la page de confirmation reste donc alimentee.
        cart.length = 0;
        saveCart();
        renderCart();
        window.location.href = 'commande-confirmee.html?order=' + encodeURIComponent(ref);
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = 'Envoyer ma demande'; }
        if (errEl) {
          errEl.innerHTML = "L'envoi a échoué. Réessayez, ou contactez-nous directement : "
            + '<a href="mailto:contact@metal-pliage.fr">contact@metal-pliage.fr</a> · '
            + '<a href="tel:+33643218201">06 43 21 82 01</a>.';
          errEl.hidden = false;
          errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!cart.length) return;
      showOrderForm();
    });
  }

  /* ── BOUTON « CONTINUER MES ACHATS » ─────────────────────────
     Ajouté dans le pied du tiroir pour pouvoir fermer le panier et
     reconfigurer / ajouter un autre article (manquait avant). ── */
  function injectContinueButton() {
    if (!cartFooter || !checkoutBtn || document.getElementById('btn-continue-shopping')) return;
    const cont = document.createElement('button');
    cont.id = 'btn-continue-shopping';
    cont.type = 'button';
    cont.textContent = '← Continuer mes achats';
    cont.style.cssText = 'display:block;width:100%;margin-bottom:.6rem;padding:.7rem 1rem;'
      + 'background:transparent;border:1px solid #3a3a3a;border-radius:5px;color:var(--text-secondary,#bbb);'
      + 'font-family:inherit;font-size:.9rem;cursor:pointer;transition:border-color .2s,color .2s;';
    cont.addEventListener('mouseover', () => { cont.style.borderColor = 'var(--accent,#FF4500)'; cont.style.color = 'var(--accent,#FF4500)'; });
    cont.addEventListener('mouseout',  () => { cont.style.borderColor = '#3a3a3a'; cont.style.color = 'var(--text-secondary,#bbb)'; });
    cont.addEventListener('click', closeCart);
    checkoutBtn.parentElement.insertBefore(cont, checkoutBtn);
  }

  /* ── BOUTON PANIER FLOTTANT ──────────────────────────────────
     Les deux configurateurs ont leur bouton #cart-open-btn codé en dur
     dans le HTML. Les autres pages qui embarquent un tiroir panier
     (accueil, guides, accessoires, appuis de fenêtre) n'en ont pas :
     sans lui, le panier existe mais reste inatteignable. On l'injecte
     donc ici, avec ses styles (.cart-fab n'existe que dans
     configurateur.css, non chargé sur ces pages). ── */
  function injectCartFab() {
    // Le bouton est déjà dans le HTML (configurateurs) → rien à faire.
    if (document.getElementById('cart-open-btn')) return;
    // Pas de tiroir sur cette page → un bouton panier n'aurait rien à ouvrir.
    if (!document.getElementById('cart-drawer')) return;
    if (!document.body) return;

    if (!document.getElementById('cart-fab-styles')) {
      const st = document.createElement('style');
      st.id = 'cart-fab-styles';
      st.textContent = `
        .cart-fab{position:fixed;bottom:5.75rem;right:1.5rem;width:56px;height:56px;display:flex;align-items:center;justify-content:center;background:var(--accent,#FF4500);color:#fff;border:none;border-radius:50%;cursor:pointer;box-shadow:0 4px 20px rgba(255,69,0,.35);z-index:100;transition:background .2s,transform .15s;}
        .cart-fab:hover{background:var(--accent-hover,#e63e00);transform:scale(1.06);}
        .cart-fab:focus-visible{outline:2px solid #fff;outline-offset:3px;}
        .cart-badge{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;padding:0 5px;display:grid;place-items:center;background:#fff;color:var(--accent,#FF4500);border-radius:10px;font-size:.72rem;font-weight:700;font-variant-numeric:tabular-nums;opacity:0;transition:opacity .2s;}
        .cart-badge.has-items{opacity:1;}
        @media (max-width:768px){.cart-fab{bottom:4.75rem;right:1rem;}}
      `;
      document.head.appendChild(st);
    }

    const btn = document.createElement('button');
    btn.id = 'cart-open-btn';
    btn.type = 'button';
    btn.className = 'cart-fab';
    btn.setAttribute('aria-label', 'Panier (0 article)');
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'
      + '<span id="cart-count-badge" class="cart-badge">0</span>';
    document.body.appendChild(btn);
  }

  /* ── BANDEAU LIVRAISON (dynamique) ───────────────────────────
     Le client voit le PRIX du port avant de s'engager. L'audit SEO du 28/09
     a identifie le « A CHIFFRER » comme le premier frein du tunnel : 540
     visites/mois pour 0,28 % de conversion. On affiche donc poids, tranche,
     port et total port compris. ── */
  const TRUCK_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none;vertical-align:middle;"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';

  function renderShippingNote(total) {
    if (!cartFooter) return;
    let note = document.getElementById('cart-ship-incl');
    if (!note) {
      note = document.createElement('div');
      note.id = 'cart-ship-incl';
      cartFooter.insertBefore(note, cartFooter.firstChild);
    }
    if (!cart.length) { note.innerHTML = ''; return; }

    const e = expedition(total);
    /* On n'affiche PLUS le poids au client. Depuis le bareme du 06/10 le prix se
       fait au volume : annoncer « colis 2,9 kg » a cote de « livraison 72 € »
       passe pour une erreur de tarif. Ce qui est vrai et verifiable par le
       client, c'est l'encombrement. Le poids reel et le poids taxable restent
       dans le mail de commande, pour l'enlevement. */
    const taille = (e.lMax + 60) + ' mm';
    const base = 'margin-bottom:.6rem;font-size:.78rem;line-height:1.6;'
               + 'color:var(--text-secondary,#bbb);text-align:center;';

    if (e.gratuit) {
      note.style.cssText = base + 'color:#1f9d55;font-weight:600;';
      note.innerHTML = TRUCK_SVG + ' Livraison OFFERTE (France métropolitaine)'
        + '<br><span style="font-weight:400;color:var(--text-secondary,#bbb)">Colis de '
        + taille + ' \u00b7 livre sous 2 jours ouvres</span>';
      return;
    }

    if (e.surDevis) {
      note.style.cssText = base;
      note.innerHTML = TRUCK_SVG + ' <strong>Frais de port sur devis</strong> — colis de '
        + taille + ' : hors grille standard.'
        + '<br>Nous vous communiquons le prix exact sous 24 h ouvrées, avant tout paiement.'
        + ' Ou <strong>retrait gratuit à l\'atelier</strong> (Saint-Étienne).';
      return;
    }

    // Le reste a parcourir avant le franco n'est affiche que si la gratuite est
    // reellement atteignable : proposer « encore 280 EUR » a qui commande une
    // couvertine de 60 EUR est une incitation vide. Depuis le 06/10 il n'y a
    // plus de plafond de poids a verifier : dans toute la plage tarifee, le
    // montant seul declenche le franco.
    const reste = e.franco - total;
    const relance = (reste > 0 && reste <= total)
      ? '<br>Offerte dès <strong>' + (e.franco / 100) + '\u00a0\u20ac</strong>'
        + ' — plus que <strong style="color:var(--accent,#FF4500)">' + formatPrice(reste) + '</strong>.'
      : '';

    note.style.cssText = base;
    note.innerHTML = TRUCK_SVG + ' Livraison <strong>' + formatPrice(e.portTtcCents) + '</strong>'
      + ' <span style="opacity:.75">(colis de ' + taille + ', livre sous 2 jours ouvres)</span>'
      + '<br>Total port compris : <strong style="color:var(--accent,#FF4500)">'
      + formatPrice(total + e.portTtcCents) + '</strong>'
      + relance
      + '<br><span style="opacity:.75">Ou <strong>retrait gratuit à l\'atelier</strong> (Saint-Étienne).</span>';
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  injectCartQtyStyles();
  renderCart();
  injectContinueButton();

  /* ── GLOBAL API for configurateur.js ─────────────────────── */
  window.CartAddItem = function (item) {
    // Le nom fait partie de la clé de fusion : sans lui, un U et un L de
    // même finition, même longueur et même prix se confondraient en une
    // seule ligne, et le client recevrait deux fois la même pièce.
    const itemName = item.name || 'Pliage sur mesure';
    const itemExtras = item.extras || '';
    // Les accessoires font partie de la clé : deux pièces identiques accompagnées
    // d'accessoires différents sont deux lignes de commande différentes.
    const existing = cart.find(
      (i) => (i.name || 'Pliage sur mesure') === itemName
        && i.finish === item.finish && i.price === item.price && i.length === item.length
        && (i.extras || '') === itemExtras
    );
    if (existing) {
      existing.qty += item.qty || 1;
      // Forfait accessoires : on additionne les deux ajouts, on ne les multiplie pas.
      existing.extrasCents = (existing.extrasCents || 0) + (item.extrasCents || 0);
    } else {
      cart.push({
        name:   itemName,
        finish: item.finish || '—',
        length: item.length || '—',
        extras: itemExtras,
        price:  item.price  || 0,
        extrasCents: item.extrasCents || 0,
        qty:    item.qty    || 1,
        // Geometrie d'expedition : sans elle le panier ne peut ni peser la
        // commande ni savoir si le colis sort du reseau standard.
        ship:   item.ship || null,
      });
    }
    renderCart();
    openCart();
  };

  document.addEventListener('cart:add', (e) => window.CartAddItem(e.detail));

})();
