// ═══════════════════════════════════════════
// DECERIS — River Event Interactive Prototype
// ═══════════════════════════════════════════

// ── DATA ──
const GAUGES = [
  {
    name: 'Bystrzyca',
    km: 12.4,
    level: 'L1',
    levelNum: 1,
    peakHour: 12,
    startHour: 6,
    endHour: 18,
    peakCm: 156,
    thresholdWarn: 170,
    thresholdAlarm: 200,
    color: 'l1'
  },
  {
    name: 'Kłodzko',
    km: 34.2,
    level: 'L3',
    levelNum: 3,
    peakHour: 36,
    startHour: 18,
    endHour: 54,
    peakCm: 212,
    thresholdWarn: 170,
    thresholdAlarm: 200,
    color: 'l3'
  },
  {
    name: 'Bardo',
    km: 52.7,
    level: 'L2',
    levelNum: 2,
    peakHour: 48,
    startHour: 30,
    endHour: 66,
    peakCm: 195,
    thresholdWarn: 170,
    thresholdAlarm: 200,
    color: 'l2'
  }
];

const IMPACT_DATA = {
  0:  { buildings: 0,  people: 0,   roads: 0, infra: 0, loss: '0' },
  6:  { buildings: 0,  people: 0,   roads: 0, infra: 0, loss: '0' },
  12: { buildings: 3,  people: 8,   roads: 0, infra: 0, loss: '0.5–1M' },
  18: { buildings: 8,  people: 22,  roads: 1, infra: 0, loss: '1–3M' },
  24: { buildings: 18, people: 48,  roads: 1, infra: 0, loss: '3–6M' },
  30: { buildings: 28, people: 74,  roads: 2, infra: 1, loss: '6–10M' },
  36: { buildings: 47, people: 120, roads: 3, infra: 2, loss: '12–18M' },
  42: { buildings: 44, people: 115, roads: 3, infra: 2, loss: '11–16M' },
  48: { buildings: 40, people: 105, roads: 2, infra: 1, loss: '9–14M' },
  54: { buildings: 32, people: 85,  roads: 2, infra: 1, loss: '7–11M' },
  60: { buildings: 18, people: 48,  roads: 1, infra: 0, loss: '3–6M' },
  66: { buildings: 8,  people: 22,  roads: 0, infra: 0, loss: '1–2M' },
  72: { buildings: 2,  people: 5,   roads: 0, infra: 0, loss: '< 0.5M' }
};

const BUILDING_DETAILS = [
  { text: '12 mieszkalnych (34 osoby)', from: 24 },
  { text: '8 gospodarczych', from: 18 },
  { text: '27 pozostałych', from: 30 }
];

const ROAD_DETAILS = [
  { text: 'DK8 (km 12.3–14.7) — nieprzejezdna od T+36h', from: 36 },
  { text: 'ul. Nadrzeczna — nieprzejezdna od T+24h', from: 24 },
  { text: 'Most na Nysie (km 15.1) — zagrożony od T+48h', from: 48 }
];

const INFRA_DETAILS = [
  { text: 'Stacja pomp Kłodzko-Południe — zagrożona T+36h', from: 30 },
  { text: 'GPZ Kłodzko — woda w zasięgu 200m od T+48h', from: 42 }
];

const RECO_P1 = [
  'Zamknij <strong>DK8 km 12.3–14.7</strong>',
  'Powiadom <strong>34 mieszkańców</strong> strefy zalewowej'
];

const RECO_P2 = [
  'Zabezpiecz <strong>stację pomp Kłodzko-Południe</strong>',
  'Przygotuj <strong>objazd dla DK8</strong>'
];

