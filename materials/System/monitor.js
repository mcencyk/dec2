/* ═══════════════════════════════════════════
   DECERIS — Monitor Dashboard JS
   ═══════════════════════════════════════════ */

// ── GAUGE DATA ──
const GAUGES = [
  // Normal gauges (teal)
  { id: 'wroclaw',    identify_key: 'Wrocław',      river: 'Odra',          km: 242.4, level: 134, severity: 0, severity_key: 'normal',   threat_type: 'Flood Risk', trend: '→', x: 0.44, y: 0.36 },
  { id: 'brzegdolny', identify_key: 'Brzeg Dolny',  river: 'Odra',          km: 260.8, level: 128, severity: 0, severity_key: 'normal',   threat_type: 'Flood Risk', trend: '→', x: 0.36, y: 0.30 },
  { id: 'scinawa',    identify_key: 'Ścinawa',      river: 'Odra',          km: 303.5, level: 118, severity: 0, severity_key: 'normal',   threat_type: 'Flood Risk', trend: '↓', x: 0.22, y: 0.22 },
  { id: 'glogow',     identify_key: 'Głogów',       river: 'Odra',          km: 340.2, level: 125, severity: 0, severity_key: 'normal',   threat_type: 'Flood Risk', trend: '→', x: 0.13, y: 0.15 },
  { id: 'olawa',      identify_key: 'Oława',        river: 'Odra',          km: 220.1, level: 140, severity: 0, severity_key: 'normal',   threat_type: 'Flood Risk', trend: '→', x: 0.55, y: 0.42 },
  { id: 'jelcz',      identify_key: 'Jelcz',        river: 'Odra',          km: 207.6, level: 136, severity: 0, severity_key: 'normal',   threat_type: 'Flood Risk', trend: '→', x: 0.62, y: 0.47 },
  { id: 'swidnica',   identify_key: 'Świdnica',     river: 'Ślęza',         km: 18.5,  level: 98,  severity: 0, severity_key: 'normal',   threat_type: 'Flood Risk', trend: '↓', x: 0.52, y: 0.58 },
  // warning (yellow)
  { id: 'bystrzyca',  identify_key: 'Bystrzyca Kł.',river: 'Nysa Kłodzka',  km: 12.4,  level: 156, severity: 1, severity_key: 'warning',  threat_type: 'Flood Risk', trend: '↓', x: 0.70, y: 0.64 },
  { id: 'lesna',      identify_key: 'Leśna',        river: 'Kwisa',         km: 8.7,   level: 158, severity: 1, severity_key: 'warning',  threat_type: 'Flood Risk', trend: '→', x: 0.18, y: 0.58 },
  // watch/flood (orange)
  { id: 'zagan',      identify_key: 'Żagań',        river: 'Bóbr',          km: 45.1,  level: 178, severity: 2, severity_key: 'watch',    threat_type: 'Flood Risk', trend: '↑', x: 0.12, y: 0.42 },
  { id: 'bardo',      identify_key: 'Bardo',        river: 'Nysa Kłodzka',  km: 52.7,  level: 195, severity: 2, severity_key: 'watch',    threat_type: 'Flood Risk', trend: '↑', x: 0.68, y: 0.72 },
  // flood (red) — Kłodzko
  { id: 'klodzko',    identify_key: 'Kłodzko',      river: 'Nysa Kłodzka',  km: 34.2,  level: 212, severity: 3, severity_key: 'flood',    threat_type: 'Flood Risk', trend: '↑', x: 0.78, y: 0.78 },

  // ── DEMO: Przykładowe inne typy Threatów ──
  // Air Quality Risk — Wrocław centrum, AQI 178 (unhealthy)
  { id: 'aqi_wroclaw', identify_key: 'Wrocław — Centrum', region: 'Dolny śląsk',
    level: 178, unit: 'AQI', severity: 2, severity_key: 'unhealthy',
    threat_type: 'Air Quality Risk', trend: '↑',
    shape: 'diamond', demo: true, x: 0.44, y: 0.33 },

  // Landslide Risk — Kotlina Kłodzka, probability 71%
  { id: 'landslide_klodzko', identify_key: 'Kotlina Kłodzka — sektor A',
    region: 'Kłodzko', level: 71, unit: '%', severity: 2, severity_key: 'elevated',
    threat_type: 'Landslide Risk', trend: '↑',
    shape: 'triangle', demo: true, x: 0.72, y: 0.62 },

  // Critical Infrastructure — awaria sieci energetycznej
  { id: 'power_jelenia', identify_key: 'GPZ Jelenia Góra — 110kV',
    region: 'Jelenia Góra', level: 3, unit: 'subst.', severity: 3, severity_key: 'critical',
    threat_type: 'Infrastructure Risk', trend: '→',
    shape: 'square', demo: true, x: 0.82, y: 0.44 },
];

