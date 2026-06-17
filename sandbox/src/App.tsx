import { TooltipProvider } from '@/components/ui/tooltip'
import { MonitoringPanel } from '@/components/monitoring-panel'

export default function App() {
  return (
    <TooltipProvider>
    <div className="dark" style={{ display: 'flex', height: '100dvh', width: '100dvw', overflow: 'hidden', background: '#09090B' }}>

      {/* ── Left panel ── */}
      <MonitoringPanel />
      {/* ── Map placeholder ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0d1520' }}>
        {/* grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,110,130,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,110,130,0.1) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* river */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
          <path d="M-50 280 Q200 260 400 300 Q600 340 900 290 Q1100 260 1400 310" stroke="#1e4a7a" strokeWidth="22" fill="none" opacity="0.6" />
          <path d="M-50 280 Q200 260 400 300 Q600 340 900 290 Q1100 260 1400 310" stroke="#2563eb" strokeWidth="7" fill="none" opacity="0.25" />
        </svg>
        <p style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 11, color: '#52525B', fontFamily: 'monospace' }}>
          mapa placeholder — MapLibre GL JS
        </p>
      </div>

    </div>
    </TooltipProvider>
  )
}
