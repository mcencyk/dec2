import { useState, useRef, type RefObject } from 'react'
import { CircleAlert } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import type { Station, River } from '@/types'
import { basins, rivers } from '@/data/mockData'
import { AlertCard } from './AlertCard'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { severityColor } from '@/lib/severity'

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
  | { kind: 'river';   river: River }
  | { kind: 'station'; station: Station }

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
  { station: 'Leśnica',     loc: 'Bystrzyca · km 26', type: 'no-data' as const, label: 'Brak odczytu',   extra: '248 cm (12:30)', time: '15:25' },
  { station: 'Niepołomice', loc: 'Wisła · km 82',      type: 'spike'   as const, label: 'Szybki wzrost', extra: '+ 40 cm / 1h',   time: '14:58' },
]

// MOCK DATA — w produkcji z IMGW SHAPI
const observed: ObservedItem[] = [
  { kind: 'station', station: allStations.find(s => s.id === 'bys-jarnoltow')!    },
  { kind: 'river',   river:   rivers.find(r => r.id === 'san')!                   },
  { kind: 'station', station: allStations.find(s => s.id === 'odra-trestno')!     },
  { kind: 'station', station: allStations.find(s => s.id === 'ola-olawa-miasto')! },
  { kind: 'station', station: allStations.find(s => s.id === 'wid-krzyzanowice')! },
  { kind: 'station', station: allStations.find(s => s.id === 'sle-bielany')!      },
]

// ── Chart data ────────────────────────────────────────────────────────────────
// MOCK DATA — w produkcji z IMGW SHAPI
// l0 = stacje w normie (malejące), l1/l2/l3 = rosnące alerty
const ESCALATION_DATA = [
  { t: '-24h', l0: 22, l1: 2,  l2: 1,  l3: 0 },
  { t: '-18h', l0: 20, l1: 6,  l2: 4,  l3: 2 },
  { t: '-12h', l0: 17, l1: 5,  l2: 8,  l3: 3 },
  { t: '-6h',  l0: 14, l1: 9,  l2: 9,  l3: 4 },
  { t: 'Teraz',l0: 12, l1: 8,  l2: 11, l3: 5 },
]

