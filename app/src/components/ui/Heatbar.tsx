import { useState } from 'react'
import type { Station } from '@/types'
import { severityColor } from '@/lib/severity'

interface HeatbarProps {
  stations: Station[]
  isCardHovered?: boolean
  hoveredStationId?: string | null
  onStationHover?: (id: string | null) => void
}

export function Heatbar({ stations, isCardHovered, hoveredStationId, onStationHover }: HeatbarProps) {
  const [localHovered, setLocalHovered] = useState<string | null>(null)

  if (stations.length === 0) return null

  const segments = stations.map(s => ({ id: s.id, severity: s.severity, stationId: s.id }))

  const activeId = hoveredStationId ?? localHovered

  // Does the currently hovered station belong to THIS river's segments?
  // If yes, react even when the card itself isn't mouse-hovered (e.g. map→panel sync).
  // If no (station is on a different river/card), stay neutral — prevents bleeding.
  const isInThisRiver = activeId !== null && segments.some(s => s.stationId === activeId)
  const isAnySegmentHovered = (isCardHovered || isInThisRiver) && activeId !== null

  function handleEnter(stationId: string) {
    setLocalHovered(stationId)
    onStationHover?.(stationId)
  }
  function handleLeave() {
    setLocalHovered(null)
    onStationHover?.(null)
  }

  return (
    <div className="flex items-center w-full" style={{ gap: '2px', height: '12px' }}>
      {segments.map(seg => {
        const isActive = seg.stationId === activeId && isAnySegmentHovered

        // Active: 5px | Card hovered: all at 4px | Default: 2px
        const visualHeight = isActive ? '5px' : isCardHovered ? '4px' : '2px'
        const opacity = (isAnySegmentHovered && !isActive) ? 0.45 : 1

        return (
          <div
            key={seg.id}
            className="flex-1 h-full flex items-center cursor-pointer"
            onMouseEnter={() => handleEnter(seg.stationId)}
            onMouseLeave={handleLeave}
          >
            <div
              style={{
                width: '100%',
                height: visualHeight,
                borderRadius: '100px',
                backgroundColor: severityColor(seg.severity),
                opacity,
                transition: 'height 150ms ease, opacity 250ms ease',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
