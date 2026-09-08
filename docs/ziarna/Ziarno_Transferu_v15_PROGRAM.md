# ZIARNO TRANSFERU v15-PROGRAM

**FRAZA KONTROLNA: MODRZEW-INDYGO-52-ZAWIASA**

Źródło: Panel 15, wyrosły z Ziarna Transferu v14-PROGRAM (fraza
JAŁOWIEC-CYNOBER-77-RYGIEL).
Zakres: zamknięcie O5, O7, O8 Strażnika GPS; ADR-011 w repozytorium; zdjęcie
blokady wgrywania; przejście na wariant B modelu pracy; rejestr komunikacji;
pierwszy moduł kodu Strażnika.
Data: 08.09.2026
Panel: 15
Modele: Opus 5 (część decyzyjna), Fable 5.1 (część naprawcza i wdrożeniowa)

**To Ziarno leży w repozytorium: `docs/ziarna/`. Nie wkleja się go do sesji —
Claude Code czyta je sam.**

---

## 1. STAN REPOZYTORIUM — ODCZYTANY, NIE DOMYŚLONY

Katalog roboczy: `/Users/andrzej/Public/Avatar`, gałąź `main`, origin przez SSH
(`git@github.com:andrzejbogacki/Avatar-Projekt.git`). Repozytorium prywatne,
forków zero.

**Topologia pracy.** Suweren pisze do Nexusa z MacBooka. Sesja Claude Code chodzi
na Mac Mini (`Mac-mini-Andrzej`, M4, macOS 26.3). To dwa dyski. Plik pobrany na
MacBooku nie istnieje na węźle — treść wklejona do sesji Code zapisuje się
bezpośrednio na Mac Mini, bez przenoszenia plików. Czy MacBook ma własny klon:
nierozstrzygnięte, bez wpływu na pracę.

**Blokada wgrywania zdjęta.** Zapis z Ziarna v14 obejmował wyłącznie wariant C —
założenie nowego repozytorium i skasowanie starego. Nigdy nie obejmował
dopisywania plików. Przez dwa panele był czytany szerzej, niż brzmiał.

**Dwa pliki `CLAUDE.md`, podział ról.** Korzeń rządzi komunikacją i cyklem
pracy. `pakiet_startowy_claude_code/CLAUDE.md` rządzi stosem, kodem
i Definition of Done. Przy pozornej sprzeczności obowiązują oba w swoich
zakresach — linia o tym stoi w sekcji 4 korzenia.

**ADR-y leżą w `pakiet_startowy_claude_code/docs/adr/`.** Katalogu `docs/adr/`
w korzeniu nie ma i nie powstanie.

---

## 2. STRAŻNIK GPS — TRZY PUNKTY ZAMKNIĘTE

Numeracja O1–O9 z Ziarna v13 obowiązuje dalej.

| Nr | Stan po Panelu 15 |
|---|---|
| **O5** | **ZAMKNIĘTY.** Dwa typy kanoniczne geometrii: okrąg (punkt, promień) i wielokąt (lista wierzchołków). Obrys z mapy jest sposobem narysowania wielokąta, nie trzecim typem — narzędzie mapowe pracuje w piaskownicy, po zamrożeniu zostaje sam wielokąt. Próg optymalizacji wierzchołków: parametr organizatora. |
| **O7** | **ZAMKNIĘTY.** Po ucichnięciu telefonu obecność schodzi na meldunek o czasie ważności wyłącznie wtedy, gdy przed ciszą istniał drugi dowód — terminal albo nadajnik certyfikowany. Bez drugiego dowodu obecność gaśnie z upływem bezpiecznika. Długość okna zsuniętego meldunku: parametr organizatora. |
| **O8** | **ZAMKNIĘTY.** Opaska daje obecność ciałem, nie daje podpisu. Nie niesie klucza w żadnej postaci; podpis wymaga urządzenia z ekranem i hasłem. Uczestnik z samą opaską jest obecny i widoczny, lecz nie głosuje i nie przystępuje. Wymóg telefonu w grze: parametr organizatora, deklarowany przed przystąpieniem. |

