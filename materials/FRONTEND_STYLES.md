# Deceris — Frontend Styles Specification
**Źródło:** Figma Master File + implementacja React+Vite  
**Data:** 2026-06-17  
**Stack:** React 19 · Vite · TypeScript · Tailwind v4 · shadcn/ui (Radix base)

---

## 1. Setup — zależności

```bash
npm install
# Fonty (już zainstalowane)
# @fontsource-variable/geist
# @fontsource-variable/geist-mono
```

Importy w `index.css`:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";
```

---

## 2. Design Tokens — CSS Custom Properties

Wklej do głównego pliku CSS (`:root` + `.dark`).

### Light mode (domyślny — zgodny z Figmą)

```css
:root {
  /* ── Tło i powierzchnie ── */
  --background:   #f4f4f5;   /* zinc-100 — tło aplikacji */
  --surface:      #ffffff;   /* biała karta/panel */
  --surface-2:    #f4f4f5;   /* zinc-100 */
  --surface-3:    #e4e4e7;   /* zinc-200 */

  /* ── Obramowania ── */
  --border:       #e4e4e7;
  --border-hover: #d4d4d8;

  /* ── Tekst ── */
  --foreground:       #09090b;   /* zinc-950 — tekst główny */
  --text-muted:       #71717a;   /* zinc-500 */
  --text-faint:       #a1a1aa;   /* zinc-400 */
  --text-on-accent:   #ffffff;

  /* ── Akcent (indigo) ── */
  --accent:             #4f46e5;   /* indigo-600 */
  --accent-foreground:  #ffffff;

  /* ── Status ── */
  --status-live:    #16a34a;   /* green-600 */
  --status-offline: #52525b;   /* zinc-600 */

  /* ── Severity ── */
  --l0: #b8b8b8;   /* norma — szary */
  --l1: #ffab02;   /* uwaga — żółty */
  --l2: #fd6900;   /* ostrzeżenie — pomarańczowy */
  --l3: #dd0e0e;   /* alarm — czerwony */

  /* Severity backgrounds (przezroczyste) */
  --l0-bg: rgba(184, 184, 184, 0.12);
  --l1-bg: rgba(255, 196, 78,  0.20);
  --l2-bg: rgba(253, 122,  0,  0.09);
  --l3-bg: rgba(221,  14, 14,  0.09);

  /* ── Cienie ── */
  --shadow-xs: 0px 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0px 1px 3px rgba(0,0,0,0.10), 0px 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0px 4px 6px rgba(0,0,0,0.07), 0px 2px 4px rgba(0,0,0,0.06);
  --shadow-lg: 0px 10px 15px rgba(0,0,0,0.10), 0px 4px 6px rgba(0,0,0,0.10);

  /* ── Liquid Glass (panele/pills floating nad mapą) ── */
  --glass-bg:     rgba(255, 255, 255, 0.72);
  --glass-border: rgba(255, 255, 255, 0.60);
  --glass-blur:   20px;

  /* ── Border-radius ── */
  --radius-sm:  6px;
  --radius-md:  8px;    /* rounded-lg w shadcn */
  --radius-lg:  10px;   /* --radius bazowy Figmy */
  --radius-xl:  12px;
  --radius-2xl: 16px;

  /* ── Inne ── */
  --general-accent:     #f5f5f5;   /* tło inner group toolbarów */
  --general-background: #ffffff;
}
```

### Dark mode

```css
.dark {
  --background:   #09090b;   /* zinc-950 */
  --surface:      #18181b;   /* zinc-900 */
  --surface-2:    #27272a;   /* zinc-800 */
  --surface-3:    #3f3f46;   /* zinc-700 */

  --border:       #27272a;
  --border-hover: #52525b;

  --foreground:     #fafafa;
  --text-muted:     #a1a1aa;
  --text-faint:     #52525b;

  --accent:            #818cf8;   /* indigo-400 */
  --accent-foreground: #ffffff;

  --status-live:    #22c55e;   /* green-500 */
  --status-offline: #52525b;

  --l0: #6b7280;
  --l1: #f5a623;
  --l2: #e8711a;
  --l3: #d93025;

  --l0-bg: rgba(107, 114, 128, 0.07);
  --l1-bg: rgba(245, 166,  35, 0.07);
  --l2-bg: rgba(232, 113,  26, 0.07);
  --l3-bg: rgba(217,  48,  37, 0.07);

  --glass-bg:     rgba(24, 24, 27, 0.80);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur:   20px;
}
```

### Aliasy Tailwind v4 (`@theme inline`)

```css
@theme inline {
  --font-sans:    'Geist Variable', sans-serif;
  --font-mono:    'Geist Mono Variable', monospace;
  --font-heading: var(--font-sans);

  /* shadcn semantic tokens */
  --color-background:        var(--background);
  --color-foreground:        var(--foreground);
  --color-card:              var(--surface);
  --color-card-foreground:   var(--foreground);
  --color-muted:             var(--surface-2);
  --color-muted-foreground:  var(--text-muted);
  --color-border:            var(--border);
  --color-ring:              var(--border-hover);
  --color-accent:            var(--accent);
  --color-accent-foreground: var(--accent-foreground);

  /* Severity jako Tailwind color utilities */
  --color-l0:    var(--l0);
  --color-l1:    var(--l1);
  --color-l2:    var(--l2);
  --color-l3:    var(--l3);
  --color-l0-bg: var(--l0-bg);
  --color-l1-bg: var(--l1-bg);
  --color-l2-bg: var(--l2-bg);
  --color-l3-bg: var(--l3-bg);

  /* Border-radius */
  --radius-sm:  6px;
  --radius-md:  8px;
  --radius-lg:  10px;
  --radius-xl:  12px;
  --radius-2xl: 16px;
}
```

---

## 3. Typografia

**Font:** Geist (wszystkie warianty) + Geist Mono (dane numeryczne, ID, jednostki)

| Styl | Familie | Weight | Size | Line-height | Letter-spacing |
|------|---------|--------|------|-------------|----------------|
| Display/4xl | Geist | 600 | 48px | 48px | -1.5px |
| Display/3xl | Geist | 600 | 30px | 30px | -1px |
| Display/2xl | Geist | 600 | 32px | 40px | — |
| Display/xl | Geist | 600 | 24px | 32px | — |
| Display/lg | Geist | 600 | 20px | 28px | — |
| Body/xl | Geist | 400/500/600 | 18px | 27px | — |
| Body/lg | Geist | 400/500/600 | 16px | 24px | — |
| Body/md | Geist | 400/500/600 | 14px | 20px | — |
| Body/sm | Geist | 400/500 | 13px | 18px | — |
| Body/xs | Geist | 400/500/600 | 12px | 16px | — |
| Body/caption | Geist | 400 | 14px | 21px | +1.5px |
| Label/caps | Geist | 600 | 11px | 16px | +0.6px |
| Mono/lg | Geist Mono | 400 | 16px | 24px | — |
| Mono/md | Geist Mono | 400 | 14px | 20px | — |
| Mono/sm | Geist Mono | 400 | 13px | 18px | — |
| Mono/xs | Geist Mono | 400/500 | 12px | 16px | — |
| Mono/2xs | Geist Mono | 400 | 11px | 16px | — |

**Zasada:** Geist Mono zawsze do wartości liczbowych (cm, %, liczby alarmów), ID zdarzeń, timestamp.

---

## 4. Spacing System

| Token | px | Tailwind |
|-------|----|---------|
| `3xs` / `--spacing-0.5` | 2px | `gap-0.5`, `p-0.5` |
| `2xs` / `--spacing-1` | 4px | `gap-1`, `p-1` |
| `xs` / `--spacing-2` | 8px | `gap-2`, `p-2` |
| `sm` / `--spacing-3` | 12px | `gap-3`, `p-3` |
| `md` / `--spacing-4` | 16px | `gap-4`, `p-4` |
| `lg` / `--spacing-6` | 24px | `gap-6`, `p-6` |

**Layout constants:**
- Margines paneli od krawędzi ekranu: **24px** (`left-6`, `right-6`, `top-6`)
- Gap panel↔toolbar: **24px**
- Gap toolbar↔dół ekranu: **24px** (`bottom-6`)
- Szerokość panelu lewego: **272px** (`w-68`)
- Szerokość panelu prawego: **280px** (`w-70`)
- Wysokość BottomNav pill: ~40px

---

## 5. Border Radius

| Token | px | Użycie |
|-------|----|--------|
| `--radius-sm` | 6px | Małe tagi, miniaturki |
| `--radius-md` | 8px | Przyciski, inputs, małe karty |
| `--radius-lg` | 10px | Taby nawigacji, standardowe karty |
| `--radius-xl` | 12px | Inner grupy toolbarów, karty alertów |
| `--radius-2xl` | 16px | Outer pills (toolbary, BottomNav, panele) |

```css
/* Tailwind klasy */
rounded-sm  → 6px
rounded-md  → 8px    (lub rounded-lg w Tailwind domyślnie)
rounded-lg  → 10px
rounded-xl  → 12px
rounded-2xl → 16px
```

---

## 6. Cienie (Shadows)

### shadow-xs
```css
box-shadow: 0px 1px 2px 0px rgba(0,0,0,0.05);
```

### shadow-sm (Figma: `shadow-sm`)
```css
box-shadow:
  0px 1px 3px  0px rgba(0,0,0,0.10),
  0px 1px 2px -1px rgba(0,0,0,0.10);
