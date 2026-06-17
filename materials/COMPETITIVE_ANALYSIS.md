# Deceris — Analiza konkurencji i persony użytkowników
**Data:** 2026-04-18  
**Wersja:** 1.0

---

## 1. Krajobraz konkurencyjny

### 1.1 Istniejące systemy — mapa

Rynek narzędzi do zarządzania zagrożeniami powodziowymi można podzielić na cztery klasy:

| Klasa | Przykłady | Główna funkcja |
|-------|-----------|---------------|
| **Monitoring i alertowanie** | hydro.imgw.pl, SIGW, Copernicus EMS | Wyświetlanie danych w czasie rzeczywistym |
| **Mapy zagrożenia** | ISOK Hydroportal, flood.gov.pl, GUGiK | Statyczne mapy ryzyka |
| **Globalne systemy predykcji** | Google Floods, FloodList, Copernicus GFM | Prognozowanie na dużą skalę |
| **Enterprise Emergency Management** | WebEOC (Juvare), ESRI Disaster Response, Palantir Gotham | Zarządzanie kryzysowe dla organizacji |

---

### 1.2 Analiza szczegółowa

#### 🇵🇱 hydro.imgw.pl
**Operator:** IMGW-PIB  
**URL:** https://hydro.imgw.pl

**Co robi:**
- Real-time dane z wodomierzy i stacji meteorologicznych IMGW
- Wykresy historyczne poziomu wód
- Alerty przekroczenia stanów alarmowych
- Mapy hydrometeorologiczne

**Mocne strony:**
- Jedyne oficjalne źródło danych hydrologicznych dla Polski
- Bardzo duża gęstość danych — setki stacji pomiarowych
- Predykcja 72h (model COSMO/ALARO)
- Bezpłatny dostęp, API dostępne (SHAPI)
- Instytucjonalne zaufanie

**Słabe strony:**
- Brak narzędzi do podejmowania decyzji — tylko monitoring
- Interfejs z lat 2010. — nieresponsywny, trudny w obsłudze mobilnej
- Brak priorytetyzacji alertów (wszystkie równe, brak severity semantics)
- Brak kontekstu przestrzennego — nie wiadomo co zaleje konkretny alert
- Niemożliwość pracy grupowej / współdzielenia sesji
- Brak scenariuszy what-if
- Dane nie są zintegrowane z infrastrukturą (budynki, drogi, ludność)
- Eksport tylko surowych CSV / XML

**Niezaspokojona potrzeba Decerisa:** Warstwa decyzyjna — „co teraz zrobić z tymi danymi"

---

#### 🇵🇱 ISOK Hydroportal
**Operator:** KZGW / GUGiK  
**URL:** https://isok.gov.pl/hydroportal.html

**Co robi:**
- Interaktywna mapa zagrożenia powodziowego Q10%, Q1%, Q0.2%
- Mapy ryzyka powodziowego (wartość zagrożonych obiektów)
- WMS/WFS do integracji z GIS

**Mocne strony:**
- Jedyne oficjalne źródło map zagrożenia wg Dyrektywy Powodziowej UE
- Bardzo dokładne dane przestrzenne (NMT 1m)
- Darmowy WMS — można embedować

**Słabe strony:**
- Dane statyczne — aktualizowane cyklicznie (co 6 lat per dyrektywa)
- Brak danych real-time
- Brak narzędzi analitycznych — tylko przeglądarka map
- Interfejs wiekowy, wolny rendering
- Brak API do automatycznej integracji

**Niezaspokojona potrzeba Decerisa:** Połączenie statycznych map ryzyka z danymi real-time i predykcją

---

#### 🌍 Google Floods
**Operator:** Google Research / Crisis Response  
**URL:** https://sites.research.google/floods

**Co robi:**
- AI-based predykcja powodzi dla Indii, Bangladeszu, fragmentu Europy
- Mapa prognozy zalewu z horyzontem 7 dni
- Powiadomienia przez Google Search i Maps

**Mocne strony:**
- Świetne pokrycie i skala (miliard użytkowników docelowo)
- Model ML na NMT o rozdzielczości 1m
- Piękny, intuicyjny UI konsumencki
- Predykcja probabilistyczna (nie tylko deterministyczna)

