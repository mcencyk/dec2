import type { RefObject } from 'react'
import { MousePointer2, Ruler, MessageSquareText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RingIcon } from './RingIcon'

interface BottomNavProps {
  activeSection: 'monitoring' | 'analiza' | 'planowanie'
  onSectionChange: (s: 'monitoring' | 'analiza' | 'planowanie') => void
  mouseContainer?: RefObject<HTMLElement | null>
}

const NAV_ITEMS = [
  { id: 'monitoring' as const, label: 'Monitoring' },
  { id: 'analiza'    as const, label: 'Analiza' },
  { id: 'planowanie' as const, label: 'Planowanie' },
]

const TOOLS = [
  { icon: MousePointer2,     label: 'Zaznacz',   active: true },
  { icon: Ruler,             label: 'Pomiar',    active: false },
  { icon: MessageSquareText, label: 'Komentarz', active: false },
]

// Outer pill: glass dla czytelności nad mapą; Figma używa transparent, ale wymaga light bg dla readability
const PILL_OUTER: React.CSSProperties = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(20px) saturate(1.6)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
  borderRadius: '16px',
  boxShadow: '0px 10px 15px 0px rgba(0,0,0,0.1), 0px 4px 6px 0px rgba(0,0,0,0.1)',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}

// Logo gradient pill — Figma: pl-8px pr-9px py-4px
const LOGO_PILL: React.CSSProperties = {
  background: 'linear-gradient(227.291deg, rgb(249,249,249) 27.268%, rgb(234,234,234) 83.104%)',
  borderRadius: '12px',
  paddingLeft: '8px',
  paddingRight: '9px',
  paddingTop: '4px',
  paddingBottom: '4px',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
}

// Active tab: white bg + sm drop-shadow (Figma spec)
const ACTIVE_TAB: React.CSSProperties = {
  background: 'white',
  filter: 'drop-shadow(0px 1px 1.5px rgba(0,0,0,0.1)) drop-shadow(0px 1px 1px rgba(0,0,0,0.1))',
}

// Tools group: #f5f5f5 + drop-shadow
const TOOLS_GROUP: React.CSSProperties = {
  background: '#f5f5f5',
  borderRadius: '12px',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  filter: 'drop-shadow(0px 5px 7.5px rgba(0,0,0,0.1)) drop-shadow(0px 2px 3px rgba(0,0,0,0.1))',
}

export function BottomNav({ activeSection, onSectionChange }: BottomNavProps) {
  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
      <div className="pointer-events-auto shrink-0" style={PILL_OUTER}>

        {/* ── LOGO (gradient pill z Figmy) ── */}
        <div className="flex items-center shrink-0">
          <div style={LOGO_PILL}>

            {/* Ring icon — inline SVG, ostry na każdym DPI */}
            <div className="flex items-center justify-center shrink-0" style={{ padding: '6px 10px' }}>
              <RingIcon size={20} />
            </div>

            {/* "Deceris" text tab — pr-6px py-4px, no left padding */}
            <div
              className="flex items-center justify-center shrink-0"
              style={{ minHeight: '32px', minWidth: '32px', paddingRight: '6px', paddingTop: '4px', paddingBottom: '4px' }}
            >
              <span
                className="font-medium whitespace-nowrap select-none text-[#171717] leading-6"
                style={{ fontSize: '18px', letterSpacing: '-0.5px' }}
              >
                Deceris
              </span>
            </div>
          </div>
        </div>

        {/* ── NAV + TOOLS ── */}
        <div className="flex items-center shrink-0" style={{ gap: '16px' }}>

          {/* Nav tabs */}
          <div className="flex items-center">
            {NAV_ITEMS.map(({ id, label }) => {
              const isActive = activeSection === id
              return (
                <button
                  key={id}
                  onClick={() => onSectionChange(id)}
                  className="flex items-center justify-center min-h-8 min-w-8 px-2.5 py-[5.5px] rounded-lg cursor-pointer transition-all duration-180 whitespace-nowrap"
                  style={isActive ? ACTIVE_TAB : {}}
                >
                  <span className="text-sm font-medium leading-5 text-[#0a0a0a]">{label}</span>
                </button>
              )
            })}
          </div>

          {/* GIS tools group */}
          <div style={TOOLS_GROUP}>
            {TOOLS.map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                title={label}
                className={cn(
                  'flex items-center justify-center size-8 rounded-lg cursor-pointer transition-colors duration-180',
                  !active && 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                )}
                style={active ? ACTIVE_TAB : {}}
              >
                <Icon className={cn('size-4.5', active ? 'text-[#0a0a0a]' : '')} />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
