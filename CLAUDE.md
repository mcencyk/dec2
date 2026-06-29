# Deceris — CLAUDE.md
**Projekt:** Deceris  
**Ścieżka:** `/Users/mateuszcencyk/Projekty/Code/Deceris/`  
**Data aktualizacji:** 2026-06-26 (v5)

---

## Czym jest Deceris

Deceris to webowa aplikacja wspomagająca podejmowanie decyzji w sytuacjach kryzysowych — inicjalnie zagrożenia powodziowe w Polsce. Nie jest to narzędzie monitoringowe — jego zadaniem jest prowadzić użytkownika przez kryzys od sygnału do zatwierdzonego planu działań.

Nazwa produktu: **Deceris** (nie "Decision OS", nie "Decision Operating System").

Kluczowe pytanie użytkownika: **"Co mam teraz zrobić?"** — nie "co się dzieje".

### Unikalność na rynku
Istniejące narzędzia (IMGW hydro.imgw.pl, ISOK hydroportal, Google Flood Hub) mają dużą granulację i żadne nie pozwala na:
- tworzenie scenariuszy "co jeśli"
- rysowanie wału przeciwpowodziowego na mapie
- symulację wpływu wału na obszar zalewowy
- kalkulację zasobów (materiały, czas, ludzie) potrzebnych do budowy wału

---

## Analiza konkurencji — pozycjonowanie i wnioski

Pełna analiza: `materials/COMPETITIVE_ANALYSIS.md`

### Mapa rynku

| Klasa | Gracze | Mocne (co możemy przejąć) | Słabe (luka którą Deceris wypełnia) |
|-------|--------|--------------------------|--------------------------------------|
| **Monitoring** | hydro.imgw.pl, SIGW | Jedyne PL dane real-time, SHAPI API, zaufanie instytucjonalne | Brak decyzyjności, UI z 2010, zero what-if, zero kontekstu infrastruktury |
| **Mapy ryzyka** | ISOK Hydroportal | Oficjalne Q1%/Q10%/Q0.2%, NMT 1m, bezpłatny WMS/WFS | Statyczne (aktualizacja co 6 lat), brak real-time, brak API |
| **Predykcja globalna** | Google Flood Hub, Copernicus GFM | ML probabilistyczny, piękny UI consumer (Flood Hub) — benchmark wizualny | Consumer-grade, brak PL integracji, brak narzędzi operacyjnych |
| **Enterprise EM** | WebEOC (Juvare), ESRI ArcGIS | Audit trail, multi-agency, dojrzałość (WebEOC); potężny GIS (ESRI) | UI z 2005, brak mapy jako centrum, licencje $$$$, brak specjalizacji hydro PL |

### 5 różnicujących funkcji — czego nikt nie ma

| # | Funkcja | Dlaczego nikt nie ma |
|---|---------|----------------------|
| 1 | Scenariusze what-if dla powodzi | Istniejące systemy pokazują dane, nie pozwalają ich modyfikować |
| 2 | Rysowanie wału + natychmiastowa rekalkulacja zalewu | Wymaga integracji GIS + NMT + pipeline — zbyt złożone dla gotowych produktów |
| 3 | Kalkulator zasobów wału (piasek, worki, czas, koszt, ludzie) | Nieobecny w żadnym analizowanym systemie |
| 4 | Guided flow dla decydenta bez wiedzy GIS | ESRI wymaga GIS-analityka; WebEOC = formularze i listy bez mapy |
| 5 | Gotowa integracja IMGW SHAPI + ISOK WMS + BDOT10k | Każdy kto buduje podobny system musi to integrować od zera |

### Strategia integracji danych — nie reinwentujemy źródeł

- **IMGW SHAPI / danepubliczne.imgw.pl** — przejąć jako źródło real-time, nie duplikować infrastruktury pomiarowej
- **IMGW `warningshydro`** — API ostrzeżeń hydrologicznych = mechanizm triggerowania alertów; kody `kod_zlewni` mapują na MPHP → bezpośredni driver pipeline Decerisa
- **IMGW `warningsmeteo`** — ostrzeżenia meteorologiczne ("Intensywne opady deszczu") = pre-signal powodzi godziny/doby przed przekroczeniem progów hydrologicznych
- **IMGW Radar SRI** — real-time kompozyt natężenia opadów (mm/h) z 10+ radarów; warstwa analityczna "gdzie teraz pada i jak mocno"
- **ISOK WMS** — embedować strefy Q1%/Q10%/Q0.2% jako warstwy podkładowe
- **BDOT10k** — budynki, drogi, infrastruktura krytyczna jako kontekst zalewu
- **NMT 1m** — interpolacja zasięgu zalewu i kalkulacja objętości wałów
- **MPHP** — sieć rzeczna i zlewnie jako kontekst przestrzenny

---

## Użytkownicy i role

| Rola | Opis |
|------|------|
| **Operator** | Konfiguruje system: definiuje Threaty, pipeline'y, severity levels |
| **Analityk** | Pracuje z danymi: uruchamia what-if, analizuje, rysuje na mapie, tworzy propozycję planu |
| **Decydent** | Zatwierdza: przegląda porównanie scenariuszy, wybiera podstawę, zatwierdza plan |

W praktyce jedna osoba może pełnić kilka ról. Typowy użytkownik to wyspecjalizowany pracownik IMGW lub sztabu kryzysowego (poziom województwa). Tworzy scenariusze i PDF-y dla osoby decyzyjnej — może też wysłać interaktywny widok do symulacji.

---

## Architektura produktu

### Aplikacja
- Webowa (jedyne ograniczenie technologiczne)
- Pliki projektu w `materials/System/` — aktualny stan implementacji (HTML/CSS/JS)
- Brak backendu na razie — dane mockowane, architektura docelowo API-driven

### Główne ekrany
| Plik | Stan | Priorytet zmian |
|------|------|-----------------|
| `monitor.html` | Częściowo OK | Usunąć pill toggle Monitor/GIS, uprościć do czystej mapy z markerami (P1) |
| `threats.html` | OK koncepcyjnie | Drobne poprawki (P4) |
| `threat-detail.html` | Wymaga redesignu | Zakładki → mode bar MONITORING/ANALIZA/PLANOWANIE (P1) |
| `analysis.html` | Poza scope MVP | Feature v2.0 — nie rozwijać |
| `decision.html` | Poza scope | Zastąpiony przez eksport PDF z sekcji PLAN |
| `index.html` | Stary River Event | Zachować jako backup, nie używać w nawigacji |

### Kluczowe koncepty systemu

**Threat** — generyczny kontener zagrożenia definiowany przez operatora:
- Severity Levels (nazwy + kolory, np. `warning`=żółty, `flood`=czerwony)
- Pipeline obliczający czy zagrożenie wystąpiło i na jakim poziomie
- Threat Output: `identify_key`, `severity_key`, `geometry` (WKT), `group_key`, `properties` (wolny JSON)
- What-if Parameters — parametry nadpisywalne przy symulacji
- View Schema — jak UI renderuje właściwości

**Timeline** — każde zdarzenie ma timestamp; przeszłość i predykcja (72h do przodu) traktowane tak samo. Predykcja oznaczona flagą. Timeline scrubber na mapie.

**Analysis Session** — głębszy kontener analityczny, równoległa funkcjonalność wobec scenariuszy what-if. Może być powiązany z alertem lub autonomiczny (praca bez aktywnego kryzysu: prewencja, archiwum, planowanie). Ma visibility (private / team / org) i zostaje po wygaśnięciu alertu.

**Priorytet:** Alert Detail + scenariusze what-if są priorytetem (tryb operacyjny). Analysis Session to funkcjonalność drugiego planu (tryb analityczny/planistyczny).

---

## Architektura UX — Single-surface

**Kierunek: mapa jako serce produktu.** Stały layout: mapa zawsze w centrum (tło), panel alertów po prawej (280px, zawsze widoczny), kontekstowy panel po lewej (280px, zmienia zawartość per sekcja), pasek nawigacji na dole. Mapa nie resetuje pozycji ani zoomu przy przełączaniu sekcji.

### Layout ekranu (stały)

```
[Panel lewy 280px] [         Mapa (flex-1)         ] [Panel prawy 280px]
[      Nawigacja dolna: Monitoring · Analiza · Planowanie · Historia      ]
```

- **Panel lewy** — kontekstowy: w Monitoringu = ocena sytuacji + prognozy + filtry; w Analizie = scenariusze + narzędzia GIS; w Planowaniu = lista planów + eksport; w Historii = zamknięte alerty
- **Mapa** — zawsze widoczna, dynamicznie zmienia warstwy w zależności od aktywnej sekcji, nigdy nie resetuje pozycji/zoomu przy przełączaniu
- **Panel prawy** — lista alertów (zawsze widoczna), nawigacja 3-poziomowa: lista akwenów → szczegół akwenu (lista wodowskazów) → szczegół wodowskazu. Odcinki są wewnętrzną strukturą heatbara, nie osobnym poziomem nawigacji.
- **Nawigacja dolna** — 4 sekcje z licznikami aktywnych alertów: Monitoring / Analiza / Planowanie / Historia

**ANALIZA wymusza kontekst alertu.** Wejście do ANALIZY zawsze w kontekście konkretnego alertu klikniętego w panelu prawym lub na mapie — lewy panel przełącza się na narzędzia GIS i scenariusze, mapa zmienia warstwy.

### Mapa jako żywy organizm
Mapa nie jest statycznym podkładem — aktywnie reaguje na kontekst:
- zmienia stan w zależności od tego który panel/drawer jest otwarty
- podświetla, przyciemnia i filtruje warstwy odpowiednio do aktywnego kroku flow
- po otwarciu alertu — fokusuje się na obszarze zagrożenia, przyciemnia resztę
- po uruchomieniu scenariusza — nakłada nową warstwę zalewową live
- po narysowaniu wału — natychmiast rekalkuluje i aktualizuje zasięg zalewu

### Domyślny zoom przy starcie

Aplikacja startuje na jurysdykcji operatora (z profilu: `jurisdiction.bbox` + `home_zoom`). Nie pokazuje całego kraju — operator widzi swój obszar odpowiedzialności.

**Logika startu:**
1. Załaduj profil → pobierz `jurisdiction.bbox`
2. Jeśli aktywne alerty w jurysdykcji → zoom do bounding box alertów (ale nie szerzej niż jurysdykcja)
3. Jeśli brak alertów → zoom do pełnej jurysdykcji z `home_zoom`
4. Jeśli alerty poza jurysdykcją (np. ogólnokrajowe) → badge w topbarze informuje, mapa pozostaje na jurysdykcji

**Typy jurysdykcji:** województwo / powiat / zlewnia / custom bbox.

### Dynamiczny clustering znaczników

Mapa może być przeciążona znacznikami — wodomierze, stacje, zdarzenia. Clustering działa dynamicznie w zależności od poziomu zoomu:

| Poziom zoomu | Widok |
|--------------|-------|
| Kraj (zoom 6–8) | Klastry per dorzecze — liczba alertów + kolor dominującego severity |
| Dorzecze (zoom 9–11) | Klastry per zlewnia |
| Zlewnia / akwen (zoom 12–14) | Kolorowe segmenty rzeki (heatbar na mapie) + markery stacji |
| Stacja (zoom 15+) | Marker z etykietą stacji i severity badge inline |

**Reguły klastrów:**
- Kolor klastra = najwyższe severity w grupie
- Liczba na klastrze = liczba aktywnych alertów akwenowych (nie stacji)
- Kliknięcie klastra → zoom in do jego zawartości, nie overlay
- Klastry bez alertów — szare, mniejsze, bez liczby

**Pozostałe reguły znaczników:**
- **filtrowanie kontekstem** — otwarty alert na Odrze → przygaszone stacje z innych zlewni
- znaczniki bez alertu — mniejsze, mniej nasycone, bez pulsowania
- znaczniki z alertem pulsują z intensywnością odpowiednią do severity

### Znaczniki — zachować z prototypu
Obecny prototyp ma wartościowy wzorzec:
- pulsujące kolorowe znaczniki wodomierzy (kolor = severity)
- koryto rzeki i dopływy oznaczone jako warstwa
- subtelna ale wyraźna hierarchia: normalny stan vs alert vs krytyczny

Zachować ten język wizualny i rozbudować go — nie zastępować.

---

## Model danych — hierarchia geograficzna i alerty

### Hierarchia geograficzna (5 poziomów operacyjnych)

Dorzecze → Zlewnia → Akwen → Odcinek → Stacja. Poziomy Dorzecze i Zlewnia nie generują alertów — są nagłówkami grupującymi na liście. Stacja nie generuje alertu — jest źródłem danych. Alerty operacyjne powstają wyłącznie na poziomie Akwenu.

