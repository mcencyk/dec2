# Deceris — Frontend Styles Specification
**Źródło:** Figma Master File + implementacja React+Vite  
**Data:** 2026-06-19  
**Stack:** React 19 · Vite · TypeScript · Tailwind v4 · shadcn/ui (Radix base) · Lucide React · MapLibre GL JS

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

Panele i pills pływające nad mapą używają własnego systemu CSS klas liquid glass — zdefiniowanych w `app/src/index.css`. **Nie używać inline styles dla glass efektu** — klasy CSS zawierają pełny efekt.

### Dwie klasy

| Klasa | Zastosowanie |
|-------|-------------|
| `.lg-panel` | Duże panele boczne: `LeftPanel`, `RightPanel` |
| `.lg-pill` | Małe pills: toolbary, `BottomNav` |

```css
/* ─── .lg-panel — duże panele ─────────────────────────────────────── */
.lg-panel {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(28px) saturate(2.2) brightness(1.06);
  -webkit-backdrop-filter: blur(28px) saturate(2.2) brightness(1.06);
  border: 1px solid rgba(255, 255, 255, 0.62);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1.5px 0 rgba(255, 255, 255, 0.90),
    inset 0 -1px 0 rgba(0, 0, 0, 0.03);
}

/* Specular highlight — white gradient overlay (refraction effect) */
.lg-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    148deg,
    rgba(255, 255, 255, 0.40) 0%,
    rgba(255, 255, 255, 0.08) 28%,
    transparent 55%
  );
  pointer-events: none;
  z-index: 20;        /* ← WAŻNE: maluje nad zawartością */
}

/* ─── .lg-pill — małe pills ────────────────────────────────────────── */
.lg-pill {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(24px) saturate(2.0) brightness(1.06);
  -webkit-backdrop-filter: blur(24px) saturate(2.0) brightness(1.06);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow:
    0 10px 32px rgba(0, 0, 0, 0.12),
    0 3px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.90),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.03);
}

.lg-pill::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    148deg,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.10) 35%,
    transparent 58%
  );
  pointer-events: none;
  z-index: 20;
}
```

### KRYTYCZNY WZORZEC: `zIndex: 21` dla elementów powyżej glass overlay

`::after` pseudo-element maluje white gradient na `z-index: 20`. **Każdy element który musi pokazywać swój prawdziwy kolor** (badge, liczba, logo, ikona) wymaga:

```tsx
// Wzorzec obowiązkowy — bez tego element wygląda szaro / wypłowiało
style={{ position: 'relative', zIndex: 21 }}

// Przykłady z kodu:
// Badge powiadomień (RightToolbar.tsx)
<div style={{ position: 'relative', zIndex: 21 }}>
  <span className="text-[10px] font-semibold text-white">30</span>
</div>

// Logo w BottomNav
<img src="/logo-deceris.png" style={{ position: 'relative', zIndex: 21, ... }} />

// Elementy severity badge wewnątrz panelu
// — jeśli kolor wychodzi szary/wyblakły → dodaj position:relative + zIndex:21
```

### Stara klasa `.glass` (ogólna)

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid var(--glass-border);
}
```
Używana do mniej ważnych elementów które nie wymagają `::after` highlight. Preferuj `.lg-panel` / `.lg-pill`.

---

## 9. Animacje

```css
/* Standardowe przejście — micro-interactions */
transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);

/* Przejście tylko koloru (hover taby) */
transition: color 180ms cubic-bezier(0.16, 1, 0.3, 1),
            background 180ms cubic-bezier(0.16, 1, 0.3, 1);

/* ─── Glow markera alertu na mapie (radial gradient) ─── */
@keyframes glow-pulse {
  0%, 100% { opacity: 0.10; }
  50%       { opacity: 0.20; }
}
/* Normalny alert */
.animate-glow-pulse {
  animation: glow-pulse 2.8s ease-in-out infinite;
}
/* Highlighted (hover / aktywny) — szybsze */
.animate-glow-pulse-fast {
  animation: glow-pulse 1.4s ease-in-out infinite;
}