**Słabe strony:**
- Brak narzędzi operacyjnych dla profesjonalistów
- Brak integracji z lokalnymi systemami alertów (IMGW)
- Nie można modyfikować scenariuszy
- Brak danych o infrastrukturze krytycznej
- Nie obsługuje polskich rzek wystarczająco precyzyjnie
- Brak możliwości eksportu / integracji z systemami zarządzania kryzysowego
- Consumer-grade, nie enterprise-grade

**Niezaspokojona potrzeba Decerisa:** Narzędzie operacyjne dla profesjonalistów, integracja z polskimi danymi

---

#### 🌍 Copernicus Emergency Management Service (CEMS)
**Operator:** ESA / EC Joint Research Centre

**Co robi:**
- Mapowanie obszarów dotkniętych klęskami (Rapid Mapping)
- Pre-event reference maps, post-event delineation maps
- Global Flood Monitoring (GFM) — produkty SAR

**Mocne strony:**
- Dane satelitarne o najwyższej jakości
- Europejski standard dla sytuacji kryzysowych
- Bezpłatny dla podmiotów publicznych

**Słabe strony:**
- Czas reakcji Rapid Mapping: 3-12h (za wolny na decyzje operacyjne)
- Brak narzędzi interaktywnych — tylko dostarczanie plików GeoTIFF / PDF
- Wymaga specjalistycznej wiedzy GIS do interpretacji
- Brak predykcji — tylko detekcja ex-post

**Niezaspokojona potrzeba Decerisa:** Szybkość + narzędzia operacyjne

---

#### 🏢 WebEOC (Juvare)
**Operator:** Juvare (komercyjny)  
**URL:** https://www.juvare.com/webEOC

**Co robi:**
- System zarządzania incydentami dla centrów EOC
- Wspólne tablice statusów, logowanie zdarzeń
- Zarządzanie zasobami (FEMA NIMS kompatybilny)
- Integracja z innymi systemami ratunkowymi

**Mocne strony:**
- Standard de facto w USA dla Emergency Operations Centers
- Dojrzały, sprawdzony w tysiacach incydentów
- Zarządzanie wieloagencyjne
- Silne logowanie i audyt

**Słabe strony:**
- Interfejs z epoki Flash/2005 — UI dramatycznie przestarzały
- Brak mapy jako centrum pracy
- Brak predykcji / modelowania hydrodynamicznego
- Nie dostosowany do polskich realiów administracyjnych
- Bardzo drogi — licencje enterprise, brak transparentnych cen
- Ogólny (nie specjalizowany dla powodzi)

**Niezaspokojona potrzeba Decerisa:** Mapa jako serce + hydrologiczna specjalizacja

---

#### 🏢 ESRI ArcGIS Emergency Management / Flood Response Solution
**Operator:** ESRI  

**Co robi:**
- Emergency Operations Dashboard (konfigurowalne)
- Flood Response Solution — szablon dla zarządzania powodzią
- Integration z ArcGIS Online / Enterprise
- Geofencing, alerting, field data collection

**Mocne strony:**
- Potężna platforma GIS — nieograniczona elastyczność
- Świetna wizualizacja przestrzenna
- Gotowe szablony flood response
- Duża ekosystem integracji (FEMA, NOAA, etc.)

**Słabe strony:**
- Wymaga specjalisty GIS do konfiguracji i utrzymania
- Licencje ArcGIS kosztują dziesiątki tysięcy USD rocznie
- Nadmiar możliwości = ogromna złożoność onboardingu
- Brak gotowych integracji z IMGW / ISOK
- UI zorientowany na GIS-analityka, nie na decydenta operacyjnego
- Brak wbudowanego guided flow dla nowych użytkowników

**Niezaspokojona potrzeba Decerisa:** Prostota + gotowe integracje polskich danych + guided flow

---

### 1.3 Matryca porównawcza

| Funkcja | hydro.imgw | ISOK | Google Floods | Copernicus | WebEOC | ESRI | **Deceris** |
|---------|-----------|------|---------------|-----------|--------|------|-------------|
| Real-time dane PL | ✅ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ | ✅ |
| Mapy ryzyka Q1%/Q10% | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Predykcja 72h | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Scenariusze what-if | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Rysowanie wału na mapie | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Kontekst infrastruktury | ❌ | ⚠️ | ❌ | ⚠️ | ❌ | ✅ | ✅ |
| Guided flow dla decydenta | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ✅ |
| Eksport PDF/plan | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Dostępność PL, bez integracji GIS | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| Koszt | Bezpłatny | Bezpłatny | Bezpłatny | Bezpłatny | $$$$ | $$$$ | TBD |