```

### shadow-lg (Figma: `shadow-lg`) — używany na floating pills
```css
box-shadow:
  0px 10px 15px -3px rgba(0,0,0,0.10),
  0px 4px  6px  -4px rgba(0,0,0,0.10);
```

### Active tab (wewnętrzny shadow przycisku)
```css
/* Figma: drop-shadow-sm na elemencie */
filter:
  drop-shadow(0px 1px 1.5px rgba(0,0,0,0.10))
  drop-shadow(0px 0.5px 1px rgba(0,0,0,0.10));
```

---

## 7. Severity System

### Poziomy

| Level | Etykieta | Kolor | Znaczenie |
|-------|----------|-------|-----------|
| L0 | Norma | `#b8b8b8` (light) / `#6b7280` (dark) | Poziom wody w normie |
| L1 | Uwaga | `#ffab02` (light) / `#f5a623` (dark) | Zbliżanie do progu |
| L2 | Ostrzeżenie | `#fd6900` (light) / `#e8711a` (dark) | Przekroczenie progu ostrzegawczego |
| L3 | Alarm | `#dd0e0e` (light) / `#d93025` (dark) | Próg alarmowy — wymagana decyzja |

### Użycie w komponentach

```tsx
// Badge severity
<span className="badge-l3">L3</span>

// CSS klasy
.badge-l0 { background: var(--l0-bg); color: var(--l0); }
.badge-l1 { background: var(--l1-bg); color: var(--l1); }
.badge-l2 { background: var(--l2-bg); color: var(--l2); }
.badge-l3 { background: var(--l3-bg); color: var(--l3); }

// Inline w TSX
style={{ color: 'var(--l3)', background: 'var(--l3-bg)' }}

// Badge powiadomień (licznik) — zawsze pełny kolor l3
style={{ background: 'var(--l3)', color: '#fff' }}
```

