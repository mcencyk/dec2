import type { RefObject } from 'react'
import { basins } from '@/data/mockData'

// ── Figma design tokens (light panel surfaces) ─────────────────────────────────
const SEV = {
  l1: { color: '#ffab02', bg: 'rgba(255,196,78,0.20)', shadow: '0 0 3px rgba(255,175,3,0.07), 0 0 2px rgba(255,175,3,0.07)' },
  l2: { color: '#fd6900', bg: 'rgba(253,122,0,0.09)',  shadow: '0 0 3px rgba(253,126,0,0.07), 0 0 2px rgba(253,126,0,0.07)' },
  l3: { color: '#dd0e0e', bg: 'rgba(221,14,14,0.09)',  shadow: '0 0 3px rgba(241,42,42,0.07), 0 0 2px rgba(241,42,42,0.07)' },
  info: { color: '#52525b', bg: 'rgba(184,184,184,0.12)' },
} as const

type SevKey = 'L1' | 'L2' | 'L3'
function sevStyle(l: SevKey) { return SEV[l.toLowerCase() as 'l1' | 'l2' | 'l3'] }

// ── Types ──────────────────────────────────────────────────────────────────────
type SparkTrend = 'sharp' | 'moderate' | 'slight'

interface ForecastItem {
  station: string
  current: number
  from: SevKey | null
  to: SevKey
  time: string
  eta: string
  spark: SparkTrend
}

type ObservedItem =
  | { kind: 'station'; name: string; value: string; severity: SevKey; pct: number }
  | { kind: 'river';   name: string; value: string; severity: SevKey; segs: string[] }

// ── Mock data ──────────────────────────────────────────────────────────────────
// MOCK DATA — w produkcji z IMGW SHAPI
const allStations = basins.flatMap(b => b.rivers.flatMap(r => r.stations))
const statsL3 = allStations.filter(s => s.severity === 'L3').length
const statsL2 = allStations.filter(s => s.severity === 'L2').length
const statsL1 = allStations.filter(s => s.severity === 'L1').length

const forecasts: ForecastItem[] = [
  { station: 'Wilkszyn',  current: 198, from: 'L2', to: 'L3', time: '17:28', eta: '~ 2h', spark: 'sharp'    },
  { station: 'Szewce',    current: 142, from: 'L1', to: 'L2', time: '16:32', eta: '~ 4h', spark: 'moderate' },
  { station: 'Biskupiec', current: 128, from: null,  to: 'L1', time: '16:31', eta: '~ 5h', spark: 'slight'   },
]

const anomalies = [
  { station: 'Leśnica',     loc: 'Bystrzyca · km 26', type: 'no-data' as const, label: 'Brak odczytu',        extra: '248 cm (12:30)', time: '15:25' },
  { station: 'Niepołomice', loc: 'Wisła · km 82',      type: 'spike'   as const, label: 'Nadzwyczajny wzrost', extra: '+ 40 cm / 1h',   time: '14:58' },
]

const observed: ObservedItem[] = [
  { kind: 'station', name: 'Jarnołtów',    value: '312 cm',           severity: 'L2', pct: 72 },
  { kind: 'river',   name: 'San',          value: 'Przemyśl · 285 cm', severity: 'L2', segs: ['#b8b8b8', '#ffab02', '#ffab02', '#fd6900'] },
  { kind: 'station', name: 'Trestno',      value: '523 cm · km 222',   severity: 'L3', pct: 95 },
  { kind: 'station', name: 'Oława',        value: '185 cm',            severity: 'L1', pct: 45 },
  { kind: 'station', name: 'Krzyżanowice', value: '188 cm',            severity: 'L3', pct: 88 },
  { kind: 'station', name: 'Ślęza',        value: '156 cm',            severity: 'L1', pct: 35 },
]

