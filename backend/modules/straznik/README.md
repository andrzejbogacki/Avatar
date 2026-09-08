# Moduł: Strażnik GPS

Dokumentacja modułu: `pakiet_startowy_claude_code/docs/moduly/straznik.md`
Decyzja: `pakiet_startowy_claude_code/docs/adr/ADR-011-straznik-gps.md`

Strażnik rozstrzyga jedną rzecz: czy Awatar jest obecny ciałem w granicach
planszy fizycznej. Nie ustala, gdzie dokładnie stoi. Zgrubność jest kanonem,
nie brakiem staranności.

## Stan zapisany

Geometria planszy z punktu 2.3 ADR-011, detektor przekroczenia granicy
z punktów 2.2 i 2.7 oraz bezpiecznik ciszy sprzętu z punktów 2.8 i 2.9 —
funkcje czyste, bez zależności zewnętrznych, bez stanu własnego i bez zegara.

```
straznik/
├── config/index.js              # promień średni Ziemi (z WGS84), zakresy, typy, stany, bezpiecznik ciszy
├── src/geometria/
│   ├── wspolrzedne.js           # walidacja punktu — wspólna dla obu typów
│   ├── okrag.js                 # odległość po wielkim kole + test przynależności
│   ├── wielokat.js              # test przecięć promienia + odległość od krawędzi
│   └── index.js                 # fasada: dwa typy, odległość, bufor planszy
├── src/obecnosc/
│   ├── wejscie.js               # walidacja wspólna obu producentów meldunku
│   ├── granica.js               # przekroczenie granicy → stan i meldunek
│   ├── cisza.js                 # bezpiecznik ciszy i zsunięcie warunkowe
│   └── index.js                 # fasada obecności: dwaj producenci
├── test/geometria.test.js       # 44 testy
├── test/obecnosc.test.js        # 16 testów
├── test/cisza.test.js           # 25 testów
├── test/bez_zegara.test.js      # 3 testy — dozór zakazu odczytu zegara
├── index.js                     # kontrakt publiczny modułu
└── README.md
```

## Użycie

```js
const { geometria } = require('./backend/modules/straznik');

geometria.czyWewnatrzKsztaltu(
    { szerokosc_geo: 54.351, dlugosc_geo: 18.65 },
    { typ: 'okrag', srodek: { szerokosc_geo: 54.35, dlugosc_geo: 18.65 }, promien_m: 1000 },
); // true

geometria.czyWewnatrzKsztaltu(
    { szerokosc_geo: 1, dlugosc_geo: 1 },
    { typ: 'wielokat', wierzcholki: [ /* co najmniej 3 punkty */ ] },
); // true | false
```

```js
const { obecnosc } = require('./backend/modules/straznik');

obecnosc.wykryjZmianeStanu(
    'obecny',
    { szerokosc_geo: 54.36, dlugosc_geo: 18.65 },
    { typ: 'okrag', srodek: { szerokosc_geo: 54.35, dlugosc_geo: 18.65 }, promien_m: 1000 },
    { bufor_m: 50, zrodlo_dowodu: 'terminal' },
);
// { stan: 'duch', meldunek: { stan: 'duch', zrodlo_dowodu: 'terminal' } }
```

Meldunek powstaje wyłącznie przy zmianie stanu. Brak zmiany zwraca
`meldunek: null` — cisza znaczy „bez zmian".

Drugi producent meldunku orzeka nie z pozycji, tylko z upływu. Rozładowany
telefon nic nie wyśle, więc system nie dowiaduje się, że Awatar wyszedł —
dowiaduje się, że przestał potwierdzać. Po dwóch godzinach ciszy (kanon
ADR-011 2.8) obecność gaśnie, chyba że przed ciszą istniał drugi dowód:
wtedy schodzi na meldunek o czasie ważności (2.9).

```js
obecnosc.wykryjSkutekCiszy(
    'obecny',
    { rodzaj: 'terminal', chwila_uzyskania_ms: 1788000000000 },   // ostatni dowód Awatara
    { chwila_ostatniego_meldunku_ms: 1788004000000, chwila_biezaca_ms: 1788011200000 },
    { okno_zsunietego_meldunku_ms: 1800000, zrodlo_dowodu: 'terminal' },
);
// { stan: 'zsuniety',
//   meldunek: { stan: 'zsuniety', zrodlo_dowodu: 'terminal', wazny_do_ts: '…' } }
```

Obie chwile podaje węzeł — moduł je odejmuje i formatuje, nigdy nie odczytuje.
`ostatni_dowod` jest polem Awatara i mówi, czym ten człowiek potwierdził
obecność ostatnim razem; `zrodlo_dowodu` jest polem planszy i mówi, co plansza
dopuszcza. Punkt 2.9 pyta o Awatara — plansza z terminalem nie dowodzi niczego
o kimś, kto go nie dotknął.

Jednostka odległości: metr. Model: kula o promieniu średnim R1 (IUGG), liczonym
w `config/` z elipsoidy WGS84 — żadnej liczby nie wpisano ręcznie.

## Czego moduł nie robi

- Nie przyjmuje ani nie przekazuje współrzędnych dalej — werdykt powstaje na
  urządzeniu, na zewnątrz idzie sam stan (ADR-011 2.1).
- Nie nadaje wartości buforowi planszy, tolerancji pomiaru ani progowi
  optymalizacji wierzchołków. To parametry organizatora — parametr nie ma
  wartości domyślnej, więc `config/` ich nie zawiera, a brak bufora na wejściu
  jest błędem, nie zerem.
- Nie czyta zegara — ani teraz, ani po cichu później: `test/bez_zegara.test.js`
  czyta źródła modułu i odrzuca `Date.now()`, `new Date()` bez argumentu,
  `performance.now`, `process.hrtime`, `setTimeout` i `setInterval`. Chwile
  przychodzą wejściem od węzła (ADR-012 punkt 7). Jedyny meldunek niosący
  chwilę to meldunek zsunięty — punkt 2.9 nazywa go meldunkiem o czasie
  ważności, a bez terminu byłby mocniejszy od tego, co zastąpił.
- Nie przywraca obecności po dotknięciu terminala w trakcie ciszy i nie
  ogranicza wieku Ostatniego dowodu Awatara. Oba nierozstrzygnięte —
  ADR-011 punkty otwarte O10 i O11.
- Nie obsługuje opaski (2.10) ani podpisu kształtu (2.6).

## Testy

```
cd backend && npm test
```