// River paths as bezier curves (normalized 0-1 coords)
const RIVERS = [
  {
    name: 'Odra',
    points: [
      { x: 0.88, y: 0.52 }, { x: 0.72, y: 0.48 }, { x: 0.62, y: 0.47 },
      { x: 0.55, y: 0.42 }, { x: 0.44, y: 0.36 }, { x: 0.36, y: 0.30 },
      { x: 0.22, y: 0.22 }, { x: 0.13, y: 0.15 }, { x: 0.05, y: 0.08 }
    ],
    labelPos: { x: 0.30, y: 0.23, angle: -20 }
  },
  {
    name: 'Nysa Kłodzka',
    points: [
      { x: 0.88, y: 0.85 }, { x: 0.78, y: 0.78 }, { x: 0.68, y: 0.72 },
      { x: 0.70, y: 0.64 }, { x: 0.62, y: 0.52 }, { x: 0.55, y: 0.42 }
    ],
    labelPos: { x: 0.76, y: 0.68, angle: -50 }
  },
  {
    name: 'Bóbr',
    points: [
      { x: 0.28, y: 0.72 }, { x: 0.22, y: 0.62 }, { x: 0.18, y: 0.52 },
      { x: 0.12, y: 0.42 }, { x: 0.08, y: 0.30 }
    ],
    labelPos: { x: 0.16, y: 0.50, angle: -70 }
  },
  {
    name: 'Kwisa',
    points: [
      { x: 0.26, y: 0.68 }, { x: 0.20, y: 0.60 }, { x: 0.18, y: 0.58 },
      { x: 0.14, y: 0.48 }, { x: 0.08, y: 0.36 }
    ],
    labelPos: { x: 0.13, y: 0.54, angle: -60 }
  },
  {
    name: 'Ślęza',
    points: [
      { x: 0.58, y: 0.68 }, { x: 0.54, y: 0.60 }, { x: 0.52, y: 0.58 },
      { x: 0.48, y: 0.48 }, { x: 0.44, y: 0.38 }
    ],
    labelPos: { x: 0.50, y: 0.55, angle: -65 }
  }
];

const SEVERITY_COLORS = ['#4F98A3', '#EAB945', '#E08644', '#D95050'];
const SEVERITY_LABELS = ['normal', 'warning', 'watch', 'flood'];

let showRiverLabels = true;
let activeGaugeCard = null;
let animFrame = null;
let pulsePhase = 0;

