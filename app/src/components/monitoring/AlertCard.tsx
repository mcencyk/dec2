import type { River } from '@/types'
import { dominantStation, maxSeverity } from '@/data/mockData'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { Heatbar } from '@/components/ui/Heatbar'

interface AlertCardProps {
  river: River
  onClick?: () => void
  selected?: boolean
}

export function AlertCard({ river, onClick, selected }: AlertCardProps) {
  const dominant = dominantStation(river.stations)
  const severity = maxSeverity(river.stations)

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-2.5 py-2.5 rounded-lg cursor-pointer
        transition-all duration-180
        ${selected ? 'ring-2 ring-offset-1 ring-primary/20' : ''}
      `}
      style={{
        background: 'rgba(255,255,255,0.82)',
        boxShadow: '0px 1px 3px rgba(0,0,0,0.07), 0px 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      {/* Line 1: river name + badge + time */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-[14px] leading-tight text-foreground">
          {river.displayName}
        </span>
        <SeverityBadge severity={severity} trend={dominant.trend} time={dominant.lastUpdate} />
      </div>

      {/* Line 2: dominant station + value */}
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className="text-[13px] text-muted-foreground">{dominant.name}</span>
        <span className="text-[13px] font-mono text-muted-foreground">·</span>
        <span className="text-[13px] font-mono tabular-nums text-foreground font-medium">
          {dominant.value} cm
        </span>
      </div>

      {/* Line 3: heatbar */}
      <Heatbar stations={river.stations} />
    </button>
  )
}