---

### 1.4 Luka rynkowa — pozycjonowanie Decerisa

Żadne z analizowanych narzędzi nie łączy jednocześnie:
- Polskich danych real-time (IMGW SHAPI)
- Modelowania hydrodynamicznego what-if
- Mapa jako centrum operacyjne (nie jako zakładka)
- Guided flow: alert → analiza → decyzja → plan → eksport
- Dostępność bez wiedzy GIS
- Kalkulacja zasobów (piasek, czas, ludzie)

**Deceris zajmuje niszę: operacyjne narzędzie decyzyjne dla polskich służb zarządzania kryzysowego, specjalizowane dla powodzi.**

---

## 2. Persony użytkowników

### Metodologia
Persony opracowano na podstawie:
- Ról zdefiniowanych w specyfikacji systemu (Operator, Analityk, Decydent)
- Struktury organizacyjnej IMGW-PIB i Wojewódzkich Centrów Zarządzania Kryzysowego
- Analogii do dokumentacji WebEOC i ESRI Emergency Management
- Przepływu decyzyjnego wymaganego przez Ustawę o zarządzaniu kryzysowym (Dz.U. 2022 poz. 261)

---

### Persona 1 — Operator systemu

---

**Marek Wiśniewski, 42 lata**  
*Specjalista ds. systemów pomiarowych, IMGW Oddział we Wrocławiu*

**Cytat:** „Jak spadnie deszcz na Sudetach, muszę już wiedzieć o tym zanim woda dotrze do Odry. Nie mam czasu uczyć się nowego narzędzia w środku nocy."

**Tło:**
Marek pracuje w IMGW od 17 lat. Zaczął jako technik terenowy przy wodomierzach, teraz odpowiada za konfigurację systemów alarmowych dla zlewni Odry. Ma głęboką wiedzę hydrologiczną, ale nie jest programistą. Zna PHP i Excel na poziomie zaawansowanym użytkownika. Pracuje w systemie zmianowym, często nocami.

**Cele:**
- Skonfigurować progi alarmowe tak, żeby system sam podnosił alert — bez fałszywych alarmów
- Mieć pewność, że kolejka powiadomień działa i dotrze do właściwych ludzi o właściwej porze
- Zdefiniować co system „rozumie" pod pojęciem zagrożenia powodziowego dla konkretnej rzeki
- Móc zmodyfikować parametry w 5 minut, gdy warunki się zmienią

**Frustracje:**
- Obecne systemy wymagają edycji plików konfiguracyjnych lub SQL — błąd = brak alertu
- Brak historii zmian konfiguracji — nie wiadomo kto i kiedy zmienił próg
- Fałszywe alarmy = "efekt wilka" — ludzie przestają reagować
- Nowe osoby w zespole potrzebują 2-3 tygodni żeby zrozumieć architekturę obecnych systemów
- Brak podglądu „co by się stało gdyby próg był inny" — testowanie na produkcji

**Zachowania:**
- Sprawdza status systemu rano zanim zacznie pracę (tablet przy kawie)
- Prowadzi własny arkusz Excel jako backup konfiguracji
- Preferuje email do dokumentacji zmian — „jak mnie nie będzie, musi być ślad"
- Testuje zmiany w piątek po południu, gdy obciążenie niskie

**Technologia:** Tablet Android służbowy, laptop Windows 10, Chrome, Excel, lokalny VPN IMGW

**Oczekiwania od Decerisa:**
- UI konfiguracji pipeline'ów — bez edycji kodu
- Walidacja konfiguracji przed zapisaniem
- Historia wersji z autorami
- Tryb testowy / sandbox na danych historycznych

**Priorytet w produkcie:** Wysoki dla onboardingu, niski dla codziennego użycia operacyjnego

---

### Persona 2 — Analityk (primary user)

---

**Katarzyna Nowak, 34 lata**  
*Analityk ds. zagrożeń hydrologicznych, Wojewódzkie Centrum Zarządzania Kryzysowego, Opole*

**Cytat:** „Decydent ma 20 minut na podjęcie decyzji o ewakuacji. Muszę mu dać w tym czasie coś więcej niż wykres. Muszę mu powiedzieć: zaleje te 4 ulice i szpital. I co możemy zrobić."

