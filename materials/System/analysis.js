/* ═══════════════════════════════════════════
   DECERIS — Data Explorer JS
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── LAYER STATE MODEL ───
  const LAYERS = {
    flood2024:    { label: 'Powódź 2024 — Nysa Kłodzka', active: true, type: 'event', color: '#D95050' },
    flood2010:    { label: 'Powódź 2010 — Odra', active: false, type: 'event', color: '#E08644' },
    flood1997:    { label: 'Powódź 1997 — Odra', active: false, type: 'event', color: '#EAB945' },
    drought2019:  { label: 'Susza 2019 — Dolny Śląsk', active: false, type: 'event', color: '#BB653B' },
    rainfall:     { label: 'Opad roczny 2000–2024', active: true, type: 'climate', color: '#4F98A3' },
    temperature:  { label: 'Temperatura śr. 2000–2024', active: false, type: 'climate', color: '#E08644' },
    palmer:       { label: 'Indeks suszy Palmer', active: false, type: 'climate', color: '#BB653B' },
    flowQ:        { label: 'Przepływ Q10% / Q1%', active: false, type: 'climate', color: '#C74FBB' },
    rivers:       { label: 'Sieć rzeczna (MPHP)', active: true, type: 'infra', color: '#4F98A3' },
    buildings:    { label: 'Budynki BDOT10k', active: true, type: 'infra', color: '#3B82F6' },
    reservoirs:   { label: 'Zbiorniki retencyjne', active: false, type: 'infra', color: '#5AAD6D' },
    levees:       { label: 'Wały przeciwpowodziowe', active: false, type: 'infra', color: '#EAB945' },
  };

  let currentYear = 2024;

  // ─── LAYER TOGGLE ───
  const layerItems = document.querySelectorAll('.layer-item[data-layer]');
  const layerCountEl = document.getElementById('layer-count');

  function updateLayerCount() {
    const count = Object.values(LAYERS).filter(l => l.active).length;
    if (layerCountEl) layerCountEl.textContent = count + ' aktywn' + (count === 1 ? 'a' : count < 5 ? 'e' : 'ych');
  }

  function updateLayerItem(el, active) {
    const layer = el.dataset.layer;
    if (!LAYERS[layer]) return;
    LAYERS[layer].active = active;

    if (active) {
      el.classList.add('active');
      // Replace dot and check
      const dot = el.querySelector('.layer-dot-inactive, .layer-dot-active');
      if (dot) { dot.className = 'layer-dot-active'; }
      const checkEmpty = el.querySelector('.layer-check-empty');
      if (checkEmpty) {
        checkEmpty.className = 'layer-check';
        checkEmpty.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>';
      }
    } else {
      el.classList.remove('active');
      const dot = el.querySelector('.layer-dot-inactive, .layer-dot-active');
      if (dot) { dot.className = 'layer-dot-inactive'; }
      const check = el.querySelector('.layer-check');
      if (check) {
        check.className = 'layer-check-empty';
        check.innerHTML = '';
      }
    }

    updateLayerCount();
    updateMapLayerToggles();
    drawMap();
    updateComparisonNote();
  }

  layerItems.forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.layer-show-btn')) return;
      const layer = el.dataset.layer;
      updateLayerItem(el, !LAYERS[layer].active);
    });
  });

  // Show buttons — activate and zoom
  document.querySelectorAll('.layer-show-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = btn.closest('.layer-item');
      const layer = item.dataset.layer;
      if (!LAYERS[layer].active) {
        updateLayerItem(item, true);
      }
    });
  });

  // ─── SECTION COLLAPSE ───
  document.querySelectorAll('.layer-section-header').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('.layer-section');
      section.classList.toggle('collapsed');
    });
  });

  // ─── MAP LAYER TOGGLES (above map) ───
  const togglesContainer = document.getElementById('map-layer-toggles');

  function updateMapLayerToggles() {
    if (!togglesContainer) return;
    togglesContainer.innerHTML = '';
    Object.entries(LAYERS).forEach(([key, layer]) => {
      if (layer.active) {
        const btn = document.createElement('button');
        btn.className = 'btn-ghost btn-sm layer-active';
        btn.dataset.maplayer = key;
        // Shorten label
        const shortLabel = layer.label.split('—')[0].trim().replace(/\s*\(.*\)/, '').substring(0, 24);
        btn.textContent = shortLabel;
        btn.addEventListener('click', () => {
          const el = document.querySelector(`.layer-item[data-layer="${key}"]`);
          if (el) updateLayerItem(el, false);
        });
        togglesContainer.appendChild(btn);
      }
    });
  }

  // ─── COMPARISON NOTE ───
  function updateComparisonNote() {
    const note = document.getElementById('comparison-note');
    if (!note) return;
    // Show if multiple event layers are active
    const activeEvents = Object.entries(LAYERS).filter(([, l]) => l.active && l.type === 'event');
    note.style.display = activeEvents.length >= 2 ? 'block' : 'none';
  }

  // ─── TAB SWITCHING (right panel) ───
  const tabs = document.querySelectorAll('.ap-tab');
  const tabPanels = {
    stats: document.getElementById('tab-stats'),
    whatif: document.getElementById('tab-whatif'),
    compare: document.getElementById('tab-compare'),
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      Object.entries(tabPanels).forEach(([key, panel]) => {
        if (panel) panel.style.display = key === target ? '' : 'none';
      });
    });
  });

  // ─── TIMELINE SLIDER ───
  const slider = document.getElementById('tl-slider');
  const yearDisplay = document.getElementById('tl-year');
  const badgeYear = document.getElementById('badge-year');

  if (slider) {
    slider.addEventListener('input', () => {
      currentYear = parseInt(slider.value);
      if (yearDisplay) yearDisplay.textContent = currentYear;
      if (badgeYear) badgeYear.textContent = currentYear;
      drawMap();
    });
  }

  // Timeline prev/play
  const prevBtn = document.getElementById('tl-prev');
  const playBtn = document.getElementById('tl-play');
  let playInterval = null;
  let playSpeed = 1;

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (slider && parseInt(slider.value) > 2000) {
        slider.value = parseInt(slider.value) - 1;
        slider.dispatchEvent(new Event('input'));
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
        playBtn.textContent = '▶';
        return;
      }
      playBtn.textContent = '⏸';
      playInterval = setInterval(() => {
        if (slider && parseInt(slider.value) < 2024) {
          slider.value = parseInt(slider.value) + 1;
          slider.dispatchEvent(new Event('input'));
        } else {
          clearInterval(playInterval);
          playInterval = null;
          playBtn.textContent = '▶';
        }
      }, 1000 / playSpeed);
    });
  }

  // Speed buttons
  document.querySelectorAll('.tl-speed').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tl-speed').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playSpeed = parseInt(btn.dataset.speed);
      if (playInterval) {
        clearInterval(playInterval);
        playInterval = setInterval(() => {
          if (slider && parseInt(slider.value) < 2024) {
            slider.value = parseInt(slider.value) + 1;
            slider.dispatchEvent(new Event('input'));
          } else {
            clearInterval(playInterval);
            playInterval = null;
            if (playBtn) playBtn.textContent = '▶';
          }
        }, 1000 / playSpeed);
      }
    });
  });

  // ─── GIS TOOLBAR ───
  document.querySelectorAll('.gis-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tool === 'undo') return; // undo doesn't toggle
      document.querySelectorAll('.gis-btn[data-tool]').forEach(b => {
        if (b.dataset.tool !== 'undo' && b.dataset.tool !== 'measure') b.classList.remove('active');
      });
      btn.classList.toggle('active');
    });
  });

  // ─── PRECIPITATION SLIDER ───
  const precipSlider = document.getElementById('precip-slider');
  const precipValue = document.getElementById('precip-value');
  if (precipSlider && precipValue) {
    precipSlider.addEventListener('input', () => {
      const v = parseInt(precipSlider.value);
      precipValue.textContent = (v >= 0 ? '+' : '') + v + '%';
    });
  }

  // ─── NEW WHAT-IF BUTTON ───
  const newWhatifBtn = document.getElementById('btn-new-whatif');
  if (newWhatifBtn) {
    newWhatifBtn.addEventListener('click', () => {
      // Switch to what-if tab
      tabs.forEach(t => t.classList.remove('active'));
      const whatifTab = document.querySelector('.ap-tab[data-tab="whatif"]');
      if (whatifTab) whatifTab.classList.add('active');
      Object.entries(tabPanels).forEach(([key, panel]) => {
        if (panel) panel.style.display = key === 'whatif' ? '' : 'none';
      });
    });
  }

  // ─── RUN ANALYSIS BUTTON ───
  const runBtn = document.getElementById('btn-run-analysis');
  const overlay = document.getElementById('progress-overlay');
  const fill = document.getElementById('progress-fill');
  const pctEl = document.getElementById('progress-pct');
  const scenarioResult = document.getElementById('scenario-result');

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      if (!overlay) return;
      overlay.style.display = 'flex';
      let progress = 0;
      if (fill) fill.style.width = '0%';
      if (pctEl) pctEl.textContent = '0%';

      const interval = setInterval(() => {
        progress += Math.random() * 14 + 4;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            overlay.style.display = 'none';
            if (fill) fill.style.width = '0%';
            if (scenarioResult) scenarioResult.style.display = 'block';
          }, 600);
        }
        if (fill) fill.style.width = progress + '%';
        if (pctEl) pctEl.textContent = Math.round(progress) + '%';
      }, 250);
    });
  }

  // Close overlay on click
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    });
  }

  // ─── CANVAS MAP ───
  const mapCanvas = document.getElementById('explorer-map');
  const mapContainer = document.getElementById('map-container');

  // Seeded random for consistent positions
  function seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Pre-generate map features
  const rng = seededRandom(42);

  // River paths (bezier curves)
  const riverPaths = [];
  // Main river — spanning full map vertically
  riverPaths.push({ points: generateRiver(0.05, 0.12, 0.92, 0.88, 14), width: 3 });
  // Tributaries
  riverPaths.push({ points: generateRiver(0.2, 0.05, 0.4, 0.38, 8), width: 2 });
  riverPaths.push({ points: generateRiver(0.55, 0.08, 0.58, 0.45, 7), width: 1.5 });
  riverPaths.push({ points: generateRiver(0.7, 0.15, 0.78, 0.55, 6), width: 1.5 });
  riverPaths.push({ points: generateRiver(0.25, 0.48, 0.45, 0.82, 6), width: 1.5 });
  riverPaths.push({ points: generateRiver(0.6, 0.55, 0.85, 0.78, 5), width: 1 });
  riverPaths.push({ points: generateRiver(0.35, 0.7, 0.65, 0.92, 5), width: 1 });

  function generateRiver(x1, y1, x2, y2, segments) {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      pts.push({
        x: x1 + (x2 - x1) * t + (rng() - 0.5) * 0.06,
        y: y1 + (y2 - y1) * t + (rng() - 0.5) * 0.04,
      });
    }
    return pts;
  }

  // Buildings (clusters of small rects)
  const buildingClusters = [];
  for (let i = 0; i < 12; i++) {
    const cx = 0.08 + rng() * 0.84;
    const cy = 0.08 + rng() * 0.82;
    const count = Math.floor(rng() * 12) + 5;
    const buildings = [];
    for (let j = 0; j < count; j++) {
      buildings.push({
        x: cx + (rng() - 0.5) * 0.06,
        y: cy + (rng() - 0.5) * 0.04,
        w: 0.004 + rng() * 0.006,
        h: 0.003 + rng() * 0.005,
      });
    }
    buildingClusters.push(buildings);
  }

  // Rainfall dots
  const rainfallDots = [];
  for (let i = 0; i < 80; i++) {
    rainfallDots.push({
      x: 0.03 + rng() * 0.94,
      y: 0.03 + rng() * 0.94,
      intensity: rng(), // 0-1
    });
  }

  // Flood zone polygon (around main river)
  function getFloodZone(year) {
    const scale = 0.5 + ((year - 2000) / 24) * 0.5; // wider in recent years
    const pts = [];
    const mainRiver = riverPaths[0].points;
    // Upper edge
    for (let i = 0; i < mainRiver.length; i++) {
      pts.push({
        x: mainRiver[i].x - 0.02 * scale - rng() * 0.015 * scale,
        y: mainRiver[i].y - 0.03 * scale - rng() * 0.02 * scale,
      });
    }
    // Lower edge (reversed)
    for (let i = mainRiver.length - 1; i >= 0; i--) {
      pts.push({
        x: mainRiver[i].x + 0.02 * scale + rng() * 0.015 * scale,
        y: mainRiver[i].y + 0.03 * scale + rng() * 0.02 * scale,
      });
    }
    return pts;
  }

  function drawMap() {
    if (!mapCanvas || !mapContainer) return;
    const dpr = window.devicePixelRatio || 1;
    const w = mapContainer.clientWidth;
    const h = mapContainer.clientHeight;
    if (w === 0 || h === 0) return;

    mapCanvas.width = w * dpr;
    mapCanvas.height = h * dpr;

    const ctx = mapCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0f1018';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = '#1a1b25';
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw flood zone if active
    if (LAYERS.flood2024.active || LAYERS.flood2010.active || LAYERS.flood1997.active) {
      const rng2 = seededRandom(currentYear * 7);
      const zone = getFloodZone(currentYear);
      ctx.beginPath();
      ctx.moveTo(zone[0].x * w, zone[0].y * h);
      for (let i = 1; i < zone.length; i++) {
        ctx.lineTo(zone[i].x * w, zone[i].y * h);
      }
      ctx.closePath();

      // Gradient fill
      const grd = ctx.createLinearGradient(0.2 * w, 0.2 * h, 0.8 * w, 0.8 * h);
      grd.addColorStop(0, 'rgba(79, 152, 163, 0.15)');
      grd.addColorStop(0.5, 'rgba(217, 80, 80, 0.12)');
      grd.addColorStop(1, 'rgba(217, 80, 80, 0.06)');
      ctx.fillStyle = grd;
      ctx.fill();

      // Outline
      ctx.strokeStyle = 'rgba(217, 80, 80, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw rainfall dots
    if (LAYERS.rainfall.active) {
      rainfallDots.forEach(dot => {
        // Intensity varies with year
        const yearFactor = 0.4 + ((currentYear - 2000) / 24) * 0.6;
        const intensity = dot.intensity * yearFactor;
        const r = 2 + intensity * 4;
        const alpha = 0.2 + intensity * 0.5;

        ctx.beginPath();
        ctx.arc(dot.x * w, dot.y * h, r, 0, Math.PI * 2);
        const green = Math.floor(180 - intensity * 80);
        ctx.fillStyle = `rgba(79, ${green}, 163, ${alpha})`;
        ctx.fill();
      });
    }

    // Draw rivers
    if (LAYERS.rivers.active) {
      riverPaths.forEach(river => {
        ctx.beginPath();
        ctx.moveTo(river.points[0].x * w, river.points[0].y * h);
        for (let i = 1; i < river.points.length; i++) {
          const prev = river.points[i - 1];
          const curr = river.points[i];
          const cpx = (prev.x + curr.x) / 2 * w;
          const cpy = (prev.y + curr.y) / 2 * h;
          ctx.quadraticCurveTo(prev.x * w, prev.y * h, cpx, cpy);
        }
        const last = river.points[river.points.length - 1];
        ctx.lineTo(last.x * w, last.y * h);
        ctx.strokeStyle = 'rgba(79, 152, 163, 0.7)';
        ctx.lineWidth = river.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Glow
        ctx.strokeStyle = 'rgba(79, 152, 163, 0.15)';
        ctx.lineWidth = river.width + 4;
        ctx.stroke();
      });
    }

    // Draw buildings
    if (LAYERS.buildings.active) {
      buildingClusters.forEach(cluster => {
        cluster.forEach(bld => {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.35)';
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
          ctx.lineWidth = 0.5;
          const bx = bld.x * w;
          const by = bld.y * h;
          const bw = bld.w * w;
          const bh = bld.h * h;
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeRect(bx, by, bw, bh);
        });
      });
    }

    // Draw reservoirs if active
    if (LAYERS.reservoirs.active) {
      const reservoirPositions = [
        { x: 0.3, y: 0.32, r: 0.02 },
        { x: 0.55, y: 0.48, r: 0.015 },
        { x: 0.45, y: 0.65, r: 0.018 },
        { x: 0.72, y: 0.62, r: 0.016 },
      ];
      reservoirPositions.forEach(res => {
        ctx.beginPath();
        ctx.arc(res.x * w, res.y * h, res.r * w, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(90, 173, 109, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(90, 173, 109, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(90, 173, 109, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('Zbiornik', res.x * w, res.y * h + res.r * w + 12);
      });
    }

    // Draw levees if active
    if (LAYERS.levees.active) {
      const mainRiver = riverPaths[0].points;
      // Draw parallel line offset from main river
      ctx.beginPath();
      for (let i = 0; i < mainRiver.length; i++) {
        const x = mainRiver[i].x * w + 15;
        const y = mainRiver[i].y * h + 12;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(234, 185, 69, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Opposite side
      ctx.beginPath();
      for (let i = 0; i < mainRiver.length; i++) {
        const x = mainRiver[i].x * w - 15;
        const y = mainRiver[i].y * h - 12;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Gauge markers on the river
    const gaugePositions = [
      { x: 0.25, y: 0.28, label: 'Bystrzyca 12.4', level: 156, severity: '#EAB945' },
      { x: 0.42, y: 0.42, label: 'Kłodzko 34.2', level: 212, severity: '#D95050' },
      { x: 0.62, y: 0.58, label: 'Bardo 52.7', level: 195, severity: '#E08644' },
      { x: 0.78, y: 0.72, label: 'Oława 67.1', level: 180, severity: '#E08644' },
    ];

    if (LAYERS.rivers.active) {
      gaugePositions.forEach(g => {
        const gx = g.x * w;
        const gy = g.y * h;

        // Outer glow
        ctx.beginPath();
        ctx.arc(gx, gy, 8, 0, Math.PI * 2);
        ctx.fillStyle = g.severity + '22';
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(gx, gy, 4, 0, Math.PI * 2);
        ctx.fillStyle = g.severity;
        ctx.fill();

        // Label
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#8B8D9A';
        ctx.textAlign = 'left';
        ctx.fillText(g.label, gx + 10, gy - 4);
        ctx.fillStyle = g.severity;
        ctx.fillText(g.level + ' cm', gx + 10, gy + 8);
      });
    }
  }

  // ─── TREND CHART (right panel) ───
  const trendCanvas = document.getElementById('trend-chart');

  function drawTrendChart() {
    if (!trendCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = trendCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = 140;

    trendCanvas.width = w * dpr;
    trendCanvas.height = h * dpr;
    trendCanvas.style.width = w + 'px';
    trendCanvas.style.height = h + 'px';

    const ctx = trendCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Annual peak flow data (mock)
    const years = [];
    const peaks = [];
    const rng3 = seededRandom(123);
    for (let y = 2000; y <= 2024; y++) {
      years.push(y);
      let base = 400 + (y - 2000) * 8; // upward trend
      let variation = (rng3() - 0.5) * 400;
      // Big flood years
      if (y === 2010) variation = 700;
      if (y === 2024) variation = 1000;
      if (y === 1997) variation = 800;
      peaks.push(Math.max(200, base + variation));
    }

    const maxPeak = Math.max(...peaks);
    const padL = 4;
    const padR = 4;
    const padT = 8;
    const padB = 18;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const barW = (chartW / years.length) * 0.7;
    const gap = (chartW / years.length) * 0.3;

    // Draw bars
    years.forEach((year, i) => {
      const barH = (peaks[i] / maxPeak) * chartH;
      const x = padL + i * (chartW / years.length) + gap / 2;
      const y = padT + chartH - barH;

      // Color by severity
      let color;
      if (peaks[i] > 1400) color = '#D95050';
      else if (peaks[i] > 900) color = '#E08644';
      else if (peaks[i] > 600) color = '#EAB945';
      else color = '#4F98A3';

      // Highlight current year
      const alpha = year === currentYear ? '1' : '0.6';

      ctx.fillStyle = color;
      ctx.globalAlpha = parseFloat(alpha);

      // Rounded top
      const r = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      // Year label (every 4 years)
      if (year % 4 === 0 || year === 2024) {
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = '#5A5C6A';
        ctx.textAlign = 'center';
        ctx.fillText(year.toString().slice(-2), x + barW / 2, h - 4);
      }
    });

    // Trend line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(217, 80, 80, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    const startY = padT + chartH - (peaks[0] / maxPeak) * chartH;
    const endY = padT + chartH - (peaks[peaks.length - 1] / maxPeak) * chartH;
    ctx.moveTo(padL, (startY + padT + chartH * 0.3));
    ctx.lineTo(padL + chartW, (endY + padT + chartH * 0.1));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ─── INIT ───
  function init() {
    updateLayerCount();
    updateMapLayerToggles();
    updateComparisonNote();
    drawMap();
    drawTrendChart();
  }

  init();

  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      drawMap();
      drawTrendChart();
    }, 100);
  });

})();