### Markery na mapie

| Kształt | Trend |
|---------|-------|
| ▲ trójkąt w górę | Poziom rośnie |
| ▼ trójkąt w dół | Poziom opada |
| ■ kwadrat | Poziom stabilny |

Kolor markera = severity stacji. Pulsowanie: L0 brak, L1 subtelne, L2 wyraźne, L3 intensywne.

---

## 8. Liquid Glass — Floating Panels

Panele i pills pływające nad mapą używają efektu liquid glass:

```css
/* Klasa .glass */
background: var(--glass-bg);           /* rgba(255,255,255,0.72) — light */
backdrop-filter: blur(20px) saturate(1.8);
-webkit-backdrop-filter: blur(20px) saturate(1.8);
border: 1px solid var(--glass-border);
```

```tsx
// Styl panelu (inline w TSX)
const GLASS_PANEL: React.CSSProperties = {
  background: 'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(14px) saturate(1.5)',
  WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
  borderRadius: '16px',
  boxShadow: '0px 10px 15px 0px rgba(0,0,0,0.1), 0px 4px 6px 0px rgba(0,0,0,0.1)',
}

// Outer pill BottomNav / toolbary — transparent per Figma
const PILL_OUTER: React.CSSProperties = {
  background: 'rgba(255,255,255,0)',   // transparent — Figma: unofficial/ghost
  borderRadius: '16px',
  boxShadow: '0px 10px 15px 0px rgba(0,0,0,0.1), 0px 4px 6px 0px rgba(0,0,0,0.1)',
}
```

---

## 9. Animacje

