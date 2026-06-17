# Deceris — View Schema Specification
**Wersja:** 1.0  
**Data:** 2026-04-07  
**Status:** Draft — do akceptacji przed implementacją

---

## 1. Czym jest View Schema

View Schema to deklaratywna konfiguracja dołączona do definicji Threata. Mówi systemowi **jak renderować dane z Threat Output** w interfejsie użytkownika — bez hardcoded logiki per typ zagrożenia.

Ten sam framework UI (Threat Detail workspace) renderuje różne widoki zależnie od View Schema. Operator definiuje schema raz — wszystkie role (analityk, decydent) widzą właściwy widok dla swojego Threata.

```
Threat Definition
  ├── Severity Levels
  ├── Pipeline
  └── View Schema  ←── ten dokument definiuje jego strukturę
```

---

## 2. Pełna struktura View Schema

```yaml
ViewSchema:
  # ── IDENTYFIKACJA ──────────────────────────────────────
  threat_type: string          # Nazwa typu zagrożenia wyświetlana w UI
  template: string             # Nazwa template renderera (patrz sekcja 3)
  
  # ── SEVERITY LEVELS ────────────────────────────────────
  severity_levels:             # Ordered from least to most severe
    - key: string              # Techniczny klucz (z Threat Output severity_key)
      label: string            # Etykieta wyświetlana w UI (po polsku lub EN)
      color: hex_string        # Kolor w UI (#RRGGBB)
  
  # ── POLA Z THREAT OUTPUT ───────────────────────────────
  title_field: string          # Pole z properties → tytuł zdarzenia w UI
  subtitle_field: string       # Pole z properties → podtytuł (opcjonalne)
  
  # ── METRYKI ────────────────────────────────────────────
  metric_primary:
    field: string              # Nazwa pola w properties
    label: string              # Etykieta w UI
    unit: string               # Jednostka (cm, AQI, %, m/s...)
    chart: chart_type          # Typ wykresu (patrz sekcja 5)
  
  metric_secondary:            # Opcjonalne
    field: string
    label: string
    unit: string

  # ── CONSEQUENCE VIEW ───────────────────────────────────
  consequence_view:
    map_type: map_renderer     # Typ renderera mapy (patrz sekcja 4)
    map_config: object         # Konfiguracja specyficzna dla renderera
    asset_layers:              # Warstwy obiektów nałożone na mapę
      - layer_id: string       # ID warstwy z Data Sources
        color_by: string       # Pole z properties do kolorowania
        icon: string           # Opcjonalny symbol (circle, square, cross...)
    consequence_metrics:       # Metryki w consequence panel (4 karty)
      - field: string          # Pole z properties lub obliczone
        label: string          # Etykieta
        icon: string           # Emoji lub nazwa ikony
        format: string         # number | currency_pln | percentage | text

  # ── WHAT-IF PARAMETERS ─────────────────────────────────
  what_if_params:
    - name: string             # Klucz parametru (przekazywany do pipeline)
      label: string            # Etykieta w UI
      type: param_type         # range | number | select | boolean
      min: number              # Dla type: range
      max: number              # Dla type: range
      default: any             # Wartość domyślna
      unit: string             # Opcjonalna jednostka
      options: [string]        # Dla type: select
      optional: boolean        # Czy pole jest opcjonalne

  # ── TASK TEMPLATES ─────────────────────────────────────
  task_templates:              # Proponowane zadania dla tego typu zagrożenia
    - id: string
      icon: string             # Emoji
      title: string
      description: string      # Szablon z możliwością interpolacji {{field}}
      geometry_type: string    # none | point | line | polygon
      trigger_condition: string # Warunek z properties kiedy zadanie jest sugerowane
                               # np. "properties.severity_key == 'flood'"

  # ── ANALYST / DECISION MAKER VIEWS ────────────────────
  analyst_view:
    gis_tools: [string]        # Które narzędzia GIS są dostępne
                               # select | line | polygon | circle | marker | measure
    gis_param_mapping:         # Jak narysowany obiekt mapuje na what-if param
      - geometry_type: string  # line | polygon | point
        suggest_param: string  # Sugerowany parametr (np. breach_km)
        extract: string        # Co wyciągnąć z geometrii (length | area | centroid)

  decision_view:
    visible_panels: [string]   # Które panele widzi decydent: situation | simulation | plan
    simulation_summary: string # Jak prezentować wyniki symulacji decydentowi
                               # comparison | recommendation | none
```

