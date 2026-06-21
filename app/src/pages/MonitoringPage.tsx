import { useRef, useState } from 'react'
import { LeftPanel } from '@/components/monitoring/LeftPanel'
import { LeftToolbar } from '@/components/monitoring/LeftToolbar'
import { RightPanel } from '@/components/monitoring/RightPanel'
import { RightToolbar } from '@/components/monitoring/RightToolbar'
import { MapView, type MapViewHandle } from '@/components/monitoring/MapView'
import { BottomNav } from '@/components/monitoring/BottomNav'
import type { River } from '@/types'

export function MonitoringPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapViewRef   = useRef<MapViewHandle>(null)
  const [selectedRiver, setSelectedRiver] = useState<River | null>(null)
  const [activeSection, setActiveSection] = useState<'monitoring' | 'analiza' | 'planowanie'>('monitoring')
  // shared hover state — syncs heatbar segments ↔ map markers
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null)

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-background">
      {/* Map (full-screen background) */}
      <div className="absolute inset-0 z-0">
        <MapView
          ref={mapViewRef}
          activeSection={activeSection}
          hoveredStationId={hoveredStationId}
          onStationHover={setHoveredStationId}
        />
      </div>

      {/* Left panel — from top-6; bottom-22=88px = toolbar 40px + gap 24px + bottom 24px */}
      <div className="absolute left-6 top-6 bottom-22 z-10 flex flex-col">
        <LeftPanel mouseContainer={containerRef} />
      </div>

      {/* Left toolbar — independently anchored at bottom-6, same baseline as BottomNav */}
      <div className="absolute left-6 bottom-6 z-10">
        <LeftToolbar
          onZoomIn={() => mapViewRef.current?.zoomIn()}
          onZoomOut={() => mapViewRef.current?.zoomOut()}
        />
      </div>

      {/* Right panel — from top-6 to above toolbar */}
      <div className="absolute right-6 top-6 bottom-22 z-10 flex flex-col">
        <RightPanel
          selectedRiverId={selectedRiver?.id}
          onSelectRiver={setSelectedRiver}
          hoveredStationId={hoveredStationId}
          onStationHover={setHoveredStationId}
          mouseContainer={containerRef}
        />
      </div>

      {/* Right toolbar — independently anchored at bottom-6, same baseline as BottomNav */}
      <div className="absolute right-6 bottom-6 z-10">
        <RightToolbar />
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        mouseContainer={containerRef}
      />
    </div>
  )
}
