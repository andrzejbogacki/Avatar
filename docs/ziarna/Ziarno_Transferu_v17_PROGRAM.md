# ZIARNO TRANSFERU v17-PROGRAM

**FRAZA KONTROLNA: BUKSZPAN-OCHRA-16-ŹRÓDŁO**

Źródło: Panel 16, praca w Nexusie plus sesje pracy Claude Code z 08–09.09.2026,
wyrosła z Ziarna Transferu v16-PROGRAM (fraza JESION-KOBALT-16-ZATRZASK).
Zakres: styl odpowiedzi nexus-pl, uzupełnienie glosariusza, hierarchia źródeł
w ADR-011, reguła nazewnicza słowa „sesja", rozdzielenie nazw bezpiecznika.
Data: 09.09.2026
Model: Opus 5

**Frazę kontrolną nadał Nexus w panelu.** Zastrzeżenie, które niosło Ziarno v16,
tu nie obowiązuje.

**To Ziarno leży w repozytorium: `docs/ziarna/`. Nie wkleja się go do sesji pracy.**

---

## 1. COMMITY PANELU

| Hasz | Co wnosi |
|---|---|
| `ce7e3d5` | Styl odpowiedzi nexus-pl — pierwszy zapis pliku stylu, raport Zero-Fluff pisany pod odbiór słuchem. |
| `33e4132` | Glosariusz z 67 na 75 pozycji: osiem brakujących pojęć plus nowa treść hasła Volt Token. |
| `04d1628` | Punkt 2.12 ADR-011 (hierarchia źródeł), rozdzielenie nazw bezpiecznika, pierwsza wersja reguły o słowie „sesja". |
| `89b95e1` | Czwarta nazwa „sesja pracy", zakres reguły, siedem wierszy w ADR-ach, punkt otwarty O13. |
| `cdda7f4` | Piąta nazwa „sesja emisji", dwa wyłączenia zakresu, dwa wiersze w ADR-005 — reguła domknięta. |

**Odnotowane przy spisywaniu:** Suweren wymienił pięć haszy, zapowiadając cztery.
Zapisano pięć, bo tyle wskazano. Osobno: commit `225a696` z 08.09.2026 godzina 21:38
dotyczy tego samego pliku stylu co `ce7e3d5` i na liście nie figuruje — rozdziela
format liczb w pliku od formatu w odpowiedzi. Przynależność obu do Panelu 16
albo 15 nie została rozstrzygnięta.

---

## 2. STYL ODPOWIEDZI NEXUS-PL

Plik: `.claude/output-styles/nexus-pl.md`, 60 wierszy, w repozytorium.
Rządzi formą odpowiedzi Claude Code: raport zamykający zadanie w sekcjach
Wykonane · Liczby z odczytu · Decyzja do Suwerena · Blokada · Niewykonane,
pogrubienie wyłącznie na decyzję, liczbę z odczytu i blokadę, jednostki
pełnym słowem w odpowiedzi i skrótem w plikach repozytorium.

Włączenie: pole `"outputStyle": "nexus-pl"` w pliku `.claude/settings.local.json`.
Ten plik jest w `.gitignore` (wiersz 49), więc ustawienie żyje na maszynie,
nie w repozytorium — styl wgrany, nastawa lokalna.

**Menu aplikacji stylów projektowych nie pokazuje.** Stąd droga przez pole
w pliku ustawień, nie przez interfejs.

---

## 3. GLOSARIUSZ — ROZJAZD WYKRYTY I ZAMKNIĘTY

Glosariusz miał **67 pozycji** i nie znał ośmiu pojęć, których kanon używał
w mechanice: Sesja gry, Zatrzask, Parametr organizatora, Plansza fizyczna,
Maska, Dzielenie proporcjonalne, QRT (Quantum Rectification Tool),
Węgiel-12 (6-6-6). Po scaleniu: **75 pozycji**. Rekord Volt Token (Vote Token)
zastąpiony nową treścią.

**Sesja gry rozstrzyga sprawę gry ciągłej.** Gry bez końca w kanonie nie ma.
Są sesje gry z własnym kryterium zamknięcia — także tam, gdzie nic z zewnątrz
końca nie wyznacza. Cytat rozstrzygający: „Zasada obejmuje również gry toczące
się bez przerw, w których nic z zewnątrz nie wyznacza końca — także one mają
sesje, tylko same wybierają kryterium ich zamknięcia".

Skutki, które z tego wyszły w tym samym panelu:

- Długość okna zsuniętego meldunku ma odtąd podstawę: koniec sesji gry gasi
  obecność wszystkich uczestników niezależnie od położenia, więc okno mieści
  się wewnątrz sesji gry. Podstawa istnieje, reguła wyboru wartości nadal nie.
