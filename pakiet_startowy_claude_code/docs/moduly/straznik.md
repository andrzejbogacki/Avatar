# Moduł: Strażnik GPS
- **id:** straznik
- **adres_rejestr:** modul.straznik — kandydat (`rejestr.json` nie istnieje w repozytorium)
- **ścieżka:** backend/modules/straznik/
- **status:** piaskownica
- **wersja:** ADR-011 punkty 2.2, 2.3, 2.7; kod: geometria planszy i detektor przekroczenia granicy, 2026-09-08 (59 testów pass)

## 3 — ZASILANIE (cel i intencja)
- Rozstrzyga obecność ciałem w granicach planszy fizycznej: wewnątrz albo na zewnątrz. Nie ustala pozycji — ograniczona precyzja jest decyzją, nie usterką (ADR-011 punkt 1).
- Blokuje integrację modułu bayo; pierwsza pozycja w kolejności rozwoju.
- Pojęcia glosariusza: brak. `Strażnik GPS`, `plansza`, `kształt`, `bufor planszy`, `obecność ciałem` — TERMIN-KANDYDAT, zgłoszone do Toru glosariusza. W glosariuszu istnieje wyłącznie „Strażnik Kontekstu" — inne pojęcie, nie mylić.
- Pozycja systemowa: **3** (impuls — obliczenie). Docelowe wykonanie: urządzenie Awatara (ADR-011 2.1), nie węzeł.

## 6 — FORMA (struktura i interfejsy)
- **Struktura (stan zapisany):**
  - `config/index.js` — elipsoida WGS84 (`POLOS_WIELKA_M`, `SPLASZCZENIE_ODWROTNE`), wyliczony `ZIEMIA.PROMIEN_SREDNI_M` (R1 = (2a+b)/3 wg IUGG), `ZAKRESY` współrzędnych, `TYPY_KSZTALTU`. Jedyne źródło stałych.
  - `src/geometria/wspolrzedne.js` — `sprawdzWspolrzedne(punkt, nazwa)`; wspólna walidacja obu typów.
  - `src/geometria/okrag.js` — `odlegloscMetry(a, b)` (haversine na kuli, metry), `czyWewnatrzOkregu(punkt, ksztalt)`.
  - `src/geometria/wielokat.js` — `czyWewnatrzWielokata(punkt, ksztalt)` (test przecięć promienia, przedział półotwarty po szerokości) oraz `odlegloscOdWielokata` (odległość do najbliższej krawędzi, rzut na płaszczyznę lokalną).
  - `src/geometria/index.js` — fasada `czyWewnatrzKsztaltu`, `odlegloscOdKsztaltu`, `czyWewnatrzZBuforem`; kierowanie po polu `typ`.
  - `src/obecnosc/stan.js` — `wykryjZmianeStanu(stan_poprzedni, punkt, ksztalt, nastawy)`; przekroczenie granicy z ADR-011 2.2 i 2.7.
  - `src/obecnosc/index.js` — fasada obecności.
  - `index.js` — kontrakt modułu: `{ konfig, geometria, obecnosc }`. `test/geometria.test.js`, `test/obecnosc.test.js`, `README.md`.
- **Kontrakty wejścia:**
  - Punkt: `{ szerokosc_geo, dlugosc_geo }` w stopniach dziesiętnych, WGS84.
  - Kształt okrągły: `{ typ: 'okrag', srodek: {…}, promien_m }`.
  - Kształt wielokątny: `{ typ: 'wielokat', wierzcholki: [{…}, …] }`, co najmniej 3 wierzchołki.
  - Nastawy planszy: `{ bufor_m, zrodlo_dowodu }` — obie wartości obowiązkowe, bez domyślnych.
  - Stan poprzedni: `'obecny'` albo `'duch'`. Trzeciej wartości nie ma (Ziarno v13 punkt 2.3).
- **Kontrakty wyjścia:**
  - geometria: wartość logiczna (wewnątrz/na zewnątrz) albo odległość w metrach ze znakiem — ujemna wewnątrz, dodatnia na zewnątrz, zero na granicy.
  - obecność: `{ stan, meldunek }`, gdzie `meldunek` to `null` przy braku zmiany albo `{ stan, zrodlo_dowodu }`. Meldunek nie niesie współrzędnych ani czasu — test tego pilnuje.
  - Współrzędne nie opuszczają modułu w żadnej postaci; nie ma kanału, którym mogłyby wyjść.
- **Zależności zewnętrzne:** brak. Funkcje czyste, bez stanu, bez wejścia/wyjścia, bez zegara. Zegara nie będzie: chwilę rozstrzygającą nadaje węzeł (ADR-012 punkt 7). Przenośne na urządzenie bez przepisywania, gdy powstanie `frontend/`.
- **Dane i stałe:** wyłącznie `config/`. Zakaz magic numbers utrzymany — promień Ziemi jest wyliczany z dwóch stałych elipsoidy, nie wpisany.

