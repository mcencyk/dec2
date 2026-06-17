export type Severity = 'L0' | 'L1' | 'L2' | 'L3'
export type Trend = 'up' | 'down' | 'stable'

export interface Station {
  id: string
  name: string
  river: string
  km: number
  value: number   // cm
  severity: Severity
  trend: Trend
  thresholds: { l1: number; l2: number; l3: number }
  lastUpdate: string  // HH:MM
  lat: number
  lng: number
}

export interface River {
  id: string
  name: string
  displayName: string  // e.g. "Odra — Wrocław" for disambiguation
  basin: string        // dorzecze ID
  stations: Station[]
  // alert metadata — derived
}

export interface Basin {
  id: string
  name: string
  rivers: River[]
  alertCount: number
  maxSeverity: Severity
}

export interface Alert {
  id: string
  riverId: string
  severity: Severity
  dominantStation: Station
  lastUpdate: string
  status: 'Wymagające uwagi' | 'Rozpoznane' | 'Zaopiekowany'
}
