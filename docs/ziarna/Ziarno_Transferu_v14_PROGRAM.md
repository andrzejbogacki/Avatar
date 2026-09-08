# ZIARNO TRANSFERU v14-PROGRAM
**FRAZA KONTROLNA: JAŁOWIEC-CYNOBER-77-RYGIEL**
Źródło: Panel 14, wyrosły z Ziarna Transferu v13 (fraza KAŁAMARZ-OLIWIN-08-ZASUWA).
Powód rozdzielenia: praca programowa i praca infrastrukturalna mają różny rytm.
Zakres: klucze podpisu Awatara, ADR-012, zamknięcie punktów O2, O3, O4
Strażnika GPS.
Data: 27.08.2026
Panel: 14
**Sprawy repozytorium — adres, wzorzec dostępu, procedura wgrywania, incydent
danych osobowych — mieszkają w Ziarnie Transferu v14-REPO (fraza
WRZOSOWISKO-ANTRACYT-41-KOTWICA). To Ziarno ich nie powtarza.**
---
## 1. WYTWORZONE W TYM WĄTKU — DO WGRANIA
| Plik | Miejsce docelowe |
|---|---|
| `ADR-012-klucze-awatara.md` | `pakiet_startowy_claude_code/docs/adr/` |
**Dołącza do kolejki z Panelu 13, która nadal nie dotarła do repozytorium:**
`ADR-011-straznik-gps.md`, `rejestr.json`, `straznik-gps.md`.
**Ostrzeżenie: pliki z Panelu 13 mogły przepaść.** Odczyt węzła nie znalazł
ich nigdzie na dysku. Jeśli nie zostały wtedy pobrane, trzeba je odtworzyć
z Ziarna Transferu v13, które zawiera komplet rozstrzygnięć.
**Wgrywanie zablokowane** do czasu decyzji o naprawie repozytorium — patrz
Ziarno v14-REPO.
---
## 2. ODCZYT REPOZYTORIUM — STAN FAKTYCZNY
Zdjęto punkty, które od Ziarna v12 figurowały jako niemożliwe do weryfikacji.
### 2.1 Kryptografia asymetryczna nie istnieje w projekcie
Moduł Auth zna wyłącznie: hasło przepuszczone przez scrypt, sól, jednorazowy
token aktywacji z generatora losowego, rejestr sesji. Unieważnienie sesji
= usunięcie wpisu.
**W całym repozytorium nie występuje ani jedno wywołanie `generateKeyPair`,
`createSign` ani `createVerify`.**
Jedyne wystąpienie słowa „podpis": `docs/dokumenty/strategia_sieci_suwerennych.md`,
punkt 205 — utożsamia podpis cyfrowy z hashem. **Błąd pojęciowy do korekty:**
hash świadczy o niezmienności treści, nie o tożsamości podpisującego.
### 2.2 Krąg poręczycieli nie istnieje
Ani w kodzie Protokołu Suwerenności, ani w schemacie profilu. Istnieje wyłącznie
pole `certyfikacja_startowa.zapraszajacy` — jeden zapraszający, przy czym typ
i poziom certyfikatu stoją w kodzie jako nierozstrzygnięte.
Krąg poręczycieli żyje dziś wyłącznie w Ziarnach Transferu.
### 2.3 Katalog ADR
Kończy się na **ADR-009**. Numerów 010 i 011 w repozytorium nie ma.
Numeracja ADR-012 opiera się na Ziarnie v13, nie na odczycie.
---
## 3. ZATWIERDZONE W TYM WĄTKU — KLUCZE AWATARA
Siedem rozstrzygnięć, spisanych w ADR-012.
1. **Moduł Auth rozszerzony o tożsamość kryptograficzną.** Hasło zostaje przy
   logowaniu do sesji, klucz służy do podpisu. Dwie role, bez splątania.
   Osobny ADR, nie dopisek do ADR-002.
2. **Ed25519.** Klucz publiczny 32 B, podpis 64 B, stała długość, podpis
   deterministyczny. Dostępny w `node:crypto` bez zewnętrznej zależności.
3. **Klucz prywatny nigdy nie opuszcza urządzenia.** Parę generuje urządzenie.
   Backend nie generuje i nie przechowuje klucza prywatnego w żadnej postaci.
4. **Konto trzyma listę kluczy publicznych — po jednym na urządzenie.**
   Tożsamością jest konto; klucz jest tożsamością urządzenia i wyłącznie nią.
5. **Hasło konta autoryzuje operacje na liście** — dopisanie klucza nowego
   urządzenia, zdjęcie klucza urządzenia utraconego. Hasło jest kanałem
   niezależnym od utraconego urządzenia.
