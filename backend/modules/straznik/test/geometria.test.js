'use strict';

// Strażnik GPS — geometria planszy (ADR-011, punkt 2.3).
// Dwa typy kanoniczne: okrąg i wielokąt. Trzeciego typu nie ma.
// Jednostka odległości: metr. Model: kula o promieniu średnim z config/.

const test = require('node:test');
const assert = require('node:assert/strict');

const konfig = require('../config');
const { odlegloscMetry, czyWewnatrzOkregu } = require('../src/geometria/okrag');

// --- konfiguracja ---------------------------------------------------------

test('config: promień średni Ziemi wyliczony z elipsoidy WGS84, nie wpisany ręcznie', () => {
    const { POLOS_WIELKA_M, SPLASZCZENIE_ODWROTNE } = konfig.ZIEMIA.WGS84;
    const polosMala = POLOS_WIELKA_M * (1 - 1 / SPLASZCZENIE_ODWROTNE);
    const oczekiwany = (2 * POLOS_WIELKA_M + polosMala) / 3;

    assert.equal(konfig.ZIEMIA.PROMIEN_SREDNI_M, oczekiwany);
    // R1 wg IUGG: 6 371 008,771 m — kontrola rzędu wielkości.
    assert.ok(Math.abs(konfig.ZIEMIA.PROMIEN_SREDNI_M - 6371008.771) < 0.001);
});

// --- odległość ------------------------------------------------------------

test('odległość: jeden stopień szerokości geograficznej to długość łuku promienia średniego', () => {
    const d = odlegloscMetry(
        { szerokosc_geo: 0, dlugosc_geo: 0 },
        { szerokosc_geo: 1, dlugosc_geo: 0 },
    );
    const oczekiwana = konfig.ZIEMIA.PROMIEN_SREDNI_M * (Math.PI / 180);

    assert.ok(Math.abs(d - oczekiwana) < 1e-6, `odległość ${d} m, oczekiwano ${oczekiwana} m`);
});

test('odległość: punkt sam od siebie ma odległość zero', () => {
    const p = { szerokosc_geo: 54.35, dlugosc_geo: 18.65 };
    assert.equal(odlegloscMetry(p, p), 0);
});

test('odległość: jest symetryczna', () => {
    const a = { szerokosc_geo: 54.35, dlugosc_geo: 18.65 };
    const b = { szerokosc_geo: 52.23, dlugosc_geo: 21.01 };
    assert.equal(odlegloscMetry(a, b), odlegloscMetry(b, a));
});

// --- okrąg ----------------------------------------------------------------

const OKRAG = {
    typ: 'okrag',
    srodek: { szerokosc_geo: 54.35, dlugosc_geo: 18.65 },
    promien_m: 1000,
};

test('okrąg: punkt bliżej niż promień jest wewnątrz', () => {
    // ~111,19 m na północ od środka.
    const punkt = { szerokosc_geo: 54.351, dlugosc_geo: 18.65 };
    assert.equal(czyWewnatrzOkregu(punkt, OKRAG), true);
});

test('okrąg: punkt dalej niż promień jest na zewnątrz', () => {
    // ~1,1 km na północ od środka.
    const punkt = { szerokosc_geo: 54.36, dlugosc_geo: 18.65 };
    assert.equal(czyWewnatrzOkregu(punkt, OKRAG), false);
});

test('okrąg: punkt dokładnie na granicy jest na zewnątrz — ADR-011 mówi "odległość mniejsza od promienia"', () => {
    // Granica budowana z pomiaru, nie z drugiego przeliczenia — inaczej test
    // mierzyłby błąd zaokrągleń, nie regułę.
    const punkt = { szerokosc_geo: 54.36, dlugosc_geo: 18.65 };
    const okragDokladny = { ...OKRAG, promien_m: odlegloscMetry(punkt, OKRAG.srodek) };

    assert.equal(czyWewnatrzOkregu(punkt, okragDokladny), false);
});

test('okrąg: środek własnego okręgu jest wewnątrz', () => {
    assert.equal(czyWewnatrzOkregu(OKRAG.srodek, OKRAG), true);
});

