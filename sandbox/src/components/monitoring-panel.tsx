import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type SeverityLevel = 'l3' | 'l2' | 'l1'

interface SeverityRow {
  level: SeverityLevel
  label: string
  count: number
  rising: number
  stable: number
  falling: number
}

interface UpcomingEvent {
  id: string
  deltaHours: number
  river: string
  type: 'severity-change' | 'peak' | 'inflow'
  fromLevel?: SeverityLevel
  toLevel?: SeverityLevel
  level?: SeverityLevel
  station?: string
  description: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────
// MOCK DATA — w produkcji z API

const SEVERITY_DATA: SeverityRow[] = [
  { level: 'l3', label: 'L3 Alarm',        count: 3,  rising: 2, stable: 1, falling: 0 },
  { level: 'l2', label: 'L2 Ostrzeżenie',  count: 5,  rising: 1, stable: 3, falling: 1 },
  { level: 'l1', label: 'L1 Uwaga',        count: 8,  rising: 0, stable: 6, falling: 2 },
]

const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: '1',
    deltaHours: 2,
    river: 'Nysa Kłodzka',
    type: 'severity-change',
    fromLevel: 'l2',
    toLevel: 'l3',
    station: 'Kłodzko',
    description: 'przekroczenie progu alarmowego',
  },
  {
    id: '2',
    deltaHours: 6,
    river: 'Bóbr',
    type: 'peak',
    level: 'l2',
    station: 'Żagań',
    description: 'szczyt fali — 178 cm',
  },
  {
    id: '3',
    deltaHours: 14,
    river: 'Odra',
    type: 'inflow',
    description: 'wpływ z Nysy Kłodzkiej',
  },
  {
    id: '4',
    deltaHours: 24,
    river: 'Kwisa',
    type: 'severity-change',
    fromLevel: 'l1',
    toLevel: 'l2',
    station: 'Leśna',
    description: 'przekroczenie progu ostrzegawczego',
  },
  {
    id: '5',
    deltaHours: 31,
    river: 'Nysa Kłodzka',
    type: 'peak',
    level: 'l3',
    station: 'Kłodzko',
    description: 'szczyt fali — 221 cm',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const SEVERITY_COLOR: Record<SeverityLevel, string> = {
  l3: '#D93025',
  l2: '#E8711A',
  l1: '#F5A623',
}

const SEVERITY_BG: Record<SeverityLevel, string> = {
  l3: 'rgba(217,48,37,0.12)',
  l2: 'rgba(232,113,26,0.12)',
  l1: 'rgba(245,166,35,0.12)',
}

function SeverityDot({ level, size = 7 }: { level: SeverityLevel; size?: number }) {
  return (
    <span
      className="shrink-0 rounded-full"
      style={{ width: size, height: size, background: SEVERITY_COLOR[level] }}
    />
  )
}

function SeverityBadge({
  level,
  label,
}: {
  level: SeverityLevel
  label: string
}) {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide"
      style={{ color: SEVERITY_COLOR[level], background: SEVERITY_BG[level] }}
    >
      {label}
    </span>
  )
}

function DirectionStat({
  icon,
  count,
  highlight,
}: {
  icon: string
  count: number
  highlight?: boolean
}) {
  return (
    <span
      className={cn(
        'font-mono text-[11px] tabular-nums',
        highlight ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {icon}{count}
    </span>
  )
}

// ── Blocks ────────────────────────────────────────────────────────────────────

function SeverityBlock() {
  return (
    <section className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Sytuacja
      </p>
      <div className="flex flex-col gap-1.5">
        {SEVERITY_DATA.map((row) => (
          <div key={row.level} className="flex items-center gap-2">
            {/* dot + label */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <SeverityDot level={row.level} />
              <span className="truncate text-[13px] text-foreground">
                {row.label}
              </span>
            </div>

            {/* count */}
            <span
              className="shrink-0 font-mono text-[13px] font-semibold tabular-nums"
              style={{ color: SEVERITY_COLOR[row.level] }}
            >
              {row.count}
            </span>

            {/* directions */}
            <div className="flex shrink-0 items-center gap-1.5">
              <DirectionStat icon="↑" count={row.rising} highlight={row.rising > 0} />
              <DirectionStat icon="→" count={row.stable} />
              <DirectionStat icon="↓" count={row.falling} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function UpcomingEvent({ event }: { event: UpcomingEvent }) {
  return (
    <div className="flex gap-3 py-2.5">
      {/* time */}
      <div className="flex w-10 shrink-0 flex-col items-start gap-0.5 pt-px">
        <span className="font-mono text-[11px] font-medium text-foreground">
          T+{event.deltaHours}h
        </span>
      </div>

      {/* content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-medium text-foreground">
            {event.river}
          </span>
          {event.type === 'severity-change' && event.fromLevel && event.toLevel && (
            <div className="flex shrink-0 items-center gap-0.5">
              <SeverityBadge level={event.fromLevel} label={event.fromLevel.toUpperCase()} />
              <span className="text-[10px] text-muted-foreground">→</span>
              <SeverityBadge level={event.toLevel} label={event.toLevel.toUpperCase()} />
            </div>
          )}
          {event.type === 'peak' && event.level && (
            <SeverityBadge level={event.level} label="peak" />
          )}
        </div>
        <span className="text-left text-[12px] text-muted-foreground">
          {event.station ? `${event.station} — ` : ''}{event.description}
        </span>
      </div>
    </div>
  )
}

function UpcomingBlock() {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Nadchodzące
      </p>
      <ScrollArea className="flex-1">
        <div className="flex flex-col divide-y divide-border">
          {UPCOMING_EVENTS.map((event) => (
            <UpcomingEvent key={event.id} event={event} />
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function MonitoringPanel() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-4 border-r border-border bg-card px-4 py-4">
      <SeverityBlock />
      <Separator />
      <UpcomingBlock />
    </aside>
  )
}