- Poziom 1: **Dorzecze** — nagłówek grupujący (Odra, Wisła, Pregoła)
- Poziom 2: **Zlewnia** — nagłówek grupujący (zlewnia Nysy Kłodzkiej)
- Poziom 3: **Akwen** — jednostka alertu (Nysa Kłodzka, Bystrzyca, Widawa)
- Poziom 4: **Odcinek** — przestrzeń między dwoma sąsiednimi stacjami (wewnętrzna struktura akwenu)
- Poziom 5: **Stacja** — punkt pomiarowy (wodowskaz), źródło danych

### Model alertu — jeden per akwen per zdarzenie

Alert reprezentuje akwen (rzekę), nie pojedynczą stację. Jeśli na tej samej rzece są dwa niezależne zdarzenia — tworzą dwa osobne alerty. Powiązane zdarzenia (ta sama fala) = jeden alert z wodowskazami wewnątrz.

Heatbar w karcie alertu: każdy segment = jeden wodowskaz. Liczba segmentów = liczba stacji na akwenie. Kolor segmentu = severity tej stacji. Kolejność: od źródła (lewo) do ujścia (prawo).

### Skala severity: L0–L3

- L0 — norma (`#e0e0e0` szary)
- L1 — uwaga (`#EF9F27` żółty)
- L2 — ostrzeżenie (`#E8711A` pomarańczowy)
- L3 — alarm (`#D93025` czerwony)

Severity alertu = severity najgorszego wodowskazu. Nagłówek karty alertu pokazuje najwyższy poziom wody ze wszystkich stacji wraz z nazwą tej stacji.

### Struktura karty alertu (linia 1 / linia 2 / heatbar)

Wspólny szkielet dla wszystkich trzech typów kart (Alert / Prognoza / Anomalia):
- Linia 1 lewo: nazwa rzeki (akwenu) — ZAWSZE rzeka, nigdy nazwa stacji
- Linia 1 prawo: element kontekstowy (badge severity+trend+czas / eta / ikona)
- Linia 2: nazwa dominującej stacji + wartość liczbowa + kontekst
- Linia 3: element wizualny (heatbar / pasek progresu / opis anomalii)

**Karta ALERTU:**
```
[Nazwa rzeki]              [badge: L0-L3] [trend: ↑↓→] [czas]
[Nazwa stacji dominującej] [wartość] cm
[heatbar — 1 segment per wodowskaz, kolor = severity stacji]
```

**Karta PROGNOZY** (per wodowskaz, nie per akwen):
```
[Nazwa stacji]             [za ~Xh]  lub  [szczyt za ~Xh]  lub  [poniżej progu za ~Xh]
[rzeka · km]

Wariant 1 (przed progiem):   [wartość] cm → [docelowy Lx]
                             [pasek progresu: % do progu]

Wariant 2 (po przekroczeniu, rośnie): [badge Lx aktywny] [wartość] cm ↑ → maks ~[Y] cm
                                      [pasek progresu: % do szczytu]

Wariant 3 (opada po szczycie): [badge Lx aktywny] [wartość] cm ↓ → L[x-1]
                                [pasek progresu odwrócony: % pozostałe do zejścia poniżej progu]
```

**Karta ANOMALII:**
```
[Nazwa rzeki]              [ikona typu] [czas]
[Nazwa stacji] [wartość] cm · [delta liczbowa np. +42 cm/30min]
[opis słowny max ~60 znaków]
```

Typy anomalii: `⚠` wzrost bez korelacji / `○` brak odczytu / `⟳` nieregularne dane / `⚡` nadzwyczajny skok / `⚡↓` nadzwyczajny spadek.

### Panel prawy — lista alertów, tryby przełączania

Trzy tryby (ikony w topbarze panelu):
- Tryb `≋` (domyślny): grupowanie per akwen. Dorzecze jako nagłówek sekcji → karta akwenu z heatbarem i stacją dominującą.
- Tryb `△` (wodowskazy): lista płaska, jeden wiersz = jeden wodowskaz z przekroczeniem, sortowane severity malejąco, w ramach severity trend ↑→↓.
- Tryb `⚙` (custom): filtry użytkownika.

W trybie `△` każdy wiersz pokazuje: nazwa stacji / rzeka · km / wartość cm / badge.

### Nawigacja w panelu — trzy poziomy

Lista akwenów (Dorzecze → karty akwenów) → klik w kartę → szczegół akwenu (heatbar + statystyki + lista wodowskazów) → klik w wodowskaz → szczegół stacji (poziom, próg, trend, wykres 12h).

Nawigacja obsługiwana breadcrumbem: `Alerty › Nysa Kłodzka › Trestno`. Panel nie zmienia szerokości — zmienia zawartość.

### Mapa — zachowanie przy nawigacji w panelu

- **Widok listy akwenów:** markery stacji z kolorem severity i kierunkiem trendu (▲↑ rośnie, ▼↓ opada, ■→ stabilny). Bez linii odcinków między stacjami.
- **Widok szczegółu akwenu:** te same markery, podświetlony akwen.
- **Widok szczegółu stacji:** pulsujący ring wokół markera tej stacji, pozostałe przygaszone. Info bar u góry mapy pokazuje nazwę i wartość.
- Klik w marker na mapie → otwiera szczegół tej stacji w panelu.
- Odcinki (linie między stacjami) widoczne tylko w trybie Analizy po wejściu w szczegóły akwenu — nie w trybie Monitoringu.

### Nazewnictwo stacji (konwencja IMGW)

IMGW używa konwencji "rzeka — miejscowość" (np. Widawa — Krzyżanowice). W UI gdy kontekst rzeki określa linia 1 karty, w linii 2 wystarczy sama miejscowość (np. "Krzyżanowice 188 cm"). Pełna nazwa rzeka+miejscowość stosowana tylko w anomaliach i wyszukiwarce gdzie brak kontekstu grupowania.

Wyjątek: gdy nazwa rzeki pokrywa się z nazwą dorzecza (Odra, Wisła), karta akwenu używa nazwy z lokalizacją: "Odra — Wrocław" zamiast samego "Odra".

### Ostrzeżenia hydrologiczne IMGW — jednostka operacyjna

IMGW wydaje ostrzeżenia per zlewnia, nie per stacja. Ostrzeżenie dla zlewni Widawy = alert akwenu "Widawa" w Decerisie. Stacje są dowodem który uzasadnia ostrzeżenie. Model Decerisa jest zgodny z praktyką IMGW.

Przycisk "Dodaj do analizy" w panelu akwenu = dodaje akwen z wszystkimi wodowskazami jako sesję analityczną. Przycisk w szczegółach wodowskazu = dodaje tę stację jako punkt obserwacyjny w sesji akwenu.

---

## Fundament produktu

Trzy tryby które definiują cały flow:

1. **MONITORING** — obserwuj aktualny stan, odbieraj alerty, kliknij alert żeby zobaczyć szczegóły
2. **ANALIZA** — modeluj hipotezy, rysuj interwencje GIS, twórz scenariusze dla konkretnego alertu
3. **PLANOWANIE** — wybierz scenariusze, porównaj, wygeneruj plan A/B jako PDF dla decydenta

Każda funkcja, ekran i warstwa mapy służy jednemu z tych trzech trybów.

---

## Główny flow użytkownika

```
[MONITORING] Widok MAPA lub LISTA — alerty aktywne L1/L2/L3 (L0 = norma, nie widoczne na liście)
      ↓ kliknięcie alertu (w mapie: marker / w liście: wiersz)
[OVERLAY] Ogólne informacje o alercie (stacja, poziom, trend, severity)
      ↓ "Analizuj →" z overlay
      ↓ (jeśli widok LISTA → automatyczne przejście na widok MAPA)
[ANALIZA] Mapa zmienia kontekst, GIS tools aktywne, dodawanie scenariuszy
      ↓ wybrane scenariusze → "Przejdź do planowania"
[PLANOWANIE] System przelicza i prezentuje porównanie scenariuszy → PDF
      ↓ eksport
[PDF] Plan(y) A/B przekazywane offline do decydenta
      ↓ opcjonalnie po powrocie
[OZNACZENIE] Operator komentuje decyzję, zmienia status alertu na "Zaopiekowany"
```

Decyzja zapada poza systemem. System służy do stworzenia planu (lub planów A/B) — nie do zatwierdzania decyzji.

### MONITORING (tryb domyślny)

Sekcja domyślna po uruchomieniu. Układ: mapa z markerami + panel lewy (ocena sytuacji) + panel prawy (lista alertów) + nawigacja dolna.

**Mapa w Monitoringu:**
- Kształt markera = trend: trójkąt ↑ (rośnie), trójkąt ↓ (opada), kwadrat (stabilny)
- Kolor markera = severity: L0 szary, L1 żółty, L2 pomarańczowy, L3 czerwony
- Pulsowanie intensywności odpowiada severity; L0 bez pulsowania
- Clustering zależny od zoomu — daleko: klastry z dominującym severity; blisko: pojedyncze markery
- Kliknięcie markera stacji → otwiera szczegóły tej stacji w panelu prawym (nawigacja: akwen → odcinek → stacja)

**Panel prawy w Monitoringu:**
- Zawsze widoczny, zawartość per nawigacja 3-poziomowa
- Poziom 1: overview chart + lista alertów grouped DORZECZE → ZLEWNIA → karta akwenu
- Kliknięcie karty → Poziom 2 (szczegół akwenu z heatbarem i odcinkami)
- Panel nie zmienia szerokości — zmienia zawartość; nawigacja breadcrumbem

**Panel lewy w Monitoringu:** sekcje zwijalne w kolejności ważności — szczegółowy opis w "Panel lewy — sekcje Monitoring".

### Szczegół alertu — panel prawy Poziom 2

Pojawia się w panelu prawym po kliknięciu karty alertu (Poziom 1) lub markera na mapie. Zawiera:
- Heatbar pełny z etykietami km i nazwami stacji
- Severity alertu + najgorsza stacja z wartością + trend + predykcja peak
- Lista odcinków: km_od–km_do, severity badge, wartości obu stacji na końcach
- Przycisk **"Analizuj →"** — przejście do ANALIZY (lewy panel → narzędzia GIS + scenariusze, mapa → warstwy ISOK)
- Breadcrumb powrotu do listy alertów

### ANALIZA (GIS — główna przestrzeń robocza)

**ANALIZA = GIS.** Wejście tylko przez overlay alertu — zawsze w kontekście konkretnego alertu. Mapa zmienia kontekst: fokus na obszar alertu, warstwy Q1%/Q10% ISOK aktywne, budynki widoczne.

#### GIS — narzędzia przestrzenne (aktywne od wejścia)

- **Linia wału** — główne narzędzie interwencji → po narysowaniu natychmiast uruchamia kalkulator zasobów
- **Pomiar odległości / powierzchni** — pomocnicze
- **Poligon / marker** — oznaczanie obszarów i punktów istotnych dla scenariusza

#### Scenariusze

User tworzy N niezależnych scenariuszy. Każdy scenariusz ma:

**Parametry środowiskowe** (co się zmienia w świecie):
- poziom wody ±X% (suwak)
- pęknięcie wału w km Y (opcjonalne)
- inne parametry zdefiniowane przez operatora w View Schema

**Interwencja GIS** (co robimy — opcjonalne, narysowane na mapie):
- linia wału → kalkulator: m³ piasku / worki / czas przy N osobach / koszt PLN
- delta zalewu: km² i budynki chronione przez wał

Scenariusz bez interwencji = "co się stanie samo z siebie".
Scenariusz z wałem = "co się stanie jeśli zareagujemy konkretną interwencją".

Mapa: warstwa zalewu aktywnego scenariusza nałożona na dane bazowe (inny kolor per scenariusz). Toggle między scenariuszami lub widok wszystkich jednocześnie.

### PLANOWANIE (podsumowanie + porównanie + eksport)

User wybiera które scenariusze z ANALIZY włączyć do planowania. System przelicza i prezentuje:

**Porównanie:** tabela — dane bazowe + Scenariusz 1 + Scenariusz 2 + ... — kluczowe metryki: zasięg zalewu (km²), budynki zagrożone, drogi przecięte, infra krytyczna, koszt interwencji.

**Plany A/B:** user oznacza wybrane scenariusze jako "Plan A" i "Plan B" — każdy plan to osobny eksport PDF zawierający: mapę z warstwami, metryki porównawcze, listę działań (auto-generowana z geometrii i danych), zasoby i koszty. Przeznaczony do druku lub przekazania offline decydentowi.

**Po decyzji (opcjonalne):** operator dodaje komentarz "Wybrano Plan A — decyzja X o godz. Y" i oznacza alert jako "zaopiekowany".

### Widoki czasowe (dane bazowe w ANALIZIE i PLANOWANIU)

| Tryb | Zakres | Dane |
|------|--------|------|
| **Aktualny** | ostatnia godzina | rzeczywiste odczyty wodomierzy |
| **Historia + predykcja** | 72h wstecz / 72h do przodu | faktyczne dane + model predykcyjny IMGW |