```css
/* Standardowe przejście — micro-interactions */
transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);

/* Przejście tylko koloru (hover taby) */
transition: color 180ms cubic-bezier(0.16, 1, 0.3, 1),
            background 180ms cubic-bezier(0.16, 1, 0.3, 1);

/* Pulsowanie markera alertu na mapie */
@keyframes pulse-ring {
  0%   { transform: scale(1);   opacity: 0.8; }
  50%  { transform: scale(1.5); opacity: 0.3; }
  100% { transform: scale(2);   opacity: 0; }
}
.animate-pulse-ring {
  animation: pulse-ring 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}
```

**Zasada `prefers-reduced-motion`:**
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-ring { animation: none; }
  * { transition-duration: 0.01ms !important; }
}
```

---

## 10. Layout Główny

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Panel lewy 272px]    [       Mapa (flex-1)       ]  [Panel prawy 280px]  │
│                                                                      │
│  [LeftToolbar]         [      BottomNav (center)    ]  [RightToolbar]      │
└──────────────────────────────────────────────────────────────────────┘
```

```tsx
// MonitoringPage layout
<div className="relative w-full h-full overflow-hidden">
  {/* Mapa — fullscreen */}
  <div className="absolute inset-0 z-0" />

  {/* Panele — top-6 do bottom-22 (= bottom 88px) */}
  <div className="absolute left-6 top-6 bottom-22 z-10 flex flex-col">
    <LeftPanel />
  </div>
  <div className="absolute right-6 top-6 bottom-22 z-10 flex flex-col">
    <RightPanel />
  </div>

  {/* Toolbary — niezależne, zawsze bottom-6 */}
  <div className="absolute left-6 bottom-6 z-10">
    <LeftToolbar />
  </div>
  <div className="absolute right-6 bottom-6 z-10">
    <RightToolbar />
  </div>

  {/* BottomNav — center, bottom-6 */}
  <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
    <BottomNav />
  </div>
</div>
```

**Wartości px:**
- Panel top: 24px od góry
- Panel bottom: 88px od dołu (`bottom-22`)
  - = 24px bottom gap + 40px toolbar height + 24px panel-toolbar gap
- Toolbar i BottomNav: 24px od dołu (`bottom-6`)

---

## 11. Toolbar Pattern

### Outer Pill (transparent + shadow-lg)
```tsx
const PILL: React.CSSProperties = {
  background: 'rgba(255,255,255,0)',
  borderRadius: '16px',
  boxShadow: '0px 10px 15px 0px rgba(0,0,0,0.1), 0px 4px 6px 0px rgba(0,0,0,0.1)',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}
```

### Inner Group (#f5f5f5 + drop-shadow)
```tsx
const INNER_GROUP: React.CSSProperties = {
  background: '#f5f5f5',
  borderRadius: '12px',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  filter: 'drop-shadow(0px 5px 7.5px rgba(0,0,0,0.1)) drop-shadow(0px 2px 3px rgba(0,0,0,0.1))',
}
```

### Tab Button (32×32 min, 10px padding boczny)
```tsx
// Nieaktywny
<button className="flex items-center justify-center min-h-8 min-w-8 px-2.5 py-[5.5px] rounded-lg hover:bg-black/5 cursor-pointer transition-colors duration-180">

// Aktywny (białe tło + drop-shadow)
<button
  className="flex items-center justify-center min-h-8 min-w-8 px-2.5 py-[5.5px] rounded-lg cursor-pointer"
  style={{
    background: '#ffffff',
    filter: 'drop-shadow(0px 1px 1.5px rgba(0,0,0,0.1)) drop-shadow(0px 0.5px 1px rgba(0,0,0,0.1))',
  }}
>
```

### Icon w tabie (z Figma SVG asset)
```tsx
// Icon container: size-5 (20px), overflow-clip
// Wartość inset zależy od ikony (z Figma code export)
<div className="overflow-clip relative shrink-0 size-5">
  <div className="absolute inset-[9.38%]">
    <img alt="" className="absolute block inset-0 max-w-none size-full" src="/toolbar-grid.svg" />
  </div>
</div>
```