---

## 3. Typy rendererów map (`map_type`)

### 3.1 `flood_zone`
**Zastosowanie:** Zagrożenia powodziowe, wezbrania rzek

**Renderuje:**
- Sieć rzeczna (linie z MPHP/BDOT10k)
- Strefa zalewowa: gradient polygon teal→red, opacity 0.3
- Obiekty BDOT10k (budynki, drogi) wewnątrz strefy
- Wodowskazy jako punkty z etykietą i wartością

**Konfiguracja:**
```yaml
map_config:
  river_layer: mphp_network     # Źródło danych sieć rzeczna
  flood_geometry_field: flood_polygon  # Pole z geometry WKT strefy zalewowej
  gauge_identify_field: station_name   # Pole identify_key dla stacji
  gradient_colors: ['#4F98A3', '#D95050']  # Od normalnego do alarmowego
```

---

### 3.2 `dispersion_zone`
**Zastosowanie:** Jakość powietrza, wycieki chemiczne, promieniowanie

**Renderuje:**
- Siatka ulic (city grid z OSM/BDOT10k)
- Koncentryczne strefy dyspersji wokół źródła emisji
- Źródło emisji jako pulsujący punkt
- Strzałka wiatru z prędkością i kierunkiem
- Obiekty wrażliwe (szkoły, szpitale) jako ikony

**Konfiguracja:**
```yaml
map_config:
  source_geometry_field: source_point  # Punkt źródła emisji (WKT)
  rings:                               # Strefy zdefiniowane przez operatora
    - radius_field: radius_km_critical  # Pole z properties lub stała
      severity_key: hazardous
      label: "Strefa krytyczna"
    - radius_field: radius_km_moderate
      severity_key: unhealthy
      label: "Strefa narażenia"
  wind_field: wind_vector              # Pole z properties (kierunek + prędkość)
  shift_rings_by_wind: true            # Czy przesuwać strefy zgodnie z wiatrem
```

---

### 3.3 `slope_risk_zone`
**Zastosowanie:** Osunięcia ziemi, erozja, zagrożenia geologiczne

**Renderuje:**
- Cieniowanie terenu z NMT (ciemniejsze = większe ryzyko)
- Strefy ryzyka: polygon z gradientem intensywności
- Nachylenie stoków jako warstwa rastrowa
- Drogi i budynki w strefie ryzyka

**Konfiguracja:**
```yaml
map_config:
  risk_geometry_field: risk_polygon    # Polygon strefy ryzyka
  dem_layer: nmt_1m                   # Źródło modelu terenu
  risk_field: probability              # Pole z wartością ryzyka (0-1)
  gradient_colors: ['#EAB945', '#D95050']  # Od niskiego do wysokiego
  slope_threshold: 15                  # Kąt nachylenia triggering display (°)
```

---

### 3.4 `point_impact`
**Zastosowanie:** Awarie infrastruktury, incydenty punktowe, wypadki

**Renderuje:**
- Mapa tła (drogi, zabudowa)
- Punkt zdarzenia jako duży pulsujący marker
- Bufor wpływu (promień od punktu)
- Połączona infrastruktura jako linie (sieć energetyczna, wodociągowa)
- Zależne obiekty (co zależy od tej infrastruktury)

