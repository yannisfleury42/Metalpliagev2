/* ═══════════════════════════════════════════════════════════════
   CONFIGURATEUR PLIAGE SUR MESURE — Metal Pliage
   Formes U / L / Z / Appui de fenêtre
   Acier 0.75mm · Aluminium 1 ou 2mm · Inox 1 ou 2mm (brut)
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── CONSTANTES ─────────────────────────────────────────────── */
const RATES = {
  'acier-0.75': 75,
  'alu-1':      90,
  'alu-2':     115,
  'inox-1':    125,
  'inox-2':    160,
};

const RAL_COLORS = [
  { code: '7016', name: 'Gris Anthracite', hex: '#3C3F42' },
  { code: '9005', name: 'Noir Satiné',     hex: '#0A0A0A' },
  { code: '9010', name: 'Blanc Pur',       hex: '#F4F3EF' },
  { code: '8014', name: 'Brun Chocolat',   hex: '#493427' },
  { code: '9006', name: 'Gris Clair',      hex: '#A5A8A6' },
];

const DEG10  = 10  * Math.PI / 180;
const DEG102 = 102 * Math.PI / 180;
const PRICE_MIN = 35;
const TVA = 1.20;
const PINCE_MM = 12; // appui de fenêtre — pince fixe


/* ── DÉFINITIONS DES FORMES ──────────────────────────────────── */
const SHAPES = {
  U: {
    label: 'Forme U',
    dimKeys: ['A1', 'B', 'A2'],
    dimDefs: {
      A1: { label: 'Bras gauche', def: 40, min: 20, max: 300 },
      B:  { label: 'Largeur de la base', def: 200, min: 50, max: 600 },
      A2: { label: 'Bras droit',  def: 40, min: 20, max: 300 },
    },
    pts: (d) => [[0, d.A1], [0, 0], [d.B, 0], [d.B, d.A2]],
    dev: (d) => d.A1 + d.B + d.A2,
  },
  L: {
    label: 'Forme L',
    dimKeys: ['A', 'B'],
    dimDefs: {
      A: { label: 'Hauteur de la jambe', def: 60, min: 20, max: 400 },
      B: { label: 'Largeur de la base', def: 150, min: 30, max: 500 },
    },
    pts: (d) => [[0, 0], [0, d.A], [d.B, d.A]],
    dev: (d) => d.A + d.B,
  },
  Z: {
    label: 'Forme Z',
    dimKeys: ['A', 'H', 'B'],
    dimDefs: {
      A: { label: 'Aile haute', def: 60, min: 20, max: 300 },
      H: { label: "Hauteur de l'âme", def: 80, min: 20, max: 400 },
      B: { label: 'Aile basse', def: 60, min: 20, max: 300 },
    },
    pts: (d) => [[0, 0], [d.A, 0], [d.A, d.H], [d.A + d.B, d.H]],
    dev: (d) => d.A + d.H + d.B,
  },
  appui: {
    label: 'Appui de Fenêtre',
    dimKeys: ['A', 'B', 'C'],
    dimDefs: {
      A: { label: 'Retour (A)', def: 40, min: 20, max: 150 },
      B: { label: 'Profondeur (B)', def: 200, min: 80, max: 400 },
      C: { label: 'Nez (C)', def: 60, min: 20, max: 150 },
    },
    pts: (d) => {
      const p0 = [0, 0];
      const p1 = [0, d.A];
      const p2 = [p1[0] + d.B * Math.cos(DEG10), p1[1] + d.B * Math.sin(DEG10)];
      const p3 = [p2[0] + d.C * Math.cos(DEG102), p2[1] + d.C * Math.sin(DEG102)];
      const p4 = [p3[0] - PINCE_MM, p3[1]];
      return [p0, p1, p2, p3, p4];
    },
    dev: (d) => d.A + d.B + d.C + PINCE_MM,
  },
};


/* ── ACCESSOIRES ─────────────────────────────────────────────── */
const ACCESSORIES_PLIAGE = [
  { id: 'vis',   name: 'Vis inox auto-perceuses (lot de 10)', price: 4.20 },
  { id: 'joint', name: 'Bande butyle d\'étanchéité (rouleau 10 m)', price: 12.50 },
];


