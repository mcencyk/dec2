import type { RefObject } from 'react'
import { basins } from '@/data/mockData'
import { severityColor, severityBgColor } from '@/lib/severity'

const allStations = basins.flatMap(b => b.rivers.flatMap(r => r.stations))
const statsL3 = allStations.filter(s => s.severity === 'L3').length
const statsL2 = allStations.filter(s => s.severity === 'L2').length
const statsL1 = allStations.filter(s => s.severity === 'L1').length

const forecasts = [
  { station: 'Wilkszyn', river: 'Bystrzyca', current: 198, threshold: 270, from: 'L2', to: 'L3', eta: '~ 2h',  sparkTrend: 'sharp'    as const },
  { station: 'Szewce',   river: 'Widawa',    current: 142, threshold: 200, from: 'L1', to: 'L2', eta: '~ 4h',  sparkTrend: 'moderate' as const },
  { station: 'Biskupiec',river: 'Widawa',    current: 128, threshold: 150, from: 'L0', to: 'L1', eta: '~ 5h',  sparkTrend: 'slight'   as const },
]

const anomalies = [
  { station: 'Leśnica',     sub: 'Bystrzyca · km 26', type: 'no-data' as const, label: 'Brak odczytu',        extra: '248 cm (12:30)', time: '15:25' },
  { station: 'Niepołomice', sub: 'Wisła · km 82',      type: 'spike'   as const, label: 'Nadzwyczajny wzrost', extra: '+40 cm / 1h',   time: '14:58' },
]

const observed = [
  { name: 'Jarnołtów', sub: '',              value: 312, severity: 'L2' as const, trend: 'up' as const },
  { name: 'San',       sub: 'Przemyśl · ',   value: 285, severity: 'L2' as const, trend: 'up' as const },
]

const GLASS_PANEL: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px) saturate(1.5)',
  WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
  borderRadius: '16px',
  boxShadow: '0px 10px 15px 0px rgba(0,0,0,0.1), 0px 4px 6px 0px rgba(0,0,0,0.1)',
}

const SECTION: React.CSSProperties = {
  background: '#f0f0f0',
  borderRadius: '12px',
  padding: '10px',
}

// ── Mini sparkline ────────────────────────────────────────────────────────────
const SPARK: Record<'sharp' | 'moderate' | 'slight', string> = {
  sharp:    'M0,22 C8,20 16,16 24,12 S36,6 46,1',
  moderate: 'M0,22 C8,21 18,18 26,15 S38,11 46,7',
  slight:   'M0,21 C10,20 22,19 30,18 S40,16 46,13',
}

