/* ═══════════════════════════════════════════
   THREAT DETAIL — Air Quality Risk (Dispersion)
   Same components, different View Schema
   ═══════════════════════════════════════════ */

// ── VIEW SCHEMA ──

const VIEW_SCHEMA = {
  event_id: 'EVT-2026-04-021',
  threat_type: 'Air Quality Risk',
  template: 'dispersion',
  severity_levels: [
    { key: 'moderate',   label: 'Umiarkowany', color: '#EAB945' },
    { key: 'unhealthy',  label: 'Niezdrowy',   color: '#E08644' },
    { key: 'hazardous',  label: 'Niebezpieczny', color: '#D95050' }
  ],
  current_severity: 'unhealthy',
  identify_key: 'Wrocław — Centrum',
  metric_primary: { field: 'aqi', value: 178, unit: 'AQI', chart: 'aqi_timeseries' },
  metric_secondary: { field: 'pm25', value: 67, unit: 'µg/m³' },
  consequence_view: {
    map_type: 'dispersion_zone',
    source_point: { x: 0.5, y: 0.45 },
    rings: [
      { radius_km: 0.5, severity: 'hazardous', label: 'Strefa krytyczna' },
      { radius_km: 2.0, severity: 'unhealthy', label: 'Strefa narażenia' },
      { radius_km: 5.0, severity: 'moderate',  label: 'Strefa monitorowania' }
    ],
    asset_layers: ['hospitals', 'schools', 'population_density']
  },
  what_if_params: [
    { name: 'wind_speed_ms',   label: 'Prędkość wiatru',   type: 'range', min: 0, max: 20, default: 4,  unit: 'm/s' },
    { name: 'wind_direction',  label: 'Kierunek wiatru',   type: 'select', options: ['N','NE','E','SE','S','SW','W','NW'], default: 'SW' },
    { name: 'emission_factor', label: 'Redukcja emisji',   type: 'range', min: -100, max: 0, default: 0, unit: '%' }
  ],
  tasks_template: [
    { id: 't1', icon: '📢', title: 'Wydaj ostrzeżenie publiczne',   desc: 'Obszar: Wrocław Centrum, Śródmieście · ~45 000 mieszkańców', hasGeometry: true },
    { id: 't2', icon: '🏫', title: 'Zamknij szkoły i przedszkola', desc: '7 placówek w strefie krytycznej i narażenia', hasGeometry: false },
    { id: 't3', icon: '🏥', title: 'Przygotuj placówki medyczne',  desc: 'Szpital Miejski, Klinika Pulmonologii — zwiększyć dyżury', hasGeometry: false },
    { id: 't4', icon: '🚗', title: 'Ogranicz ruch pojazdów',       desc: 'Strefa centrum — zakaz wjazdu pojazdów Diesel od godz. 20:00', hasGeometry: true }
  ]
};


// ── SCENARIO RESULTS ──

const SCENARIO_RESULTS = {
  wind: {
    aqi: 134, delta_aqi: -44, coverage_pct: 65, population: '~29 000'
  },
  emission: {
    aqi: 156, delta_aqi: -22, coverage_pct: 85, population: '~38 000'
  }
};


// ── TASK DATA (from View Schema) ──

const TASK_DATA = [
  { id: 't1', icon: '📢', title: 'Wydaj ostrzeżenie publiczne',
    desc: 'Obszar: Wrocław Centrum, Śródmieście · ~45 000 mieszkańców', hasGeometry: true, checked: false },
  { id: 't2', icon: '🏫', title: 'Zamknij szkoły i przedszkola',
    desc: '7 placówek w strefie krytycznej i narażenia', hasGeometry: false, checked: false },
  { id: 't3', icon: '🏥', title: 'Przygotuj placówki medyczne',
    desc: 'Szpital Miejski, Klinika Pulmonologii — zwiększyć dyżury', hasGeometry: false, checked: false },
  { id: 't4', icon: '🚗', title: 'Ogranicz ruch pojazdów',
    desc: 'Strefa centrum — zakaz wjazdu pojazdów Diesel od godz. 20:00', hasGeometry: true, checked: false }
];


// ── MAP DATA: Dispersion zones ──

const SOURCE_POINT = { x: 0.5, y: 0.45 };

const RINGS = [
  { radius: 60,  color: 'rgba(217,80,80,0.35)',  border: '#D95050', label: 'Strefa krytyczna 0.5km' },
  { radius: 180, color: 'rgba(224,134,68,0.20)',  border: '#E08644', label: 'Strefa narażenia 2km' },
  { radius: 380, color: 'rgba(234,185,69,0.08)',  border: '#EAB945', label: 'Strefa monitorowania 5km' }
];