**Tło:**
Kasia ma magistra z hydrologii na Politechnice Wrocławskiej. Pracuje w WCZK od 6 lat. Jest podstawowym użytkownikiem systemu w czasie kryzysu — to ona interpretuje dane, uruchamia scenariusze, przygotowuje materiały dla Decydenta. Zna QGis, Python na poziomie skryptów, obsługuje ArcGIS Online (choć niechętnie ze względu na złożoność). W czasie powodzi pracuje 16-godzinne zmiany.

**Cele:**
- Szybko zrozumieć zasięg aktualnego zagrożenia i jego trajektorię
- Sprawdzić: co się stanie jeśli poziom wody wzrośnie o X% — zanim to nastąpi
- Ocenić: czy postawienie wału w tym miejscu ma sens fizycznie i logistycznie
- Przygotować materiał dla decydenta — czytelny, z odpowiedziami na konkretne pytania
- Móc porównać 2-3 scenariusze side-by-side, żeby rekomendacja była oparta na danych

**Frustracje:**
- Musi żonglować między 4 różnymi systemami (hydro.imgw, ISOK, QGis, Excel) — czas tracony na kopiowanie danych
- ArcGIS zbyt skomplikowany żeby działać szybko pod presją — zbyt dużo klikania do prostej operacji
- Predykcje IMGW pokazują tylko jeden scenariusz — brak rozwiązań co-jeśli
- Decydenci pytają „ile to kosztuje" — brak kalkulatora zasobów w żadnym narzędziu
- Raporty tworzone ręcznie w PowerPoint — 2 godziny pracy, które mogłyby być automatyczne

**Zachowania:**
- Otwiera 5-10 zakładek przeglądarki jednocześnie podczas incydentu
- Robi screenshoty z ISOK i wkleja do raportów Word
- Prowadzi notatnik Confluence z własnymi procedurami — "manual override" dla brakujących funkcji systemu
- W czasie spokoju próbuje tworzyć szablony na przyszłość

**Technologia:** MacBook Pro lub Windows laptop, 2 monitory podczas incydentu, Chrome, QGis, Excel, Confluence, Zoom

**Oczekiwania od Decerisa:**
- Mapa jako jedyne okno — koniec z przełączaniem narzędzi
- Uruchamianie scenariuszy klikając, nie kodując
- Rysowanie wału i natychmiastowy wynik kalkulacji
- Porównanie scenariuszy widoczne jednocześnie
- Automatyczny eksport raportu PDF z wybranymi sekcjami
- Współdzielenie sesji z kolegami i decydentem na żywo

**Priorytet w produkcie:** **Najwyższy** — primary user, codzienne użycie w kryzysie

---

### Persona 3 — Decydent

---

**Andrzej Kowalski, 54 lata**  
*Wojewoda / Dyrektor Wydziału Bezpieczeństwa i Zarządzania Kryzysowego*

**Cytat:** „Nie interesuje mnie poziom wody w centymetrach. Interesuje mnie: ile mam czasu, co muszę zrobić teraz i kogo to dotknie. Resztę zróbcie sami."

**Tło:**
Andrzej ma 25 lat w administracji publicznej. Przez kilka kadencji był wiceburmistrzem, teraz odpowiada za bezpieczeństwo na poziomie województwa. Ma naturalne zrozumienie procesów decyzyjnych i komunikacji kryzysowej, ale nie jest człowiekiem technicznym. Używa iPada i iPhone'a, komputer tylko do maili. Podejmuje decyzje pod ogromną presją czasu i mediów. Każda jego decyzja może być analizowana przez komisje śledcze — „audit trail" to dla niego nie feature, to konieczność.

**Cele:**
- Rozumieć sytuację w ciągu 2-3 minut od otwarcia systemu
- Dostać rekomendację z uzasadnieniem — nie surowe dane
- Wiedzieć co się stanie jeśli nie zrobi nic vs. co się stanie jeśli zrobi A lub B
- Zatwierdzić plan działań, który jest od razu gotowy do przekazania służbom
- Mieć dowód że decyzja była oparta na najlepszych dostępnych danych