## 9 — REGULACJA (kontrola i stan)
- **Walidacje i warunki brzegowe:**
  - Współrzędna nieliczbowa lub poza zakresem → `TypeError` / `RangeError`. Brak wartości domyślnych.
  - `promien_m` niedodatni lub brakujący → odrzucenie.
  - Mniej niż 3 wierzchołki → odrzucenie.
  - Rozpiętość długości geograficznej wielokąta powyżej 180° → odrzucenie jawnym błędem. Plansza nie może przecinać południka 180° ani obejmować bieguna (ADR-011 2.3); zamiast cichego złego werdyktu moduł zgłasza blokadę. ADR umieszcza odmowę przy zamrożeniu kształtu — zamrożenie nie jest zbudowane, więc dziś odmowa pada przy teście przynależności.
  - Kształt bez pola `typ` albo z typem trzecim → odrzucenie. Typ nie jest zgadywany z zestawu pól.
  - Granica należy do zewnętrza — oba typy, wprost z ADR-011 2.3. Punkt na krawędzi i w wierzchołku wielokąta jest na zewnątrz tak samo jak punkt w odległości równej promieniowi okręgu. Kanon, nie wniosek z analogii. Przy buforze 0 reguła obowiązuje bez zmian.
  - `bufor_m` nieliczbowy, brakujący albo ujemny → odrzucenie. Bufor dokłada się na zewnątrz figury (ADR-011 2.4), więc wartość ujemna nie istnieje.
  - `zrodlo_dowodu` spoza trzech wartości albo brakujące → odrzucenie. „opaska" nie jest wartością tego pola (ADR-011 2.10).
  - `stan_poprzedni` spoza dwóch wartości albo brakujący → odrzucenie. Stan nie jest zgadywany z pozycji.
- **Punkty otwarte:**
  - O1: **ZAMKNIĘTY 08.09.2026** — punkt na krawędzi i w wierzchołku wielokąta jest na zewnątrz. Ta sama reguła co dla okręgu, kanon ADR-011 2.3. Wniosek logiczny zniknął z kodu.
  - O2: **ZAMKNIĘTY 08.09.2026** — plansza nie może przecinać południka 180° ani obejmować bieguna. Taki kształt jest odrzucany jawnym błędem; wpisane do alternatyw odrzuconych ADR-011.
  - O3: **ZAMKNIĘTY 08.09.2026** — odległość po kuli, promień z WGS84 wzorem IUGG, jest kanonem. Błąd względny do 0,5% wobec elipsoidy (5 m przy promieniu 1 000 m) przyjęty świadomie jako mniejszy od zgrubności celowej; wpisane do konsekwencji ADR-011.
  - O4: `rejestr.json` nie istnieje, więc `modul.straznik` pozostaje adresem-kandydatem. **Otwarty.** Ziarno v13 punkt 2.2 nadaje temu modułowi adres `modul.straznik.gps` — kolizja z zapisem tego dokumentu i mapy projektu, do rozstrzygnięcia przy zasilaniu rejestru.
  - O5: odległość od krawędzi wielokąta liczona na płaszczyźnie lokalnej (rzut z cosinusem szerokości). Przy planszach kilometrowych błąd rzędu metrów; przy kształtach o rozpiętości dziesiątek stopni rośnie. Do potwierdzenia, że mieści się w zgrubności celowej. **Otwarty.**
  - Uwaga o numeracji: O1–O4 to numeracja tego dokumentu. Punkty otwarte O1–O9 w ADR-011 dotyczą czego innego i się z nią nie mieszają.
- **Decyzje:** ADR-011 (Strażnik GPS) — punkt 2.3. ADR-001 (stos Node.js).
- **Historia zmian:**
  - 2026-09-08 — Krok 0: lokalizacja i układ plików, wariant B (moduł o szkielecie minimalnym) — zatwierdzony przez Suwerena.
  - 2026-09-08 — jednostka i model: metry, odległość po kuli, promień średni ze stałej w `config/` — rozstrzygnięcie Suwerena; zgrubność uznana za kanon ADR-011, nie za naruszenie zakazu algorytmów przybliżonych (ten dotyczy efemeryd).
  - 2026-09-08 — implementacja punktu 2.3: dwa testy geometryczne jako funkcje czyste, cyklem test-first. 31 testów pass; pełny backend 261 testów, 260 pass, 1 skip (wcześniejszy, QAC).
  - 2026-09-08 — rozstrzygnięcia Suwerena O1, O2, O3 wpisane do ADR-011 punkt 2.3, do alternatyw odrzuconych i do konsekwencji. Zachowanie kodu bez zmian — reguły już w nim stały; zmieniło się ich źródło: kanon zamiast wniosku logicznego. Dołożony test kształtu obejmującego biegun: 32 testy pass, pełny backend 262 testy, 261 pass, 1 skip.
  - 2026-09-08 — punkt 2.2, zakres zatwierdzony przez Suwerena: sam detektor przekroczenia granicy, bez bezpiecznika ciszy sprzętu. Układ plików wariant B (dwa pliki w `src/obecnosc/`, stałe w istniejącym `config/`). Bufor planszy wariant A: geometria uczy się odległości od kształtu, bufor zostaje osobnym polem zgodnie z ADR-011 2.4. Dwa cykle test-first; jeden test poprawiony przed implementacją, bo mierzył dokładność modelu zamiast reguły. Moduł 59 testów pass (44 geometria, 15 obecność), pełny backend 289 testów, 288 pass, 1 skip (wcześniejszy, QAC).
