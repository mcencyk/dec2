import { useRef, useEffect, useState, type RefObject } from 'react'
import { MousePointer2, Ruler, MessageSquareText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'

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
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}

const TOOLS_GROUP: React.CSSProperties = {
  background: '#f5f5f5',
  borderRadius: '12px',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
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
      <div className="pointer-events-auto shrink-0 lg-pill" style={PILL_OUTER}>

        {/* ── LOGO ── */}
        <div className="flex items-center shrink-0">
          <img
            src="/logo-deceris.png"
            alt="Deceris"
            draggable={false}
            style={{ height: '40px', width: 'auto', display: 'block', userSelect: 'none', position: 'relative', zIndex: 21 }}
          />
        </div>

        {/* ── NAV + TOOLS ── */}
        <div className="flex items-center shrink-0" style={{ gap: '16px' }}>

          {/* Nav tabs with sliding active pill */}
          <div ref={navContainerRef} className="relative flex items-center gap-1">
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
                    'relative z-10 flex items-center justify-center min-h-8 min-w-8 px-3 py-[5.5px] rounded-lg cursor-pointer whitespace-nowrap',
                    !isActive && 'hover:bg-black/5 transition-colors duration-150'
                  )}
                >
                  <span className={cn(
                    'text-sm leading-5',
                    isActive ? 'font-semibold text-[#0a0a0a]' : 'font-medium text-[#525252]'
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
              <Tooltip key={label} text={label}>
                <button
                  className={cn(
                    'flex items-center justify-center size-8 rounded-lg cursor-pointer transition-colors duration-150',
                    !active && 'text-muted-foreground hover:bg-black/5'
                  )}
                  style={active ? ACTIVE_TOOL : {}}
                >
                  <Icon strokeWidth={1.5} className={cn('size-4.5', active ? 'text-[#0a0a0a]' : '')} />
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