const SPARK_DATA: Record<SparkTrend, { v: number }[]> = {
  sharp:    [3, 5, 8, 12, 17, 22, 28].map(v => ({ v })),
  moderate: [5, 7, 9, 11, 14, 17, 21].map(v => ({ v })),
  slight:   [8, 9, 10, 11, 12, 13, 15].map(v => ({ v })),
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Sparkline({ trend, color, uid }: { trend: SparkTrend; color: string; uid: string }) {
  const gradId = `sg-${uid}`
  return (
    <ResponsiveContainer width="100%" height={28}>
      <AreaChart data={SPARK_DATA[trend]} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.30} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          dataKey="v"
          stroke={color}
          fill={`url(#${gradId})`}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function EscalationChart() {
  return (
    <div className="rounded-xl shrink-0 overflow-hidden" style={{ background: 'white', padding: '8px' }}>
      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={ESCALATION_DATA} margin={{ top: 4, right: 20, bottom: 0, left: 20 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="#f0f0f0" strokeWidth={1} />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 9, fill: '#27272a', fontFamily: 'Geist Variable' }}
            axisLine={{ stroke: '#f0f0f0' }}
            tickLine={false}
            height={18}
          />
          <Line dataKey="l0" stroke="#c8c8c8" strokeWidth={1.5} dot={false} isAnimationActive={false} type="monotone" />
          <Line dataKey="l1" stroke="#ffab02" strokeWidth={1.5} dot={false} isAnimationActive={false} type="monotone" />
          <Line dataKey="l2" stroke="#fd6900" strokeWidth={1.5} dot={false} isAnimationActive={false} type="monotone" />
          <Line dataKey="l3" stroke="#dd0e0e" strokeWidth={1.5} dot={false} isAnimationActive={false} type="monotone" />
        </LineChart>
      </ResponsiveContainer>
    </div>
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

// ── Observed station card — mirrors AlertCard layout, progress bar instead of heatbar ──
function ObservedStationCard({ station }: { station: Station }) {
  const [isHovered, setIsHovered] = useState(false)
  const pct = Math.min(100, Math.round(station.value / station.thresholds.l3 * 100))

  return (
    <div
      className="w-full rounded-lg flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? '#ffffff' : '#fafafa',
        boxShadow: isHovered ? SHADOW_MD : SHADOW_XS,
        padding: '8px',
        gap: '8px',
        transition: 'background 150ms ease, box-shadow 150ms ease',
      }}
    >
      <div className="flex items-start justify-between w-full gap-2">
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-[14px] leading-5 text-[#0a0a0a] truncate">{station.name}</span>
          <span
            className="text-[12px] leading-4 whitespace-nowrap"
            style={{ color: isHovered ? '#0a0a0a' : '#737373', transition: 'color 150ms ease' }}
          >
            {station.river} · {station.value} cm
          </span>
        </div>
        <SeverityBadge severity={station.severity} trend={station.trend} />
      </div>
      {/* Progress bar — same 12px container height as Heatbar */}
      <div className="flex items-center w-full" style={{ height: '12px' }}>
        <div
          style={{
            width: '100%',
            height: isHovered ? '4px' : '2px',
            borderRadius: '100px',
            background: 'rgba(184,184,184,0.12)',
            transition: 'height 150ms ease',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: '100%', width: `${pct}%`, background: severityColor(station.severity), borderRadius: '100px' }} />
        </div>
      </div>
    </div>
  )
}

// ── Layout constants ───────────────────────────────────────────────────────────
const SECTION: React.CSSProperties = { background: '#f5f5f5', borderRadius: '12px', padding: '4px' }
const CARD: React.CSSProperties    = { background: '#fafafa', borderRadius: '8px',  padding: '8px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }
const SHADOW_XS = '0 1px 2px 0 rgba(0,0,0,0.05)'
const SHADOW_MD = '0px 4px 6px -1px rgba(0,0,0,0.10), 0px 2px 4px -2px rgba(0,0,0,0.10)'
const HDR: React.CSSProperties     = { background: '#fafafa', borderRadius: '8px', padding: '8px 8px 8px 12px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }

const SECTION_LABEL = 'text-[10px] font-semibold tracking-[0.07em] uppercase'

function CardHover({
  children,
  style,
  className = '',
}: {
  children: (hovered: boolean) => React.ReactNode
  style?: React.CSSProperties
  className?: string
}) {
  const [hovered, setIsHovered] = useState(false)
  return (
    <div
      className={`rounded-lg shrink-0 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...CARD,
        background: hovered ? '#ffffff' : '#fafafa',
        boxShadow: hovered ? SHADOW_MD : SHADOW_XS,
        transition: 'background 150ms ease, box-shadow 150ms ease',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children(hovered)}
    </div>
  )
}

interface LeftPanelProps {
  mouseContainer?: RefObject<HTMLElement | null>
}

export function LeftPanel(_props: LeftPanelProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className="lg-panel flex flex-col max-h-full min-h-0 w-68 shrink-0"
      style={{ padding: '4px 4px 0 4px', gap: '8px' }}
    >

      {/* ── Pinned ESKALACJA header — content slides under it on scroll ── */}
      <div
        className="shrink-0 flex items-center gap-2"
        style={{
          background: '#dd0e0e',
          borderRadius: '12px',
          padding: '8px 12px',
          minHeight: '36px',
          position: 'relative',
          zIndex: 2,
          boxShadow: isScrolled
            ? '0 4px 16px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.10)'
            : '0 0 0 rgba(0,0,0,0)',
          transition: 'box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <CircleAlert size={14} color="white" strokeWidth={2.5} style={{ flexShrink: 0 }} />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.07em]"
          style={{ color: '#ffffff' }}
        >
          ESKALACJA
        </span>
      </div>

      {/* ── Scrollable content — no gap, slides flush under ESKALACJA ─────── */}
      <div
        ref={scrollRef}
        className="flex-1 panel-scroll min-h-0 flex flex-col"
        onScroll={(e) => setIsScrolled((e.currentTarget as HTMLDivElement).scrollTop > 0)}
        style={{ gap: '8px', paddingBottom: '4px' }}
      >

        {/* ── 1. WYKRES + STATYSTYKI ─────────────────────────────────────────── */}
        <section className="flex flex-col shrink-0" style={{ ...SECTION, gap: '4px' }}>
          <EscalationChart />
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

        {/* ── 2. PROGNOZY ───────────────────────────────────────────────────── */}
        <section className="flex flex-col shrink-0" style={{ ...SECTION, gap: '4px' }}>
          <div style={HDR}>
            <span className={SECTION_LABEL} style={{ color: '#52525b' }}>Prognozy</span>
            <span className="text-[10px] font-semibold" style={{ color: '#52525b' }}>{forecasts.length}</span>
          </div>

          {forecasts.map(f => {
            const s = sevStyle(f.to)
            return (
              <CardHover key={f.station} className="flex flex-col" style={{ gap: '8px' }}>
                {() => (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col" style={{ gap: '2px' }}>
                        <span className="text-[14px] font-semibold leading-5" style={{ color: '#0a0a0a' }}>{f.station}</span>
                        <span className="text-[12px] leading-4" style={{ color: '#737373' }}>{f.current} cm</span>
                      </div>
                      <InfoBadge label={f.time} />
                    </div>
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      <div className="flex items-center shrink-0" style={{ gap: '4px', minWidth: '152px' }}>
                        {f.from != null && <SevBadge level={f.from} />}
                        <span className="text-[11px]" style={{ color: '#52525b' }}>→</span>
                        <SevBadge level={f.to} />
                        <span className="text-[11px]" style={{ color: '#52525b' }}>·</span>
                        <InfoBadge label={`szczyt ${f.eta}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Sparkline trend={f.spark} color={s.color} uid={f.station} />
                      </div>
                    </div>
                  </>
                )}
              </CardHover>
            )
          })}
        </section>

        {/* ── 3. ANOMALIE ───────────────────────────────────────────────────── */}
        <section className="flex flex-col shrink-0" style={{ ...SECTION, gap: '4px' }}>
          <div style={HDR}>
            <span className={SECTION_LABEL} style={{ color: '#52525b' }}>Anomalie</span>
            <span className="text-[10px] font-semibold" style={{ color: '#52525b' }}>{anomalies.length}</span>
          </div>

          {anomalies.map(a => (
            <CardHover key={a.station} className="flex flex-col" style={{ gap: '6px' }}>
              {() => (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col" style={{ gap: '2px' }}>
                      <span className="text-[14px] font-semibold leading-5" style={{ color: '#0a0a0a' }}>{a.station}</span>
                      <span className="text-[12px] leading-4" style={{ color: '#737373' }}>{a.loc}</span>
                    </div>
                    <InfoBadge label={a.time} />
                  </div>
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
                </>
              )}
            </CardHover>
          ))}
        </section>

        {/* ── 4. OBSERWOWANE ────────────────────────────────────────────────── */}
        <section className="flex flex-col shrink-0" style={{ ...SECTION, gap: '4px' }}>
          <div style={HDR}>
            <span className={SECTION_LABEL} style={{ color: '#52525b' }}>Obserwowane</span>
            <span className="text-[10px] font-semibold" style={{ color: '#52525b' }}>{observed.length}</span>
          </div>

          {observed.map(o => {
            if (o.kind === 'river') return <AlertCard key={o.river.id} river={o.river} hideTime />
            return <ObservedStationCard key={o.station.id} station={o.station} />
          })}
        </section>

      </div>
    </div>
  )
}
