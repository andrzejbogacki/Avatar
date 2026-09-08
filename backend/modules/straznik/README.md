# Moduł: Strażnik GPS

Dokumentacja modułu: `pakiet_startowy_claude_code/docs/moduly/straznik.md`
Decyzja: `pakiet_startowy_claude_code/docs/adr/ADR-011-straznik-gps.md`

Strażnik rozstrzyga jedną rzecz: czy Awatar jest obecny ciałem w granicach
planszy fizycznej. Nie ustala, gdzie dokładnie stoi. Zgrubność jest kanonem,
nie brakiem staranności.

## Stan zapisany

Geometria planszy z punktu 2.3 ADR-011 oraz detektor przekroczenia granicy
z punktów 2.2 i 2.7 — funkcje czyste, bez zależności zewnętrznych, bez stanu
własnego i bez zegara.

```
straznik/
├── config/index.js              # promień średni Ziemi (z WGS84), zakresy, typy kształtu
├── src/geometria/
│   ├── wspolrzedne.js           # walidacja punktu — wspólna dla obu typów
│   ├── okrag.js                 # odległość po wielkim kole + test przynależności
│   ├── wielokat.js              # test przecięć promienia + odległość od krawędzi
│   └── index.js                 # fasada: dwa typy, odległość, bufor planszy
├── src/obecnosc/
│   ├── stan.js                  # przekroczenie granicy → stan i meldunek
│   └── index.js                 # fasada obecności
├── test/geometria.test.js       # 44 testy
├── test/obecnosc.test.js        # 15 testów
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

Jednostka odległości: metr. Model: kula o promieniu średnim R1 (IUGG), liczonym
w `config/` z elipsoidy WGS84 — żadnej liczby nie wpisano ręcznie.

## Czego moduł nie robi

- Nie przyjmuje ani nie przekazuje współrzędnych dalej — werdykt powstaje na
  urządzeniu, na zewnątrz idzie sam stan (ADR-011 2.1).
- Nie nadaje wartości buforowi planszy, tolerancji pomiaru ani progowi
  optymalizacji wierzchołków. To parametry organizatora — parametr nie ma
  wartości domyślnej, więc `config/` ich nie zawiera, a brak bufora na wejściu
  jest błędem, nie zerem.
- Nie czyta zegara. Chwilę rozstrzygającą nadaje węzeł przy przyjęciu
  podpisanej treści (ADR-012 punkt 7), więc meldunek nie niesie czasu.
- Nie obsługuje bezpiecznika ciszy sprzętu, zsunięcia warunkowego, opaski ani
  podpisu kształtu. Punkty 2.4–2.11 ADR-011 czekają.

## Testy

```
cd backend && npm test
```
