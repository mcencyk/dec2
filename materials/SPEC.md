# Deceris — Specyfikacja systemu
**Data:** 2026-04-07  
**Status:** Draft do dyskusji

---

## 1. Czym jest Deceris

Deceris to **Decision Operating System** — system wspomagający podejmowanie decyzji w sytuacjach kryzysowych. Nie jest to system monitoringowy który "pokazuje dane". Jego zadaniem jest prowadzenie decydenta przez kryzys od pierwszego sygnału do zatwierdzonego planu działań.

Kluczowe pytanie użytkownika: **"Co mam teraz zrobić?"** — nie "co się dzieje".

---

## 2. Architektura systemu (co już istnieje w implementacji)

### 2.1 Threat — generyczny byt
Threat to universalny kontener zagrożenia definiowany przez operatora:
- **Nazwa + opis + state** (Draft/Active)
- **Severity Levels** — operator definiuje nazwy i kolory (np. `warning`=żółty, `flood`=czerwony)
- **Pipeline** — oblicza czy zagrożenie wystąpiło i na jakim poziomie severity
- **Threat Output** — węzeł pipeline'u produkujący zdarzenia:
  - `identify_key` — identyfikator zdarzenia (np. "Kłodzko km 34.2")
  - `severity_key` — poziom (np. "flood", "warning")
  - `geometry` (WKT) — lokalizacja przestrzenna
  - `group_key` (opcjonalny) — grupowanie zdarzeń w River Event / zdarzenie złożone
  - `properties` (wolny JSON) — dowolne dane (np. `{"water_level": 212, "unit": "cm"}`)
- **What-if Parameters** (do definicji) — lista parametrów nadpisywalnych przy symulacji
- **View Schema** (do definicji) — jak UI ma renderować właściwości

### 2.2 Timestamps i predykcja
- Każde zdarzenie Threat Output ma timestamp
- Przeszłość (historyczne) i przyszłość (predykcja) traktowane tak samo — rekordy z timestampem
- Predykcja oznaczona flagą
- Timeline scrubber na mapie pozwala poruszać się w czasie

### 2.3 Data Sources
- IMGW SHAPI — real-time dane hydrologiczne
- NMT 1m — model terenu
- BDOT10k — budynki, drogi, infrastruktura
- ISOK — mapy zagrożenia powodziowego
- MPHP — sieć rzeczna

### 2.4 Co jest zaimplementowane (UI wireframes)
- `monitor.html` — mapa z aktywnymi zagrożeniami, sidebar, data sources status
- `threats.html` — lista alertów z acknowledge flow, notyfikacje toast
- `threat-detail.html` — detail view (aktualnie zakładki, wymaga redesignu)
- `analysis.html` — sesje analityczne, historia
- `index.html` — stary River Event screen (zostaje jako backup)

---

## 3. Użytkownicy i role

**Operator** — konfiguruje system: definiuje Threaty, pipeline'y, severity levels, View Schema, What-if Parameters, templates widoków.

**Analityk** — pracuje z danymi: uruchamia what-if, analizuje konsekwencje, rysuje na mapie, tworzy propozycję planu działań.

**Decydent** — zatwierdza: przegląda porównanie scenariuszy, wybiera podstawę decyzji, zatwierdza plan. Nie konfiguruje, nie buduje pipeline'ów.

W praktyce jedna osoba może pełnić kilka ról.

---

## 4. Główny flow użytkownika (decision flow)

