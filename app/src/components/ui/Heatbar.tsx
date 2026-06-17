import type { Station } from '@/types'
import { severityColor } from '@/lib/severity'

interface HeatbarProps {
  stations: Station[]
  compact?: boolean
}

export function Heatbar({ stations, compact = true }: HeatbarProps) {
  if (stations.length === 0) return null

  // Add grey "poza kadrem" margin segment on both sides
  const segments = [
    { id: 'left-margin', severity: 'L0' as const, isMargin: true },
    ...stations.map(s => ({ id: s.id, severity: s.severity, isMargin: false, name: s.name, km: s.km })),
    { id: 'right-margin', severity: 'L0' as const, isMargin: true },
  ]

  return (
    <div className={`heatbar ${compact ? 'h-[3px]' : 'h-[4px]'}`}>
      {segments.map(seg => (
        <div
          key={seg.id}
          className="heatbar-segment"
          style={{
            backgroundColor: severityColor(seg.severity),
            opacity: seg.isMargin ? 0.3 : 1,
          }}
        />
      ))}
    </div>
  )
}