// Shifted rings for wind scenario (offset SW)
const RINGS_SHIFTED = [
  { radius: 55,  color: 'rgba(217,80,80,0.30)',  border: '#D95050', label: 'Strefa krytyczna' },
  { radius: 160, color: 'rgba(224,134,68,0.18)',  border: '#E08644', label: 'Strefa narażenia' },
  { radius: 340, color: 'rgba(234,185,69,0.06)',  border: '#EAB945', label: 'Strefa monitorowania' }
];

const SCHOOLS = [
  { x: 0.44, y: 0.40 },
  { x: 0.52, y: 0.38 },
  { x: 0.48, y: 0.50 },
  { x: 0.55, y: 0.48 },
  { x: 0.42, y: 0.46 }
];

const HOSPITALS = [
  { x: 0.62, y: 0.55 },
  { x: 0.38, y: 0.58 }
];

// Population density dots (more dense near center)
const DENSITY_DOTS = [];
(function generateDensityDots() {
  const cx = 0.5, cy = 0.45;
  const rng = (seed) => {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  };
  const rand = rng(42);
  for (let i = 0; i < 200; i++) {
    const angle = rand() * Math.PI * 2;
    const r = Math.pow(rand(), 0.5) * 0.35;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.8;
    if (x > 0.05 && x < 0.95 && y > 0.05 && y < 0.95) {
      DENSITY_DOTS.push({ x, y });
    }
  }
})();

// City grid (streets)
const CITY_STREETS_H = [0.18, 0.28, 0.35, 0.45, 0.52, 0.62, 0.72, 0.82];
const CITY_STREETS_V = [0.12, 0.22, 0.30, 0.38, 0.46, 0.54, 0.62, 0.70, 0.80, 0.90];

// Plan geometries
const WARNING_POLYGON = [
  [0.35, 0.30], [0.65, 0.30], [0.68, 0.45], [0.65, 0.60],
  [0.35, 0.60], [0.32, 0.45]
];

const VEHICLE_RESTRICTION = [
  { from: [0.38, 0.35], to: [0.62, 0.35] },
  { from: [0.62, 0.35], to: [0.62, 0.55] },
  { from: [0.62, 0.55], to: [0.38, 0.55] },
  { from: [0.38, 0.55], to: [0.38, 0.35] }
];


// ── STATE ──

const state = {
  currentPanel: 'situation',
  scenariosComputed: { wind: false, emission: false },
  lastComputedScenario: null,
  scenarioBasis: null,
  checkedTasks: new Set(),
  layers: { dispersion: true, hospitals: true, schools: true, density: true },
  mapView: 'situation',
  activeTool: 'select',
  drawingMode: false,
  drawingTaskId: null,
  drawnPoints: [],
  userGeometries: {},
  activeScenarioOverlay: null
};


// ═══════════════════════════════════════════
// PANEL MANAGER
// ═══════════════════════════════════════════

const panelManager = {
  switchPanel(name) {
    state.currentPanel = name;

    document.querySelectorAll('.panel-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.panel === name);
    });

    document.querySelectorAll('.panel-content').forEach(el => {
      el.classList.toggle('active', el.id === `panel-${name}`);
    });

    this.updateModeBadge(name);
    mapManager.updateForPanel(name);

    const footer = document.getElementById('decision-footer');
    if (name === 'plan') {
      footer.classList.remove('hidden');
    } else {
      footer.classList.add('hidden');
    }

    if (name === 'plan') {
      taskManager.renderTasks();
    }

    const panelContent = document.getElementById(`panel-${name}`);
    if (panelContent) panelContent.scrollTop = 0;
  },

  updateModeBadge(name) {
    const badge = document.getElementById('mode-badge');
    badge.className = 'mode-badge';
    const icon = badge.querySelector('.mode-icon');
    const label = badge.querySelector('.mode-label');

    switch (name) {
      case 'situation':
        badge.classList.add('mode-situation');
        icon.textContent = '📋';
        label.textContent = 'Sytuacja';
        break;
      case 'simulation':
        badge.classList.add('mode-simulation');
        icon.textContent = '⚡';
        label.textContent = 'Symulacja';
        break;
      case 'plan':
        badge.classList.add('mode-plan');
        icon.textContent = '✅';
        label.textContent = 'Plan działań';
        break;
    }
  }
};


// ═══════════════════════════════════════════
// MAP MANAGER — Dispersion Zone Renderer
// ═══════════════════════════════════════════