Zmiana parametrów (symulacja) należy do ANALIZY — nie do timeline.

---

## System alertów i pipeline

User otrzymuje system z predefiniowanymi pipeline'ami zgodnymi z wymaganiami organizacji (IMGW / sztab). Pipeline definiuje:
- progi zadziałania alertu
- jakie parametry może zmieniać user w sekcji ANALIZA (np. zakres zmiany poziomu wody)

### Alerty są dynamiczne — pojawiają się i znikają automatycznie

Alert NIE jest rekordem tworzonym przez człowieka. Jest wynikiem pipeline'u:
- **Pojawia się** gdy dane IMGW przekraczają zdefiniowany próg (poziom wody, liczba zalanych budynków, itd.)
- **Znika** gdy warunki wracają poniżej progu — może być aktywny przez 2h i samoistnie wygasnąć
- Operator nie tworzy alertów — pipeline je triggeruje i wygasza

To oznacza: alert może wygasnąć gdy Kasia ma otwartą sekcję ANALIZA. System musi zachować całą pracę (scenariusze, rysunki wałów, plany) i oznaczyć ekran informacją "Alert wygasł o 14:23 — dane z tego momentu". Praca nie ginie, alert przestaje być aktywny na mapie.

### Statusy alertów

Status odzwierciedla postęp pracy operatora — zmienia się wyłącznie do przodu, nigdy wstecz.

| Status | Znaczenie | Trigger |
|--------|-----------|---------|
| **Wymagające uwagi** | Nowy alert — pipeline triggeruje, nikt jeszcze nie pracuje | automatyczny (pipeline) |
| **Rozpoznane** | Operator wszedł do sekcji ANALIZA dla tego alertu | automatyczny (wejście do ANALIZY) |
| **Zaopiekowany** | Alert zamknięty — plan wyeksportowany lub alert wygasł | ręczny lub automatyczny |

**Przejścia statusów:**
- Pipeline przekracza próg → **Wymagające uwagi**
- Operator otwiera ANALIZĘ → **Rozpoznany** (automatycznie, bez akcji)
- Eksport planu PDF → operator oznacza ręcznie jako **Zaopiekowany**
- Alert wygasa (poziom wody wraca do normy) → **automatycznie Zaopiekowany** → trafia do Historii

**Severity a status są niezależne.** Alert może mieć status Rozpoznany (operator pracuje) a severity zmienia się live: L2 → L3 → L1 → wygasł. Status nie cofa się gdy severity spada.

### Historia alertów

Dedykowana sekcja przechowująca wszystkie zamknięte alerty (status: Zaopiekowany).

**Lokalizacja w nawigacji:** do ustalenia.

**Changelog alertu** — każdy alert w Historii ma pełny audit trail:
- Zmiany statusu z timestampem: `14:05 Wymagający uwagi`, `14:31 Rozpoznany`, `16:48 Zaopiekowany`
- Zmiany severity z timestampem: `L2 (14:05)`, `L3 (15:12)`, `L2 (16:30)`, `wygasł (16:48)`
- Zdarzenia pracy: scenariusz dodany, wał narysowany, plan wyeksportowany
- Komentarz operatora (jeśli dodany)

**Zamknięty alert w Historii:**
- Zachowuje całą pracę z ANALIZY (scenariusze, rysunki wałów, plany)
- Pokazuje frozen snapshot mapy z momentu zamknięcia
- Oznaczony jako "Wygasł automatycznie o 16:48" lub "Zaopiekowany ręcznie"

### Triggery alertu (jeden lub więcej aktywnych jednocześnie)
- przekroczenie poziomu wody (próg w cm)
- liczba zalanych budynków
- moment zalania pierwszego budynku

### Snapshoty i walidacja
Z każdą aktualizacją danych system tworzy **snapshot** stanu. Służy do walidacji: system sprawdza czy dany alert wciąż jest aktualny. Historia snapshotów = podstawa dla danych bazowych IMGW (timeline T-72h → T+72h).

---

## Dane przestrzenne — hierarchia geograficzna

Deceris operuje na hierarchii 5 poziomów operacyjnych + 2 poziomy graniczne. Hierarchia definiuje: kontekst mapy przy danym zoom, zakres filtrowania, jurysdykcję operatora i klastry znaczników.

| Poziom | Nazwa | Rola w systemie | Przykład |
|--------|-------|----------------|---------|
| — | **KRAJ** | Tylko agregacja widoku — nie generuje alertów | Polska |
| 1 | **DORZECZE** | Nagłówek grupujący na liście alertów — nie jest osobnym alertem | Odra, Wisła, Pregoła |
| 2 | **ZLEWNIA** | Subetykieta grupująca na liście alertów — nie jest osobnym alertem | Zlewnia Nysy Kłodzkiej |
| 3 | **AKWEN** | Jednostka alertu — alert powstaje na tym poziomie | Nysa Kłodzka |
| 4 | **ODCINEK** | Wewnętrzna struktura alertu — fragment rzeki między dwiema sąsiednimi stacjami | km 12–34 |
| 5 | **STACJA** | Źródło danych — nie generuje osobnych alertów; widoczna w szczegółach odcinka | Kłodzko km 34.2 |

**Kluczowe zasady:**
- KRAJ to tylko agregacja widoku — nie generuje alertów
- DORZECZE i ZLEWNIA to nagłówki grupujące na liście alertów, nie osobne alerty
- Alerty operacyjne powstają wyłącznie na poziomie **AKWEN** (poziom 3)
- ODCINEK i STACJA są widoczne w szczegółach alertu, nie na liście głównej
- Profil operatora zawiera jurysdykcję na poziomie DORZECZE / ZLEWNIA / AKWEN
- Filtrowanie w widoku LISTA działa na poziomie DORZECZE / ZLEWNIA

**Clustering na mapie:**

| Zoom | Widok |
|------|-------|
| 6–8 | Klastry per dorzecze — liczba alertów + kolor dominującego severity |
| 9–11 | Klastry per zlewnia |
| 12–14 | Segmenty akwenu z kolorami severity (heatbar na mapie) |
| 15+ | Pojedyncze markery stacji z etykietami |

**Podział MPHP:** W Polsce obowiązuje 9-poziomowy podział zlewni MPHP. Poziomy 1–4 MPHP odpowiadają hierarchicznym poziomom DORZECZE–ZLEWNIA w Decerisie. Poziomy 5–9 MPHP to szczegółowe mikrozlewnie — używane jako kontekst przy interpolacji zasięgu zalewu (NMT), nie eksponowane w UI.

---

## Model alertu — jeden per akwen per zdarzenie

Alert reprezentuje **akwen** (np. Nysa Kłodzka) — nie pojedynczą stację. Jeden akwen może mieć tylko jeden aktywny alert na zdarzenie.

**Jedno zdarzenie vs dwa osobne:**
- Powiązane zdarzenia (ta sama fala powodziowa przesuwająca się rzeką) = **jeden alert** z odcinkami wewnątrz
- Niezależne zdarzenia na tej samej rzece (np. powódź z opadów na górnym biegu + cofka na dolnym) = **dwa osobne alerty** na tym samym akwenie

**Severity alertu** = severity najgorszego odcinka wewnątrz alertu.

**Nagłówek karty alertu** pokazuje: najwyższy poziom wody ze wszystkich stacji + nazwa tej stacji.

**Stacje nigdy nie pojawiają się jako osobne wiersze na liście alertów.**

---

## Odcinki — wewnętrzna struktura alertu

**Odcinek** = fragment rzeki między dwiema sąsiednimi stacjami pomiarowymi. Jest wewnętrznym stanem akwenu — nie osobnym alertem.

- Severity odcinka = `max(stacja_A, stacja_B)` — gdzie stacja_A i stacja_B to stacje na końcach odcinka
- Kolor odcinka na heatbarze = severity wyższej stacji na jego końcach
- Odcinki są widoczne w szczegółach alertu (po kliknięciu alertu na liście)
- Lista odcinków w szczegółach alertu pokazuje każdy odcinek z: km_od–km_do, severity, wartości obu stacji

---

## Heatbar

Heatbar wizualnie reprezentuje rozkład severity wzdłuż biegu rzeki — od źródła (lewo) do ujścia (prawo).

- Każdy segment heatbara = jeden odcinek (para sąsiednich wodowskazów)
- Liczba segmentów = liczba wodowskazów na rzece minus 1
- Kolor segmentu = severity wyższej z dwóch stacji tworzących odcinek
- **Nie jest to średnia** — każdy segment ma swój kolor niezależnie od sąsiadów
- Heatbar pojawia się w: karcie alertu na liście (kompaktowy), szczegółach alertu (pełny z etykietami km)
- **Na mapie odcinki NIE są widoczne** w widoku listy monitoringu — wyłącznie po wejściu w szczegóły akwenu (kliknięcie karty). W widoku listy mapa pokazuje tylko markery stacji.

---

## Logika budowania heatbarów i stacków odcinków

**Odcinek** = przestrzeń między dwoma sąsiednimi wodowskazami na tej samej rzece.

**Wzór:** `liczba segmentów = liczba stacji − 1` (+ opcjonalne szare marginesy "poza kadrem").

### Stacje IMGW dla rzek wrocławskich — dane referencyjne

**Odra (przez Wrocław):**

| Stacja | Pozycja |
|--------|---------|
| Brzeg | upstream |
| Oława | ↓ |
| Trestno | ↓ |
| Osobowice | ↓ |
| Brzeg Dolny | downstream |

Widok wrocławski (szerszy kontekst): Oława → Trestno → Osobowice → Brzeg Dolny = **4 stacje = 3 odcinki**. Dodajemy 1 szary segment po każdej stronie jako "poza kadrem" → **5 segmentów łącznie**.

**Bystrzyca (przez Wrocław):**

Stacje: Kondratowice → Wilkszyn → Jarnołtów → ujście = 3 widoczne stacje = **2 odcinki** + marginesy = **4 segmenty**.

**Widawa:**

Stacje: Szewce → Krzyżanowice → Widawa (ujście) = **3 stacje = 2 odcinki** + marginesy = **4 segmenty**.

**Oława:**

Stacje: Zborowice → Oława → Opatowice = **3 stacje = 2 odcinki** + marginesy = **4 segmenty**.

**Ślęza:**

Stacje: Ślęza → Bielany Wrocławskie → ujście = **3 stacje = 2 odcinki** + marginesy = **4 segmenty**.

### Reguły heatbara

- Kolor segmentu = `max(severity(stacjaA), severity(stacjaB))` — wyższa wygrywa
- Segment szary ("poza kadrem") = L0 z opacity 0.4 — sygnalizuje ciągłość rzeki poza widocznym obszarem
- Kolejność: zawsze od źródła (lewo) do ujścia (prawo)
- W karcie alertu: kompaktowy heatbar bez etykiet km
- W szczegółach akwenu: pełny heatbar z etykietami km i nazwami stacji na końcach segmentów

---

## Struktura kart alertów — wspólny szkielet

Wszystkie karty w panelach Deceris mają trójliniowy szkielet:
- **Linia 1:** Nazwa akwenu (rzeki) + element prawostronny
- **Linia 2:** Nazwa dominującej stacji + wartość liczbowa + kontekst
- **Linia 3:** Element wizualny (heatbar, minibar) lub tekst pomocniczy

**Zasada bezwzględna:** Linia 1 zawsze = nazwa rzeki (akwenu). Nigdy nazwa stacji, nigdy "rzeka — stacja" razem w linii 1. Stacja zawsze w linii 2.

### Karta ALERTU

```
[Nazwa rzeki]                    [badge: L0–L3] [trend: ↑↓→] [czas]
[Nazwa stacji dominującej]       [wartość] cm
[heatbar odcinków]
```

Stacja dominująca = stacja z najwyższym poziomem wody w akwenie.

### Karta PROGNOZY

```
[Nazwa rzeki]                    [za ~Xh]
[Nazwa stacji]  [aktualna wartość] cm → [docelowy Lx]
[minibar progresu do progu — wypełnienie = (wartość/próg)*100%]
```

### Karta ANOMALII

```
[Nazwa rzeki]                    [⚠ ikona typu] [czas]
[Nazwa stacji]  [wartość] cm · [delta np. +42 cm/30min]
[opis słowny, max ~60 znaków]
```

Typy anomalii: `⚠` wzrost bez korelacji / `○` brak odczytu / `⟳` nieregularne dane.

### Nazewnictwo stacji

IMGW używa konwencji "rzeka — miejscowość" (np. Widawa — Krzyżanowice). W UI:
- Gdy kontekst rzeki określa już linia 1 karty → w linii 2 wystarczy sama miejscowość: `Krzyżanowice 168 cm`
- Pełna nazwa rzeka+miejscowość tylko w anomaliach gdy brak kontekstu grupowania

---

## Nawigacja w panelu prawym — trzy poziomy

