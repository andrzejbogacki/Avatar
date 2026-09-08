'use strict';

// Strażnik GPS — detektor przekroczenia granicy (ADR-011 punkty 2.2 i 2.7).
// Meldunek powstaje wyłącznie w chwili zmiany stanu; cisza znaczy „bez zmian"
// (Ziarno v12 §1.10). Stan ma dwie wartości — Ziarno v13 §2.3, trzeciej nie ma.
// Czas nie wchodzi: chwilę rozstrzygającą nadaje węzeł (ADR-012 punkt 7).

const test = require('node:test');
const assert = require('node:assert/strict');

const { wykryjZmianeStanu } = require('../src/obecnosc');

const OKRAG = {
    typ: 'okrag',
    srodek: { szerokosc_geo: 54.35, dlugosc_geo: 18.65 },
    promien_m: 1000,
};
const WEWNATRZ = { szerokosc_geo: 54.351, dlugosc_geo: 18.65 };   // ~111 m od środka
const ZA_GRANICA = { szerokosc_geo: 54.36, dlugosc_geo: 18.65 };  // ~1112 m od środka
const NASTAWY = { bufor_m: 0, zrodlo_dowodu: 'terminal' };

test('wejście na planszę: duch wewnątrz kształtu staje się obecnym i melduje', () => {
    const wynik = wykryjZmianeStanu('duch', WEWNATRZ, OKRAG, NASTAWY);

    assert.equal(wynik.stan, 'obecny');
    assert.equal(wynik.meldunek.stan, 'obecny');
});

test('wyjście poza granicę gasi obecność ciałem natychmiast i melduje', () => {
    const wynik = wykryjZmianeStanu('obecny', ZA_GRANICA, OKRAG, NASTAWY);

    assert.equal(wynik.stan, 'duch');
    assert.equal(wynik.meldunek.stan, 'duch');
});

test('brak zmiany wewnątrz: cisza, żadnego meldunku', () => {
    const wynik = wykryjZmianeStanu('obecny', WEWNATRZ, OKRAG, NASTAWY);

    assert.equal(wynik.stan, 'obecny');
    assert.equal(wynik.meldunek, null);
});

test('brak zmiany na zewnątrz: cisza, żadnego meldunku', () => {
    const wynik = wykryjZmianeStanu('duch', ZA_GRANICA, OKRAG, NASTAWY);

    assert.equal(wynik.stan, 'duch');
    assert.equal(wynik.meldunek, null);
});

test('meldunek niesie źródło dowodu — pole obowiązkowe (ADR-011 2.5)', () => {
    const wynik = wykryjZmianeStanu('duch', WEWNATRZ, OKRAG, { bufor_m: 0, zrodlo_dowodu: 'nadajnik' });

    assert.equal(wynik.meldunek.zrodlo_dowodu, 'nadajnik');
});

test('meldunek nie niesie współrzędnych — nie ma kanału, którym mogłyby wyjść', () => {
    const wynik = wykryjZmianeStanu('duch', WEWNATRZ, OKRAG, NASTAWY);
    const zapis = JSON.stringify(wynik.meldunek);

    assert.equal(zapis.includes('szerokosc_geo'), false, `meldunek: ${zapis}`);
    assert.equal(zapis.includes('dlugosc_geo'), false, `meldunek: ${zapis}`);
    assert.equal(zapis.includes(String(WEWNATRZ.szerokosc_geo)), false, `meldunek: ${zapis}`);
});

test('meldunek nie niesie chwili — zegar urządzenia nie ma mocy dowodowej (ADR-012 punkt 7)', () => {
    const wynik = wykryjZmianeStanu('duch', WEWNATRZ, OKRAG, NASTAWY);

    assert.equal(Object.prototype.hasOwnProperty.call(wynik.meldunek, 'chwila'), false);
    assert.deepEqual(Object.keys(wynik.meldunek).sort(), ['stan', 'zrodlo_dowodu']);
});

test('bufor planszy przesuwa próg: punkt tuż za granicą nie gasi obecności', () => {
    const wynik = wykryjZmianeStanu('obecny', ZA_GRANICA, OKRAG, { bufor_m: 200, zrodlo_dowodu: 'terminal' });

    assert.equal(wynik.stan, 'obecny');
    assert.equal(wynik.meldunek, null);
});

test('źródło dowodu spoza trzech wartości jest odrzucane', () => {
    assert.throws(
        () => wykryjZmianeStanu('duch', WEWNATRZ, OKRAG, { bufor_m: 0, zrodlo_dowodu: 'opaska' }),
        /zrodlo_dowodu/,
    );
});

test('brak źródła dowodu jest odrzucany, nie zastępowany wartością „brak"', () => {
    assert.throws(
        () => wykryjZmianeStanu('duch', WEWNATRZ, OKRAG, { bufor_m: 0 }),
        /zrodlo_dowodu/,
    );
});

test('stan poprzedni spoza dwóch wartości jest odrzucany — trzeciej nie ma', () => {
    assert.throws(
        () => wykryjZmianeStanu('nieznany', WEWNATRZ, OKRAG, NASTAWY),
        /stan_poprzedni/,
    );
});

test('brak stanu poprzedniego jest odrzucany, nie zgadywany', () => {
    assert.throws(
        () => wykryjZmianeStanu(undefined, WEWNATRZ, OKRAG, NASTAWY),
        /stan_poprzedni/,
    );
});

test('brak bufora jest odrzucany — parametr organizatora bez wartości domyślnej', () => {
    assert.throws(
        () => wykryjZmianeStanu('duch', WEWNATRZ, OKRAG, { zrodlo_dowodu: 'terminal' }),
        /bufor_m/,
    );
});

test('detektor działa na wielokącie tak samo jak na okręgu', () => {
    const kwadrat = {
        typ: 'wielokat',
        wierzcholki: [
            { szerokosc_geo: 0, dlugosc_geo: 0 },
            { szerokosc_geo: 0, dlugosc_geo: 2 },
            { szerokosc_geo: 2, dlugosc_geo: 2 },
            { szerokosc_geo: 2, dlugosc_geo: 0 },
        ],
    };
    assert.equal(wykryjZmianeStanu('duch', { szerokosc_geo: 1, dlugosc_geo: 1 }, kwadrat, NASTAWY).stan, 'obecny');
    assert.equal(wykryjZmianeStanu('obecny', { szerokosc_geo: 1, dlugosc_geo: 3 }, kwadrat, NASTAWY).stan, 'duch');
});

test('kontrakt modułu: Strażnik wystawia detektor obok geometrii', () => {
    const straznik = require('../index');
    assert.equal(typeof straznik.obecnosc.wykryjZmianeStanu, 'function');
    assert.deepEqual(straznik.konfig.STANY_OBECNOSCI, ['obecny', 'duch']);
    assert.deepEqual(straznik.konfig.ZRODLA_DOWODU, ['terminal', 'nadajnik', 'brak']);
});