6. **Zdjęcie klucza ma dwa powody o różnym skutku.** `wycofanie` — sprzęt
   wymieniony, podpisy zostają ważne. `uniewaznienie` — sprzęt w cudzych
   rękach, podpisy tracą ważność od chwili zgłoszenia. Rekord klucza niesie
   powód i datę, nie samą obecność na liście.
7. **Chwilę rozstrzygającą nadaje węzeł przy przyjęciu podpisanej treści.**
   Zegar urządzenia podpisującego nie ma mocy dowodowej. Antydatowanie przez
   posiadacza przejętego urządzenia niemożliwe.
### 3.1 Decyzja cofnięta w trakcie
Wariant „jeden klucz, jedno urządzenie" został wybrany, a następnie **skreślony
przez Suwerena**. Powód po stronie Nexusa: etykieta opcji była dwuznaczna —
dała się czytać jako „konto ma jedno urządzenie" albo „każde urządzenie ma
jeden klucz". Obowiązuje punkt 4.
### 3.2 Punkty otwarte ADR-012
Numeracja własna tego ADR-u, nie miesza się z O1–O9 Strażnika GPS.
| Nr | Sprawa |
|---|---|
| **O1** | utrata hasła i urządzenia jednocześnie; jedyny kandydat — krąg poręczycieli, nieistniejący w kodzie |
| **O2** | czy powód zdjęcia klucza wymaga potwierdzenia z drugiego kanału; napastnik znający hasło może zdjąć klucz jako `wycofanie` zamiast `uniewaznienie` |
| **O3** | korekta zdania o podpisie cyfrowym w `strategia_sieci_suwerennych.md` |
| **O4** | moment powstania pierwszej pary przy zakładaniu konta; ścieżka aktywacji z ADR-002 nie przewiduje zgłoszenia klucza publicznego |
### 3.3 Alternatywy odrzucone — zapisane w ADR-012
ECDSA P-256 (podpis DER 70–72 B, zmienna długość), RSA 2048 (podpis 256 B —
przekracza pakiet MeshCore), klucz prywatny na węźle, kopia zapasowa klucza
na węźle, jeden klucz na konto, dwa poziomy z kluczem tożsamości, krąg
poręczycieli jako autoryzacja, zapraszający jako autoryzujący, zegar urządzenia,
oba zegary z progiem rozbieżności.
---
## 4. STRAŻNIK GPS — PUNKTY ZAMKNIĘTE
Numeracja O1–O9 z Ziarna v13 obowiązuje dalej.
| Nr | Stan po Panelu 14 |
|---|---|
| **O2** | **ZAMKNIĘTY.** Ważność podpisu zależy od powodu zdjęcia klucza. Wariant trzeci z v13 (ważna do daty kompromitacji) przyjęty w postaci rozszerzonej. |
| **O3** | **ZAMKNIĘTY.** Zdjęcie klucza autoryzuje hasło konta. Krąg poręczycieli zostaje kandydatem wyłącznie dla przypadku utraty hasła i urządzenia naraz. |
| **O4** | **ZAMKNIĘTY warunkowo.** Klucze Awatara będą się nadawać do podpisywania kształtów — gdy powstaną. Dziś nie istnieją. |
**Otwarte bez zmian: O1, O5, O6, O7, O8, O9.**
Do decyzji przy stole natychmiast: **O5** (reprezentacja geometrii w kodzie),
**O7** (padnięcie telefonu: gasi meldunek czy zsuwa o poziom niżej),
**O8** (opaska bez telefonu: meldunek tak, uprawnienia nie).
---
## 5. OTWARTE — PRZENIESIONE Z v13, NIERUSZONE
| Punkt | Stan |
|---|---|
| Kolizja rotacji po odzyskaniu | okno 3 dni chroni Awatara przed napastnikiem, ale przy koncie przejętym chroni napastnika |
| ZNACZNIK TESTOWY: procedura odzyskania + rotacja kręgu | kanon przyjęty logicznie, niesprawdzony |
| ADR: Quantum Log, Strażnik Relacji, Mission Control | trzy w kolejce, numery przy spisaniu |
| ADR-010 (Rezonator Kwantowy) | zdecydowany, niespisany, nieobecny w repozytorium |
| Co uruchamia tryb czujności Bluetooth | automat / człowiek / parametr Awatara |
| Czy spacer rezonansowy wymaga planszy | tak / nie / parametr Awatara |
| Nadpisywanie pól szablonu — zakres domyślny | brak reguły domyślnej |
| Certyfikacja Protokołu Suwerenności przy klonowaniu | czy klon może obejść wymóg poświadczonych jakości |
| Wspólny zegar dla soundtracku | kandydat: silnik astronomiczny QAC. Interpretacja |
| Źródło dźwięku | pliki Awatara / częstotliwości Rezonatora Kwantowego / usługa zewnętrzna |
| Rezonator Kwantowy: odtwarzanie na żądanie innego modułu | **[BRAK DANYCH]** |
| Cztery zachowania Mission Control | faza przygotowania, widoczny postęp, kierunek i odległość, omówienie po powrocie |
| Przewóz rzeczy przez jadącego | wymiennik w ruchu |
| Wpisy do Mapy 3·6·9 | trzy triady z v11 czekają; dwie dziewiątki do sprawdzenia |
| Nazwa Mission Control w kodzie | polski identyfikator bez ogonków |
| Podłączenie bayo do sieci kratowej | brak decyzji kierunkowej |
| Misja etapu w Fight.Club | czeka na definicję z Mission Control |
| QAC4: O7, O8, weryfikacja `noaa_swpc.js` | osobny wątek `Transfer_QAC4_O7_O8.md` |
| Rejestr zmian listy atrakcji | struktura niezaprojektowana |
| Imię właściciela planszy a Master Fader | ta sama kolizja co rodowód szablonów |
| Czy plansza może wrócić do piaskownicy | rekomendacja: nie. Niezatwierdzone |
| Nadajnik niosący numer wersji kształtu | do przemyślenia po zamrożeniu kształtu |
| `modul.dziennik.quantum_log` do rejestru | czeka na ADR Quantum Log |
| Glosariusz: siedem pojęć Strażnika GPS | własny wątek, fraza WAPIEŃ-TURKUS-29-ŻAGIEL |
---
## 6. ZASADY POTWIERDZONE
**Nowe w v14-PROGRAM:**
- **Tożsamością jest konto, nie urządzenie.** Klucz jest tożsamością sprzętu
  i wyłącznie nią.