**Konfiguracja:**
```yaml
map_config:
  incident_geometry_field: location    # Punkt zdarzenia (WKT)
  impact_radius_field: impact_radius_km  # Promień wpływu
  network_layer: power_grid            # Warstwa sieci do wizualizacji
  dependency_layer: critical_infra     # Co zależy od tej sieci
  cascade_depth: 2                     # Jak głęboko pokazywać kaskadę
```

---

### 3.5 `generic`
**Zastosowanie:** Fallback gdy brak dedykowanego renderera

**Renderuje:**
- Mapa tła (OSM tiles lub ciemna siatka)
- Punkty/polygony z `geometry` z Threat Output
- Kolorowane wg `severity_key`
- Popup z `properties` jako tabela

**Konfiguracja:**
```yaml
map_config:
  background: dark_grid        # dark_grid | osm_dark | satellite
  geometry_field: geometry     # Pole z geometry WKT
  label_field: identify_key    # Pole do etykiet punktów
```

---

## 4. Typy wykresów (`chart_type`)

### `timeseries`
Szereg czasowy jednej lub wielu zmiennych.  
**Używane dla:** poziomy wody, przepływ, temperatura  
**Parametry:** `fields[]`, `threshold_lines[]`, `time_range_h`, `show_forecast: bool`

### `aqi_timeseries`
Szereg czasowy AQI z kolorowymi pasmami tła (WHO/EPA kategorie).  
**Używane dla:** jakość powietrza, stężenie PM2.5, NO2  
**Parametry:** `field`, `standard: who|epa|polish`, `time_range_h`

### `probability_trend`
Linia prawdopodobieństwa (0–100%) w czasie.  
**Używane dla:** osunięcia ziemi, ryzyko pożarów, ryzyko powodzi błyskawicznej  
**Parametry:** `field`, `threshold_pct`, `time_range_h`

### `bar_forecast`
Słupkowy wykres prognoz (np. opad godzinowy).  
**Używane dla:** opady, wiatr, fale uderzeniowe  
**Parametry:** `field`, `unit`, `time_range_h`, `threshold`

### `gauge_chart`
Wskaźnik półokrągły (jak tachometr) dla bieżącej wartości.  
**Używane dla:** AQI aktualny, poziom zagrożenia, moc wiatru  
**Parametry:** `field`, `min`, `max`, `zones: [{value, color, label}]`

### `none`
Bez wykresu w Sytuacja panelu.

---

## 5. Przykłady View Schema dla 4 typów zagrożeń

### 5.1 Flood Risk (hydro template)

```yaml
threat_type: "Flood Risk"
template: flood_zone
severity_levels:
  - { key: warning, label: "Ostrzeżenie",  color: "#EAB945" }
  - { key: flood,   label: "Powódź",       color: "#D95050" }
title_field: station_name
subtitle_field: river_name
metric_primary:
  field: water_level
  label: "Poziom wody"
  unit: cm
  chart: timeseries
metric_secondary:
  field: discharge
  label: "Przepływ"
  unit: m³/s
consequence_view:
  map_type: flood_zone
  map_config:
    river_layer: mphp_network
    flood_geometry_field: flood_polygon
    gauge_identify_field: station_name
  asset_layers:
    - { layer_id: bdot10k_buildings, color_by: building_type }
    - { layer_id: road_network,      color_by: road_class }
    - { layer_id: critical_infra,    icon: cross }
  consequence_metrics:
    - { field: buildings_at_risk, label: "Budynki zagrożone",     icon: "🏠", format: number }
    - { field: road_closures,     label: "Drogi zamknięte",       icon: "🚧", format: number }
    - { field: critical_objects,  label: "Infrastruktura krytyc.", icon: "⚡", format: number }
    - { field: estimated_loss,    label: "Szacowane straty",      icon: "💰", format: currency_pln }
what_if_params:
  - { name: precipitation_pct,  label: "Zmiana opadów",    type: range,  min: -50, max: 100, default: 0,    unit: "%" }
  - { name: levee_breach_km,    label: "Pęknięcie wału km", type: number, default: null, unit: "km", optional: true }
  - { name: reservoir_release,  label: "Zrzut ze zbiornika", type: boolean, default: false }
task_templates:
  - { id: evac,   icon: "🚨", title: "Zarządź ewakuację",         geometry_type: polygon,
      trigger_condition: "properties.buildings_at_risk > 10" }
  - { id: roads,  icon: "🚧", title: "Zamknij drogi",             geometry_type: line,
      trigger_condition: "properties.road_closures > 0" }
  - { id: sand,   icon: "🏗", title: "Rozłóż worki z piaskiem",  geometry_type: line,
      trigger_condition: "properties.levee_risk > 0.5" }
  - { id: infra,  icon: "⚡", title: "Zabezpiecz infrastrukturę", geometry_type: point,
      trigger_condition: "properties.critical_objects > 0" }
analyst_view:
  gis_tools: [select, line, polygon, marker, measure]
  gis_param_mapping:
    - { geometry_type: line, suggest_param: levee_breach_km, extract: length }
    - { geometry_type: polygon, suggest_param: evacuation_area_km2, extract: area }
decision_view:
  visible_panels: [situation, simulation, plan]
  simulation_summary: comparison
```

