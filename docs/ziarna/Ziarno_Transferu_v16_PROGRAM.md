# ZIARNO TRANSFERU v16-PROGRAM

**FRAZA KONTROLNA: JESION-KOBALT-16-ZATRZASK**

Źródło: sesja programowa Claude Code z 08.09.2026, prowadzona w Panelu 15,
wyrosła z Ziarna Transferu v15-PROGRAM (fraza MODRZEW-INDYGO-52-ZAWIASA).
Zakres: rozstrzygnięcia O1–O3 Strażnika w kanonie, ADR-012, punkt 2.2 w kodzie,
odzyskanie Ziaren v12–v14, audyt danych osobowych, przeniesienie repozytorium.
Data: 08.09.2026
Model: Opus 5

**Frazę kontrolną nadał Claude Code według wzorca poprzednich Ziaren — Nexus
w panelu jej nie widział. Do potwierdzenia albo podmiany przy najbliższym
kontakcie.**

**To Ziarno leży w repozytorium: `docs/ziarna/`. Nie wkleja się go do sesji.**

---

## 1. REPOZYTORIUM — NOWY ADRES, HISTORIA OD ZERA

Cztery kroki z Ziarna v15 sekcja 7 wykonane. Stan z odczytu:

| Rzecz | Wartość |
|---|---|
| `origin` | `git@github.com:andrzejbogacki/Avatar.git` |
| `stare` | `git@github.com:andrzejbogacki/Avatar-Projekt.git` — archiwum, push zablokowany |
| pierwszy commit nowego repozytorium | `1e6e364` „Projekt Avatar — stan na 08.09.2026, Panel 15" |
| pliki w drzewie | 221 |
| hasz drzewa głównego | `81c96ac` — identyczny po obu stronach, dowód kompletności |
| stara historia | 74 commity, lokalnie na gałęzi `stare-main` (`747c07f`) |

Przeniesienie zrobiono gałęzią bez historii, nie kasowaniem `.git`. Katalog
`.git` jest nietknięty, więc pełna stara historia stoi lokalnie i da się ją
odtworzyć bez pobierania czegokolwiek.

**Krok czwarty — skasowanie starego repozytorium — należy do Suwerena
i czeka.** Do tego czasu skażona historia istnieje pod starym adresem.

**Blokada techniczna wprowadzona 08.09.2026:** adres push zdalnego `stare`
ustawiony na `no_push`. Odczyt działa, wypchnięcie odmawia. Zdjęcie blokady
wymaga jawnego przywrócenia adresu.

---

## 2. STRAŻNIK GPS — KOD

`backend/modules/straznik/`. Wszystko czyste funkcje: bez stanu własnego,
bez wejścia-wyjścia, bez zegara.

| Warstwa | Zawartość |
|---|---|
| `config/index.js` | WGS84 → wyliczany `PROMIEN_SREDNI_M`, zakresy, typy kształtu, stany obecności, źródła dowodu |
| `src/geometria/` | dwa testy przynależności, odległość od kształtu ze znakiem, przynależność z buforem |
| `src/obecnosc/` | `wykryjZmianeStanu(stan_poprzedni, punkt, ksztalt, nastawy)` |

**Liczby:** moduł 59 testów pass (44 geometria, 15 obecność). Pełny backend
289 testów, 288 pass, 0 fail, 1 skip — skip wcześniejszy, efemerydy QAC.
Przed sesją zestaw miał 262.

**Trzy rzeczy, które kanon wymusił:**

- **Detektor nie zna czasu i nie będzie znał.** Przejście zależy od pozycji.
  Chwilę rozstrzygającą nadaje węzeł (ADR-012 punkt 7), więc urządzenie nie
  stempluje meldunku własnym zegarem. Test pilnuje, że meldunek ma dokładnie
  dwa pola: `stan` i `zrodlo_dowodu`.
- **Meldunek nie niesie współrzędnych.** Osobny test serializuje go
  i sprawdza, że nie ma tam ani nazw pól pozycji, ani ich wartości.
- **Bufor 0 daje dokładnie regułę granicy z punktu 2.3.** `odleglosc < bufor_m`
  przy zerze to `odleglosc < 0`, czyli granica należy do zewnętrza.