const mapManager = {
  canvas: null,
  ctx: null,
  w: 0,
  h: 0,
  pulsePhase: 0,
  animFrame: null,

  init() {
    this.canvas = document.getElementById('map-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('dblclick', (e) => this.handleDblClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.animate();
  },

  resize() {
    const wrap = this.canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = this.w * window.devicePixelRatio;
    this.canvas.height = this.h * window.devicePixelRatio;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  },

  animate() {
    this.pulsePhase += 0.03;
    this.draw();
    this.animFrame = requestAnimationFrame(() => this.animate());
  },

  draw() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;
    if (!w || !h) return;

    // Clear
    ctx.fillStyle = '#0C0D10';
    ctx.fillRect(0, 0, w, h);

    const view = state.mapView;
    const cx = SOURCE_POINT.x * w;
    const cy = SOURCE_POINT.y * h;

    // City grid streets
    ctx.strokeStyle = '#1a1b25';
    ctx.lineWidth = 0.5;
    CITY_STREETS_H.forEach(yf => {
      ctx.beginPath();
      ctx.moveTo(0, yf * h);
      ctx.lineTo(w, yf * h);
      ctx.stroke();
    });
    CITY_STREETS_V.forEach(xf => {
      ctx.beginPath();
      ctx.moveTo(xf * w, 0);
      ctx.lineTo(xf * w, h);
      ctx.stroke();
    });

    // Additional irregular street segments for realism
    ctx.strokeStyle = '#191a24';
    ctx.lineWidth = 0.3;
    const irregulars = [
      [[0.15, 0.20], [0.35, 0.22]], [[0.55, 0.30], [0.75, 0.28]],
      [[0.25, 0.40], [0.25, 0.60]], [[0.75, 0.38], [0.75, 0.58]],
      [[0.40, 0.65], [0.60, 0.68]], [[0.20, 0.50], [0.40, 0.48]],
      [[0.60, 0.50], [0.80, 0.52]], [[0.33, 0.25], [0.33, 0.55]],
      [[0.67, 0.25], [0.67, 0.55]], [[0.45, 0.20], [0.55, 0.20]]
    ];
    irregulars.forEach(seg => {
      ctx.beginPath();
      ctx.moveTo(seg[0][0] * w, seg[0][1] * h);
      ctx.lineTo(seg[1][0] * w, seg[1][1] * h);
      ctx.stroke();
    });

    // Determine which rings to draw
    if (state.layers.dispersion) {
      if (view === 'scenario' && state.activeScenarioOverlay === 'wind') {
        // Shifted rings (offset SW)
        const offsetX = -0.06 * w;
        const offsetY = 0.05 * h;
        // Draw baseline rings dimmer
        this.drawRings(ctx, cx, cy, RINGS, 0.4);
        // Draw shifted rings
        this.drawRings(ctx, cx + offsetX, cy + offsetY, RINGS_SHIFTED, 1.0);
      } else if (view === 'scenario' && state.activeScenarioOverlay === 'emission') {
        // Slightly smaller rings (emission reduction)
        const reduced = RINGS.map(r => ({ ...r, radius: r.radius * 0.85 }));
        this.drawRings(ctx, cx, cy, RINGS, 0.4);
        this.drawRings(ctx, cx, cy, reduced, 1.0);
      } else if (view === 'plan') {
        // Baseline rings in plan view (dimmed)
        this.drawRings(ctx, cx, cy, RINGS, 0.5);

        // Warning polygon overlay
        ctx.beginPath();
        WARNING_POLYGON.forEach((pt, i) => {
          const px = pt[0] * w;
          const py = pt[1] * h;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(217,80,80,0.08)';
        ctx.fill();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#D95050';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Vehicle restriction zone (crossed streets)
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        VEHICLE_RESTRICTION.forEach(seg => {
          ctx.beginPath();
          ctx.moveTo(seg.from[0] * w, seg.from[1] * h);
          ctx.lineTo(seg.to[0] * w, seg.to[1] * h);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // X markers on roads in restriction zone
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        const xMarkers = [
          { x: 0.42, y: 0.35 }, { x: 0.52, y: 0.35 },
          { x: 0.62, y: 0.45 }, { x: 0.50, y: 0.55 }
        ];
        xMarkers.forEach(pt => {
          const px = pt.x * w, py = pt.y * h, s = 5;
          ctx.beginPath();
          ctx.moveTo(px - s, py - s); ctx.lineTo(px + s, py + s);
          ctx.moveTo(px + s, py - s); ctx.lineTo(px - s, py + s);
          ctx.stroke();
        });

        // User drawn geometries
        Object.values(state.userGeometries).forEach(geo => {
          if (geo.length > 1) {
            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = '#EAB945';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            geo.forEach((pt, i) => {
              i === 0 ? ctx.moveTo(pt[0] * w, pt[1] * h) : ctx.lineTo(pt[0] * w, pt[1] * h);
            });
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      } else {
        // Default situation view — full rings
        this.drawRings(ctx, cx, cy, RINGS, 1.0);
      }
    }

    // Population density dots
    if (state.layers.density) {
      DENSITY_DOTS.forEach(dot => {
        const dist = Math.sqrt(Math.pow(dot.x - SOURCE_POINT.x, 2) + Math.pow(dot.y - SOURCE_POINT.y, 2));
        const alpha = Math.max(0.05, 0.3 - dist * 0.6);
        ctx.fillStyle = `rgba(200,200,220,${alpha})`;
        ctx.fillRect(dot.x * w, dot.y * h, 1.5, 1.5);
      });
    }

    // School icons
    if (state.layers.schools) {
      SCHOOLS.forEach(s => {
        const px = s.x * w;
        const py = s.y * h;
        // Small square with dark fill
        ctx.fillStyle = '#E08644';
        ctx.fillRect(px - 4, py - 4, 8, 8);
        ctx.strokeStyle = '#0C0D10';
        ctx.lineWidth = 1;
        ctx.strokeRect(px - 4, py - 4, 8, 8);
        // Label
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = '#E08644';
        ctx.fillText('🏫', px - 6, py - 8);
      });
    }

    // Hospital icons
    if (state.layers.hospitals) {
      HOSPITALS.forEach(h_pt => {
        const px = h_pt.x * w;
        const py = h_pt.y * h;
        // Cross
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - 5, py); ctx.lineTo(px + 5, py);
        ctx.moveTo(px, py - 5); ctx.lineTo(px, py + 5);
        ctx.stroke();
        // Outline circle
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#EF444480';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Label
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = '#EF4444';
        ctx.fillText('🏥', px - 6, py - 12);
      });
    }

    // Source marker: pulsing red circle
    const pulse = 0.6 + 0.4 * Math.sin(this.pulsePhase);
    const pulseR = 10 + 4 * Math.sin(this.pulsePhase);

    // Outer glow
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR + 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(217,80,80,${0.12 * pulse})`;
    ctx.fill();

    // Middle ring
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(217,80,80,${0.35 * pulse})`;
    ctx.fill();

    // Inner dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#D95050';
    ctx.fill();

    // Source label
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#E2E4EA';
    ctx.fillText('Źródło emisji', cx + 14, cy + 4);

    // Wind arrow (top-right)
    this.drawWindArrow(ctx, w, h);

    // Scale bar (bottom-right)
    this.drawScaleBar(ctx, w, h);

    // Drawing in-progress line
    if (state.drawingMode && state.drawnPoints.length > 0) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#EAB945';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      state.drawnPoints.forEach((pt, i) => {
        i === 0 ? ctx.moveTo(pt[0] * w, pt[1] * h) : ctx.lineTo(pt[0] * w, pt[1] * h);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      state.drawnPoints.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt[0] * w, pt[1] * h, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#EAB945';
        ctx.fill();
      });
    }
  },

  drawRings(ctx, cx, cy, rings, globalAlpha) {
    // Draw from outer to inner
    for (let i = rings.length - 1; i >= 0; i--) {
      const ring = rings[i];
      ctx.globalAlpha = globalAlpha;

      // Fill
      ctx.beginPath();
      ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
      ctx.fillStyle = ring.color;
      ctx.fill();

      // Dashed border
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = ring.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // Label — position to avoid overlap with wind arrow and edge clipping
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = ring.border;
      // Place labels at bottom-left of each ring to avoid wind arrow and right edge
      const labelX = cx - ring.radius * 0.55;
      const labelY = cy + ring.radius * 0.78;
      // Only draw if within canvas bounds
      if (labelX > 5 && labelY < this.h - 30 && labelX + 150 < this.w) {
        ctx.fillText(ring.label, labelX, labelY);
      }

      ctx.globalAlpha = 1;
    }
  },

  drawWindArrow(ctx, w, h) {
    const ax = w - 70;
    const ay = 40;

    // Wind direction SW: arrow points from NE to SW
    const arrowLen = 30;
    const angle = (225) * Math.PI / 180; // SW direction

    const endX = ax + Math.cos(angle) * arrowLen;
    const endY = ay + Math.sin(angle) * arrowLen;

    // Arrow line
    ctx.strokeStyle = '#E2E4EA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Arrowhead
    const headLen = 8;
    const headAngle = Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - headAngle), endY - headLen * Math.sin(angle - headAngle));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle + headAngle), endY - headLen * Math.sin(angle + headAngle));
    ctx.stroke();

    // Label
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#8B8D9A';
    ctx.fillText('Wiatr SW 4 m/s', w - 105, ay + arrowLen + 18);
  },

  drawScaleBar(ctx, w, h) {
    const bx = w - 100;
    const by = h - 20;
    const bw = 60;

    ctx.strokeStyle = '#5A5C6A';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by);
    ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by + 4);
    ctx.moveTo(bx + bw, by - 4); ctx.lineTo(bx + bw, by + 4);
    ctx.stroke();

    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = '#5A5C6A';
    ctx.fillText('1 km', bx + bw / 2 - 12, by - 6);
  },

  updateForPanel(panel) {
    const badge = document.getElementById('map-view-badge');
    switch (panel) {
      case 'situation':
        state.mapView = 'situation';
        badge.textContent = 'Widok: strefa dyspersji';
        break;
      case 'simulation':
        if (state.activeScenarioOverlay) {
          state.mapView = 'scenario';
          badge.textContent = 'Widok: scenariusz A';
        } else {
          state.mapView = 'situation';
          badge.textContent = 'Widok: strefa dyspersji';
        }
        break;
      case 'plan':
        state.mapView = 'plan';
        badge.textContent = 'Widok: plan działań';
        break;
    }
  },

  showScenario(id) {
    state.activeScenarioOverlay = id;
    state.mapView = 'scenario';
    document.getElementById('map-view-badge').textContent = 'Widok: scenariusz A';
  },

  showPlan() {
    state.mapView = 'plan';
    document.getElementById('map-view-badge').textContent = 'Widok: plan działań';
  },

  toggleLayer(name) {
    state.layers[name] = !state.layers[name];
  },

  activateTool(tool) {
    state.activeTool = tool;
    document.querySelectorAll('.map-gis-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    if (tool === 'line' || tool === 'polygon' || tool === 'marker') {
      this.canvas.classList.add('drawing-mode');
      document.getElementById('drawing-hint').classList.remove('hidden');
    } else {
      this.canvas.classList.remove('drawing-mode');
      document.getElementById('drawing-hint').classList.add('hidden');
      if (state.drawingMode && !state.drawingTaskId) {
        state.drawingMode = false;
        state.drawnPoints = [];
      }
    }
  },

  handleClick(e) {
    const tool = state.activeTool;
    if (tool === 'select' || tool === 'measure') return;

    if (tool === 'line' || tool === 'polygon' || tool === 'marker') {
      if (!state.drawingMode) {
        state.drawingMode = true;
        state.drawnPoints = [];
      }
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / this.w;
      const y = (e.clientY - rect.top) / this.h;
      state.drawnPoints.push([x, y]);

      if (tool === 'marker') {
        this.finishDrawing();
      }
    }
  },

  handleDblClick(e) {
    if (!state.drawingMode) return;
    e.preventDefault();
    this.finishDrawing();
  },

  handleMouseMove(e) {
    // Hover effects placeholder
  },

  finishDrawing() {
    if (state.drawnPoints.length < 1) return;

    if (state.drawingTaskId) {
      state.userGeometries[state.drawingTaskId] = [...state.drawnPoints];
      const task = TASK_DATA.find(t => t.id === state.drawingTaskId);
      if (task) task.hasGeometry = true;
      state.drawingTaskId = null;
      taskManager.renderTasks();
    }

    state.drawingMode = false;
    state.drawnPoints = [];
    this.canvas.classList.remove('drawing-mode');
    document.getElementById('drawing-hint').classList.add('hidden');
    document.getElementById('map-view-badge').textContent = 'Widok: plan działań';

    this.activateTool('select');
  }
};