// ── CANVAS MAP ──
function drawMap() {
  const canvas = document.getElementById('monitor-map-canvas');
  if (!canvas) return;
  const container = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = container.clientWidth;
  const h = container.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = '#0f1018';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = '#1a1b25';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Voivodeship outline (approximate polygon)
  ctx.strokeStyle = '#2A2B3840';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  const outline = [
    { x: 0.03, y: 0.05 }, { x: 0.35, y: 0.03 }, { x: 0.60, y: 0.08 },
    { x: 0.85, y: 0.15 }, { x: 0.95, y: 0.35 }, { x: 0.93, y: 0.60 },
    { x: 0.92, y: 0.85 }, { x: 0.75, y: 0.95 }, { x: 0.50, y: 0.92 },
    { x: 0.30, y: 0.88 }, { x: 0.10, y: 0.78 }, { x: 0.03, y: 0.55 },
    { x: 0.02, y: 0.25 }
  ];
  ctx.moveTo(outline[0].x * w, outline[0].y * h);
  for (let i = 1; i < outline.length; i++) {
    ctx.lineTo(outline[i].x * w, outline[i].y * h);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw rivers
  RIVERS.forEach(river => {
    // Background glow
    ctx.strokeStyle = '#1a4a6640';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawRiverPath(ctx, river.points, w, h);
    ctx.stroke();

    // Main river line
    ctx.strokeStyle = '#2d7d9a90';
    ctx.lineWidth = 2.5;
    drawRiverPath(ctx, river.points, w, h);
    ctx.stroke();

    // Bright center
    ctx.strokeStyle = '#4F98A360';
    ctx.lineWidth = 1;
    drawRiverPath(ctx, river.points, w, h);
    ctx.stroke();
  });

  // River labels
  if (showRiverLabels) {
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#5A5C6A';
    RIVERS.forEach(river => {
      ctx.save();
      const lx = river.labelPos.x * w;
      const ly = river.labelPos.y * h;
      ctx.translate(lx, ly);
      ctx.rotate((river.labelPos.angle * Math.PI) / 180);
      ctx.fillText(river.name, 0, 0);
      ctx.restore();
    });
  }

  // Gauge dots
  pulsePhase += 0.03;
  const pulseFactor = 0.5 + 0.5 * Math.sin(pulsePhase);
  const strongPulse = 0.3 + 0.7 * Math.sin(pulsePhase * 1.5);

  GAUGES.forEach(g => {
    const gx = g.x * w;
    const gy = g.y * h;
    const color = SEVERITY_COLORS[Math.min(g.severity, 3)];
    const isDemo = !!g.demo;
    const shape = g.shape || 'circle';

    ctx.save();

    // Pulse rings (same for all shapes)
    if (g.severity >= 1) {
      const pulseR = (shape === 'circle' ? 5 : 6) + (g.severity >= 3 ? strongPulse : pulseFactor) * (g.severity >= 3 ? 10 : 6);
      ctx.beginPath();
      if (shape === 'circle') ctx.arc(gx, gy, pulseR, 0, Math.PI * 2);
      else ctx.arc(gx, gy, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = color + (g.severity >= 3 ? '25' : '30');
      ctx.fill();
    }

    // DEMO: dashed outline ring
    if (isDemo) {
      ctx.strokeStyle = '#A0A0B0';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(gx, gy, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Shape drawing
    ctx.fillStyle = color;
    ctx.shadowColor = g.severity >= 2 ? color : 'transparent';
    ctx.shadowBlur = g.severity >= 3 ? 16 : g.severity >= 2 ? 8 : 0;

    if (shape === 'diamond') {
      const s = g.severity >= 2 ? 7 : 5;
      ctx.beginPath();
      ctx.moveTo(gx, gy - s);
      ctx.lineTo(gx + s, gy);
      ctx.lineTo(gx, gy + s);
      ctx.lineTo(gx - s, gy);
      ctx.closePath();
      ctx.fill();
    } else if (shape === 'triangle') {
      const s = g.severity >= 2 ? 7 : 5;
      ctx.beginPath();
      ctx.moveTo(gx, gy - s);
      ctx.lineTo(gx + s * 0.87, gy + s * 0.5);
      ctx.lineTo(gx - s * 0.87, gy + s * 0.5);
      ctx.closePath();
      ctx.fill();
    } else if (shape === 'square') {
      const s = g.severity >= 2 ? 5 : 4;
      ctx.fillRect(gx - s, gy - s, s * 2, s * 2);
    } else {
      // Default circle
      const r = g.severity === 0 ? 4 : g.severity === 1 ? 4 : g.severity === 2 ? 5 : 6;
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Label
    if (showRiverLabels && g.severity > 0) {
      // DEMO badge
      if (isDemo) {
        ctx.font = 'bold 8px Inter';
        ctx.fillStyle = '#A0A0B0';
        const badge = ' DEMO';
        ctx.fillText(g.identify_key + badge, gx + 10, gy - 4);
        ctx.font = '9px Inter';
        ctx.fillStyle = color;
        ctx.fillText(g.level + (g.unit || ''), gx + 10, gy + 7);
      } else {
        ctx.font = '10px Inter';
        ctx.fillStyle = '#C8CAD4';
        ctx.fillText(g.identify_key, gx + 8, gy - 3);
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillStyle = color;
        ctx.fillText(g.level + 'cm', gx + 8, gy + 9);
      }
    }

    ctx.restore();
  });

  animFrame = requestAnimationFrame(drawMap);
}

function drawRiverPath(ctx, points, w, h) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x * w, points[0].y * h);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = ((prev.x + curr.x) / 2) * w;
    const cpy = ((prev.y + curr.y) / 2) * h;
    ctx.quadraticCurveTo(prev.x * w, prev.y * h, cpx, cpy);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x * w, last.y * h);
}

// ── INTERACTIVITY ──
function getGaugeAtPos(mx, my) {
  const canvas = document.getElementById('monitor-map-canvas');
  const container = canvas.parentElement;
  const w = container.clientWidth;
  const h = container.clientHeight;
  let closest = null;
  let closestDist = Infinity;

  GAUGES.forEach(g => {
    const gx = g.x * w;
    const gy = g.y * h;
    const dist = Math.sqrt((mx - gx) ** 2 + (my - gy) ** 2);
    const hitRadius = g.severity === 0 ? 12 : g.severity === 3 ? 20 : 16;
    if (dist < hitRadius && dist < closestDist) {
      closest = g;
      closestDist = dist;
    }
  });
  return closest;
}

function showTooltip(gauge, mx, my) {
  const tooltip = document.getElementById('map-tooltip');
  const container = document.getElementById('map-container');
  const rect = container.getBoundingClientRect();
  const trendSymbol = gauge.trend;
  const sevLabel = SEVERITY_LABELS[gauge.severity];
  const sevColor = SEVERITY_COLORS[gauge.severity];

  tooltip.innerHTML = `
    <div style="margin-bottom:2px"><strong style="color:${sevColor}">${gauge.identify_key}</strong> · <span style="color:var(--text-faint)">${gauge.river}</span></div>
    <div>km ${gauge.km} · <strong>${gauge.level}<span style="font-size:10px;color:var(--text-faint)">cm</span></strong> · ${sevLabel} ${trendSymbol} · <span style="color:var(--text-faint)">${gauge.threat_type}</span></div>
  `;

  // Position tooltip
  let left = mx + 14;
  let top = my - 40;
  if (left + 200 > rect.width) left = mx - 200;
  if (top < 10) top = my + 20;

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  tooltip.classList.add('visible');
}

function hideTooltip() {
  document.getElementById('map-tooltip').classList.remove('visible');
}

function showMiniCard(gauge, mx, my) {
  const card = document.getElementById('map-mini-card');
  const container = document.getElementById('map-container');
  const w = container.clientWidth;
  const h = container.clientHeight;

  document.getElementById('mc-name').textContent = gauge.identify_key;
  const sevEl = document.getElementById('mc-severity');
  sevEl.textContent = gauge.severity_key;
  sevEl.className = 'mini-card-severity mc-l' + gauge.severity;

  // Dynamic metric display based on unit
  const unit = gauge.unit || 'cm';
  const locInfo = gauge.river ? `km ${gauge.km} · ${gauge.river}` : (gauge.region || '');
  document.getElementById('mc-level').textContent = `${gauge.level}${unit} · ${locInfo} · ${gauge.threat_type}`;

  // Routing: map threat_type to correct detail page
  const TEMPLATE_ROUTES = {
    'Flood Risk':           'threat-detail.html',
    'Air Quality Risk':     'threat-detail-aqi.html',
    'Landslide Risk':       'threat-detail.html',     // placeholder
    'Infrastructure Risk':  'threat-detail.html',     // placeholder
  };
  const detailHref = TEMPLATE_ROUTES[gauge.threat_type] || 'threat-detail.html';

  const primaryLink = document.querySelector('.mini-card-link[data-target="threats"]');
  const secondaryLink = document.querySelector('.mini-card-link-secondary');
  if (primaryLink) primaryLink.href = 'threats.html';
  if (secondaryLink) {
    secondaryLink.href = detailHref;
    secondaryLink.textContent = gauge.demo ? 'Analizuj (DEMO) →' : 'Analizuj →';
  }

  // Draw sparkline
  drawMiniSparkline(gauge);

  // Position
  let left = mx + 16;
  let top = my - 80;
  if (left + 220 > w) left = mx - 230;
  if (top < 10) top = my + 16;
  if (top + 180 > h) top = h - 190;

  card.style.left = left + 'px';
  card.style.top = top + 'px';
  card.classList.add('visible');
  activeGaugeCard = gauge.id;
}

function hideMiniCard() {
  document.getElementById('map-mini-card').classList.remove('visible');
  activeGaugeCard = null;
}

function drawMiniSparkline(gauge) {
  const canvas = document.getElementById('mc-sparkline');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 180 * dpr;
  canvas.height = 40 * dpr;
  ctx.scale(dpr, dpr);
  const w = 180, h = 40;

  ctx.clearRect(0, 0, w, h);

  // Generate 24 hourly data points
  const baseLevel = gauge.level - (gauge.severity * 15);
  const data = [];
  for (let i = 0; i < 24; i++) {
    const progress = i / 23;
    const noise = Math.sin(i * 0.8) * 5 + Math.sin(i * 1.7) * 3;
    const trend = progress * (gauge.level - baseLevel);
    data.push(baseLevel + trend + noise);
  }

  const minVal = Math.min(...data) - 5;
  const maxVal = Math.max(...data) + 5;
  const range = maxVal - minVal;

  // Fill gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  const color = SEVERITY_COLORS[gauge.severity];
  grad.addColorStop(0, color + '40');
  grad.addColorStop(1, color + '05');

  ctx.beginPath();
  ctx.moveTo(0, h);
  data.forEach((v, i) => {
    const x = (i / 23) * w;
    const y = h - ((v - minVal) / range) * (h - 4);
    if (i === 0) ctx.lineTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = (i / 23) * w;
    const y = h - ((v - minVal) / range) * (h - 4);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Current value dot
  const lastX = w;
  const lastY = h - ((data[23] - minVal) / range) * (h - 4);
  ctx.beginPath();
  ctx.arc(lastX - 2, lastY, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ── EVENT HANDLERS ──
function initMap() {
  const container = document.getElementById('map-container');
  const canvas = document.getElementById('monitor-map-canvas');

  canvas.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const gauge = getGaugeAtPos(mx, my);

    if (gauge) {
      canvas.style.cursor = gauge.severity >= 2 ? 'pointer' : 'default';
      showTooltip(gauge, mx, my);
    } else {
      canvas.style.cursor = 'default';
      hideTooltip();
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hideTooltip();
  });

  canvas.addEventListener('click', (e) => {
    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const gauge = getGaugeAtPos(mx, my);

    if (gauge && gauge.severity >= 2) {
      if (activeGaugeCard === gauge.id) {
        hideMiniCard();
      } else {
        showMiniCard(gauge, mx, my);
      }
    } else {
      hideMiniCard();
    }
  });

  // Toggle river labels
  const toggle = document.getElementById('toggle-labels');
  if (toggle) {
    const checkbox = toggle.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      showRiverLabels = checkbox.checked;
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('btn-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.classList.add('spinning');
      setTimeout(() => refreshBtn.classList.remove('spinning'), 600);
    });
  }

  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      hideMiniCard();
      hideTooltip();
    }, 100);
  });

  // Start animation loop
  drawMap();
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderThreatList();
  renderEventFeed();
  renderLegend('severity');
  initLegendToggle();
});

