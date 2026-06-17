import { useState } from 'react'
import { basins } from '@/data/mockData'
import { severityColor } from '@/lib/severity'
import type { Station } from '@/types'

const BOUNDS = { west: 16.949, east: 17.177, south: 51.032, north: 51.157 }

function project(lng: number, lat: number) {
  const x = ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * 100
  const y = ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * 100
  return { x, y }
}

function isInBounds(lng: number, lat: number) {
  return lng >= BOUNDS.west && lng <= BOUNDS.east && lat >= BOUNDS.south && lat <= BOUNDS.north
}

// ── Marker shapes from Figma SVG assets ─────────────────────────────────────
function MarkerIcon({ station, size }: { station: Station; size: number }) {
  const color = severityColor(station.severity)

  if (station.trend === 'up') {
    const h = Math.round(size * 17 / 19)
    return (
      <svg width={size} height={h} viewBox="0 0 19 17" fill="none">
        <path
          d="M7.4701 3C8.2399 1.66667 10.1644 1.66667 10.9342 3L16.1304 12C16.9002 13.3333 15.9379 15 14.3983 15H4.006C2.4664 15 1.50414 13.3333 2.27394 12L7.4701 3Z"
          fill={color}
        />
        <path
          d="M6.60449 2.5C7.75923 0.500246 10.6451 0.500241 11.7998 2.5L16.9961 11.5C18.1508 13.5 16.7078 15.9999 14.3984 16H4.00586C1.69654 15.9999 0.253525 13.5 1.4082 11.5L6.60449 2.5Z"
          stroke="white" strokeOpacity={0.5} strokeWidth={2}
        />
      </svg>
    )
  }

  if (station.trend === 'down') {
    const h = Math.round(size * 23 / 25)
    return (
      <svg width={size} height={h} viewBox="0 0 25 23" fill="none">
        <path
          d="M13.9342 17C13.1644 18.3333 11.2399 18.3333 10.4701 17L5.27395 8C4.50415 6.66667 5.4664 5 7.006 5L17.3983 5C18.9379 5 19.9002 6.66667 19.1304 8L13.9342 17Z"
          fill={color}
        />
        <path
          d="M14.7998 17.5C13.6451 19.4998 10.7592 19.4998 9.60449 17.5L4.4082 8.5C3.25353 6.50004 4.69654 4.0001 7.00586 4L17.3984 4C19.7078 4.0001 21.1508 6.50004 19.9961 8.5L14.7998 17.5Z"
          stroke="white" strokeOpacity={0.5} strokeWidth={2}
        />
      </svg>
    )
  }

  // stable — rounded rect
  const h = Math.round(size * 10 / 18)
  return (
    <svg width={size} height={h} viewBox="0 0 18 10" fill="none">
      <rect x="2" y="2" width="14" height="6" rx="3" fill={color} />
      <rect x="1" y="1" width="16" height="8" rx="4" stroke="white" strokeOpacity={0.5} strokeWidth={2} fill="none" />
    </svg>
  )
}

// ── Individual marker ────────────────────────────────────────────────────────
function StationMarker({
  station, isActive, isHover, onMouseEnter, onMouseLeave, onClick,
}: {
  station: Station
  isActive: boolean
  isHover: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}) {
  const color = severityColor(station.severity)
  const isAlert = station.severity !== 'L0'
  const iconSize = isActive ? 26 : 22

  return (
    <div
      className="absolute cursor-pointer"
      style={{ left: '0%', top: '0%' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div
        className="flex items-center"
        style={{
          gap: isActive ? 4 : 8,
          transform: `translate(-${iconSize / 2}px, -50%)`,
        }}
      >
        {/* Icon + radial glow */}
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: iconSize, height: iconSize }}>
          {isAlert && (
            <div
              className="absolute pointer-events-none"
              style={{
                width:  iconSize * 2.6,
                height: iconSize * 2.6,
                left: '50%',
                top:  '50%',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(ellipse at 50% 50%, ${color} 0%, transparent 65%)`,
                opacity: isActive ? 0.60 : 0.42,
                filter: 'blur(3px)',
              }}
            />
          )}
          <MarkerIcon station={station} size={iconSize} />
        </div>

        {/* Hover tooltip */}
        {isHover && !isActive && (
          <div
            className="whitespace-nowrap rounded-lg px-2 pb-2 pt-1"
            style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0px 4px 12px rgba(0,0,0,0.12), 0px 1px 3px rgba(0,0,0,0.08)' }}
          >
            <div className="text-[12px] font-semibold leading-4 text-[#27272a]">{station.name}</div>
            <div className="text-[10px] leading-3 text-[#71717a]">{station.value} cm</div>
          </div>
        )}

        {/* Active tooltip */}
        {isActive && (
          <div
            className="whitespace-nowrap bg-[#18181b] rounded-lg px-2 pb-2 pt-1"
            style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.2), 0px 2px 4px rgba(0,0,0,0.12)' }}
          >
            <div className="text-[12px] font-semibold leading-4 text-white">{station.name}</div>
            <div className="text-[10px] leading-3 text-[#a1a1aa]">{station.value} cm</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Map view ─────────────────────────────────────────────────────────────────
export function MapView() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoverId,  setHoverId]  = useState<string | null>(null)

  const allStations     = basins.flatMap(b => b.rivers.flatMap(r => r.stations))
  const visibleStations = allStations.filter(s => isInBounds(s.lng, s.lat))

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src="/map.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />

      {visibleStations.map(station => {
        const { x, y } = project(station.lng, station.lat)
        const isActive = activeId === station.id
        const isHover  = hoverId  === station.id

        return (
          <div key={station.id} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
            <StationMarker
              station={station}
              isActive={isActive}
              isHover={isHover && !isActive}
              onMouseEnter={() => setHoverId(station.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => setActiveId(prev => prev === station.id ? null : station.id)}
            />
          </div>
        )
      })}
    </div>
  )
}