Panel prawy (stała szerokość 280px) nie zmienia rozmiaru — zmienia zawartość. Nawigacja obsługiwana breadcrumbem w nagłówku panelu.

### Poziom 1 — Lista alertów (akweny)

Na górze panelu: **overview chart** — wykres liniowy z 3 liniami per severity (L1/L2/L3), skala auto, 12 słupków po 2h = 24h historii aktywnych alertów.

**Trzy tryby widoku** (ikony w nagłówku panelu):

| Ikona | Tryb | Opis |
|-------|------|------|
| `≋` | Akweny (domyślny) | Grupowanie per akwen, jeden wiersz = jedna rzeka z heatbarem i stacją dominującą |
| `△` | Wodowskazy | Lista płaska, jeden wiersz = jeden wodowskaz z przekroczeniem, sortowane severity malejąco |
| `⚙` | Custom | Filtry użytkownika |

**Hierarchia stackowania alertów:**
```
DORZECZE (nagłówek grupujący — nie karta)
  └─ AKWEN (karta alertu)
       └─ ODCINEK (widoczny wewnątrz heatbara karty)
            └─ STACJA (linia 2 karty + szczegóły po kliknięciu)
```
Dorzecze nie generuje karty — jest tylko nagłówkiem sekcji. Karta alertu zawsze reprezentuje akwen.

Przykład trybu `≋`:
```
▼ DORZECZE Odra                    [pippki severity: ● ● ○]
   [Karta alertu]
   Odra                            [L3] [↑] [14:32]
   Trestno                         523 cm
   [heatbar: ██████ szary|żółty|pomarańczowy|czerwony]

   [Karta alertu]
   Bystrzyca                       [L2] [→] [14:18]
   Jarnołtów                       248 cm
   [heatbar]
```

**Widoczność nagłówków dorzecza:**
- Dorzecze bez aktywnych alertów **nie pojawia się na liście**
- Gdy ostatni akwen w dorzeczu wygasa → nagłówek znika automatycznie
- Alerty poza jurysdykcją operatora → badge w nawigacji dolnej, nie osobny nagłówek

### Poziom 2 — Szczegół akwenu (po kliknięciu karty)

Breadcrumb: `Zagrożenia / Nysa Kłodzka`

Zawartość:
- Heatbar pełny z etykietami km i nazwami stacji
- Statystyki: severity alertu, najgorsza stacja z wartością, trend, predykcja peak
- Lista odcinków: każdy odcinek z km_od–km_do, severity badge, wartości obu stacji
- Przycisk "Analizuj →"

### Poziom 3a — Szczegół odcinka (po kliknięciu odcinka)

Breadcrumb: `Zagrożenia / Nysa Kłodzka / km 12–34`

Zawartość:
- Dwie stacje tworzące odcinek z aktualnymi wartościami i severity
- Severity odcinka = max obu stacji (wyróżniona wyższa)
- Mini heatbar z podświetlonym odcinkiem w kontekście całej rzeki
- Klikalne nazwy stacji → przejście do Poziomu 3b

### Poziom 3b — Szczegół stacji (po kliknięciu stacji)

Breadcrumb: `Zagrożenia / Nysa Kłodzka / km 12–34 / Kłodzko`

Zawartość:
- Aktualny poziom wody (Mono, duży)
- Próg ostrzegawczy i alarmowy (linie referencyjne na wykresie)
- Trend (↑/→/↓) + delta cm/h
- Wykres 12h (AreaChart, kolor = severity, gradient fill)
- Severity badge

---

## Zachowanie mapy — synchronizacja z panelem

Mapa reaguje na aktywny poziom panelu:

| Poziom panelu | Stan mapy |
|---------------|-----------|
| Lista alertów | Tylko markery stacji (▲▼■) z kolorem severity — **bez kolorowania odcinków rzeki** (zbyt duży szum przy widoku całego miasta) |
| Szczegół akwenu | Cała rzeka z kolorowymi segmentami między stacjami + powiększone markery stacji; reszta mapy przygaszona |
| Szczegół odcinka | Podświetlony segment (gruba linia); obie stacje powiększone; reszta rzeki przygaszona |
| Szczegół stacji | Pulsujący ring na konkretnej stacji; segment odcinka podświetlony; reszta przygaszona |

**Markery stacji są zawsze widoczne i klikalne.** Kliknięcie markera na mapie otwiera Poziom 3b (szczegół stacji) w panelu — z zachowaniem kontekstu odcinka i akwenu w breadcrumbie.

---

## Tag dopływu

Jeśli akwen jest dopływem innego akwenu z aktywnym alertem, karta alertu pokazuje dodatkowy tag:

```
[dopływ Odry · wpłynie T+14h]
```

Tag jest **wyłącznie informacją hydrologiczną** — nie tworzy powiązania między alertami, nie scala ich w jeden. Operator wie, że sytuacja na dopływie będzie wpływać na główny akwen za X godzin.

---

## Panel lewy — sekcje Monitoring

Panel lewy w trybie Monitoring zawiera sekcje zwijalne, ułożone od góry w kolejności ważności operacyjnej.

### 1. Ocena sytuacji (Trajectory)

Kolorowy blok z jednym zdaniem maszynowym + chipy z deltami. Kolor tła bloku = aktualny severity najgorszego alertu.

Przykładowe teksty:
- **Eskalacja (L3 rośnie):** "3 stacje przekroczyły próg w ostatniej godzinie (16:42). Fala przemieszcza się w dół Odry — Trestno może osiągnąć L3 za ok. 2h."
- **Stabilizacja:** "Sytuacja stabilna od 3h. Odra w Trestnie opada, żadna stacja nie przekroczyła nowego progu."
- **Szczyt minął:** "Kulminacja przeszła przez Trestno o 14:20. 4 stacje zaczęły opadać. Bardo nadal rośnie."

Chipy z kluczowymi deltami (np. "+3 stacje L3 vs 1h temu", "−2 akweny rosnące").

### 2. Prognozy przekroczeń T+6h

Lista maksymalnie 3 stacji z największym ryzykiem przekroczenia progu w ciągu 6h. Per stacja: pasek czasu do przekroczenia (eta w godzinach) + nazwa stacji + aktualny poziom vs próg. Widoczna tylko gdy system przewiduje przekroczenia.

### 3. Anomalie danych

Widoczna tylko gdy są aktywne anomalie (brak odczytu > 30 min, wartość spoza zakresu). Pomarańczowe obramowanie bloku. Per anomalia: nazwa stacji + opis anomalii + przycisk "Sprawdź" (otwiera szczegóły stacji w panelu prawym).

### 4. Aktualny stan

4 kafelki statystyczne:

| Kafelek | Wartość | Delta |
|---------|---------|-------|
| Stacje L3 | liczba | vs −6h |
| Stacje L2 | liczba | vs −6h |
| Stacje rosnące | liczba | z total monitorowanych |
| Stacje online | liczba | z info o brakujących danych |

### 5. Stan danych

Per źródło danych: kropka statusu (zielona = live, pomarańczowa = opóźnienie, czerwona = brak) + czas ostatniego sync. Źródła: IMGW SHAPI (hydro), IMGW synop (meteo), IMGW ostrzeżenia, ISOK WMS, NMT 1m.

### 6. Filtry mapy

Toggle chipy do filtrowania markerów na mapie:
- Severity: L0 / L1 / L2 / L3
- Trend: ↑ / → / ↓
- Dorzecze (lista dostępnych)

Filtry działają tylko na widoczność markerów na mapie — nie ukrywają alertów w panelu prawym.

### 7. Obserwowane

Lista przypiętych akwenów i stacji. Per pozycja: nazwa + aktualna wartość + trend + severity badge. Kliknięcie → otwiera szczegóły w panelu prawym. Widoczna tylko gdy użytkownik ma przypięte elementy.

---

## Stack techniczny (aktualny)

- **React 19 + Vite + TypeScript** — SPA, `app/` directory
- **Tailwind CSS v4** — utility-first, tokeny w `@theme inline`, `app/src/index.css`
- **shadcn/ui (Radix base)** — komponenty UI, inicjalizacja przez `npx shadcn@latest`
- **shadcn/ui Charts (Recharts)** — wykresy; `<ResponsiveContainer>` dla dynamicznej szerokości
- **Lucide React** — ikony (`lucide-react`) — domyślna biblioteka ikon
- **MapLibre GL JS** — renderer mapy WebGL, warstwy wektorowe/rasterowe
- **OpenStreetMap** — podkład mapowy (w prototypie: `map.png` static asset)
- **Maputnik** — wizualny edytor stylów MapLibre GL JS

### Liquid Glass — design system paneli

Floating panele i pills nad mapą używają **Liquid Glass** — własnego systemu CSS klas w `app/src/index.css`.

| Klasa | Zastosowanie | Blur | Background |
|-------|-------------|------|-----------|
| `.lg-panel` | LeftPanel, RightPanel | `blur(28px) saturate(2.2)` | `rgba(255,255,255,0.12)` |
| `.lg-pill` | toolbary, BottomNav | `blur(24px) saturate(2.0)` | `rgba(255,255,255,0.16)` |

**KRYTYCZNY wzorzec `zIndex: 21`:** każda klasa ma pseudo-element `::after` z białym gradientem na `z-index: 20` (efekt specular highlight). Elementy które muszą pokazywać swój kolor (badge, logo, ikony) wymagają `style={{ position: 'relative', zIndex: 21 }}`.

Szczegółowa specyfikacja: `materials/FRONTEND_STYLES.md` sekcja 8.

### Ikony

Projekt używa **dwóch źródeł ikon:**

1. **Lucide React** (`lucide-react`) — standardowe UI icons: `CircleAlert`, `RefreshCw`, `SlidersHorizontal`, `Bell`, `Settings`, etc.
2. **SVG toolbar assets** (`app/public/toolbar-*.svg`) — ikony eksportowane z Figmy dla toolbarów (`toolbar-grid.svg`, `toolbar-layers.svg`, `toolbar-refresh.svg`, etc.) — renderowane przez `<img>` z precyzyjnymi wartościami `inset` z Figmy

Zasada: Lucide dla wszystkich nowych ikon UI. SVG assets tylko gdy Figma eksportuje własne brandowe ikony toolbara.

### Tooltip — custom portal-based

**Nie używać natywnego `title=`** — wygląda jak przeglądarka.  
Zamiast: `app/src/components/ui/Tooltip.tsx` — używa `React.cloneElement` + `createPortal` do `document.body`.

```tsx
import { Tooltip } from '@/components/ui/Tooltip'
<Tooltip text="Odśwież"><button>...</button></Tooltip>
<Tooltip text="Status danych" side="bottom"><div>...</div></Tooltip>
```

`createPortal` konieczny bo panele mają `overflow: hidden` (wymagane przez `backdrop-filter`).

### Panel Scroll — hover-only scrollbar

Klasa `.panel-scroll` w `index.css` — scrollbar 3px szeroki, widoczny tylko na hover.  
Klasa `.panel-scroll-always` — scrollbar zawsze widoczny (nieużywana aktualnie).

**Uwaga na szerokość:** pojawienie się scrollbara redukuje content width o 3px. Elementy z prawym krawędzią stałą używają układu `shrink-0 minWidth` + `flex-1` (patrz sparklines w LeftPanel).

### Maputnik — edytor stylów map

Maputnik służy do projektowania i testowania stylów map przed integracją z aplikacją.

- **Generator map z koordynatami Odry we Wrocławiu:** https://maplibre.org/maputnik/?layer=1173089182%7E0#15.17/51.139781/16.988335
- Centrum: `[16.988335, 51.139781]` — Odra, Wrocław, zoom 15.17
- Eksportuje style jako JSON zgodny z MapLibre GL Style Spec
- Workflow: projektuj styl w Maputnik → eksportuj JSON → załaduj w aplikacji przez `maplibre-gl`

### Biblioteka komponentów — shadcn/ui

shadcn/ui jest oficjalną bazą komponentów dla Decerisa. Zasady:
- Używamy shadcn/ui jako źródła komponentów — nie tworzymy własnych od zera
- Modyfikacje stylistyczne (kolory, tokeny Decerisa) zostaną wprowadzone **później** przez nadpisanie zmiennych CSS shadcn
- Do czasu wprowadzenia motywu Decerisa — pracujemy na **niezmodyfikowanym shadcn**
- Figma library shadcn/ui jest podpięta do pliku Deceris i służy jako dokumentacja/prototyp
- Własne komponenty budowane wcześniej w Figma (Button, Toggle, etc.) to dokumentacja designu — nie implementacja

### Wykresy — shadcn/ui Charts (Recharts)

shadcn/ui Charts to oficjalny wrapper Recharts wbudowany w ekosystem shadcn. Używamy go do wszystkich wykresów w aplikacji.