// ── LEGEND ──

const LEGEND_SEVERITY = [
  { color: '#4F98A3', label: 'Normalny',    key: 'normal'  },
  { color: '#EAB945', label: 'L1 — Ostrzeżenie', key: 'warning' },
  { color: '#E08644', label: 'L2 — Podwyższony', key: 'elevated' },
  { color: '#D95050', label: 'L3 — Alarmowy',   key: 'alarm'   },
];

function renderLegend(mode) {
  const el = document.getElementById('legend-items');
  if (!el) return;

  if (mode === 'severity') {
    el.innerHTML = LEGEND_SEVERITY
      .filter((_, i) => i > 0) // skip 'normal' — not shown on map
      .map(s => `
        <div class="legend-item">
          <span class="legend-swatch" style="background:${s.color}"></span>
          ${s.label}
        </div>`).join('');
  } else {
    // Type mode — generated from active GAUGES
    const seen = new Map();
    GAUGES.filter(g => g.severity > 0).forEach(g => {
      if (!seen.has(g.threat_type)) {
        const shape = g.shape || 'circle';
        const shapeIcon = { circle: '●', diamond: '◆', triangle: '▲', square: '■' }[shape] || '●';
        const color = SEVERITY_COLORS[g.severity] || '#4F98A3';
        seen.set(g.threat_type, { color, shapeIcon, demo: g.demo });
      }
    });

    el.innerHTML = Array.from(seen.entries()).map(([type, { color, shapeIcon, demo }]) => `
      <div class="legend-item${demo ? ' legend-item-demo' : ''}">
        <span class="legend-shape-icon" style="color:${color}">${shapeIcon}</span>
        ${type}${demo ? ' <span class="legend-demo-tag">DEMO</span>' : ''}
      </div>`).join('');
  }
}

function initLegendToggle() {
  document.querySelectorAll('.legend-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.legend-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLegend(btn.dataset.legend);
    });
  });
}

