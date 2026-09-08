# ADR-011: Strażnik GPS

**Status:** przyjęty
**Data:** 08.09.2026
**Panele źródłowe:** 11, 12, 13, 14, 15
**Zastępuje:** wcześniejszą wersję ADR-011 wytworzoną w Panelu 13, która nigdy nie
dotarła do repozytorium. Numer 011 zachowany — Strażnik GPS był i pozostaje jego
tematem. Katalog ADR w repozytorium kończy się na ADR-009; numery 010 i 011
oczekują na wgranie.

---

## 1. Kontekst

Strażnik GPS rozstrzyga jedną rzecz: czy Awatar jest obecny ciałem w granicach
planszy fizycznej. Nie ustala, gdzie dokładnie stoi. Precyzja jest ograniczona
świadomie.

Moduł blokuje integrację modułu bayo i stoi na pierwszej pozycji w kolejności
rozwoju.

Rozstrzygnięcie musiało pogodzić dwa wymagania stojące naprzeciw siebie:
współrzędne Awatara nie mogą opuszczać jego urządzenia, a jednocześnie werdykt
o obecności musi być wiarygodny dla pozostałych uczestników.

---

## 2. Decyzje

### 2.1 Werdykt powstaje na urządzeniu

Telefon pobiera kształt planszy i sam liczy przynależność. Współrzędne nie
opuszczają urządzenia w żadnej postaci. Na zewnątrz idzie wyłącznie stan:
wewnątrz albo na zewnątrz.

Węzeł dystrybuuje kształt. Węzeł nie jest sędzią.

### 2.2 Telefon zgłasza zmiany stanu

Brak cyklicznego odpytywania. Meldunek powstaje w chwili przekroczenia granicy,
nie w regularnym takcie.

### 2.3 Geometria kształtu — dwa typy kanoniczne

| Typ | Zapis | Test przynależności |
|---|---|---|
| okrąg | punkt środkowy, promień | odległość mniejsza od promienia |
| wielokąt | lista wierzchołków | test przecięć promienia |

Trzeciego typu nie ma. Obrys z mapy realnej jest **sposobem narysowania
wielokąta**, nie odrębnym bytem — narzędzie mapowe pracuje wyłącznie
w piaskownicy, a po zamrożeniu w kształcie zostaje sam wielokąt.

Zależność zewnętrzna od dostawcy map nie wchodzi do warstwy rozstrzygającej
obecność.

**Parametr organizatora:** próg optymalizacji wierzchołków przy zamrożeniu.
Granica administracyjna pobrana z mapy potrafi nieść setki wierzchołków, a
podpisana treść wchodzi w budżet pakietu sieci kratowej.

**Granica należy do zewnętrza — oba typy.** Punkt leżący dokładnie na krawędzi
wielokąta albo w jego wierzchołku jest na zewnątrz, tak samo jak punkt
w odległości równej promieniowi okręgu. Odległość mniejsza od promienia, nie
mniejsza-równa. To kanon, nie wniosek z analogii — implementacja nie wyprowadza
tej reguły samodzielnie, bierze ją stąd.

**Zakres kształtu.** Plansza nie może przecinać południka 180° ani obejmować
bieguna. Kształt o rozpiętości długości geograficznej powyżej 180° jest
odrzucany jawnym błędem przy zamrożeniu. Odmowa jest jawna, nigdy cicha
naprawa kształtu.

**Odległość liczy się po kuli.** Promień średni R1 wyliczany z elipsoidy WGS84
wzorem IUGG — (2a + b) / 3, gdzie a to półoś wielka, b półoś mała. Model kulisty
jest kanonem Strażnika, nie wyborem implementacji: żadna liczba promienia nie
jest wpisana, obie stałe elipsoidy stoją w konfiguracji modułu.

### 2.4 Bufor planszy jest osobnym polem

Jedna plansza może mieć wiele progów bez mnożenia kształtów. Bufor nie wchodzi
pod podpis kształtu. Tolerancja błędu pomiaru to osobne pole — nie ten sam byt
co bufor.

### 2.5 Źródło dowodu obecności — trzy wartości

`terminal`, `nadajnik`, `brak`. Pole obowiązkowe przy każdym meldunku obecności
ciałem.

### 2.6 Kształt jest niezmienny po wyjściu z piaskownicy

Zmiana kształtu oznacza nową planszę, nie nową wersję istniejącej. Kształt
podpisany kluczem Awatara właściciela planszy. Plansza dziedziczy tożsamość
właściciela — nie ma własnej.

### 2.7 Przekroczenie granicy gasi obecność ciałem natychmiast

Gaśnie obecność fizyczna (pozycja 6). Więź z grą (pozycja 3) zostaje. Awatar
poza granicą uczestniczy duchem i zachowuje uprawnienia wynikające z udziału,
traci wyłącznie te wynikające z ciała. Powiadomienie idzie do Awatara i do
organizatora.