---

### 5.2 Air Quality Risk (dispersion template)

```yaml
threat_type: "Air Quality Risk"
template: dispersion
severity_levels:
  - { key: moderate,   label: "Umiarkowany",  color: "#EAB945" }
  - { key: unhealthy,  label: "Niezdrowy",    color: "#E08644" }
  - { key: hazardous,  label: "Niebezpieczny", color: "#D95050" }
title_field: location_name
subtitle_field: pollutant_type
metric_primary:
  field: aqi
  label: "Indeks AQI"
  unit: AQI
  chart: aqi_timeseries
metric_secondary:
  field: pm25
  label: "Stężenie PM2.5"
  unit: µg/m³
consequence_view:
  map_type: dispersion_zone
  map_config:
    source_geometry_field: source_point
    rings:
      - { radius_field: radius_critical_km, severity_key: hazardous, label: "Strefa krytyczna" }
      - { radius_field: radius_moderate_km, severity_key: unhealthy,  label: "Strefa narażenia" }
    wind_field: wind_vector
    shift_rings_by_wind: true
  asset_layers:
    - { layer_id: schools_preschools, icon: square,  color_by: null }
    - { layer_id: hospitals,          icon: cross,   color_by: null }
    - { layer_id: population_density, icon: dot,     color_by: density }
  consequence_metrics:
    - { field: aqi,               label: "Indeks AQI",        icon: "💨", format: number }
    - { field: population_at_risk, label: "Osoby narażone",   icon: "👥", format: number }
    - { field: schools_count,     label: "Szkoły w strefie",  icon: "🏫", format: number }
    - { field: hospitals_count,   label: "Szpitale w strefie", icon: "🏥", format: number }
what_if_params:
  - { name: wind_speed_ms,   label: "Prędkość wiatru",  type: range,  min: 0, max: 20, default: 4,  unit: "m/s" }
  - { name: wind_direction,  label: "Kierunek wiatru",  type: select, options: [N,NE,E,SE,S,SW,W,NW], default: SW }
  - { name: emission_factor, label: "Redukcja emisji",  type: range,  min: -100, max: 0, default: 0, unit: "%" }
task_templates:
  - { id: alert,   icon: "📢", title: "Wydaj ostrzeżenie publiczne",  geometry_type: polygon }
  - { id: schools, icon: "🏫", title: "Zamknij szkoły i przedszkola", geometry_type: none }
  - { id: medical, icon: "🏥", title: "Przygotuj placówki medyczne",  geometry_type: none }
  - { id: traffic, icon: "🚗", title: "Ogranicz ruch pojazdów",       geometry_type: polygon }
analyst_view:
  gis_tools: [select, polygon, marker, measure]
  gis_param_mapping:
    - { geometry_type: polygon, suggest_param: affected_area_km2, extract: area }
decision_view:
  visible_panels: [situation, plan]
  simulation_summary: recommendation
```