// ═══════════════════════════════════════════
// SCENARIO RUNNER
// ═══════════════════════════════════════════

const scenarioRunner = {
  async runScenario(type) {
    const progressSteps = [
      'Pobieranie danych meteorologicznych...',
      'Obliczanie modelu dyspersji...',
      'Analiza zasięgu oddziaływania...'
    ];

    const overlayEl = document.getElementById(`sc-overlay-${type}`);
    const overlayText = document.getElementById(`sc-overlay-text-${type}`);
    const overlayFill = document.getElementById(`sc-overlay-fill-${type}`);
    const computeBtn = document.getElementById(`btn-compute-${type}`);
    const paramsEl = document.getElementById(`sc-params-${type}`);
    const resultsEl = document.getElementById(`sc-results-${type}`);
    const statusEl = document.getElementById(`sc-status-${type}`);
    const card = document.getElementById(`scenario-${type}`);

    computeBtn.classList.add('hidden');
    overlayEl.classList.remove('hidden');

    for (let i = 0; i < progressSteps.length; i++) {
      overlayText.textContent = progressSteps[i];
      overlayFill.style.width = ((i + 1) / progressSteps.length * 100) + '%';
      await this.wait(800);
    }

    await this.wait(500);

    overlayEl.classList.add('hidden');
    overlayFill.style.width = '0%';
    paramsEl.classList.add('hidden');
    resultsEl.classList.remove('hidden');
    statusEl.textContent = '✓ obliczony';
    card.classList.add('computed');

    state.scenariosComputed[type] = true;
    state.lastComputedScenario = type;

    this.updateComparisonRow(type);
  },

  updateComparisonRow(type) {
    const row = document.getElementById('comparison-row');
    row.classList.remove('hidden');

    const results = SCENARIO_RESULTS[type];

    document.getElementById('comp-aqi').textContent = results.aqi + ' (−' + Math.abs(results.delta_aqi) + ')';
    document.getElementById('comp-population').textContent = results.population;
    document.getElementById('comp-coverage').textContent = results.coverage_pct + '%';
  },

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};


