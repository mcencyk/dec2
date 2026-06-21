import { useState } from 'react'
import type { River } from '@/types'
import { dominantStation, maxSeverity } from '@/data/mockData'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { Heatbar } from '@/components/ui/Heatbar'

interface AlertCardProps {
  river: River
  onClick?: () => void
  selected?: boolean
  hoveredStationId?: string | null
  onStationHover?: (id: string | null) => void
  hideTime?: boolean
}

const SHADOW_XS = '0px 1px 2px 0px rgba(0,0,0,0.05)'
const SHADOW_MD = '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)'

export function AlertCard({ river, onClick, selected, hoveredStationId, onStationHover, hideTime }: AlertCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const dominant = dominantStation(river.stations)
  const severity = maxSeverity(river.stations)

  const showHoverStyle = isHovered || selected

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full text-left rounded-lg cursor-pointer flex flex-col"
      style={{
        background: showHoverStyle ? '#ffffff' : '#fafafa',
        boxShadow: showHoverStyle ? SHADOW_MD : SHADOW_XS,
        padding: '8px',
        gap: '8px',
        outline: selected ? '2px solid rgba(79,70,229,0.2)' : 'none',
        transition: 'background 150ms ease, box-shadow 150ms ease',
      }}
    >
      {/* Top row: [left col: river name + station] [right: badge + time] */}
      {/* River name and station have NO gap between them — same flex-col per Figma */}
      <div className="flex items-start justify-between w-full gap-2">
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-[14px] leading-5 text-[#0a0a0a] truncate">
            {river.displayName}
          </span>
          <span
            className="text-[12px] leading-4 whitespace-nowrap"
            style={{
              color: showHoverStyle ? '#0a0a0a' : '#737373',
              transition: 'color 150ms ease',
            }}
          >
            {dominant.name} · {dominant.value} cm
          </span>
        </div>
        <SeverityBadge severity={severity} trend={dominant.trend} time={hideTime ? undefined : dominant.lastUpdate} />
      </div>

      {/* Heatbar */}
      <Heatbar
        stations={river.stations}
        isCardHovered={showHoverStyle}
        hoveredStationId={hoveredStationId}
        onStationHover={onStationHover}
      />
    </button>
  )
}
