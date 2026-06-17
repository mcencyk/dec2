# Deceris — Audyt spójności systemu
**Data:** 2026-04-07  
**Zakres:** monitor.html, threats.html, threat-detail.html, analysis.html, decision.html + pliki JS/CSS

---

## PRIORYTET 1 — Krytyczne niespójności konceptualne
*(Łamią logikę systemu jako generycznego Decision OS)*

---

### P1.1 — Hardcoded dane hydrologiczne w HTML i JS

**Problem:** Wartości i nazwy specyficzne dla flood/hydro są zakodowane na stałe w widokach. System nie jest generyczny.

**Gdzie występuje:**
- `monitor.html` — feed "Ostatnie zdarzenia": wartości `212cm`, `195cm`, `156cm`, `158cm`, jednostki `cm`, nazwy stacji Kłodzko/Bardo/Bystrzyca/Leśna
- `monitor.html` — "Status źródeł danych": hardcoded IMGW SHAPI, NMT 1m, BDOT10k, ISOK mapy, MPHP sieć — to są źródła dla flood risk, nie dla "air quality" albo "infrastruktura"
- `threat-detail.html` — imiona stacji Kłodzko/Bardo/Nysa w legendzie wykresu, "Kłodzko-Południe" w consequence card, "Pęknięcie wału" jako scenariusz
- `threat-detail.js` — `VIEW_SCHEMA` z `flood_polygon`, `water_level`, `precipitation_pct`, `levee_breach_km`
- `threat-detail.js` — `TASK_DATA` z opisami specyficznymi dla powodzi (worki z piaskiem, stacja pomp, DK8)
- `monitor.js` — cała tablica `GAUGES` to stacje hydrologiczne, wszystkie z `threat_type: 'Flood Risk'`

**Jak naprawić:**
- Feed "Ostatnie zdarzenia" powinien pokazywać `identify_key · metric_value · metric_unit · delta · severity` — dane te powinny być wstrzykiwane z `THREAT_OUTPUT.properties`, nie zakodowane
- "Status źródeł danych" powinien być dynamiczną listą z `DATA_SOURCES` config — operator definiuje jakie źródła ma jego system
- `VIEW_SCHEMA` w JS jest właściwym miejscem na dane — tylko etykiety w HTML nie powinny być hardcoded hydro-specific
- `TASK_DATA` i `SCENARIO_RESULTS` to wireframe data — OK jako mock, ale powinny być oznaczone jako `// MOCK DATA — w produkcji z API`

---

### P1.2 — GIS sidebar w trybie Monitor nie zmienia się

**Problem:** W trybie GIS prawy panel nadal pokazuje "Aktywne zagrożenia" i "Ostatnie zdarzenia". Konceptualnie w trybie GIS użytkownik pracuje na geometrii — sidebar powinien pokazywać narysowane obiekty i warstwy mapy, nie listę alertów.

**Gdzie:** `monitor.html`, `monitor.js`

**Jak naprawić:**
- Tryb Monitor → prawy sidebar: Aktywne zagrożenia + Ostatnie zdarzenia + Status źródeł
- Tryb GIS → prawy sidebar: Obiekty GIS (lista narysowanych) + Warstwy mapy (toggles: sieć rzeczna, zagrożenia, ortofoto)
- Przełączenie trybu powinno zamieniać zawartość sidebara, nie tylko pokazywać/ukrywać toolbar

---

### P1.3 — "Nazwy rzek" toggle na monitorze — specyficzne dla flood

**Problem:** Checkbox "Nazwy rzek" w lewym górnym rogu mapy Monitora jest specyficzny dla systemu hydrologicznego. W systemie ogólnym nie ma "rzek" — są warstwy bazowe.

**Gdzie:** `monitor.html` linia 121

**Jak naprawić:**
Przenieść do sidebara GIS mode jako "Warstwy mapy" z generycznymi warstwami: `Sieć rzeczna / Granice administracyjne / Ortofotomapa` — włączane tylko w trybie GIS gdzie mają sens.

---

## PRIORYTET 2 — Niespójności nawigacyjne i UX

---

### P2.1 — Monitor i Threats mają broken nav links

**Problem:** W `threats.html` i `threat-detail.html` linki do Monitor i Data Sources prowadzą do `#` zamiast do właściwych plików.