function renderThreatList() {
  const list = document.getElementById('threat-list');
  const countEl = document.getElementById('active-threat-count');
  if (!list) return;

  // Hardcoded active threats (flood) + demo threats
  const THREATS = [
    { title: 'Nysa Kłodzka', desc: 'fala powodziowa', type: 'Flood Risk', severity: 3, color: 'var(--l3)', tag: 'L3', eta: '36h', demo: false },
    { title: 'Bóbr', desc: 'wezbranie roztopowe', type: 'Flood Risk', severity: 2, color: 'var(--l2)', tag: 'L2', eta: '18h', demo: false },
    { title: 'Kwisa', desc: 'stan ostrzegawczy', type: 'Flood Risk', severity: 1, color: 'var(--l1)', tag: 'L1', eta: '52h', demo: false },
    // DEMO
    { title: 'Wrocław — Centrum', desc: 'jakość powietrza AQI 178', type: 'Air Quality Risk', severity: 2, color: 'var(--l2)', tag: 'L2', eta: '8h', demo: true, shape: '◆' },
    { title: 'Kotlina Kłodzka A', desc: 'ryzyko osunięcia 71%', type: 'Landslide Risk', severity: 2, color: 'var(--l2)', tag: 'L2', eta: '12h', demo: true, shape: '▲' },
    { title: 'GPZ Jelenia Góra', desc: 'awaria sieci 110kV', type: 'Infrastructure Risk', severity: 3, color: 'var(--l3)', tag: 'L3', eta: 'aktywna', demo: true, shape: '■' },
  ];

  const arrowSvg = '<svg class="threat-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>';

  list.innerHTML = THREATS.map(t => {
    const demoAttr = t.demo ? ' threat-item-demo' : '';
    const demoTag = t.demo ? `<span class="threat-demo-badge">DEMO</span>` : '';
    const shapeIcon = t.shape ? `<span class="threat-shape-icon">${t.shape}</span>` : '';
    return `
      <a href="threats.html" class="threat-item${demoAttr}">
        <div class="threat-severity-dot" style="background:${t.color}">${shapeIcon}</div>
        <div class="threat-info">
          <div class="threat-header-row">
            <span class="threat-level-tag tl-l${t.severity}">${t.tag}</span>
            <span class="threat-river">${t.title}</span>
            ${demoTag}
          </div>
          <div class="threat-desc">${t.desc}</div>
          <div class="threat-meta"><span>· ${t.type} · ${t.eta}</span></div>
        </div>
        ${arrowSvg}
      </a>`;
  }).join('');

  if (countEl) countEl.textContent = '· ' + THREATS.length;
}

function renderEventFeed() {
  const list = document.getElementById('prediction-list');
  if (!list) return;

  // Severity level labels from View Schema (operator-defined)
  const severityLabels = { 0: 'normal', 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4' };
  const severityClasses = { 0: 'ps-normal', 1: 'ps-l1', 2: 'ps-l2', 3: 'ps-l3', 4: 'ps-l4' };
  const deltaClass = { '↑': 'delta-up', '↓': 'delta-down', '→': 'delta-flat' };

  // Show active gauges sorted by severity desc, then all others
  const sorted = [...GAUGES]
    .filter(g => g.severity > 0) // only active threats
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 5); // top 5

  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

  list.innerHTML = sorted.map(g => {
    const unit = g.unit || 'cm';
    const deltaSign = g.trend === '↑' ? '+' : g.trend === '↓' ? '−' : '+';
    const deltaVal = g.trend === '→' ? '0' : '1';
    const demoTag = g.demo ? '<span class="pred-demo-tag">DEMO</span> ' : '';
    return `
      <div class="prediction-item${g.demo ? ' prediction-demo' : ''}">
        <span class="pred-time">${timeStr}</span>
        <span class="pred-gauge">${demoTag}${g.threat_type} · ${g.identify_key}</span>
        <span class="pred-value">${g.level}<span class="pred-unit">${unit}</span></span>
        <span class="pred-delta ${deltaClass[g.trend] || 'delta-flat'}">${deltaSign}${deltaVal}${unit} ${g.trend}</span>
        <span class="pred-severity ${severityClasses[g.severity]}">${severityLabels[g.severity]}</span>
      </div>`;
  }).join('');

  if (sorted.length === 0) {
    list.innerHTML = '<div style="padding:12px 14px;font-size:12px;color:var(--text-faint)">Brak aktywnych zdarzeń</div>';
  }
}

// ══════════════════════════════════════════════
// ── MODE TOGGLE ──
// ══════════════════════════════════════════════
const modebtns = document.querySelectorAll('.mode-btn');
const gisToolbar = document.getElementById('gis-toolbar');
const gisStatusbar = document.getElementById('gis-statusbar');

modebtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modebtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    if (mode === 'gis') {
      gisToolbar.style.display = 'flex';
      gisStatusbar.style.display = 'flex';
      document.getElementById('sidebar-monitor-content').style.display = 'none';
      document.getElementById('sidebar-gis-content').style.display = 'block';
      initWhatifPanel();
    } else {
      gisToolbar.style.display = 'none';
      gisStatusbar.style.display = 'none';
      setActiveTool('select');
      document.getElementById('sidebar-monitor-content').style.display = 'block';
      document.getElementById('sidebar-gis-content').style.display = 'none';
    }
  });
});

// ── GIS TOOLS ──
let activeTool = 'select';
let drawnObjects = [];
let currentPoints = [];
let isDrawing = false;

// ── WHAT-IF STATE ──
let whatifState = 'empty'; // 'empty' | 'ready' | 'running' | 'result'
let whatifResult = null;

const toolHints = {
  'select': 'Kliknij obiekt na mapie, aby go zaznacz\u0107',
  'line': 'Kliknij aby doda\u0107 punkt \u00b7 Dwuklik aby zako\u0144czy\u0107 lini\u0119',
  'polygon': 'Kliknij aby doda\u0107 punkt \u00b7 Dwuklik aby zamkn\u0105\u0107 poligon',
  'circle': 'Kliknij \u015brodek, przeci\u0105gnij aby okre\u015bli\u0107 promie\u0144',
  'marker': 'Kliknij na mapie aby doda\u0107 marker',
  'measure-dist': 'Kliknij punkty do pomiaru odleg\u0142o\u015bci \u00b7 Dwuklik aby zako\u0144czy\u0107',
  'measure-area': 'Kliknij punkty do pomiaru powierzchni \u00b7 Dwuklik aby zako\u0144czy\u0107',
  'delete': 'Kliknij obiekt aby go usun\u0105\u0107',
  'undo': 'Cofa ostatni\u0105 operacj\u0119'
};