const HISTORY = [
  { time: 'T+0h (08:00)', dot: 'var(--l1)', title: 'Alert utworzony — L1 Watch', desc: 'Predykcja przekracza stan ostrzegawczy w horyzoncie 72h na Bystrzyca km 12.4' },
  { time: 'T+2h (10:00)', dot: 'var(--l2)', title: 'Eskalacja → L2 Warning', desc: 'Kłodzko km 34.2 przekracza próg alarmowy. Dodano do River Event.' },
  { time: 'T+3h (11:00)', dot: 'var(--l3)', title: 'Eskalacja → L3 Alert', desc: 'Prawdopodobieństwo >80%. Bardo km 52.7 dołączony do eventu.' },
  { time: 'T+3h 30min', dot: 'var(--teal)', title: 'Powiadomienie wysłane', desc: 'Push + SMS do dyżurnego CZK i kierownika.' },
  { time: 'T+4h (12:00)', dot: 'var(--warning)', title: 'Timeout eskalacji', desc: 'Brak acknowledge w 15 min → eskalacja do KDR.' },
  { time: 'Teraz', dot: 'var(--teal)', title: 'Status: Active', desc: 'Oczekuje na acknowledge lub analizę.' }
];

// ── GANTT ──
function renderGantt() {
  const markers = document.getElementById('time-markers');
  markers.innerHTML = '';
  for (let h = 0; h <= 72; h += 12) {
    const el = document.createElement('span');
    el.textContent = h === 0 ? 'T+0h' : `T+${h}h`;
    markers.appendChild(el);
  }

  const body = document.getElementById('gantt-body');
  body.innerHTML = '';
  GAUGES.forEach(g => {
    const row = document.createElement('div');
    row.className = 'gantt-row';

    const leftPct = (g.startHour / 72) * 100;
    const widthPct = ((g.endHour - g.startHour) / 72) * 100;
    const peakPct = ((g.peakHour - g.startHour) / (g.endHour - g.startHour)) * 100;

    row.innerHTML = `
      <div class="gantt-label">
        <span class="severity-dot severity-dot-${g.color}"></span>
        <div>
          <div class="gantt-gauge-name">${g.name} km ${g.km}</div>
          <div class="gantt-gauge-meta">${g.level} · ${g.peakCm}cm</div>
        </div>
      </div>
      <div class="gantt-bar-track">
        <div class="gantt-bar gantt-bar-${g.color}" style="left:${leftPct}%;width:${widthPct}%">
          <span>${g.peakCm}cm</span>
          <div class="gantt-peak" style="left:${peakPct}%">
            <span class="gantt-peak-label">T+${g.peakHour}h</span>
          </div>
        </div>
      </div>
    `;
    body.appendChild(row);
  });
}

// ── IMPACT PANEL ──
function getImpact(hour) {
  const keys = Object.keys(IMPACT_DATA).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (k <= hour) closest = k;
    else break;
  }
  return IMPACT_DATA[closest];
}

function renderImpact(hour) {
  const data = getImpact(hour);
  const container = document.getElementById('impact-content');

  const buildingSubs = BUILDING_DETAILS.filter(d => hour >= d.from);
  const roadSubs = ROAD_DETAILS.filter(d => hour >= d.from);
  const infraSubs = INFRA_DETAILS.filter(d => hour >= d.from);

  container.innerHTML = `
    <div class="impact-card">
      <div class="impact-icon impact-icon-buildings">🏠</div>
      <div class="impact-info">
        <div class="impact-main">${data.buildings} budynków zagrożonych</div>
        <div class="impact-detail">
          ${buildingSubs.map((s, i) => `<div class="impact-sub-item">${s.text}</div>`).join('')}
        </div>
      </div>
    </div>
    <div class="impact-card">
      <div class="impact-icon impact-icon-roads">🛣️</div>
      <div class="impact-info">
        <div class="impact-main">${data.roads} ${data.roads === 1 ? 'droga zalana' : 'drogi zalane'}</div>
        <div class="impact-detail">
          ${roadSubs.map(s => `<div class="impact-sub-item">${s.text}</div>`).join('')}
        </div>
      </div>
    </div>
    <div class="impact-card">
      <div class="impact-icon impact-icon-infra">⚡</div>
      <div class="impact-info">
        <div class="impact-main">${data.infra} ${data.infra === 1 ? 'obiekt' : 'obiekty'} infrastruktury krytycznej</div>
        <div class="impact-detail">
          ${infraSubs.map(s => `<div class="impact-sub-item">${s.text}</div>`).join('')}
        </div>
      </div>
    </div>
    <div class="impact-card">
      <div class="impact-icon impact-icon-loss">💰</div>
      <div class="impact-info">
        <div class="impact-main">Szacunkowe straty: ${data.loss} PLN</div>
      </div>
    </div>
  `;

  // Recommendations
  const recoList = document.getElementById('reco-list');
  if (hour >= 24) {
    recoList.innerHTML = `
      <div class="reco-item reco-p1">
        <span class="reco-priority">P1</span>
        <span class="reco-text">Natychmiast: ${RECO_P1.join(' · ')}</span>
      </div>
      <div class="reco-item reco-p2">
        <span class="reco-priority">P2</span>
        <span class="reco-text">W ciągu 12h: ${RECO_P2.join(' · ')}</span>
      </div>
    `;
  } else {
    recoList.innerHTML = `
      <div class="reco-item reco-p2">
        <span class="reco-priority">INFO</span>
        <span class="reco-text">Monitoring — brak natychmiastowych rekomendacji w T+${hour}h</span>
      </div>
    `;
  }
}

