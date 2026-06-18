import { useRef, useEffect, useState, type RefObject } from 'react'
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

const TOOLS_GROUP: React.CSSProperties = {
  background: '#f5f5f5',
  borderRadius: '12px',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  boxShadow: '0px 5px 7px rgba(0,0,0,0.08), 0px 2px 3px rgba(0,0,0,0.06)',
}

const ACTIVE_TOOL: React.CSSProperties = {
  background: 'white',
  boxShadow: '0px 1px 2px rgba(0,0,0,0.1), 0px 1px 1px rgba(0,0,0,0.08)',
}

export function BottomNav({ activeSection, onSectionChange }: BottomNavProps) {
  const navContainerRef = useRef<HTMLDivElement>(null)
  const [pillPos, setPillPos] = useState<{ left: number; width: number } | null>(null)
  // Delay enabling CSS transition until after first measurement to avoid initial jump
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const container = navContainerRef.current
    if (!container) return
    const btn = container.querySelector(`[data-nav="${activeSection}"]`) as HTMLElement | null
    if (!btn) return
    const cRect = container.getBoundingClientRect()
    const bRect = btn.getBoundingClientRect()
    setPillPos({ left: bRect.left - cRect.left, width: bRect.width })
    // Enable animation on second+ renders (after initial measurement)
    requestAnimationFrame(() => setAnimated(true))
  }, [activeSection])

  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
      <div className="pointer-events-auto shrink-0" style={PILL_OUTER}>

        {/* ── LOGO ── */}
        <div className="flex items-center shrink-0">
          <div style={LOGO_PILL}>
            <div className="flex items-center justify-center shrink-0" style={{ padding: '6px 10px' }}>
              <RingIcon size={20} />
            </div>
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

          {/* Nav tabs with sliding active pill */}
          <div ref={navContainerRef} className="relative flex items-center">
            {/* Sliding background pill — animates between active positions */}
            {pillPos && (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: pillPos.left,
                  width: pillPos.width,
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.1), 0px 1px 1px rgba(0,0,0,0.08)',
                  transition: animated
                    ? 'left 240ms cubic-bezier(0.16, 1, 0.3, 1), width 240ms cubic-bezier(0.16, 1, 0.3, 1)'
                    : 'none',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
            )}

            {NAV_ITEMS.map(({ id, label }) => {
              const isActive = activeSection === id
              return (
                <button
                  key={id}
                  data-nav={id}
                  onClick={() => onSectionChange(id)}
                  className={cn(
                    'relative z-10 flex items-center justify-center min-h-8 min-w-8 px-2.5 py-[5.5px] rounded-lg cursor-pointer whitespace-nowrap',
                    !isActive && 'hover:bg-black/5 transition-colors duration-150'
                  )}
                >
                  <span className={cn(
                    'text-sm leading-5 transition-all duration-200',
                    isActive ? 'font-semibold text-[#0a0a0a]' : 'font-medium text-[#525252] hover:text-[#0a0a0a]'
                  )}>
                    {label}
                  </span>
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
                  'flex items-center justify-center size-8 rounded-lg cursor-pointer transition-colors duration-150',
                  !active && 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                )}
                style={active ? ACTIVE_TOOL : {}}
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