function Sparkline({ trend, color }: { trend: keyof typeof SPARK; color: string }) {
  return (
    <svg width="46" height="24" viewBox="0 0 46 24" fill="none" className="shrink-0">
      <path d={SPARK[trend]} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// ── Severity chip ─────────────────────────────────────────────────────────────
function SevChip({ s }: { s: string }) {
  const sev = s as 'L0' | 'L1' | 'L2' | 'L3'
  return (
    <span
      className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md leading-none"
      style={{ color: severityColor(sev), background: severityBgColor(sev) }}
    >
      {s}
    </span>
  )
}

interface LeftPanelProps {
  mouseContainer?: RefObject<HTMLElement | null>
}

export function LeftPanel(_props: LeftPanelProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 w-68 shrink-0" style={GLASS_PANEL}>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 space-y-1.5 scrollbar-none min-h-0">

        {/* ── Eskalacja ── */}
        <section style={{ ...SECTION, background: 'rgba(221,14,14,0.07)', paddingBottom: 8 }}>
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M3 17l6-6 4 4 8-9" stroke="var(--l3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] font-semibold tracking-[0.07em] uppercase" style={{ color: 'var(--l3)' }}>Eskalacja</span>
          </div>

          {/* Multi-line trend chart */}
          <div className="rounded-lg overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,1.00)' }}>
            <svg width="100%" height="62" viewBox="0 0 240 62" fill="none" preserveAspectRatio="none" className="block">
              <path d="M0,56 C40,50 80,42 120,32 S180,18 240,6"  stroke="var(--l3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M0,56 C40,52 80,46 120,38 S180,26 240,14" stroke="var(--l2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M0,58 C40,54 80,50 120,44 S180,36 240,24" stroke="var(--l1)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
            <div className="flex justify-between px-1.5 pb-1.5">
              {['-24h', '-18h', '-12h', '-6h', 'Teraz'].map(t => (
                <span key={t} className="text-[9px] text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>

          {/* Stats 2×2 */}
          <div className="grid grid-cols-2 gap-1">
            {([
              { sev: 'L3', val: statsL3 },
              { sev: 'L2', val: statsL2 },
              { sev: 'L1', val: statsL1 },
              { sev: null, label: 'Anomalie', val: anomalies.length },
            ] as const).map((item, i) => (
              <div key={i} className="rounded-lg px-2.5 py-2 flex items-center justify-between" style={{ background: 'rgba(255,255,255,1.00)' }}>
                {item.sev
                  ? <SevChip s={item.sev} />
                  : <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{item.label}</span>
                }
                <span className="text-[20px] font-semibold tabular-nums leading-none text-foreground">{item.val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Prognozy ── */}
        <section style={SECTION}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold tracking-[0.07em] uppercase text-muted-foreground">Prognozy</span>
            <span className="size-4 rounded-full flex items-center justify-center text-[10px] font-semibold text-muted-foreground" style={{ background: 'rgba(0,0,0,0.07)' }}>
              {forecasts.length}
            </span>
          </div>
          <div className="space-y-2.5">
            {forecasts.map(f => {
              const targetColor = severityColor(f.to as 'L0' | 'L1' | 'L2' | 'L3')
              return (
                <div key={f.station} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,1.00)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-foreground">{f.station}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{f.eta.replace('~ ', '').replace('h', 'h').trim()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[12px] font-mono tabular-nums text-muted-foreground">{f.current} cm</span>
                      <div className="flex items-center gap-0.5">
                        {f.from !== 'L0' && <SevChip s={f.from} />}
                        <span className="text-[11px] text-muted-foreground">→</span>
                        <SevChip s={f.to} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">szczyt za {f.eta}</span>
                    </div>
                    <Sparkline trend={f.sparkTrend} color={targetColor} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Anomalie ── */}
        <section style={{ ...SECTION, border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] font-semibold tracking-[0.07em] uppercase text-amber-600">Anomalie</span>
            <span className="ml-auto size-4 rounded-full flex items-center justify-center text-[10px] font-semibold text-muted-foreground" style={{ background: 'rgba(0,0,0,0.07)' }}>
              {anomalies.length}
            </span>
          </div>
          <div className="space-y-2">
            {anomalies.map(a => (
              <div key={a.station} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,1.00)' }}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[13px] font-semibold text-foreground">{a.station}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{a.time}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mb-1">{a.sub}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-amber-600">{a.type === 'no-data' ? '○' : '⚡'}</span>
                  <span className="text-[11px] font-medium text-foreground px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(0,0,0,0.06)' }}>{a.label}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">· {a.extra}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Obserwowane ── */}
        <section style={SECTION}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold tracking-[0.07em] uppercase text-muted-foreground">Obserwowane</span>
            <span className="size-4 rounded-full flex items-center justify-center text-[10px] font-semibold text-muted-foreground" style={{ background: 'rgba(0,0,0,0.07)' }}>
              {observed.length}
            </span>
          </div>
          <div className="space-y-2">
            {observed.map(o => {
              const color = severityColor(o.severity)
              const bg    = severityBgColor(o.severity)
              const trend = o.trend === 'up' ? '↑' : o.trend === 'down' ? '↓' : '—'
              return (
                <div key={o.name} className="rounded-lg p-2 space-y-1.5" style={{ background: 'rgba(255,255,255,1.00)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-foreground">{o.name}</span>
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md" style={{ color, background: bg }}>
                      {o.severity} {trend}
                    </span>
                  </div>
                  <div className="text-[12px] font-mono tabular-nums text-muted-foreground">
                    {o.sub}{o.value} cm
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: '82%', backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div className="h-2" />
      </div>

    </div>
  )
}
