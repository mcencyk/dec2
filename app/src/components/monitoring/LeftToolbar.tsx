const PILL: React.CSSProperties = {
  paddingTop: '4px',
  paddingBottom: '4px',
  paddingLeft: '4px',
  paddingRight: '8px',
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

// Standard tab dimensions from Figma
const TAB_BASE = 'flex items-center justify-center min-h-8 min-w-8 px-2.5 py-[5.5px] rounded-lg shrink-0 cursor-pointer transition-colors duration-180'

export function LeftToolbar() {
  return (
    <div className="lg-pill" style={PILL}>

      {/* Inner tabs group: Grid (active) · Layers · History */}
      <div style={INNER_GROUP}>
        {/* Tab 1 — LayoutGrid (active) */}
        <div className={TAB_BASE} style={ACTIVE_TAB} title="Inspektor">
          <div className="overflow-clip relative shrink-0 size-5">
            <div className="absolute inset-[9.38%]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/toolbar-grid.svg" draggable={false} />
            </div>
          </div>
        </div>

        {/* Tab 2 — Layers */}
        <div className={`${TAB_BASE} hover:bg-black/5`} title="Warstwy">
          <div className="overflow-clip relative shrink-0 size-5">
            <div className="absolute" style={{ inset: '5.21% 5.14% 5.22% 5.21%' }}>
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/toolbar-layers.svg" draggable={false} />
            </div>
          </div>
        </div>

        {/* Tab 3 — History */}
        <div className={`${TAB_BASE} hover:bg-black/5`} title="Historia">
          <div className="overflow-clip relative shrink-0 size-5">
            <div className="absolute inset-[9.38%]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src="/toolbar-history.svg" draggable={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Standalone tab — Plus / Zoom in */}
      <div className={`${TAB_BASE} hover:bg-black/5`} title="Powiększ">
        <div className="overflow-clip relative shrink-0 size-5">
          <div className="absolute inset-[17.71%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/toolbar-plus.svg" draggable={false} />
          </div>
        </div>
      </div>

      {/* Standalone tab — Minus / Zoom out */}
      <div className={`${TAB_BASE} hover:bg-black/5`} title="Pomniejsz">
        <div className="overflow-clip relative shrink-0 size-5">
          <div className="absolute" style={{ inset: '46.88% 17.71%' }}>
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/toolbar-minus.svg" draggable={false} />
          </div>
        </div>
      </div>

    </div>
  )
}