### 2.8 Cisza sprzętu nie dowodzi nieobecności

Utrata sygnału i rozładowany telefon uruchamiają **bezpiecznik ciszy** — 2 godziny
do wylogowania. To inny mechanizm niż przekroczenie granicy.

**Dwie nazwy, dwie wielkości, żadnego wspólnego słowa.** Wielkość z tego punktu
nazywa się wyłącznie „bezpiecznik ciszy" i jest kanonem. Wielkość z punktu 2.9
nazywa się wyłącznie „okno zsuniętego meldunku" i jest parametrem organizatora.
Nazwa „bezpiecznik czasowy" wychodzi z użycia: pasowała do obu, więc nie
rozstrzygała, która z nich jest nastawiana, a która nie.

Rozróżnienie, z którego bierze się cały punkt: system nie dowiaduje się, że
Awatar wyszedł. Dowiaduje się, że przestał potwierdzać. Wyjście ma werdykt
i gasi natychmiast (2.7); cisza werdyktu nie ma i dlatego dostaje bezpiecznik.

**Osiągnięcie progu wywołuje skutek.** Upływ ciszy **równy** dwóm godzinom już
gasi obecność; upływ równy końcowi okna już wygasza zsunięcie. „2 godziny do
wylogowania" to termin, który upływa, nie granica, po której trzeba jeszcze coś
dołożyć. To kanon, nie wniosek z analogii — implementacja bierze regułę stąd.

Konwencja jest tu odwrotna niż przy granicy planszy (2.3), gdzie równość
zostawia punkt na zewnątrz. Różnica jest rzeczowa: tam rozstrzyga się
przynależność do figury, tu upływ terminu. Dwie reguły brzegowe w jednym
module, każda uzasadniona osobno.

**Dwie godziny są kanonem, nie parametrem organizatora.** Wartość dotyczy
wiarygodności dowodu, nie kształtu gry — organizator nie dostaje jej do
nastawiania, bo skracając ją albo wydłużając zmieniałby to, ile znaczy cisza,
a nie to, jak gra się toczy. Stała mieszka w `config/` modułu. Długość okna
zsuniętego meldunku z punktu 2.9 jest czym innym i dlatego jest parametrem.

### 2.9 Zsunięcie o poziom przysługuje warunkowo

Po ucichnięciu telefonu obecność schodzi na meldunek o czasie ważności
**wyłącznie wtedy, gdy przed ciszą istniał drugi dowód** — terminal albo
nadajnik certyfikowany. Bez drugiego dowodu obecność gaśnie z upływem
bezpiecznika.

Powód: meldunek o czasie ważności nigdy nie był kanałem samodzielnym. Brak
sygnału nie może dawać więcej niż sygnał.

**Drugi dowód jest faktem o Awatarze, nie o planszy.** Awatar niesie własne
pole — ostatni potwierdzony dowód obecności (`terminal`, `nadajnik` albo
`brak`) wraz z chwilą jego uzyskania. Pole planszy `zrodlo_dowodu` (2.5)
zostaje osobno i mówi co innego: co plansza dopuszcza. Plansza wyposażona
w terminal nie dowodzi niczego o człowieku, który go nie dotknął. Nazwa
**Ostatni dowód Awatara** wchodzi do glosariusza jako TERMIN-KANDYDAT.

**Stan zsunięty jest trzecią wartością obecności.** `obecny`, `duch`,
`zsuniety`. Zmiana wobec Ziarna Transferu v13 punkt 2.3, które zamykało listę
na dwóch wartościach: zamknięcie padło przed rozstrzygnięciem punktu otwartego
O7, a ten punkt jest od niego nowszy. Zsunięta obecność nie jest ani obecnością
ciałem, ani duchem — żyje wyłącznie do chwili ważności swojego meldunku
i wygasa do `duch`, jeżeli telefon się nie odezwie.

**Parametr organizatora:** długość okna zsuniętego meldunku. Bez wartości
domyślnej — jej brak jest jawnym błędem, nigdy cichym zerem.

### 2.10 Opaska daje obecność ciałem, nie daje podpisu

Opaska jest nośnikiem identyfikatora odczytywanego przez sprzęt certyfikowany.
Pole źródła dowodu zapisuje wtedy `terminal` albo `nadajnik` — nigdy „opaska”.

Opaska nie niesie klucza w żadnej postaci. Podpis wymaga urządzenia z ekranem
i wprowadzaniem hasła. Uczestnik z samą opaską jest obecny i widoczny, lecz nie
głosuje, nie przystępuje i nie wykonuje ruchów wymagających podpisu.

