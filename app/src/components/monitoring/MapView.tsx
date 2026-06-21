import { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import maplibregl from 'maplibre-gl'
import Supercluster from 'supercluster'
import { basins } from '@/data/mockData'
import { BUILDINGS_GEOJSON, WATER_GEOJSON, CANAL_GEOJSON } from '@/data/analysisLayers'
import { severityColor } from '@/lib/severity'
import type { Station, Severity } from '@/types'

// ── Style URLs ────────────────────────────────────────────────────────────────
const STYLE_MONITORING = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
const STYLE_ANALIZA    = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'

const CENTER: [number, number] = [17.02, 51.11]
const ZOOM        = 12.8
const BASE        = 22     // station marker bounding box (px)
const CLUSTER_SIZE = 36    // cluster badge diameter (px)
const SC_MAX_ZOOM  = 12    // supercluster: cluster at zoom ≤ this value

const SEV_ORDER: Record<Severity, number> = { L0: 0, L1: 1, L2: 2, L3: 3 }

type PortalItem =
  | { kind: 'station'; key: string; el: HTMLElement; stationId: string }
  | { kind: 'cluster'; key: string; el: HTMLElement; lng: number; lat: number; clusterId: number; count: number; topSeverity: Severity }

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

// ── Station marker ─────────────────────────────────────────────────────────────
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

  return (
    <div
      style={{ width: BASE, height: BASE, position: 'relative', cursor: 'pointer', pointerEvents: 'auto' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
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
              width: BASE * 1.8, height: BASE * 1.8,
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(ellipse at 50% 50%, ${color} 0%, transparent 55%)`,
              filter: 'blur(1px)',
            }}
          />
        )}
        <MarkerIcon station={station} size={BASE} />
      </div>

      {!isActive && (
        <div
          className="whitespace-nowrap rounded-lg pointer-events-none"
          style={{
            position: 'absolute', left: BASE + 8, top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.94)',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.12), 0px 1px 3px rgba(0,0,0,0.08)',
            padding: '6px 10px',
            opacity: isLocalHover ? 1 : 0,
            transition: 'opacity 140ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="text-[12px] font-semibold leading-4 text-[#27272a]">{station.name}</div>
          <div className="text-[11px] leading-4 text-[#71717a]">{station.value} cm</div>
        </div>
      )}

      {isActive && (
        <div
          className="whitespace-nowrap rounded-lg pointer-events-none"
          style={{
            position: 'absolute', left: BASE + 8, top: '50%',
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

// ── Cluster badge ─────────────────────────────────────────────────────────────
function ClusterMarkerContent({
  count, topSeverity, onClick,
}: {
  count: number
  topSeverity: Severity
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const color   = severityColor(topSeverity)
  const isAlert = topSeverity !== 'L0'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: CLUSTER_SIZE, height: CLUSTER_SIZE,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.8)',
        border: `2px solid ${color}`,
        boxShadow: hovered
          ? (isAlert
            ? `0 0 0 5px ${color}26, 0 6px 18px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.14)`
            : '0 6px 18px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.12)')
          : (isAlert
            ? `0 0 0 5px ${color}26, 0 2px 10px rgba(0,0,0,0.16)`
            : '0 2px 8px rgba(0,0,0,0.12)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', pointerEvents: 'auto',
        transform: hovered ? 'scale(1.12)' : 'scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        animation: 'cluster-appear 200ms ease-out',  // no fill-mode — lets hover transform work
      }}
    >
      <span style={{
        fontFamily: 'Geist, sans-serif',
        fontSize: '13px', fontWeight: 600,
        color: '#09090B', lineHeight: 1,
        letterSpacing: '-0.2px',
        position: 'relative', zIndex: 21,
      }}>
        {count > 99 ? '99+' : count}
      </span>
    </div>
  )
}

// ── Analysis layers ───────────────────────────────────────────────────────────
function addAnalysisLayers(map: maplibregl.Map) {
  if (map.getSource('dec-buildings')) return
  map.addSource('dec-buildings', { type: 'geojson', data: BUILDINGS_GEOJSON })
  map.addLayer({ id: 'dec-buildings-fill',   type: 'fill', source: 'dec-buildings', paint: { 'fill-color': '#7C3AED', 'fill-opacity': 0.75 } })
  map.addLayer({ id: 'dec-buildings-stroke', type: 'line', source: 'dec-buildings', paint: { 'line-color': '#5B21B6', 'line-width': 0.8 } })
  map.addSource('dec-water', { type: 'geojson', data: WATER_GEOJSON })
  map.addLayer({ id: 'dec-water-fill',   type: 'fill', source: 'dec-water', paint: { 'fill-color': '#3B82F6', 'fill-opacity': 0.65 } })
  map.addLayer({ id: 'dec-water-stroke', type: 'line', source: 'dec-water', paint: { 'line-color': '#1D4ED8', 'line-width': 1 } })
  map.addSource('dec-canal', { type: 'geojson', data: CANAL_GEOJSON })
  map.addLayer({ id: 'dec-canal-line', type: 'line', source: 'dec-canal', paint: { 'line-color': '#0f0f10', 'line-width': 2.5, 'line-opacity': 0.85 } })
}

// ── MapView ───────────────────────────────────────────────────────────────────
interface MapViewProps {
  activeSection: 'monitoring' | 'analiza' | 'planowanie'
  hoveredStationId?: string | null
  onStationHover?: (id: string | null) => void
}
export interface MapViewHandle {
  zoomIn:  () => void
  zoomOut: () => void
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  { activeSection, hoveredStationId, onStationHover },
  ref,
) {
  const mapContainerRef  = useRef<HTMLDivElement>(null)
  const mapRef           = useRef<maplibregl.Map | null>(null)
  const activeSectionRef = useRef(activeSection)
  const currentStyleRef  = useRef(STYLE_MONITORING)

  useImperativeHandle(ref, () => ({
    zoomIn:  () => mapRef.current?.zoomIn({ duration: 280 }),
    zoomOut: () => mapRef.current?.zoomOut({ duration: 280 }),
  }))

  const [activeId,     setActiveId]     = useState<string | null>(null)
  const [localHoverId, setLocalHoverId] = useState<string | null>(null)
  const [portals,      setPortals]      = useState<PortalItem[]>([])

  const allStations = useMemo(
    () => basins.flatMap(b => b.rivers.flatMap(r => r.stations)),
    [],
  )
  const stationsById = useMemo(
    () => new Map(allStations.map(s => [s.id, s])),
    [allStations],
  )

  // Supercluster — stable instance, loaded once
  const sc = useMemo(() => {
    const instance = new Supercluster<{ stationId: string }>({ radius: 60, maxZoom: SC_MAX_ZOOM, minZoom: 0 })
    instance.load(allStations.map(s => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { stationId: s.id },
    })))
    return instance
  }, [allStations])

  const scRef          = useRef(sc);          scRef.current = sc
  const stationsByIdRef = useRef(stationsById); stationsByIdRef.current = stationsById
  const markersRef     = useRef<maplibregl.Marker[]>([])

  // rebuildMarkersRef — always points to latest rebuildMarkers closure
  const rebuildMarkersRef = useRef<() => void>(() => {})

  function rebuildMarkers() {
    const map    = mapRef.current
    const scInst = scRef.current
    if (!map) return

    // Remove previous markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const zoom   = Math.floor(map.getZoom())
    const bounds = map.getBounds()
    const bbox: [number, number, number, number] = [
      bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth(),
    ]

    const features = scInst.getClusters(bbox, zoom)
    const newPortals: PortalItem[] = []

    features.forEach(f => {
      const [lng, lat] = f.geometry.coordinates as [number, number]

      if ((f.properties as Record<string, unknown>)?.cluster) {
        // ── Cluster badge ───────────────────────────────────────────────
        const props     = f.properties as { cluster_id: number; point_count: number }
        const clusterId = props.cluster_id
        const count     = props.point_count

        let topSeverity: Severity = 'L0'
        scInst.getLeaves(clusterId, Infinity).forEach(leaf => {
          const s = stationsByIdRef.current.get((leaf.properties as { stationId: string }).stationId)
          if (s && SEV_ORDER[s.severity] > SEV_ORDER[topSeverity]) topSeverity = s.severity
        })

        const el = document.createElement('div')
        el.style.cssText = `width:${CLUSTER_SIZE}px;height:${CLUSTER_SIZE}px;overflow:visible;pointer-events:none;`

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lng, lat])
          .addTo(map)

        markersRef.current.push(marker)
        newPortals.push({ kind: 'cluster', key: `c:${clusterId}`, el, lng, lat, clusterId, count, topSeverity })

      } else {
        // ── Individual station marker ────────────────────────────────────
        const stationId = (f.properties as { stationId: string }).stationId
        const el = document.createElement('div')
        el.style.cssText = `width:${BASE}px;height:${BASE}px;overflow:visible;pointer-events:none;`

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lng, lat])
          .addTo(map)

        markersRef.current.push(marker)
        newPortals.push({ kind: 'station', key: `s:${stationId}`, el, stationId })
      }
    })

    setPortals(newPortals)
  }

  rebuildMarkersRef.current = rebuildMarkers

  // ── Map init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style:     STYLE_MONITORING,
      center:    CENTER,
      zoom:      ZOOM,
      attributionControl: false,
    })
    mapRef.current = map

    map.on('load',       () => rebuildMarkersRef.current())
    map.on('moveend',    () => rebuildMarkersRef.current())
    map.on('style.load', () => {
      if (activeSectionRef.current === 'analiza') addAnalysisLayers(map)
      rebuildMarkersRef.current()
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      setPortals([])
      map.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Style switching ───────────────────────────────────────────────────────
  useEffect(() => {
    activeSectionRef.current = activeSection
    const map = mapRef.current
    if (!map) return
    const style = activeSection === 'analiza' ? STYLE_ANALIZA : STYLE_MONITORING
    if (currentStyleRef.current !== style) {
      currentStyleRef.current = style
      map.setStyle(style)
    }
  }, [activeSection])

  function handleEnter(id: string) { setLocalHoverId(id); onStationHover?.(id) }
  function handleLeave()           { setLocalHoverId(null); onStationHover?.(null) }

  function handleClusterClick(item: Extract<PortalItem, { kind: 'cluster' }>) {
    const map    = mapRef.current
    const scInst = scRef.current
    if (!map) return
    const expansionZoom = Math.min(scInst.getClusterExpansionZoom(item.clusterId), 20)
    map.easeTo({ center: [item.lng, item.lat], zoom: expansionZoom, duration: 400 })
  }

  return (
    <>
      <div ref={mapContainerRef} className="absolute inset-0" />

      {portals.map(item => {
        if (item.kind === 'station') {
          const station = stationsById.get(item.stationId)
          if (!station) return null
          return createPortal(
            <StationMarkerContent
              station={station}
              isActive={activeId === item.stationId}
              isLocalHover={localHoverId === item.stationId}
              isPanelHover={(hoveredStationId === item.stationId) && localHoverId !== item.stationId}
              onMouseEnter={() => handleEnter(item.stationId)}
              onMouseLeave={handleLeave}
              onClick={() => setActiveId(prev => prev === item.stationId ? null : item.stationId)}
            />,
            item.el,
            item.key,
          )
        }

        return createPortal(
          <ClusterMarkerContent
            count={item.count}
            topSeverity={item.topSeverity}
            onClick={() => handleClusterClick(item)}
          />,
          item.el,
          item.key,
        )
      })}
    </>
  )
})