**Frustracje:**
- Obecne raporty (PDF od analityków) dochodzą za późno lub są zbyt techniczne
- Musi zaufać analitykowi na słowo — brak możliwości samodzielnej weryfikacji
- Brak standardowego formatu raportu powoduje chaos przy rotacji pracowników
- Po zakończeniu kryzysu: żmudna rekonstrukcja timeline'u decyzji dla komisji
- Nie może sprawdzić postępu działań w terenie — brak statusu wykonania zadań

**Zachowania:**
- Dostęp do systemu głównie przez tablet lub telefon
- Pyta analityka o streszczenie, potem patrzy na mapę
- Zatwierdza dokumenty przez podpis elektroniczny — wymaga formalnego flow
- Po incydencie pisze notatki służbowe — potrzebuje daty/godziny każdej decyzji

**Technologia:** iPad Pro, iPhone, minimum komputera, preferuje proste UI z dużymi elementami

**Oczekiwania od Decerisa:**
- Dashboard z jednym widokiem — stan zagrożenia, kluczowe wskaźniki, rekomendacja
- Porównanie scenariuszy w formie: „opcja A vs opcja B — co zyskujesz, co ryzykujesz"
- Przycisk „Zatwierdź plan" — formalny akt zatwierdzenia z timestampem
- Raport decyzyjny generowany automatycznie po zatwierdzeniu
- Widok mobilny pierwszoklasowy

**Priorytet w produkcie:** Wysoki — to jego akceptacja warunkuje wdrożenie systemu w urzędzie

---

### Persona 4 — Administrator IT (secondary)

---

**Piotr Zając, 38 lat**  
*Administrator systemów informatycznych, Urząd Wojewódzki*

**Cytat:** „Jeśli to nie działa na naszym serwerze w sieci wewnętrznej i nie mam pełnej kontroli nad danymi, to nie wchodzi."

**Tło:**
Piotr odpowiada za infrastrukturę IT całego urzędu. Jest strażnikiem bezpieczeństwa i compliance — każdy nowy system musi przejść przez niego. Ma świetną wiedzę techniczną (Linux, Docker, sieci), ale presja bezpieczeństwa danych publicznych sprawia, że jest naturalnie konserwatywny wobec nowych rozwiązań, szczególnie SaaS.

**Cele:**
- Wdrożyć system w kontrolowanym środowisku (on-premise lub prywatna chmura)
- Mieć pełen audit log dostępów i operacji
- Zapewnić zgodność z RODO i krajowymi regulacjami bezpieczeństwa
- Minimum pracy serwisowej po wdrożeniu
- Jasna ścieżka aktualizacji i wsparcia

**Frustracje:**
- Systemy SaaS z danymi wrażliwymi w chmurze publicznej — problem RODO
- Brak dokumentacji technicznej do wdrożenia
- Vendor lock-in bez SLA na krytyczne systemy
- Brak możliwości konfiguracji SSO / integracji z Active Directory urzędu

**Oczekiwania od Decerisa:**
- Docker / on-premise deployment option
- REST API z pełną dokumentacją
- Integracja z AD/LDAP (SSO)
- Pełny audit log
- Dokumentacja bezpieczeństwa zgodna z wymogami KRI

**Priorytet w produkcie:** Krytyczny dla wdrożenia — bloker jeśli niezaspokojony

---

### Persona 5 — Terenowy koordynator (tertiary, future)

---

**Tomasz Baran, 29 lat**  
*Starszy specjalista, Straż Pożarna PSP / koordynator ewakuacji*

**Cytat:** „Dostaję zadanie: ewakuuj ulicę X. Chcę wiedzieć: ile czasu mam, ile tam jest ludzi i czy mam do nich dojazd."

**Tło:**
Tomasz działa w terenie podczas powodzi. Nie ma czasu na analizę — potrzebuje konkretnych informacji operacyjnych. Używa telefonu, często w złych warunkach sieciowych.

**Cele:**
- Wiedzieć dokładnie jaki jest stan zagrożenia w swoim rejonie
- Dostać zadania z priorytetem i deadline'em
- Raportować wykonanie do centrum

**Oczekiwania od Decerisa:**
- Widok mobilny z wyłącznie swoimi zadaniami
- Offline mode (dane ostatnio zsynchronizowane)
- Prosta aktualizacja statusu zadania (3 kliknięcia max)

**Priorytet w produkcie:** Niski dla MVP, wysoki dla wersji 2.0

---

## 3. Mapa ról a przepływ decyzyjny