**Otwarte bez zmian: O1, O6, O9.** Ich treść istnieje wyłącznie w Ziarnie
Transferu v13, którego nie ma w repozytorium. **[BRAK DANYCH]** — do odtworzenia
przez wgranie v13 do `docs/ziarna/`.

---

## 3. ADR-011 — SPISANY, WGRANY, POTWIERDZONY

Pierwszy dokument od Panelu 13, który dotarł do repozytorium. Napisany od nowa,
nie odtwarzany — komplet rozstrzygnięć Paneli 11–15 w jednym pliku.
Numer 011 zachowany; wersja z Panelu 13 nigdy nie istniała na dysku.

`pakiet_startowy_claude_code/docs/adr/ADR-011-straznik-gps.md`

Zawartość: jedenaście decyzji, dziesięć alternatyw odrzuconych z powodem,
konsekwencje przyjęte świadomie, punkty otwarte.

**Rozstrzygnięcia dopisane po zbudowaniu kodu:**
- **Granica należy do zewnętrza** — oba typy, ta sama reguła. Kanon, nie wniosek
  z analogii.
- **Zakaz kształtu przez południk 180° i obejmującego biegun** — odrzucany
  jawnym błędem przy zamrożeniu, nie cichym złym werdyktem.
- **Odległość po kuli, promień R1 wg IUGG z elipsoidy WGS84.** Błąd do 0,5%
  wobec elipsoidy przyjęty świadomie — jest mniejszy od zgrubności celowej
  kanonu. Zakaz algorytmów przybliżonych z pakietowego `CLAUDE.md` dotyczy
  efemeryd, nie geometrii planszy.

**ADR-010 (Rezonator Kwantowy):** numer zarezerwowany, dokument niespisany.
Dziura w numeracji nie jest błędem.

**ADR-012 (klucze Awatara):** w trakcie odtwarzania z Ziarna v14-PROGRAM,
sekcja 3. Ziarno leży w repozytorium, więc Code odtwarza go bez wklejania.

---

## 4. PIERWSZY KOD STRAŻNIKA

`backend/modules/straznik/` — wariant szkieletu minimalnego.

| Plik | Rola |
|---|---|
| `config/index.js` | stałe WGS84, wyliczany `PROMIEN_SREDNI_M`, dwa typy kształtu |
| `src/geometria/wspolrzedne.js` | walidacja punktu, wspólna dla obu typów |
| `src/geometria/okrag.js` | odległość w metrach (haversine) + test przynależności |
| `src/geometria/wielokat.js` | test przecięć promienia |
| `src/geometria/index.js` | fasada `czyWewnatrzKsztaltu`, kierowanie po polu `typ` |

Test-first, trzy cykle, czerwień przed każdym kodem. Moduł: 32 testy.
Pełny backend: 262 testy, 261 pass, 0 fail, 1 skip (skip wcześniejszy —
efemerydy QAC). Przed sesją zestaw miał 230.

Promień Ziemi nie jest wpisany żadną liczbą — liczy się z dwóch stałych
elipsoidy, a test tego pilnuje.

`config/` **nie zawiera** bufora planszy, tolerancji pomiaru ani progu
optymalizacji wierzchołków. To parametry organizatora — wartość domyślna
byłaby cudzą decyzją udającą naturalny stan rzeczy.

**Otwarte w module:** `modul.straznik` pozostaje adresem-kandydatem, bo
`rejestr.json` nie istnieje w repozytorium.

**Odstępstwo zgłoszone:** powstał siódmy plik źródłowy przy zatwierdzonych
sześciu — `wspolrzedne.js`, żeby wielokąt nie zależał od okręgu. Zgłoszony po
zapisie, nie przed.