/* ── ÉTAT GLOBAL ─────────────────────────────────────────────── */
const state = {
  shape:     null,  // 'U' | 'L' | 'Z' | 'appui'
  material:  null,  // 'acier' | 'alu' | 'inox'
  thickness: null,  // null (acier=0.75 auto) | 1 | 2
  dims:      {},    // { A, B, H } selon forme
  L:         2000,
  color:     null,  // code RAL | 'brut'
  accessories: {
    vis:   { qty: 0 },
    joint: { qty: 0 },
  },
  qty:       1,
};


/* ── ELEMENTS DOM ────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

const elProfileSvg      = $('profile-svg');
const elMiniSvg         = $('mini-svg');
const elDimInputs       = $('dim-inputs');
const elInputL          = $('input-L');
const elInfoDev         = $('info-dev');
const elInfoLen         = $('info-len');
const elInfoSurf        = $('info-surf');
const elRalGrid         = $('ral-grid');
const elColorRalPanel   = $('color-ral-panel');
const elColorInoxPanel  = $('color-inox-panel');
const elColorStepDesc   = $('color-step-desc');
const elThicknessSelect = $('thickness-selector');
const elMainQty         = $('main-qty');
const elMainQtyMinus    = $('main-qty-minus');
const elMainQtyPlus     = $('main-qty-plus');
const elStep5HT         = $('step5-ht');
const elStep5TTC        = $('step5-ttc');
const elPriceHT         = $('price-ht');
const elPriceTTC        = $('price-ttc');
const elRecapShape      = $('recap-shape');
const elRecapMaterial   = $('recap-material');
const elRecapDims       = $('recap-dims');
const elRecapDev        = $('recap-dev');
const elRecapColor      = $('recap-color');
const elRecapQty        = $('recap-qty');
const elBtnCart         = $('btn-cart');
const elSidebarBtnCart  = $('sidebar-btn-cart');


/* ── STEP UNLOCK ─────────────────────────────────────────────── */
function unlockStep(n) {
  const el = $(`step-${n}`);
  if (el) el.classList.remove('step-section--disabled');
}


/* ── CALCUL PRIX ─────────────────────────────────────────────── */
function rateKey() {
  const th = state.material === 'acier' ? 0.75 : state.thickness;
  return `${state.material}-${th}`;
}

function calcPrice() {
  if (!state.shape || !state.material) return { ht: null, ttc: null };
  const shape = SHAPES[state.shape];
  const dimsFull = state.material === 'acier' || state.thickness
    ? dimsValid() : false;
  if (!dimsFull) return { ht: null, ttc: null };

  const devMm  = shape.dev(state.dims);
  const surfM2 = (devMm / 1000) * (state.L / 1000);
  const rk     = rateKey();
  const rate   = RATES[rk];
  if (!rate) return { ht: null, ttc: null };

  let priceHT  = Math.max(surfM2 * rate, PRICE_MIN) * state.qty;

  // Accessoires (quantité absolue, non multipliée par state.qty)
  for (const acc of ACCESSORIES_PLIAGE) {
    const q = state.accessories[acc.id].qty;
    if (q > 0) priceHT += q * acc.price;
  }

  const priceTTC = priceHT * TVA;
  return { ht: priceHT, ttc: priceTTC };
}

function fmt(n) {
  if (n === null || n === undefined) return '—';
  return n.toFixed(2).replace('.', ',');
}


/* ── VALIDATION DIMS ─────────────────────────────────────────── */
function dimsValid() {
  if (!state.shape) return false;
  const shape = SHAPES[state.shape];
  for (const k of shape.dimKeys) {
    const def = shape.dimDefs[k];
    const v   = state.dims[k];
    if (v === undefined || v === null || v < def.min || v > def.max) return false;
  }
  return state.L >= 100 && state.L <= 6000;
}