// --- walidacja wejścia ----------------------------------------------------

test('okrąg: promień niedodatni jest odrzucany', () => {
    const zly = { ...OKRAG, promien_m: 0 };
    assert.throws(() => czyWewnatrzOkregu(OKRAG.srodek, zly), /promien_m/);
});

test('okrąg: brak promienia jest odrzucany, nie zastępowany wartością domyślną', () => {
    const zly = { typ: 'okrag', srodek: OKRAG.srodek };
    assert.throws(() => czyWewnatrzOkregu(OKRAG.srodek, zly), /promien_m/);
});

test('okrąg: szerokość geograficzna poza zakresem jest odrzucana', () => {
    const zly = { szerokosc_geo: 91, dlugosc_geo: 0 };
    assert.throws(() => czyWewnatrzOkregu(zly, OKRAG), /szerokosc_geo/);
});

test('okrąg: długość geograficzna poza zakresem jest odrzucana', () => {
    const zly = { szerokosc_geo: 0, dlugosc_geo: 181 };
    assert.throws(() => czyWewnatrzOkregu(zly, OKRAG), /dlugosc_geo/);
});

test('okrąg: współrzędna nieliczbowa jest odrzucana', () => {
    const zly = { szerokosc_geo: '54.35', dlugosc_geo: 18.65 };
    assert.throws(() => czyWewnatrzOkregu(zly, OKRAG), /szerokosc_geo/);
});

// --- wielokąt -------------------------------------------------------------

const { czyWewnatrzWielokata } = require('../src/geometria/wielokat');

// Kwadrat: długość 0..2, szerokość 0..2. Wierzchołki przeciwnie do ruchu wskazówek.
const KWADRAT = {
    typ: 'wielokat',
    wierzcholki: [
        { szerokosc_geo: 0, dlugosc_geo: 0 },
        { szerokosc_geo: 0, dlugosc_geo: 2 },
        { szerokosc_geo: 2, dlugosc_geo: 2 },
        { szerokosc_geo: 2, dlugosc_geo: 0 },
    ],
};

test('wielokąt: punkt w środku kwadratu jest wewnątrz', () => {
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 1, dlugosc_geo: 1 }, KWADRAT), true);
});

test('wielokąt: punkt poza kwadratem jest na zewnątrz', () => {
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 1, dlugosc_geo: 3 }, KWADRAT), false);
});

test('wielokąt: punkt na krawędzi jest na zewnątrz — ADR-011 2.3, granica należy do zewnętrza', () => {
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 2, dlugosc_geo: 1 }, KWADRAT), false);
});

test('wielokąt: punkt w wierzchołku jest na zewnątrz', () => {
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 0, dlugosc_geo: 0 }, KWADRAT), false);
});

test('wielokąt: punkt na przedłużeniu krawędzi poziomej jest na zewnątrz', () => {
    // Klasyczna pułapka testu przecięć: promień trafia dokładnie w wierzchołek.
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 2, dlugosc_geo: 5 }, KWADRAT), false);
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 0, dlugosc_geo: 5 }, KWADRAT), false);
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 2, dlugosc_geo: -5 }, KWADRAT), false);
});

test('wielokąt: kolejność wierzchołków nie zmienia werdyktu', () => {
    const odwrocony = { ...KWADRAT, wierzcholki: [...KWADRAT.wierzcholki].reverse() };
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 1, dlugosc_geo: 1 }, odwrocony), true);
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 1, dlugosc_geo: 3 }, odwrocony), false);
});

// Kształt wklęsły „C" otwarty na wschód — wcięcie musi zostać rozpoznane.
const KSZTALT_C = {
    typ: 'wielokat',
    wierzcholki: [
        { szerokosc_geo: 0, dlugosc_geo: 0 },
        { szerokosc_geo: 4, dlugosc_geo: 0 },
        { szerokosc_geo: 4, dlugosc_geo: 4 },
        { szerokosc_geo: 3, dlugosc_geo: 4 },
        { szerokosc_geo: 3, dlugosc_geo: 1 },
        { szerokosc_geo: 1, dlugosc_geo: 1 },
        { szerokosc_geo: 1, dlugosc_geo: 4 },
        { szerokosc_geo: 0, dlugosc_geo: 4 },
    ],
};