const toolNames = {
  'select': 'Zaznaczenie', 'line': 'Rysuj lini\u0119', 'polygon': 'Rysuj poligon',
  'circle': 'Rysuj okr\u0105g', 'marker': 'Dodaj marker',
  'measure-dist': 'Pomiar odleg\u0142o\u015bci', 'measure-area': 'Pomiar powierzchni',
  'delete': 'Usu\u0144', 'undo': 'Cofnij'
};

function setActiveTool(toolId) {
  activeTool = toolId;
  document.querySelectorAll('.gis-tool').forEach(t => t.classList.remove('active'));
  const btn = document.querySelector(`.gis-tool[data-tool="${toolId}"]`);
  if (btn) btn.classList.add('active');
  
  const canvas = document.querySelector('#monitor-map-canvas, #map-canvas, canvas');
  if (canvas) {
    canvas.style.cursor = ['line','polygon','circle','marker','measure-dist','measure-area'].includes(toolId) 
      ? 'crosshair' : 'default';
  }
  
  document.getElementById('status-tool-name').textContent = toolNames[toolId] || toolId;
  document.getElementById('status-hint').textContent = toolHints[toolId] || '';
  
  if (toolId === 'undo') {
    if (drawnObjects.length > 0) drawnObjects.pop();
    document.getElementById('status-obj-count').textContent = drawnObjects.length;
    updateGisSidebarList();
    updateWhatifPanel();
    setActiveTool('select');
    redrawGisObjects();
    return;
  }
  
  isDrawing = false;
  currentPoints = [];
}

document.querySelectorAll('.gis-tool').forEach(btn => {
  btn.addEventListener('click', () => setActiveTool(btn.dataset.tool));
});

// Canvas click handler for drawing
function initGisCanvasHandlers() {
  const canvas = document.querySelector('#monitor-map-canvas, #map-canvas, canvas');
  if (!canvas) return;
  
  canvas.addEventListener('click', (e) => {
    if (!['line','polygon','circle','marker','measure-dist','measure-area'].includes(activeTool)) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === 'marker') {
      drawnObjects.push({ type: 'marker', x, y, label: 'Marker ' + (drawnObjects.length + 1) });
      document.getElementById('status-obj-count').textContent = drawnObjects.length;
      updateGisSidebarList();
      updateWhatifPanel();
      redrawGisObjects();
      return;
    }
    
    if (!isDrawing) { isDrawing = true; currentPoints = []; }
    currentPoints.push({ x, y });
    redrawGisObjects();
    updateMeasurement();
  });
  
  canvas.addEventListener('dblclick', (e) => {
    if (currentPoints.length < 2) return;
    
    const type = activeTool.startsWith('measure') ? activeTool : activeTool;
    const obj = { type, points: [...currentPoints] };
    
    if (activeTool === 'measure-dist') {
      obj.length = calculateLength(currentPoints);
    } else if (activeTool === 'measure-area' || activeTool === 'polygon') {
      obj.area = calculateArea(currentPoints);
    }
    
    drawnObjects.push(obj);
    document.getElementById('status-obj-count').textContent = drawnObjects.length;
    updateGisSidebarList();
    updateWhatifPanel();
    isDrawing = false;
    currentPoints = [];
    document.getElementById('status-measure').style.display = 'none';
    redrawGisObjects();
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || currentPoints.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Show preview line
    redrawGisObjects([...currentPoints, { x, y }]);
    updateMeasurement([...currentPoints, { x, y }]);
  });
}

function calculateLength(points) {
  // Approximate: 1 canvas pixel \u2248 10m (wireframe scale)
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i-1].x;
    const dy = points[i].y - points[i-1].y;
    total += Math.sqrt(dx*dx + dy*dy);
  }
  return (total * 10 / 1000).toFixed(2); // km
}

function calculateArea(points) {
  // Shoelace formula, approximate
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2 * 100 / 1000000).toFixed(4); // km\u00b2
}

function updateMeasurement(pts) {
  const points = pts || currentPoints;
  if (points.length < 2) return;
  const el = document.getElementById('status-measure');
  if (activeTool === 'measure-dist' || activeTool === 'line') {
    el.style.display = 'inline';
    el.textContent = `D\u0142ugo\u015b\u0107: ${calculateLength(points)} km`;
  } else if (activeTool === 'measure-area' || activeTool === 'polygon') {
    el.style.display = 'inline';
    el.textContent = `Powierzchnia: ${calculateArea(points)} km\u00b2`;
  }
}

