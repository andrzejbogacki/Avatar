'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { rektyfikacja } = require('../config');

test('config: próg alarmu czułości i horyzont pomiaru', () => {
    assert.equal(rektyfikacja.CZULOSC.PROG_ALARMU_S, 60);
    assert.equal(rektyfikacja.CZULOSC.HORYZONT_POMIARU_S, 600);
});

const { osieDlaPrzesuniecia } = require('../src/rectification/czulosc');

// Profil brzegowy A — syntetyczny fixture o właściwościach granicznych:
// ASC tuż przy granicy bramy (alarm), MC stabilny. Strefa stała Etc/GMT
// (offset +00:00 niezależny od tzdata). Miejsce/godzina bez związku z osobą.
const PROFIL_BRZEGOWY_A = {
    czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
    strefa: 'Etc/GMT',
    obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
};

test('osieDlaPrzesuniecia: ASC profilu brzegowego ≈ 313.20° na granicy bramy, rośnie z czasem', () => {
    const os = osieDlaPrzesuniecia(PROFIL_BRZEGOWY_A);
    const teraz = os(0);
    assert.ok(Math.abs(teraz.asc_deg - 313.203) < 0.05, `asc=${teraz.asc_deg}`);
    const zaMinute = os(60);
    // ASC ~0.34°/min — rośnie
    assert.ok(zaMinute.asc_deg > teraz.asc_deg, 'ASC rośnie z czasem');
});

const { czuloscOsi } = require('../src/rectification/czulosc');

test('czuloscOsi: ASC profilu brzegowego na ostrzu noża — ~9 s do granicy bramy', () => {
    const c = czuloscOsi(PROFIL_BRZEGOWY_A);
    assert.equal(c.ASC.bramka, 19);
    assert.equal(c.ASC.linia, 6);
    assert.equal(c.ASC.znak.nazwa, 'Wodnik');
    assert.ok(c.ASC.sek_do_bramki !== null && c.ASC.sek_do_bramki >= 6 && c.ASC.sek_do_bramki <= 12,
        `sek_do_bramki=${c.ASC.sek_do_bramki}`);
    // MC profilu brzegowego: znak Strzelec, brama stabilna (granica bramy daleko od progu)
    assert.equal(c.MC.znak.nazwa, 'Strzelec');
    // MC daleko od granicy bramy (~427 s, w horyzoncie 600 s) — nie alarmuje (próg 60 s)
    assert.ok(c.MC.sek_do_bramki === null || c.MC.sek_do_bramki > 300,
        `MC daleko od granicy bramy, sek_do_bramki=${c.MC.sek_do_bramki}`);
});

const { alarmCzulosci } = require('../src/rectification/czulosc');
const qrt = require('../src/rectification');

test('alarmCzulosci: profil brzegowy (~9 s) wywołuje alarm z powodem ASC/bramka', () => {
    const a = alarmCzulosci(PROFIL_BRZEGOWY_A);
    assert.equal(a.alarm, true);
    assert.equal(a.prog_s, 60);
    assert.ok(a.powody.some((p) => p.os === 'ASC' && p.rodzaj === 'bramka' && p.sekundy <= 60));
});

test('alarmCzulosci: brak alarmu, gdy próg bardzo mały', () => {
    const a = alarmCzulosci(PROFIL_BRZEGOWY_A, 1);
    assert.equal(a.alarm, false);
    assert.deepEqual(a.powody, []);
});

test('re-eksport: qrt.czuloscOsi i qrt.alarmCzulosci dostępne', () => {
    assert.equal(typeof qrt.czuloscOsi, 'function');
    assert.equal(typeof qrt.alarmCzulosci, 'function');
});

test('alarmCzulosci: prog_s ponad horyzont pomiaru — jawny błąd, nie cichy false-negative', () => {
    assert.throws(() => alarmCzulosci(PROFIL_BRZEGOWY_A, 601), /przekracza horyzont pomiaru/);
});