test('wielokąt wklęsły: punkt we wcięciu jest na zewnątrz', () => {
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 2, dlugosc_geo: 3 }, KSZTALT_C), false);
});

test('wielokąt wklęsły: punkt w ramieniu jest wewnątrz', () => {
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 3.5, dlugosc_geo: 3 }, KSZTALT_C), true);
});

test('wielokąt wklęsły: punkt w grzbiecie jest wewnątrz', () => {
    assert.equal(czyWewnatrzWielokata({ szerokosc_geo: 2, dlugosc_geo: 0.5 }, KSZTALT_C), true);
});

// --- walidacja wielokąta --------------------------------------------------

test('wielokąt: mniej niż trzy wierzchołki jest odrzucane', () => {
    const zly = { typ: 'wielokat', wierzcholki: KWADRAT.wierzcholki.slice(0, 2) };
    assert.throws(() => czyWewnatrzWielokata({ szerokosc_geo: 1, dlugosc_geo: 1 }, zly), /wierzcholki/);
});

test('wielokąt: brak listy wierzchołków jest odrzucany', () => {
    assert.throws(() => czyWewnatrzWielokata({ szerokosc_geo: 1, dlugosc_geo: 1 }, { typ: 'wielokat' }), /wierzcholki/);
});

test('wielokąt: błędna współrzędna wierzchołka jest odrzucana', () => {
    const zly = {
        typ: 'wielokat',
        wierzcholki: [...KWADRAT.wierzcholki.slice(0, 3), { szerokosc_geo: 2, dlugosc_geo: 200 }],
    };
    assert.throws(() => czyWewnatrzWielokata({ szerokosc_geo: 1, dlugosc_geo: 1 }, zly), /dlugosc_geo/);
});

test('wielokąt: rozpiętość długości ponad 180 stopni jest odrzucana jawnym błędem', () => {
    // ADR-011 2.3: plansza nie może przecinać południka 180°.
    // Blokada techniczna zamiast cichego złego werdyktu.
    const przezPoludnik = {
        typ: 'wielokat',
        wierzcholki: [
            { szerokosc_geo: 0, dlugosc_geo: -170 },
            { szerokosc_geo: 0, dlugosc_geo: 170 },
            { szerokosc_geo: 2, dlugosc_geo: 170 },
            { szerokosc_geo: 2, dlugosc_geo: -170 },
        ],
    };
    assert.throws(
        () => czyWewnatrzWielokata({ szerokosc_geo: 1, dlugosc_geo: 175 }, przezPoludnik),
        /rozpietosc/,
    );
});

test('wielokąt: kształt obejmujący biegun jest odrzucany — ADR-011 2.3', () => {
    // Objęcie bieguna wymaga obwodu przez wszystkie południki, więc rozpiętość
    // długości zawsze przekracza 180°. Ten sam strażnik, inny powód.
    const wokolBieguna = {
        typ: 'wielokat',
        wierzcholki: [
            { szerokosc_geo: 80, dlugosc_geo: -180 },
            { szerokosc_geo: 80, dlugosc_geo: -90 },
            { szerokosc_geo: 80, dlugosc_geo: 0 },
            { szerokosc_geo: 80, dlugosc_geo: 90 },
        ],
    };
    assert.throws(
        () => czyWewnatrzWielokata({ szerokosc_geo: 90, dlugosc_geo: 0 }, wokolBieguna),
        /rozpietosc/,
    );
});

// --- fasada: dwa typy kanoniczne, trzeciego nie ma -----------------------

const geometria = require('../src/geometria');

test('fasada: kieruje okrąg do testu odległości', () => {
    assert.equal(geometria.czyWewnatrzKsztaltu({ szerokosc_geo: 54.35, dlugosc_geo: 18.65 }, OKRAG), true);
});

test('fasada: kieruje wielokąt do testu przecięć', () => {
    assert.equal(geometria.czyWewnatrzKsztaltu({ szerokosc_geo: 1, dlugosc_geo: 1 }, KWADRAT), true);
    assert.equal(geometria.czyWewnatrzKsztaltu({ szerokosc_geo: 1, dlugosc_geo: 3 }, KWADRAT), false);
});