```
[SYGNAŁ]
Pipeline wykrywa zagrożenie → Threat aktywny → punkt na mapie Monitora
Decydent/analityk widzi: gdzie, jaki poziom severity, ile czasu

        ↓

[ZROZUMIENIE — Threat Detail, Krok 1: Sytuacja]
Kliknięcie w zagrożenie → widok szczegółowy
Consequence View: mapa z tym co jest realnie zagrożone (budynki, drogi, infra)
NIE TYLKO liczby — obiekty przestrzennie na mapie
Naturalne zdania: "Strefa zalewowa obejmuje ~2.4 km². W strefie: 47 budynków..."

        ↓

[EKSPLORACJA — Threat Detail, Krok 2: What-if]
Uruchom scenariusze (parametry z definicji Threata przez operatora)
Każdy scenariusz = inne konsekwencje, inna mapa
Wyniki inline, mapa aktualizuje się na żywo

        ↓

[WYBÓR — Threat Detail, Krok 3: Porównanie]
Dwie kolumny: Bazowy vs Scenariusz
Kluczowe różnice podkreślone (system wykrywa co się zmienia krytycznie)
Wybór jednego scenariusza jako podstawy decyzji

        ↓

[PLAN — Threat Detail, Krok 4: Plan działań]
System generuje propozycję zadań na podstawie:
- Danych consequence_view (które obszary zalane → ewakuacja)
- Danych o drogach (które przecinają strefę → zamknięcie)
- Danych o infrastrukturze (co jest zagrożone → zabezpieczenie)
- Geometrii (odcinki wałów → worki z piaskiem + szacunek ilości)
Analityk może: edytować, dodawać, usuwać zadania
Analityk może: narysować geometrię zadania na mapie (GIS tools)
Narysowana geometria → element zadania → trafia do decyzji

        ↓

[DECYZJA — Threat Detail, Krok 5: Zatwierdzenie]
Podsumowanie: scenariusz, zadania, autor, timestamp
Jeden przycisk "Zatwierdź decyzję"

        ↓

[OUTPUT — Decision screen]
Zatwierdzona decyzja z:
- Mapą decyzyjną (geometria wszystkich zadań)
- Listą zadań z priorytetami
- Podpisem elektronicznym
- Eksport PDF
```

---

## 5. View Schema — jak system wie co pokazać

Operator definiuje View Schema jako część Threata. UI renderuje dynamicznie.

```yaml
# Przykład — Flood Risk
View Schema:
  title_field:    station_name       # co pokazać jako tytuł zdarzenia
  subtitle_field: river_name
  metric_primary:
    field: water_level
    unit:  cm
    chart: timeseries
  severity_levels:
    - key: warning  label: Warning  color: "#EAB945"
    - key: flood    label: Flood    color: "#D95050"
  consequence_view:
    exposure_geometry: flood_polygon  # które pole geometry = strefa zalewowa
    assets:
      - layer: buildings   color_by: building_type
      - layer: roads       color_by: road_class
    gradient: true
  what_if_params:
    - name: precipitation_pct  label: "Zmiana opadów"    type: range  min: -50  max: 100  unit: "%"
    - name: levee_breach_km    label: "Pęknięcie wału"   type: number  unit: "km"  optional: true
```

Fallback: jeśli nie ma View Schema → generyczny panel z properties jako tabela.

---

## 6. Analysis Session

Oddzielny kontener analityczny — może, ale nie musi być powiązany z Threatem.

### Dwie ścieżki wejścia:
1. **Z Threata (kontekstowa)** — kliknięcie "Analizuj głębiej" w Threat Detail otwiera sesję pre-wypełnioną kontekstem Threata. UX ciągły, breadcrumb: `Threats → [nazwa] → Analiza`.
2. **Z sidebara Analysis (autonomiczna)** — pusta sesja, operator buduje pipeline od zera.

### Analysis Session zawiera:
- `linked_threat` — opcjonalne
- `visibility`: private | team | org
- `data_sources` — systemowe + prywatne (RBAC) + efemeryczne (jednorazowe uploady)
- `pipeline` — istniejący z Threata lub nowy ad-hoc (ten sam Pipeline Builder)
- `parameters` — what-if parameters
- `runs` — historia uruchomień

### Pipeline builder w sesji autonomicznej:
Dostępne bloki: data nodes + obliczeniowe (ale BEZ Threat Output — sesja nie produkuje eventów na mapę, BEZ Aggregate na razie).

