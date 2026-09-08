# ZIARNO TRANSFERU v13
**FRAZA KONTROLNA: KAŁAMARZ-OLIWIN-08-ZASUWA**
Źródło: wątek wyrosły z Ziarna Transferu v12 (fraza MODRZEW-SZAFRAN-63-BRODZIK).
Powód zamknięcia: papiery Strażnika GPS zamknięte, trzy pliki wytworzone.
Zakres wątku: ADR-011, założenie `rejestr.json`, dokument modułu Strażnik GPS.
Data: 27.08.2026
Panel: 13
---
## 1. WYTWORZONE W TYM WĄTKU — DO WGRANIA
Trzy pliki czekają na wgranie przez Claude Code. **Bez wgrania praca przepada.**
| Plik | Miejsce docelowe |
|---|---|
| `ADR-011-straznik-gps.md` | `pakiet_startowy_claude_code/docs/adr/` |
| `rejestr.json` | korzeń dokumentacji (źródło prawdy adresacji) |
| `straznik-gps.md` | `pakiet_startowy_claude_code/docs/moduly/` |
**Zadanie towarzyszące dla Claude Code:** po wgraniu rejestru adresy kandydackie
znikają z kodu. W `backend/modules/qac/config/rejestr.js` `STATUS_ADRESU`
przestaje być kandydatem; w `mapa_projektu.json` dopisek „(kandydat)" schodzi
z siedmiu wpisów modułów. Od tej chwili adres modułu żyje w jednym miejscu.
---
## 2. ZATWIERDZONE W TYM WĄTKU
### 2.1 ADR-011 — Strażnik GPS
Numer nadany chronologicznie, jako następny wolny. ADR-010 pozostaje
zarezerwowany dla Rezonatora Kwantowego, wciąż niespisany. Trzy ADR-y
z kolejki (Quantum Log, Strażnik Relacji, Mission Control) nie mają
zarezerwowanych numerów — dostaną kolejne wolne w chwili spisania.
Treść: dziesięć punktów, przeniesienie rozstrzygnięć Ziarna v12 do formy
kanonicznej. Punkt dziesiąty — struktura planszy, czyli kształt osobno,
atrakcje osobno — wszedł do ADR-011 decyzją Suwerena, zamiast osobnego ADR-u.
### 2.2 rejestr.json — założony
**Kształt: lista grupowana po rootach.** Dziewięć szuflad odpowiadających
dziewięciu rootom, w każdej płaska lista rekordów.
Powód wyboru: dziewiątka rootów przestaje być umową w dokumencie i staje się
budową pliku — dziesiąta szuflada jest widoczna natychmiast. Reguła „czwarty
element sygnalizuje błąd" dostaje strukturę, w której działa. Podwojenie roota
(nazwa szuflady plus prefiks adresu) daje darmową kontrolę spójności; walidacja
wpisana i przechodzi.
Odrzucone: drzewo zagnieżdżone (miesza pola rodzica z gałęzią dzieci, wymusza
rekurencję w każdym narzędziu, nieczytelne przy porównaniu wersji); płaska lista
bez szuflad (dziewiątka rootów bez oparcia w strukturze).
**Zakres pierwszego zasilenia: cały root `modul`, dziewięć adresów.**
```
modul.auth            Auth                          ADR-002
modul.dokumentacja    Dokumentacja                  ADR-007
modul.glosariusz      Glosariusz                    ADR-006
modul.ps              Protokół Suwerenności         ADR-003
modul.qac             Quantum Avatar Core           ADR-009
modul.qac.qrt         Quantum Rectification Tool    ADR-009
modul.rezonator       Rezonator Kwantowy            ADR-005
modul.straznik.gps    Strażnik GPS                  ADR-011
modul.wymiennik       Wymiennik (Gebo)              ADR-004
```
Kolejność zasilania z konwencji (`jakosc` → `token` → `symulacja` → `modul` → …)
świadomie przeskoczona o trzy pozycje. Uzasadnienie: kolejność ma znaczyć
zależność, a nic w module nie potrzebuje wcześniejszego istnienia jakości,
tokena ani symulacji. **Zastrzeżenie jawne: to interpretacja logiczna —
w dokumentach nie ma zapisanego uzasadnienia tej kolejności.**
**Kolizja rozstrzygnięta: adres Rezonatora Kwantowego = `modul.rezonator`.**
ADR-010 rezerwował skrót QR w mowie i dokumentach; adres w rejestrze to inna
sprawa — ma prowadzić do kodu i pokrywać się ze ścieżką. Wsadzenie `qr` do
adresacji przywracałoby w kodzie dwuznaczność, którą ADR-010 usuwał z mowy.
**Zastrzeżenie: ADR-010 nie istnieje w repozytorium (są numery 001–009),
brzmienia nie dało się odczytać.** Jeśli ADR-010 mówi wprost o adresie,
rejestr jest z nim sprzeczny i wymaga nadpisania nowym ADR-em.
**KOREKTA WŁASNA:** zaproponowałem pole `status` o wartościach „kandydat" /
„obowiązujący". Błąd — kanon mówi, że byt bez adresu jest kandydatem, więc sama
obecność w rejestrze oznacza adres nadany. Pole `status` niesie status
artefaktu: `piaskownica` albo `zamrożony_vN`.
**Rekord ma sześć pól:** `adres`, `nazwa`, `opis`, `status`, `adr`, `data`.
**Poza rejestrem świadomie:** bayo, Quantum Log, Mission Control — brak kodu
i brak ADR-u. Wracają, gdy dostaną ADR. Mission Control dodatkowo czeka na
polski identyfikator bez ogonków.
### 2.3 Dokument modułu Strażnik GPS
Spisany według szablonu 3·6·9. Sekcje: zasilanie, forma, regulacja.
**Kontrakt ma trzy elementy, nie dwa.** Dwie funkcje odpowiadają na pytanie
zadane z zewnątrz; trzeci element mówi sam z siebie. Bez trzeciego moduł nie
realizowałby własnej decyzji z Ziarna v12 (ogłoszenie podstawą, odpytywanie
wyjątkiem).
**Rozstrzygnięcie: `stanAwatara` zwraca dokładnie dwie wartości.**
Awatar, który nigdy się na tej planszy nie zameldował, zwraca `duch` — tak samo
jak uczestnik po rozładowaniu telefonu. Trzeciej wartości nie ma.
Skutek do kanonu: **Strażnik GPS odpowiada wyłącznie na pytanie „czy ten Awatar
potwierdza teraz obecność", nigdy na „czy ten Awatar należy do gry".** Listę
uczestników prowadzi gra. Zysk uboczny: zapytanie o obcego nie ujawnia, czy ten
ktoś w grze w ogóle istnieje.
**Rozstrzygnięcie: `zameldowaniNaPlanszy` zwraca listę surową.**
Strażnik GPS nie przycina jej według widoczności — nie zna zasad relacji i nie ma
ich znać. Przycięcie należy do wywołującego, na zasadach Protokołu Relacji.
Powód: kanon „moduł transportowy przenosi, nigdy nie interpretuje". Gdyby
Strażnik GPS przycinał sam, zmiana zasad relacji wymuszałaby zmianę Strażnika
GPS — dwa moduły zrośnięte w jeden.
**Cena nazwana jawnie:** dopóki Protokół Relacji jest atrapą odpowiadającą
„dozwolony" każdemu, lista surowa jest jawna dla wszystkiego, co ją pobierze.
Zapisane jako punkt otwarty O1.
Wariant „sama liczba obecnych" odrzucony — odracza sprawę, bo gra i tak
potrzebuje tożsamości uczestników.
### 2.4 Glosariusz — zadanie odesłane
Siedmiu pojęć Strażnika GPS **nie kanonizowano w tym wątku**. Glosariusz ma
własny wątek (ostatnia sesja: „Glosariusz 5.4", fraza WAPIEŃ-TURKUS-29-ŻAGIEL,
plik roboczy z 75 rekordami, własna kolejka zaległości).
Powód: tam obowiązuje tryb dwufazowy z osobnym zatwierdzaniem wprowadzenia
i rozszerzenia oraz kontrola kolizji nazw. Wejście z boku rozjechałoby plik
roboczy — źródłem prawdy jest ostatni glosariusz z tamtej sesji, nie kopia
z wiedzy projektu.
**Kolejka do wzięcia w wątku glosariusza** (definicje robocze gotowe w Ziarnie
v12 §3): Źródło dowodu obecności, Bufor planszy, Kształt podpisany, Nadajnik
planszy, Błąd uproszczenia, Odcisk planszy, Wskazanie.
### 2.5 Blokada zdjęta
Szablon ADR z `pakiet_startowy_claude_code/docs/adr/ADR-000-szablon.md`
odczytany. **Blokada figurująca od Ziarna v10 przestaje obowiązywać.**
Wzorzec dostępu potwierdzony w działaniu: pobranie archiwum z codeload,
rozpakowanie, odczyt lokalny. Repozytorium publiczne, bez uwierzytelniania.
Szablon ADR ma pięć części: nagłówek (data, status, decydent), Kontekst,
Decyzja, Alternatywy odrzucone, Konsekwencje. Decyzja formułowana rozkazująco.
**Szablon modułu** (`docs/moduly/SZABLON_MODULU.md`) odwzorowuje matrycę 3·6·9:
3 = zasilanie (cel, pojęcia glosariusza, pozycja w matrycy), 6 = forma
(struktura katalogów, kontrakty wejścia i wyjścia, zależności zewnętrzne wraz
z zachowaniem przy ich braku), 9 = regulacja (walidacje, punkty otwarte
numerowane, odnośniki ADR, historia zmian).
**Definicja ukończenia modułu** (z ARCHITEKTURA.md) wymaga pięciu rzeczy: kod,
README w katalogu modułu, dokument w `docs/moduly/`, wpis w `mapa_projektu.json`,
adres w `rejestr.json`.
---
## 3. PUNKTY OTWARTE STRAŻNIKA GPS — NUMERACJA KANONICZNA
Numeracja O1–O9 zapisana w dokumencie modułu. **Tej numeracji trzymamy się dalej.**
| Nr | Sprawa | Rodzaj |
|---|---|---|
| **O1** | przycinanie listy obecnych po stronie wywołującego | czeka na Protokół Relacji |
| **O2** | ważność podpisu kształtu po rotacji klucza właściciela | decyzja przy stole; trzy warianty: bezterminowa / traci przy rotacji / ważna do daty kompromitacji |
| **O3** | kto podpisuje unieważnienie klucza | kandydat: krąg poręczycieli; weryfikacja możliwa — repozytorium dostępne |
| **O4** | czy klucze Awatara nadają się do podpisywania kształtów | weryfikacja możliwa — repozytorium dostępne, moduły Auth i Protokół Suwerenności nieprzejrzane |
| **O5** | reprezentacja geometrii w kodzie (okrąg, wielokąt) | decyzja przy stole |
| **O6** | wartość skróconego okna wygaszenia | **nie decyzja — zadanie testowe**, parametr planszy |
| **O7** | padnięcie telefonu: gasi meldunek czy zsuwa o poziom niżej | decyzja przy stole |
| **O8** | opaska bez telefonu: meldunek tak, uprawnienia nie | decyzja przy stole |
| **O9** | telefon-świadek; konflikt „telefon wyłącznie nasłuchuje" a świadkowanie | odłożony za Protokół Relacji |
**Cztery decyzje możliwe natychmiast: O2, O5, O7, O8.**
**Dwie weryfikacje możliwe natychmiast: O3, O4** (blokada z v12 mogła zniknąć).
---
## 4. STAN STRAŻNIKA GPS
**Papiery:** ADR — zrobiony. Rejestr — zrobiony. Glosariusz — odesłany do
własnego wątku.
**Kod — do napisania przez Claude Code z dokumentu modułu:**
- trzy elementy kontraktu (dwie funkcje plus ogłoszenie zmiany stanu)
- weryfikacja podpisu kształtu
- sprawdzenie punktu w kształcie (figura plus bufor)
- odcisk kształtu
- nasłuch rozgłoszeń Bluetooth
- trzy liczniki: odświeżanie ~1 h, okno wyjścia ~5 min (parametr planszy),
  utrata sygnału 2 h