test('fasada: trzeci typ kształtu jest odrzucany — ADR-011 2.3 zna dwa', () => {
    const obrys = { typ: 'obrys_mapy', wierzcholki: KWADRAT.wierzcholki };
    assert.throws(() => geometria.czyWewnatrzKsztaltu({ szerokosc_geo: 1, dlugosc_geo: 1 }, obrys), /typ/);
});

test('fasada: brak typu jest odrzucany, nie zgadywany z kształtu pól', () => {
    const bezTypu = { wierzcholki: KWADRAT.wierzcholki };
    assert.throws(() => geometria.czyWewnatrzKsztaltu({ szerokosc_geo: 1, dlugosc_geo: 1 }, bezTypu), /typ/);
});

test('kontrakt modułu: Strażnik wystawia geometrię i konfigurację', () => {
    const straznik = require('../index');
    assert.equal(typeof straznik.geometria.czyWewnatrzKsztaltu, 'function');
    assert.equal(typeof straznik.geometria.czyWewnatrzOkregu, 'function');
    assert.equal(typeof straznik.geometria.czyWewnatrzWielokata, 'function');
    assert.equal(typeof straznik.geometria.odlegloscMetry, 'function');
    assert.equal(straznik.konfig.ZIEMIA.PROMIEN_SREDNI_M, konfig.ZIEMIA.PROMIEN_SREDNI_M);
});

// --- odległość od kształtu i bufor planszy (ADR-011 2.4) ---------------------
// Bufor planszy to promień dokładany na zewnątrz figury (Ziarno v12 §3), pole
// osobne od kształtu. Odległość ze znakiem: ujemna wewnątrz, dodatnia na
// zewnątrz, zero na granicy. Przy buforze 0 reguła wraca do „granica należy
// do zewnętrza" z ADR-011 2.3.

const { odlegloscOdKsztaltu, czyWewnatrzZBuforem } = require('../src/geometria');

test('odległość od okręgu: środek leży o promień wewnątrz granicy', () => {
    const d = odlegloscOdKsztaltu(OKRAG.srodek, OKRAG);
    assert.ok(Math.abs(d + OKRAG.promien_m) < 1e-6, `odległość ${d} m, oczekiwano ${-OKRAG.promien_m} m`);
});

test('odległość od okręgu: punkt na granicy ma odległość zero', () => {
    const punkt = { szerokosc_geo: 54.36, dlugosc_geo: 18.65 };
    const okragDokladny = { ...OKRAG, promien_m: odlegloscMetry(punkt, OKRAG.srodek) };

    assert.ok(Math.abs(odlegloscOdKsztaltu(punkt, okragDokladny)) < 1e-6);
});

test('odległość od okręgu: punkt na zewnątrz ma odległość dodatnią równą nadmiarowi', () => {
    const punkt = { szerokosc_geo: 54.36, dlugosc_geo: 18.65 };
    const nadmiar = odlegloscMetry(punkt, OKRAG.srodek) - OKRAG.promien_m;

    assert.ok(Math.abs(odlegloscOdKsztaltu(punkt, OKRAG) - nadmiar) < 1e-6);
});

// Kwadrat równikowy o boku 2° — na równiku 1° długości i szerokości ma tę samą
// długość łuku, więc wynik da się sprawdzić rachunkiem, nie drugą implementacją.
const KWADRAT_ROWNIKOWY = {
    typ: 'wielokat',
    wierzcholki: [
        { szerokosc_geo: -1, dlugosc_geo: -1 },
        { szerokosc_geo: -1, dlugosc_geo: 1 },
        { szerokosc_geo: 1, dlugosc_geo: 1 },
        { szerokosc_geo: 1, dlugosc_geo: -1 },
    ],
};
const METR_NA_STOPIEN = konfig.ZIEMIA.PROMIEN_SREDNI_M * (Math.PI / 180);