**Parametr organizatora:** czy gra wymaga telefonu. Deklarowany przy zakładaniu
gry, widoczny przed przystąpieniem.

### 2.11 Ważność podpisu kształtu zależy od powodu zdjęcia klucza

`wycofanie` — sprzęt wymieniony, podpisy zostają ważne. `unieważnienie` — sprzęt
w cudzych rękach, podpisy tracą ważność od chwili zgłoszenia. Zdjęcie klucza
autoryzuje hasło konta. Rozstrzygnięcia szczegółowe: ADR-012.

### 2.12 Hierarchia źródeł — glosariusz definiuje, ADR rozstrzyga

Glosariusz definiuje pojęcia, ADR rozstrzyga mechanikę. Gdy oba mówią co innego
o mechanice, obowiązuje ADR.

Rozbieżność zgłasza się jako punkt otwarty. Nie poprawia się jej po cichu
w glosariuszu, bo cicha poprawka usuwa ślad po tym, że dwa dokumenty się
rozjechały — a ślad jest tu treścią, nie zaniedbaniem. Kolejność jest
rzeczowa, nie hierarchią godności: definicja nazywa byt, rozstrzygnięcie mówi,
jak ten byt działa i czego mu wolno.

Pierwszy przypadek objęty tą regułą: hasło Parametr organizatora oddawało
organizatorowi długość bezpiecznika ciszy, którą punkt 2.8 zastrzegł dla kanonu.
Obowiązuje punkt 2.8.

---

## 3. Alternatywy odrzucone

| Odrzucone | Powód |
|---|---|
| werdykt po stronie węzła | współrzędne musiałyby opuścić urządzenie |
| cykliczne odpytywanie pozycji | zużycie energii i strumień danych bez wartości dowodowej |
| jeden typ geometrii (wszystko wielokątem) | okrąg opisany dwiema liczbami puchnie do kilkudziesięciu par współrzędnych; stały błąd aproksymacji na granicy |
| trzy typy geometrii (obrys jako osobny byt) | trzy ścieżki kodu, trzy testy, trzy walidacje do rozjechania się |
| bufor wewnątrz kształtu | mnożyłby kształty tam, gdzie zmienia się wyłącznie próg |
| bezwarunkowe zsunięcie po ucichnięciu telefonu | wyłączenie telefonu tuż przed granicą zachowywałoby obecność, której nikt nie sprawdza |
| bezwarunkowe wygaszenie po ucichnięciu telefonu | awaria sprzętu traktowana jak opuszczenie planszy |
| opaska z własnym kluczem podpisu | sprzęt bez ekranu nie ma czym autoryzować; zabrana opaska daje napastnikowi ważne podpisy |
| opaska wyłącznie przedłużająca obecność zaczepioną | powiela regułę zsunięcia warunkowego, nie wnosi nowej |
| zegar urządzenia jako chwila rozstrzygająca | antydatowanie przez posiadacza przejętego sprzętu |
| pole planszy `zrodlo_dowodu` jako drugi dowód z punktu 2.9 | odpowiada na inne pytanie: czym plansza *dopuszcza* potwierdzać, nie czym ten Awatar potwierdził. Terminal na planszy dawałby zsunięcie każdemu, kto go nigdy nie dotknął |
| okno zsuniętego meldunku liczone od chwili sprawdzenia | późniejsze zapytanie przedłużałoby obecność, której nikt nie potwierdza; okno biegnie od początku ciszy |
| dwie godziny bezpiecznika jako parametr organizatora | nastawa zmieniałaby to, ile znaczy cisza — czyli siłę dowodu, nie kształt gry |
| skutek dopiero po **przekroczeniu** progu czasowego | „2 godziny do wylogowania" znaczyłoby wtedy „nieco ponad 2 godziny"; zapis wymagałby dopowiedzenia, żeby tłumaczyć sam siebie |
| plansza przecinająca południk 180° albo obejmująca biegun | drugi test geometryczny dla kształtu spoza zasięgu gry; cichy zły werdykt na granicy kosztuje więcej niż jawna odmowa zamrożenia |

---

## 4. Konsekwencje

**Przyjęte świadomie:**

- Uczestnik z jednym dowodem, faktycznie obecny, traci obecność ciałem po
  rozładowaniu telefonu.
- Uczestnik z samą opaską jest obecny i bezgłosy. Gry oparte na częstych
  decyzjach są dla niego niegrywalne — organizator ma to nazwać jawnie
  w opisie gry, nie ukryć w kodzie.
- Po zamrożeniu nie da się odtworzyć, że kształt pochodził z obrysu miasta.
  Aktualizacja granic administracyjnych oznacza nową planszę.
