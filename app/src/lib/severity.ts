import type { Severity, Trend } from '@/types'

export const SEVERITY_ORDER: Record<Severity, number> = { L0: 0, L1: 1, L2: 2, L3: 3 }

export function severityColor(s: Severity): string {
  return { L0: 'var(--l0)', L1: 'var(--l1)', L2: 'var(--l2)', L3: 'var(--l3)' }[s]
}

export function severityBgColor(s: Severity): string {
  return {
    L0: 'var(--l0-bg)',
    L1: 'var(--l1-bg)',
    L2: 'var(--l2-bg)',
    L3: 'var(--l3-bg)',
  }[s]
}

export function severityLabel(s: Severity): string {
  return { L0: 'L0', L1: 'L1', L2: 'L2', L3: 'L3' }[s]
}

export function trendSymbol(t: Trend): string {
  return { up: '↑', down: '↓', stable: '—' }[t]
}

export function trendIcon(t: Trend): string {
  return { up: '↑', down: '↓', stable: '→' }[t]
}

export function maxSeverityOf(severities: Severity[]): Severity {
  return severities.reduce((best, s) =>
    SEVERITY_ORDER[s] > SEVERITY_ORDER[best] ? s : best, 'L0' as Severity)
}