// ── Sparkline paths ───────────────────────────────────────────────────────────
const SPARK: Record<SparkTrend, string> = {
  sharp:    'M0,22 C12,18 24,12 38,6 S60,2 80,0',
  moderate: 'M0,22 C14,18 30,14 44,10 S64,6 80,4',
  slight:   'M0,21 C16,19 34,17 52,14 S68,12 80,10',
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Sparkline({ trend, color }: { trend: SparkTrend; color: string }) {
  return (
    <svg width="80" height="24" viewBox="0 0 80 24" fill="none" className="shrink-0">
      <path d={SPARK[trend]} stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function SevBadge({ level }: { level: SevKey }) {
  const s = sevStyle(level)
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-1 rounded-[4px] leading-none flex items-center shrink-0"
      style={{ color: s.color, background: s.bg, boxShadow: s.shadow }}
    >
      {level}
    </span>
  )
}

function SevBadgeArrow({ level }: { level: SevKey }) {
  const s = sevStyle(level)
  return (
    <span
      className="text-[10px] font-semibold pl-1.5 pr-1 py-1 rounded-sm leading-none flex items-center gap-0.5 shrink-0"
      style={{ color: s.color, background: s.bg, boxShadow: s.shadow }}
    >
      {level}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function InfoBadge({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] font-semibold px-1.5 h-5 rounded-[4px] flex items-center whitespace-nowrap shrink-0"
      style={{ color: SEV.info.color, background: SEV.info.bg }}
    >
      {label}
    </span>
  )
}

// ── Layout constants ───────────────────────────────────────────────────────────
const SECTION: React.CSSProperties = { background: '#f5f5f5', borderRadius: '12px', padding: '4px' }
const CARD: React.CSSProperties    = { background: '#fafafa', borderRadius: '8px',  padding: '8px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }
const HDR: React.CSSProperties     = { background: '#fafafa', borderRadius: '8px',  padding: '8px 8px 8px 12px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }

const SECTION_LABEL = 'text-[10px] font-semibold tracking-[0.07em] uppercase'

interface LeftPanelProps {
  mouseContainer?: RefObject<HTMLElement | null>
}

export function LeftPanel(_props: LeftPanelProps) {
  return (
    <div className="lg-panel flex flex-col max-h-full min-h-0 w-68 shrink-0" style={{ padding: '4px' }}>
      <div className="flex-1 panel-scroll min-h-0 flex flex-col" style={{ gap: '8px', paddingBottom: '4px' }}>

        {/* ── 1. ESKALACJA ──────────────────────────────────────────────────────── */}
        <section className="flex flex-col shrink-0" style={{ ...SECTION, gap: '4px' }}>

          {/* Status row */}
          <div
            className="rounded-lg flex items-center justify-between shrink-0"
            style={{
              background: '#ffe4e4',
              border: '1px solid rgba(221,14,14,0.09)',
              filter: 'drop-shadow(0 0 6px rgba(241,42,42,0.16))',
              padding: '12px',
            }}
          >
            <span className={`${SECTION_LABEL}`} style={{ color: '#dd0e0e' }}>Eskalacja</span>
            <span className="text-[10px]" style={{ color: '#27272a', opacity: 0 }}>16:53</span>
          </div>

          {/* Chart card */}
          <div className="rounded-xl shrink-0" style={{ background: 'white', padding: '8px' }}>
            <svg width="100%" height="96" viewBox="0 0 252 96" fill="none" preserveAspectRatio="none" className="block">
              <line x1="0" y1="24" x2="252" y2="24" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="0" y1="48" x2="252" y2="48" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="0" y1="72" x2="252" y2="72" stroke="#f0f0f0" strokeWidth="1" />
              <path d="M0,91 C60,90 140,89 252,88" stroke="#e4e4e7" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M0,86 C28,82 56,78 88,74 S118,70 148,66 S178,62 210,56 252,50" stroke="#ffab02" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M0,82 C22,74 42,64 66,58 S92,54 112,48 S132,44 152,46 S176,38 198,28 252,14" stroke="#fd6900" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M0,78 C18,66 36,52 56,46 S76,40 96,34 S116,26 136,30 S158,18 180,12 S210,6 252,4" stroke="#dd0e0e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '4px', height: '16px' }}>
              {['-24h', '-18h', '-12h', '-6h', 'Teraz'].map(t => (
                <span key={t} className="text-[9px] text-center" style={{ color: '#27272a' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Stats 2×2 grid */}
          <div className="grid grid-cols-2 shrink-0" style={{ gap: '4px' }}>
            {[
              { el: <SevBadge level="L3" />, val: statsL3 },
              { el: <SevBadge level="L2" />, val: statsL2 },
              { el: <SevBadge level="L1" />, val: statsL1 },
              {
                el: (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-1 rounded-[4px] leading-none flex items-center"
                    style={{ color: SEV.info.color, background: SEV.info.bg }}
                  >
                    ANOMALIE
                  </span>
                ),
                val: anomalies.length,
              },
            ].map(({ el, val }, i) => (
              <div key={i} className="rounded-lg flex items-center justify-between" style={CARD}>
                {el}
                <span className="text-[20px] font-semibold tabular-nums leading-none" style={{ color: '#0a0a0a' }}>{val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. PROGNOZY ───────────────────────────────────────────────────────── */}
        <section className="flex flex-col shrink-0" style={{ ...SECTION, gap: '4px' }}>
          <div style={HDR}>
            <span className={`${SECTION_LABEL}`} style={{ color: '#52525b' }}>Prognozy</span>
            <span className="text-[10px] font-semibold" style={{ color: '#52525b' }}>{forecasts.length}</span>
          </div>

          {forecasts.map(f => {
            const s = sevStyle(f.to)
            return (
              <div key={f.station} className="rounded-lg flex flex-col shrink-0" style={{ ...CARD, gap: '8px' }}>
                {/* Row 1: name + time */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col" style={{ gap: '2px' }}>
                    <span className="text-[14px] font-semibold leading-5" style={{ color: '#0a0a0a' }}>{f.station}</span>
                    <span className="text-[12px] leading-4" style={{ color: '#737373' }}>{f.current} cm</span>
                  </div>
                  <InfoBadge label={f.time} />
                </div>
                {/* Row 2: severity transition + sparkline */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: '4px' }}>
                    {f.from != null && <SevBadge level={f.from} />}
                    <span className="text-[11px]" style={{ color: '#52525b' }}>→</span>
                    <SevBadge level={f.to} />
                    <span className="text-[11px]" style={{ color: '#52525b' }}>·</span>
                    <InfoBadge label={`szczyt za ${f.eta}`} />
                  </div>
                  <Sparkline trend={f.spark} color={s.color} />
                </div>
              </div>
            )
          })}
        </section>

        {/* ── 3. ANOMALIE ───────────────────────────────────────────────────────── */}
        <section className="flex flex-col shrink-0" style={{ ...SECTION, gap: '4px' }}>
          <div style={HDR}>
            <span className={`${SECTION_LABEL}`} style={{ color: '#52525b' }}>Anomalie</span>
            <span className="text-[10px] font-semibold" style={{ color: '#52525b' }}>{anomalies.length}</span>
          </div>

          {anomalies.map(a => (
            <div key={a.station} className="rounded-lg flex flex-col shrink-0" style={{ ...CARD, gap: '6px' }}>
              {/* Row 1: station + time */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col" style={{ gap: '2px' }}>
                  <span className="text-[14px] font-semibold leading-5" style={{ color: '#0a0a0a' }}>{a.station}</span>
                  <span className="text-[12px] leading-4" style={{ color: '#737373' }}>{a.loc}</span>
                </div>
                <InfoBadge label={a.time} />
              </div>
              {/* Row 2: type badge + value */}
              <div className="flex items-center" style={{ gap: '6px' }}>
                <span
                  className="flex items-center text-[11px] font-medium px-1.5 py-1 rounded-md shrink-0"
                  style={{ gap: '4px', background: 'rgba(0,0,0,0.05)', color: '#52525b' }}
                >
                  {a.type === 'no-data' ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17l4-4 4 4 8-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {a.label}
                </span>
                <span className="text-[11px]" style={{ color: '#52525b' }}>·</span>
                <span className="text-[11px] font-mono" style={{ color: '#737373' }}>{a.extra}</span>
              </div>
            </div>
          ))}
        </section>

        {/* ── 4. OBSERWOWANE ────────────────────────────────────────────────────── */}
        <section className="flex flex-col shrink-0" style={{ ...SECTION, gap: '4px' }}>
          <div style={HDR}>
            <span className={`${SECTION_LABEL}`} style={{ color: '#52525b' }}>Obserwowane</span>
            <span className="text-[10px] font-semibold" style={{ color: '#52525b' }}>{observed.length}</span>
          </div>

          {observed.map(o => {
            const s = sevStyle(o.severity)
            if (o.kind === 'river') {
              return (
                <div key={o.name} className="rounded-lg flex flex-col shrink-0" style={{ ...CARD, gap: '8px' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col" style={{ gap: '2px' }}>
                      <span className="text-[14px] font-semibold leading-5" style={{ color: '#0a0a0a' }}>{o.name}</span>
                      <span className="text-[12px] leading-4" style={{ color: '#737373' }}>{o.value}</span>
                    </div>
                    <SevBadgeArrow level={o.severity} />
                  </div>
                  <div className="flex w-full" style={{ gap: '2px' }}>
                    {o.segs.map((c, i) => (
                      <div key={i} className="flex-1 rounded-full" style={{ height: '2px', background: c }} />
                    ))}
                  </div>
                </div>
              )
            }
            return (
              <div key={o.name} className="rounded-lg flex flex-col shrink-0" style={{ ...CARD, gap: '8px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col" style={{ gap: '2px' }}>
                    <span className="text-[14px] font-semibold leading-5" style={{ color: '#0a0a0a' }}>{o.name}</span>
                    <span className="text-[12px] leading-4" style={{ color: '#737373' }}>{o.value}</span>
                  </div>
                  <SevBadgeArrow level={o.severity} />
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: '2px', background: 'rgba(184,184,184,0.12)' }}>
                  <div className="h-full rounded-full" style={{ width: `${o.pct}%`, background: s.color }} />
                </div>
              </div>
            )
          })}
        </section>

        <div style={{ height: '4px', flexShrink: 0 }} />
      </div>
    </div>
  )
}