**Gdzie:**
- `threats.html` linia 25: `<a href="#" class="nav-item">` (Monitor) — powinno być `monitor.html`
- `threats.html` linia 38: `<a href="#" class="nav-item">` (Data Sources) — brak ekranu
- `threat-detail.html` linia 25: `<a href="#" class="nav-item">` (Monitor) — powinno być `monitor.html`
- `threat-detail.html` linia 38: `<a href="#" class="nav-item">` (Data Sources) — brak ekranu

**Jak naprawić:**
- Monitor → `monitor.html` wszędzie
- Data Sources → tymczasowo `#` jest OK ale powinno być oznaczone jako "coming soon" albo disabled

---

### P2.2 — Threat Detail wraca do Threats ale Analysis nie ma linku do Threat Detail

**Problem:** Flow jest jednostronny. Można wejść z Threats → Threat Detail, ale z Analysis Session nie ma bezpośredniego linku do powiązanego Threat Detail.

**Gdzie:** `analysis.html` — sesje z `linked_threat` mają "Otwórz →" ale link prowadzi do `threat-detail.html` bez parametru który threat

**Jak naprawić:**
- Link "Otwórz →" w sesji powinien prowadzić do `threat-detail.html?threat=EVT-2026-04-003`
- Threat Detail powinien obsługiwać parametr URL żeby wiedzieć który Threat wyświetlić

---

### P2.3 — Decision screen nie ma linku powrotnego do Threat Detail

**Problem:** Po zatwierdzeniu decyzji użytkownik ląduje na `decision.html`. Breadcrumb prowadzi do `← Zagrożenia` (lista), ale nie ma opcji powrotu do konkretnego Threat Detail który był bazą decyzji.

**Gdzie:** `decision.html` breadcrumb

**Jak naprawić:**
Breadcrumb: `← Zagrożenia / EVT-2026-04-003 / Decyzja` — środkowy element powinien być klikalnyn linkiem do `threat-detail.html`.

---

### P2.4 — Threats w topbarze threat-detail.html jest zwykłym tekstem, nie linkiem

**Problem:** W topbarze threat-detail.html breadcrumb `EVT-2026-04-003` jest tylko textem. Nie można kliknąć żeby wrócić.

**Gdzie:** `threat-detail.html` linia 61

**Jak naprawić:**
`<a href="threats.html" class="td-back-link">← Zagrożenia</a>` już istnieje — ale `EVT-2026-04-003` powinien też być klikalny (link do threats.html lub do reload tego samego ekranu od step 1).

---

## PRIORYTET 3 — Niespójności językowe i terminologiczne

---

### P3.1 — Mieszanie polskiego i angielskiego

**Problem:** System ma polskie UI ale wiele terminów technicznych jest po angielsku bez uzasadnienia.

**Gdzie:**
- `threats.html` — status tag "Acknowledged" (ang.) — powinno być "Potwierdzone" lub zostać po angielsku jako termin techniczny (do decyzji)
- `threats.html` — filter buttons: "Acknowledged", "Resolved" (ang.) — reszta po polsku
- `threat-detail.js` — `btn.innerHTML = 'Acknowledged'` po angielsku
- `monitor.js` — wszystkie `severity_key` to angielskie słowa: `'warning'`, `'flood'`, `'watch'`, `'normal'` — to jest poprawne (są to klucze z definicji Threata przez operatora, nie etykiety UI) — **TO JEST OK**, keys mogą być po angielsku
- `threat-detail.html` — "Pobieranie danych IMGW..." — OK, hydro-specific ale jako mock jest dopuszczalne

**Jak naprawić:**
Ustalić zasadę: **klucze techniczne** (severity_key, identify_key, field names) mogą być po angielsku. **Etykiety UI** (przyciski, nagłówki, statusy widoczne dla użytkownika) powinny być po polsku.
- "Acknowledged" → "Potwierdzone"
- "Resolved" → "Zamknięte"  
- "Running" w analysis → "W toku"
- "Complete" w analysis → "Zakończona"
- "Draft" w analysis → "Szkic"

---

### P3.2 — Niespójna terminologia dla tego samego pojęcia

**Problem:** To samo pojęcie nazywane różnie w różnych ekranach.

