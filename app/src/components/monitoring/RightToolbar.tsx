const PILL: React.CSSProperties = {
  paddingTop: '4px',
  paddingBottom: '4px',
  paddingLeft: '8px',
  paddingRight: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

const INNER_GROUP: React.CSSProperties = {
  background: '#f5f5f5',
  borderRadius: '12px',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  boxShadow: '0px 5px 7px rgba(0,0,0,0.08), 0px 2px 3px rgba(0,0,0,0.06)',
  flexShrink: 0,
}

const ACTIVE_TAB: React.CSSProperties = {
  background: '#ffffff',
  boxShadow: '0px 1px 2px rgba(0,0,0,0.1), 0px 1px 1px rgba(0,0,0,0.08)',
}

const TAB_BASE = 'flex items-center justify-center min-h-8 min-w-8 px-2.5 py-[5.5px] rounded-lg shrink-0 cursor-pointer transition-colors duration-180'

export function RightToolbar() {
  return (
    <div className="lg-pill" style={PILL}>

      {/* Standalone tab — Live dot (stacked layers per Figma) */}
      <div className={`${TAB_BASE} hover:bg-black/5`} title="Status danych">
        {/* Stacked grid: blurred bg layer + sharp fg layer */}
        <div className="inline-grid place-items-start relative shrink-0 size-2">
          <div className="blur-[2px] col-start-1 row-start-1 opacity-65 relative size-2">
            <div className="absolute left-px top-px size-1.75 rounded-full" style={{ background: '#22c55e' }} />
          </div>
          <div className="col-start-1 row-start-1 relative size-2">
            <div
              className="absolute left-px top-px size-1.75 rounded-full"
              style={{ background: '#22c55e', boxShadow: '0px 0.5px 1px 0px rgba(7,180,4,0.24)' }}
            />
          </div>
        </div>
      </div>

      {/* Standalone tab — Refresh */}
      <div className={`${TAB_BASE} hover:bg-black/5`} title="Odśwież">
        <div className="overflow-clip relative shrink-0 size-5">
          <div className="absolute inset-[9.38%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/toolbar-refresh.svg" draggable={false} />
          </div>
        </div>
      </div>

      {/* Inner tabs group: Settings · Filter · Bell (active + badge) */}
      <div style={INNER_GROUP}>
        {/* Tab 1 — Settings */}
        <div className={`${TAB_BASE} hover:bg-black/5`} title="Ustawienia">
          <div className="overflow-clip relative shrink-0 size-5">
            <div className="absolute inset-[13.54%]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/toolbar-settings.svg" draggable={false} />
            </div>
          </div>
        </div>

        {/* Tab 2 — Filter */}
        <div className={`${TAB_BASE} hover:bg-black/5`} title="Filtry">
          <div className="overflow-clip relative shrink-0 size-5">
            <div className="absolute" style={{ inset: '21.88% 9.38%' }}>
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/toolbar-filter.svg" draggable={false} />
            </div>
          </div>
        </div>

        {/* Tab 3 — Bell (active) + badge */}
        <div className={`${TAB_BASE} relative`} style={ACTIVE_TAB} title="Powiadomienia">
          <div className="overflow-clip relative shrink-0 size-5">
            <div className="absolute" style={{ inset: '5.21% 9.38%' }}>
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/toolbar-bell.svg" draggable={false} />
            </div>
          </div>
          {/* Badge */}
          <div
            className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full flex items-center justify-center leading-none"
            style={{ background: 'var(--l3)' }}
          >
            <span className="text-[10px] font-semibold text-white">30</span>
          </div>
        </div>
      </div>

    </div>
  )
}