function redrawGisObjects(previewPoints) {
  // Get the existing canvas and redraw GIS objects on top
  const canvas = document.querySelector('#monitor-map-canvas, #map-canvas, canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  
  // Draw all saved objects
  drawnObjects.forEach(obj => {
    ctx.save();
    ctx.scale(dpr, dpr);
    if (obj.type === 'marker') {
      ctx.fillStyle = '#EAB945';
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '10px Inter';
      ctx.fillText(obj.label, obj.x + 8, obj.y + 4);
    } else if (obj.points && obj.points.length >= 2) {
      ctx.strokeStyle = obj.type === 'measure-area' || obj.type === 'polygon' ? '#4F98A3' : '#EAB945';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(obj.points[0].x, obj.points[0].y);
      obj.points.forEach(p => ctx.lineTo(p.x, p.y));
      if (obj.type === 'polygon' || obj.type === 'measure-area') {
        ctx.closePath();
        ctx.fillStyle = 'rgba(79,152,163,0.1)';
        ctx.fill();
      }
      ctx.stroke();
      // Show measurement label
      if (obj.length) {
        const mid = obj.points[Math.floor(obj.points.length/2)];
        ctx.fillStyle = '#EAB945';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText(obj.length + ' km', mid.x + 4, mid.y - 4);
      }
      if (obj.area) {
        const mid = obj.points[Math.floor(obj.points.length/2)];
        ctx.fillStyle = '#4F98A3';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText(obj.area + ' km\u00b2', mid.x + 4, mid.y - 4);
      }
    }
    ctx.restore();
  });
  
  // Draw what-if result overlay
  if (whatifResult) {
    const w2 = canvas.clientWidth;
    const h2 = canvas.clientHeight;
    ctx.save();
    ctx.scale(dpr, dpr);
    // Purple tint polygon centered on map
    const cx = w2 * 0.45;
    const cy = h2 * 0.50;
    const rx = w2 * 0.18;
    const ry = h2 * 0.20;
    const overlayPts = [
      { x: cx - rx * 0.6, y: cy - ry },
      { x: cx + rx * 0.8, y: cy - ry * 0.7 },
      { x: cx + rx,       y: cy + ry * 0.4 },
      { x: cx + rx * 0.3, y: cy + ry },
      { x: cx - rx * 0.8, y: cy + ry * 0.6 },
      { x: cx - rx,       y: cy - ry * 0.2 }
    ];
    ctx.beginPath();
    ctx.moveTo(overlayPts[0].x, overlayPts[0].y);
    overlayPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = 'rgba(155,127,212,0.25)';
    ctx.fill();
    ctx.strokeStyle = '#9B7FD4';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Label
    ctx.font = 'bold 13px \'JetBrains Mono\', monospace';
    ctx.fillStyle = '#C8A8FF';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.fillText('WHAT-IF: 1.8 km\u00b2', cx, cy - ry - 8);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    ctx.restore();
  }

  // Draw preview (in-progress drawing)
  const pts = previewPoints || (isDrawing ? currentPoints : null);
  if (pts && pts.length >= 2) {
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#4F98A380';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    ctx.restore();
  }
}

// ── GIS SIDEBAR LIST ──
function updateGisSidebarList() {
  const list = document.getElementById('gis-objects-list');
  const countEl = document.getElementById('gis-obj-panel-count');
  if (!list) return;
  
  if (drawnObjects.length === 0) {
    list.innerHTML = `
      <div class="gis-empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" stroke-width="1.5"><polygon points="12,2 22,20 2,20"/></svg>
        <p>Brak narysowanych obiekt\u00f3w</p>
        <p class="gis-empty-hint">U\u017cyj narz\u0119dzi aby rysowa\u0107 na mapie</p>
      </div>`;
    if (countEl) countEl.textContent = '0';
    return;
  }
  
  const typeLabels = { line: 'Linia', polygon: 'Poligon', marker: 'Marker', circle: 'Okr\u0105g', 'measure-dist': 'Pomiar', 'measure-area': 'Powierzchnia' };
  
  list.innerHTML = drawnObjects.map((obj, i) => `
    <div class="gis-obj-item">
      <span class="gis-obj-icon">${obj.type === 'marker' ? '\uD83D\uDCCD' : obj.type === 'polygon' ? '\u2B21' : obj.type === 'circle' ? '\u25CB' : '\u2014'}</span>
      <div class="gis-obj-info">
        <span class="gis-obj-name">${typeLabels[obj.type] || obj.type} ${i + 1}</span>
        ${obj.length ? `<span class="gis-obj-meta">${obj.length} km</span>` : ''}
        ${obj.area ? `<span class="gis-obj-meta">${obj.area} km\u00b2</span>` : ''}
      </div>
      <button class="gis-obj-delete" onclick="drawnObjects.splice(${i},1); updateGisSidebarList(); document.getElementById('status-obj-count').textContent = drawnObjects.length; updateWhatifPanel(); redrawGisObjects();" title="Usu\u0144">\u00d7</button>
    </div>
  `).join('');
  
  if (countEl) countEl.textContent = drawnObjects.length;
}

// Init after map is drawn
setTimeout(initGisCanvasHandlers, 500);

// ══════════════════════════════════════════════
// ── WHAT-IF PANEL ──
// ══════════════════════════════════════════════

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function renderWhatifPanel() {
  const content = document.getElementById('whatif-content');
  if (!content) return;

  if (whatifState === 'empty') {
    content.innerHTML = `
      <div class="whatif-empty">
        <div class="whatif-empty-icon">✏</div>
        <div class="whatif-empty-text">Narysuj geometrię na mapie aby uruchomić analizę</div>
        <div class="whatif-empty-hint">Poligon = zbiornik retencyjny · Linia = wał / bariera</div>
      </div>`;
    return;
  }

  if (whatifState === 'ready') {
    content.innerHTML = `
      <div class="whatif-form">
        <div class="whatif-field">
          <label>Typ analizy</label>
          <select id="wf-type">
            <option value="flood">Powódź / zalanie</option>
            <option value="retention">Zbiornik retencyjny</option>
            <option value="levee">Wał przeciwpowodziowy</option>
            <option value="barrier">Bariera drogowa</option>
          </select>
        </div>
        <div class="whatif-field">
          <label>Scenariusz bazowy</label>
          <select id="wf-base">
            <option value="evtALL">Wszystkie aktywne (syntetyczny)</option>
            <option value="EVT-2026-04-003">EVT-2026-04-003 — Flood Risk</option>
            <option value="new">Nowe zdarzenie (bez bazy)</option>
          </select>
        </div>
        <div class="whatif-field">
          <label>Parametry</label>
          <div class="whatif-params">
            <div class="wf-param-row">
              <span class="wf-param-label">Zmiana przepływu</span>
              <input type="range" id="wf-flow" min="-50" max="100" value="0"
                oninput="document.getElementById('wf-flow-val').textContent = this.value + '%'">
              <span id="wf-flow-val">0%</span>
            </div>
            <div class="wf-param-row">
              <span class="wf-param-label">Czas retencji</span>
              <input type="number" id="wf-retention" placeholder="h" min="1" max="72" value="24" style="width:60px">
              <span>h</span>
            </div>
          </div>
        </div>
        <button class="btn-primary btn-sm whatif-run-btn" id="wf-run-btn" onclick="runAdHocWhatif()">
          Oblicz →
        </button>
      </div>`;
    return;
  }

  if (whatifState === 'running') {
    content.innerHTML = `
      <div class="whatif-running">
        <div class="wf-spinner"></div>
        <div class="wf-step active" id="wf-step1">Analiza geometrii...</div>
        <div class="wf-step" id="wf-step2">Obliczanie zasięgu...</div>
        <div class="wf-step" id="wf-step3">Ocena konsekwencji...</div>
      </div>`;
    return;
  }

  if (whatifState === 'result' && whatifResult) {
    const now = new Date();
    const ts = now.getFullYear() + '-'
      + String(now.getMonth()+1).padStart(2,'0') + '-'
      + String(now.getDate()).padStart(2,'0') + ' '
      + String(now.getHours()).padStart(2,'0') + ':'
      + String(now.getMinutes()).padStart(2,'0');
    content.innerHTML = `
      <div class="whatif-result">
        <div class="wf-result-header">
          <span class="wf-result-badge">WYNIK AD-HOC</span>
          <span class="wf-result-ts">${ts}</span>
        </div>
        <div class="wf-result-metrics">
          <div class="wf-metric">
            <span class="wf-m-label">Strefa zagrożenia</span>
            <span class="wf-m-val">${whatifResult.zone_km2} km²</span>
          </div>
          <div class="wf-metric">
            <span class="wf-m-label">Budynki</span>
            <span class="wf-m-val">${whatifResult.buildings} <span class="wf-delta red">+${whatifResult.buildings}</span></span>
          </div>
          <div class="wf-metric">
            <span class="wf-m-label">Redukcja vs bazowy</span>
            <span class="wf-m-val green">-${whatifResult.reduction_pct}%</span>
          </div>
        </div>
        <div class="wf-result-actions">
          <button class="btn-ghost btn-sm" onclick="clearWhatifResult()">← Nowa analiza</button>
          <button class="btn-outline btn-sm" onclick="promoteToThreat()">Utwórz zdarzenie →</button>
        </div>
      </div>`;
    return;
  }
}

function updateWhatifPanel() {
  const hasObjects = drawnObjects.length > 0;
  // Determine new state based on objects and current state
  const newState = hasObjects
    ? (whatifState === 'running' || whatifState === 'result' ? whatifState : 'ready')
    : 'empty';

  if (newState !== whatifState) {
    whatifState = newState;
    renderWhatifPanel();
  }

  // Update status badge
  const statusEl = document.getElementById('whatif-status');
  if (statusEl) {
    const labels = {
      empty:   'niegotowa',
      ready:   'gotowa',
      running: '⟳ oblicza...',
      result:  '✓ wynik'
    };
    statusEl.textContent = labels[whatifState] || whatifState;
    statusEl.className = 'panel-count'
      + (whatifState === 'result'  ? ' panel-count-success' : '')
      + (whatifState === 'ready'   ? ' panel-count-active'  : '');
  }
}

async function runAdHocWhatif() {
  whatifState = 'running';
  renderWhatifPanel();
  updateWhatifPanel();

  // Step 1
  await sleep(900);
  const step1 = document.getElementById('wf-step1');
  const step2 = document.getElementById('wf-step2');
  if (step1) { step1.classList.remove('active'); step1.classList.add('done'); }
  if (step2) { step2.classList.add('active'); }

  // Step 2
  await sleep(800);
  const step2b = document.getElementById('wf-step2');
  const step3  = document.getElementById('wf-step3');
  if (step2b) { step2b.classList.remove('active'); step2b.classList.add('done'); }
  if (step3)  { step3.classList.add('active'); }

  // Step 3
  await sleep(700);

  whatifResult = { zone_km2: 1.8, buildings: 31, reduction_pct: 35 };
  whatifState = 'result';
  renderWhatifPanel();
  updateWhatifPanel();
  redrawGisObjects();
}

function clearWhatifResult() {
  whatifResult = null;
  whatifState = drawnObjects.length > 0 ? 'ready' : 'empty';
  renderWhatifPanel();
  updateWhatifPanel();
  redrawGisObjects();
}

function promoteToThreat() {
  window.location.href = 'threat-detail.html?mode=new&from=monitor';
}

function initWhatifPanel() {
  // Reset to a clean state each time GIS mode is activated
  // but preserve result if there is one (user may switch modes and back)
  if (whatifState !== 'result') {
    whatifState = drawnObjects.length > 0 ? 'ready' : 'empty';
  }
  renderWhatifPanel();
  updateWhatifPanel();
}