---

### 5.3 Landslide Risk (slope_risk template)

```yaml
threat_type: "Landslide Risk"
template: slope_risk
severity_levels:
  - { key: watch,    label: "Obserwacja",   color: "#EAB945" }
  - { key: elevated, label: "Podwyższone",  color: "#E08644" }
  - { key: critical, label: "Krytyczne",    color: "#D95050" }
title_field: sector_name
subtitle_field: geological_unit
metric_primary:
  field: probability
  label: "Prawdopodobieństwo"
  unit: "%"
  chart: probability_trend
metric_secondary:
  field: soil_saturation
  label: "Nasycenie gruntu"
  unit: "%"
consequence_view:
  map_type: slope_risk_zone
  map_config:
    risk_geometry_field: risk_polygon
    dem_layer: nmt_1m
    risk_field: probability
    slope_threshold: 15
  asset_layers:
    - { layer_id: bdot10k_buildings, color_by: building_type }
    - { layer_id: road_network,      color_by: road_class }
    - { layer_id: railways,          color_by: null }
  consequence_metrics:
    - { field: probability,        label: "Prawdopodobieństwo",    icon: "📊", format: percentage }
    - { field: buildings_at_risk,  label: "Budynki w strefie",     icon: "🏠", format: number }
    - { field: road_length_km,     label: "Drogi zagrożone",       icon: "🚧", format: number }
    - { field: evacuation_time_h,  label: "Czas ewakuacji",        icon: "⏱",  format: number }
what_if_params:
  - { name: rainfall_mm_24h,   label: "Opad 24h",           type: range,  min: 0, max: 200, default: 0,  unit: "mm" }
  - { name: soil_saturation,   label: "Nasycenie gruntu",   type: range,  min: 0, max: 100, default: 60, unit: "%" }
  - { name: seismic_trigger,   label: "Trzęsienie ziemi",   type: boolean, default: false }
task_templates:
  - { id: evac,    icon: "🚨", title: "Ewakuuj zagrożony obszar",     geometry_type: polygon,
      trigger_condition: "properties.probability > 0.7" }
  - { id: roads,   icon: "🚧", title: "Zamknij drogi w strefie",      geometry_type: line }
  - { id: monitor, icon: "📡", title: "Wzmocnij monitoring geologiczny", geometry_type: point }
analyst_view:
  gis_tools: [select, polygon, marker, measure]
  gis_param_mapping:
    - { geometry_type: polygon, suggest_param: affected_area_km2, extract: area }
decision_view:
  visible_panels: [situation, plan]
  simulation_summary: recommendation
```

---

### 5.4 Infrastructure Risk (point_impact template)