/* ── SVG DRAWING ─────────────────────────────────────────────── */
function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function drawSVG(svgElem, pts, colorHex, isMain) {
  svgElem.innerHTML = '';
  if (!pts || pts.length < 2) return;

  const W = isMain ? 420 : 200;
  const H = isMain ? 240 : 120;
  svgElem.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const PAD = isMain ? 38 : 20;
  const xs  = pts.map((p) => p[0]);
  const ys  = pts.map((p) => p[1]);
  let minX = Math.min(...xs), maxX = Math.max(...xs);
  let minY = Math.min(...ys), maxY = Math.max(...ys);

  // Avoid zero-size bbox
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const availW = W - 2 * PAD;
  const availH = H - 2 * PAD;
  const scale  = Math.min(availW / spanX, availH / spanY) * 0.78;

  const offX = (W - spanX * scale) / 2 - minX * scale;
  const offY = (H - spanY * scale) / 2 - minY * scale;

  const tx = (x) => x * scale + offX;
  const ty = (y) => y * scale + offY;

  // Background
  const bg = svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: '#0f1215' });
  svgElem.appendChild(bg);

  // Grid lines (subtle)
  if (isMain) {
    for (let i = 1; i < 4; i++) {
      const gl = svgEl('line', {
        x1: W * i / 4, y1: 0, x2: W * i / 4, y2: H,
        stroke: '#1a2028', 'stroke-width': 0.5,
      });
      svgElem.appendChild(gl);
    }
    for (let i = 1; i < 3; i++) {
      const gl = svgEl('line', {
        x1: 0, y1: H * i / 3, x2: W, y2: H * i / 3,
        stroke: '#1a2028', 'stroke-width': 0.5,
      });
      svgElem.appendChild(gl);
    }
  }

  // Profile polyline
  const ptStr = pts.map((p) => `${tx(p[0]).toFixed(1)},${ty(p[1]).toFixed(1)}`).join(' ');
  const line = svgEl('polyline', {
    points: ptStr,
    stroke: colorHex || '#FF4500',
    'stroke-width': isMain ? 3 : 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    fill: 'none',
  });
  svgElem.appendChild(line);

  // Endpoint dots
  for (const [x, y] of [pts[0], pts[pts.length - 1]]) {
    const dot = svgEl('circle', {
      cx: tx(x), cy: ty(y), r: isMain ? 4 : 2.5,
      fill: colorHex || '#FF4500', opacity: 0.7,
    });
    svgElem.appendChild(dot);
  }

  // Dim annotations (main SVG only)
  if (isMain && state.shape) {
    const shape = SHAPES[state.shape];
    drawDimAnnotations(svgElem, pts, shape, tx, ty);
  }
}

function drawDimAnnotations(svgElem, pts, shape, tx, ty) {
  if (!state.shape || !dimsValid()) return;

  const dimKeys = shape.dimKeys;

  // Centroid of screen-space points (for outward normal detection)
  const centX = pts.reduce((s, p) => s + tx(p[0]), 0) / pts.length;
  const centY = pts.reduce((s, p) => s + ty(p[1]), 0) / pts.length;

  const mainLine = svgElem.querySelector('polyline');

  for (let i = 0; i < Math.min(pts.length - 1, dimKeys.length); i++) {
    const key = dimKeys[i];
    if (!key) continue;
    const val = state.dims[key];
    if (!val) continue;

    const x1 = tx(pts[i][0]),     y1 = ty(pts[i][1]);
    const x2 = tx(pts[i + 1][0]), y2 = ty(pts[i + 1][1]);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    // Perpendicular to segment, pointing away from centroid
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    let nx = -dy / len, ny = dx / len;
    if ((mx + nx * 10 - centX) * nx + (my + ny * 10 - centY) * ny < 0) {
      nx = -nx; ny = -ny;
    }

    const TICK = 7;
    const OFF  = TICK + 3;

    // Extension tick lines from each endpoint
    const t1 = svgEl('line', { x1, y1, x2: x1 + nx * OFF, y2: y1 + ny * OFF, stroke: 'rgba(255,255,255,0.18)', 'stroke-width': 0.8 });
    const t2 = svgEl('line', { x1: x2, y1: y2, x2: x2 + nx * OFF, y2: y2 + ny * OFF, stroke: 'rgba(255,255,255,0.18)', 'stroke-width': 0.8 });
    // Dimension cote line
    const cl = svgEl('line', {
      x1: x1 + nx * OFF, y1: y1 + ny * OFF,
      x2: x2 + nx * OFF, y2: y2 + ny * OFF,
      stroke: 'rgba(255,255,255,0.22)', 'stroke-width': 0.8, 'stroke-dasharray': '3,2',
    });
    if (mainLine) { svgElem.insertBefore(t1, mainLine); svgElem.insertBefore(t2, mainLine); svgElem.insertBefore(cl, mainLine); }

    // Label with dark background, positioned beyond the cote line
    const LABEL_OFF = OFF + 11;
    const lx = mx + nx * LABEL_OFF;
    const ly = my + ny * LABEL_OFF;
    const text = `${key} = ${val} mm`;
    const bg = svgEl('rect', { x: lx - 26, y: ly - 7, width: 52, height: 12, fill: 'rgba(0,0,0,0.6)', rx: 3 });
    const lbl = svgEl('text', {
      x: lx, y: ly + 2,
      'text-anchor': 'middle',
      fill: 'rgba(255,255,255,0.75)',
      'font-size': '8.5',
      'font-family': 'Inter,sans-serif',
      'font-weight': '600',
    });
    lbl.textContent = text;
    svgElem.appendChild(bg);
    svgElem.appendChild(lbl);
  }

  // Appui: label for fixed pince on last segment
  if (state.shape === 'appui') {
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const mx = (tx(last[0]) + tx(prev[0])) / 2;
    const my = ty(last[1]) - 13;
    const bg  = svgEl('rect', { x: mx - 30, y: my - 7, width: 60, height: 12, fill: 'rgba(0,0,0,0.6)', rx: 3 });
    const lbl = svgEl('text', {
      x: mx, y: my + 2, 'text-anchor': 'middle',
      fill: 'rgba(255,255,255,0.55)', 'font-size': '8.5',
      'font-family': 'Inter,sans-serif', 'font-weight': '600',
    });
    lbl.textContent = 'pince = 12 mm';
    svgElem.appendChild(bg);
    svgElem.appendChild(lbl);
  }
}


