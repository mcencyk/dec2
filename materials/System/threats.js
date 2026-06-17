// ═══════════════════════════════════════════
// DECERIS — Threats Inbox + Notifications
// ═══════════════════════════════════════════

// ── MINI SPARKLINES ──
function drawSparklines() {
  document.querySelectorAll('.mini-sparkline').forEach(el => {
    const peak = parseInt(el.dataset.peak) || 36;
    const level = parseInt(el.dataset.level) || 1;
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 40;
    el.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const w = 120, h = 40;
    const colors = { 1: '#EAB945', 2: '#E08644', 3: '#D95050' };
    const color = colors[level] || '#4F98A3';

    // Generate curve
    const points = [];
    for (let t = 0; t <= 72; t += 2) {
      const dist = Math.abs(t - peak);
      const val = 0.2 + 0.8 * Math.exp(-dist * dist / (2 * 200));
      points.push({ t, val });
    }

    // Draw
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (p.t / 72) * w;
      const y = h - p.val * (h - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill under
    ctx.fillStyle = color + '15';
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Threshold line
    ctx.strokeStyle = '#D9505030';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.25);
    ctx.lineTo(w, h * 0.25);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

// ── FILTER BUTTONS ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.alert-card').forEach(card => {
      if (filter === 'all') {
        card.style.display = '';
      } else if (filter === 'active') {
        card.style.display = card.dataset.status === 'active' ? '' : 'none';
      } else if (filter === 'acknowledged') {
        card.style.display = card.dataset.status === 'acknowledged' ? '' : 'none';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ── ACKNOWLEDGE BUTTON ──
document.querySelectorAll('.alert-ack-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const alertId = btn.dataset.alert;
    const card = document.getElementById(`alert-${alertId}`);
    if (!card) return;

    // Update card
    card.classList.remove('alert-unacked');
    card.dataset.status = 'acknowledged';

    // Update status tag
    const statusTag = card.querySelector('.alert-status-tag');
    statusTag.className = 'alert-status-tag status-acked';
    statusTag.innerHTML = `
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>
      Potwierdzone
    `;

    // Remove ack warning
    const ackWarning = card.querySelector('.alert-ack-warning');
    if (ackWarning) ackWarning.remove();

    // Replace ack button with done state
    btn.parentElement.innerHTML = `
      <span class="ack-done">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>
        Potwierdzone — Paweł S.
      </span>
      <a href="index.html" class="btn-primary btn-sm alert-open-btn">Otwórz Event →</a>
    `;

    // Hide escalation banner
    document.getElementById('escalation-banner').classList.add('hidden');

    // Update KPI
    const ackKpi = document.querySelector('.kpi-warning');
    if (ackKpi) ackKpi.textContent = '0';
  });
});

// ── ESCALATION BANNER ──
document.getElementById('btn-dismiss-banner').addEventListener('click', () => {
  document.getElementById('escalation-banner').classList.add('hidden');
});

document.getElementById('btn-ack-banner').addEventListener('click', () => {
  // Trigger acknowledge on EVT-003
  const ackBtn = document.querySelector('#alert-evt003 .alert-ack-btn');
  if (ackBtn) ackBtn.click();
});

// ── TOAST NOTIFICATIONS ──
function showToast(config) {
  const container = document.getElementById('toast-container');

  const colors = { L1: 'var(--l1)', L2: 'var(--l2)', L3: 'var(--l3)', L4: 'var(--l4)' };
  const bgColors = { L1: 'var(--l1-bg)', L2: 'var(--l2-bg)', L3: 'var(--l3-bg)', L4: 'var(--l4-bg)' };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-severity-strip" style="background:${colors[config.level] || 'var(--teal)'}"></div>
    <div class="toast-body">
      <div class="toast-header">
        <span class="toast-severity" style="background:${bgColors[config.level] || 'var(--teal-dim)'};color:${colors[config.level] || 'var(--teal)'}">${config.level}</span>
        <span style="font-size:11px;font-weight:600;color:var(--text)">${config.eventId || ''}</span>
        <span class="toast-time">${config.time || 'Teraz'}</span>
      </div>
      <div class="toast-title">${config.title}</div>
      <div class="toast-desc">${config.desc}</div>
      ${config.showSound ? `
        <div class="toast-sound-indicator">
          <div class="sound-wave">
            <span class="sound-bar"></span>
            <span class="sound-bar"></span>
            <span class="sound-bar"></span>
            <span class="sound-bar"></span>
          </div>
          Dźwięk alertu aktywny
        </div>
      ` : ''}
      <div class="toast-actions">
        <button class="toast-btn toast-btn-primary" onclick="this.closest('.toast').classList.add('toast-exiting'); setTimeout(() => this.closest('.toast').remove(), 300)">
          ${config.action || 'Otwórz'}
        </button>
        <button class="toast-btn toast-btn-dismiss" onclick="this.closest('.toast').classList.add('toast-exiting'); setTimeout(() => this.closest('.toast').remove(), 300)">
          Zamknij
        </button>
      </div>
      <div class="toast-progress"><div class="toast-progress-fill"></div></div>
    </div>
  `;

  container.appendChild(toast);

  // Auto-dismiss after 8s
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('toast-exiting');
      setTimeout(() => toast.remove(), 300);
    }
  }, 8000);
}

// ── DEMO: Show notification after 2 seconds ──
setTimeout(() => {
  showToast({
    level: 'L2',
    eventId: 'EVT-2026-04-004',
    title: 'Nowy alert: Ślęza — wzrost poziomu',
    desc: 'Predykcja LSTM: przekroczenie stanu ostrzegawczego w horyzoncie 48h na wodowskazie Ślęza km 22.1. Prawdopodobieństwo: 72%.',
    time: 'Teraz',
    showSound: true,
    action: 'Otwórz alert'
  });
}, 2000);

// Demo: second notification after 5 seconds (escalation type)
setTimeout(() => {
  showToast({
    level: 'L3',
    eventId: 'EVT-2026-04-003',
    title: 'Eskalacja: Nysa Kłodzka → L3',
    desc: 'Prawdopodobieństwo przekroczenia stanu alarmowego wzrosło do 92%. Nowy wodowskaz dołączony do eventu.',
    time: '1 min temu',
    showSound: false,
    action: 'Otwórz Event'
  });
}, 5000);

// ── SOUND TOGGLE ──
let soundEnabled = true;
document.getElementById('btn-sound').addEventListener('click', function() {
  soundEnabled = !soundEnabled;
  this.style.color = soundEnabled ? 'var(--teal)' : 'var(--text-faint)';
  this.style.opacity = soundEnabled ? '1' : '0.5';
});

// ── INIT ──
drawSparklines();