- wymiana atrapy, z którą rozmawia bayo
**Blokada techniczna trwająca:** bayo leży poza repozytorium `Avatar-Projekt`.
Kształtu atrapy nie da się odczytać z tego poziomu, więc zgodność kontraktu
z oczekiwaniem bayo jest niesprawdzona.
**Test:**
- tryb obserwacji na jednej planszy (cel: wartość z O6)
- rozgłaszanie i odbiór Bluetooth przy zgaszonym ekranie na iPhone
- zużycie baterii przy nasłuchu trwającym całą grę, nie tylko misję
---
## 5. OTWARTE — PRZENIESIONE Z v12, NIERUSZONE
| Punkt | Stan |
|---|---|
| Kolizja rotacji po odzyskaniu | okno 3 dni chroni Awatara przed napastnikiem, ale przy koncie przejętym chroni napastnika przed Awatarem |
| ZNACZNIK TESTOWY: procedura odzyskania + rotacja kręgu | kanon przyjęty logicznie, niesprawdzony w działaniu |
| ADR: Quantum Log, Strażnik Relacji, Mission Control | trzy w kolejce, numery nadawane przy spisaniu |
| ADR-010 (Rezonator Kwantowy) | zdecydowany, niespisany, nieobecny w repozytorium |
| Co uruchamia tryb czujności Bluetooth | automat / człowiek / parametr Awatara |
| Czy spacer rezonansowy wymaga planszy | tak / nie / parametr Awatara |
| Nadpisywanie pól szablonu — zakres domyślny | brak reguły domyślnej |
| Certyfikacja Protokołu Suwerenności przy klonowaniu | czy klon może obejść wymóg poświadczonych jakości |
| Wspólny zegar dla soundtracku | kandydat: silnik astronomiczny QAC. Interpretacja, nie ustalenie |
| Źródło dźwięku | pliki Awatara / częstotliwości Rezonatora Kwantowego / usługa zewnętrzna |
| Rezonator Kwantowy: odtwarzanie na żądanie innego modułu | **[BRAK DANYCH]** |
| Cztery zachowania Mission Control | faza przygotowania, widoczny postęp, kierunek i odległość, omówienie po powrocie |
| Przewóz rzeczy przez jadącego | wymiennik w ruchu |
| Wpisy do Mapy 3·6·9 | trzy triady z v11 czekają na weryfikację; dwie dziewiątki wymagają sprawdzenia |
| Nazwa Mission Control w kodzie | polski identyfikator bez ogonków |
| Podłączenie bayo do sieci kratowej | brak decyzji kierunkowej |
| Misja etapu w Fight.Club | czeka na definicję z Mission Control |
| QAC4: O7, O8, weryfikacja `noaa_swpc.js` | osobny wątek `Transfer_QAC4_O7_O8.md` |
| Rejestr zmian listy atrakcji | struktura niezaprojektowana |
| Imię właściciela planszy a Master Fader | ta sama kolizja co rodowód szablonów; rozstrzygnięcie musi być jedno dla obu |
| Czy plansza może wrócić do piaskownicy | rekomendacja: nie. Formalnie niezatwierdzone |
| Nadajnik niosący numer wersji kształtu | po zamrożeniu kształtu wersja jest jedna — do przemyślenia, czy nadal potrzebne |
| `modul.dziennik.quantum_log` do rejestru | czeka na ADR Quantum Log |
---
## 6. ZASADY POTWIERDZONE
**Nowe w v13:**
- **Obecność w rejestrze oznacza adres nadany.** Status w rekordzie niesie stan
  artefaktu, nie stan adresu.