**Zastosowania w Decerisie:**
- **Sparkline w szczegółach stacji** — mini `AreaChart` bez osi, trend poziomu wody T-6h → teraz; kolor = severity (`--l1` / `--l2` / `--l3`)
- **Wykres trendu 72h w ANALIZIE** — `AreaChart` z osią czasu T-72h → T+72h, linia predykcji oznaczona przerywaną linią
- **Porównanie scenariuszy w PLANOWANIU** — `BarChart` lub tabela metryczna; nie chart dla każdego scenariusza

**Styl sparkline (wzorzec z prototypu):**
```tsx
// Gradient fill: kolor severity → transparent
<defs>
  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor={severityColor} stopOpacity={0.3} />
    <stop offset="95%" stopColor={severityColor} stopOpacity={0} />
  </linearGradient>
</defs>
<Area dataKey="value" stroke={severityColor} fill="url(#sparkGrad)" strokeWidth={1.5} dot={false} />
```

**Zasady:**
- Sparkline'y w kartach/overlay: brak osi, brak tooltip, tylko linia + gradient fill
- Wykresy w ANALIZIE: oś Y z jednostką (cm), oś X z czasem, minimalistyczna siatka (`--border`)
- Kolory zawsze z tokenów severity (`--l1` / `--l2` / `--l3`) — nigdy hardcoded hex

### Biblioteki Figma (podpięte do pliku Deceris)

**1. Obra shadcn/ui Kit — Community Edition v1.6.0**
- URL: https://www.figma.com/design/ep3GAxz2MzyI7AfwDf100R/Obra-shadcn-ui-kit-community-edition--1.6.0---Community-
- Odzwierciedla shadcn/ui 1:1 — handoff design→kod bez konwersji
- Pełne stany komponentów (Closed/Open/Focus, Single/First/Middle/Last)
- Uwaga: część zaawansowanych komponentów może być za paywallem Pro (Date Picker, Combobox, Data Table — do weryfikacji)
- Font w kicie: Geist — spójny z fontem Decerisa

**2. Lucide Icons — Full Collection (1694 ikon)**
- URL: https://www.figma.com/design/1OGk7U6Vyqe0vlx3I1YWe3/Lucide-Icons-%E2%80%94-Full-Collection--1694-icons---Community-
- Oficjalny zestaw ikon shadcn/ui — domyślna zależność (`lucide-react`)
- Styl: stroke-based, 2px, zaokrąglone końce — pasuje do zinc/indigo palette
- W kodzie: `import { Waves, AlertTriangle, Map } from 'lucide-react'`
- Przydatne dla Decerisa: `Waves`, `Droplets`, `CloudRain`, `AlertTriangle`, `AlertOctagon`, `MapPin`, `Map`, `Layers`, `Navigation`, `Ruler`, `PenLine`, `Shapes`, `Shield`, `Gauge`, `Activity`, `FileDown`, `Share2`

---

## Warstwy mapy

Wszystko skupia się wokół mapy i jej warstw. Cztery grupy według charakteru danych.

### 1. Warstwy bazowe (podkład — zawsze jedna aktywna)

| Warstwa | Źródło | Kiedy używana |
|---------|--------|---------------|
| Mapa standardowa (OSM) | OpenStreetMap | default — czytelna sieć dróg i zabudowy |
| Ortofotomapa | GUGiK / WMTS | weryfikacja terenu, szczegóły obszaru |
| Ciemna mapa | MapLibre / Carto Dark | nocna praca, tryb alertów |

### 2. Warstwy hydrologiczne (dane rzeczywiste)

| Warstwa | Źródło | Co pokazuje | Priorytet |
|---------|--------|-------------|-----------|
| Sieć rzeczna | MPHP | przebieg rzek i potoków | ★★★ |
| Zlewnie (poziom 1–4) | MPHP | podział hydrograficzny — filtr kontekstu | ★★★ |
| Wodomierze / stacje | IMGW SHAPI | lokalizacja i aktualny odczyt | ★★★ |
| Aktualny poziom wody | IMGW SHAPI | kolorowanie stacji wg severity | ★★★ |
| Strefy zagrożenia Q10% | ISOK | obszar zalewowy raz na 10 lat | ★★★ |
| Strefy zagrożenia Q1% | ISOK | obszar zalewowy raz na 100 lat | ★★★ |
| Strefy zagrożenia Q0.2% | ISOK | obszar zalewowy raz na 500 lat | ★★ |
| Retencja / zbiorniki | MPHP / BDOT10k | zbiorniki wodne, poldery | ★★ |
| Radar SRI (opady) | IMGW danepubliczne | natężenie opadów mm/h z kompozytu radarowego | ★★ |
| Stacje meteo (opady) | IMGW synop | punktowe pomiary `suma_opadu` z 60+ stacji | ★ |

Q10% / Q1% / Q0.2% to standardowe polskie klasy zagrożenia wg dyrektywy powodziowej UE — core Decerisa.

Radar SRI i stacje meteo są widoczne domyślnie wyłącznie w trybie ANALIZY — w Monitoringu zbyt duże obciążenie percepcyjne. W ANALIZIE pomagają ocenić czy sytuacja będzie się pogarszać (opady upstream od stacji alarmowej).

### 3. Warstwy infrastrukturalne (BDOT10k)

| Warstwa | Co pokazuje | Dlaczego ważne |
|---------|-------------|----------------|
| Budynki | zabudowa z typologią (mieszkalne, usługowe, przemysłowe) | kalkulacja kosztu zalania, liczba budynków |
| Drogi (klasy A–G) | sieć drogowa z klasą | które drogi będą przecięte przez wodę |
| Koleje | linie kolejowe | infrastruktura krytyczna |
| Wały przeciwpowodziowe | istniejące wały | kontekst dla rysowania nowego wału |
| Infrastruktura krytyczna | szpitale, elektrownie, ujęcia wody, oczyszczalnie | priorytety ewakuacji i ochrony |
| Mosty i przepusty | obiekty hydrotechniczne | newralgiczne punkty przy wezbraniu |

### 4. Warstwy analityczne / dynamiczne (generowane przez system)

| Warstwa | Kiedy aktywna | Co pokazuje |
|---------|--------------|-------------|
| Aktywny obszar zalewowy | zawsze gdy jest alert | aktualnie zalany obszar (z predykcji) |
| Predykcja +24h / +48h / +72h | tryb timeline | zasięg zalewu w przyszłości |
| Scenariusz what-if | po uruchomieniu scenariusza | hipotetyczny zasięg zalewu |
| Narysowany wał | po narysowaniu przez usera | linia wału z kalkulacją |
| Zasięg po wale (delta) | po zatwierdzeniu wału | różnica obszaru vs bez wału |
| Gradient terenu (NMT) | opcjonalnie | rzeźba terenu pomocna przy planowaniu wału |

### Domyślny stan warstw

- **Domyślnie włączone:** sieć rzeczna, stacje wodomierzy, strefy Q1%, budynki, wały istniejące
- **Domyślnie wyłączone:** ortofoto, NMT, koleje, Q0.2%
- **Zawsze widoczne (nie da się wyłączyć):** aktywny obszar zalewowy, stacje z alertem, narysowany wał (gdy istnieje)
- Warstwy analityczne pojawiają się/znikają automatycznie wraz z kontekstem (alert, scenariusz)
- Kontrola warstw w sidebarze trybu GIS — grupowana wg powyższych kategorii

---

## Design System

Dwa tryby: **dark** (default) i **light** (opcja). Przełączanie trybu = zmiana jednej grupy tokenów + URL kafli mapy. Reszta kodu identyczna.

### Typografia

#### Deceris Type Scale (własne style tekstowe w Figma)
- **Display:** Geist SemiBold — nagłówki, duże wyróżnienia
- **Body:** Geist Regular / Medium / SemiBold — interfejs, etykiety, treść
- **Mono:** Geist Mono Regular / Medium — dane liczbowe, ID, kody zdarzeń, jednostki
- **Label/caps:** Geist SemiBold 11px, letter-spacing +6%, uppercase — nagłówki sekcji
- **Body/caption:** Geist Regular 14px, letter-spacing +1.5px — podpisy, adnotacje
- Geist jest domyślnym fontem shadcn/ui — jeden font w całym stosie, zero dodatkowych zależności

| Styl | Rodzina | Grubość | Rozmiar | Line-height | Letter-spacing |
|------|---------|---------|---------|-------------|----------------|
| Display/4xl | Geist | SemiBold | 48px | 48px | -1.5px |
| Display/3xl | Geist | SemiBold | 30px | 30px | -1px |
| Display/2xl | Geist | SemiBold | 32px | 40px | — |
| Display/xl | Geist | SemiBold | 24px | 32px | — |
| Display/lg | Geist | SemiBold | 20px | 28px | — |
| Body/xl | Geist | Regular | 18px | 27px | — |
| Body/xl-medium | Geist | Medium | 18px | 27px | — |
| Body/xl-semibold | Geist | SemiBold | 18px | 27px | — |
| Body/lg | Geist | Regular | 16px | 24px | — |
| Body/lg-medium | Geist | Medium | 16px | 24px | — |
| Body/lg-semibold | Geist | SemiBold | 16px | 24px | — |
| Body/md | Geist | Regular | 14px | 20px | — |
| Body/md-medium | Geist | Medium | 14px | 20px | — |
| Body/md-semibold | Geist | SemiBold | 14px | 20px | — |
| Body/sm | Geist | Regular | 13px | 18px | — |
| Body/sm-medium | Geist | Medium | 13px | 18px | — |
| Body/xs | Geist | Regular | 12px | 16px | — |
| Body/xs-medium | Geist | Medium | 12px | 16px | — |
| Body/xs-semibold | Geist | SemiBold | 12px | 16px | — |
| Body/caption | Geist | Regular | 14px | 21px | +1.5px |
| Label/caps | Geist | SemiBold | 11px | 16px | +0.6px |
| Mono/lg | Geist Mono | Regular | 16px | 24px | — |
| Mono/md | Geist Mono | Regular | 14px | 20px | — |
| Mono/sm | Geist Mono | Regular | 13px | 18px | — |
| Mono/xs | Geist Mono | Regular | 12px | 16px | — |
| Mono/xs-medium | Geist Mono | Medium | 12px | 16px | — |
| Mono/2xs | Geist Mono | Regular | 11px | 16px | — |

#### Dokumentacja w Figma
Strona **"Colors & Typography"** w pliku Deceris zawiera artboardy:
- **Colors — Dark** / **Colors — Light** — wszystkie zmienne kolorów podpięte pod Figma Variables
- **Type Scale — Deceris** — wszystkie style tekstowe (Geist + Geist Mono) podpięte przez `textStyleId`

### Layout (wspólny)
- Panel lewy: 280px stały
- Panel prawy: 280px stały
- Nawigacja dolna: stała, nie topbar
- Zaokrąglenia: `--radius-sm: 6px` / `--radius: 8px` / `--radius-lg: 12px`
- Animacje: `180ms cubic-bezier(0.16, 1, 0.3, 1)`

### Severity — semantyka (wspólna)

Mapa i panel używają **4 poziomów** severity (L0–L3):

| Token | Etykieta | Kolor | Hex | Znaczenie |
|-------|----------|-------|-----|-----------|
| `--l0` | **L0 Norma** | szary | `#6B7280` | Poziom wody w normie — brak alertu |
| `--l1` | **L1 Uwaga** | żółty | `#F5A623` | Stan obserwacji — poziom rośnie, zbliża się do progu ostrzegawczego |
| `--l2` | **L2 Ostrzeżenie** | pomarańczowy | `#E8711A` | Przekroczenie progu ostrzegawczego — sytuacja wymaga uwagi |
| `--l3` | **L3 Alarm** | czerwony | `#D93025` | Przekroczenie stanu alarmowego — aktywne zagrożenie, wymagana decyzja |

Severity alertu = severity najgorszego odcinka. Severity odcinka = max(stacja_A, stacja_B).

### Markery na mapie

Na mapie każda stacja pomiarowa (wodomierz IMGW) jest oznaczona markerem z dwoma atrybutami wizualnymi:

**Kształt = trend poziomy wody** (WCAG — severity nie tylko przez kolor):
- **Trójkąt skierowany w górę ▲** — poziom rośnie
- **Trójkąt skierowany w dół ▼** — poziom opada
- **Kwadrat ■** — poziom stabilny

**Kolor = severity stacji:**
- **L0 Norma** — szary (`--l0`), bez pulsowania, mniejszy
- **L1 Uwaga** — żółty (`--l1`), pulsujący subtelnie
- **L2 Ostrzeżenie** — pomarańczowy (`--l2`), pulsujący wyraźnie
- **L3 Alarm** — czerwony (`--l3`), pulsujący intensywnie

**Dominująca stacja akwenu** (najwyższy poziom wody) ma dodatkowy pulsujący ring zewnętrzny w kolorze severity.

