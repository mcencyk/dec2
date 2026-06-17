import { Minus } from 'lucide-react'
import type { Severity, Trend } from '@/types'
import { severityColor, severityBgColor } from '@/lib/severity'

// Double-chevron SVG asset matching exact Figma paths (filled, uses currentColor)
function ChevronsUp({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 5.95 6.95" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M2.738 0.184C2.885 0.064 3.103 0.073 3.24 0.21L5.74 2.71C5.887 2.856 5.887 3.094 5.74 3.24C5.594 3.387 5.356 3.387 5.21 3.24L2.975 1.005L0.74 3.24C0.594 3.387 0.356 3.387 0.21 3.24C0.063 3.094 0.063 2.856 0.21 2.71L2.71 0.21L2.738 0.184Z" />
      <path d="M2.738 3.684C2.885 3.564 3.103 3.573 3.24 3.71L5.74 6.21C5.887 6.356 5.887 6.594 5.74 6.74C5.594 6.887 5.356 6.887 5.21 6.74L2.975 4.505L0.74 6.74C0.594 6.887 0.356 6.887 0.21 6.74C0.063 6.594 0.063 6.356 0.21 6.21L2.71 3.71L2.738 3.684Z" />
    </svg>
  )
}

function ChevronsDown({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 5.95 6.95" fill="currentColor" style={{ flexShrink: 0, transform: 'rotate(180deg)' }}>
      <path d="M2.738 0.184C2.885 0.064 3.103 0.073 3.24 0.21L5.74 2.71C5.887 2.856 5.887 3.094 5.74 3.24C5.594 3.387 5.356 3.387 5.21 3.24L2.975 1.005L0.74 3.24C0.594 3.387 0.356 3.387 0.21 3.24C0.063 3.094 0.063 2.856 0.21 2.71L2.71 0.21L2.738 0.184Z" />
      <path d="M2.738 3.684C2.885 3.564 3.103 3.573 3.24 3.71L5.74 6.21C5.887 6.356 5.887 6.594 5.74 6.74C5.594 6.887 5.356 6.887 5.21 6.74L2.975 4.505L0.74 6.74C0.594 6.887 0.356 6.887 0.21 6.74C0.063 6.594 0.063 6.356 0.21 6.21L2.71 3.71L2.738 3.684Z" />
    </svg>
  )
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'up')     return <ChevronsUp size={10} />
  if (trend === 'down')   return <ChevronsDown size={10} />
  return <Minus size={10} strokeWidth={2.5} style={{ flexShrink: 0 }} />
}

function glowShadow(s: Severity): string {
  const g: Record<Severity, string> = {
    L0: 'none',
    L1: '0px 0px 3px 0px rgba(255,175,3,0.07), 0px 0px 2px 0px rgba(255,175,3,0.07)',
    L2: '0px 0px 3px 0px rgba(253,126,0,0.07), 0px 0px 2px 0px rgba(253,126,0,0.07)',
    L3: '0px 0px 3px 0px rgba(241,42,42,0.07), 0px 0px 2px 0px rgba(241,42,42,0.07)',
  }
  return g[s]
}

interface SeverityBadgeProps {
  severity: Severity
  trend?: Trend
  time?: string
}

export function SeverityBadge({ severity, trend, time }: SeverityBadgeProps) {
  const color = severityColor(severity)
  const bg    = severityBgColor(severity)

  return (
    <div className="flex items-center" style={{ gap: '4px', flexShrink: 0 }}>
      {/* Severity + trend chip */}
      <span
        className="inline-flex items-center font-semibold leading-none"
        style={{
          fontSize: '10px',
          color,
          background: bg,
          border: `1px solid ${bg}`,
          borderRadius: '6px',
          padding: '4px 4px 4px 6px',
          gap: '2px',
          boxShadow: glowShadow(severity),
          flexShrink: 0,
        }}
      >
        {severity}
        {trend && <TrendIcon trend={trend} />}
      </span>

      {/* Time chip */}
      {time && (
        <span
          className="font-semibold tabular-nums leading-none"
          style={{
            fontSize: '10px',
            color: '#52525b',
            background: 'rgba(184,184,184,0.12)',
            border: '1px solid rgba(184,184,184,0.12)',
            borderRadius: '4px',
            padding: '4px 6px',
            flexShrink: 0,
          }}
        >
          {time}
        </span>
      )}
    </div>
  )
}
