/* ═══════════════════════════════════════════
   THREAT DETAIL v3 — Analyst Workspace
   Decision Support System for Crisis Analysts
   ═══════════════════════════════════════════ */

// ══════════════════════════════════════════
// DATA MODEL
// ══════════════════════════════════════════

const THREAT_DATA = {
  id: 'EVT-2026-04-003',
  type: 'Flood Risk',
  severity: 'flood',
  peak_h: 36
};

// BASE SCENARIO — auto-calculated, read-only
const BASE_SCENARIO = {
  id: 'base',
  type: 'base',
  label: 'Scenariusz bazowy',
  params: {},
  results: {
    zone_km2: 2.4,
    buildings: 47, buildings_residential: 38, buildings_commercial: 6, buildings_critical: 3,
    roads: 3,
    critical_infra: 2,
    cost_min: 12, cost_max: 18,
    peak_h: 36,
    warning: null
  },
  show_to_decision_maker: false,
  computed_at: '2026-04-08 20:00',
  color: '#4F98A3',
  show_on_map: true,
  impact: {
    residents: 890,
    residential: 38,
    public_bldg: 6,
    public_detail: 'szkoły: 2 · szpital: 1 · urząd: 3',
    cultural: 1,
    roads_km: 3.2,
    railways_km: 0.8,
    waterworks: 1,
    critical: 2,
    ippc: 2,
    natura2000: 12,
    cost_direct: '12–18M PLN',
    cost_indirect: '4–8M PLN'
  }
};

// WHAT-IF VARIANTS (user creates these)
let VARIANTS = [];
let variantCounter = 0;
const VARIANT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// PIPELINE PARAMETERS
const PIPELINE_PARAMS = [
  { name: 'precipitation_pct', label: 'Zmiana opadów', type: 'range', min: -50, max: 100, default: 0, unit: '%' },
  { name: 'levee_breach_km', label: 'Pęknięcie wału', type: 'number', default: null, unit: 'km', optional: true }
];

// SCENARIO COLORS (base always teal, variants cycle through these)
const SCENARIO_COLORS = {
  base: '#4F98A3',
  variants: ['#EAB945', '#E08644', '#C74FBB', '#D95050', '#9B7FD4']
};

// IMPACT CATEGORIES (Dyrektywa Powodziowa 2007/60/WE + Prawo Wodne art. 169)
const IMPACT_CATEGORIES = [
  {
    group: 'Ludność i budynki',
    items: [
      { id: 'residents',    icon: '👤', label: 'Mieszkańcy w strefie',          unit: 'os.',  higher_is_worse: true },
      { id: 'residential',  icon: '🏠', label: 'Budynki mieszkalne',             unit: '',     higher_is_worse: true },
      { id: 'public_bldg',  icon: '🏫', label: 'Użyteczność publiczna',          unit: '',     higher_is_worse: true, detail_key: 'public_detail' },
      { id: 'cultural',     icon: '🏛', label: 'Obiekty dziedzictwa kulturowego', unit: '',    higher_is_worse: true },
    ]
  },
  {
    group: 'Infrastruktura',
    items: [
      { id: 'roads_km',     icon: '🛣', label: 'Drogi publiczne',               unit: 'km',   higher_is_worse: true },
      { id: 'railways_km',  icon: '🚂', label: 'Linie kolejowe',                unit: 'km',   higher_is_worse: true },
      { id: 'waterworks',   icon: '💧', label: 'Ujęcia wody pitnej',            unit: '',     higher_is_worse: true },
      { id: 'critical',     icon: '⚡', label: 'Infrastruktura krytyczna',       unit: '',     higher_is_worse: true },
    ]
  },
  {
    group: 'Środowisko / regulacje',
    items: [
      { id: 'ippc',         icon: '🏭', label: 'Instalacje IPPC/Seveso',        unit: '',     higher_is_worse: true },
      { id: 'natura2000',   icon: '🌿', label: 'Obszary Natura 2000',           unit: 'ha',   higher_is_worse: true },
    ]
  },
  {
    group: 'Koszty szacunkowe',
    items: [
      { id: 'cost_direct',  icon: '💰', label: 'Straty bezpośrednie',           unit: 'PLN',  higher_is_worse: true, is_text: true },
      { id: 'cost_indirect',icon: '📊', label: 'Straty pośrednie',              unit: 'PLN',  higher_is_worse: true, is_text: true },
    ]
  }
];

// DATASETS
let DATASETS = [
  { id: 'sys_flood', name: 'Strefa zalewowa', source: 'pipeline', private: false, affects_calc: true },
  { id: 'sys_buildings', name: 'Budynki BDOT10k', source: 'system', private: false, affects_calc: true },
  { id: 'sys_roads', name: 'Sieć dróg', source: 'system', private: false, affects_calc: true }
];

// GIS OBJECTS
let GIS_OBJECTS = [];
let pendingGisGeometry = null;
let activeGisTool = 'select';

// MAP state
let activeMapScenarios = new Set(['base']); // ids of scenarios currently shown on map

// Layer visibility
const LAYERS = { exposure: true, buildings: true, roads: true, infra: true };


// ══════════════════════════════════════════
// MAP DATA
// ══════════════════════════════════════════

const RIVER_PATH = [
  [0.08, 0.15], [0.15, 0.22], [0.22, 0.30], [0.30, 0.35],
  [0.38, 0.40], [0.45, 0.48], [0.50, 0.55], [0.55, 0.60],
  [0.60, 0.62], [0.68, 0.58], [0.75, 0.55], [0.82, 0.60],
  [0.88, 0.65], [0.95, 0.72]
];

const EXPOSURE_ZONE = [
  [0.22, 0.26], [0.28, 0.30], [0.35, 0.33], [0.42, 0.37],
  [0.50, 0.43], [0.58, 0.50], [0.65, 0.50], [0.72, 0.48],
  [0.78, 0.50], [0.82, 0.55], [0.85, 0.60],
  [0.85, 0.70], [0.80, 0.68], [0.72, 0.65],
  [0.65, 0.68], [0.58, 0.70], [0.50, 0.66],
  [0.42, 0.52], [0.35, 0.45], [0.28, 0.40], [0.22, 0.36]
];

const BUILDINGS_BASE = [
  { x: 0.30, y: 0.32, type: 'residential' },
  { x: 0.33, y: 0.38, type: 'residential' },
  { x: 0.36, y: 0.35, type: 'commercial' },
  { x: 0.40, y: 0.42, type: 'residential' },
  { x: 0.43, y: 0.39, type: 'residential' },
  { x: 0.47, y: 0.50, type: 'residential' },
  { x: 0.50, y: 0.47, type: 'commercial' },
  { x: 0.53, y: 0.55, type: 'residential' },
  { x: 0.55, y: 0.52, type: 'residential' },
  { x: 0.58, y: 0.58, type: 'critical' },
  { x: 0.62, y: 0.55, type: 'residential' },
  { x: 0.65, y: 0.60, type: 'residential' },
  { x: 0.68, y: 0.53, type: 'residential' },
  { x: 0.70, y: 0.58, type: 'commercial' },
  { x: 0.72, y: 0.55, type: 'residential' },
  { x: 0.75, y: 0.60, type: 'residential' },
  { x: 0.78, y: 0.56, type: 'critical' },
  { x: 0.80, y: 0.62, type: 'residential' },
  { x: 0.35, y: 0.42, type: 'residential' },
  { x: 0.45, y: 0.46, type: 'residential' },
  { x: 0.60, y: 0.63, type: 'critical' },
  { x: 0.67, y: 0.57, type: 'residential' },
  { x: 0.73, y: 0.62, type: 'residential' },
  { x: 0.77, y: 0.53, type: 'commercial' }
];

const ROADS = [
  { from: [0.25, 0.28], to: [0.85, 0.55], label: 'DK8' },
  { from: [0.30, 0.45], to: [0.75, 0.65], label: 'Nadrzeczna' },
  { from: [0.50, 0.30], to: [0.50, 0.70], label: 'Mostowa' }
];

const INFRA_MARKERS = [
  { x: 0.58, y: 0.58, label: 'Stacja pomp', icon: '⚡' },
  { x: 0.78, y: 0.56, label: 'Szpital', icon: '🏥' }
];

// ══════════════════════════════════════════
// CHART DATA
// ══════════════════════════════════════════

