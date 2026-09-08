'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { rejestr, rektyfikacja } = require('../config');

test('config: źródła czasu, domyślne, krok skanu niepewności', () => {
    assert.deepEqual(rejestr.ZRODLA_CZASU, ['dokladny', 'przyblizony', 'rektyfikowany']);
    assert.equal(rejestr.CZAS_ZRODLO_DOMYSLNE, 'dokladny');
    assert.ok(rejestr.ZRODLA_CZASU.includes(rejestr.CZAS_ZRODLO_DOMYSLNE));
    assert.equal(rektyfikacja.NIEPEWNOSC.KROK_SKANU_S, 60);
});

const { polaWOknie } = require('../src/rectification/niepewnosc');

// Profil brzegowy A — ASC/MC niepewne w oknie, profil (Słońce/Ziemia) pewny,
// Księżyc niepewny co do linii. Strefa stała Etc/GMT (offset niezależny od tzdata).
const PROFIL_BRZEGOWY_A = {
    czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
    strefa: 'Etc/GMT',
    obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
};

test('polaWOknie: profil brzegowy ±120 min — osie niepewne, profil (Słońce/Ziemia) pewny', () => {
    const p = polaWOknie({ ...PROFIL_BRZEGOWY_A, polszerokosc_min: 120 });
    assert.equal(p.ascendent.status, 'niepewne');
    assert.ok(p.ascendent.mozliwych_bram >= 12, `ASC bram=${p.ascendent.mozliwych_bram}`);
    assert.equal(p.ascendent.w_srodku.bramka, 19);
    assert.equal(p.ascendent.w_srodku.linia, 6);
    assert.equal(p.ascendent.w_srodku.znak, 'Wodnik');
    assert.equal(p.mc.status, 'niepewne');
    assert.equal(p.slonce.status, 'pewne');
    assert.equal(p.slonce.mozliwych_bram, 1);
    assert.equal(p.ziemia.status, 'pewne');
    assert.equal(p.ksiezyc.status, 'niepewne_linia');
    assert.equal(p.ksiezyc.mozliwych_bram, 1);
});

test('polaWOknie: polszerokosc_min musi być > 0', () => {
    assert.throws(() => polaWOknie({ ...PROFIL_BRZEGOWY_A, polszerokosc_min: 0 }), /polszerokosc/);
});

const { sekcjaNiepewnosci } = require('../src/rectification/niepewnosc');
const qrt = require('../src/rectification');

test('sekcjaNiepewnosci: profil brzegowy przybliżony — piaskownica, warstwy zdegradowane', () => {
    const s = sekcjaNiepewnosci({ czas_zrodlo: 'przyblizony', ...PROFIL_BRZEGOWY_A, polszerokosc_min: 120 });
    assert.equal(s.czas_zrodlo, 'przyblizony');
    assert.equal(s.piaskownica, true);
    assert.equal(s.okno.srodek, '09:44');
    assert.equal(s.okno.polszerokosc_min, 120);
    assert.equal(s.pola.ascendent.status, 'niepewne');
    const stan = (nazwaFragment) => s.warstwy_zdegradowane.find((w) => w.warstwa.includes(nazwaFragment)).stan;
    assert.equal(stan('Human Design'), 'czynna');
    assert.equal(stan('astrologia domowa'), 'nieczynna');
    assert.equal(stan('nakszatra'), 'czesciowa');
});

test('re-eksport: qrt.polaWOknie i qrt.sekcjaNiepewnosci dostępne', () => {
    assert.equal(typeof qrt.polaWOknie, 'function');
    assert.equal(typeof qrt.sekcjaNiepewnosci, 'function');
});
