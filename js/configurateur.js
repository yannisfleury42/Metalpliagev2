/* ═══════════════════════════════════════════════════════════════
   configurateur.js — Couvertine sur mesure
   Metal Pliage
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     CONSTANTS
  ──────────────────────────────────────────────────────────── */

  const MATERIALS = {
    acier: { name: 'Acier',     epaisseur: '0,75 mm', rate: 85  },
    alu:   { name: 'Aluminium', epaisseur: '1,5 mm',  rate: 110 },
  };

  const MIN_PRICE_HT = 35;
  const TVA          = 0.20;

  const RAL_COLORS = [
    { code: '7016', name: 'Gris Anthracite', hex: '#3C3F42', light: false },
    { code: '9005', name: 'Noir Satiné',     hex: '#0A0A0A', light: false },
    { code: '9010', name: 'Blanc Pur',       hex: '#F4F3EF', light: true  },
    { code: '8014', name: 'Brun Chocolat',   hex: '#493427', light: false },
    { code: '9006', name: 'Gris Clair',      hex: '#A5A8A6', light: true  },
  ];

  const ACCESSORIES = [
    { id: 'angle',  name: 'Angle 90°', price: 8 },
    { id: 'clisse', name: 'Éclisse',   price: 6 },
    { id: 'talon',  name: 'Talon',     price: 5 },
  ];

  /* ────────────────────────────────────────────────────────────
     STATE
  ──────────────────────────────────────────────────────────── */

  const state = {
    material: null,
    B: 200,
    A: 40,
    C: 250,   // largeur totale de tôle (B+50 par défaut, modifiable jusqu'à 350 mm)
    L: 2000,
    R: 10,
    color: null,
    accessories: {
      angle:  { qty: 0, color: null },
      clisse: { qty: 0, color: null },
      talon:  { qty: 0, color: null },
    },
    qty: 1,
  };

  /* ────────────────────────────────────────────────────────────
     DOM REFS
  ──────────────────────────────────────────────────────────── */

  const profileSvg    = document.getElementById('profile-svg');
  const miniSvg       = document.getElementById('mini-svg');
  const infoDev       = document.getElementById('info-dev');
  const infoLen       = document.getElementById('info-len');
  const infoSurf      = document.getElementById('info-surf');
  const ralGrid       = document.getElementById('ral-grid');
  const mainQtyInput  = document.getElementById('main-qty');
  const step5Ht       = document.getElementById('step5-ht');
  const step5Ttc      = document.getElementById('step5-ttc');
  const priceHt       = document.getElementById('price-ht');
  const priceTtc      = document.getElementById('price-ttc');
  const btnCart       = document.getElementById('btn-cart');
  const sidebarBtnCart = document.getElementById('sidebar-btn-cart');

  const recapMaterial = document.getElementById('recap-material');
  const recapDims     = document.getElementById('recap-dims');
  const recapDev      = document.getElementById('recap-dev');
  const recapColor    = document.getElementById('recap-color');
  const recapAcc      = document.getElementById('recap-acc');
  const recapQty      = document.getElementById('recap-qty');

  /* ────────────────────────────────────────────────────────────
     STEP UNLOCK
  ──────────────────────────────────────────────────────────── */

  function unlockStep(n) {
    const el = document.getElementById('step-' + n);
    if (el) el.classList.remove('step-section--disabled');
  }

  /* ────────────────────────────────────────────────────────────
     SVG — COUVERTINE SUR MURET BÉTON
  ──────────────────────────────────────────────────────────── */

  function f(n) { return n.toFixed(2); }

  function lighten(hex, amt) {
    // Simple lighten: clamp each channel up by amt (0–255)
    const r = Math.min(255, parseInt(hex.slice(1,3),16) + amt);
    const g = Math.min(255, parseInt(hex.slice(3,5),16) + amt);
    const b = Math.min(255, parseInt(hex.slice(5,7),16) + amt);
    return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
  }
  function darken(hex, amt) { return lighten(hex, -amt); }

  function buildSVGContent(B, A, C, R, colorHex, isLight, mini) {
    /* ── Échelle & padding ── */
    const OVH       = (C - B) / 2;              // overhang de chaque côté (mm)
    const totalMM   = C;                         // largeur totale couvertine en mm
    const targetPx  = mini ? 170 : 380;          // largeur cible SVG
    const PAD_MM    = mini ? 6 : 20;             // marge latérale en mm
    const scale     = targetPx / (totalMM + 2 * PAD_MM);

    const PAD       = PAD_MM * scale;
    const PAD_TOP   = mini ? 14 : 72;   // espace au-dessus pour labels
    const MURET_H   = mini ? 55 : 110;  // hauteur muret affichée en px

    /* ── Coordonnées X ── */
    const xCovLeft   = PAD;                         // bord gauche couvertine
    const xMuretLeft = PAD + OVH * scale;           // bord gauche muret
    const xMuretRight= xMuretLeft + B * scale;      // bord droit muret
    const xCovRight  = xMuretRight + OVH * scale;   // bord droit couvertine

    /* ── Coordonnées Y ── */
    const yTop    = PAD_TOP;               // dessus de la couvertine = dessus du muret
    const THICK   = mini ? 3 : 5;         // épaisseur visuelle de la tôle
    const yTopIn  = yTop + THICK;         // intérieur haut
    const yBot    = yTop + A * scale;     // bas des retours
    const yBotIn  = yBot - THICK;         // intérieur bas

    /* ── Rejet à 45° ── */
    const rLen  = R * scale;
    const r45   = rLen / Math.SQRT2;
    const xTipL = xCovLeft  + r45;  // tip rejet gauche (vers intérieur)
    const xTipR = xCovRight - r45;  // tip rejet droit
    const yTip  = yBot      - r45;  // remonte à 45°

    /* ── ViewBox ── */
    const LABEL_PAD = mini ? 0 : 56;            // espace à droite pour cote A
    const svgW = xCovRight + PAD + LABEL_PAD;
    const svgH = yBot + MURET_H + (mini ? 8 : 16);

    /* ── Couleur couvertine ── */
    const baseColor  = colorHex || '#7A8696';
    const topColor   = isLight ? darken(baseColor, 18) : lighten(baseColor, 28);  // face du dessus (éclairée)
    const sideColor  = isLight ? darken(baseColor, 35) : darken(baseColor, 12);   // retours (ombre)
    const edgeColor  = isLight ? darken(baseColor, 50) : lighten(baseColor, 50);  // arête visible

    /* ── ID unique pour defs (évite collision full/mini) ── */
    const uid = mini ? 'mini' : 'full';

    /* ── Chemin profil extérieur couvertine ── */
    const outerPath =
      `M ${f(xTipL)},${f(yTip)} ` +
      `L ${f(xCovLeft)},${f(yBot)} ` +
      `L ${f(xCovLeft)},${f(yTop)} ` +
      `L ${f(xCovRight)},${f(yTop)} ` +
      `L ${f(xCovRight)},${f(yBot)} ` +
      `L ${f(xTipR)},${f(yTip)}`;

    /* ── Chemin profil intérieur (pour remplissage avec épaisseur) ── */
    const innerPath =
      `M ${f(xTipL + THICK * 0.7)},${f(yTip + THICK * 0.3)} ` +
      `L ${f(xCovLeft + THICK)},${f(yBotIn)} ` +
      `L ${f(xCovLeft + THICK)},${f(yTopIn)} ` +
      `L ${f(xCovRight - THICK)},${f(yTopIn)} ` +
      `L ${f(xCovRight - THICK)},${f(yBotIn)} ` +
      `L ${f(xTipR - THICK * 0.7)},${f(yTip + THICK * 0.3)}`;

    /* ── Béton : blocs ── */
    const blockH    = mini ? 18 : 34;
    const blockW1   = mini ? 44 : 88;
    const blockW2   = mini ? 56 : 110;
    const jointW    = mini ? 1.5 : 3;     // épaisseur mortier
    const jointC    = '#505A66';           // mortier principal
    const jointShadow = 'rgba(0,0,0,0.35)'; // ombre sous le mortier
    const blockC    = '#7E8D99';           // bloc base (gris béton chaud)
    const blockDark = '#6C7B87';
    const blockLight = '#8E9DAA';
    const blockHL   = 'rgba(255,255,255,0.07)'; // reflet haut de bloc

    let concreteBlocks = '';
    const muretX = xMuretLeft;
    const muretW = B * scale;
    const rows   = Math.ceil(MURET_H / blockH) + 2;

    for (let row = 0; row < rows; row++) {
      const ry = yTop + row * blockH;
      const offset = (row % 2 === 0) ? 0 : blockW1 / 2;
      const bw = (row % 2 === 0) ? blockW1 : blockW2;
      const bc = (row % 3 === 0) ? blockC : (row % 3 === 1 ? blockDark : blockLight);

      for (let bx = muretX - offset; bx < muretX + muretW; bx += bw) {
        const bxClip = Math.max(bx, muretX);
        const bwClip = Math.min(bx + bw, muretX + muretW) - bxClip;
        if (bwClip <= 0) continue;
        // Corps du bloc
        concreteBlocks += `<rect x="${f(bxClip)}" y="${f(ry + jointW)}" width="${f(bwClip)}" height="${f(blockH - jointW)}" fill="${bc}" shape-rendering="crispEdges"/>`;
        // Reflet supérieur (surface top-lit)
        concreteBlocks += `<rect x="${f(bxClip)}" y="${f(ry + jointW)}" width="${f(bwClip)}" height="${f((blockH - jointW) * 0.3)}" fill="${blockHL}" shape-rendering="crispEdges"/>`;
        // Joint vertical
        const jx = bx + bw;
        if (jx > muretX && jx < muretX + muretW) {
          concreteBlocks += `<line x1="${f(jx)}" y1="${f(ry + jointW)}" x2="${f(jx)}" y2="${f(ry + blockH)}" stroke="${jointC}" stroke-width="${mini ? 1 : 2}" shape-rendering="crispEdges"/>`;
        }
      }
      // Joint horizontal (bande de mortier entre rangs)
      if (row > 0) {
        concreteBlocks += `<rect x="${f(muretX)}" y="${f(ry)}" width="${f(muretW)}" height="${f(jointW)}" fill="${jointC}" shape-rendering="crispEdges"/>`;
        concreteBlocks += `<line x1="${f(muretX)}" y1="${f(ry + jointW)}" x2="${f(muretX + muretW)}" y2="${f(ry + jointW)}" stroke="${jointShadow}" stroke-width="1" shape-rendering="crispEdges"/>`;
      }
    }

    /* ── Labels dimensions (pleine taille uniquement) ── */
    const annColor = '#4F92CC';
    let labels = '';
    if (!mini) {
      const lc  = annColor;
      const tc  = '#C8E4F8';
      const acc = '#FF5833';
      const fs  = 11;

      // ── B (largeur muret) ──
      const byY = yTop - 22;
      labels += `
        <line x1="${f(xMuretLeft)}" y1="${f(yTop)}" x2="${f(xMuretLeft)}" y2="${f(byY - 4)}"
              stroke="${lc}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.6"/>
        <line x1="${f(xMuretRight)}" y1="${f(yTop)}" x2="${f(xMuretRight)}" y2="${f(byY - 4)}"
              stroke="${lc}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.6"/>
        <line x1="${f(xMuretLeft)}" y1="${f(byY)}" x2="${f(xMuretRight)}" y2="${f(byY)}"
              stroke="${lc}" stroke-width="1.5" marker-start="url(#arr-${uid})" marker-end="url(#arr-${uid})"/>
        <rect x="${f((xMuretLeft+xMuretRight)/2 - 36)}" y="${f(byY - 27)}" width="72" height="18" rx="3" fill="rgba(4,9,16,0.88)"/>
        <text x="${f((xMuretLeft+xMuretRight)/2)}" y="${f(byY - 13)}"
              text-anchor="middle" font-size="${fs}" fill="${tc}"
              font-family="Inter,sans-serif" font-weight="700">B = ${B} mm</text>
      `;

      // ── Total couvertine (B+50) ──
      const covY = byY - 32;
      labels += `
        <line x1="${f(xCovLeft)}" y1="${f(covY)}" x2="${f(xCovRight)}" y2="${f(covY)}"
              stroke="${lc}" stroke-width="1" marker-start="url(#arr-${uid})" marker-end="url(#arr-${uid})" opacity="0.5"/>
        <rect x="${f((xCovLeft+xCovRight)/2 - 48)}" y="${f(covY - 17)}" width="96" height="14" rx="3" fill="rgba(4,9,16,0.78)"/>
        <text x="${f((xCovLeft+xCovRight)/2)}" y="${f(covY - 6)}"
              text-anchor="middle" font-size="9.5" fill="${lc}"
              font-family="Inter,sans-serif" font-weight="500" opacity="0.7">C = ${C} mm</text>
      `;

      // ── Overhang gauche (25 mm) ──
      labels += `
        <line x1="${f(xCovLeft)}" y1="${f(byY + 5)}" x2="${f(xMuretLeft)}" y2="${f(byY + 5)}"
              stroke="${acc}" stroke-width="1.2"/>
        <line x1="${f(xCovLeft)}" y1="${f(byY)}" x2="${f(xCovLeft)}" y2="${f(byY + 10)}"
              stroke="${acc}" stroke-width="1.2"/>
        <line x1="${f(xMuretLeft)}" y1="${f(byY)}" x2="${f(xMuretLeft)}" y2="${f(byY + 10)}"
              stroke="${acc}" stroke-width="1.2"/>
        <text x="${f((xCovLeft + xMuretLeft) / 2)}" y="${f(byY + 21)}"
              text-anchor="middle" font-size="9" fill="${acc}"
              font-family="Inter,sans-serif" font-weight="600">25 mm</text>
      `;

      // ── A (hauteur retour) : côté droit ──
      const aX  = xCovRight + 18;
      const aMid = (yTop + yBot) / 2;
      labels += `
        <line x1="${f(xCovRight)}" y1="${f(yTop)}" x2="${f(aX - 3)}" y2="${f(yTop)}"
              stroke="${lc}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.6"/>
        <line x1="${f(xCovRight)}" y1="${f(yBot)}" x2="${f(aX - 3)}" y2="${f(yBot)}"
              stroke="${lc}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.6"/>
        <line x1="${f(aX)}" y1="${f(yTop)}" x2="${f(aX)}" y2="${f(yBot)}"
              stroke="${lc}" stroke-width="1.5" marker-start="url(#arr-${uid})" marker-end="url(#arr-${uid})"/>
        <rect x="${f(aX + 5)}" y="${f(aMid - 10)}" width="44" height="18" rx="3" fill="rgba(4,9,16,0.88)"/>
        <text x="${f(aX + 9)}" y="${f(aMid + 4)}"
              text-anchor="start" font-size="${fs}" fill="${tc}"
              font-family="Inter,sans-serif" font-weight="700">A = ${A} mm</text>
      `;

      // ── R (rejet) ──
      labels += `
        <rect x="${f(xTipL + 5)}" y="${f(yTip - 1)}" width="64" height="15" rx="3" fill="rgba(4,9,16,0.78)"/>
        <text x="${f(xTipL + 9)}" y="${f(yTip + 10)}"
              text-anchor="start" font-size="9" fill="${lc}"
              font-family="Inter,sans-serif" opacity="0.8">R = ${R} mm  45°</text>
      `;
    }

    /* ── Defs (arrowheads, clip, gradients) ── */
    const covGradId    = `covGrad-${uid}`;
    const sideGradId   = `sideGrad-${uid}`;
    const muretClipId  = `muretClip-${uid}`;
    const ovhShadId    = `ovhShad-${uid}`;

    const defs = `
      <defs>
        <marker id="arr-${uid}" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="${annColor}"/>
        </marker>
        <clipPath id="${muretClipId}">
          <rect x="${f(xMuretLeft)}" y="${f(yTop)}" width="${f(B * scale)}" height="${f(MURET_H + 2)}"/>
        </clipPath>
        <!-- Gradient face supérieure tôle (metallic sheen) -->
        <linearGradient id="${covGradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${lighten(topColor, 30)}" stop-opacity="1"/>
          <stop offset="30%"  stop-color="${topColor}"              stop-opacity="1"/>
          <stop offset="75%"  stop-color="${baseColor}"             stop-opacity="1"/>
          <stop offset="100%" stop-color="${darken(baseColor, 15)}" stop-opacity="1"/>
        </linearGradient>
        <!-- Gradient retours latéraux (face en ombre) -->
        <linearGradient id="${sideGradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${sideColor}"             stop-opacity="1"/>
          <stop offset="100%" stop-color="${darken(sideColor, 20)}" stop-opacity="1"/>
        </linearGradient>
        <!-- Gradient ombre overhang sur muret -->
        <linearGradient id="${ovhShadId}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="#000" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </linearGradient>
        <filter id="shadow-${uid}" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="1" dy="3" stdDeviation="${mini ? 2 : 4}" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>
    `;

    /* ── Muret béton ── */
    const muretBase = `
      <rect x="${f(xMuretLeft)}" y="${f(yTop)}" width="${f(B * scale)}" height="${f(MURET_H)}" fill="${blockC}"/>
      <g clip-path="url(#${muretClipId})">${concreteBlocks}</g>
    `;

    /* ── Intérieur sous la couvertine (ombre semi-transparente sur béton) ── */
    const innerBg = `
      <rect x="${f(xMuretLeft)}" y="${f(yTop)}" width="${f(B * scale)}" height="${f(Math.min(A * scale, MURET_H))}"
            fill="rgba(0,0,0,0.52)"/>
    `;

    /* ── Muret text ── */
    const muretLabel = !mini ? `
      <text x="${f(xMuretLeft + B * scale / 2)}" y="${f(yTop + MURET_H - 8)}" text-anchor="middle"
            font-size="10" fill="#4A5260" font-family="Inter,sans-serif" letter-spacing="0.1em">MURET BÉTON</text>
    ` : '';

    /* ── Ombres overhangs sur le dessus du muret ── */
    const ovhShadW = mini ? 10 : 22;
    const ovhShadH = mini ? 16 : 32;
    const overhangShadows = `
      <!-- Ombre overhang gauche → droite -->
      <rect x="${f(xMuretLeft)}" y="${f(yTop)}" width="${f(ovhShadW)}" height="${f(ovhShadH)}"
            fill="url(#${ovhShadId})"/>
      <!-- Ombre overhang droit → gauche (miroir) -->
      <rect x="${f(xMuretRight - ovhShadW)}" y="${f(yTop)}" width="${f(ovhShadW)}" height="${f(ovhShadH)}"
            fill="url(#${ovhShadId})" transform="scale(-1,1) translate(${f(-(xMuretRight - ovhShadW) * 2 - ovhShadW)},0)"/>
    `;

    /* ── Ombre portée couvertine sur muret ── */
    const dropShadow = `
      <rect x="${f(xMuretLeft - 2)}" y="${f(yTop)}" width="${f(B * scale + 4)}" height="${mini ? 9 : 18}"
            fill="#000" opacity="0.28" rx="1"/>
    `;

    /* ── Face dessus de la couvertine (metallic flat top) ── */
    const covW = xCovRight - xCovLeft;
    const specX = xCovLeft + covW * 0.18;
    const specW = covW * 0.22;
    const topFace = `
      <rect x="${f(xCovLeft)}" y="${f(yTop)}" width="${f(covW)}" height="${f(THICK)}"
            fill="url(#${covGradId})" filter="url(#shadow-${uid})"/>
      <!-- Reflet spéculaire (bande lumineuse) -->
      <rect x="${f(specX)}" y="${f(yTop)}" width="${f(specW)}" height="${f(THICK)}"
            fill="rgba(255,255,255,${isLight ? 0.22 : 0.12})" rx="0"/>
    `;

    /* ── Retour gauche ── */
    const retourGauche = `
      <polygon points="${f(xCovLeft)},${f(yTop)} ${f(xCovLeft)},${f(yBot)} ${f(xTipL)},${f(yTip)} ${f(xCovLeft + THICK)},${f(yBotIn)} ${f(xCovLeft + THICK)},${f(yTopIn)}"
               fill="url(#${sideGradId})"/>
      <line x1="${f(xCovLeft)}" y1="${f(yTop)}" x2="${f(xCovLeft)}" y2="${f(yBot)}" stroke="${edgeColor}" stroke-width="${mini ? 1 : 1.5}" stroke-linecap="round"/>
      <line x1="${f(xCovLeft)}" y1="${f(yBot)}" x2="${f(xTipL)}" y2="${f(yTip)}" stroke="${edgeColor}" stroke-width="${mini ? 1 : 1.5}" stroke-linecap="round"/>
    `;

    /* ── Retour droit ── */
    const retourDroit = `
      <polygon points="${f(xCovRight)},${f(yTop)} ${f(xCovRight)},${f(yBot)} ${f(xTipR)},${f(yTip)} ${f(xCovRight - THICK)},${f(yBotIn)} ${f(xCovRight - THICK)},${f(yTopIn)}"
               fill="url(#${sideGradId})"/>
      <line x1="${f(xCovRight)}" y1="${f(yTop)}" x2="${f(xCovRight)}" y2="${f(yBot)}" stroke="${edgeColor}" stroke-width="${mini ? 1 : 1.5}" stroke-linecap="round"/>
      <line x1="${f(xCovRight)}" y1="${f(yBot)}" x2="${f(xTipR)}" y2="${f(yTip)}" stroke="${edgeColor}" stroke-width="${mini ? 1 : 1.5}" stroke-linecap="round"/>
    `;

    /* ── Arête supérieure couvertine (reflet vif) ── */
    const topEdge = `
      <line x1="${f(xCovLeft)}" y1="${f(yTop)}" x2="${f(xCovRight)}" y2="${f(yTop)}"
            stroke="${lighten(topColor, 55)}" stroke-width="${mini ? 1 : 2}"/>
      <line x1="${f(xCovLeft)}" y1="${f(yTopIn)}" x2="${f(xCovRight)}" y2="${f(yTopIn)}"
            stroke="${darken(baseColor, 25)}" stroke-width="${mini ? 0.5 : 1}"/>
    `;

    return {
      viewBox: `0 0 ${f(svgW)} ${f(svgH)}`,
      content: `
        ${defs}
        <!-- Fond sombre -->
        <rect width="${f(svgW)}" height="${f(svgH)}" fill="#0f1215"/>

        <!-- Muret béton -->
        ${muretBase}
        ${muretLabel}

        <!-- Espace intérieur sous la couvertine (ombre semi-transparente) -->
        ${innerBg}

        <!-- Ombre couvertine sur muret -->
        ${dropShadow}
        ${overhangShadows}

        <!-- Retours latéraux -->
        ${retourGauche}
        ${retourDroit}

        <!-- Dessus couvertine -->
        ${topFace}
        ${topEdge}

        <!-- Labels -->
        ${labels}
      `,
    };
  }

  function drawSVG() {
    if (!profileSvg && !miniSvg) return;

    const { B, A, C, R } = state;
    const ralObj   = state.color ? RAL_COLORS.find(c => c.code === state.color) : null;
    const colorHex = ralObj ? ralObj.hex : null;
    const isLight  = ralObj ? ralObj.light : false;

    if (profileSvg) {
      const full = buildSVGContent(B, A, C, R, colorHex, isLight, false);
      profileSvg.setAttribute('viewBox', full.viewBox);
      profileSvg.innerHTML = full.content;
    }
    if (miniSvg) {
      const mini = buildSVGContent(B, A, C, R, colorHex, isLight, true);
      miniSvg.setAttribute('viewBox', mini.viewBox);
      miniSvg.innerHTML = mini.content;
    }
  }

  /* ────────────────────────────────────────────────────────────
     PRICING
  ──────────────────────────────────────────────────────────── */

  function calcPrice() {
    if (!state.material) return null;
    const { A, C, L, R } = state;
    const devWidth = C + 2 * A + 2 * R; // mm (C = B + 2×OVH)
    const surface  = (devWidth / 1000) * (L / 1000);
    const rate     = MATERIALS[state.material].rate;
    let ht = Math.max(surface * rate, MIN_PRICE_HT) * state.qty;
    for (const acc of ACCESSORIES) {
      const s = state.accessories[acc.id];
      if (s.qty > 0) ht += s.qty * acc.price;
    }
    return {
      ht:      Math.round(ht * 100) / 100,
      ttc:     Math.round(ht * (1 + TVA) * 100) / 100,
      devWidth,
      surface,
    };
  }

  function fmt(n) { return n.toFixed(2).replace('.', ','); }

  /* ────────────────────────────────────────────────────────────
     UI UPDATE
  ──────────────────────────────────────────────────────────── */

  function updateUI() {
    drawSVG();

    const { B, A, C, L, R } = state;
    const devWidth = C + 2 * A + 2 * R;
    const surface  = (devWidth / 1000) * (L / 1000);

    if (infoDev)  infoDev.textContent  = `Développé : ${devWidth} mm`;
    if (infoLen)  infoLen.textContent  = `Longueur : ${L} mm`;
    if (infoSurf) infoSurf.textContent = `Surface : ${surface.toFixed(4)} m²`;

    if (recapMaterial) recapMaterial.textContent = state.material ? `${MATERIALS[state.material].name} (${MATERIALS[state.material].epaisseur})` : '—';
    if (recapDims)     recapDims.textContent     = `B=${B}mm · A=${A}mm · C=${C}mm · L=${L}mm`;

    updateAccDiagram();
    if (recapDev)      recapDev.textContent      = state.material ? `${devWidth} mm` : '—';
    if (recapColor) {
      const ral = state.color ? RAL_COLORS.find(c => c.code === state.color) : null;
      recapColor.textContent = ral ? `RAL ${ral.code} ${ral.name}` : '—';
    }
    if (recapAcc) {
      const parts = ACCESSORIES.filter(a => state.accessories[a.id].qty > 0).map(a => `${state.accessories[a.id].qty}× ${a.name}`);
      recapAcc.textContent = parts.length ? parts.join(', ') : '—';
    }
    if (recapQty) recapQty.textContent = state.qty;

    const price = calcPrice();
    const htText  = price ? fmt(price.ht)  : '—';
    const ttcText = price ? fmt(price.ttc) : '—';
    if (priceHt)   priceHt.textContent   = htText;
    if (priceTtc)  priceTtc.textContent  = ttcText;
    if (step5Ht)   step5Ht.textContent   = htText;
    if (step5Ttc)  step5Ttc.textContent  = ttcText;

    const ready = !!(state.material && state.color);
    if (btnCart)         btnCart.disabled        = !ready;
    if (sidebarBtnCart)  sidebarBtnCart.disabled  = !ready;
  }

  /* ────────────────────────────────────────────────────────────
     MATERIAL SELECTION
  ──────────────────────────────────────────────────────────── */

  function selectMaterial(id) {
    state.material = id;
    document.querySelectorAll('.material-card').forEach((card) => {
      const sel = card.dataset.material === id;
      card.classList.toggle('is-selected', sel);
      card.setAttribute('aria-pressed', String(sel));
    });
    // Déverrouiller toutes les étapes en une fois — l'utilisateur peut accepter
    // les valeurs par défaut (B=200, A=40, C=250, L=2000) et passer direct à la
    // couleur ou aux accessoires sans toucher aux dimensions.
    unlockStep(2);
    unlockStep(3);
    unlockStep(4);
    unlockStep(5);
    updateUI();
  }

  document.querySelectorAll('.material-card').forEach((card) => {
    card.addEventListener('click', () => selectMaterial(card.dataset.material));
  });

  /* ────────────────────────────────────────────────────────────
     DIMENSION INPUTS
  ──────────────────────────────────────────────────────────── */

  function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

  const inputC = document.getElementById('input-C');

  function onDimInput(e) {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    if (e.target.id === 'input-B') {
      state.B = clamp(val, 80, 600);
      // Recaler C si trop petit après changement de B
      if (state.C < state.B + 10) {
        state.C = state.B + 50;
        if (inputC) inputC.value = state.C;
      }
      if (inputC) inputC.setAttribute('min', state.B + 10);
    }
    if (e.target.id === 'input-A') state.A = clamp(val, 20, 150);
    if (e.target.id === 'input-C') {
      state.C = clamp(val, state.B + 10, 350);
      e.target.value = state.C;
    }
    if (e.target.id === 'input-L') state.L = clamp(val, 200, 3000);
    updateUI();
    if (state.B >= 80 && state.A >= 20 && state.L >= 200) unlockStep(3);
  }

  ['input-B', 'input-A', 'input-C', 'input-L'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', onDimInput); el.addEventListener('change', onDimInput); }
  });

  /* ────────────────────────────────────────────────────────────
     RAL SWATCHES
  ──────────────────────────────────────────────────────────── */

  function buildRalGrid(container) {
    container.innerHTML = '';
    RAL_COLORS.forEach((ral) => {
      const btn = document.createElement('button');
      btn.className    = 'ral-swatch';
      btn.dataset.code = ral.code;
      btn.setAttribute('aria-label', `RAL ${ral.code} ${ral.name}`);
      btn.setAttribute('title', `RAL ${ral.code} — ${ral.name}`);
      btn.innerHTML = `
        <span class="ral-swatch-circle" style="background:${ral.hex};box-shadow:inset 0 0 0 1px rgba(${ral.light?'0,0,0,0.2':'255,255,255,0.1'})"></span>
        <span class="ral-swatch-name">RAL ${ral.code}<br><em>${ral.name}</em></span>
      `;
      container.appendChild(btn);
    });
  }

  function buildAccColors(container, accId) {
    container.innerHTML = '';
    RAL_COLORS.forEach((ral) => {
      const btn = document.createElement('button');
      btn.className    = 'ral-swatch';
      btn.dataset.code = ral.code;
      btn.setAttribute('aria-label', `RAL ${ral.code}`);
      btn.setAttribute('title', `RAL ${ral.code} ${ral.name}`);
      btn.innerHTML = `<span class="ral-swatch-circle" style="background:${ral.hex};width:26px;height:26px;border-width:2px;outline-width:2px"></span>`;
      btn.addEventListener('click', () => {
        state.accessories[accId].color = ral.code;
        container.querySelectorAll('.ral-swatch').forEach(b => b.classList.toggle('is-selected', b.dataset.code === ral.code));
        updateUI();
      });
      container.appendChild(btn);
    });
    // Pré-sélectionner la couleur déjà choisie (accessoire ou principale)
    const presel = state.accessories[accId].color || state.color;
    if (presel) highlightSwatch(container, presel);
  }

  function highlightSwatch(container, code) {
    container.querySelectorAll('.ral-swatch').forEach((btn) => {
      btn.classList.toggle('is-selected', btn.dataset.code === code);
    });
  }

  function selectColor(code) {
    state.color = code;
    highlightSwatch(ralGrid, code);
    // Sync automatique vers les accessoires
    ACCESSORIES.forEach(acc => {
      state.accessories[acc.id].color = code;
      const container = document.getElementById('colors-' + acc.id);
      if (container) highlightSwatch(container, code);
    });
    unlockStep(4);
    unlockStep(5);
    updateUI();
  }

  if (ralGrid) {
    buildRalGrid(ralGrid);
    ralGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.ral-swatch');
      if (btn) selectColor(btn.dataset.code);
    });
  }

  ACCESSORIES.forEach((acc) => {
    const colorContainer = document.getElementById('colors-' + acc.id);
    if (colorContainer) buildAccColors(colorContainer, acc.id);
  });

  /* ────────────────────────────────────────────────────────────
     ACCESSORY QTY
  ──────────────────────────────────────────────────────────── */

  document.querySelectorAll('.qty-btn[data-acc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const accId = btn.dataset.acc;
      const dir   = parseInt(btn.dataset.dir, 10);
      const s     = state.accessories[accId];
      s.qty = Math.max(0, Math.min(20, s.qty + dir));
      const input = document.getElementById('qty-' + accId);
      if (input) input.value = s.qty;
      const row = document.getElementById('acc-' + accId);
      if (row) row.classList.toggle('acc-inactive', s.qty === 0);
      updateUI();
    });
  });

  ACCESSORIES.forEach((acc) => {
    const row = document.getElementById('acc-' + acc.id);
    if (row) row.classList.add('acc-inactive');
  });

  /* ────────────────────────────────────────────────────────────
     MAIN QTY
  ──────────────────────────────────────────────────────────── */

  document.getElementById('main-qty-minus')?.addEventListener('click', () => {
    state.qty = Math.max(1, state.qty - 1);
    if (mainQtyInput) mainQtyInput.value = state.qty;
    updateUI();
  });

  document.getElementById('main-qty-plus')?.addEventListener('click', () => {
    state.qty = Math.min(999, state.qty + 1);
    if (mainQtyInput) mainQtyInput.value = state.qty;
    updateUI();
  });

  if (mainQtyInput) {
    mainQtyInput.addEventListener('change', () => {
      const val = parseInt(mainQtyInput.value, 10);
      if (!isNaN(val) && val >= 1) { state.qty = Math.min(999, val); mainQtyInput.value = state.qty; updateUI(); }
    });
  }

  /* ────────────────────────────────────────────────────────────
     SCHÉMA ACCESSOIRES
  ──────────────────────────────────────────────────────────── */

  function updateAccDiagram() {
    const ral  = state.color ? RAL_COLORS.find(c => c.code === state.color) : null;
    const base = ral ? ral.hex : '#7A8696';
    const top  = ral ? (ral.light ? darken(base, 15) : lighten(base, 22)) : '#4A7090';
    const face = base;
    const back = darken(base, 20);

    // Talon diagram
    document.getElementById('diag-talon-cov-top')?.setAttribute('fill', top);
    document.getElementById('diag-talon-cov-face')?.setAttribute('fill', face);
    document.getElementById('diag-talon-cov-back')?.setAttribute('fill', back);

    // Éclisse diagram — toutes les pièces en couleur RAL (même matériau)
    document.getElementById('diag-clisse-cov-top-l')?.setAttribute('fill', top);
    document.getElementById('diag-clisse-cov-face-l')?.setAttribute('fill', face);
    document.getElementById('diag-clisse-cov-top-r')?.setAttribute('fill', top);
    document.getElementById('diag-clisse-cov-face-r')?.setAttribute('fill', face);
    document.getElementById('diag-clisse-eclisse-top')?.setAttribute('fill', top);
    document.getElementById('diag-clisse-eclisse-face')?.setAttribute('fill', face);

    // Angle diagram
    document.getElementById('diag-angle-cov-main')?.setAttribute('fill', top);
    document.getElementById('diag-angle-cov-perp')?.setAttribute('fill', top);
  }

  /* ────────────────────────────────────────────────────────────
     CART
  ──────────────────────────────────────────────────────────── */

  function buildCartItem() {
    const mat   = MATERIALS[state.material];
    const ral   = RAL_COLORS.find(c => c.code === state.color);
    const price = calcPrice();
    return {
      name:   `Couvertine sur mesure — ${mat.name}`,
      finish: ral ? `RAL ${ral.code} ${ral.name}` : '—',
      length: `B=${state.B}mm · A=${state.A}mm · C=${state.C}mm · L=${state.L}mm`,
      price:  Math.round(price.ttc * 100),
      qty:    state.qty,
    };
  }

  function handleCartAdd() {
    if (!state.material || !state.color) return;
    if (typeof window.CartAddItem === 'function') window.CartAddItem(buildCartItem());
  }

  if (btnCart)         btnCart.addEventListener('click', handleCartAdd);
  if (sidebarBtnCart)  sidebarBtnCart.addEventListener('click', handleCartAdd);

  /* ────────────────────────────────────────────────────────────
     INIT
  ──────────────────────────────────────────────────────────── */

  drawSVG();
  updateUI();

})();
