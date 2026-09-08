'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { zodiak } = require('../config');

test('config zodiak: 12 znaków po 30°, nazwy PL', () => {
    assert.equal(zodiak.LICZBA_ZNAKOW, 12);
    assert.equal(zodiak.SZEROKOSC_ZNAKU_DEG, 30);
    assert.equal(zodiak.NAZWY_ZNAKOW.length, 12);
    assert.equal(zodiak.NAZWY_ZNAKOW[0], 'Baran');
    assert.equal(zodiak.NAZWY_ZNAKOW[9], 'Koziorożec');
    assert.equal(zodiak.NAZWY_ZNAKOW[10], 'Wodnik');
});

const { znakZodiaku } = require('../src/calculator/zodiak');

test('znakZodiaku: mapuje długość na znak i stopnie w znaku', () => {
    const koz = znakZodiaku(285.5);
    assert.equal(koz.nazwa, 'Koziorożec');
    assert.equal(koz.indeks, 9);
    assert.ok(Math.abs(koz.stopnie_w_znaku - 15.5) < 0.01);

    assert.equal(znakZodiaku(0).nazwa, 'Baran');
    assert.equal(znakZodiaku(302).nazwa, 'Wodnik');       // 2° Wodnika
    assert.equal(znakZodiaku(-1).nazwa, 'Ryby');          // normalizacja ujemnych
    assert.equal(znakZodiaku(360).nazwa, 'Baran');
});

test('znakZodiaku: odrzuca wartości niefinitne', () => {
    assert.throws(() => znakZodiaku(NaN), /Nieprawid/);
});