```
OPERATOR                    ANALITYK                    DECYDENT
(konfiguracja)              (analiza)                   (zatwierdzenie)
     │                           │                            │
     │ Konfiguruje               │ Monitoruje                 │
     │ pipeline'y,               │ real-time,                 │
     │ progi,                    │ uruchamia                  │
     │ severity levels           │ scenariusze what-if        │
     │                           │                            │
     └──── przed kryzysem ───────┘                            │
                                 │                            │
                         [ALERT TRIGGERED]                    │
                                 │                            │
                         Analityk tworzy ──────────────────▶ Decydent
                         bazowy scenariusz                   przegląda
                         + what-if                          porównanie
                                 │                            │
                         Analityk rysuje     ◀────────────── Decydent
                         wał / modyfikuje                    zadaje pytania
                         parametry                           / żąda wariantu
                                 │                            │
                         Analityk eksportuje ──────────────▶ Decydent
                         propozycję planu                    ZATWIERDZA
                                 │                            │
                                 └──────────┬─────────────────┘
                                            │
                                     Plan działań
                                     → Piotr (IT): audit log
                                     → Tomasz (teren): zadania
                                     → PDF / interaktywny widok
```

---

## 4. Priorytetyzacja wymagań według person

| Wymaganie | Marek (Op) | Kasia (An) | Andrzej (Dec) | Piotr (IT) | Tomasz (Ter) |
|-----------|-----------|-----------|--------------|-----------|-------------|
| Real-time mapa z alertami | ⚠️ | ✅✅ | ✅✅ | — | ✅ |
| Konfiguracja pipeline bez kodu | ✅✅ | — | — | ✅ | — |
| Scenariusze what-if | — | ✅✅ | ✅ | — | — |
| Rysowanie wału | — | ✅✅ | ✅ | — | — |
| Kalkulacja zasobów | — | ✅✅ | ✅✅ | — | — |
| Guided flow 5 kroków | — | ✅ | ✅✅ | — | — |
| Porównanie scenariuszy | — | ✅✅ | ✅✅ | — | — |
| Zatwierdzenie planu (audit) | ⚠️ | ✅ | ✅✅ | ✅✅ | — |
| Eksport PDF | — | ✅✅ | ✅✅ | — | — |
| Widok mobilny | — | ⚠️ | ✅✅ | — | ✅✅ |
| On-premise / Docker | — | — | — | ✅✅ | — |
| SSO / Active Directory | — | — | — | ✅✅ | — |
| Zadania terenowe | — | ✅ | ✅ | — | ✅✅ |
| Historia decyzji | ✅ | ✅ | ✅✅ | ✅✅ | — |

**Legenda:** ✅✅ krytyczne · ✅ ważne · ⚠️ mile widziane · — nie dotyczy

---

## 5. Kluczowe wnioski dla designu

1. **Kasia (Analityk) jest primary user** — UX i szybkość pracy pod presją są priorytetem #1. Każde zbędne kliknięcie kosztuje ją w kryzysie.

2. **Andrzej (Decydent) jest decydentem zakupowym** — to on zatwierdza wdrożenie systemu w organizacji. Jeśli nie rozumie lub nie ufa — nikt nie kupuje. Potrzebuje prostoty i poczucia kontroli, nie funkcji. „Trust through transparency."

3. **Piotr (IT) to cichy bloker** — nawet najlepszy produkt nie wejdzie bez spełnienia wymagań IT. On-premise lub EU-compliant cloud + SSO to MVP-breaker.

4. **Marek (Operator) działa przed kryzysem** — onboarding i konfiguracja muszą być bezpieczne (walidacja, sandbox). Używa systemu rzadko, więc UI musi być intuicyjne po dłuższej przerwie.

5. **„Mapa nigdy nie znika"** — potwierdzone przez Kasię i Andrzeja. Każdy kontekst analizy i decyzji musi być zakorzeniony przestrzennie.

6. **Czas jest zasobem krytycznym** — Kasia pracuje 16h zmianami, Andrzej ma 20 minut na decyzję. System musi być szybszy niż Excel+PowerPoint (obecne narzędzie).

7. **Audit trail to bezpieczeństwo prawne** — zarówno Andrzej jak i Piotr potrzebują śladów decyzji. To nie UX feature — to wymóg prawny dla administracji publicznej.