```yaml
threat_type: "Infrastructure Risk"
template: point_impact
severity_levels:
  - { key: degraded,  label: "Degradacja",  color: "#EAB945" }
  - { key: partial,   label: "Częściowa awaria", color: "#E08644" }
  - { key: critical,  label: "Awaria krytyczna", color: "#D95050" }
title_field: asset_name
subtitle_field: asset_type
metric_primary:
  field: failure_probability
  label: "Prawdopodobieństwo awarii"
  unit: "%"
  chart: probability_trend
metric_secondary:
  field: affected_customers
  label: "Odbiorcy bez zasilania"
  unit: os.
consequence_view:
  map_type: point_impact
  map_config:
    incident_geometry_field: location
    impact_radius_field: impact_radius_km
    network_layer: power_grid
    dependency_layer: critical_infra
    cascade_depth: 2
  asset_layers:
    - { layer_id: critical_infra,   icon: cross,   color_by: infra_type }
    - { layer_id: hospitals,         icon: cross,   color_by: null }
    - { layer_id: water_treatment,   icon: drop,    color_by: null }
  consequence_metrics:
    - { field: affected_customers,   label: "Odbiorcy bez zasilania", icon: "⚡", format: number }
    - { field: hospitals_affected,   label: "Szpitale bez zasilania", icon: "🏥", format: number }
    - { field: cascade_risk_pct,     label: "Ryzyko kaskady",        icon: "🔗", format: percentage }
    - { field: restoration_time_h,   label: "Szacowany czas naprawy", icon: "⏱",  format: number }
what_if_params:
  - { name: backup_power,       label: "Uruchomienie generatorów",  type: boolean, default: false }
  - { name: isolation_segment,  label: "Izoluj segment sieci",      type: select,
      options: [seg_A, seg_B, seg_C], default: null, optional: true }
  - { name: repair_crew_count,  label: "Liczba ekip naprawczych",   type: range,
      min: 1, max: 20, default: 3, unit: "ekipy" }
task_templates:
  - { id: generators, icon: "🔋", title: "Uruchom generatory awaryjne",  geometry_type: none }
  - { id: hospitals,  icon: "🏥", title: "Zabezpiecz szpitale",          geometry_type: none }
  - { id: repair,     icon: "🔧", title: "Wyślij ekipy naprawcze",       geometry_type: point }
  - { id: inform,     icon: "📢", title: "Powiadom odbiorców",           geometry_type: polygon }
analyst_view:
  gis_tools: [select, marker, measure]
  gis_param_mapping:
    - { geometry_type: point, suggest_param: repair_location, extract: centroid }
decision_view:
  visible_panels: [situation, plan]
  simulation_summary: recommendation
```

---

## 6. Pola obowiązkowe vs opcjonalne

| Pole | Wymagane | Fallback gdy brak |
|---|---|---|
| `threat_type` | TAK | — |
| `template` | TAK | `generic` |
| `severity_levels` | TAK | Dziedziczone z Threat Definition |
| `metric_primary` | TAK | Pierwsza metryka z `properties` |
| `consequence_view.map_type` | TAK | `generic` |
| `consequence_view.asset_layers` | NIE | Brak overlay na mapie |
| `consequence_metrics` | NIE | 4 pierwsze pola z `properties` |
| `what_if_params` | NIE | What-if niedostępny |
| `task_templates` | NIE | Tylko ręczne dodawanie zadań |
| `analyst_view.gis_param_mapping` | NIE | Tylko opcja "Notatka" po rysowaniu |
| `decision_view` | NIE | Decydent widzi pełny widok analityka |

---

## 7. Inline GIS → Panel mapping

Gdy analityk narysuje obiekt na mapie, system sprawdza `analyst_view.gis_param_mapping` i wyświetla popup:

```
[Narysowana linia: 1.4 km]
━━━━━━━━━━━━━━━━━━━━━━
Dodaj do:

[📋 Planu działań]    → przypisz do zadania lub utwórz nowe
                         geometria staje się częścią zadania

[⚡ Symulacji]        → sugerowany parametr: levee_breach_km = 1.4
                         pre-wypełnia formularz what-if

[📌 Notatka analityczna] → zostaje na mapie, nie trafia do planu/symulacji
━━━━━━━━━━━━━━━━━━━━━━
[Anuluj]
```

Mapping jest automatyczny gdy `gis_param_mapping` jest zdefiniowany. Gdy brak — popup pokazuje tylko "Planu działań" i "Notatka".

---

## 8. Wersjonowanie i governance

- Każdy Threat ma dokładnie jeden aktywny View Schema
- Operator może mieć wiele wersji (draft/published)
- Zmiana View Schema nie usuwa historycznych sesji analitycznych
- Templates (np. `hydro`, `dispersion`) są zarządzane przez organizację
- Użytkownicy organizacji mogą publikować własne templates z zakładki Analysis

---

*Dokument przeznaczony dla: Product, Frontend, Backend, QA*  
*Następna iteracja: dodanie pól dla `decision_view.approval_flow` gdy multi-user approval zostanie zdefiniowany*
