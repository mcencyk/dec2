import { Minus } from 'lucide-react'
import type { Severity, Trend } from '@/types'
import { severityColor, severityBgColor } from '@/lib/severity'

function ChevronsUp({ size = 8 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 9" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M3.634 0.37C3.83 0.195 4.13 0.205 4.316 0.39L7.816 3.89C8.012 4.086 8.012 4.406 7.816 4.602C7.62 4.798 7.3 4.798 7.104 4.602L3.975 1.473L0.846 4.602C0.65 4.798 0.33 4.798 0.134 4.602C-0.062 4.406 -0.062 4.086 0.134 3.89L3.634 0.39L3.634 0.37Z" />
      <path d="M3.634 4.37C3.83 4.195 4.13 4.205 4.316 4.39L7.816 7.89C8.012 8.086 8.012 8.406 7.816 8.602C7.62 8.798 7.3 8.798 7.104 8.602L3.975 5.473L0.846 8.602C0.65 8.798 0.33 8.798 0.134 8.602C-0.062 8.406 -0.062 8.086 0.134 7.89L3.634 4.39L3.634 4.37Z" />
    </svg>
  )
}

function ChevronsDown({ size = 8 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 9" fill="currentColor" style={{ flexShrink: 0, transform: 'rotate(180deg)' }}>
      <path d="M3.634 0.37C3.83 0.195 4.13 0.205 4.316 0.39L7.816 3.89C8.012 4.086 8.012 4.406 7.816 4.602C7.62 4.798 7.3 4.798 7.104 4.602L3.975 1.473L0.846 4.602C0.65 4.798 0.33 4.798 0.134 4.602C-0.062 4.406 -0.062 4.086 0.134 3.89L3.634 0.39L3.634 0.37Z" />
      <path d="M3.634 4.37C3.83 4.195 4.13 4.205 4.316 4.39L7.816 7.89C8.012 8.086 8.012 8.406 7.816 8.602C7.62 8.798 7.3 8.798 7.104 8.602L3.975 5.473L0.846 8.602C0.65 8.798 0.33 8.798 0.134 8.602C-0.062 8.406 -0.062 8.086 0.134 7.89L3.634 4.39L3.634 4.37Z" />
    </svg>
  )
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'up')   return <ChevronsUp size={8} />
  if (trend === 'down') return <ChevronsDown size={8} />
  return <Minus size={8} strokeWidth={2.5} style={{ flexShrink: 0 }} />
}

function glowShadow(s: Severity): string {
  const g: Record<Severity, string> = {
    L0: 'none',
    L1: '0px 0px 3px 0px rgba(254,182,0,0.07), 0px 0px 2px 0px rgba(254,182,0,0.07)',
    L2: '0px 0px 3px 0px rgba(253,126,0,0.07), 0px 0px 2px 0px rgba(253,126,0,0.07)',
    L3: '0px 0px 3px 0px rgba(241,42,42,0.07), 0px 0px 2px 0px rgba(241,42,42,0.07)',
  }
  return g[s]
}

interface SeverityBadgeProps {
  severity: Severity
  trend?: Trend
  time?: string
  hovered?: boolean
}

export function SeverityBadge({ severity, trend, time, hovered }: SeverityBadgeProps) {
  const color = severityColor(severity)
  const bg    = severityBgColor(severity)

  return (
    <div className="flex items-center" style={{ gap: '6px', flexShrink: 0 }}>
      {/* Time — plain text, no background, per Figma */}
      {time && (
        <span
          className="font-semibold tabular-nums leading-none whitespace-nowrap"
          style={{
            fontSize: '10px',
            color: hovered ? '#52525b' : '#8f8f8f',
            flexShrink: 0,
          }}
        >
          {time}
        </span>
      )}

      {/* Severity + trend chip */}
      <span
        className="inline-flex items-center font-semibold leading-none"
        style={{
          fontSize: '10px',
          color,
          background: bg,
          border: severity === 'L0' ? `1px solid ${bg}` : `1px solid ${color}`,
          borderRadius: '6px',
          padding: trend ? '4px 5px 4px 6px' : '4px 6px',
          gap: '3px',
          boxShadow: glowShadow(severity),
          flexShrink: 0,
        }}
      >
        {severity}
        {trend && <TrendIcon trend={trend} />}
      </span>
    </div>
  )
}