- **Adres kanoniczny prowadzi do kodu.** Skrót zarezerwowany w mowie nie
  przenosi się automatycznie na adresację.
- **Strażnik GPS odpowiada na pytanie o potwierdzenie obecności, nigdy
  o przynależność do gry.**
- **Moduł nie zna zasad, których nie jest właścicielem.** Widoczność należy do
  Protokołu Relacji, więc Strażnik GPS oddaje surowo.
- **Kontrakt modułu ma tyle elementów, ile ról komunikacji** — pytanie z zewnątrz
  i mówienie z siebie to dwie różne role.
- **Blokada techniczna jest stanem, nie wyrokiem.** Podlega ponownemu
  sprawdzeniu przy każdym wątku, w którym zmieniły się narzędzia.
**W mocy z v8–v12:**
- Automat wykonuje wolę — nie zastępuje jej.
- Kolejność wyznacza zależność, nie ważność.
- Awatar liczy sam, ale nie na własnych danych.
- Podpis czyni transport nieistotnym.
- Pod podpisem jest wszystko, czego zmiana daje napastnikowi przewagę.
- Unieważnienie bije wersję.
- Trwałe osobno, zmienne osobno.
- Siła meldunku zależy od źródła dowodu planszy, nie od Strażnika GPS.
- Świadek wart tyle, ile jego kotwica, minus jeden poziom.
- System nie dowiaduje się, że wyszedłeś — dowiaduje się, że przestałeś
  potwierdzać.