const GAUGES = {
  klodzko: {
    id: 'klodzko',
    label: 'Kłodzko km 34.2',
    severity: 'L3',
    color: '#D95050',
    current_cm: 212,
    threshold_alarm: 200,
    threshold_warning: 170,
    // T-12h to T+0h historical (every 2h = 7 points)
    history: [140, 142, 145, 148, 149, 150, 152],
    // T+0h to T+72h base prediction (every 2h = 37 points)
    base_pred: [152, 158, 166, 175, 186, 197, 207, 214, 218, 220, 219, 216,
                211, 205, 199, 193, 187, 182, 177, 172, 168, 165, 162, 160,
                158, 157, 155, 154, 153, 152, 151, 150, 149, 149, 148, 148, 147],
    // Confidence band half-width at each point
    base_conf: [2, 3, 5, 7, 9, 11, 13, 14, 15, 15, 15, 14,
                13, 13, 12, 12, 11, 11, 10, 10, 10, 9, 9, 9,
                8, 8, 8, 8, 7, 7, 7, 7, 7, 7, 6, 6, 6],
    // Previous prediction (dashed faint)
    prev_pred: [150, 155, 163, 172, 183, 194, 204, 211, 215, 216, 214, 211,
                206, 200, 195, 189, 183, 178, 174, 169, 165, 162, 160, 158,
                156, 155, 154, 153, 152, 151, 150, 150, 149, 149, 148, 148, 147],
    // Variant A prediction (+20% precip → higher peak, later timing)
    varA_pred: [152, 160, 170, 182, 196, 209, 219, 227, 232, 234, 232, 228,
                222, 215, 207, 200, 193, 187, 181, 176, 171, 167, 163, 160,
                158, 156, 154, 153, 152, 151, 150, 150, 149, 149, 148, 148, 147],
    varA_conf: [2, 4, 6, 9, 12, 14, 16, 17, 18, 18, 17, 16,
                15, 14, 13, 13, 12, 11, 11, 10, 10, 9, 9, 8,
                8, 8, 7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6],
  },
  bystrzyca: {
    id: 'bystrzyca',
    label: 'Bystrzyca km 12.4',
    severity: 'L1',
    color: '#EAB945',
    current_cm: 156,
    threshold_alarm: 180,
    threshold_warning: 140,
    history: [120, 122, 125, 128, 132, 137, 143],
    base_pred: [143, 149, 155, 159, 160, 158, 154, 149, 144, 139, 135, 131,
                128, 125, 123, 121, 120, 119, 118, 117, 117, 116, 116, 116,
                115, 115, 115, 115, 114, 114, 114, 114, 114, 113, 113, 113, 113],
    base_conf: [2, 3, 4, 5, 5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    prev_pred: [141, 147, 153, 157, 158, 156, 152, 147, 142, 138, 134, 130,
                127, 125, 122, 121, 119, 118, 117, 117, 116, 116, 115, 115,
                115, 114, 114, 114, 114, 113, 113, 113, 113, 113, 112, 112, 112],
    varA_pred: [143, 151, 159, 165, 167, 165, 161, 155, 149, 143, 138, 134,
                130, 127, 125, 123, 121, 120, 119, 118, 117, 117, 116, 116,
                115, 115, 115, 114, 114, 114, 114, 113, 113, 113, 113, 112, 112],
    varA_conf: [2, 4, 5, 6, 7, 6, 6, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  },
  bardo: {
    id: 'bardo',
    label: 'Bardo km 52.7',
    severity: 'L2',
    color: '#E08644',
    current_cm: 195,
    threshold_alarm: 200,
    threshold_warning: 160,
    history: [130, 133, 138, 145, 153, 162, 172],
    base_pred: [172, 179, 186, 192, 197, 200, 202, 201, 199, 196, 192, 188,
                183, 179, 175, 171, 167, 163, 160, 157, 155, 153, 151, 150,
                149, 148, 147, 147, 146, 146, 145, 145, 145, 144, 144, 144, 143],
    base_conf: [3, 4, 6, 8, 9, 10, 11, 11, 11, 11, 10, 10, 9, 9, 8, 8, 8, 7, 7, 7, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4],
    prev_pred: [170, 177, 184, 190, 195, 198, 199, 198, 196, 193, 189, 185,
                181, 177, 173, 170, 166, 162, 159, 156, 154, 152, 150, 149,
                148, 147, 147, 146, 146, 145, 145, 145, 144, 144, 144, 143, 143],
    varA_pred: [172, 181, 190, 198, 204, 209, 211, 210, 207, 203, 198, 193,
                188, 183, 178, 173, 169, 165, 161, 158, 155, 153, 151, 150,
                149, 148, 147, 147, 146, 146, 145, 145, 145, 144, 144, 144, 143],
    varA_conf: [3, 5, 7, 9, 11, 12, 13, 13, 12, 12, 11, 10, 10, 9, 9, 8, 8, 7, 7, 7, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4],
  }
};

// Wave propagation: gauge peaks and exceedance windows (hours offset from T+0)
const WAVE_PROPAGATION = [
  {
    id: 'bystrzyca',
    label: 'Bystrzyca km 12.4',
    severity: 'L1',
    level_cm: 156,
    base: { start: 4, peak: 12, end: 22 },
    // variant predictions (keyed by variant letter)
    variants: { A: { start: 3, peak: 10, end: 20 } }
  },
  {
    id: 'klodzko',
    label: 'Kłodzko km 34.2',
    severity: 'L3',
    level_cm: 212,
    base: { start: 16, peak: 36, end: 52 },
    variants: { A: { start: 13, peak: 32, end: 50 } }
  },
  {
    id: 'bardo',
    label: 'Bardo km 52.7',
    severity: 'L2',
    level_cm: 195,
    base: { start: 28, peak: 48, end: 72 },
    variants: { A: { start: 24, peak: 43, end: 68 } }
  },
];

// Chart state
let selectedGaugeId = 'klodzko';
let waveCurrentTime = 36; // hours from T+0
let waveAnimating = false;
let waveAnimFrame = null;


// ══════════════════════════════════════════
// MAP RENDERING
// ══════════════════════════════════════════

const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const wrap = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = wrap.clientWidth * dpr;
  canvas.height = wrap.clientHeight * dpr;
  canvas.style.width = wrap.clientWidth + 'px';
  canvas.style.height = wrap.clientHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawMap() {
  resizeCanvas();
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;

  // Background
  ctx.fillStyle = '#0f1018';
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = '#1a1b25';
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 40) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
  }
  for (let j = 0; j < H; j += 40) {
    ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke();
  }

  // Roads (drawn before zones so zones overlay on top)
  if (LAYERS.roads) {
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeStyle = '#3A3B4A';
    ROADS.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(r.from[0] * W, r.from[1] * H);
      ctx.lineTo(r.to[0] * W, r.to[1] * H);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Road labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#5A5C6A';
    ROADS.forEach(r => {
      const mx = ((r.from[0] + r.to[0]) / 2) * W;
      const my = ((r.from[1] + r.to[1]) / 2) * H - 6;
      ctx.fillText(r.label, mx, my);
    });
  }

  // Draw all active scenario overlays (largest first, so smaller appear on top)
  if (LAYERS.exposure) {
    const scenariosToShow = getAllScenarios()
      .filter(s => activeMapScenarios.has(s.id))
      .sort((a, b) => b.results.zone_km2 - a.results.zone_km2);

    scenariosToShow.forEach(sc => {
      const zoneFactor = sc.results.zone_km2 / BASE_SCENARIO.results.zone_km2;
      const isBase = sc.type === 'base';
      const color = sc.color || '#4F98A3';
      // Parse color to RGB for rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      ctx.beginPath();
      const zonePoints = EXPOSURE_ZONE.map(p => {
        const cx = 0.55, cy = 0.52;
        return [cx + (p[0] - cx) * zoneFactor, cy + (p[1] - cy) * zoneFactor];
      });
      zonePoints.forEach((p, i) => {
        const px = p[0] * W, py = p[1] * H;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.closePath();

      if (isBase) {
        const grad = ctx.createRadialGradient(0.55 * W, 0.52 * H, 0, 0.55 * W, 0.52 * H, 0.35 * W * zoneFactor);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.22)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0.04)`);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = `rgba(${r},${g},${b},0.18)`;
      }
      ctx.fill();

      ctx.strokeStyle = `rgba(${r},${g},${b},0.5)`;
      ctx.lineWidth = isBase ? 1.5 : 2;
      ctx.setLineDash(isBase ? [6, 3] : [4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Zone label for variants (not base)
      if (!isBase) {
        const labelX = (0.55 + (0.22 - 0.55) * zoneFactor) * W;
        const labelY = (0.52 + (0.26 - 0.52) * zoneFactor) * H;
        ctx.fillStyle = color;
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText('W' + sc.letter + ': ' + sc.results.zone_km2 + ' km²', labelX + 8, labelY);
      }
    });
  }

  // River
  ctx.beginPath();
  RIVER_PATH.forEach((p, i) => {
    const px = p[0] * W, py = p[1] * H;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.strokeStyle = '#4F98A3';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // River glow
  ctx.beginPath();
  RIVER_PATH.forEach((p, i) => {
    const px = p[0] * W, py = p[1] * H;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.strokeStyle = 'rgba(79,152,163,0.15)';
  ctx.lineWidth = 12;
  ctx.stroke();

  // Buildings
  if (LAYERS.buildings) {
    const typeColors = {
      residential: '#EAB945',
      commercial: '#4F98A3',
      critical: '#D95050'
    };
    BUILDINGS_BASE.forEach(b => {
      const bx = b.x * W, by = b.y * H;
      ctx.fillStyle = typeColors[b.type] || '#8B8D9A';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(bx - 4, by - 4, 8, 8);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = typeColors[b.type] || '#8B8D9A';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx - 4, by - 4, 8, 8);
    });
  }

  // Infra markers
  if (LAYERS.infra) {
    ctx.font = '16px sans-serif';
    INFRA_MARKERS.forEach(m => {
      ctx.fillText(m.icon, m.x * W - 8, m.y * H - 10);
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#E2E4EA';
      ctx.fillText(m.label, m.x * W - 20, m.y * H + 16);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#E2E4EA';
    });
  }

  // Private datasets (dots)
  const privateDsets = DATASETS.filter(d => d.private);
  privateDsets.forEach(d => {
    ctx.fillStyle = '#C74FBB';
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 5; i++) {
      const px = (0.3 + Math.random() * 0.5) * W;
      const py = (0.3 + Math.random() * 0.4) * H;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });

  // GIS drawn objects
  ctx.strokeStyle = '#E08644';
  ctx.lineWidth = 2;
  GIS_OBJECTS.forEach(obj => {
    if (obj.type === 'line' && obj.points.length > 1) {
      ctx.beginPath();
      obj.points.forEach((p, i) => {
        const px = p[0] * W, py = p[1] * H;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.stroke();
      // Vertices
      obj.points.forEach(p => {
        ctx.fillStyle = '#E08644';
        ctx.beginPath();
        ctx.arc(p[0] * W, p[1] * H, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  });

  // Pending geometry
  if (pendingGisGeometry && pendingGisGeometry.points.length > 0) {
    ctx.strokeStyle = '#EAB945';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    pendingGisGeometry.points.forEach((p, i) => {
      const px = p[0] * W, py = p[1] * H;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    pendingGisGeometry.points.forEach(p => {
      ctx.fillStyle = '#EAB945';
      ctx.beginPath();
      ctx.arc(p[0] * W, p[1] * H, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Always update legend after drawing
  updateMapLegend();
}

function getScenarioById(id) {
  if (id === 'base') return BASE_SCENARIO;
  return VARIANTS.find(v => v.id === id) || BASE_SCENARIO;
}


// ══════════════════════════════════════════
// RECOMMENDATIONS GENERATOR
// ══════════════════════════════════════════

function generateRecommendations(scenario) {
  const recs = [];
  const r = scenario.results;

  if (r.buildings > 20 || r.peak_h < 12) {
    recs.push({
      icon: '🚨',
      title: 'Zarządź ewakuację',
      desc: 'ul. Rzeczna, Nadrzeczna, Przybrzeżna\nSzacunkowo ~120 osób',
      gis_action: false
    });
  }

  if (r.roads > 0) {
    const lines = [];
    if (r.peak_h) lines.push('DK8 km 12.3–14.7 — od T+' + r.peak_h + 'h');
    lines.push('ul. Nadrzeczna — od T+' + Math.max(12, (r.peak_h || 36) - 12) + 'h');
    recs.push({
      icon: '🚧',
      title: 'Zamknij drogi',
      desc: lines.join('\n'),
      gis_action: false
    });
  }

  if (r.zone_km2 > 2.0) {
    recs.push({
      icon: '🏗',
      title: 'Rozłóż worki z piaskiem',
      desc: 'Odcinek wału km 12.3–12.8 (~340 szt.)',
      gis_action: true
    });
  }

  if (r.critical_infra > 0) {
    const items = ['Stacja pomp Kłodzko-Południe'];
    if (r.critical_infra > 1) items.push('Szpital Powiatowy w Kłodzku');
    recs.push({
      icon: '⚡',
      title: 'Powiadom obiekty krytyczne',
      desc: items.join('\n'),
      gis_action: false
    });
  }

  if (r.cost_min >= 20) {
    recs.push({
      icon: '📋',
      title: 'Rozważ stan klęski żywiołowej',
      desc: 'Straty przekraczają próg 20M PLN wg rozporządzenia',
      gis_action: false
    });
  }

  return recs;
}


// ══════════════════════════════════════════
// COMPUTE VARIANT (MOCK)
// ══════════════════════════════════════════

function computeImpactData(zone_km2, buildings, buildings_residential) {
  // Scale from base values proportionally
  const factor = zone_km2 / BASE_SCENARIO.results.zone_km2;
  const res = Math.round(buildings_residential);
  const pub = Math.max(0, Math.round((buildings - buildings_residential) * 0.6));
  const cost_min = Math.round(BASE_SCENARIO.results.cost_min * factor);
  const cost_max = Math.round(BASE_SCENARIO.results.cost_max * factor);
  return {
    residents: Math.round(890 * factor),
    residential: buildings_residential,
    public_bldg: pub,
    public_detail: 'szkoły: ' + Math.max(1, Math.round(pub * 0.4)) + ' · szpital: ' + (pub > 4 ? 1 : 0) + ' · urzędy: ' + Math.max(1, Math.round(pub * 0.5)),
    cultural: Math.round(factor),
    roads_km: Math.round(3.2 * factor * 10) / 10,
    railways_km: Math.round(0.8 * factor * 10) / 10,
    waterworks: Math.round(factor),
    critical: Math.max(1, Math.round(2 * factor)),
    ippc: Math.round(2 * factor),
    natura2000: Math.round(12 * factor),
    cost_direct: cost_min + '–' + cost_max + 'M PLN',
    cost_indirect: Math.round(cost_min * 0.35) + '–' + Math.round(cost_max * 0.45) + 'M PLN'
  };
}

function computeVariant(params) {
  return new Promise((resolve) => {
    const precipPct = params.precipitation_pct || 0;
    const leveeBreach = params.levee_breach_km || null;

    const zone = BASE_SCENARIO.results.zone_km2 * (1 + precipPct / 100 * 0.9 + (leveeBreach ? 0.45 : 0));
    const buildingFactor = zone / BASE_SCENARIO.results.zone_km2;
    const buildings = Math.round(BASE_SCENARIO.results.buildings * buildingFactor);
    const buildingsRes = Math.round(BASE_SCENARIO.results.buildings_residential * buildingFactor);
    const buildingsCom = Math.round(BASE_SCENARIO.results.buildings_commercial * buildingFactor);
    const buildingsCrit = Math.min(Math.round(BASE_SCENARIO.results.buildings_critical * buildingFactor), BASE_SCENARIO.results.buildings_critical + (leveeBreach ? 1 : 0));
    const roads = Math.min(Math.round(BASE_SCENARIO.results.roads * buildingFactor), BASE_SCENARIO.results.roads + (leveeBreach ? 4 : 2));
    const infra = Math.min(Math.round(BASE_SCENARIO.results.critical_infra * buildingFactor), BASE_SCENARIO.results.critical_infra + (leveeBreach ? 1 : 0));
    const costMin = Math.round(BASE_SCENARIO.results.cost_min * buildingFactor);
    const costMax = Math.round(BASE_SCENARIO.results.cost_max * buildingFactor);

    let warning = null;
    if (leveeBreach) {
      warning = 'Zalanie ul. Fabrycznej — jedyna droga do szpitala';
    } else if (precipPct >= 50) {
      warning = 'Przekroczenie parametrów wytrzymałości wału';
    }

    const letter = VARIANT_LETTERS[variantCounter] || ('V' + variantCounter);
    variantCounter++;

    let paramDesc = '';
    if (precipPct !== 0) paramDesc += (precipPct > 0 ? '+' : '') + precipPct + '% opady';
    if (leveeBreach) {
      if (paramDesc) paramDesc += ', ';
      paramDesc += 'pęknięcie km ' + leveeBreach;
    }
    if (!paramDesc) paramDesc = 'bez zmian';

    const variant = {
      id: 'variant_' + letter.toLowerCase(),
      type: 'variant',
      letter: letter,
      label: paramDesc,
      params: { ...params },
      results: {
        zone_km2: Math.round(zone * 100) / 100,
        buildings: buildings,
        buildings_residential: buildingsRes,
        buildings_commercial: buildingsCom,
        buildings_critical: buildingsCrit,
        roads: roads,
        critical_infra: infra,
        cost_min: costMin,
        cost_max: costMax,
        peak_h: BASE_SCENARIO.results.peak_h,
        warning: warning
      },
      show_to_decision_maker: false,
      computed_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      gis_objects: pendingGisGeometry ? [{ ...pendingGisGeometry }] : [],
      color: SCENARIO_COLORS.variants[(variantCounter - 1) % SCENARIO_COLORS.variants.length],
      show_on_map: false,
      impact: computeImpactData(Math.round(zone * 100) / 100, buildings, buildingsRes)
    };

    // Store GIS objects
    if (pendingGisGeometry) {
      GIS_OBJECTS.push({ ...pendingGisGeometry, variant_id: variant.id });
      pendingGisGeometry = null;
    }

    resolve(variant);
  });
}


// ══════════════════════════════════════════
// SCENARIO LIST RENDERING (TAB 1)
// ══════════════════════════════════════════

function renderScenarioList() {
  const container = document.getElementById('content-scenarios');
  let html = '';

  // Base scenario card
  html += renderScenarioCard(BASE_SCENARIO);

  // Variant cards
  VARIANTS.forEach(v => {
    html += renderScenarioCard(v);
  });

  // New variant button + form
  html += '<button class="new-variant-btn" id="btn-new-variant" onclick="openNewVariantForm()">+ Nowy wariant</button>';
  html += renderNewVariantForm();

  container.innerHTML = html;

  // Re-attach event listeners for checkboxes
  container.querySelectorAll('.decision-checkbox').forEach(cb => {
    cb.addEventListener('change', function() {
      toggleShowToDecision(this.dataset.scenarioId, this.checked);
    });
  });
}

function renderScenarioCard(scenario) {
  const isBase = scenario.type === 'base';
  const cardClass = isBase ? 'card-base' : 'card-variant';
  const badge = isBase
    ? '<span class="scenario-badge-base">● BAZOWY</span>'
    : '<span class="scenario-badge-variant">◆ WARIANT ' + scenario.letter + '</span>';
  const title = isBase ? scenario.label : scenario.label;
  const sub = isBase ? 'Auto-wyliczony · aktualizowany co godzinę' : scenario.computed_at;
  const color = scenario.color || '#4F98A3';

  const r = scenario.results;
  const br = BASE_SCENARIO.results;

  // Map toggle in header
  const mapToggleHtml = '<label class="map-overlay-toggle-label">'
    + '<input type="checkbox" class="map-overlay-toggle" data-scenario-id="' + scenario.id + '"'
    + (scenario.show_on_map ? ' checked' : '')
    + ' onchange="toggleScenarioOnMap(\'' + scenario.id + '\', this.checked)">'
    + '<span class="map-toggle-indicator" style="background:' + color + '"></span>'
    + '<span>Mapa</span>'
    + '</label>';

  // Metrics with deltas
  let metricsHtml = '<div class="scenario-metrics">';
  metricsHtml += metricCell('Strefa', r.zone_km2 + ' km²', isBase ? null : delta(r.zone_km2, br.zone_km2, '%'));
  metricsHtml += metricCell('Budynki', r.buildings, isBase ? null : deltaAbs(r.buildings, br.buildings));
  metricsHtml += metricCell('Drogi', r.roads, isBase ? null : deltaAbs(r.roads, br.roads));
  metricsHtml += metricCell('Infra', r.critical_infra, isBase ? null : deltaAbs(r.critical_infra, br.critical_infra));
  metricsHtml += metricCell('Koszt (rozp.)', r.cost_min + '–' + r.cost_max + 'M PLN', isBase ? null : deltaCost(r.cost_min, br.cost_min));
  metricsHtml += '</div>';

  // Params row for variants
  let paramsHtml = '';
  if (!isBase && scenario.params) {
    const parts = [];
    if (scenario.params.precipitation_pct != null && scenario.params.precipitation_pct !== 0) {
      parts.push('precipitation_pct: ' + (scenario.params.precipitation_pct > 0 ? '+' : '') + scenario.params.precipitation_pct + '%');
    }
    if (scenario.params.levee_breach_km) {
      parts.push('levee_breach_km: ' + scenario.params.levee_breach_km);
    }
    if (parts.length) {
      paramsHtml = '<div class="scenario-params-row">' + parts.join(' · ') + '</div>';
    }
  }

  // Warning
  let warningHtml = '';
  if (r.warning) {
    warningHtml = '<div class="scenario-warning">⚠ ' + r.warning + '</div>';
  }

  // Impact expand button + hidden panel
  const expandBtnHtml = '<button class="impact-expand-btn" onclick="toggleImpactExpand(\'' + scenario.id + '\')" id="expand-btn-' + scenario.id + '">'
    + '▼ Analizuj wpływ (12 kategorii)'
    + '</button>';

  const impactPanelHtml = '<div class="impact-breakdown" id="impact-' + scenario.id + '" style="display:none">'
    + renderImpactBreakdown(scenario)
    + '</div>';

  // Recommendations toggle
  const recsId = 'recs-' + scenario.id;

  // Actions (without "Pokaż na mapie" — now in header toggle)
  let actionsHtml = '<div class="scenario-actions">';
  actionsHtml += '<button class="scenario-action-btn" onclick="toggleRecs(\'' + recsId + '\')">▾ Rekomendacje</button>';
  actionsHtml += '<label class="scenario-checkbox-label"><input type="checkbox" class="decision-checkbox" data-scenario-id="' + scenario.id + '"' + (scenario.show_to_decision_maker ? ' checked' : '') + '> Pokaż decydentowi</label>';
  if (!isBase) {
    actionsHtml += '<button class="scenario-action-btn btn-danger" onclick="deleteVariant(\'' + scenario.id + '\')">&nbsp;Usuń</button>';
  }
  actionsHtml += '</div>';

  // Recommendations panel
  const recs = generateRecommendations(scenario);
  let recsHtml = '<div class="recs-panel" id="' + recsId + '">';
  recsHtml += '<div class="recs-title">Rekomendacje dla tego scenariusza</div>';
  recs.forEach(rec => {
    recsHtml += '<div class="rec-item">';
    recsHtml += '<span class="rec-icon">' + rec.icon + '</span>';
    recsHtml += '<div class="rec-content">';
    recsHtml += '<div class="rec-title-text">' + rec.title + '</div>';
    recsHtml += '<div class="rec-desc">' + rec.desc.replace(/\n/g, '<br>') + '</div>';
    if (rec.gis_action) {
      recsHtml += '<button class="rec-gis-btn" onclick="activateGisTool(\'line\')">✏ Zaznacz na mapie</button>';
    }
    recsHtml += '</div></div>';
  });
  recsHtml += '<div class="rec-cost">💰 Szacowane straty (rozp.): <span>' + r.cost_min + '–' + r.cost_max + 'M PLN</span></div>';
  recsHtml += '</div>';

  return '<div class="scenario-card ' + cardClass + '" style="border-left: 3px solid ' + color + '">'
    + '<div class="scenario-card-header">' + badge + '<span class="scenario-card-title">' + title + '</span><span class="scenario-card-sub">' + sub + '</span>' + mapToggleHtml + '</div>'
    + paramsHtml
    + metricsHtml
    + warningHtml
    + expandBtnHtml
    + impactPanelHtml
    + actionsHtml
    + recsHtml
    + '</div>';
}

function toggleImpactExpand(scenarioId) {
  const el = document.getElementById('impact-' + scenarioId);
  const btn = document.getElementById('expand-btn-' + scenarioId);
  if (!el) return;
  const isOpen = el.style.display !== 'none';
  el.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? '▼ Analizuj wpływ (12 kategorii)' : '▲ Zwiń analizę wpływu';
}

function renderImpactBreakdown(scenario) {
  if (!scenario.impact) return '<div class="impact-empty">Brak danych kategorii</div>';
  const impact = scenario.impact;
  const baseImpact = BASE_SCENARIO.impact;
  const isBase = scenario.type === 'base';
  const color = scenario.color || '#4F98A3';

  // Find max values for bar scaling
  const maxVals = {};
  IMPACT_CATEGORIES.forEach(grp => {
    grp.items.forEach(item => {
      if (item.is_text) return;
      const allVals = getAllScenarios()
        .filter(s => s.impact)
        .map(s => parseFloat(s.impact[item.id]) || 0);
      maxVals[item.id] = Math.max(...allVals, 1);
    });
  });

  let html = '<div class="impact-breakdown-inner">';

  IMPACT_CATEGORIES.forEach(grp => {
    html += '<div class="impact-group-title">' + grp.group + '</div>';
    grp.items.forEach(item => {
      const val = impact[item.id];
      if (val === undefined || val === null) return;

      if (item.is_text) {
        html += '<div class="impact-row impact-row-text">'
          + '<span class="impact-icon">' + item.icon + '</span>'
          + '<span class="impact-label">' + item.label + '</span>'
          + '<span class="impact-value-text">' + val + '</span>'
          + '</div>';
      } else {
        const numVal = parseFloat(val) || 0;
        const baseVal = isBase ? numVal : (parseFloat(baseImpact[item.id]) || 0);
        const maxVal = maxVals[item.id] || 1;
        const barPct = Math.min(100, (numVal / maxVal) * 100);
        let deltaStr = '';
        if (!isBase) {
          const diff = numVal - baseVal;
          if (diff === 0) {
            deltaStr = '<span class="impact-delta-neutral">=</span>';
          } else {
            const sign = diff > 0 ? '+' : '';
            const cls = (diff > 0 && item.higher_is_worse) ? 'impact-delta-worse' : 'impact-delta-better';
            deltaStr = '<span class="' + cls + '">' + sign + (diff % 1 === 0 ? diff : diff.toFixed(1)) + '</span>';
          }
        }

        let detailHtml = '';
        if (item.detail_key && impact[item.detail_key]) {
          detailHtml = '<div class="impact-detail">' + impact[item.detail_key] + '</div>';
        }

        html += '<div class="impact-row">'
          + '<span class="impact-icon">' + item.icon + '</span>'
          + '<span class="impact-label">' + item.label + '</span>'
          + '<div class="impact-bar-wrap"><div class="impact-bar" style="width:' + barPct + '%;background:' + color + '"></div></div>'
          + '<span class="impact-value">' + numVal + (item.unit ? ' ' + item.unit : '') + ' ' + deltaStr + '</span>'
          + '</div>' + detailHtml;
      }
    });
  });

  html += '</div>';
  return html;
}

function metricCell(label, value, deltaHtml) {
  return '<div class="scenario-metric">' + label + ': <strong>' + value + '</strong>'
    + (deltaHtml ? ' ' + deltaHtml : '')
    + '</div>';
}

function delta(val, base, suffix) {
  if (val === base) return '<span class="delta-neutral">=</span>';
  const pct = Math.round((val - base) / base * 100);
  const sign = pct > 0 ? '+' : '';
  const cls = pct > 0 ? 'delta-worse' : 'delta-better';
  return '<span class="' + cls + '">(' + sign + pct + (suffix || '') + ')</span>';
}

function deltaAbs(val, base) {
  if (val === base) return '<span class="delta-neutral">=</span>';
  const diff = val - base;
  const sign = diff > 0 ? '+' : '';
  const cls = diff > 0 ? 'delta-worse' : 'delta-better';
  return '<span class="' + cls + '">(' + sign + diff + ')</span>';
}

function deltaCost(val, base) {
  if (val === base) return '<span class="delta-neutral">=</span>';
  const diff = val - base;
  const sign = diff > 0 ? '+' : '';
  const cls = diff > 0 ? 'delta-worse' : 'delta-better';
  return '<span class="' + cls + '">(' + sign + diff + 'M)</span>';
}


// ══════════════════════════════════════════
// NEW VARIANT FORM
// ══════════════════════════════════════════

function renderNewVariantForm() {
  let html = '<div class="new-variant-form" id="new-variant-form">';
  html += '<div class="nv-title">Nowy wariant</div>';

  // Dynamic params from PIPELINE_PARAMS
  html += '<div class="nv-params-header">Parametry zdefiniowane w pipeline przez operatora</div>';

  PIPELINE_PARAMS.forEach(p => {
    html += '<div class="nv-param-row">';
    const optLabel = p.optional ? ' <span class="nv-optional">(opcjonalne)</span>' : '';
    html += '<div class="nv-param-label">' + p.label + ' (' + p.name + '):' + optLabel + '</div>';

    if (p.type === 'range') {
      const defaultVal = p.default !== null ? p.default : 0;
      const displayVal = (defaultVal > 0 ? '+' : '') + defaultVal + (p.unit || '');
      html += '<div class="nv-range-row">';
      html += '<span>' + p.min + (p.unit || '') + '</span>';
      html += '<input type="range" id="nv-param-' + p.name + '" min="' + p.min + '" max="' + p.max + '" value="' + defaultVal + '" oninput="updateParamLabel(\'' + p.name + '\')">'; 
      html += '<span>+' + p.max + (p.unit || '') + '</span>';
      html += '<span class="nv-range-value" id="nv-param-val-' + p.name + '">' + displayVal + '</span>';
      html += '</div>';
    } else if (p.type === 'number') {
      const placeholder = p.unit ? p.unit + (p.optional ? ' (opcjonalne)' : '') : (p.optional ? 'opcjonalne' : '');
      html += '<input type="number" class="nv-number-input" id="nv-param-' + p.name + '" placeholder="' + placeholder + '" step="0.1">';
    }

    html += '</div>';
  });

  // GIS geometry section
  html += '<div class="nv-gis-section">';
  html += '<div class="nv-gis-label">Geometria GIS:</div>';
  html += '<div id="nv-gis-list"></div>';
  html += '<button class="nv-draw-btn" onclick="startGisDraw()">✏ Narysuj linię na mapie</button>';
  html += '</div>';

  // Actions
  html += '<div class="nv-form-actions">';
  html += '<button class="nv-cancel-btn" onclick="closeNewVariantForm()">Anuluj</button>';
  html += '<button class="nv-compute-btn" id="nv-compute-btn" onclick="runCompute()">Oblicz wariant →</button>';
  html += '</div>';

  // Inline progress
  html += '<div class="nv-progress" id="nv-progress">';
  html += '<div class="nv-progress-spinner"></div>';
  html += '<div class="nv-progress-step" id="nv-step-1">Pobieranie danych...</div>';
  html += '<div class="nv-progress-step" id="nv-step-2">Obliczanie zasięgu...</div>';
  html += '<div class="nv-progress-step" id="nv-step-3">Analiza konsekwencji...</div>';
  html += '</div>';

  html += '</div>';
  return html;
}

function openNewVariantForm() {
  document.getElementById('new-variant-form').classList.add('open');
  document.getElementById('btn-new-variant').style.display = 'none';
  updateNvGisList();
}

function closeNewVariantForm() {
  document.getElementById('new-variant-form').classList.remove('open');
  document.getElementById('btn-new-variant').style.display = '';
  document.getElementById('nv-progress').classList.remove('visible');
  pendingGisGeometry = null;
  updateNvGisList();
}

function updateNvPrecipLabel() {
  updateParamLabel('precipitation_pct');
}

function updateParamLabel(name) {
  const el = document.getElementById('nv-param-' + name);
  const valEl = document.getElementById('nv-param-val-' + name);
  if (!el || !valEl) return;
  const p = PIPELINE_PARAMS.find(x => x.name === name);
  valEl.textContent = (el.value > 0 ? '+' : '') + el.value + (p?.unit || '');
}

function updateNvGisList() {
  const container = document.getElementById('nv-gis-list');
  if (!container) return;
  if (!pendingGisGeometry) {
    container.innerHTML = '';
    return;
  }
  const len = calcGisLength(pendingGisGeometry.points);
  container.innerHTML = '<div class="nv-gis-item">'
    + '<span class="nv-gis-icon">📏</span>'
    + '<span>linia_workow  ' + len.toFixed(1) + ' km</span>'
    + '<button class="nv-gis-remove" onclick="removePendingGis()">× usuń</button>'
    + '</div>';
}

function removePendingGis() {
  pendingGisGeometry = null;
  updateNvGisList();
  drawMap();
}

function calcGisLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = (points[i][0] - points[i - 1][0]) * 10;
    const dy = (points[i][1] - points[i - 1][1]) * 10;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

function startGisDraw() {
  activateGisTool('line');
  pendingGisGeometry = { type: 'line', points: [] };
}

async function runCompute() {
  const params = {};
  PIPELINE_PARAMS.forEach(p => {
    const el = document.getElementById('nv-param-' + p.name);
    if (!el) return;
    if (p.type === 'range') params[p.name] = parseInt(el.value);
    else if (p.type === 'number') params[p.name] = el.value ? parseFloat(el.value) : null;
  });

  // Show progress
  const progressEl = document.getElementById('nv-progress');
  const computeBtn = document.getElementById('nv-compute-btn');
  progressEl.classList.add('visible');
  computeBtn.disabled = true;

  const steps = ['nv-step-1', 'nv-step-2', 'nv-step-3'];

  for (let i = 0; i < steps.length; i++) {
    document.getElementById(steps[i]).classList.add('active');
    await sleep(800);
    document.getElementById(steps[i]).classList.remove('active');
    document.getElementById(steps[i]).classList.add('done');
  }

  const variant = await computeVariant(params);
  VARIANTS.push(variant);

  // Reset form
  computeBtn.disabled = false;
  closeNewVariantForm();

  // Re-render
  renderScenarioList();
  renderComparisonTable();
  renderDecisionTab();
  showScenarioOnMap(variant.id);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// ══════════════════════════════════════════
// COMPARISON TABLE (TAB 2)
// ══════════════════════════════════════════

function renderComparisonTable() {
  const container = document.getElementById('content-comparison');
  const allScenarios = [BASE_SCENARIO, ...VARIANTS];

  if (allScenarios.length < 1) {
    container.innerHTML = '<div class="decision-empty">Brak scenariuszy do porównania</div>';
    return;
  }

  let html = '<div class="comparison-wrap"><table class="comparison-table">';

  // Header row
  html += '<thead><tr><th>Atrybut</th>';
  allScenarios.forEach(s => {
    const isBase = s.type === 'base';
    const badgeCls = isBase ? 'badge-base' : 'badge-variant';
    const name = isBase ? 'Bazowy' : 'Wariant ' + s.letter;
    html += '<th class="ct-header-cell"><span class="ct-header-badge ' + badgeCls + '" style="border-left:2px solid ' + (s.color || '#4F98A3') + ';padding-left:4px">' + name + '</span>';
    html += '<br><label class="ct-map-toggle-label">'
      + '<input type="checkbox" class="map-overlay-toggle" data-scenario-id="' + s.id + '"'
      + (activeMapScenarios.has(s.id) ? ' checked' : '')
      + ' onchange="toggleScenarioOnMap(\'' + s.id + '\', this.checked)">'
      + '<span class="ct-toggle-dot" style="background:' + (s.color || '#4F98A3') + '"></span>'
      + ' Mapa</label>';
    html += '<br><label class="scenario-checkbox-label" style="justify-content:flex-end;margin-top:4px"><input type="checkbox" class="decision-checkbox" data-scenario-id="' + s.id + '"' + (s.show_to_decision_maker ? ' checked' : '') + '> Decydent</label>';
    html += '</th>';
  });
  html += '</tr></thead><tbody>';

  // Data rows
  const br = BASE_SCENARIO.results;

  html += compRow('Strefa zalewowa', allScenarios.map(s => ({
    val: s.results.zone_km2 + ' km²',
    raw: s.results.zone_km2,
    base: br.zone_km2,
    isBase: s.type === 'base',
    higher_is_worse: true
  })));

  html += compRow('Budynki zagrożone', allScenarios.map(s => ({
    val: '' + s.results.buildings,
    raw: s.results.buildings,
    base: br.buildings,
    isBase: s.type === 'base',
    higher_is_worse: true
  })));

  html += compRowSub('─ mieszkalne', allScenarios.map(s => ({
    val: '' + s.results.buildings_residential,
    raw: s.results.buildings_residential,
    base: br.buildings_residential,
    isBase: s.type === 'base',
    higher_is_worse: true
  })));

  html += compRowSub('─ krytyczne', allScenarios.map(s => ({
    val: '' + s.results.buildings_critical,
    raw: s.results.buildings_critical,
    base: br.buildings_critical,
    isBase: s.type === 'base',
    higher_is_worse: true
  })));

  html += compRow('Drogi zamknięte', allScenarios.map(s => ({
    val: '' + s.results.roads,
    raw: s.results.roads,
    base: br.roads,
    isBase: s.type === 'base',
    higher_is_worse: true
  })));

  html += compRow('Infra krytyczna', allScenarios.map(s => ({
    val: '' + s.results.critical_infra,
    raw: s.results.critical_infra,
    base: br.critical_infra,
    isBase: s.type === 'base',
    higher_is_worse: true
  })));

  html += compRow('Koszt (rozp.)', allScenarios.map(s => ({
    val: s.results.cost_min + '–' + s.results.cost_max + 'M',
    raw: s.results.cost_min,
    base: br.cost_min,
    isBase: s.type === 'base',
    higher_is_worse: true
  })));

  // Section: parameters
  html += '<tr class="ct-section"><td colspan="' + (allScenarios.length + 1) + '">Parametry what-if:</td></tr>';

  PIPELINE_PARAMS.forEach(p => {
    html += compRowSub('─ ' + p.name, allScenarios.map(s => {
      let val;
      if (s.type === 'base') {
        val = p.type === 'range' ? '0' + (p.unit || '') : '—';
      } else {
        const pVal = s.params[p.name];
        if (p.type === 'range') {
          val = (pVal > 0 ? '+' : '') + (pVal || 0) + (p.unit || '');
        } else {
          val = pVal ? pVal + (p.unit ? ' ' + p.unit : '') : '—';
        }
      }
      return { val: val, raw: 0, base: 0, isBase: true, higher_is_worse: false };
    }));
  });

  html += compRowSub('─ linia_workow', allScenarios.map(s => {
    const gisLen = (s.gis_objects && s.gis_objects.length > 0)
      ? s.gis_objects.reduce((sum, g) => sum + calcGisLength(g.points || []), 0).toFixed(1) + ' km'
      : '—';
    return {
      val: s.type === 'base' ? '—' : gisLen,
      raw: 0, base: 0, isBase: true, higher_is_worse: false
    };
  }));

  // Section: Impact categories
  html += '<tr class="ct-section"><td colspan="' + (allScenarios.length + 1) + '">Kategorie wpływu (Prawo Wodne art. 169):</td></tr>';

  IMPACT_CATEGORIES.forEach(grp => {
    html += '<tr class="ct-section-sub"><td colspan="' + (allScenarios.length + 1) + '" style="padding-left:12px;font-size:10px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.05em">' + grp.group + '</td></tr>';
    grp.items.forEach(item => {
      html += compRowSub('─ ' + item.label, allScenarios.map(s => {
        if (!s.impact) return { val: '—', raw: 0, base: 0, isBase: true, higher_is_worse: false };
        const val = s.impact[item.id];
        if (item.is_text) {
          return { val: val || '—', raw: 0, base: 0, isBase: true, higher_is_worse: false };
        }
        const numVal = parseFloat(val) || 0;
        const baseVal = parseFloat(BASE_SCENARIO.impact[item.id]) || 0;
        return {
          val: numVal + (item.unit ? ' ' + item.unit : ''),
          raw: numVal,
          base: baseVal,
          isBase: s.type === 'base',
          higher_is_worse: item.higher_is_worse
        };
      }));
    });
  });

  html += '</tbody></table></div>';
  html += '<div class="comparison-footer">Koszt wg Rozporządzenia Ministra Środowiska z dnia 1 września 2016 r.</div>';

  container.innerHTML = html;

  // Re-attach checkboxes
  container.querySelectorAll('.decision-checkbox').forEach(cb => {
    cb.addEventListener('change', function() {
      toggleShowToDecision(this.dataset.scenarioId, this.checked);
    });
  });
}

function compRow(label, cells) {
  let html = '<tr><td>' + label + '</td>';
  cells.forEach(c => {
    let cls = c.isBase ? 'ct-base-val' : '';
    let deltaStr = '';
    if (!c.isBase && c.raw !== c.base) {
      const diff = c.raw - c.base;
      if (c.higher_is_worse) {
        cls += diff > 0 ? ' ct-worse' : ' ct-better';
        deltaStr = ' <span style="font-size:9px">' + (diff > 0 ? '↑' : '↓') + '</span>';
      }
    } else if (!c.isBase && c.raw === c.base) {
      deltaStr = ' <span class="ct-neutral" style="font-size:9px">=</span>';
    }
    html += '<td class="' + cls.trim() + '">' + c.val + deltaStr + '</td>';
  });
  html += '</tr>';
  return html;
}

function compRowSub(label, cells) {
  let html = '<tr class="ct-sub"><td>' + label + '</td>';
  cells.forEach(c => {
    let cls = c.isBase ? 'ct-base-val' : '';
    let deltaStr = '';
    if (!c.isBase && c.raw !== c.base && c.higher_is_worse) {
      const diff = c.raw - c.base;
      cls += diff > 0 ? ' ct-worse' : ' ct-better';
      const diffRounded = Math.round(diff * 10) / 10;
      deltaStr = ' <span style="font-size:9px">' + (diffRounded > 0 ? '+' + diffRounded + ' ↑' : diffRounded + ' ↓') + '</span>';
    }
    html += '<td class="' + cls.trim() + '">' + c.val + deltaStr + '</td>';
  });
  html += '</tr>';
  return html;
}


// ══════════════════════════════════════════
// DECISION TAB (TAB 3)
// ══════════════════════════════════════════

function renderDecisionTab() {
  const container = document.getElementById('content-decision');
  const selected = getAllScenarios().filter(s => s.show_to_decision_maker);

  updateDecisionBadge(selected.length);

  if (selected.length === 0) {
    container.innerHTML = '<div class="decision-empty">'
      + '<div class="decision-empty-icon">📋</div>'
      + 'Zaznacz scenariusze do pokazania decydentowi<br>w zakładce Scenariusze'
      + '</div>';
    return;
  }

  let html = '';
  selected.forEach(s => {
    const isBase = s.type === 'base';
    const badge = isBase
      ? '<span class="scenario-badge-base">● BAZOWY</span>'
      : '<span class="scenario-badge-variant">◆ WARIANT ' + s.letter + '</span>';
    const title = isBase ? s.label : s.label;

    html += '<div class="decision-card">';
    html += '<div class="decision-card-header">' + badge + '<span class="scenario-card-title">' + title + '</span></div>';

    // Compact metrics
    const r = s.results;
    html += '<div class="decision-card-metrics">';
    html += '<div>Strefa: <strong>' + r.zone_km2 + ' km²</strong></div>';
    html += '<div>Budynki: <strong>' + r.buildings + '</strong></div>';
    html += '<div>Drogi: <strong>' + r.roads + '</strong></div>';
    html += '<div>Koszt: <strong>' + r.cost_min + '–' + r.cost_max + 'M PLN</strong></div>';
    html += '</div>';

    // Compact recs
    const recs = generateRecommendations(s);
    html += '<div class="decision-card-recs">';
    recs.forEach(rec => {
      html += '<div class="decision-rec-item"><span>' + rec.icon + '</span> <span>' + rec.title + '</span></div>';
    });
    html += '</div>';

    html += '</div>';
  });

  // Active map overlays summary
  const activeOnMap = getAllScenarios().filter(s => activeMapScenarios.has(s.id));
  if (activeOnMap.length > 0) {
    html += '<div class="decision-map-summary">';
    html += '<div class="decision-map-summary-title">🗺 Aktywne nakładki mapowe:</div>';
    html += '<div class="decision-map-summary-chips">';
    activeOnMap.forEach(sc => {
      const name = sc.type === 'base' ? 'Bazowy' : 'Wariant ' + sc.letter;
      html += '<span class="decision-map-chip" style="border-color:' + sc.color + ';color:' + sc.color + '">' + name + '</span>';
    });
    html += '</div>';
    html += '<div class="decision-map-note">Scenariusze aktywne na mapie zostaną uwzględnione w raporcie PDF</div>';
    html += '</div>';
  }

  html += '<button class="decision-submit-btn" onclick="goToDecision()">Przekaż decydentowi →</button>';

  container.innerHTML = html;
}

function updateDecisionBadge(count) {
  document.getElementById('decision-badge').textContent = count;
}

function getAllScenarios() {
  return [BASE_SCENARIO, ...VARIANTS];
}


// ══════════════════════════════════════════
// ACTIONS & STATE
// ══════════════════════════════════════════

function toggleShowToDecision(scenarioId, checked) {
  const scenario = getScenarioById(scenarioId);
  if (scenario) {
    scenario.show_to_decision_maker = checked;
  }

  // Sync all checkboxes with same scenario id
  document.querySelectorAll('.decision-checkbox[data-scenario-id="' + scenarioId + '"]').forEach(cb => {
    cb.checked = checked;
  });

  renderDecisionTab();
}

function toggleScenarioOnMap(scenarioId, show) {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return;
  scenario.show_on_map = show;
  if (show) {
    activeMapScenarios.add(scenarioId);
  } else {
    activeMapScenarios.delete(scenarioId);
  }
  drawMap();
  drawCharts();
  // Sync all checkboxes with same scenario id
  document.querySelectorAll('.map-overlay-toggle[data-scenario-id="' + scenarioId + '"]').forEach(cb => {
    cb.checked = show;
  });
  // Update map view badge
  updateMapViewBadge();
}

function showScenarioOnMap(scenarioId) {
  // Keep for backward compat (comparison table links)
  toggleScenarioOnMap(scenarioId, true);
}

function updateMapViewBadge() {
  const badge = document.getElementById('map-view-badge');
  if (!badge) return;
  const activeNames = getAllScenarios()
    .filter(s => activeMapScenarios.has(s.id))
    .map(s => s.type === 'base' ? 'bazowy' : 'W' + s.letter);
  badge.textContent = 'Widok: ' + (activeNames.length > 0 ? activeNames.join(' + ') : '—');
}

function updateMapLegend() {
  const legendEl = document.getElementById('map-legend');
  if (!legendEl) return;

  const activeScenarios = getAllScenarios().filter(s => activeMapScenarios.has(s.id));

  let html = '';
  // Scenario overlays
  activeScenarios.forEach(sc => {
    const name = sc.type === 'base' ? 'Bazowy' : 'Wariant ' + sc.letter;
    html += `<span class="legend-item"><span class="legend-dot" style="background:${sc.color};opacity:0.8;border-radius:2px;width:12px;height:8px;display:inline-block"></span> ${name}</span>`;
  });
  // Static items (always shown)
  html += '<span class="legend-item"><span class="legend-sq residential"></span> Mieszkalne</span>';
  html += '<span class="legend-item"><span class="legend-sq commercial"></span> Usługowe</span>';
  html += '<span class="legend-item"><span class="legend-sq critical"></span> Krytyczne</span>';

  legendEl.innerHTML = html;
}

// ══════════════════════════════════════════
// CHARTS
// ══════════════════════════════════════════

function drawCharts() {
  drawWaveChart();
  drawHydroChart();
}

// Helper: resize canvas for devicePixelRatio
function resizeChartCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, W: rect.width, H: rect.height };
}

// ── WAVE PROPAGATION CHART ──
function drawWaveChart() {
  const canvas = document.getElementById('chart-wave-canvas');
  if (!canvas) return;
  const { ctx, W, H } = resizeChartCanvas(canvas);

  const PAD_LEFT = 130, PAD_RIGHT = 16, PAD_TOP = 14, PAD_BOTTOM = 28;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;
  const ROW_H = chartH / WAVE_PROPAGATION.length;
  const T_MAX = 72;

  function tX(t) { return PAD_LEFT + (t / T_MAX) * chartW; }
  function rowY(i) { return PAD_TOP + i * ROW_H; }

  // Background
  ctx.fillStyle = '#0c0d10';
  ctx.fillRect(0, 0, W, H);

  // Grid lines (vertical, every 12h)
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let t = 0; t <= T_MAX; t += 12) {
    const x = tX(t);
    ctx.beginPath();
    ctx.moveTo(x, PAD_TOP);
    ctx.lineTo(x, PAD_TOP + chartH);
    ctx.stroke();
  }

  // Time axis labels
  ctx.fillStyle = '#4A4D5E';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  for (let t = 0; t <= T_MAX; t += 12) {
    ctx.fillText('T+' + t + 'h', tX(t), H - 8);
  }

  // Get active variant scenarios
  const activeVariants = getAllScenarios().filter(s => s.type === 'variant' && activeMapScenarios.has(s.id));

  // Draw rows
  WAVE_PROPAGATION.forEach((gauge, i) => {
    const yCenter = rowY(i) + ROW_H * 0.5;
    const barH = ROW_H * 0.38;

    // Row label
    ctx.fillStyle = '#8A8D9A';
    ctx.font = '500 11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(gauge.label, PAD_LEFT - 8, yCenter + 4);

    // Severity badge
    const severityColors = { L1: '#EAB945', L2: '#E08644', L3: '#D95050', L4: '#C74FBB' };
    const sColor = severityColors[gauge.severity] || '#4F98A3';
    ctx.fillStyle = sColor;
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(gauge.severity + ' · ' + gauge.level_cm + 'cm', PAD_LEFT - 8, yCenter + 15);

    // BASE scenario bar
    const bx1 = tX(gauge.base.start);
    const bx2 = tX(gauge.base.end);
    const bxPeak = tX(gauge.base.peak);
    const baseColor = '#4F98A3';

    // Bar background (subtle)
    ctx.fillStyle = 'rgba(79,152,163,0.12)';
    ctx.fillRect(bx1, yCenter - barH / 2, bx2 - bx1, barH);

    // Bar fill
    const grad = ctx.createLinearGradient(bx1, 0, bx2, 0);
    grad.addColorStop(0, 'rgba(79,152,163,0.3)');
    grad.addColorStop((bxPeak - bx1) / (bx2 - bx1), 'rgba(79,152,163,0.85)');
    grad.addColorStop(1, 'rgba(79,152,163,0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(bx1, yCenter - barH / 2, bx2 - bx1, barH);

    // Peak marker line
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bxPeak, yCenter - barH / 2 - 3);
    ctx.lineTo(bxPeak, yCenter + barH / 2 + 3);
    ctx.stroke();

    // Peak label on base bar
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(gauge.level_cm + 'cm', bxPeak, yCenter + 4);

    // VARIANT bars (one per active variant)
    activeVariants.forEach(variant => {
      const letter = variant.letter;
      if (!gauge.variants[letter]) return;
      const vData = gauge.variants[letter];
      const vColor = variant.color || '#EAB945';

      const vx1 = tX(vData.start);
      const vx2 = tX(vData.end);
      const vxPeak = tX(vData.peak);
      const varBarH = barH * 0.55;
      const varY = yCenter - barH / 2 - varBarH - 2;

      // Parse variant color to rgba
      const r = parseInt(vColor.slice(1,3), 16);
      const g = parseInt(vColor.slice(3,5), 16);
      const b = parseInt(vColor.slice(5,7), 16);

      ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
      ctx.fillRect(vx1, varY, vx2 - vx1, varBarH);

      // Dashed border
      ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(vx1, varY, vx2 - vx1, varBarH);
      ctx.setLineDash([]);

      // Variant peak marker
      ctx.strokeStyle = vColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(vxPeak, varY - 2);
      ctx.lineTo(vxPeak, varY + varBarH + 2);
      ctx.stroke();

      // "WX" label on variant bar
      ctx.fillStyle = vColor;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('W' + letter, vxPeak, varY + varBarH / 2 + 3);
    });
  });

  // Current time indicator (scrubber)
  const scrubX = tX(waveCurrentTime);
  ctx.strokeStyle = 'rgba(79,152,163,0.8)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 2]);
  ctx.beginPath();
  ctx.moveTo(scrubX, PAD_TOP - 4);
  ctx.lineTo(scrubX, PAD_TOP + chartH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Scrubber label
  ctx.fillStyle = '#4F98A3';
  ctx.font = 'bold 9px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('T+' + waveCurrentTime + 'h', scrubX, PAD_TOP - 5);
}

// ── HYDROGRAPH CHART ──
function drawHydroChart() {
  const canvas = document.getElementById('chart-hydro-canvas');
  if (!canvas) return;
  const { ctx, W, H } = resizeChartCanvas(canvas);

  const gauge = GAUGES[selectedGaugeId];
  if (!gauge) return;

  const PAD_LEFT = 44, PAD_RIGHT = 12, PAD_TOP = 16, PAD_BOTTOM = 26;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  // Time range: -12h to +72h (total 84h), step = 2h
  const T_START = -12, T_END = 72;
  const T_RANGE = T_END - T_START;
  // History: T-12h to T+0h (7 points, each 2h)
  // Prediction: T+0h to T+72h (37 points, each 2h)
  const HIST_STEPS = 7, PRED_STEPS = 37;

  function tX(t) { return PAD_LEFT + ((t - T_START) / T_RANGE) * chartW; }

  // Collect all values to find Y range
  const allVals = [
    ...gauge.history,
    ...gauge.base_pred,
    gauge.threshold_alarm + 20,
    gauge.threshold_warning - 10
  ];
  const yMin = Math.floor(Math.min(...allVals) / 10) * 10 - 10;
  const yMax = Math.ceil(Math.max(...allVals) / 10) * 10 + 10;

  function vY(v) { return PAD_TOP + chartH - ((v - yMin) / (yMax - yMin)) * chartH; }
  function predT(i) { return i * 2; } // hours from T+0
  function predX(i) { return tX(predT(i)); }
  function histT(i) { return -12 + i * 2; }
  function histX(i) { return tX(histT(i)); }

  // Background
  ctx.fillStyle = '#0c0d10';
  ctx.fillRect(0, 0, W, H);

  // Horizontal grid + Y labels
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#4A4D5E';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const v = yMin + (yMax - yMin) * (i / gridSteps);
    const y = vY(v);
    ctx.beginPath();
    ctx.moveTo(PAD_LEFT, y);
    ctx.lineTo(W - PAD_RIGHT, y);
    ctx.stroke();
    ctx.fillText(Math.round(v), PAD_LEFT - 4, y + 3);
  }

  // X axis labels (T-12 to T+72, every 12h)
  ctx.fillStyle = '#4A4D5E';
  ctx.textAlign = 'center';
  for (let t = T_START; t <= T_END; t += 12) {
    const label = t === 0 ? 'Teraz' : (t < 0 ? 'T' + t + 'h' : 'T+' + t + 'h');
    ctx.fillText(label, tX(t), H - 8);
    if (t !== 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tX(t), PAD_TOP);
      ctx.lineTo(tX(t), PAD_TOP + chartH);
      ctx.stroke();
    }
  }

  // "Teraz" vertical line
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(tX(0), PAD_TOP);
  ctx.lineTo(tX(0), PAD_TOP + chartH);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Teraz', tX(0), PAD_TOP - 4);

  // Threshold lines
  // Alarm
  const alarmY = vY(gauge.threshold_alarm);
  ctx.strokeStyle = 'rgba(217,80,80,0.5)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 3]);
  ctx.beginPath();
  ctx.moveTo(PAD_LEFT, alarmY);
  ctx.lineTo(W - PAD_RIGHT, alarmY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(217,80,80,0.7)';
  ctx.font = '9px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Stan alarmowy ' + gauge.threshold_alarm + 'cm', W - PAD_RIGHT - 2, alarmY - 3);

  // Warning
  const warnY = vY(gauge.threshold_warning);
  ctx.strokeStyle = 'rgba(234,185,69,0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 3]);
  ctx.beginPath();
  ctx.moveTo(PAD_LEFT, warnY);
  ctx.lineTo(W - PAD_RIGHT, warnY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(234,185,69,0.5)';
  ctx.font = '9px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Stan ostrzegawczy ' + gauge.threshold_warning + 'cm', W - PAD_RIGHT - 2, warnY - 3);

  // ── Previous prediction (very faint dashed line) ──
  if (gauge.prev_pred) {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    gauge.prev_pred.forEach((v, i) => {
      const x = predX(i), y = vY(v);
      i === 0 ? ctx.moveTo(tX(0), vY(gauge.history[gauge.history.length - 1])) : null;
      i === 0 ? ctx.lineTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── ACTIVE VARIANT PREDICTIONS ──
  const activeVariants = getAllScenarios().filter(s => s.type === 'variant' && activeMapScenarios.has(s.id));
  activeVariants.forEach(variant => {
    const letter = variant.letter;
    const varKey = 'var' + letter + '_pred';
    const confKey = 'var' + letter + '_conf';
    const varPred = gauge[varKey];
    const varConf = gauge[confKey];
    if (!varPred) return;

    const color = variant.color || '#EAB945';
    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(5,7), 16);

    // Confidence band
    if (varConf) {
      ctx.beginPath();
      varPred.forEach((v, i) => {
        const x = predX(i);
        i === 0 ? ctx.moveTo(x, vY(v + varConf[i])) : ctx.lineTo(x, vY(v + varConf[i]));
      });
      for (let i = varPred.length - 1; i >= 0; i--) {
        ctx.lineTo(predX(i), vY(varPred[i] - varConf[i]));
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b},0.08)`;
      ctx.fill();
    }

    // Dashed prediction line
    ctx.strokeStyle = `rgba(${r},${g},${b},0.75)`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(tX(0), vY(gauge.history[gauge.history.length - 1]));
    varPred.forEach((v, i) => ctx.lineTo(predX(i), vY(v)));
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // ── BASE PREDICTION (confidence band) ──
  if (gauge.base_conf) {
    ctx.beginPath();
    gauge.base_pred.forEach((v, i) => {
      const x = predX(i);
      i === 0 ? ctx.moveTo(x, vY(v + gauge.base_conf[i])) : ctx.lineTo(x, vY(v + gauge.base_conf[i]));
    });
    for (let i = gauge.base_pred.length - 1; i >= 0; i--) {
      ctx.lineTo(predX(i), vY(gauge.base_pred[i] - gauge.base_conf[i]));
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(79,152,163,0.12)';
    ctx.fill();
  }

  // Base prediction (dashed teal)
  ctx.strokeStyle = 'rgba(79,152,163,0.75)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(tX(0), vY(gauge.history[gauge.history.length - 1]));
  gauge.base_pred.forEach((v, i) => ctx.lineTo(predX(i), vY(v)));
  ctx.stroke();
  ctx.setLineDash([]);

  // ── MEASUREMENT (solid teal line) ──
  ctx.strokeStyle = '#4F98A3';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  gauge.history.forEach((v, i) => {
    const x = histX(i), y = vY(v);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  // Connect to prediction start
  ctx.lineTo(tX(0), vY(gauge.history[gauge.history.length - 1]));
  ctx.stroke();

  // Update hydro legend
  updateHydroLegend(activeVariants);
}

function updateHydroLegend(activeVariants) {
  const el = document.getElementById('hydro-legend');
  if (!el) return;

  let html = '';
  // Measurement
  html += `<div class="chart-legend-item">
    <span class="chart-legend-line" style="background:#4F98A3"></span> Pomiar
  </div>`;
  // Base prediction
  html += `<div class="chart-legend-item">
    <span class="chart-legend-dashed" style="color:#4F98A3; height:2px;"></span> Predykcja bazowy
  </div>`;
  // Variant predictions
  activeVariants.forEach(v => {
    html += `<div class="chart-legend-item">
      <span class="chart-legend-dashed" style="color:${v.color}; height:2px;"></span> Predykcja W${v.letter}
    </div>`;
  });
  // Previous prediction
  html += `<div class="chart-legend-item">
    <span class="chart-legend-dashed" style="color:rgba(255,255,255,0.25); height:2px;"></span> Poprzednia predykcja
  </div>`;

  el.innerHTML = html;
}

function onGaugeSelectChange(gaugeId) {
  selectedGaugeId = gaugeId;
  const gauge = GAUGES[gaugeId];
  if (gauge) {
    const titleEl = document.getElementById('hydro-chart-title');
    if (titleEl) titleEl.textContent = 'Hydrograf — ' + gauge.label;
  }
  drawHydroChart();
}

function onWaveScrubberChange(val) {
  waveCurrentTime = parseInt(val);
  const badge = document.getElementById('wave-time-badge');
  if (badge) badge.textContent = 'T+' + waveCurrentTime + 'h';
  drawWaveChart();
}

function toggleWaveAnimation() {
  const btn = document.getElementById('btn-animate-wave');
  if (waveAnimating) {
    waveAnimating = false;
    cancelAnimationFrame(waveAnimFrame);
    if (btn) { btn.classList.remove('active'); btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Animuj'; }
  } else {
    waveAnimating = true;
    waveCurrentTime = 0;
    const scrubber = document.getElementById('wave-scrubber');
    if (scrubber) scrubber.value = 0;
    if (btn) { btn.classList.add('active'); }
    animateWave();
  }
}

function animateWave() {
  if (!waveAnimating) return;
  waveCurrentTime = Math.min(waveCurrentTime + 0.5, 72);
  const scrubber = document.getElementById('wave-scrubber');
  if (scrubber) scrubber.value = waveCurrentTime;
  onWaveScrubberChange(waveCurrentTime);
  if (waveCurrentTime < 72) {
    waveAnimFrame = requestAnimationFrame(() => setTimeout(animateWave, 40));
  } else {
    waveAnimating = false;
    const btn = document.getElementById('btn-animate-wave');
    if (btn) btn.classList.remove('active');
  }
}

function deleteVariant(variantId) {
  VARIANTS = VARIANTS.filter(v => v.id !== variantId);
  GIS_OBJECTS = GIS_OBJECTS.filter(g => g.variant_id !== variantId);
  renderScenarioList();
  renderComparisonTable();
  renderDecisionTab();
  if (activeMapScenarios.has(variantId)) {
    activeMapScenarios.delete(variantId);
    drawMap();
    updateMapViewBadge();
    updateMapLegend();
  }
}

function toggleRecs(recsId) {
  const el = document.getElementById(recsId);
  if (el) el.classList.toggle('open');
}

function goToDecision() {
  window.location.href = 'decision.html';
}


// ══════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════

function switchTab(tabName) {
  document.querySelectorAll('.scenario-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.scenario-tab[data-tab="' + tabName + '"]').classList.add('active');

  document.getElementById('content-scenarios').style.display = tabName === 'scenarios' ? '' : 'none';
  document.getElementById('content-comparison').style.display = tabName === 'comparison' ? '' : 'none';
  document.getElementById('content-decision').style.display = tabName === 'decision' ? '' : 'none';
  document.getElementById('content-history').style.display = tabName === 'history' ? '' : 'none';

  if (tabName === 'comparison') renderComparisonTable();
  if (tabName === 'decision') renderDecisionTab();
  if (tabName === 'history') renderHistoryTab();
}

document.querySelectorAll('.scenario-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    switchTab(this.dataset.tab);
  });
});


// ══════════════════════════════════════════
// LAYER TOGGLES
// ══════════════════════════════════════════

document.querySelectorAll('.layer-btn[data-layer]').forEach(btn => {
  btn.addEventListener('click', function() {
    const layer = this.dataset.layer;
    LAYERS[layer] = !LAYERS[layer];
    this.classList.toggle('layer-active', LAYERS[layer]);
    drawMap();
  });
});


// ══════════════════════════════════════════
// GIS TOOLS
// ══════════════════════════════════════════

function activateGisTool(tool) {
  activeGisTool = tool;
  document.querySelectorAll('.gis-tool-btn').forEach(b => b.classList.remove('gis-active'));
  const btn = document.querySelector('.gis-tool-btn[data-tool="' + tool + '"]');
  if (btn) btn.classList.add('gis-active');

  const hint = document.getElementById('gis-hint');
  if (tool === 'line' || tool === 'polygon') {
    hint.classList.add('visible');
  } else {
    hint.classList.remove('visible');
  }
}

document.querySelectorAll('.gis-tool-btn[data-tool]').forEach(btn => {
  btn.addEventListener('click', function() {
    activateGisTool(this.dataset.tool);
  });
});

// Map click for GIS drawing
canvas.addEventListener('click', function(e) {
  if (activeGisTool !== 'line' && activeGisTool !== 'polygon') return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  if (!pendingGisGeometry) {
    pendingGisGeometry = { type: activeGisTool, points: [] };
  }

  pendingGisGeometry.points.push([x, y]);
  drawMap();
  updateNvGisList();
});

canvas.addEventListener('dblclick', function(e) {
  if (activeGisTool !== 'line' && activeGisTool !== 'polygon') return;
  e.preventDefault();

  // Finish drawing
  if (pendingGisGeometry && pendingGisGeometry.points.length > 1) {
    activateGisTool('select');
    updateNvGisList();
    drawMap();
  }
});

// Undo button
document.getElementById('btn-gis-undo').addEventListener('click', function() {
  if (pendingGisGeometry && pendingGisGeometry.points.length > 0) {
    pendingGisGeometry.points.pop();
    if (pendingGisGeometry.points.length === 0) pendingGisGeometry = null;
    drawMap();
    updateNvGisList();
  } else if (GIS_OBJECTS.length > 0) {
    GIS_OBJECTS.pop();
    drawMap();
  }
});


// ══════════════════════════════════════════
// DATASET PANEL
// ══════════════════════════════════════════

function renderDatasetPanel() {
  const dropdown = document.getElementById('dataset-dropdown');
  let html = '';

  // System layers
  html += '<div class="ds-section-label">Warstwy danych</div>';
  const sysLayers = DATASETS.filter(d => !d.private);
  sysLayers.forEach(d => {
    const dotColor = d.source === 'pipeline' ? '#4F98A3' : '#8B8D9A';
    html += '<div class="ds-layer-item">';
    html += '<span class="ds-layer-dot" style="background:' + dotColor + '"></span>';
    html += '<span>' + d.name + '</span>';
    html += '<span class="ds-layer-source">(' + d.source + ')</span>';
    if (d.affects_calc) html += ' <span class="ds-affects-badge">wpływa</span>';
    html += '</div>';
  });

  html += '<div class="ds-separator"></div>';
  html += '<div class="ds-section-label">Prywatne datasety</div>';

  const privateLayers = DATASETS.filter(d => d.private);
  if (privateLayers.length === 0) {
    html += '<div class="ds-layer-item" style="color:var(--text-faint);font-size:11px">(puste — brak)</div>';
  } else {
    privateLayers.forEach(d => {
      html += '<div class="ds-layer-item">';
      html += '<span class="ds-layer-dot" style="background:#C74FBB"></span>';
      html += '<span>' + d.name + '</span>';
      html += '<span class="ds-private-badge">🔒</span>';
      if (d.affects_calc) html += ' <span class="ds-affects-badge">wpływa na wyniki</span>';
      html += '</div>';
    });
  }

  html += '<div class="ds-separator"></div>';
  html += '<button class="ds-add-btn">+ Dodaj dataset</button>';

  dropdown.innerHTML = html;
}

// Toggle dataset dropdown
document.getElementById('btn-dane').addEventListener('click', function(e) {
  e.stopPropagation();
  const dd = document.getElementById('dataset-dropdown');
  dd.classList.toggle('open');
  renderDatasetPanel();
});

// Close dropdown on outside click
document.addEventListener('click', function(e) {
  const dd = document.getElementById('dataset-dropdown');
  if (dd && dd.classList.contains('open') && !e.target.closest('.dataset-dropdown-wrap')) {
    dd.classList.remove('open');
  }
});


// ══════════════════════════════════════════
// DATASET FLOW DRAWER
// ══════════════════════════════════════════

const dsDrawer = document.getElementById('ds-flow-drawer');
const dsBackdrop = document.getElementById('ds-flow-backdrop');
let dsCurrentStep = 1;

function openDsFlow() {
  dsDrawer.classList.add('open');
  dsBackdrop.classList.add('open');
  // Close the dropdown
  const dd = document.getElementById('dataset-dropdown');
  if (dd) dd.classList.remove('open');
  goDsStep(1);
}

function closeDsFlow() {
  dsDrawer.classList.remove('open');
  dsBackdrop.classList.remove('open');
}

function goDsStep(step) {
  dsCurrentStep = step;
  // Show/hide steps
  document.querySelectorAll('.ds-flow-step').forEach((el, i) => {
    el.classList.toggle('hidden', i + 1 !== step);
  });
  // Update step dots
  document.querySelectorAll('.ds-step-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i + 1 === step) dot.classList.add('active');
    else if (i + 1 < step) dot.classList.add('done');
  });
  // Draw preview map if step 2
  if (step === 2) drawDsPreviewMap();
}

document.getElementById('ds-flow-close').addEventListener('click', closeDsFlow);
document.getElementById('ds-step3-done').addEventListener('click', closeDsFlow);
dsBackdrop.addEventListener('click', closeDsFlow);

// Step 1: example buttons activate "next"
document.querySelectorAll('.ds-example-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ds-example-btn').forEach(b => { b.classList.remove('selected'); b.style.borderColor = ''; });
    btn.classList.add('selected');
    btn.style.borderColor = 'var(--teal)';
    document.getElementById('ds-step1-next').disabled = false;
    document.getElementById('ds-file-name').textContent =
      btn.dataset.url === 'private' ? 'infrastruktura_wojskowa.geojson' :
      btn.dataset.url === 'isok' ? 'ISOK_strefy_zagrozen_Q1.geojson' : 'BDOT10k_budynki.geojson';
    document.getElementById('ds-file-meta').textContent =
      btn.dataset.url === 'private' ? '127 obiektów · 2.3 MB · Punkt/Poligon' :
      btn.dataset.url === 'isok' ? '4 warstwy · 12.4 MB · Poligon' : '8,432 obiektów · 5.1 MB · Poligon';
    document.getElementById('ds-layer-name').value =
      btn.dataset.url === 'private' ? 'Infrastruktura wojskowa' :
      btn.dataset.url === 'isok' ? 'ISOK — strefy zagrożenia' : 'BDOT10k — budynki';
    // Private dataset: force private visibility
    if (btn.dataset.url === 'private') {
      document.querySelector('input[name="ds-visibility"][value="private"]').checked = true;
    }
  });
});