**Lista:**
| Pojęcie | W threats.html | W monitor.html | W threat-detail.html | Proponowany standard |
|---------|---------------|---------------|---------------------|---------------------|
| Lista alertów | "Threats" (topbar) | "Aktywne zagrożenia" (sidebar) | "Zagrożenia" (breadcrumb) | **Zagrożenia** wszędzie |
| Severity level | "L3", "flood" | "flood", "L3" | "POWÓDŹ" | Wybrać jeden format: badge z severity_key ALBO badge z etykietą — nie oba |
| Czas do zdarzenia | "Peak za 36h" (threats) | "· 36h" (monitor sidebar) | "~36 godzin" (threat-detail) | **Następna zmiana: 36h** lub **Peak: T+36h** |
| Typ zagrożenia | "Flood Risk" (tag) | "Flood Risk" (sidebar) | "Flood Risk" (topbar) | Spójne — **OK** |
| Ekran listy alertów | href="threats.html" | href="threats.html" | "← Zagrożenia" | Spójne — **OK** |

---

### P3.3 — "Analysis" po angielsku w topbarze

**Problem:** `analysis.html` topbar pokazuje "Analysis" zamiast "Analiza" — jedyny ekran który ma angielski tytuł w topbarze.

**Gdzie:** `analysis.html` linia 59: `<h1 class="analysis-title">Analysis</h1>`

**Jak naprawić:** `Analysis` → `Analiza`

---

## PRIORYTET 4 — Drobne niespójności wizualne i CSS

---

### P4.1 — Topbar threat-detail używa klasy `td-topbar` zamiast `topbar`

**Problem:** `threat-detail.html` ma `class="topbar td-topbar"` — dodatkowa klasa. Wszystkie inne ekrany mają tylko `class="topbar"`. To może powodować różne height lub style jeśli `td-topbar` ma nadpisujące style.

**Gdzie:** `threat-detail.html` linia 57 + `threat-detail.css`

**Jak naprawić:** Sprawdzić czy `td-topbar` dodaje coś istotnego. Jeśli nie — usunąć i używać tylko `topbar`.

---

### P4.2 — KPI row na Threats — czy jest potrzebna?

**Problem:** Threats ma KPI row: "3 Aktywne alerty / 7 Aktywne zdarzenia / 1 Oczekuje acknowledge / 36h Następna zmiana". Monitor został uproszczony i nie ma KPI row. Threats ma — ale "7 Aktywne zdarzenia" to hardcoded liczba bez logiki.

**Gdzie:** `threats.html` linia 100-117

**Jak naprawić:** Albo dynamicznie liczyć z listy alertów, albo usunąć jeśli lista już pokazuje wszystko. KPI "1 Oczekuje acknowledge" ma realną wartość — reszta jest redundantna z listą.

---

### P4.3 — Brak `favicon` i `<title>` konsekwentnych

**Problem:** Każdy plik ma inny albo brak `<title>`. 

**Jak naprawić:** Ujednolicić wzorzec: `Deceris — [Nazwa ekranu]`

---

## PODSUMOWANIE — Co naprawić w jakiej kolejności

| # | Problem | Priorytet | Pracochłonność |
|---|---------|-----------|----------------|
| P1.2 | GIS sidebar nie zmienia zawartości | **Krytyczny** | Mała |
| P2.1 | Broken nav links (Monitor = `#`) | **Wysoki** | Minimalna |
| P2.3 | Decision → brak linku do Threat Detail | **Wysoki** | Minimalna |
| P3.1 | "Acknowledged/Resolved" po angielsku | **Średni** | Mała |
| P3.2 | "Peak za 36h" vs "~36 godzin" | **Średni** | Mała |
| P3.3 | "Analysis" zamiast "Analiza" | **Niski** | Minimalna |
| P1.1 | Hardcoded hydro w feed/sources | **Średni** | Średnia (wymaga refaktoru JS) |
| P1.3 | "Nazwy rzek" → przeniesienie do GIS | **Średni** | Mała |
| P4.2 | KPI row na Threats — redundancja | **Niski** | Mała |
| P4.1 | `td-topbar` klasa | **Niski** | Minimalna |

---

*Audyt nie obejmuje: index.html (stary River Event, nieużywany w nawigacji), pliki CSS (ocena wizualna wymaga Playwright QA).*
