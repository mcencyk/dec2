import type { RefObject } from 'react'
import { Search } from 'lucide-react'
import { AlertCard } from './AlertCard'
import { basins } from '@/data/mockData'
import type { River } from '@/types'
import { severityColor } from '@/lib/severity'

interface RightPanelProps {
  selectedRiverId?: string
  onSelectRiver?: (river: River) => void
  hoveredStationId?: string | null
  onStationHover?: (id: string | null) => void
  mouseContainer?: RefObject<HTMLElement | null>
}

export function RightPanel({ selectedRiverId, onSelectRiver, hoveredStationId, onStationHover }: RightPanelProps) {
  return (
    <div
      className="flex flex-col flex-1 min-h-0 w-70 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(14px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
        borderRadius: '16px',
        padding: '4px',
        gap: '8px',
        boxShadow: '0px 10px 15px 0px rgba(0,0,0,0.1), 0px 4px 6px 0px rgba(0,0,0,0.1)',
      }}
    >
      {/* Search bar */}
      <div
        className="flex items-center shrink-0"
        style={{
          background: 'white',
          border: '1px solid #d4d4d4',
          borderRadius: '12px',
          padding: '8px 8px 8px 12px',
          minHeight: '36px',
          boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
          gap: '8px',
        }}
      >
        <Search style={{ width: '16px', height: '16px', color: '#737373', flexShrink: 0 }} />
        <input
          placeholder="Szukaj stacji / akwenu / alertu…"
          className="flex-1 bg-transparent text-[14px] leading-5 text-[#0a0a0a] placeholder:text-[#737373] outline-none border-none"
        />
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto scrollbar-none min-h-0" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                  background: severityColor(basin.maxSeverity),
                  borderRadius: '10px',
                  height: '16px',
                  minWidth: '16px',
                  padding: '0 4px',
                  lineHeight: 1,
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
        <div style={{ height: '4px' }} />
      </div>
    </div>
  )
}