/* ─── Pulse ring (alternatywna animacja — nie używana aktualnie) ─── */
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
  .animate-glow-pulse,
  .animate-glow-pulse-fast,
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

### Logo — asset PNG

Logo to plik `app/public/logo-deceris.png` wyświetlany bezpośrednio jako `<img>`.  
`zIndex: 21` obowiązkowy — inaczej glass overlay przykrywa obraz kolorami.

```tsx
<img
  src="/logo-deceris.png"
  alt="Deceris"
  draggable={false}
  style={{
    height: '40px',
    width: 'auto',
    display: 'block',
    userSelect: 'none',
    position: 'relative',
    zIndex: 21,
  }}
/>
```

### Nav Tab
```tsx
// Nieaktywny
<button className="flex items-center justify-center min-h-8 min-w-8 px-2.5 py-[5.5px] rounded-lg">
  <span className="text-sm font-medium text-[#0a0a0a]">Monitoring</span>
</button>

// Aktywny (biała pastylka ze sliding animation)
<button style={{ background: 'white', boxShadow: '0px 1px 2px rgba(0,0,0,0.10)' }}>
```

**Sliding pill** — aktywna zakładka ma animowaną białą pastylkę tłową pozycjonowaną `absolute`, której pozycja i szerokość zmieniane są przez JS po każdej zmianie `activeSection`. Płynna animacja `left` + `width` przez `240ms cubic-bezier(0.16, 1, 0.3, 1)`, wyłączona na pierwszy render (`animated` state delay przez `requestAnimationFrame`).

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

---

## 18. Panel Scroll — hover-only scrollbar

Panele używają własnych klas CSS dla scrollbara — widoczny tylko na hover (jak w Finderze).

```css
/* Domyślna klasa — scrollbar ukryty, pojawia się na hover */
.panel-scroll {
  overflow-y: auto;
  scrollbar-width: none;      /* Firefox: ukryty */
}
.panel-scroll:hover {
  scrollbar-width: thin;      /* Firefox: 3px na hover */
  scrollbar-color: rgba(0,0,0,0.15) transparent;
}
/* WebKit: zawsze 3px szeroki, ale thumb transparent → hover pokazuje */
.panel-scroll::-webkit-scrollbar { width: 3px; }
.panel-scroll::-webkit-scrollbar-track { background: transparent; }
.panel-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
.panel-scroll:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); }
```

**WAŻNE: scrollbar (3px) redukuje szerokość contentu.** Elementy których prawy edge musi zostać nieruchomy (np. sparklines, wykresy) potrzebują układu:

```tsx
// ✅ Prawidłowo — lewy edge stały, prawy edge się kurczy
<div className="flex items-center" style={{ gap: '8px' }}>
  {/* Lewa strona — stała szerokość */}
  <div className="flex items-center shrink-0" style={{ gap: '4px', minWidth: '152px' }}>
    <SevBadge level={f.from} />
    <span>→</span>
    <SevBadge level={f.to} />
    <span>·</span>
    <InfoBadge label={`szczyt ${f.eta}`} />
  </div>
  {/* Prawa strona — flex-1, kurczy się gdy scrollbar */}
  <div className="flex-1 min-w-0">
    <Sparkline ... />  {/* ResponsiveContainer wypełnia rodzica */}
  </div>
</div>
```

Dla wykresów używać `<ResponsiveContainer width="100%">` — automatycznie śledzi szerokość rodzica przez `ResizeObserver`.

---

## 19. Markery na mapie — hover i klik

Marker stacji to SVG icon renderowany w divie z CSS transition na `transform` i `filter`.

```tsx
const BASE = 22  // stały rozmiar, nigdy nie zmienia się przez width prop

// Icon container — skaluje się i rzuca cień
<div style={{
  width: BASE,
  height: BASE,
  transform: isActive ? 'scale(1.18)' : 'scale(1)',
  filter: isActive || isLocalHover || isPanelHover
    ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.22)) drop-shadow(0 1px 3px rgba(0,0,0,0.14))'
    : 'none',
  transition:
    'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), filter 140ms cubic-bezier(0.16, 1, 0.3, 1)',
}}>
```