- **Klucz prywatny bez kopii ginie razem z urządzeniem — i to jest przyjęty
  kształt systemu, nie awaria.**
- **Rozmiar podpisu jest parametrem architektonicznym**, bo podpisana treść
  wchodzi w budżet pakietu sieci kratowej.
- **Chwilę rozstrzygającą nadaje węzeł, nie urządzenie.**
- **Zdjęcie klucza nie jest jedną operacją.** Powód niesie skutek.
**W mocy z v8–v13:**
- Automat wykonuje wolę — nie zastępuje jej.
- Kolejność wyznacza zależność, nie ważność.
- Awatar liczy sam, ale nie na własnych danych.
- Podpis czyni transport nieistotnym.
- Unieważnienie bije wersję.
- Trwałe osobno, zmienne osobno.
- Weryfikuje się człowieka, nie jego sprzęt.
- Moduł transportowy przenosi, nigdy nie interpretuje.
- Moduł nie zna zasad, których nie jest właścicielem.
- Obecność w rejestrze oznacza adres nadany.
- Adres kanoniczny prowadzi do kodu.
- Blokada techniczna jest stanem, nie wyrokiem.
- Zakaz konfabulacji: nieznany parametr = stop, decyzja do Suwerena.
---
## 7. OBSERWACJA KOMUNIKACJI — PANEL 14
**Tarcia, pięć, dwie przyczyny.**
Przyczyna pierwsza — reguła z v13 złamana przez Nexusa:
- pytanie o kolejność porządków zadane **bez rekomendacji** → prośba
  o ponowne wyświetlenie opcji. **Trzecie powtórzenie tego samego wzorca**
  (dwa razy w Panelu 13).
Przyczyna druga — etykiety i skróty pisane dla siebie, nie dla odbiorcy:
- etykieta „Jeden klucz, jedno urządzenie" dwuznaczna → **błędna decyzja
  wybrana i cofnięta**;
- pytanie o spisanie ADR-u zabrzmiało jak oferta wgrania do repozytorium,
  choć Nexus nie ma do niego zapisu;
- plan inwentaryzacji **pominął węzeł Mac Mini** — wychwycone przez Suwerena,
  a na węźle leżało 25 niewypchniętych commitów;
- rekomendacja wypchnięcia gałęzi **mimo ostrzeżenia w samej nazwie gałęzi**
  (`backup-przed-anonimizacja`).
**Trafienia:** decyzje przyjmowane jednym słowem wszędzie tam, gdzie moduł
zawierał zdanie drogowskazu, rekomendację i cenę nazwaną jawnie.
**Wniosek do stosowania:** rekomendacja nie jest opcjonalna. Brak rekomendacji
generuje dodatkową turę za każdym razem.
---
## 8. NASTĘPNA POZYCJA
Kolejność rozwoju bez zmian od v13. Strażnik GPS zamknięty na poziomie papierów.
**Do wyboru na starcie następnego wątku programowego:**
1. Trzy decyzje przy stole — O5, O7, O8 Strażnika GPS
2. Protokół Relacji jako kod — pozycja druga w kolejności rozwoju
3. ADR-010 Rezonatora Kwantowego — zdecydowany, wciąż niespisany
**Blokada:** wgrywanie plików zależy od decyzji w Ziarnie v14-REPO.