/* ── RENDER DIM INPUTS ───────────────────────────────────────── */
function renderDimInputs() {
  elDimInputs.innerHTML = '';
  if (!state.shape) return;

  const shape = SHAPES[state.shape];

  for (const k of shape.dimKeys) {
    const def = shape.dimDefs[k];

    // Initialize dim from defaults if not set
    if (state.dims[k] === undefined) state.dims[k] = def.def;

    const row = document.createElement('div');
    row.className = 'dim-row';

    row.innerHTML = `
      <label class="dim-label" for="input-${k}">
        <span class="dim-letter">${k}</span>
        ${def.label}
      </label>
      <div class="dim-input-wrap">
        <input type="number" id="input-${k}" class="dim-input"
          value="${state.dims[k]}" min="${def.min}" max="${def.max}" step="5">
        <span class="dim-unit">mm</span>
      </div>
      <span class="dim-hint">min ${def.min} — max ${def.max}</span>
    `;

    elDimInputs.appendChild(row);

    const input = row.querySelector(`#input-${k}`);
    input.addEventListener('input', () => {
      const v = parseInt(input.value, 10);
      state.dims[k] = isNaN(v) ? def.def : Math.min(def.max, Math.max(def.min, v));
      updateUI();
      checkUnlockStep4();
    });
  }

  // Special info row for appui (pince fixe)
  if (state.shape === 'appui') {
    const row = document.createElement('div');
    row.className = 'dim-row dim-row--info';
    row.innerHTML = `
      <label class="dim-label">
        <span class="dim-letter dim-letter--fixed">P</span>
        Pince (fixe)
      </label>
      <div class="dim-fixed-val">${PINCE_MM} <em>mm</em></div>
      <span class="dim-hint">Non modifiable</span>
    `;
    elDimInputs.appendChild(row);
  }
}


/* ── BUILD RAL GRID ──────────────────────────────────────────── */
function buildRalGrid() {
  elRalGrid.innerHTML = '';
  for (const ral of RAL_COLORS) {
    const btn = document.createElement('button');
    btn.className = 'ral-swatch';
    btn.dataset.code = ral.code;
    btn.setAttribute('aria-label', `RAL ${ral.code} — ${ral.name}`);
    btn.innerHTML = `
      <span class="ral-swatch-circle" style="background:${ral.hex}"></span>
      <span class="ral-swatch-name">RAL ${ral.code}<em>${ral.name}</em></span>
    `;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ral-swatch').forEach((s) => s.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      state.color = ral.code;
      updateUI();
      unlockStep(5);
      unlockStep(6);
    });
    elRalGrid.appendChild(btn);
  }
}