- Zatrzask ma moment wyzwolenia bez zewnętrznego końca gry: ogłoszenie ręczne,
  upływ czasu albo warunek wpisany w reguły. Jedna gra ma wiele zatrzasków,
  każdy zamyka swój etap.
- Hasło Volt Token liczyło sumę napięcia po planszy, hasło Sesja gry przypisuje
  obecność do sesji gry. Poprawione: suma liczona po sesji gry.

---

## 4. ADR-011 PUNKT 2.12 — HIERARCHIA ŹRÓDEŁ

Glosariusz definiuje pojęcia, ADR rozstrzyga mechanikę. Gdy oba mówią co innego
o mechanice, obowiązuje ADR. Rozbieżność zgłasza się jako punkt otwarty — nie
poprawia się jej po cichu w glosariuszu, bo cicha poprawka usuwa ślad po tym,
że dwa dokumenty się rozjechały.

Pierwszy przypadek objęty regułą: hasło Parametr organizatora oddawało
organizatorowi długość bezpiecznika ciszy, którą punkt 2.8 zastrzegł dla kanonu.
Obowiązuje punkt 2.8.

To samo jednym zdaniem w `CLAUDE.md` w korzeniu, sekcja 5.

---

## 5. ROZDZIELENIE NAZW BEZPIECZNIKA

Nazwa „bezpiecznik czasowy" wyszła z użycia — pasowała do dwóch wielkości
o przeciwnym statusie i nie rozstrzygała, która jest nastawiana.

- **Bezpiecznik ciszy** — 2 h, kanon, punkt 2.8. Dotyczy wiarygodności dowodu,
  organizator go nie nastawia. Stała w `backend/modules/straznik/config/index.js`.
- **Okno zsuniętego meldunku** — parametr organizatora, punkt 2.9. Bez wartości
  domyślnej; brak jest jawnym błędem, nigdy cichym zerem.

---

## 6. REGUŁA NAZEWNICZA — SŁOWO „SESJA"

Gołe słowo zakazane. **Pięć dozwolonych nazw:** sesja gry, sesja logowania,
ważność meldunku, sesja pracy (praca z Claude Code), sesja emisji (Rezonator
Kwantowy, start i stop ręczny).

**Zakres:** dokumenty, ADR-y, glosariusz, Ziarna.

**Wyłączenia:**

1. Identyfikatory w kodzie — zmieniane wyłącznie przy okazji pracy nad danym
   modułem, nigdy hurtem. Dotyczy 154 wierszy w 31 plikach katalogu `backend/`.
2. Nazwy plików już zapisanych, w szczególności Ziaren Transferu. Nazwa pliku
   jest identyfikatorem zamkniętego zapisu, nie tekstem dokumentu.
3. Wiersze zaległe w dokumentach modułów, `ROADMAPA_BACKEND`, `MAPA_PROJEKTU`,
   `mapa_projektu.json`, `README` i `docs/superpowers` — poprawiane przy okazji
   pracy nad danym plikiem, nigdy jako osobne zadanie.

Stan po panelu: gołych wystąpień w `CLAUDE.md` i we wszystkich 12 ADR-ach — **0**.
Ziarna nietknięte: zapis stanu, historii się nie poprawia.

---

## 7. PUNKTY OTWARTE — W KOLEJNOŚCI

| Nr | Sprawa | Stan |
|---|---|---|
| 1 | **Trzeci producent meldunku** — gaszenie obecności z końcem sesji gry. Glosariusz stanowi, że zakończenie sesji gry kończy obecność wszystkich uczestników niezależnie od położenia. Moduł Strażnik ma dwóch producentów: granicę (2.7) i ciszę (2.8, 2.9). Trzeciego nie ma ani w ADR-011, ani w `src/obecnosc/index.js` | niezbudowany, nierozstrzygnięty |
| 2 | **O11 do powtórzenia** — wiek Ostatniego dowodu Awatara. Wariant D (dowód wewnątrz nieprzerwanego epizodu obecności) stawiano, gdy pojęcia sesji gry w projekcie nie było; analiza wymaga powtórzenia na tym pojęciu | otwarty, do przerobienia od nowa |
| 3 | **O13** — czas ważności meldunku uczestnika bez telefonu. Szósty parametr organizatora, niezdefiniowany, oddzielny od okna zsuniętego meldunku z punktu 2.9. Glosariusz go wymienia, ADR-011 nie nadaje mu długości, lista pięciu parametrów w Ziarnie v16 sekcja 5 go nie zna | otwarty |
| 4 | **O10** — dowód uzyskany w trakcie ciszy: odbicie przy terminalu przy padniętym telefonie. Ziarno v12 punkt 1.11 mówi, że przywraca mocniejszy poziom; punkt 2.9 rozstrzyga wyłącznie dowód sprzed ciszy | otwarty, mechanizm niezbudowany |
| 5 | **Identyfikator `czyByłDrugiDowod`** — litera „ł" w nazwie funkcji, wiersze 73 i 125 pliku `backend/modules/straznik/src/obecnosc/cisza.js`. Kanon: identyfikatory w kodzie polskie, bez ogonków. Kod łamie regułę w miejscu realizującym punkt 2.9 | do naprawy przy pracy nad modułem |
| 6 | **32 zaległe wiersze nazewnicze** — dokumenty modułów (18), `ROADMAPA_BACKEND` (7), `MAPA_PROJEKTU` (1), `mapa_projektu.json` (1), `README` (1), `docs/superpowers` (4) | poprawiane przy okazji, nie hurtem |
| 7 | **Glosariusz sam łamie regułę nazewniczą** — 9 gołych wystąpień słowa, wszystkie w haśle Sesja gry. Hasło wgrano commitem `33e4132`, regułę postawiono później commitami `04d1628` i `cdda7f4`. Część wystąpień to sama definicja rozróżnienia i cytatu poprawiać nie wolno bez rozstrzygnięcia | otwarty, do rozstrzygnięcia przy pracy nad glosariuszem |