test('odległość od wielokąta: punkt wewnątrz ma odległość ujemną do najbliższej krawędzi', () => {
    // Środek kwadratu: 1° do każdej krawędzi.
    const d = odlegloscOdKsztaltu({ szerokosc_geo: 0, dlugosc_geo: 0 }, KWADRAT_ROWNIKOWY);
    assert.ok(Math.abs(d + METR_NA_STOPIEN) < 1, `odległość ${d} m, oczekiwano ${-METR_NA_STOPIEN} m`);
});

test('odległość od wielokąta: punkt na krawędzi ma odległość zero', () => {
    const d = odlegloscOdKsztaltu({ szerokosc_geo: 0, dlugosc_geo: 1 }, KWADRAT_ROWNIKOWY);
    assert.ok(Math.abs(d) < 1, `odległość ${d} m, oczekiwano 0 m`);
});

test('odległość od wielokąta: punkt na zewnątrz ma odległość dodatnią do najbliższej krawędzi', () => {
    // 0,5° na wschód od krawędzi wschodniej.
    const d = odlegloscOdKsztaltu({ szerokosc_geo: 0, dlugosc_geo: 1.5 }, KWADRAT_ROWNIKOWY);
    assert.ok(Math.abs(d - 0.5 * METR_NA_STOPIEN) < 1, `odległość ${d} m`);
});

test('odległość od wielokąta: gdy najbliższy jest wierzchołek, liczy się odległość do wierzchołka', () => {
    // Punkt na przekątnej za narożnikiem (1,1): odległość ukośna, nie prostopadła.
    const d = odlegloscOdKsztaltu({ szerokosc_geo: 2, dlugosc_geo: 2 }, KWADRAT_ROWNIKOWY);
    const oczekiwana = Math.SQRT2 * METR_NA_STOPIEN;
    // Tolerancja 50 m przy odległości ~157 km: południki zbiegają się z szerokością,
    // więc rachunek na płaskim kwadracie różni się od modelu o kilkadziesiąt metrów.
    // Test pyta, czy liczy się wierzchołek, a nie o dokładność sferyczną.
    assert.ok(Math.abs(d - oczekiwana) < 50, `odległość ${d} m, oczekiwano ${oczekiwana} m`);
});

test('bufor 0: granica należy do zewnętrza — ta sama reguła co ADR-011 2.3', () => {
    const punkt = { szerokosc_geo: 54.36, dlugosc_geo: 18.65 };
    const okragDokladny = { ...OKRAG, promien_m: odlegloscMetry(punkt, OKRAG.srodek) };

    assert.equal(czyWewnatrzZBuforem(punkt, okragDokladny, 0), false);
    assert.equal(czyWewnatrzZBuforem(OKRAG.srodek, OKRAG, 0), true);
});

test('bufor dodatni: punkt tuż za granicą mieści się w buforze', () => {
    // ~111,19 m za granicą okręgu o promieniu 1000 m.
    const punkt = { szerokosc_geo: 54.36, dlugosc_geo: 18.65 };
    const nadmiar = odlegloscMetry(punkt, OKRAG.srodek) - OKRAG.promien_m;

    assert.equal(czyWewnatrzZBuforem(punkt, OKRAG, nadmiar + 1), true);
    assert.equal(czyWewnatrzZBuforem(punkt, OKRAG, nadmiar - 1), false);
});

test('bufor: wartość ujemna jest odrzucana', () => {
    assert.throws(() => czyWewnatrzZBuforem(OKRAG.srodek, OKRAG, -1), /bufor_m/);
});

test('bufor: brak wartości jest odrzucany, nie zastępowany zerem', () => {
    assert.throws(() => czyWewnatrzZBuforem(OKRAG.srodek, OKRAG), /bufor_m/);
});

test('bufor działa tak samo dla wielokąta', () => {
    const tuzZaKrawedzia = { szerokosc_geo: 0, dlugosc_geo: 1.001 };
    const odstep = 0.001 * METR_NA_STOPIEN;

    assert.equal(czyWewnatrzZBuforem(tuzZaKrawedzia, KWADRAT_ROWNIKOWY, odstep + 1), true);
    assert.equal(czyWewnatrzZBuforem(tuzZaKrawedzia, KWADRAT_ROWNIKOWY, odstep - 1), false);
});