// URL load button enables next
document.getElementById('ds-url-load').addEventListener('click', () => {
  const urlVal = document.getElementById('ds-url-input').value.trim();
  if (urlVal) {
    document.getElementById('ds-step1-next').disabled = false;
    document.getElementById('ds-file-name').textContent = urlVal.split('/').pop() || 'dataset.geojson';
    document.getElementById('ds-file-meta').textContent = '— obiektów · wczytywanie...';
    document.getElementById('ds-layer-name').value = 'Dataset URL';
  }
});

// Upload zone drag & drop
const uploadZone = document.getElementById('ds-upload-zone');
if (uploadZone) {
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault(); uploadZone.classList.remove('dragover');
    document.getElementById('ds-step1-next').disabled = false;
    document.getElementById('ds-file-name').textContent = e.dataTransfer.files[0]?.name || 'dataset.geojson';
    document.getElementById('ds-file-meta').textContent = '— obiektów · wczytywanie...';
    document.getElementById('ds-layer-name').value = (e.dataTransfer.files[0]?.name || 'dataset').replace(/\.[^.]+$/, '');
  });
  document.getElementById('ds-browse-btn').addEventListener('click', e => {
    e.stopPropagation();
    alert('Demo: Wybieranie pliku GeoJSON / CSV / SHP');
  });
}

