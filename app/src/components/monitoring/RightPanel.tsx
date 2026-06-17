import type { RefObject } from 'react'
import { Search } from 'lucide-react'
import { AlertCard } from './AlertCard'
import { basins } from '@/data/mockData'
import type { River } from '@/types'
import { severityColor } from '@/lib/severity'

interface RightPanelProps {
  selectedRiverId?: string
  onSelectRiver?: (river: River) => void
  mouseContainer?: RefObject<HTMLElement | null>
}

const GLASS_PANEL: React.CSSProperties = {
  background: 'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(14px) saturate(1.5)',
  WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
  borderRadius: '16px',
  boxShadow: '0px 10px 15px 0px rgba(0,0,0,0.1), 0px 4px 6px 0px rgba(0,0,0,0.1)',
}

export function RightPanel({ selectedRiverId, onSelectRiver }: RightPanelProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 w-70 shrink-0" style={GLASS_PANEL}>

      {/* Search bar */}
      <div className="px-2 pt-2 pb-1.5 shrink-0">
        <div
          className="rounded-xl flex items-center gap-2 px-3 py-2"
          style={{ background: 'rgba(0,0,0,0.05)' }}
        >
          <Search className="size-3.5 text-muted-foreground shrink-0" />
          <input
            placeholder="Szukaj stacji / akwenu…"
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none border-none"
          />
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto px-2 pb-0 space-y-2.5 scrollbar-none min-h-0">
        {basins.map(basin => (
          <div key={basin.id}>
            {/* Basin header */}
            <div className="flex items-center justify-between px-1 py-1">
              <span className="text-[10px] font-semibold tracking-[0.07em] uppercase text-muted-foreground">
                {basin.name}
              </span>
              <span
                className="size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none"
                style={{ backgroundColor: severityColor(basin.maxSeverity) }}
              >
                {basin.alertCount}
              </span>
            </div>

            {/* River cards */}
            <div className="space-y-1">
              {basin.rivers.map(river => (
                <AlertCard
                  key={river.id}
                  river={river}
                  selected={river.id === selectedRiverId}
                  onClick={() => onSelectRiver?.(river)}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="h-2" />
      </div>

    </div>
  )
}