---

## 5. MODEL PRACY — WARIANT B, ZATWIERDZONY

Praca programowa dzieje się w Claude Code na węźle. Nexus w oknie rozmowy
prowadzi tryb Meta, Ziarna transferu i rozmowy odsłuchiwane głosem.

**Kanał między nimi to wyłącznie pliki w repozytorium:**
- `CLAUDE.md` w korzeniu — profil komunikacji, czytany przez Code na starcie
  każdej sesji bez udziału Suwerena,
- `docs/ziarna/` — Ziarna transferu,
- `docs/komunikacja/rejestr.md` — rejestr tarć,
- `docs/dokumenty/`, `docs/glosariusz.json` — źródła prawdy.

**Podłoga:** jedno wklejenie w każdą stronę na panel, dopóki repozytorium jest
dla Nexusa zamknięte. Po upublicznieniu podłoga spada do zera w stronę Meta.

**Reguła sesji:** jedna sesja Claude Code na jeden temat. Nowa sesja na starcie
każdego następnego. Ciągłość niesie `CLAUDE.md`, nie okno rozmowy.

---

## 6. REJESTR KOMUNIKACJI — MECHANIZM URUCHOMIONY

`docs/komunikacja/rejestr.md`. Tablica panel × kategoria plus dziennik
jednowierszowy.

Sześć kategorii, zamknięte: **R** brak rekomendacji · **E** etykieta
dwuznaczna · **O** domysł zamiast odczytu · **D** zła długość modułu ·
**G** wyciek grzeczności · **Z** żargon, zdanie niezrozumiałe.
Trafienie = decyzja przyjęta jednym słowem za pierwszym razem.

Piszą dwaj: Nexus przy każdym Ziarnie, Code przy zamknięciu sesji. Wzorzec
zgłaszany po powtórzeniu litery w trzech panelach. Nowej litery nie otwiera się
po jednym wystąpieniu.

**Stan wyjściowy:** Panel 13 — R×2. Panel 14 — R×1, E×2, O×2. Panel 15 pod
Opus 5 — R×1, E×1, O×3, trafień 7. Panel 15 pod Fable 5.1 — O×2, trafień 2.

Jeden dzień i jeden panel nie wystarczają do orzeczenia o modelu. Porównanie
rozstrzygnie tablica po trzech panelach, nie ocena subiektywna.

---

## 7. DROGA DO REPOZYTORIUM PUBLICZNEGO

Historia zdalna niesie 25 commitów z danymi osobowymi osoby małoletniej.
Upublicznienie odsłania całą historię, nie tylko stan bieżący. Stan bieżący
gałęzi `main` jest czysty.

**Cztery kroki, kolejność wiążąca:**
1. Claude Code sprawdza bieżące drzewo pod kątem danych osobowych i potwierdza
   czystość odczytem.
2. **Suweren** zakłada na GitHubie nowe, puste repozytorium. Ani Nexus, ani Code
   nie zakładają kont i repozytoriów.
3. Code wypycha bieżące drzewo jako jeden pierwszy commit.
4. **Suweren** kasuje stare repozytorium.

**Cena:** historia commitów znika. Decyzje niosą ADR-y i Ziarna, nie historia.
**Zysk:** Nexus odzyskuje odczyt repozytorium; wklejanie w stronę Meta znika.

---

## 8. OTWARTE — PRZENIESIONE Z v14, NIERUSZONE