**Hover i klik na markerze:**
- Hover: `drop-shadow(0 4px 8px rgba(0,0,0,0.22)) drop-shadow(0 1px 3px rgba(0,0,0,0.14))` — unoszenie
- Klik (aktywny): scale `1.18` + ten sam drop-shadow
- Animacja: `transform 200ms cubic-bezier(0.16, 1, 0.3, 1)` (scale) + `filter 140ms` (shadow)
- `drop-shadow` (filter CSS) — śledzi kształt SVG, nie bounding box — konieczne dla trójkątów

**Klaster stacji:**
- Liczba stacji wewnątrz + kolor obramowania = severity najgorszej stacji w klastrze
- Kliknięcie klastra → zoom in do jego zawartości (nie overlay)

Segmenty rzeki (odcinki) są kolorowane odpowiadającym severity na mapie przy zoom 12+.

Kliknięcie markera stacji na mapie → otwiera szczegóły tej stacji w panelu prawym (breadcrumb: akwen → odcinek → stacja).

### Dark mode (default)

```css
/* Tło */
--bg:           #09090B    /* zinc-950 */
--surface:      #18181B    /* zinc-900 */
--surface-2:    #27272A    /* zinc-800 */
--surface-3:    #3F3F46    /* zinc-700 */

/* Obramowania */
--border:       #27272A
--border-hover: #52525B

/* Tekst */
--text:         #FAFAFA    /* zinc-50 */
--text-muted:   #A1A1AA    /* zinc-400 */
--text-faint:   #52525B    /* zinc-600 */
--text-on-accent: #FFFFFF

/* Akcent (indigo) */
--accent:         #818CF8    /* indigo-400 — interactive elements, highlights */
--accent-dim:     #818CF818
--accent-hover:   #A5B4FC    /* indigo-300 */
--accent-button:  #4F46E5    /* indigo-600 — CTA button background */
--accent-button-hover: #4338CA /* indigo-700 */

/* Status */
--status-live:  #22C55E    /* green-500 */
--status-ok:    #22C55E

/* Severity */
--l0: #6B7280
--l1: #F5A623
--l2: #E8711A
--l3: #D93025

/* Severity backgrounds */
--l0-bg: #6B728012
--l1-bg: #F5A62312  --l2-bg: #E8711A12
--l3-bg: #D9302512

/* Mapa */
Carto Dark Matter — sandwich: dark_nolabels + dark_only_labels
```

### Light mode

```css
/* Tło */
--bg:           #F4F4F5    /* zinc-100 */
--surface:      #FFFFFF
--surface-2:    #F4F4F5    /* zinc-100 */
--surface-3:    #E4E4E7    /* zinc-200 */

/* Obramowania */
--border:       #E4E4E7
--border-hover: #D4D4D8

/* Tekst */
--text:         #09090B    /* zinc-950 */
--text-muted:   #71717A    /* zinc-500 */
--text-faint:   #A1A1AA    /* zinc-400 */
--text-on-accent: #FFFFFF

/* Akcent (indigo) */
--accent:         #4F46E5    /* indigo-600 — interactive elements, highlights */
--accent-dim:     #4F46E512
--accent-hover:   #4338CA    /* indigo-700 */
--accent-button:  #4338CA    /* indigo-700 — CTA button background */
--accent-button-hover: #3730A3 /* indigo-800 */

/* Status */
--status-live:  #16A34A    /* green-600 */
--status-ok:    #16A34A

/* Severity */
--l0: #9CA3AF
--l1: #D97706
--l2: #C2540A
--l3: #B91C1C

/* Severity backgrounds */
--l0-bg: #9CA3AF10
--l1-bg: #D9770610  --l2-bg: #C2540A10
--l3-bg: #B91C1C10

/* Mapa */
Carto Positron — sandwich: light_nolabels + light_only_labels
```

---

## Źródła danych (docelowe)

- **IMGW SHAPI** — real-time dane hydrologiczne z wodomierzy (szczegółowe, per stacja)
- **danepubliczne.imgw.pl API** — publiczny REST API IMGW: hydro, synop, ostrzeżenia; uproszczony podzbiór SHAPI, bezpłatny, bez klucza
- **NMT 1m** — Numeryczny Model Terenu (interpolacja obszarów zalewowych)
- **BDOT10k** — budynki, drogi, infrastruktura
- **ISOK** — mapy zagrożenia powodziowego
- **MPHP** — sieć rzeczna
- **IMGW Radar SRI** — kompozyt radarowy natężenia opadów (dane binarne ODIM HDF5 + GRIB)
- **IMGW COSMO 2k8** — model NWP, prognoza opadów 72h, format GRIB, 4 runy/dobę

### IMGW API — endpointy publiczne (danepubliczne.imgw.pl)

Bezpłatne, bez uwierzytelnienia. Obowiązek atrybuowania źródła: "Dane IMGW-PIB".

**Dane hydrologiczne:**
```
GET https://danepubliczne.imgw.pl/api/data/hydro/
GET https://danepubliczne.imgw.pl/api/data/hydro/id/{id_stacji}
GET https://danepubliczne.imgw.pl/api/data/hydro/station/{nazwa}

Pola: id_stacji, stacja, rzeka, wojewodztwo, lon, lat
      stan_wody (cm) + stan_wody_data_pomiaru
      przeplyw (m³/s) + przeplyw_data
      temperatura_wody, zjawisko_lodowe, zjawisko_zarastania
```

**Dane meteorologiczne (stacje synoptyczne):**
```
GET https://danepubliczne.imgw.pl/api/data/synop/
GET https://danepubliczne.imgw.pl/api/data/synop/id/{id_stacji}
GET https://danepubliczne.imgw.pl/api/data/synop/station/{nazwa}
Obsługuje format: /format/json|xml|csv|html

Pola: id_stacji, stacja, data_pomiaru, godzina_pomiaru
      temperatura (°C), predkosc_wiatru, kierunek_wiatru (°)
      wilgotnosc_wzgledna (%), suma_opadu (mm), cisnienie (hPa)
```

**Ostrzeżenia hydrologiczne — kluczowy trigger pipeline:**
```
GET https://danepubliczne.imgw.pl/api/data/warningshydro

Pola: stopień (-1=susza, 1/2/3=wezbranie/alarm), zdarzenie
      data_od, data_do, prawdopodobienstwo (%)
      biuro (Biuro Prognoz Hydrologicznych)
      przebieg (opis słowny sytuacji)
      obszary[]: { wojewodztwo, opis, kod_zlewni[] }
        ↑ kod_zlewni = kody MPHP (format: Z_P_{TERYT-WOJ}_{kod})
          mapują bezpośrednio na zlewnie w hierarchii Decerisa
```

**Ostrzeżenia meteorologiczne — pre-signal:**
```
GET https://danepubliczne.imgw.pl/api/data/warningsmeteo

Pola: id, nazwa_zdarzenia (np. "Intensywne opady deszczu", "Burza z gradem")
      stopień (1/2/3), prawdopodobienstwo
      obowiazuje_od, obowiazuje_do, tresc, komentarz, biuro
      teryt[] — kody TERYT powiatów/gmin objętych ostrzeżeniem
```

**Produkty binarne (radar + model):**
```
GET https://danepubliczne.imgw.pl/api/data/product
  → lista 42 produktów:
    COMPO_SRI.comp.sri     — kompozyt radarowy SRI (Surface Rainfall Intensity)
    COMPO_SRI.comp.sri_h5  — j.w. format ODIM HDF5
    COMPO_CMAX_250.comp.cmax — kompozyt radarowy CMAX (max echo)
    COMPO_EHT.comp.eht     — wysokość echa (Echo Top Height)
    COMPO_PAC.comp.pac     — akumulacja opadów radarowych
    COMPO_CAPPI.comp.cappi — CAPPI (stała wysokość)
    COSMO_HVD_{00|06|12|18}_{00|01} — model COSMO 2k8, GRIB, 4 runy/dobę

GET https://danepubliczne.imgw.pl/api/data/product/id/{id}
  → pobieranie konkretnego produktu (plik binarny)
```

**Uwagi implementacyjne:**
- Dane hydro i synop są aktualizowane co ~10 min (godzina pomiaru w polu timestamp)
- `warningshydro` i `warningsmeteo` są aktualizowane przy wydaniu nowego ostrzeżenia
- `przeplyw` (m³/s) w hydro API jest bardziej stabilnym wskaźnikiem ryzyka niż sam `stan_wody` (cm) — warto rozważyć włączenie do modelu severity
- COSMO GRIB i radar HDF5 wymagają dedykowanego parsera (pygrib, h5py) — złożone w konsumpcji, używać przez dedykowany backend

### meteo.imgw.pl — zasoby webowe (brak publicznego API)

Serwis wizualizacyjny IMGW — nie ma publicznego API, ale wartościowy jako referencja i benchmark UX.

| Produkt | Opis | Horyzont |
|---------|------|----------|
| INCA/SCENE 1.0km | Nowcasting opadów | 8h do przodu |
| AROME | Model NWP wysokiej rozdzielczości | 30–48h |
| COSMO | Model NWP (identyczny z danepubliczne) | 72h |
| ALARO | Model LACE | 72h |
| ICON-FWI | Model globalny + wskaźnik pożarowy | 10 dni |
| GFS | Model globalny NOAA | 10 dni |
| Radary | Kompozyt radarowy live | real-time |
| Satelita | Eumetsat — kanały VIS/IR | real-time |
| Meteogram | Wykres prognoz per punkt | — |

INCA/SCENE (1km, 8h) jest najważniejszy dla Decerisa — krótkoterminowa prognoza opadów na kilka godzin przed spłynięciem wody do rzeki. Brak API, ale IMGW udostępnia ją w serwisie — rozważyć WMS lub screen scraping w razie potrzeby.

### Warstwa opadów — nowy wymiar modelu danych

Do tej pory Deceris modelował wyłącznie `stan_wody` (reakcja). Opady to przyczyna — upstream signal z wyprzedzeniem 2–24h.

**Źródła opadów (od najszybszego do najdokładniejszego):**

| Źródło | Lag | Zasięg | Format | Rola w Decerisie |
|--------|-----|--------|--------|-----------------|
| Radar SRI (danepubliczne) | real-time | cała PL | HDF5/GRIB | Warstwa analityczna: "gdzie pada teraz i jak intensywnie" |
| Synop suma_opadu | co 1h | ~60 stacji | JSON REST | Kalibracja radaru, punkty pomiarowe |
| INCA/SCENE (meteo.imgw.pl) | +8h | cała PL | (brak API) | Wyprzedzenie dla operatora — nadchodzące opady |
| COSMO 2k8 (danepubliczne) | +72h | cała PL | GRIB | Prognoza do planowania scenariuszy |

**Integracja z alert pipeline:**
- Gdy `warningsmeteo` wydaje "Intensywne opady deszczu" dla danego TERYT → Deceris może pokazać pre-alert "Ryzyko wezbrania" na akwenach w tej zlewni, zanim `warningshydro` się pojawi
- Radar SRI + mapa zlewni MPHP = estymacja kiedy opady dotrą do wodowskazów

### Linki referencyjne
- https://hydro.imgw.pl/#/
- https://meteo.imgw.pl/
- https://danepubliczne.imgw.pl/
- https://danepubliczne.imgw.pl/apiinfo
- https://isok.gov.pl/hydroportal.html
- https://sip.lex.pl/akty-prawne/dzu-dziennik-ustaw/opracowywanie-map-zagrozenia-powodziowego-oraz-map-ryzyka-powodziowego-18768212
- https://sites.research.google/floods/l/26.667095801104814/80.79345703125/6/g/CWC_015-MGD2LKN

---

## Dane mockowe — Wrocław, powódź wrzesień 2024

Widok demonstracyjny: dorzecze Odry, rejon Osobowice / Kozanów / Trestno, km rzeki 242–250.

**Stacje IMGW z progami i wartościami mockowymi:**

| Akwen | Stacja | L0 | L1 | L2 | L3 | Wartość mock | Status |
|-------|--------|----|----|----|----|--------------|--------|
| Odra | Trestno | < 200 cm | 200–380 cm | 380–450 cm | > 450 cm | **523 cm** | L3 ↑ |
| Odra | Osobowice | < 180 cm | 180–340 cm | 340–420 cm | > 420 cm | **398 cm** | L2 ↑ |
| Bystrzyca | Jarnołtów | < 140 cm | 140–230 cm | 230–270 cm | > 270 cm | **248 cm** | L2 → |
| Ślęza | Ślęza | < 130 cm | 130–270 cm | 270–300 cm | > 300 cm | **156 cm** | L1 → |
| Widawa | Krzyżanowice | < 80 cm | 80–150 cm | 150–200 cm | > 200 cm | **138 cm** | L1 ↑ |
| Oława | Oława | < 100 cm | 100–200 cm | 200–250 cm | > 250 cm | **185 cm** | L1 → |
| Bóbr | Jelenia Góra | < 100 cm | 100–160 cm | 160–200 cm | > 200 cm | **168 cm** | L2 ↑ |