/* ── UPDATE UI ───────────────────────────────────────────────── */
function updateUI() {
  const shape = state.shape ? SHAPES[state.shape] : null;

  // SVG
  if (shape && dimsValid()) {
    const pts      = shape.pts(state.dims);
    const ralEntry = RAL_COLORS.find((r) => r.code === state.color);
    const colorHex = ralEntry ? ralEntry.hex : (state.color === 'brut' ? '#C0C0C0' : '#FF4500');
    drawSVG(elProfileSvg, pts, colorHex, true);
    drawSVG(elMiniSvg, pts, colorHex, false);
  } else if (shape) {
    // Draw with defaults even if out-of-range (for visual feedback)
    const defaultDims = {};
    for (const k of shape.dimKeys) defaultDims[k] = state.dims[k] || shape.dimDefs[k].def;
    const pts      = shape.pts(defaultDims);
    const colorHex = '#FF4500';
    drawSVG(elProfileSvg, pts, colorHex, true);
    drawSVG(elMiniSvg, pts, colorHex, false);
  }

  // Info bar
  if (shape) {
    const devMm  = dimsValid() ? shape.dev(state.dims) : '—';
    const surfM2 = dimsValid()
      ? ((shape.dev(state.dims) / 1000) * (state.L / 1000)).toFixed(4)
      : '—';
    elInfoDev.textContent  = `Développé : ${devMm !== '—' ? devMm + ' mm' : '—'}`;
    elInfoLen.textContent  = `Longueur : ${state.L} mm`;
    elInfoSurf.textContent = `Surface : ${surfM2 !== '—' ? surfM2 + ' m²' : '—'}`;
  }

  // Price
  const { ht, ttc } = calcPrice();
  elStep5HT.textContent  = ht !== null ? fmt(ht) : '—';
  elStep5TTC.textContent = ttc !== null ? fmt(ttc) : '—';
  elPriceHT.textContent  = ht !== null ? fmt(ht) : '—';
  elPriceTTC.textContent = ttc !== null ? fmt(ttc) : '—';

  // Cart buttons
  const canCart = state.color && dimsValid() && state.material;
  elBtnCart.disabled        = !canCart;
  elSidebarBtnCart.disabled = !canCart;

  // Sidebar recap
  elRecapShape.textContent    = shape ? shape.label : '—';
  elRecapMaterial.textContent = state.material
    ? `${state.material.charAt(0).toUpperCase() + state.material.slice(1)} ${
        state.material === 'acier' ? '0,75 mm' : (state.thickness ? state.thickness + ' mm' : '—')
      }`
    : '—';
  if (shape && dimsValid()) {
    elRecapDims.textContent = shape.dimKeys
      .map((k) => `${k}=${state.dims[k]}mm`)
      .join(' · ');
    elRecapDev.textContent = `${shape.dev(state.dims)} mm`;
  } else {
    elRecapDims.textContent = '—';
    elRecapDev.textContent  = '—';
  }
  elRecapColor.textContent = state.color === 'brut'
    ? 'Inox Brut'
    : state.color ? `RAL ${state.color}` : '—';
  elRecapQty.textContent = state.qty;
}


/* ── MATERIAL AVAILABILITY ───────────────────────────────────── */
function updateMaterialAvailability() {
  const isAppui = state.shape === 'appui';
  const inoxCard = document.querySelector('.material-card[data-material="inox"]');
  if (!inoxCard) return;

  if (isAppui) {
    inoxCard.style.opacity = '0.3';
    inoxCard.style.pointerEvents = 'none';
    inoxCard.title = 'L\'inox n\'est pas disponible pour l\'appui de fenêtre';
    // Si inox était sélectionné, reset
    if (state.material === 'inox') {
      state.material = null;
      state.thickness = null;
      state.color = null;
      document.querySelectorAll('.material-card').forEach((c) => {
        c.classList.remove('is-selected');
        c.setAttribute('aria-pressed', 'false');
      });
      elThicknessSelect.hidden = true;
      elColorRalPanel.hidden   = false;
      elColorInoxPanel.hidden  = true;
    }
  } else {
    inoxCard.style.opacity = '';
    inoxCard.style.pointerEvents = '';
    inoxCard.title = '';
  }
}