// Step navigation
document.getElementById('ds-step1-next').addEventListener('click', () => goDsStep(2));
document.getElementById('ds-step2-back').addEventListener('click', () => goDsStep(1));
document.getElementById('ds-step2-next').addEventListener('click', () => {
  // Commit the dataset to DATASETS
  const name = document.getElementById('ds-layer-name').value.trim() || 'Dataset';
  const isPrivate = document.querySelector('input[name="ds-visibility"]:checked')?.value === 'private';
  const affectsCalc = document.getElementById('ds-affects-calc').checked;
  const objType = document.getElementById('ds-object-type').value;

  const newDs = {
    id: 'user_' + Date.now(),
    name: name,
    source: 'upload',
    private: isPrivate,
    affects_calc: affectsCalc,
    obj_type: objType
  };
  DATASETS.push(newDs);
  renderDatasetPanel();
  drawMap();

  // Update step 3 content
  document.getElementById('ds-success-title').textContent = name;
  document.getElementById('ds-layer-added-name').textContent = name;
  document.getElementById('ds-success-visibility').textContent = isPrivate ? '🔒 Prywatna' : '👥 Organizacja';
  const calcBadge = document.getElementById('ds-success-calc');
  calcBadge.textContent = affectsCalc ? 'wpływa na wyniki' : 'tylko wizualnie';
  calcBadge.style.display = 'inline';
  goDsStep(3);
});