- Odległość po kuli niesie błąd względny do 0,5% wobec elipsoidy WGS84 — przy
  promieniu planszy 1 000 m to do 5 m. Przyjęty świadomie: jest mniejszy od
  zgrubności celowej Strażnika (punkt 1) i mieści się w błędzie odbiornika.
  Precyzja pozycji nie jest tu przedmiotem rozstrzygnięcia.
- Organizator nie założy planszy na przecięciu południka 180° ani wokół
  bieguna. Taki kształt nie ma obejścia — ma odmowę.
- Stan obecności ma trzy wartości, nie dwie. Każdy odbiorca meldunku musi znać
  `zsuniety` i wiedzieć, że ten stan sam z siebie wygasa.
- Awatar zyskuje pole własne — ostatni dowód obecności wraz z chwilą uzyskania.
  Bez niego punktu 2.9 nie da się rozstrzygnąć, bo pole planszy odpowiada na
  inne pytanie.

**Wymagane do zbudowania:**

- dwa testy geometryczne po stronie urządzenia,
- próg optymalizacji wierzchołków po stronie piaskownicy,
- trzy nowe parametry organizatora w konfiguracji planszy i gry.

---

## 5. Punkty otwarte

| Nr | Sprawa | Stan |
|---|---|---|
| **O1** | **[BRAK DANYCH]** — treść do odtworzenia z Ziarna Transferu v13 | otwarty |
| O2 | ważność podpisu wobec rotacji klucza | ZAMKNIĘTY, Panel 14 |
| O3 | autoryzacja zdjęcia klucza | ZAMKNIĘTY, Panel 14 |
| O4 | przydatność kluczy Awatara do podpisywania kształtów | ZAMKNIĘTY warunkowo, Panel 14 — klucze jeszcze nie istnieją |
| O5 | reprezentacja geometrii w kodzie | ZAMKNIĘTY, Panel 15 — punkt 2.3 |
| **O6** | **[BRAK DANYCH]** — treść do odtworzenia z Ziarna Transferu v13 | otwarty |
| O7 | padnięcie telefonu | ZAMKNIĘTY, Panel 15 — punkt 2.9 |
| O8 | opaska bez telefonu | ZAMKNIĘTY, Panel 15 — punkt 2.10 |
| **O9** | **[BRAK DANYCH]** — treść do odtworzenia z Ziarna Transferu v13 | otwarty |
| **O10** | dowód uzyskany **w trakcie** ciszy — odbicie przy terminalu przy padniętym telefonie. Ziarno v12 punkt 1.11 mówi, że przywraca mocniejszy poziom; punkt 2.9 rozstrzyga wyłącznie dowód sprzed ciszy. Mechanizm przywracania nierozstrzygnięty i niezbudowany | otwarty |
| **O11** | ważność Ostatniego dowodu Awatara — czy dotknięcie terminala sprzed trzech dni nadal jest drugim dowodem. Dziś moduł nie ogranicza wieku dowodu, bo ograniczenia nie ma skąd wziąć | otwarty |
| O12 | próg czasowy — czy upływ równy progowi już wywołuje skutek | ZAMKNIĘTY 08.09.2026 — tak, punkt 2.8. Interpretacja logiczna zastąpiona kanonem, zachowanie kodu bez zmian |
| **O13** | czas ważności meldunku uczestnika bez telefonu — szósty parametr organizatora, niezdefiniowany. Nie jest tym samym co okno zsuniętego meldunku z punktu 2.9: tamto dotyczy Awatara, którego telefon ucichł, i wymaga drugiego dowodu sprzed ciszy; ten dotyczy uczestnika, który telefonu nie ma wcale (punkt 2.10). Glosariusz wymienia go w haśle Parametr organizatora, ADR-011 nie nadaje mu długości, a lista pięciu parametrów w Ziarnie v16 sekcja 5 go nie zna | otwarty |

Poza numeracją, do rozstrzygnięcia osobno:

- co uruchamia tryb czujności Bluetooth — automat, człowiek czy parametr Awatara,
- nadajnik niosący numer wersji kształtu — do przemyślenia po zamrożeniu kształtu,
- siedem pojęć Strażnika GPS do glosariusza — własny wątek.

---

## 6. Zasady utrwalone przez ten ADR

- Weryfikuje się człowieka, nie jego sprzęt.
- Węzeł dystrybuuje, nie sądzi.
- Awatar liczy sam, ale nie na własnych danych opuszczających urządzenie.
- Trwałe osobno, zmienne osobno.
- Brak sygnału nie daje więcej niż sygnał.
- Zakaz konfabulacji: nieznany parametr = stop, decyzja do Suwerena.

---

**Miejsce docelowe:** `pakiet_startowy_claude_code/docs/adr/ADR-011-straznik-gps.md`
**Wgrywanie:** zablokowane do czasu decyzji z Ziarna Transferu v14-REPO.
