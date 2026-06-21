import { useEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import maplibregl from 'maplibre-gl'
import { basins } from '@/data/mockData'
import { BUILDINGS_GEOJSON, WATER_GEOJSON, CANAL_GEOJSON } from '@/data/analysisLayers'
import { severityColor } from '@/lib/severity'
import type { Station } from '@/types'

// ── Style URLs ────────────────────────────────────────────────────────────────
const STYLE_MONITORING = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
const STYLE_ANALIZA    = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'

// Wrocław — Odra, Śródmieście
const CENTER: [number, number] = [17.02, 51.11]
const ZOOM = 12.8
const BASE = 22  // marker icon bounding box size (px)

// ── Marker shapes ─────────────────────────────────────────────────────────────
function MarkerIcon({ station, size }: { station: Station; size: number }) {
  const color = severityColor(station.severity)

  if (station.trend === 'up') {
    const h = Math.round(size * 17 / 19)
    return (
      <svg width={size} height={h} viewBox="0 0 19 17" fill="none">
        <path d="M7.4701 3C8.2399 1.66667 10.1644 1.66667 10.9342 3L16.1304 12C16.9002 13.3333 15.9379 15 14.3983 15H4.006C2.4664 15 1.50414 13.3333 2.27394 12L7.4701 3Z" fill={color} />
        <path d="M6.60449 2.5C7.75923 0.500246 10.6451 0.500241 11.7998 2.5L16.9961 11.5C18.1508 13.5 16.7078 15.9999 14.3984 16H4.00586C1.69654 15.9999 0.253525 13.5 1.4082 11.5L6.60449 2.5Z" stroke="white" strokeOpacity={0.5} strokeWidth={2} />
      </svg>
    )
  }

  if (station.trend === 'down') {
    const h = Math.round(size * 16 / 19)
    return (
      <svg width={size} height={h} viewBox="3 3.5 19 16" fill="none">
        <path d="M13.9342 17C13.1644 18.3333 11.2399 18.3333 10.4701 17L5.27395 8C4.50415 6.66667 5.4664 5 7.006 5L17.3983 5C18.9379 5 19.9002 6.66667 19.1304 8L13.9342 17Z" fill={color} />
        <path d="M14.7998 17.5C13.6451 19.4998 10.7592 19.4998 9.60449 17.5L4.4082 8.5C3.25353 6.50004 4.69654 4.0001 7.00586 4L17.3984 4C19.7078 4.0001 21.1508 6.50004 19.9961 8.5L14.7998 17.5Z" stroke="white" strokeOpacity={0.5} strokeWidth={2} />
      </svg>
    )
  }

  const h = Math.round(size * 10 / 18)
  return (
    <svg width={size} height={h} viewBox="0 0 18 10" fill="none">
      <rect x="2" y="2" width="14" height="6" rx="3" fill={color} />
      <rect x="1" y="1" width="16" height="8" rx="4" stroke="white" strokeOpacity={0.5} strokeWidth={2} fill="none" />
    </svg>
  )
}

// ── Marker content (renders into a MapLibre DOM marker via portal) ─────────────
function StationMarkerContent({
  station, isActive, isLocalHover, isPanelHover, onMouseEnter, onMouseLeave, onClick,
}: {
  station: Station
  isActive: boolean
  isLocalHover: boolean
  isPanelHover: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}) {
  const color = severityColor(station.severity)
  const isAlert = station.severity !== 'L0'
  const isHighlighted = isActive || isLocalHover || isPanelHover

  const glowOpacityClass = isHighlighted
    ? 'animate-glow-pulse-fast'
    : isAlert
    ? 'animate-glow-pulse'
    : undefined

  // The portal target el is BASE×BASE px, centered on lat/lng by MapLibre (anchor: center).
  // Tooltip overflows to the right via overflow:visible on the portal target.
  return (
    <div
      style={{
        width: BASE, height: BASE,
        position: 'relative',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Icon + radial glow — centered in the BASE×BASE box */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: isActive ? 'scale(1.18)' : 'scale(1)',
          filter: isHighlighted
            ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.22)) drop-shadow(0 1px 3px rgba(0,0,0,0.14))'
            : 'none',
          transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), filter 140ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {isAlert && (
          <div
            className={`absolute pointer-events-none ${glowOpacityClass ?? ''}`}
            style={{
              width:  BASE * 1.8,
              height: BASE * 1.8,
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(ellipse at 50% 50%, ${color} 0%, transparent 55%)`,
              filter: 'blur(1px)',
            }}
          />
        )}
        <MarkerIcon station={station} size={BASE} />
      </div>

      {/* Hover tooltip — white card, shown on map hover only (not when active) */}
      {!isActive && (
        <div
          className="whitespace-nowrap rounded-lg pointer-events-none"
          style={{
            position: 'absolute',
            left: BASE + 8,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.94)',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.12), 0px 1px 3px rgba(0,0,0,0.08)',
            padding: '6px 10px',
            opacity: isLocalHover ? 1 : 0,
            transition: 'opacity 140ms cubic-bezier(0.16, 1, 0.3, 1), transform 140ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="text-[12px] font-semibold leading-4 text-[#27272a]">{station.name}</div>
          <div className="text-[11px] leading-4 text-[#71717a]">{station.value} cm</div>
        </div>
      )}

      {/* Active tooltip — dark card, always visible when active */}
      {isActive && (
        <div
          className="whitespace-nowrap rounded-lg pointer-events-none"
          style={{
            position: 'absolute',
            left: BASE + 8,
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#18181b',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.2), 0px 2px 4px rgba(0,0,0,0.12)',
            padding: '6px 10px',
          }}
        >
          <div className="text-[12px] font-semibold leading-4 text-white">{station.name}</div>
          <div className="text-[11px] leading-4 text-[#a1a1aa]">{station.value} cm</div>
        </div>
      )}
    </div>
  )
}

// ── Analysis data layers ──────────────────────────────────────────────────────
function addAnalysisLayers(map: maplibregl.Map) {
  // Guard: skip if sources already exist (e.g. double style.load fire)
  if (map.getSource('dec-buildings')) return

  map.addSource('dec-buildings', { type: 'geojson', data: BUILDINGS_GEOJSON })
  map.addLayer({
    id: 'dec-buildings-fill',
    type: 'fill',
    source: 'dec-buildings',
    paint: { 'fill-color': '#7C3AED', 'fill-opacity': 0.75 },
  })
  map.addLayer({
    id: 'dec-buildings-stroke',
    type: 'line',
    source: 'dec-buildings',
    paint: { 'line-color': '#5B21B6', 'line-width': 0.8 },
  })

  map.addSource('dec-water', { type: 'geojson', data: WATER_GEOJSON })
  map.addLayer({
    id: 'dec-water-fill',
    type: 'fill',
    source: 'dec-water',
    paint: { 'fill-color': '#3B82F6', 'fill-opacity': 0.65 },
  })
  map.addLayer({
    id: 'dec-water-stroke',
    type: 'line',
    source: 'dec-water',
    paint: { 'line-color': '#1D4ED8', 'line-width': 1 },
  })

  map.addSource('dec-canal', { type: 'geojson', data: CANAL_GEOJSON })
  map.addLayer({
    id: 'dec-canal-line',
    type: 'line',
    source: 'dec-canal',
    paint: { 'line-color': '#0f0f10', 'line-width': 2.5, 'line-opacity': 0.85 },
  })
}

// ── MapView ───────────────────────────────────────────────────────────────────
interface MapViewProps {
  activeSection: 'monitoring' | 'analiza' | 'planowanie'
  hoveredStationId?: string | null
  onStationHover?: (id: string | null) => void
}

export function MapView({ activeSection, hoveredStationId, onStationHover }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef          = useRef<maplibregl.Map | null>(null)
  // Refs for event callbacks — always see current values without re-creating map
  const activeSectionRef  = useRef(activeSection)
  const currentStyleRef   = useRef(STYLE_MONITORING)

  // Map<stationId → DOM element> — portal targets created by MapLibre Marker
  const [portalMap, setPortalMap] = useState<Map<string, HTMLElement>>(new Map())
  // Keep Marker instances so we can call marker.remove() before map.remove()
  const mapMarkersRef = useRef<maplibregl.Marker[]>([])

  const [activeId,     setActiveId]     = useState<string | null>(null)
  const [localHoverId, setLocalHoverId] = useState<string | null>(null)

  const allStations = useMemo(
    () => basins.flatMap(b => b.rivers.flatMap(r => r.stations)),
    [],
  )
  const stationsById = useMemo(
    () => new Map(allStations.map(s => [s.id, s])),
    [allStations],
  )

  // ── Map initialization (once) ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: STYLE_MONITORING,
      center: CENTER,
      zoom: ZOOM,
      attributionControl: false,
    })

    mapRef.current = map

    // Create a 0x0 overflow-visible DOM element for each station
    // → MapLibre centers it at lat/lng; we portal React content into it
    const portals = new Map<string, HTMLElement>()

    allStations.forEach(station => {
      const el = document.createElement('div')
      // BASE×BASE so MapLibre's anchor:'center' centers the icon exactly at lat/lng
      el.style.cssText = `position:absolute;width:${BASE}px;height:${BASE}px;overflow:visible;pointer-events:none;`

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([station.lng, station.lat])
        .addTo(map)

      mapMarkersRef.current.push(marker)
      portals.set(station.id, el)
    })

    setPortalMap(portals)

    // Re-add data layers after every style change
    map.on('style.load', () => {
      if (activeSectionRef.current === 'analiza') {
        addAnalysisLayers(map)
      }
    })

    return () => {
      // Detach markers from map BEFORE map.remove() so portal targets
      // aren't torn out of the DOM while React portals still reference them.
      mapMarkersRef.current.forEach(m => m.remove())
      mapMarkersRef.current = []
      setPortalMap(new Map())
      map.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Style switching ────────────────────────────────────────────────────────
  useEffect(() => {
    activeSectionRef.current = activeSection
    const map = mapRef.current
    if (!map) return

    const style = activeSection === 'analiza' ? STYLE_ANALIZA : STYLE_MONITORING
    if (currentStyleRef.current !== style) {
      currentStyleRef.current = style
      map.setStyle(style)
      // 'style.load' handler (registered at init) re-adds data layers when needed
    }
  }, [activeSection])

  // ── Hover handlers ─────────────────────────────────────────────────────────
  function handleEnter(id: string) {
    setLocalHoverId(id)
    onStationHover?.(id)
  }
  function handleLeave() {
    setLocalHoverId(null)
    onStationHover?.(null)
  }

  return (
    <>
      {/* MapLibre canvas container */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Station markers — portaled into MapLibre DOM marker elements */}
      {Array.from(portalMap.entries()).map(([stationId, el]) => {
        const station = stationsById.get(stationId)
        if (!station) return null

        return createPortal(
          <StationMarkerContent
            station={station}
            isActive={activeId === stationId}
            isLocalHover={localHoverId === stationId}
            isPanelHover={(hoveredStationId === stationId) && (localHoverId !== stationId)}
            onMouseEnter={() => handleEnter(stationId)}
            onMouseLeave={handleLeave}
            onClick={() => setActiveId(prev => prev === stationId ? null : stationId)}
          />,
          el,
        )
      })}
    </>
  )
}