**Nazwy stacji do użycia w mock data (wrocławski obszar):** Trestno, Osobowice, Jarnołtów, Ślęza, Krzyżanowice, Oława, Jelenia Góra.

**Nazwy których NIE używać** jako stacji w widoku wrocławskim (to inne regiony): Drawsko Pomorskie, Nowy Sącz, Kamieniec Ząbkowski, Grodno, Kłodzko, Bardo.

---

## Podejście do projektowania UI/UX

Przy każdej pracy nad interfejsem użytkownika (nowe ekrany, komponenty, design system, review) używać skilla `ui-ux-pro-max` — generuje rekomendacje stylu, kolorystyki, typografii i wzorców UX na podstawie typu produktu.

Workflow:
1. Przed projektowaniem uruchomić `--design-system` query dla kontekstu projektu
2. Uzupełniać szczegółami (`--domain ux`, `--domain chart`) w razie potrzeby
3. Stosować Pre-Delivery Checklist z skilla przed oddaniem kodu

### Zasady dobrego produktu cyfrowego

Każdy ekran, komponent i interakcja w Decerisie musi być weryfikowany pod kątem poniższych zasad. Są wiążące — nie opcjonalne.

| Zasada | Definicja |
|--------|-----------|
| **Dostępny** | Działa dla każdego użytkownika niezależnie od sprawności, urządzenia i kontekstu. Spełnia WCAG — brak barier technicznych ani percepcyjnych. |
| **Wydajny** | Reaguje szybko i działa płynnie. Czas ładowania i responsywność techniczna są integralną częścią doświadczenia — opóźnienia niszczą zaufanie i koncentrację. |
| **Responsywny** | Działa poprawnie na każdym urządzeniu i rozmiarze ekranu. Układ, typografia i interakcje dostosowują się do kontekstu sprzętowego. |
| **Spójny** | Elementy wyglądają i zachowują się przewidywalnie w całym produkcie. Ten sam wzorzec wizualny i interakcyjny oznacza zawsze to samo — użytkownik nie uczy się od nowa w każdej sekcji. |
| **Pozbawiony zbędnych elementów** | Każdy element istnieje z konkretnego powodu. To, czego nie ma, nie rozprasza — każdy dodatkowy element konkuruje o uwagę użytkownika. |
| **Kontekstowy** | Pokazuje tylko elementy istotne w danym momencie. Interfejs reaguje na stan użytkownika i etap zadania, redukując szum informacyjny. |
| **Przewidywalny** | Użytkownik wie czego się spodziewać zanim wykona akcję. Produkt zachowuje się zgodnie z mentalnymi modelami i nie zaskakuje nieoczekiwanymi rezultatami. |
| **Niezauważalny** | Dobry design nie zwraca na siebie uwagi. Użytkownik koncentruje się na celu, nie na interfejsie — produkt schodzi na drugi plan i po prostu działa. |
| **Zrozumiały** | Użytkownik rozumie jak działa produkt bez instrukcji. Hierarchia, etykiety i nawigacja są intuicyjne — nauka obsługi dzieje się naturalnie podczas użytkowania. |
| **Minimalizujący kliknięcia** | Droga do celu jest możliwie najkrótsza. Każdy zbędny krok to potencjalny punkt porzucenia — produkt szanuje czas i energię użytkownika. |
| **Dający klarowny feedback** | Każda akcja spotyka się z wyraźną odpowiedzią systemu. Użytkownik zawsze wie czy akcja się powiodła, trwa czy wymaga jego uwagi. |
| **Odporny na błędy** | Zapobiega pomyłkom przez ograniczenia i potwierdzenia. Gdy błąd już wystąpi — umożliwia łatwą naprawę. Produkt nie karze za naturalną omylność. |

---

## Zasady pracy w tym projekcie

### Terminologia
- **Klucze techniczne** (severity_key, identify_key, field names) mogą być po angielsku
- **Etykiety UI** (przyciski, nagłówki, statusy) muszą być po **polsku**
- Standard: "Potwierdzone" (nie "Acknowledged"), "Zamknięte" (nie "Resolved"), "W toku" (nie "Running")
- Tytuły ekranów: `Deceris — [Nazwa ekranu]`

### Terminologia pojęć
| Pojęcie | Użyj | Nie używaj |
|---------|------|------------|
| Lista alertów | Zagrożenia | Threats, Alerty |
| Severity badge | Etykieta z View Schema | "L3" i "POWÓDŹ" jednocześnie |
| Czas do zdarzenia | "Następna zmiana: 36h" | "Peak za 36h", "~36 godzin" |

### Nawigacja
- Aplikacja to SPA — brak przeładowań między widokami
- Alerty: dostępne z topbara (badge z liczbą → drawer z listą wymagające uwagi/rozpoznane/zaopiekowane)
- Historia decyzji: dostępna jako drugorzędna opcja (menu lub osobna strona) — nie eksponowana w głównym UI
- Analiza (analysis.html): poza scope MVP — feature v2.0, nie rozwijać

### Monitor
- Jeden tryb: pełnoekranowa mapa z dynamicznymi znacznikami alertów
- Brak trybu GIS na Monitorze — GIS jest wyłącznie w sekcji ANALIZA (w kontekście alertu)
- Kliknięcie markera alertu → mode bar pojawia się, automatyczne przejście do ANALIZY z aktywnymi narzędziami GIS

### Dane mock vs produkcja
- Mock data w JS oznaczać: `// MOCK DATA — w produkcji z API`
- System musi być **generyczny** — bez hardcoded nazw stacji/rzek/jednostek w HTML

### Aktualny priorytet prac
1. Migracja do SPA (React + Vite) + MapLibre GL JS — fundament bez którego reszta jest kosmetyczna
2. Alert Detail — redesign jako mode bar MONITORING / ANALIZA / PLANOWANIE nad mapą
3. ANALIZA — scenariusze what-if + GIS (rysowanie wału + kalkulator zasobów)
4. PLAN — porównanie + generowanie planów A/B + eksport PDF
5. Monitor — profil operatora + domyślny zoom do jurysdykcji + dynamiczne alerty
6. Poprawki: terminologia PL, broken nav links, GIS sidebar swap

---

## Aktualny prototyp — co zachować

Pliki w `materials/System/` to inicjalny prototyp. Nie jest throwaway — zawiera przemyślane rozwiązania które warto przenieść do nowej wersji.

### Co zgadza się z koncepcją
- Struktura nawigacji (Monitor → Zagrożenia → Alert Detail → Analiza) pokrywa się z flow 1:1
- Struktura Monitora jako czystej mapy z markerami — kierunek zgodny z założeniami (pill toggle GIS do usunięcia)
- Sidebar GIS z listą narysowanych obiektów i kontrolą warstw mapy — gotowa koncepcja
- Status źródeł danych (IMGW SHAPI, NMT 1m, BDOT10k, ISOK, MPHP) — kompletna lista
- Breadcrumb nawigacja, severity badges, toast notifications — gotowe wzorce
- Dwukolumnowy ekran porównania scenariuszy — zaimplementowany
- Severity skala 4-poziomowa z kolorami i tłem — spójna i gotowa

### Co jest zaskakująco dobre
- **Model LSTM** widoczny wśród źródeł danych — predykcja ML była planowana od początku
- **What-if panel** już zaplanowany w sidebarze trybu GIS
- **Eksport PDF z drawerem** — wybór sekcji, podgląd miniatur stron, odbiorcy, formaty — bardzo dopracowany UX, warto przenieść
- **Animacje i micro-interactions** — `cubic-bezier(0.16, 1, 0.3, 1)` sprężyna, pulse dot dla live data, hover feedback — jakość porównywalna z Vercel/Linear
- **Typografia dualna** — Geist (body) + Geist Mono (dane, liczby, ID) — spójny z ekosystemem shadcn/ui

### Co wymaga przebudowy
- `threat-detail.html` — layout zakładkowy zamiast mode bar MONITORING/ANALIZA/PLANOWANIE
- Mapa to symulowany `<canvas>` w JS — bez MapLibre / OpenLayers
- Dane hardcoded (Kłodzko, Bardo, Nysa Kłodzka) — mock, nie generyczny system
- Brak SPA — każda strona to osobny plik HTML z własną mapą
- Terminologia niespójna (PL/EN mix)

---

## Audyt UX — obszary interwencji

Pełny audyt spójności systemu: `materials/System/AUDIT.md`

**Priorytet nadrzędny:** jak najszybsze przedstawienie bazowego scenariusza + przygotowanie alternatywnych scenariuszy what-if z rysowaniem wału i estymacją zasobów → najszybsza optymalna decyzja lub raport dla decydenta.

### Krytyczne — blokują główny flow

**[A] threat-detail.html — zakładki zamiast mode bar (P1)**
Zakładkowy layout wymusza reorientację przy każdej zmianie widoku. Pod presją 16h zmiany i 20 minut na decyzję — katastrofa UX. Zastąpić mode bar:
```
[  MONITORING  ]  [  ANALIZA  ]  [  PLANOWANIE  ]
```
Mapa nie znika — zmienia się kontekst (warstwy, podświetlenie). User przechodzi swobodnie między sekcjami.