**Zasady:**
- `transform: scale()` na divie — CSS transition działa; zmiana SVG `width` prop jest natychmiastowa (bez transitiona)
- `drop-shadow` (filter) — śledzi kształt SVG (trójkąt/kwadrat), nie bounding box
- Stan `isActive` (kliknięty): scale + drop-shadow
- Stan `isLocalHover` / `isPanelHover`: tylko drop-shadow (bez scale)
- L0 (norma): brak glow animacji; L1–L3: `animate-glow-pulse` / `animate-glow-pulse-fast` na hover

### Tooltip markera (white card, slide in)

```tsx
// Zawsze w DOM gdy !isActive — opacity drives fade
{!isActive && (
  <div style={{
    background: 'rgba(255,255,255,0.94)',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.12), 0px 1px 3px rgba(0,0,0,0.08)',
    padding: '6px 10px',
    borderRadius: '8px',
    opacity: isLocalHover ? 1 : 0,
    transform: isLocalHover ? 'translateX(0)' : 'translateX(-4px)',
    transition: 'opacity 140ms cubic-bezier(0.16, 1, 0.3, 1), transform 140ms cubic-bezier(0.16, 1, 0.3, 1)',
  }}>
    <div className="text-[12px] font-semibold leading-4 text-[#27272a]">{station.name}</div>
    <div className="text-[11px] leading-4 text-[#71717a]">{station.value} cm</div>
  </div>
)}

// Aktywny marker — dark tooltip (zawsze widoczny)
{isActive && (
  <div style={{
    background: '#18181b',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.2), 0px 2px 4px rgba(0,0,0,0.12)',
    padding: '6px 10px',
    borderRadius: '8px',
    opacity: 1,
  }}>
    <div className="text-[12px] font-semibold text-white">{station.name}</div>
    <div className="text-[11px] text-[#a1a1aa]">{station.value} cm</div>
  </div>
)}
```

---

## 20. Custom Tooltip — portal-based

**Nie używać natywnego `title=`** — wygląda jak przeglądarka, nie jak design system.  
Zamiast tego: `app/src/components/ui/Tooltip.tsx` — portal renderowany w `document.body`.

```tsx
// Użycie
import { Tooltip } from '@/components/ui/Tooltip'

<Tooltip text="Odśwież">
  <button onClick={handleRefresh}>
    <RefreshCw size={16} />
  </button>
</Tooltip>

// side="bottom" dla elementów blisko górnej krawędzi
<Tooltip text="Status danych" side="bottom">
  <div>...</div>
</Tooltip>
```

```tsx
// Implementacja — app/src/components/ui/Tooltip.tsx
import { useState } from 'react'
import { createPortal } from 'react-dom'
import React, { type ReactElement } from 'react'

interface TooltipProps {
  text: string
  children: ReactElement<any>
  side?: 'top' | 'bottom'
}

export function Tooltip({ text, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  const child = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseEnter?.(e)
      const r = e.currentTarget.getBoundingClientRect()
      setCoords({
        x: r.left + r.width / 2,
        y: side === 'top' ? r.top - 6 : r.bottom + 6,
      })
      setVisible(true)
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseLeave?.(e)
      setVisible(false)
    },
  })

  return (
    <>
      {child}
      {createPortal(
        <div style={{
          position: 'fixed',
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: side === 'top' ? 'translateX(-50%) translateY(-100%)' : 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 9999,
          background: '#000',
          color: '#fff',
          fontSize: '12px',
          lineHeight: '16px',
          padding: '6px 8px',
          borderRadius: '8px',
          whiteSpace: 'nowrap',
          fontFamily: 'Geist Variable, sans-serif',
          opacity: visible ? 1 : 0,
          transition: 'opacity 120ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {text}
        </div>,
        document.body,
      )}
    </>
  )
}
```

**Dlaczego `createPortal`:** panele i toolbary mają `overflow: hidden` (wymagane przez `backdrop-filter`). Tooltip wyrenderowany wewnątrz byłby ucinany. Portal do `document.body` + `position: fixed` omija ten problem.
