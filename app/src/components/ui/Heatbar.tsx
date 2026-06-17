import { useState } from 'react'
import type { Station } from '@/types'
import { severityColor } from '@/lib/severity'

interface HeatbarProps {
  stations: Station[]
  // bidirectional sync with map: parent controls which station is highlighted
  hoveredStationId?: string | null
  onStationHover?: (id: string | null) => void
}

export function Heatbar({ stations, hoveredStationId, onStationHover }: HeatbarProps) {
  const [localHovered, setLocalHovered] = useState<string | null>(null)

  if (stations.length === 0) return null

  // Margin segments represent "beyond the visible stretch" — grey, non-interactive
  const segments = [
    { id: 'left-margin',  severity: 'L0' as const, isMargin: true,  stationId: null },
    ...stations.map(s => ({ id: s.id, severity: s.severity, isMargin: false, stationId: s.id })),
    { id: 'right-margin', severity: 'L0' as const, isMargin: true,  stationId: null },
  ]

  // Active highlight: from parent (map hover) takes priority, else local hover
  const activeId = hoveredStationId ?? localHovered

  function handleEnter(stationId: string | null) {
    setLocalHovered(stationId)
    onStationHover?.(stationId)
  }
  function handleLeave() {
    setLocalHovered(null)
    onStationHover?.(null)
  }

  return (
    <div className="flex items-center w-full" style={{ gap: '2px', height: '4px' }}>
      {segments.map(seg => {
        const isActive = !seg.isMargin && seg.stationId === activeId
        return (
          <div
            key={seg.id}
            className="flex-1"
            onMouseEnter={seg.isMargin ? undefined : () => handleEnter(seg.stationId)}
            onMouseLeave={seg.isMargin ? undefined : handleLeave}
            style={{
              height: isActive ? '4px' : '2px',
              borderRadius: '100px',
              backgroundColor: seg.isMargin ? '#b8b8b8' : severityColor(seg.severity),
              opacity: seg.isMargin ? 0.5 : 1,
              transition: 'height 120ms ease',
              cursor: seg.isMargin ? undefined : 'pointer',
            }}
          />
        )
      })}
    </div>
  )
}