// ═══════════════════════════════════════════
// TASK MANAGER
// ═══════════════════════════════════════════

const taskManager = {
  renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';

    TASK_DATA.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.id = `task-card-${task.id}`;
      if (task.checked) card.classList.add('checked');

      const geoHtml = task.hasGeometry
        ? `<div class="task-geo"><span class="task-geo-done">📍 Geometria: ✓ narysowana</span></div>`
        : `<div class="task-geo"><button class="task-geo-btn" data-task="${task.id}">✏ Narysuj na mapie →</button></div>`;

      card.innerHTML = `
        <div class="task-checkbox" data-task="${task.id}">${task.checked ? '✓' : ''}</div>
        <div class="task-icon">${task.icon}</div>
        <div class="task-body">
          <div class="task-title-row">
            <span class="task-title">${task.title}</span>
            <button class="task-edit-btn">Edytuj</button>
          </div>
          <div class="task-desc">${task.desc}</div>
          ${geoHtml}
        </div>
      `;

      list.appendChild(card);
    });

    list.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('click', () => this.toggleTask(cb.dataset.task));
    });

    list.querySelectorAll('.task-geo-btn').forEach(btn => {
      btn.addEventListener('click', () => this.activateDrawingForTask(btn.dataset.task));
    });

    this.updateTasksCount();
  },

  toggleTask(id) {
    const task = TASK_DATA.find(t => t.id === id);
    if (task) {
      task.checked = !task.checked;
      if (task.checked) {
        state.checkedTasks.add(id);
      } else {
        state.checkedTasks.delete(id);
      }
    }
    this.renderTasks();
    this.updateApproveButton();
  },

  updateTasksCount() {
    const count = state.checkedTasks.size;
    const total = TASK_DATA.length;
    document.getElementById('tasks-count').textContent = `${count} / ${total} zadań wybranych`;
    document.getElementById('plan-count').textContent = total;
  },

  updateApproveButton() {
    const btn = document.getElementById('btn-approve');
    btn.disabled = state.checkedTasks.size === 0;
  },

  activateDrawingForTask(taskId) {
    state.drawingTaskId = taskId;
    state.drawingMode = true;
    state.drawnPoints = [];

    mapManager.activateTool('line');
    mapManager.canvas.classList.add('drawing-mode');

    const task = TASK_DATA.find(t => t.id === taskId);
    const label = task ? task.title.toLowerCase() : 'zadanie';
    document.getElementById('map-view-badge').textContent = `Rysowanie: ${label}`;
    document.getElementById('drawing-hint').classList.remove('hidden');
  },

  addTask() {
    const newId = 't' + (TASK_DATA.length + 1);
    TASK_DATA.push({
      id: newId,
      icon: '📋',
      title: 'Nowe zadanie',
      desc: 'Opis zadania...',
      hasGeometry: false,
      checked: false
    });
    this.renderTasks();
  }
};


