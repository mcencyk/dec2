import type { Severity, Trend } from '@/types'
import { severityColor, severityBgColor, trendSymbol } from '@/lib/severity'
import { cn } from '@/lib/utils'

interface SeverityBadgeProps {
  severity: Severity
  trend?: Trend
  time?: string
  className?: string
}

export function SeverityBadge({ severity, trend, time, className }: SeverityBadgeProps) {
  const color = severityColor(severity)
  const bg = severityBgColor(severity)

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[6px] text-[10px] font-semibold leading-none"
        style={{ color, background: bg }}
      >
        {severity}
        {trend && (
          <span className="text-[9px] leading-none">{trendSymbol(trend)}</span>
        )}
      </span>
      {time && (
        <span className="text-[11px] text-muted-foreground font-mono tabular-nums">{time}</span>
      )}
    </div>
  )
}
