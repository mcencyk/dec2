import { useState } from 'react'
import type { RefObject } from 'react'
import { Search } from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { AlertCard } from './AlertCard'
import { basins } from '@/data/mockData'
import type { River } from '@/types'

interface RightPanelProps {
  selectedRiverId?: string
  onSelectRiver?: (river: River) => void
  hoveredStationId?: string | null
  onStationHover?: (id: string | null) => void
  mouseContainer?: RefObject<HTMLElement | null>
}

const BADGE_COLOR = '#e50004'

export function RightPanel({ selectedRiverId, onSelectRiver, hoveredStationId, onStationHover }: RightPanelProps) {
  const [searchHovered, setSearchHovered] = useState(false)

  return (
    <div
      className="lg-panel flex flex-col max-h-full min-h-0 w-70 shrink-0"
      style={{ padding: '4px 4px 0 4px', gap: '8px' }}
    >
      {/* Search bar with inline filter button */}
      <div
        className="flex items-center shrink-0 cursor-text"
        onMouseEnter={() => setSearchHovered(true)}
        onMouseLeave={() => setSearchHovered(false)}
        style={{
          background: 'white',
          border: `1px solid ${searchHovered ? '#a1a1aa' : '#d4d4d4'}`,
          borderRadius: '12px',
          padding: '4px 4px 4px 12px',
          minHeight: '36px',
          boxShadow: searchHovered
            ? '0px 2px 6px rgba(0,0,0,0.10)'
            : '0px 1px 2px 0px rgba(0,0,0,0.05)',
          gap: '8px',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
        }}
      >
        <Search style={{ width: '16px', height: '16px', color: '#737373', flexShrink: 0 }} />
        <input
          placeholder="Szukaj..."
          className="flex-1 bg-transparent text-[14px] leading-5 text-[#0a0a0a] placeholder:text-[#737373] outline-none border-none cursor-text"
        />

        {/* Filter button — inside search pill, right side */}
        <Tooltip text="Filtry" side="bottom">
          <div
            className="flex items-center justify-center shrink-0 cursor-pointer rounded-lg transition-colors duration-180 hover:bg-black/5"
            style={{ width: '28px', height: '28px' }}
          >
            <div className="overflow-clip relative shrink-0 size-4">
              <div className="absolute" style={{ inset: '21.88% 9.38%' }}>
                <img alt="Filtry" className="absolute block inset-0 max-w-none size-full" src="/toolbar-filter.svg" draggable={false} />
              </div>
            </div>
          </div>
        </Tooltip>
      </div>

      {/* Alert list */}
      <div className="flex-1 panel-scroll min-h-0" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '4px' }}>
        {basins.map(basin => (
          <div
            key={basin.id}
            style={{
              background: '#f5f5f5',
              borderRadius: '12px',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {/* Basin header */}
            <div
              style={{
                background: '#fafafa',
                borderRadius: '8px',
                padding: '8px 8px 8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                className="font-semibold uppercase tracking-[0.07em]"
                style={{ fontSize: '10px', lineHeight: '12px', color: '#52525b' }}
              >
                {basin.name}
              </span>
              <span
                className="font-semibold text-white flex items-center justify-center"
                style={{
                  fontSize: '10px',
                  background: BADGE_COLOR,
                  borderRadius: '10px',
                  height: '16px',
                  minWidth: '16px',
                  padding: '0 4px',
                  lineHeight: 1,
                  boxShadow: '0 2px 6px rgba(221,14,14,0.35), 0 1px 2px rgba(0,0,0,0.08)',
                  position: 'relative',
                  zIndex: 21,
                }}
              >
                {basin.alertCount}
              </span>
            </div>

            {/* River cards */}
            {basin.rivers.map(river => (
              <AlertCard
                key={river.id}
                river={river}
                selected={river.id === selectedRiverId}
                onClick={() => onSelectRiver?.(river)}
                hoveredStationId={hoveredStationId}
                onStationHover={onStationHover}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