**Niezbudowane:** bezpiecznik ciszy sprzętu (ADR-011 2.8), zsunięcie
warunkowe (2.9), opaska (2.10), podpis kształtu (2.6), nasłuch nadajnika,
odcisk planszy, wymiana atrapy, z którą rozmawia bayo.

---

## 3. PAPIERY

**ADR-011 — trzy rozstrzygnięcia dopisane do punktu 2.3.** Granica należy do
zewnętrza dla obu typów jako kanon, nie wniosek z analogii. Zakaz kształtu
przecinającego południk 180° i obejmującego biegun — wiersz w alternatywach
odrzuconych. Odległość po kuli z promieniem R1 wg IUGG, błąd do 0,5% przyjęty
świadomie — wpis w konsekwencjach.

**ADR-012 Klucze podpisu Awatara — spisany i wgrany.** Siedem rozstrzygnięć
z Panelu 14: Ed25519, klucz prywatny wyłącznie na urządzeniu, lista kluczy
publicznych per konto, hasło konta jako autoryzacja listy, dwa powody zdjęcia
klucza o różnym skutku, chwila rozstrzygająca po stronie węzła. Dziesięć
alternatyw odrzuconych, cztery punkty otwarte numeracji własnej.

**Katalog ADR:** 000–009, 011, 012. ADR-010 zarezerwowany dla Rezonatora
Kwantowego, niespisany — dziura w numeracji nie jest błędem.

**Źródła prawdy odzyskane do repozytorium:** Ziarna v12, v13, v14-PROGRAM,
v14-REPO w wersji okrojonej, PS_v1, instancja Protokołu Suwerenności.
ARCHITEKTURA sekcja 3 wskazuje teraz pliki, które istnieją; `rejestr.json`
i `kernel_specyfikacja_v1.md` oznaczone jawnie jako nieistniejące.

---

## 4. DANE OSOBOWE — AUDYT I CIĘCIA

**Audyt całego drzewa, dwie metody, 221 plików: zero danych osób trzecich.**
Wzorce z incydentu — zero trafień. Katalogi danych (`qac/profiles`,
`auth/accounts`, `ps/profile`, `wymiennik/salda`) puste i chronione
`.gitignore`. Narzędzia deweloperskie za flagą `QAC_DEV_TOOLS=1`.

**Wykonane cięcia:**

- Ziarno v14-REPO wchodzi **wyłącznie w wersji okrojonej**, cztery cięcia
  oznaczone znacznikiem `[USUNIĘTO — dane osobowe]`. Oryginał leży u Suwerena,
  poza repozytorium, i nie wolno go wgrywać w żadnej postaci.
- Fixture'y QAC odwiązane od identyfikatora Suwerena: `avatar_testowy`
  zamiast `andrzej_bogacki` w `normalizer.test.js` i `profil.test.js`.
  `SUWEREN_AVATAR_ID` w konfiguracji Auth został — tam identyfikator jest
  funkcją, nie danymi.
- Warunek akceptacji Polska.3D w Protokole Suwerenności i dokumencie PS_v1
  przeredagowany tak, by nie ujawniał osób zależnych.

**Pozostaje świadomie:** imię i nazwisko Suwerena w około 50 plikach — ADR-y,
CLAUDE.md, mapa, dokumenty. To podpis autora, nie wyciek.

---

## 5. PUNKTY OTWARTE