### Lifecycle:
- Sesje nie są kasowane gdy Threat wygasa
- Sesje efemeryczne (typ B, dane jednorazowe) nie są archiwizowane

---

## 7. Monitor — ekran główny

### Tryb Monitor (default):
- Pełnoekranowa mapa
- Tylko aktywne zagrożenia — punkty colored by severity
- Brak historii (wyjątek: fade-out dla zdarzeń które właśnie wygasły)
- Sidebar po prawej: lista aktywnych Threatów z przyciskiem "Analizuj →"
- Kliknięcie punktu → sidebar pokazuje kontekst tego zagrożenia

### Tryb GIS:
- Ta sama mapa + aktywne zagrożenia (nadal widoczne)
- Lewy toolbar z narzędziami: zaznaczenie, linia, poligon, okrąg, marker, pomiar odległości, pomiar powierzchni, usuń, cofnij
- Prawy sidebar → lista narysowanych obiektów z opcją "Dodaj do planu"
- Dolny status bar: aktywne narzędzie + podpowiedź + metryki

### Przełącznik trybu:
Pill toggle w topbarze: `Monitor ● / GIS ○`

---

## 8. Threats — lista alertów

- Lista aktywnych Threatów (tylko te gdzie wystąpiło zagrożenie)
- Każda karta: severity badge, typ Threata, identify_key, metric_primary, trend, czas do następnej zmiany
- Status: Active (pulsujący dot), Acknowledged, Watch
- Acknowledge flow z escalation timeout banner
- Toast notifications dla nowych alertów
- Filtry: Wszystkie / Aktywne / Acknowledged / Resolved
- Kliknięcie → Threat Detail

---

## 9. Co NIE jest w systemie (decyzje projektowe)

- **Historia na ekranie Monitor** — nie. Historia jest w Analysis.
- **Aggregate jako węzeł** — nie na razie. Agregacja przez Lens (uproszczone) w przyszłości.
- **Multi-user approval flow** — nie na razie. Jeden człowiek zatwierdza.
- **Oddzielna aplikacja v2** — nie. Wszystko w `/deceris-river-event/`.

---

## 10. Aktualny stan UI — co jest OK, co wymaga pracy

| Plik | Stan | Co zmienić |
|------|------|------------|
| `monitor.html` | Częściowo OK | Dodać tryb GIS z toolbar |
| `threats.html` | OK koncepcyjnie | Etykiety już uogólnione, drobne poprawki |
| `threat-detail.html` | Wymaga redesignu | Zakładki → guided flow 5 kroków |
| `analysis.html` | OK | Minor tweaks (sesje autonomiczne) |
| `index.html` | Stary River Event | Zachować jako backup, nie używać w nawigacji |
| `decision.html` | BRAK | Stworzyć nowy ekran output decyzji |

---

## 11. Design system (niezmienne)

- Dark theme: bg `#0C0D10`, surface `#161720`, surface-2 `#1C1D28`
- Border: `#2A2B38`
- Text: `#E2E4EA` (primary), `#8B8D9A` (muted), `#5A5C6A` (faint)
- Teal: `#4F98A3` (accent)
- Severity: L1 `#EAB945`, L2 `#E08644`, L3 `#D95050`, L4 `#C74FBB`
- Fonts: Inter (body) + JetBrains Mono (data/ids/jednostki)
- Sidebar: 220px stały, topbar 56px
- Pełny viewport, brak scroll na body

---

## 12. Priorytet zmian (co robimy teraz)

1. **`threat-detail.html`** — redesign jako guided flow 5 kroków (największa zmiana)
2. **`monitor.html`** — dodanie trybu GIS
3. **`decision.html`** — nowy ekran (output flow)
4. **`threats.html`** — drobne poprawki jeśli potrzeba
5. **`analysis.html`** — minor tweaks (niski priorytet)