/* ── STEP UNLOCK LOGIC ───────────────────────────────────────── */
function checkUnlockStep3() {
  // Unlock step 3 when material + (acier OR thickness chosen)
  if (!state.material) return;
  if (state.material === 'acier' || state.thickness) {
    unlockStep(3);
    // Re-render dim inputs after shape is set
    if (state.shape && elDimInputs.children.length === 0) renderDimInputs();
  }
}

function checkUnlockStep4() {
  const matReady = state.material && (state.material === 'acier' || state.thickness);
  if (dimsValid() && matReady) {
    unlockStep(4);
    // Couleur déjà choisie (ex: Inox brut) -> débloque accessoires + quantité
    if (state.color) {
      unlockStep(5);
      unlockStep(6);
    }
  }
}

function checkUnlockStep5() {
  // Step 5 = Accessoires (et 6 = Quantité) ; les deux s'ouvrent en même temps une fois la couleur validée
  if (state.color) {
    unlockStep(5);
    unlockStep(6);
  }
}


/* ── EVENT LISTENERS ─────────────────────────────────────────── */

// Shape cards
document.querySelectorAll('.shape-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.shape-card').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    card.setAttribute('aria-pressed', 'true');

    const newShape = card.dataset.shape;
    if (state.shape !== newShape) {
      state.shape = newShape;
      state.dims  = {};
    }

    unlockStep(2);
    updateMaterialAvailability();
    renderDimInputs();
    updateUI();

    // Re-check further steps
    checkUnlockStep3();
    checkUnlockStep4();
  });
});

// Material cards
document.querySelectorAll('.material-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.material-card').forEach((c) => c.classList.remove('is-selected'));
    card.classList.add('is-selected');
    card.setAttribute('aria-pressed', 'true');
    document.querySelectorAll('.material-card').forEach((c) => {
      if (c !== card) c.setAttribute('aria-pressed', 'false');
    });

    const mat = card.dataset.material;
    state.material = mat;

    // Thickness selector
    if (mat === 'acier') {
      elThicknessSelect.hidden = true;
      state.thickness = null;

      // RAL panel for acier
      elColorRalPanel.hidden  = false;
      elColorInoxPanel.hidden = true;
      elColorStepDesc.textContent = '5 coloris RAL standard';

      // Auto-select if color was brut
      if (state.color === 'brut') {
        state.color = null;
        document.querySelectorAll('.ral-swatch').forEach((s) => s.classList.remove('is-selected'));
      }

      checkUnlockStep3();
      checkUnlockStep4();
    } else if (mat === 'alu') {
      elThicknessSelect.hidden = false;
      state.thickness = null;

      elColorRalPanel.hidden  = false;
      elColorInoxPanel.hidden = true;
      elColorStepDesc.textContent = '5 coloris RAL standard';

      if (state.color === 'brut') {
        state.color = null;
        document.querySelectorAll('.ral-swatch').forEach((s) => s.classList.remove('is-selected'));
      }
    } else if (mat === 'inox') {
      elThicknessSelect.hidden = false;
      state.thickness = null;

      elColorRalPanel.hidden  = true;
      elColorInoxPanel.hidden = false;
      elColorStepDesc.textContent = 'Inox — finition brute uniquement';

      // Inox = brut auto
      state.color = 'brut';
    }

    updateUI();
  });
});

// Thickness buttons
document.querySelectorAll('.thickness-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.thickness-btn').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    state.thickness = parseInt(btn.dataset.thickness, 10);

    checkUnlockStep3();
    updateUI();
    checkUnlockStep4();
  });
});

// Longueur input
elInputL.addEventListener('input', () => {
  const v = parseInt(elInputL.value, 10);
  state.L = isNaN(v) ? 2000 : Math.min(6000, Math.max(100, v));
  updateUI();
  checkUnlockStep4();
});

// Qty controls
elMainQtyMinus.addEventListener('click', () => {
  if (state.qty > 1) {
    state.qty--;
    elMainQty.value = state.qty;
    updateUI();
  }
});