- Żadna rola nie może zatrzymać gry swoim milczeniem.
- Terminal potwierdza obecność, nie daje dostępu.
- Brak odpowiedzi to cisza, nie błąd.
- Puste pole to informacja, nie brak.
- Weryfikuje się człowieka, nie jego sprzęt.
- Moduł transportowy przenosi, nigdy nie interpretuje.
- Zakaz konfabulacji: nieznany parametr = stop, decyzja do Suwerena.
---
## 7. OBSERWACJA KOMUNIKACJI — TEN WĄTEK
Pięć tarć, wspólna przyczyna jedna: pisanie skrótami dla siebie zamiast dla
odbiorcy, przy założeniu, że kontekst dokumentu jest u Andrzeja tak samo
dostępny jak w kontekście modelu.
- dwukrotna prośba o ponowne wyświetlenie opcji wyboru
- prośba o prostszy język przy wyborze kształtu rejestru
- dwukrotna prośba o rekomendację, której nie podałem z siebie
- zapytanie „nad czym pracujemy" — brak drogowskazu przy przejściu z papierów
  do kontraktu, przy jednoczesnym skróceniu nazwy „Protokół Relacji", co zlało
  się z nazwą „Strażnik Relacji"
**Zapisane do pamięci jako reguła obowiązująca wszystkie tematy:** pełne nazwy
bytów zawsze; jedno zdanie drogowskazu przed każdym pytaniem decyzyjnym;
rekomendacja podawana domyślnie wraz z opcjami.
Trafienia: decyzje przyjmowane jednym słowem bez korekt tam, gdzie moduł
zawierał drogowskaz i rekomendację.
---
## 8. NASTĘPNA POZYCJA
Kolejność rozwoju bez zmian. Strażnik GPS zamknięty na poziomie papierów.
**Do wyboru na starcie następnego wątku:**
1. weryfikacja kluczy Awatara w repozytorium — zdejmuje O3 i O4
2. cztery decyzje przy stole — O2, O5, O7, O8
3. Protokół Relacji jako kod — pozycja druga w kolejności rozwoju
---
## 9. PLIKI WYGENEROWANE W TYM WĄTKU
- `ADR-011-straznik-gps.md`
- `rejestr.json`
- `straznik-gps.md`
- `Ziarno_Transferu_v13.md` — niniejszy dokument