**Wartości `inset` dla ikon toolbarów (z Figma):**
| Asset | inset |
|-------|-------|
| `toolbar-grid.svg` | `9.38%` |
| `toolbar-layers.svg` | `5.21% 5.14% 5.22% 5.21%` |
| `toolbar-history.svg` | `9.38%` |
| `toolbar-plus.svg` | `17.71%` |
| `toolbar-minus.svg` | `46.88% 17.71%` |
| `toolbar-refresh.svg` | `9.38%` |
| `toolbar-settings.svg` | `13.54%` |
| `toolbar-filter.svg` | `21.88% 9.38%` |
| `toolbar-bell.svg` | `5.21% 9.38%` |

SVG asety: `app/public/toolbar-*.svg`

---

## 12. BottomNav Pattern

### Outer Pill
```tsx
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
```

### Logo Pill (gradient)
```tsx
const LOGO_PILL: React.CSSProperties = {
  background: 'linear-gradient(227.291deg, rgb(249,249,249) 27.268%, rgb(234,234,234) 83.104%)',
  borderRadius: '12px',
  paddingLeft: '8px',
  paddingRight: '9px',
  paddingTop: '4px',
  paddingBottom: '4px',
  display: 'flex',
  alignItems: 'center',
}
```

### Nav Tab
```tsx
// Nieaktywny
<button className="flex items-center justify-center min-h-8 min-w-8 px-2.5 py-[5.5px] rounded-lg">
  <span className="text-sm font-medium text-[#0a0a0a]">Monitoring</span>
</button>

// Aktywny
<button style={{ background: 'white', filter: 'drop-shadow(0px 1px 1.5px rgba(0,0,0,0.1))' }}>
```

### "Deceris" text
```tsx
<span style={{ fontSize: '18px', letterSpacing: '-0.5px', fontWeight: 500, color: '#171717' }}>
  Deceris
</span>
```

---

## 13. Karta Alertu — struktura

```tsx
// Heatbar (3px high, gap 2px między segmentami)
.heatbar {
  display: flex;
  gap: 2px;
  height: 3px;
  border-radius: 2px;
  overflow: hidden;
}
.heatbar-segment {
  flex: 1;
  transition: opacity 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

// Karta struktury (3 linie)
// Linia 1: nazwa rzeki (akwenu) + badge severity + trend + czas
// Linia 2: nazwa stacji dominującej + wartość cm (Geist Mono) 
// Linia 3: heatbar segmentów odcinków
```

---

## 14. Z-index Scale

```css
z-0   /* Mapa — warstwa tła */
z-10  /* Panele i toolbary */
z-20  /* Overlays, drawery */
z-30  /* Toasty, powiadomienia */
z-50  /* Modale */
```

---

## 15. Ikony

Biblioteka: **Lucide React** (`lucide-react`)

```bash
npm install lucide-react
```

```tsx
import { Waves, Droplets, CloudRain, AlertTriangle, AlertOctagon,
         MapPin, Map, Layers, Navigation, Ruler, PenLine, Shapes,
         Shield, Gauge, Activity, FileDown, Share2,
         LayoutGrid, History, Plus, Minus, RefreshCw,
         SlidersHorizontal, AlignJustify, Bell } from 'lucide-react'
```

**Zasada:** Ikony z Figmy (SVG assets) używane gdy Figma eksportuje własne ikony brandowe (ring logo, toolbar ikony). Lucide używany dla standardowych UI icons.

---

## 16. Dostępność (WCAG 2.1 AA)

- Severity nie tylko przez kolor — kształt markera (▲▼■) jako dodatkowy wskaźnik
- Minimalny kontrast tekstu: 4.5:1 (normal), 3:1 (large)
- Touch target min: 32×32px (`min-h-8 min-w-8`)
- Focus visible na wszystkich interaktywnych elementach
- `prefers-reduced-motion` respektowany dla animacji
- `aria-label` na ikonach bez tekstu
- Alternatywa tabelaryczna dla widoków mapowych

---

## 17. Shadcn/ui — komponenty

Projekt używa shadcn/ui z bazą **Radix**.

```bash
# Inicjalizacja (jeśli nowy projekt)
npx shadcn@latest init

# Dodawanie komponentów
npx shadcn@latest add button card dialog sheet scroll-area badge
```

**Ważne zasady:**
- Spacing: `gap-*` zamiast `space-x-*` / `space-y-*`
- Rozmiary: `size-*` gdy width = height
- Kolory: tokeny semantyczne (`text-muted-foreground`) zamiast hardcoded
- Ikony w Button: `data-icon="inline-start"` / `data-icon="inline-end"`