elMainQtyPlus.addEventListener('click', () => {
  if (state.qty < 999) {
    state.qty++;
    elMainQty.value = state.qty;
    updateUI();
  }
});

elMainQty.addEventListener('input', () => {
  const v = parseInt(elMainQty.value, 10);
  state.qty = isNaN(v) || v < 1 ? 1 : Math.min(999, v);
  elMainQty.value = state.qty;
  updateUI();
});

// Accessory qty controls
document.querySelectorAll('.qty-btn[data-acc]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const accId = btn.dataset.acc;
    const dir   = parseInt(btn.dataset.dir, 10);
    const s     = state.accessories[accId];
    s.qty = Math.max(0, Math.min(50, s.qty + dir));
    const input = document.getElementById('qty-' + accId);
    if (input) input.value = s.qty;
    const row = document.getElementById('acc-' + accId);
    if (row) row.classList.toggle('acc-inactive', s.qty === 0);
    updateUI();
  });
});

// État initial : accessoires inactifs visuellement
ACCESSORIES_PLIAGE.forEach((acc) => {
  const row = document.getElementById('acc-' + acc.id);
  if (row) row.classList.add('acc-inactive');
});

// Cart buttons
function addToCart() {
  if (!state.shape || !state.material) return;
  const shape     = SHAPES[state.shape];
  const dimStr    = shape.dimKeys.map((k) => `${k}=${state.dims[k]}mm`).join(' · ');
  const finish    = state.color === 'brut' ? 'Inox Brut' : `RAL ${state.color}`;
  const th        = state.material === 'acier' ? '0,75' : state.thickness;
  const { ttc }   = calcPrice();

  // Suffixe accessoires pour transparence (ex: "+ 2× vis, 1× joint")
  const accParts = ACCESSORIES_PLIAGE
    .filter((acc) => state.accessories[acc.id].qty > 0)
    .map((acc) => `${state.accessories[acc.id].qty}× ${acc.id}`);
  const accSuffix = accParts.length ? ` + ${accParts.join(', ')}` : '';

  window.CartAddItem?.({
    name:   `Pliage ${shape.label} — ${state.material.charAt(0).toUpperCase() + state.material.slice(1)} ${th}mm${accSuffix}`,
    finish,
    length: `${dimStr} · L=${state.L}mm`,
    price:  Math.round(ttc * 100),  // centimes TTC (cohérent avec cart.js)
    qty:    state.qty,
  });
}

elBtnCart.addEventListener('click', addToCart);
elSidebarBtnCart.addEventListener('click', addToCart);

// Cart open button (FAB)
const cartOpenBtn  = $('cart-open-btn');
const cartDrawer   = $('cart-drawer');
const cartBackdrop = $('cart-backdrop');
const cartCloseBtn = $('cart-close-btn');

if (cartOpenBtn && cartDrawer) {
  cartOpenBtn.addEventListener('click', () => {
    cartDrawer.hidden   = false;
    cartBackdrop.hidden = false;
  });
  cartCloseBtn?.addEventListener('click', () => {
    cartDrawer.hidden   = true;
    cartBackdrop.hidden = true;
  });
  cartBackdrop?.addEventListener('click', () => {
    cartDrawer.hidden   = true;
    cartBackdrop.hidden = true;
  });
}


/* ── INIT ────────────────────────────────────────────────────── */
buildRalGrid();

// Inox brut panel: auto-unlock step 5 when inox is chosen
const inoxBrutCard = document.querySelector('.inox-brut-card');
if (inoxBrutCard) {
  inoxBrutCard.addEventListener('click', () => {
    state.color = 'brut';
    inoxBrutCard.classList.add('is-selected');
    checkUnlockStep4();
    if (dimsValid()) {
      unlockStep(5);
      unlockStep(6);
      updateUI();
    }
  });
}

// Initial draw (empty state)
updateUI();

// Auto-sélection de la forme depuis l'URL (?forme=U|L|Z|appui)
(function preselectShapeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const forme  = params.get('forme');
  if (!forme) return;
  const valid = ['U', 'L', 'Z', 'appui'];
  if (!valid.includes(forme)) return;
  const card = document.querySelector('.shape-card[data-shape="' + forme + '"]');
  if (card) card.click();
})();