// ═══════════════════════════════════════════
// DECISION BUILDER
// ═══════════════════════════════════════════

const decisionBuilder = {
  async approve() {
    const overlay = document.getElementById('approval-overlay');
    overlay.classList.remove('hidden');

    const steps = overlay.querySelectorAll('.approval-step');
    for (let i = 0; i < steps.length; i++) {
      steps[i].classList.add('active');
      steps[i].querySelector('.as-icon').textContent = '◎';

      await new Promise(r => setTimeout(r, 700));

      steps[i].classList.remove('active');
      steps[i].classList.add('done');
      steps[i].querySelector('.as-icon').textContent = '✓';
    }

    await new Promise(r => setTimeout(r, 1200));
    window.location.href = 'decision.html';
  }
};


// ═══════════════════════════════════════════
// AQI TIMESERIES CHART
// ═══════════════════════════════════════════

function drawTimeseries() {
  const canvas = document.getElementById('timeseries-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  const w = container.offsetWidth;
  const h = 120;
  canvas.width = w * window.devicePixelRatio;
  canvas.height = h * window.devicePixelRatio;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

  const pad = { top: 10, right: 10, bottom: 24, left: 36 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  // Background
  ctx.fillStyle = '#1C1D28';
  ctx.fillRect(0, 0, w, h);

  const yMin = 0, yMax = 220;
  const toY = v => pad.top + ch - ((v - yMin) / (yMax - yMin)) * ch;
  const toX = i => pad.left + (i / 30) * cw;

  // AQI data: T-6h to T+24h (31 points, index 6 = "now")
  const aqiData = [];
  for (let i = 0; i <= 30; i++) {
    const t = i - 6; // hours relative to now
    let v;
    if (t <= 0) {
      // Past: rising from 120
      v = 120 + (178 - 120) * ((t + 6) / 6);
    } else if (t <= 8) {
      // Rising to peak at T+8h = 195
      v = 178 + (195 - 178) * (t / 8);
    } else {
      // Declining from 195 to 90 at T+24h
      const progress = (t - 8) / 16;
      v = 195 - (195 - 90) * progress;
    }
    aqiData.push(v + Math.sin(i * 1.1) * 3);
  }

  // Colored threshold bands
  const bands = [
    { min: 0,   max: 50,  color: 'rgba(90,173,109,0.12)', label: 'Dobry' },
    { min: 50,  max: 100, color: 'rgba(234,185,69,0.10)', label: 'Umiarkowany' },
    { min: 100, max: 150, color: 'rgba(224,134,68,0.10)', label: 'Niezdr. wrażl.' },
    { min: 150, max: 220, color: 'rgba(217,80,80,0.10)',  label: 'Niezdrowy' }
  ];

  bands.forEach(band => {
    const y1 = toY(Math.min(band.max, yMax));
    const y2 = toY(Math.max(band.min, yMin));
    ctx.fillStyle = band.color;
    ctx.fillRect(pad.left, y1, cw, y2 - y1);

    // Band label on right
    ctx.font = '8px Inter, sans-serif';
    ctx.fillStyle = '#5A5C6A';
    const labelY = (y1 + y2) / 2 + 3;
    ctx.fillText(band.label, w - pad.right - ctx.measureText(band.label).width - 2, labelY);
  });

  // Threshold lines
  [50, 100, 150].forEach(thresh => {
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = '#2A2B3880';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, toY(thresh));
    ctx.lineTo(w - pad.right, toY(thresh));
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // AQI line
  ctx.strokeStyle = '#E08644';
  ctx.lineWidth = 2;
  ctx.beginPath();
  aqiData.forEach((v, i) => {
    const x = toX(i);
    const y = toY(v);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Fill under the line (subtle)
  ctx.beginPath();
  aqiData.forEach((v, i) => {
    const x = toX(i);
    const y = toY(v);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(toX(30), toY(0));
  ctx.lineTo(toX(0), toY(0));
  ctx.closePath();
  ctx.fillStyle = 'rgba(224,134,68,0.08)';
  ctx.fill();

  // Current value dot
  const nowIdx = 6;
  const nowX = toX(nowIdx);
  const nowY = toY(aqiData[nowIdx]);
  ctx.beginPath();
  ctx.arc(nowX, nowY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#E08644';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(nowX, nowY, 6, 0, Math.PI * 2);
  ctx.strokeStyle = '#E0864480';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // "Teraz" marker vertical line
  ctx.strokeStyle = '#E2E4EA60';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(nowX, pad.top);
  ctx.lineTo(nowX, h - pad.bottom);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = '#E2E4EA80';
  ctx.fillText('Teraz', nowX - 12, h - pad.bottom + 12);

  // Peak marker
  const peakIdx = 14; // T+8h
  const peakX = toX(peakIdx);
  const peakY = toY(aqiData[peakIdx]);
  ctx.beginPath();
  ctx.arc(peakX, peakY, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#D95050';
  ctx.fill();
  ctx.font = '8px JetBrains Mono, monospace';
  ctx.fillStyle = '#D95050';
  ctx.fillText('195', peakX + 6, peakY - 4);

  // X axis labels
  ctx.fillStyle = '#5A5C6A';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillText('T-6h', pad.left, h - 4);
  ctx.fillText('T+8h', toX(14) - 10, h - 4);
  ctx.fillText('T+24h', w - pad.right - 28, h - 4);

  // Y axis labels
  ctx.fillText('0', 4, toY(0) + 3);
  ctx.fillText('100', 4, toY(100) + 3);
  ctx.fillText('200', 4, toY(200) + 3);

  // Y axis title
  ctx.save();
  ctx.translate(10, pad.top + ch / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '8px Inter, sans-serif';
  ctx.fillStyle = '#5A5C6A';
  ctx.fillText('AQI', -8, 0);
  ctx.restore();
}


// ═══════════════════════════════════════════
// EVENT BINDINGS
// ═══════════════════════════════════════════

function bindEvents() {
  // Panel tabs
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      panelManager.switchPanel(tab.dataset.panel);
    });
  });

  // Layer toggles
  document.querySelectorAll('.layer-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const layer = pill.dataset.layer;
      pill.classList.toggle('active');
      mapManager.toggleLayer(layer);
    });
  });

  // GIS toolbar buttons
  document.querySelectorAll('.map-gis-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      mapManager.activateTool(btn.dataset.tool);
    });
  });

  // Undo button
  document.getElementById('btn-undo').addEventListener('click', () => {
    if (state.drawingMode && state.drawnPoints.length > 0) {
      state.drawnPoints.pop();
    }
  });

  // Wind speed slider
  const windSlider = document.getElementById('slider-wind-speed');
  const windSliderVal = document.getElementById('slider-wind-speed-val');
  windSlider.addEventListener('input', () => {
    windSliderVal.textContent = windSlider.value + ' m/s';
  });

  // Emission slider
  const emissionSlider = document.getElementById('slider-emission');
  const emissionSliderVal = document.getElementById('slider-emission-val');
  emissionSlider.addEventListener('input', () => {
    emissionSliderVal.textContent = emissionSlider.value + '%';
  });

  // Compute buttons
  document.getElementById('btn-compute-wind').addEventListener('click', () => {
    scenarioRunner.runScenario('wind');
  });

  document.getElementById('btn-compute-emission').addEventListener('click', () => {
    scenarioRunner.runScenario('emission');
  });

  // Show scenario on map buttons
  document.querySelectorAll('.sc-show-map').forEach(btn => {
    btn.addEventListener('click', () => {
      mapManager.showScenario(btn.dataset.scenario);
    });
  });

  // "Use as basis" button
  document.getElementById('btn-use-as-basis').addEventListener('click', () => {
    state.scenarioBasis = state.lastComputedScenario;
    const note = document.getElementById('plan-basis-note');
    if (state.scenarioBasis === 'wind') {
      note.textContent = 'Podstawa: Scenariusz A — zmiana wiatru';
    } else if (state.scenarioBasis === 'emission') {
      note.textContent = 'Podstawa: Scenariusz B — redukcja emisji';
    }
    panelManager.switchPanel('plan');
  });

  // Link to simulation from situation panel
  document.getElementById('link-to-simulation').addEventListener('click', () => {
    panelManager.switchPanel('simulation');
  });

  // Add task
  document.getElementById('btn-add-task').addEventListener('click', () => {
    taskManager.addTask();
  });

  // Approve button
  document.getElementById('btn-approve').addEventListener('click', () => {
    if (state.checkedTasks.size > 0) {
      decisionBuilder.approve();
    }
  });

  // Acknowledge button
  document.getElementById('btn-acknowledge').addEventListener('click', () => {
    const btn = document.getElementById('btn-acknowledge');
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg> Acknowledged';
    btn.style.borderColor = 'var(--success)';
    btn.style.color = 'var(--success)';
    btn.disabled = true;
  });
}


// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  mapManager.init();
  drawTimeseries();
  taskManager.renderTasks();
  bindEvents();
  panelManager.updateModeBadge('situation');

  window.addEventListener('resize', () => {
    drawTimeseries();
  });
});