**Przeniesione z v16, nadal otwarte:** kolizja adresu Strażnika, `rejestr.json`,
`kernel_specyfikacja_v1.md`, ADR-010 Rezonator Kwantowy, siedem pojęć Strażnika
do glosariusza, pięć parametrów organizatora, odległość od krawędzi wielokąta,
`ROADMAPA_BACKEND` bez Strażnika i ADR-012, punkty O1, O6, O9 Strażnika.

---

## 8. FRAZA KONTROLNA ZIARNA v16 — SPRAWA ZAMKNIĘTA

Fraza **JESION-KOBALT-16-ZATRZASK** została nadana przez Claude Code według
wzorca poprzednich Ziaren. Nexus w panelu jej nie widział, więc pozostaje
niepotwierdzona i taka już zostanie.

Sprawa zamknięta bez potwierdzania: **v17 zastępuje v16 jako bieżące Ziarno**,
a fraza v17 pochodzi z panelu, od Nexusa.

Uboczny skutek tamtej frazy: człon ZATRZASK trafił do wyszukiwania jako
kandydat na pojęcie projektu, którym nigdy nie był. Pojęcie Zatrzask powstało
później i osobno — jest teraz w glosariuszu.

---

## 9. REJESTR KOMUNIKACJI — STAN

`docs/komunikacja/rejestr.md`. Panel 16, Opus 5:
R 0 · **E 3** · O 0 · D 0 · G 0 · Z 0 — tarcia 3, trafienia 3.

**Litera E po raz trzeci w trzech kolejnych panelach — 14, 15, 16. To wzorzec,
nie pojedyncze wystąpienie.** Stała słabość nazewnicza: nazwa dwuznaczna
przechodzi do kanonu i wychodzi na jaw dopiero przy użyciu.
Reguła: nazwę sprawdza się na dwuznaczność przed zapisem do kanonu, nie po
zgłoszeniu przez Suwerena.

Trafienia to trzy zatrzymania Claude Code przed dopisaniem czegoś, czego kanon
nie daje: czas ważności meldunku bez telefonu, piąte znaczenie słowa „sesja",
brak liczby dla wieku Ostatniego dowodu Awatara. Wszystkie trzy słuszne.

---

## 10. ZASADY POTWIERDZONE — NOWE W v17

- **Glosariusz definiuje, ADR rozstrzyga.** Przy rozbieżności o mechanice
  obowiązuje ADR, a rozbieżność idzie jako punkt otwarty.
- **Jedna nazwa na jedną wielkość.** Nazwa pasująca do dwóch bytów nie
  rozstrzyga niczego, więc nie jest nazwą.
- **Nazwa pliku jest identyfikatorem zamkniętego zapisu**, nie tekstem
  dokumentu — reguły nazewnicze jej nie sięgają.
- **Zatrzymanie przed konfabulacją jest wykonaniem reguły**, nie brakiem
  wykonania zadania.

**W mocy z v8–v16:** wszystkie zasady wymienione w Ziarnie v16 sekcja 6.

---

## 11. NASTĘPNA POZYCJA

**Rekomendacja: trzeci producent meldunku** — gaszenie obecności z końcem
sesji gry.

Powód: to jedyny punkt otwarty, w którym kanon już orzekł skutek, a kodu
realizującego ten skutek nie ma wcale. Pozostałe pozycje czekają na
rozstrzygnięcie, ta czeka wyłącznie na budowę. Punkt O11 stoi za nią, bo
wymaga tego samego pojęcia sesji gry i lepiej go przerabiać, gdy sesja gry
istnieje już w module, nie tylko w glosariuszu.