// Add another
document.getElementById('ds-add-another').addEventListener('click', () => {
  document.querySelectorAll('.ds-example-btn').forEach(b => { b.classList.remove('selected'); b.style.borderColor = ''; });
  document.getElementById('ds-step1-next').disabled = true;
  document.getElementById('ds-url-input').value = '';
  goDsStep(1);
});

// Wire .ds-add-btn inside dropdown to open the flow drawer
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.ds-add-btn, #btn-add-dataset-flow');
  if (btn) {
    e.preventDefault();
    openDsFlow();
  }
});

// Mini preview map for step 2
function drawDsPreviewMap() {
  const canvas = document.getElementById('ds-preview-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  // Background
  ctx.fillStyle = '#0c0d10';
  ctx.fillRect(0, 0, w, h);
  // Grid
  ctx.strokeStyle = '#1a1b25';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  // River
  ctx.strokeStyle = '#4F98A3'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(20,130); ctx.bezierCurveTo(80,100,200,80,260,60); ctx.bezierCurveTo(300,45,340,40,368,30); ctx.stroke();
  // Flood zone
  ctx.fillStyle = 'rgba(79,152,163,0.2)';
  ctx.strokeStyle = 'rgba(217,80,80,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.ellipse(190,90,100,40,0.3,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.setLineDash([]);
  // Dataset objects (color depends on selected type)
  const layerName = document.getElementById('ds-layer-name')?.value.toLowerCase();
  const dsColor = (layerName && layerName.includes('wojsk')) ? '#C74FBB' :
                  (layerName && layerName.includes('isok')) ? '#D95050' : '#4F98A3';
  const pts = [[160,75],[190,85],[210,90],[175,95],[200,70],[220,85],[150,100],[240,80],[180,110],[170,65]];
  pts.forEach(([x,y]) => {
    ctx.fillStyle = dsColor; ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = dsColor+'80'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.stroke();
  });
  // Legend mini
  ctx.fillStyle = dsColor; ctx.fillRect(8, h-18, 6, 6);
  ctx.fillStyle = '#5A5C6A'; ctx.font = '9px Inter';
  ctx.fillText('Dataset', 18, h-10);
}


// ══════════════════════════════════════════
// ACKNOWLEDGE BUTTON
// ══════════════════════════════════════════

document.getElementById('btn-acknowledge').addEventListener('click', function() {
  this.textContent = '✓ Acknowledged';
  this.disabled = true;
  this.style.borderColor = 'var(--success)';
  this.style.color = 'var(--success)';
});


// ══════════════════════════════════════════
// WINDOW RESIZE
// ══════════════════════════════════════════

window.addEventListener('resize', () => { drawMap(); drawCharts(); });


// ══════════════════════════════════════════
// HISTORIA TAB (TAB 4)
// ══════════════════════════════════════════

const HISTORY_ENTRIES = [
  {
    ts: '2026-04-07 08:00',
    actor: 'SYSTEM',
    action: 'Alert wygenerowany',
    detail: 'severity L3, prognoza opadów 480mm/24h, przekroczony próg alarmowy',
    type: 'system'
  },
  {
    ts: '2026-04-07 08:15',
    actor: 'Paweł S.',
    action: 'Alert potwierdzony',
    detail: 'rozpoczęto monitorowanie sytuacji',
    type: 'user'
  },
  {
    ts: '2026-04-07 09:30',
    actor: 'SYSTEM',
    action: 'Scenariusz bazowy obliczony',
    detail: '47 budynków, 2,4 km², koszt 12–18M PLN',
    type: 'system'
  },
  {
    ts: '2026-04-07 11:45',
    actor: 'Paweł S.',
    action: 'Wariant A stworzony',
    detail: 'precipitation_pct: +20%',
    type: 'user'
  },
  {
    ts: '2026-04-07 12:30',
    actor: 'SYSTEM',
    action: 'Wariant A obliczony',
    detail: '63 budynki, 3,1 km², koszt 16–24M PLN',
    type: 'system'
  },
  {
    ts: '2026-04-07 13:20',
    actor: 'Paweł S.',
    action: 'Wariant B stworzony',
    detail: 'levee_breach_km: 0,5',
    type: 'user'
  },
  {
    ts: '2026-04-07 14:00',
    actor: 'SYSTEM',
    action: 'Wariant B obliczony',
    detail: '89 budynków, 4,2 km² — ALERT: wymaga ewakuacji',
    type: 'system'
  },
  {
    ts: '2026-04-07 14:30',
    actor: 'Paweł S.',
    action: 'Przesłano do decydenta',
    detail: 'scenariusze: Bazowy + Wariant A',
    type: 'user'
  },
  {
    ts: '2026-04-07 15:45',
    actor: 'Marek W.',
    action: 'Decyzja zatwierdzona',
    detail: 'podstawa: Wariant A, 4 zadania operacyjne wydane',
    type: 'decision'
  },
  {
    ts: '2026-04-08 08:00',
    actor: 'SYSTEM',
    action: 'Scenariusz bazowy zaktualizowany',
    detail: 'trend opadów ↓, poziom wód opada',
    type: 'system'
  },
  {
    ts: '2026-04-08 20:00',
    actor: 'SYSTEM',
    action: 'Scenariusz bazowy zaktualizowany',
    detail: 'bieżący',
    type: 'system',
    current: true
  }
];

function renderHistoryTab() {
  const container = document.getElementById('content-history');
  if (!container) return;

  let html = '<div class="history-timeline">';

  HISTORY_ENTRIES.forEach((entry, idx) => {
    const isLast = idx === HISTORY_ENTRIES.length - 1;
    const isSystem = entry.type === 'system';
    const isDecision = entry.type === 'decision';

    const dotClass = isDecision
      ? 'history-dot history-dot-decision'
      : isSystem
        ? 'history-dot history-dot-system'
        : 'history-dot history-dot-user';

    const actorClass = isSystem ? 'history-actor-badge history-actor-system' : 'history-actor-badge';
    const cardClass = isDecision ? 'history-card history-decision-card' : 'history-card';

    const currentTag = entry.current
      ? ' <span class="history-current-tag">bieżący</span>'
      : '';

    html += '<div class="history-entry">';
    html += '<div class="history-line-wrap">';
    html += '<div class="' + dotClass + '"></div>';
    if (!isLast) html += '<div class="history-connector"></div>';
    html += '</div>';

    html += '<div class="' + cardClass + '">';
    html += '<div class="history-ts">' + entry.ts + '</div>';
    html += '<span class="' + actorClass + '">' + entry.actor + '</span>';
    html += '<div class="history-action-title">' + entry.action + currentTag + '</div>';
    html += '<div class="history-detail">' + entry.detail + '</div>';
    html += '</div>';

    html += '</div>';
  });

  html += '</div>';
  html += '<div class="history-footer">System rejestruje wszystkie zmiany automatycznie · zgodność z CSRD §24</div>';

  container.innerHTML = html;
}


// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════

(function init() {
  renderScenarioList();
  renderComparisonTable();
  renderDecisionTab();
  renderHistoryTab();
  drawMap();
  drawCharts();
  updateMapLegend();
  updateMapViewBadge();
})();