| Punkt | Stan |
|---|---|
| **Kolizja adresu Strażnika** | Ziarno v13 punkt 2.2 nadaje `modul.straznik.gps`, dokument modułu i mapa projektu mówią `modul.straznik`. Jedno z dwóch jest nieprawdą — rozstrzygnięcie przy zasilaniu rejestru |
| `rejestr.json` | nie istnieje; specyfikacja gotowa w Ziarnie v13 punkt 2.2 — dziewięć szuflad po rootach, dziewięć adresów, sześć pól rekordu. Osiem modułów ma adres-kandydat |
| `kernel_specyfikacja_v1.md` | brak w repozytorium; ROADMAPA pomija kernel wprost |
| ADR-010 Rezonator Kwantowy | zdecydowany w Panelu 12, niespisany; treści rozstrzygnięć nie ma w żadnym Ziarnie w repozytorium |
| Siedem pojęć Strażnika do glosariusza | definicje robocze w Ziarnie v12 sekcja 3; glosariusz ma 67 pozycji i nie zna żadnego z nich. Własny wątek, fraza WAPIEŃ-TURKUS-29-ŻAGIEL |
| Pięć parametrów organizatora | bufor planszy, tolerancja błędu pomiaru, próg optymalizacji wierzchołków, długość okna zsuniętego meldunku, wymóg telefonu. Kodu nie blokują — są wejściem obowiązkowym. Blokują uruchomienie pierwszej gry |
| Odległość od krawędzi wielokąta | liczona na płaszczyźnie lokalnej; przy planszach kilometrowych błąd rzędu metrów, przy kształtach o rozpiętości dziesiątek stopni rośnie |
| ROADMAPA_BACKEND | nie zna słowa „Strażnik" ani ADR-012; kolejność modułów kończy się na Glosariuszu, a ADR-011 stawia Strażnika pierwszym |
| Punkty O1, O6, O9 Strażnika | treść odzyskana z Ziarna v13 — przycinanie listy obecnych po stronie wywołującego, wartość skróconego okna jako zadanie testowe, telefon-świadek. Wszystkie trzy czekają za Protokołem Relacji albo za testem w terenie |
| Kasowanie starego repozytorium | należy do Suwerena |

---

## 6. ZASADY POTWIERDZONE — NOWE W v16

- **Kanon przed kodem.** Regułę, której ADR nie rozstrzyga, stawia się jako
  decyzję do Suwerena w tej samej turze — nie jako komentarz w pliku.
  Wniosek logiczny wypchnięty w kodzie utrwala się jak kanon.
- **Ziarno jest zapisem stanu, kanon jest kanonem.** Gdy Ziarno mówi co innego
  niż ADR, obowiązuje ADR; rozbieżność oznacza się w Ziarnie, nie poprawia się
  historii.
- **Dane osobowe wchodzą przez opis, nie tylko przez dane.** Zdanie o kosztach
  utrzymania ujawniło osoby zależne równie skutecznie jak rekord w pliku
  testowym.
- **Zgodność drzew dowodzi się haszem drzewa, nie liczbą plików.**
- **Liczby w uzasadnieniu też pochodzą z odczytu**, nie z rozpędu.

**W mocy z v8–v15:** wszystkie zasady wymienione w Ziarnie v15 sekcja 9.

---

## 7. REJESTR KOMUNIKACJI — STAN

`docs/komunikacja/rejestr.md`. Panel 15, Opus 5, sesja Claude Code:
R 1 · E 1 · O 5 · D 1 · G 0 · Z 0 — tarcia 8, trafienia 20.

Pierwsze wystąpienie litery **D** (zła długość modułu): różnica przed i po
utonęła w długim raporcie, Suweren musiał poprosić o nią drugi raz.
Litera nie tworzy wzorca po jednym wystąpieniu.

---

## 8. DOROBEK SESJI

Czternaście commitów w starym repozytorium (`2621760`..`747c07f`), dwa
w nowym. Wszystko wypchnięte i potwierdzone odczytem zdalnym.

---

## 9. NASTĘPNA POZYCJA

**Do wyboru na starcie następnej sesji programowej:**

1. **Bezpiecznik ciszy sprzętu i zsunięcie warunkowe** (ADR-011 2.8 i 2.9) —
   drugi producent meldunku; wtedy `src/obecnosc/stan.js` rozcina się zgodnie
   z planem z Kroku 0. Tu wchodzi czas jako parametr od węzła.
2. **`rejestr.json`** — specyfikacja gotowa; najpierw kolizja adresu Strażnika.
3. **ADR-010 Rezonatora Kwantowego** — wymaga materiału, którego nie ma
   w repozytorium.
4. **ROADMAPA_BACKEND** — dopisanie Strażnika i ADR-012, usunięcie sprzeczności
   z ADR-011 co do kolejności rozwoju.

**Rekomendacja: pozycja pierwsza.** Strażnik blokuje bayo i stoi pierwszy
w kolejności rozwoju; punkt 2.2 bez bezpiecznika ciszy nie melduje nic po
rozładowaniu telefonu, a to najczęstszy przypadek w terenie.