// ── MAP (CANVAS) ──
function drawMap(hour) {
  const canvas = document.getElementById('map-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth * 2;
  const H = canvas.height = canvas.clientHeight * 2;
  ctx.scale(2, 2);
  const w = W / 2;
  const h = H / 2;

  // Dark basemap
  ctx.fillStyle = '#0f1018';
  ctx.fillRect(0, 0, w, h);

  // Grid lines (terrain feel)
  ctx.strokeStyle = '#1a1b25';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // River path
  ctx.strokeStyle = '#1a4a6680';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.08, h * 0.15);
  ctx.quadraticCurveTo(w * 0.2, h * 0.3, w * 0.35, h * 0.38);
  ctx.quadraticCurveTo(w * 0.5, h * 0.48, w * 0.65, h * 0.58);
  ctx.quadraticCurveTo(w * 0.8, h * 0.68, w * 0.92, h * 0.82);
  ctx.stroke();

  // Flood zone — grows with hour
  const intensity = Math.min(hour / 36, 1);
  if (intensity > 0.05) {
    const gradient = ctx.createLinearGradient(w * 0.1, h * 0.1, w * 0.9, h * 0.9);
    gradient.addColorStop(0, `rgba(45, 125, 154, ${0.1 * intensity})`);
    gradient.addColorStop(0.5, `rgba(26, 92, 115, ${0.25 * intensity})`);
    gradient.addColorStop(1, `rgba(13, 52, 66, ${0.15 * intensity})`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    const spread = 30 + intensity * 80;
    ctx.moveTo(w * 0.08, h * 0.15 - spread * 0.3);
    ctx.quadraticCurveTo(w * 0.2, h * 0.3 - spread, w * 0.35, h * 0.38 - spread);
    ctx.quadraticCurveTo(w * 0.5, h * 0.48 - spread * 0.8, w * 0.65, h * 0.58 - spread * 0.6);
    ctx.quadraticCurveTo(w * 0.8, h * 0.68 - spread * 0.4, w * 0.92, h * 0.82 - spread * 0.2);
    ctx.lineTo(w * 0.92, h * 0.82 + spread * 0.2);
    ctx.quadraticCurveTo(w * 0.8, h * 0.68 + spread * 0.4, w * 0.65, h * 0.58 + spread * 0.6);
    ctx.quadraticCurveTo(w * 0.5, h * 0.48 + spread * 0.8, w * 0.35, h * 0.38 + spread);
    ctx.quadraticCurveTo(w * 0.2, h * 0.3 + spread, w * 0.08, h * 0.15 + spread * 0.3);
    ctx.closePath();
    ctx.fill();

    // Building dots in flood zone
    if (intensity > 0.2) {
      const buildingCount = Math.floor(intensity * 50);
      ctx.fillStyle = `rgba(187, 101, 59, ${0.3 + intensity * 0.5})`;
      const rng = mulberry32(42);
      for (let i = 0; i < buildingCount; i++) {
        const t = rng();
        const cx = w * (0.15 + t * 0.7);
        const baseY = h * (0.2 + t * 0.6);
        const offsetY = (rng() - 0.5) * spread * 1.2;
        ctx.fillRect(cx - 2, baseY + offsetY - 2, 4, 4);
      }
    }

    // Road lines
    if (intensity > 0.3) {
      ctx.strokeStyle = `rgba(217, 80, 80, ${0.3 + intensity * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      // DK8
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h * 0.25);
      ctx.lineTo(w * 0.55, h * 0.45);
      ctx.stroke();
      // ul. Nadrzeczna
      ctx.beginPath();
      ctx.moveTo(w * 0.4, h * 0.55);
      ctx.lineTo(w * 0.6, h * 0.42);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // River — brighter on top
  ctx.strokeStyle = '#2d7d9a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.08, h * 0.15);
  ctx.quadraticCurveTo(w * 0.2, h * 0.3, w * 0.35, h * 0.38);
  ctx.quadraticCurveTo(w * 0.5, h * 0.48, w * 0.65, h * 0.58);
  ctx.quadraticCurveTo(w * 0.8, h * 0.68, w * 0.92, h * 0.82);
  ctx.stroke();
}

// Simple PRNG for deterministic building positions
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── HYDROGRAPH ──
function drawHydrograph(gaugeKey) {
  const gauge = gaugeKey === 'bystrzyca' ? GAUGES[0] : gaugeKey === 'bardo' ? GAUGES[2] : GAUGES[1];
  const canvas = document.getElementById('hydrograph-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth * 2;
  const H = canvas.height = canvas.clientHeight * 2;
  ctx.scale(2, 2);
  const w = W / 2;
  const h = H / 2;
  const pad = { top: 30, right: 20, bottom: 36, left: 50 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  ctx.clearRect(0, 0, w, h);

  // Generate water level curve
  const points = [];
  const peakVal = gauge.peakCm;
  const baseVal = 140;
  for (let t = -12; t <= 72; t++) {
    let val;
    if (t < 0) {
      // Observation
      val = baseVal + (peakVal - baseVal) * 0.1 * Math.max(0, (t + 12) / 12);
    } else {
      const dist = Math.abs(t - gauge.peakHour);
      val = baseVal + (peakVal - baseVal) * Math.exp(-dist * dist / (2 * 250));
    }
    points.push({ t, val });
  }

  const minT = -12, maxT = 72;
  const minV = 130, maxV = 230;
  const xScale = t => pad.left + ((t - minT) / (maxT - minT)) * cw;
  const yScale = v => pad.top + (1 - (v - minV) / (maxV - minV)) * ch;

  // Threshold lines
  [{val: gauge.thresholdWarn, label: 'Stan ostrzegawczy', color: '#EAB94560'},
   {val: gauge.thresholdAlarm, label: 'Stan alarmowy', color: '#D9505060'}].forEach(th => {
    const y = yScale(th.val);
    ctx.strokeStyle = th.color;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = th.color;
    ctx.font = '10px "JetBrains Mono"';
    ctx.textAlign = 'right';
    ctx.fillText(`${th.label} ${th.val}cm`, w - pad.right - 4, y - 4);
  });

  // Grid
  ctx.strokeStyle = '#1e1f2a';
  ctx.lineWidth = 0.5;
  for (let t = 0; t <= 72; t += 12) {
    const x = xScale(t);
    ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, h - pad.bottom); ctx.stroke();
  }
  for (let v = 140; v <= 220; v += 20) {
    const y = yScale(v);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
  }

  // Observation line (solid, bright)
  ctx.strokeStyle = '#4F98A3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const obsPoints = points.filter(p => p.t <= 0);
  obsPoints.forEach((p, i) => {
    const x = xScale(p.t), y = yScale(p.val);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Prediction line (dashed)
  ctx.strokeStyle = '#4F98A3';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  const predPoints = points.filter(p => p.t >= 0);
  predPoints.forEach((p, i) => {
    const x = xScale(p.t), y = yScale(p.val);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // Confidence band
  ctx.fillStyle = '#4F98A318';
  ctx.beginPath();
  predPoints.forEach((p, i) => {
    const x = xScale(p.t), y = yScale(p.val + 12);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  for (let i = predPoints.length - 1; i >= 0; i--) {
    const p = predPoints[i];
    ctx.lineTo(xScale(p.t), yScale(p.val - 12));
  }
  ctx.closePath();
  ctx.fill();

  // Previous prediction (gray, dashed)
  ctx.strokeStyle = '#5A5C6A40';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  predPoints.forEach((p, i) => {
    const x = xScale(p.t), y = yScale(p.val + 8 + Math.sin(p.t * 0.1) * 5);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // "Teraz" marker
  const nowX = xScale(0);
  ctx.strokeStyle = '#E2E4EA40';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(nowX, pad.top);
  ctx.lineTo(nowX, h - pad.bottom);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#E2E4EA';
  ctx.font = '10px "Inter"';
  ctx.textAlign = 'center';
  ctx.fillText('Teraz', nowX, h - pad.bottom + 14);

  // X axis labels
  ctx.fillStyle = '#5A5C6A';
  ctx.font = '10px "JetBrains Mono"';
  ctx.textAlign = 'center';
  for (let t = -12; t <= 72; t += 12) {
    if (t === 0) continue;
    ctx.fillText(t < 0 ? `T${t}h` : `T+${t}h`, xScale(t), h - pad.bottom + 14);
  }

  // Y axis labels
  ctx.textAlign = 'right';
  for (let v = 140; v <= 220; v += 20) {
    ctx.fillText(`${v}`, pad.left - 6, yScale(v) + 4);
  }

  // Legend
  ctx.fillStyle = '#8B8D9A';
  ctx.font = '10px "Inter"';
  ctx.textAlign = 'left';
  const ly = 14;
  // Solid line = observation
  ctx.strokeStyle = '#4F98A3'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pad.left, ly); ctx.lineTo(pad.left + 20, ly); ctx.stroke();
  ctx.fillText('Pomiar', pad.left + 24, ly + 3);
  // Dashed = prediction
  ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(pad.left + 80, ly); ctx.lineTo(pad.left + 100, ly); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillText('Predykcja', pad.left + 104, ly + 3);
  // Gray = previous
  ctx.strokeStyle = '#5A5C6A60'; ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(pad.left + 180, ly); ctx.lineTo(pad.left + 200, ly); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#5A5C6A';
  ctx.fillText('Poprzednia predykcja', pad.left + 204, ly + 3);
}

// ── HISTORY TIMELINE ──
function renderHistory() {
  const container = document.getElementById('history-timeline');
  container.innerHTML = HISTORY.map(h => `
    <div class="history-item">
      <span class="history-time">${h.time}</span>
      <span class="history-dot" style="background:${h.dot}"></span>
      <div class="history-body">
        <div class="history-title">${h.title}</div>
        <div class="history-desc">${h.desc}</div>
      </div>
    </div>
  `).join('');
}

// ── TABS ──
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// ── SCRUBBER ──
const scrubber = document.getElementById('scrubber');
const scrubberLabel = document.getElementById('scrubber-label');
const mapTimeLabel = document.getElementById('map-time-label');
const impactTimeLabel = document.getElementById('impact-time-label');

function updateForHour(hour) {
  scrubberLabel.textContent = `T+${hour}h`;
  mapTimeLabel.textContent = `T+${hour}h`;
  const isPeak = hour === 36;
  impactTimeLabel.textContent = isPeak ? `T+${hour}h (szczyt)` : `T+${hour}h`;
  drawMap(hour);
  renderImpact(hour);
}

scrubber.addEventListener('input', () => {
  updateForHour(parseInt(scrubber.value));
});

// ── SCENARIO TYPE SWITCHING ──
document.querySelectorAll('.scenario-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.scenario-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.scenario-form').forEach(f => f.classList.add('hidden'));
    const form = document.getElementById(`form-${btn.dataset.stype}`);
    if (form) form.classList.remove('hidden');
  });
});

// ── SLIDERS ──
const breachSlider = document.getElementById('breach-width');
const breachValue = document.getElementById('breach-value');
if (breachSlider) {
  breachSlider.addEventListener('input', () => {
    breachValue.textContent = `${breachSlider.value}m`;
  });
}

const precipSlider = document.getElementById('precip-change');
const precipValue = document.getElementById('precip-value');
if (precipSlider) {
  precipSlider.addEventListener('input', () => {
    const v = parseInt(precipSlider.value);
    precipValue.textContent = v >= 0 ? `+${v}%` : `${v}%`;
  });
}

// ── GAUGE SELECT (HYDROGRAPH) ──
document.getElementById('gauge-select').addEventListener('change', (e) => {
  drawHydrograph(e.target.value);
});

// ── LAYER TOGGLES ──
document.querySelectorAll('.map-layers button').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('layer-active');
  });
});

// ── COMPUTE BUTTON ──
document.querySelectorAll('.btn-compute').forEach(btn => {
  btn.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'progress-overlay';
    overlay.innerHTML = `
      <div class="progress-card">
        <div class="progress-title">Obliczanie scenariusza...</div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="progress-fill"></div>
        </div>
        <div class="progress-pct" id="progress-pct">0%</div>
      </div>
    `;
    document.body.appendChild(overlay);

    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 15 + 5;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setTimeout(() => {
          overlay.remove();
          // Switch to the comparison tab view (scroll to comparison table)
          document.querySelector('[data-tab="scenarios"]').click();
        }, 500);
      }
      const fill = document.getElementById('progress-fill');
      const pctEl = document.getElementById('progress-pct');
      if (fill) fill.style.width = `${Math.min(pct, 100)}%`;
      if (pctEl) pctEl.textContent = `${Math.round(Math.min(pct, 100))}%`;
    }, 200);
  });
});

// ── PLAY ANIMATION ──
let animating = false;
document.getElementById('btn-play').addEventListener('click', () => {
  if (animating) return;
  animating = true;
  let hour = 0;
  const interval = setInterval(() => {
    hour += 1;
    scrubber.value = hour;
    updateForHour(hour);
    if (hour >= 72) {
      clearInterval(interval);
      animating = false;
    }
  }, 80);
});

// ── ACKNOWLEDGE BUTTON ──
document.getElementById('btn-acknowledge').addEventListener('click', function() {
  this.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>
    Acknowledged
  `;
  this.style.borderColor = 'var(--success)';
  this.style.color = 'var(--success)';
  this.disabled = true;

  document.querySelector('.event-status').textContent = 'Acknowledged';
  document.querySelector('.event-status').style.background = '#5AAD6D22';
  document.querySelector('.event-status').style.color = '#5AAD6D';
});

// ── INIT ──
function init() {
  renderGantt();
  updateForHour(36);
  drawHydrograph('klodzko');
  renderHistory();
}

// Handle resize
window.addEventListener('resize', () => {
  updateForHour(parseInt(scrubber.value));
  drawHydrograph(document.getElementById('gauge-select').value);
});

// ── EXPORT DRAWER ──
const exportDrawer = document.getElementById('export-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');

function openDrawer() {
  exportDrawer.classList.add('open');
  drawerBackdrop.classList.add('open');
  // Set timestamp
  const now = new Date();
  const ts = now.toISOString().replace('T', ' ').slice(0, 16) + ' CEST';
  const tsEl = document.getElementById('report-timestamp');
  if (tsEl) tsEl.textContent = ts;
}

function closeDrawer() {
  exportDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('open');
}

document.getElementById('btn-export').addEventListener('click', openDrawer);
document.getElementById('drawer-close').addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

// Section checkboxes toggle
document.querySelectorAll('.report-section-item').forEach(item => {
  item.addEventListener('click', () => {
    const cb = item.querySelector('.section-checkbox');
    cb.classList.toggle('checked');
    updatePageCount();
  });
});

function updatePageCount() {
  const checked = document.querySelectorAll('.section-checkbox.checked').length;
  const pages = Math.max(1, Math.ceil(checked * 5 / 9));
  const info = document.querySelector('.drawer-footer-info span');
  if (info) {
    info.textContent = `${checked} sekcji · ~${pages} stron · PDF ~${(pages * 0.5).toFixed(1)} MB`;
  }
}

// Format toggle buttons
document.querySelectorAll('.report-format-btns').forEach(group => {
  group.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// Generate report button
document.getElementById('btn-generate-report').addEventListener('click', () => {
  const body = document.querySelector('.drawer-body');
  const footer = document.querySelector('.drawer-footer');
  const originalBody = body.innerHTML;
  const originalFooter = footer.innerHTML;

  const steps = [
    'Renderowanie mapy zalewowej...',
    'Eksport wykresu Gantt...',
    'Tabela porównawcza scenariuszy...',
    'Rekomendacje P1/P2...',
    'Hydrograf — 3 wodowskazy...',
    'Audit trail & metadane...',
    'Kompilacja PDF...'
  ];

  body.innerHTML = `
    <div class="report-generating">
      <div class="report-gen-spinner"></div>
      <div class="report-gen-text">Generowanie raportu decyzyjnego...</div>
      <ul class="report-gen-steps" id="gen-steps">
        ${steps.map((s, i) => `<li class="report-gen-step" id="step-${i}"><span class="step-icon">○</span> ${s}</li>`).join('')}
      </ul>
    </div>
  `;
  footer.innerHTML = `
    <div class="drawer-footer-info">
      <span>Generowanie w toku...</span>
    </div>
    <div class="drawer-footer-actions"></div>
  `;

  let current = 0;
  const interval = setInterval(() => {
    if (current > 0) {
      const prevStep = document.getElementById(`step-${current - 1}`);
      if (prevStep) {
        prevStep.classList.remove('active');
        prevStep.classList.add('done');
        prevStep.querySelector('.step-icon').textContent = '✓';
      }
    }
    if (current < steps.length) {
      const step = document.getElementById(`step-${current}`);
      if (step) {
        step.classList.add('active');
        step.querySelector('.step-icon').textContent = '◉';
      }
      current++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        body.innerHTML = `
          <div class="report-done">
            <div class="report-done-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <div class="report-done-title">Raport wygenerowany</div>
            <div class="report-done-filename">EVT-2026-04-003_raport_decyzyjny.pdf</div>
            <div style="font-size:12px; color:var(--text-muted)">5 stron · 2.4 MB · 9 sekcji</div>
            <div class="report-done-actions">
              <button class="btn-primary" onclick="alert('Pobieranie...')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Pobierz PDF
              </button>
              <button class="btn-outline" onclick="alert('Wysyłanie do CZK Kłodzko, KDR Woj. Dolnośląskie...')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
                Wyślij do odbiorców
              </button>
            </div>
          </div>
        `;
        footer.innerHTML = `
          <div class="drawer-footer-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>
            <span>Gotowe · Raport zapisany w historii eventu</span>
          </div>
          <div class="drawer-footer-actions">
            <button class="btn-ghost btn-sm" id="btn-back-to-config">Nowy raport</button>
          </div>
        `;
        document.getElementById('btn-back-to-config').addEventListener('click', () => {
          body.innerHTML = originalBody;
          footer.innerHTML = originalFooter;
          // Re-bind events
          bindDrawerInternals();
        });
      }, 500);
    }
  }, 600);
});

function bindDrawerInternals() {
  document.querySelectorAll('.report-section-item').forEach(item => {
    item.addEventListener('click', () => {
      const cb = item.querySelector('.section-checkbox');
      cb.classList.toggle('checked');
      updatePageCount();
    });
  });
  document.querySelectorAll('.report-format-btns').forEach(group => {
    group.querySelectorAll('.format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });
  document.getElementById('btn-generate-report').addEventListener('click', arguments.callee);
}

init();