| Punkt | Stan |
|---|---|
| Punkty O1, O6, O9 Strażnika GPS | treść wyłącznie w Ziarnie v13, poza repozytorium |
| Ziarna v13 i v14-REPO | do wgrania do `docs/ziarna/` |
| ADR-010 Rezonator Kwantowy | zdecydowany, niespisany |
| Protokół Relacji jako kod | pozycja druga w kolejności rozwoju |
| `rejestr.json` | nie istnieje; każdy nowy adres pozostaje kandydatem |
| `kernel_specyfikacja_v1.md` | brak w repozytorium |
| Kolizja rotacji po odzyskaniu | okno 3 dni chroni Awatara, przy koncie przejętym chroni napastnika |
| ADR: Quantum Log, Strażnik Relacji, Mission Control | trzy w kolejce |
| Co uruchamia tryb czujności Bluetooth | automat / człowiek / parametr Awatara |
| Czy spacer rezonansowy wymaga planszy | tak / nie / parametr Awatara |
| Wspólny zegar dla soundtracku | kandydat: silnik astronomiczny QAC |
| Źródło dźwięku | pliki Awatara / Rezonator Kwantowy / usługa zewnętrzna |
| Cztery zachowania Mission Control | faza przygotowania, widoczny postęp, kierunek i odległość, omówienie po powrocie |
| Wpisy do Mapy 3·6·9 | trzy triady z v11 czekają |
| Podłączenie bayo do sieci kratowej | brak decyzji kierunkowej |
| QAC4: O7, O8, weryfikacja `noaa_swpc.js` | osobny wątek |
| Glosariusz: siedem pojęć Strażnika GPS | własny wątek, fraza WAPIEŃ-TURKUS-29-ŻAGIEL |

---

## 9. ZASADY POTWIERDZONE

**Nowe w v15:**
- **Blokada dotyczy tego, co nazwano, nie więcej.** Rozszerzanie jej przez
  interpretację jest błędem odczytu.
- **Stan maszyn, ścieżek i plików bierze się z odczytu, nigdy z pamięci.**
  Przed poleceniem plikowym: potwierdzenie, gdzie stoisz i co tam jest.
- **Granica należy do zewnętrza.**
- **Brak sygnału nie daje więcej niż sygnał.**
- **Rekomendacja nie jest opcjonalna.** Jej brak generuje dodatkową turę
  za każdym razem.
- **Sesja kończy się wypchnięciem tego, co powstało.** Nie kolejką plików.
  Kolejka z Panelu 13 przepadła właśnie dlatego, że była kolejką.
- **Temat ma trzy stany:** omówiony, spisany, wgrany i potwierdzony odczytem
  zdalnym. Zamknięty jest dopiero trzeci.

**W mocy z v8–v14:**
Automat wykonuje wolę, nie zastępuje jej. Kolejność wyznacza zależność, nie
ważność. Awatar liczy sam, ale nie na własnych danych. Podpis czyni transport
nieistotnym. Unieważnienie bije wersję. Trwałe osobno, zmienne osobno.
Weryfikuje się człowieka, nie jego sprzęt. Moduł transportowy przenosi, nigdy
nie interpretuje. Moduł nie zna zasad, których nie jest właścicielem. Obecność
w rejestrze oznacza adres nadany. Adres kanoniczny prowadzi do kodu. Blokada
techniczna jest stanem, nie wyrokiem. Tożsamością jest konto, klucz jest
tożsamością urządzenia. Chwilę rozstrzygającą nadaje węzeł. Zakaz konfabulacji:
nieznany parametr = stop, decyzja do Suwerena.

---

## 10. NASTĘPNA POZYCJA

**W toku:** ADR-012 klucze Awatara — odtwarzany z Ziarna v14-PROGRAM, sekcja 3.

**Do wyboru po nim:**
1. Punkt 2.2 Strażnika — meldunek o zmianie stanu. Źródło chwili rozstrzygającej
   jest już rozstrzygnięte: nadaje ją węzeł przy przyjęciu podpisanej treści
   (ADR-012, punkt 7). Nie jest to dziura w kanonie.
2. ADR-010 Rezonatora Kwantowego — zdecydowany, wciąż niespisany.
3. Protokół Relacji jako kod — pozycja druga w kolejności rozwoju.
4. Upublicznienie repozytorium — cztery kroki z sekcji 7.