**[B] Kalkulator wału — brak (P1 — differentiator #3)**
Po narysowaniu linii wału system nie liczy nic. Musi pokazywać inline, w czasie rzeczywistym:
- Długość (m) → objętość piasku (m³) → worki (szt.) → czas budowy (h przy X osobach) → koszt est. (PLN)
- Delta zalewu: zasięg przed vs po wale, liczba uratowanych budynków, uratowana infrastruktura krytyczna
- Parametry edytowalne (wysokość wału h, liczba osób N) → live rekalkulacja pozostałych wartości

**[C] Mapa jako symulowany canvas — fundament blokujący wszystko**
Obecna mapa = `<canvas>` rysowany przez JS bez prawdziwych danych geograficznych. Bez migracji na MapLibre GL JS + OpenLayers niemożliwe: rysowanie wału na prawdziwej geometrii, warstwy ISOK/BDOT10k/IMGW, rekalkulacja zalewu. Migracja mapy odblokuje wszystkie pozostałe funkcje.

### Wysokie — degradują kluczowy flow

**[D] Brak porównania danych bazowych + N scenariuszy w PLANOWANIU**
PLANOWANIE musi zestawiać dane bazowe z wszystkimi scenariuszami z ANALIZY jednocześnie — tabela metryk + mapa z warstwami. Aktualny prototyp ma porównanie 1:1 (bazowy vs jeden scenariusz).

**[E] Brak eksportu PDF planów A/B**
Sekcja PLAN musi generować plany jako PDF do druku/przekazania offline decydentowi. Brak tej funkcji = brak wyjścia systemu. decision.html jako osobna strona jest poza scope — zastąpiony eksportem PDF z PLAN.

### Średnie — degradują UX, nie blokują flow

**[F]** Pill toggle Monitor/GIS w prototypie — nieaktualny. W nowym modelu nie ma trybu GIS na Monitorze. GIS jest wyłącznie w sekcji ANALIZA. Do usunięcia z prototypu.

**[G]** Terminologia PL/EN mix — "Acknowledged"→"Wymagające uwagi/Rozpoznane", "Resolved"→"Zaopiekowane", "Analysis"→poza scope, "Peak za 36h"→"Następna zmiana: 36h"

**[H]** Broken nav links — Monitor=`#` w threats.html i threat-detail.html; brak parametru `?threat=ID`

### Zależności implementacyjne

```
[SPA + MapLibre]
  ├──▶ [A] Mode bar MONITORING/ANALIZA/PLANOWANIE nad mapą
  │         ├──▶ [B] Kalkulator wału w ANALIZIE (prototyp z mock możliwy)
  │         └──▶ [D] Porównanie Sytuacja + N scenariuszy z ANALIZY w PLAN
  │                   └──▶ [E] Eksport PDF planów A/B
  └──▶ [F] Dynamiczne alerty (pojawiają się/znikają z pipeline)
```

[A], [B], [E] można prototypować z mock geometry bez prawdziwej mapy. [D] i kalkulator wału wymagają MapLibre.

### Wzorce z prototypu — zachować bezwzględnie

| Element | Powód |
|---------|-------|
| Pulsujące znaczniki severity | Natychmiastowa percepcja alertów bez czytania |
| `cubic-bezier(0.16, 1, 0.3, 1)` animacje | Jakość micro-interactions porównywalna z Vercel/Linear |
| GIS toolbar z narzędziami w prototypie | Zestaw narzędzi (linia, poligon, pomiar) przenosi się do sekcji ANALIZA |
| Drawar eksportu PDF z podglądem miniatur stron | Bardzo dopracowany UX — przenieść 1:1 do nowej wersji |
| Toast notifications dla nowych alertów | Właściwy mechanizm powiadomień |
| Geist Mono dla danych numerycznych | Spójny z Geist body, jeden vendor font w całym projekcie |
| Status źródeł danych w sidebarze | Kluczowy dla analityka — czy dane IMGW są live |
| Dynamiczny clustering znaczników | Daleko: klastry z dominującym severity; blisko: pojedyncze znaczniki |

### Wymagania dostępności (WCAG — system publiczny)

- Severity nie tylko przez kolor — ikona lub pattern overlay (wymóg dla podmiotów publicznych)
- Wszystkie widoki mapowe muszą mieć alternatywę tabelaryczną
- Focus states dla keyboard navigation
- `prefers-reduced-motion` respektowany dla animacji pulsowania i przejść

---

## Problemy do zaadresowania — gap między prototypem a założeniami

Kompletna lista tego co musi ulec zmianie żeby prototyp z `materials/System/` osiągnął model: **mapa w centrum, dynamiczna, kontekstowa, panel nad mapą — nie oddzielne ekrany**.

---

### 1. Architektura — multi-page vs single-surface

| Problem | Opis |
|---------|------|
| **5 osobnych plików HTML** | `monitor.html`, `threats.html`, `threat-detail.html`, `analysis.html`, `decision.html` — każde przejście to przeładowanie strony i utrata kontekstu mapy |
| **Każdy ekran ma własną mapę** | `monitor.html` i `threat-detail.html` i `analysis.html` mają oddzielne canvasy — brak ciągłości przestrzennej |
| **threats.html nie ma mapy** | Lista alertów bez żadnego kontekstu geograficznego — stoi w sprzeczności z założeniem "mapa zawsze" |
| **Cel** | Jedno SPA (React + Vite). Mapa renderowana raz, zawsze widoczna. Mode bar MONITORING/ANALIZA/PLANOWANIE pojawia się gdy alert wybrany. Przejście między sekcjami = zmiana warstw na mapie, nie przeładowanie strony |

---

### 2. Mapa — fundament wszystkiego

| Problem | Opis |
|---------|------|
| **Canvas zamiast MapLibre GL JS** | Mapa to `<canvas>` rysowany przez JS z fikcyjnymi kształtami. Żadne dane geograficzne nie działają |
| **Brak prawdziwych danych przestrzennych** | Brak WKT, GeoJSON, WMS — nie można załadować ISOK, BDOT10k, IMGW SHAPI |
| **Mapa nie reaguje na kontekst** | Nie zmienia warstw gdy user przechodzi między SYTUACJĄ / ANALIZĄ / PLANEM. Zawsze wygląda tak samo |
| **Brak klastrowania** | Brak zoom-dependent clustering — przy wielu stacjach mapa będzie nieprzejrzysta |
| **Brak rysowania na geometrii** | GIS toolbar istnieje w UI ale rysuje na canvas bez prawdziwych współrzędnych geograficznych |
| **Brak rekalkulacji zalewu** | Po narysowaniu wału — nic się nie dzieje. Brak integracji z NMT do interpolacji zasięgu |
| **Brak timeline scrubber z danymi** | Scrubber T+0h…T+72h istnieje w UI ale nie zmienia żadnych prawdziwych danych |
| **Cel** | MapLibre GL JS jako renderer WebGL + OpenLayers do WMS/WFS. Mapa reaguje na każdą zmianę kontekstu (panel, sekcja, scenariusz) |

---

### 3. Profil operatora i domyślny widok

| Problem | Opis |
|---------|------|
| **Brak profilu z jurysdykcją** | System nie wie kto się zalogował i za jaki obszar odpowiada |
| **Hardcoded "Dolnośląskie"** | Badge regionu w topbarze to statyczny tekst — nie pochodzi z profilu |
| **Brak logiki startu** | Brak: (1) sprawdź aktywne alerty w jurysdykcji → (2a) jest alert: zoom do najwyższego severity → (2b) brak alertu: zoom do bbox jurysdykcji z home_zoom |
| **Brak obsługi TERYT** | Kody TERYT (02 = dolnośląskie, etc.) jako podstawa bounding boxów — nie zaimplementowane |
| **Cel** | Profil operatora zawiera `jurisdiction.type` (voivodeship/county/river_basin/custom), `jurisdiction.bbox`, `home_zoom`. Przy każdym starcie aplikacja decyduje co pokazać |

---

### 4. Alert Detail — mode bar MONITORING / ANALIZA / PLANOWANIE (vs. aktualne zakładki)

| Problem | Opis |
|---------|------|
| **4 zakładki zamiast mode bar 3 sekcji** | `Scenariusze / Porównanie / Decyzja / Historia` — nie odzwierciedlają modelu Sytuacja / Analiza / Plan |
| **Brak sekcji Sytuacja** | Dane bazowe wmieszane w zakładkę Scenariusze — brak czytelnego punktu odniesienia |
| **Mode bar widoczny zawsze** | Powinien pojawiać się tylko gdy alert jest wybrany — gdy żaden alert nie wybrany, mapa jest po prostu Monitorem |
| **Porównanie 1:1 zamiast 1:N** | UI zakłada porównanie bazowy vs jeden scenariusz — nie Sytuacja + N scenariuszy z ANALIZY |
| **Rysowanie wału bez związku ze scenariuszem** | GIS tools są po lewej na mapie niezależnie — interwencja (wał) powinna być częścią konkretnego scenariusza w ANALIZIE |
| **Brak N scenariuszy** | UI nie obsługuje dodawania drugiego, trzeciego scenariusza — brak "+ Dodaj scenariusz" |
| **Brak planów A/B** | Brak możliwości oznaczenia scenariuszy jako Plan A / Plan B i eksportu każdego oddzielnie |
| **decision.html jako osobna strona** | Decyzja to nie osobna strona — eksport PDF z PLAN i opcjonalne oznaczenie alertu to jedyne akcje "decyzyjne" |
| **Cel** | Overlay alertu → `ANALIZA` (GIS + N scenariuszy, każdy z opcjonalną interwencją) → `PLANOWANIE` (porównanie danych bazowych + wszystkie scenariusze z ANALIZY, plany A/B, eksport PDF) |

---

### 5. Kalkulator wału — brak implementacji

| Problem | Opis |
|---------|------|
| **Brak kalkulatora** | Po narysowaniu linii wału system nie zwraca żadnych liczb |
| **Brak wzoru** | Formuła: objętość = długość × przekrój poprzeczny (trójkąt). Przy h=1.5m, stosunek 1:1.5 → ~3.4 m³/mb. Worki 25kg = ~0.013 m³ → ~260 worków/mb |
| **Brak editowalnych parametrów** | Wysokość wału, liczba pracowników, tempo układania — edytowalne, live rekalkulacja |
| **Brak delty zalewu** | System nie porównuje zasięgu przed/po wale — kluczowa informacja dla decydenta |
| **Cel** | Po narysowaniu: długość → m³ piasku → worki → czas (h przy N osobach) → koszt PLN → delta budynków/km² |

---

### 6. Dane i generyczność

| Problem | Opis |
|---------|------|
| **Hardcoded stacje hydrologiczne** | "Kłodzko km 34.2", "Bardo km 52.7", "Nysa Kłodzka" w HTML i JS — system nie jest generyczny |
| **Hardcoded jednostki** | "cm" jako jednostka poziomu wody zakodowane w HTML — powinno być z `View Schema` |
| **View Schema nie działa dynamicznie** | `VIEW_SCHEMA` zdefiniowany w JS ale UI nie renderuje z niego — etykiety są hardcoded |
| **Brak IMGW SHAPI** | Brak integracji z API real-time — wszystkie dane to mock arrays w JS |
| **Brak ISOK WMS** | Strefy Q1%/Q10% to narysowane kształty na canvas, nie prawdziwe warstwy ISOK |
| **Mock data bez oznaczenia** | Część danych mockowych nie ma komentarza `// MOCK DATA — w produkcji z API` |
| **Cel** | Wszystkie etykiety, jednostki, pola z View Schema. Mock data oznaczona. Architektura gotowa na podpięcie IMGW SHAPI i ISOK WMS bez zmiany UI |

---

### 7. Nawigacja i UX

| Problem | Plik | Fix |
|---------|------|-----|
| Monitor = `#` zamiast `monitor.html` | `threats.html` linia 25 | `href="monitor.html"` |
| Aktywny link "Zagrożenia" = `href="#"` | `threats.html` linia 29 | `href="threats.html"` |
| Brak obsługi `?threat=EVT-ID` | `threat-detail.html` | `URLSearchParams` w JS |
| GIS sidebar nie zamienia zawartości | `monitor.html` | Swap całego kontenera, nie toggle toolbar |
| "Acknowledged" / "Resolved" w UI | `threats.html`, `threat-detail.js` | "Potwierdzone" / "Zamknięte" |
| "Analysis" zamiast "Analiza" | `analysis.html` topbar | Zmień tytuł |
| decision.html jako osobna strona | poza scope | zastąpiony eksportem PDF z PLAN |
| "Threats" w topbarze threats.html | `threats.html` | "Zagrożenia" |

---

### 8. Dostępność (WCAG — system publiczny)

| Problem | Opis |
|---------|------|
| **Severity tylko przez kolor** | Brak ikony lub wzoru — niewidoczne dla osób z deuteranopią |
| **Brak keyboard navigation** | Zakładki, toolbary GIS nie obsługują Tab/Enter |
| **Brak alt/aria-label na ikonach** | SVG ikony bez `aria-label` — czytnik ekranu nie wie co to jest |
| **Brak alternatywy tabelarycznej dla mapy** | Andrzej (Decydent) na iPadzie może mieć potrzeby dostępności |
| **Cel** | WCAG 2.1 AA minimum — wymóg prawny dla systemów administracji publicznej w Polsce |

---

### 9. Mock data — realne nazwy i wartości (Wrocław)

Aktualne mock data powinny używać realnych nazw i wartości dla widoku wrocławskiego.

**Akweny Dorzecza Odry (widok Wrocław):**
- **Odra — Wrocław:** stacje Oława-miasto km230 245cm, Trestno km242 523cm L3↑, Szczytniki km249 498cm L3↑, Osobowice km255 472cm L2↑, Śródmieście km263 445cm L2↑, Brzeg Dolny km270 398cm L2↑
- **Bystrzyca:** stacje Kondratowice km0 88cm L0, Wilkszyn km8 198cm L2↑, Jarnołtów km18 312cm L3↑, Leśnica km26 248cm L2↓
- **Widawa:** stacje Szewce km0 142cm L1↑, Krzyżanowice km8 188cm L3—, Widawa-miasto km18 165cm L2→, ujście km24 128cm L1→
- **Ślęza:** stacje Ślęza km0 112cm L0, Bielany Wrocławskie km14 156cm L1→, Wojszyce km22 142cm L1↓, ujście km28 98cm L0
- **Oława:** stacje Zborowice km0 98cm L0, Domaniów km12 142cm L0↓, Oława-miasto km22 185cm L1↓, Opatowice km30 162cm L1↓, ujście km36 124cm

**Progi alarmowe:**
- Odra — Wrocław (Trestno): L1=200cm, L2=380cm, L3=450cm
- Bystrzyca (Jarnołtów): L1=140cm, L2=230cm, L3=270cm

Wszystkie wartości oznaczone `// MOCK DATA — w produkcji z IMGW SHAPI`.

---

### Mapa zależności — co blokuje co

```
[SPA (React + Vite) + MapLibre GL JS]
  ├──▶ Mapa zawsze widoczna — jeden renderer przez całą sesję
  ├──▶ Mode bar pojawia się nad mapą (nie osobna strona)
  ├──▶ Prawdziwe warstwy ISOK WMS / BDOT10k / IMGW SHAPI
  ├──▶ Rysowanie wału na prawdziwej geometrii (w Scenariuszach)
  │         └──▶ Kalkulator wału z deltą zalewu (NMT interpolacja)
  ├──▶ Mapa zmienia warstwy przy przełączeniu MONITORING/ANALIZA/PLANOWANIE
  └──▶ Timeline scrubber z prawdziwymi danymi

[Profil operatora]
  └──▶ Domyślny zoom do jurysdykcji przy starcie + logika zoom-to-alert

[Dynamiczne alerty]
  └──▶ Pipeline triggeruje/wygasza alerty automatycznie
           └──▶ Praca zachowana gdy alert wygasa w trakcie sesji
```

Bez SPA + prawdziwej mapy — wszystkie inne poprawki są kosmetyczne.

---

## Materiały i kontekst

- **SPEC.md** — `materials/System/SPEC.md` — pełna specyfikacja systemu
- **AUDIT.md** — `materials/System/AUDIT.md` — audyt niespójności z priorytetami
- **VIEW_SCHEMA_SPEC.md** — `materials/System/VIEW_SCHEMA_SPEC.md` — spec schematu widoku
- **rozmowa/** — `materials/rozmowa/` — zrzuty ekranu i pliki z poprzednich sesji pracy
