'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { rektyfikacja } = require('../config');

test('config: parametry bramki uczciwości', () => {
    const b = rektyfikacja.BRAMKA_UCZCIWOSCI;
    assert.equal(b.KROK_KANDYDATA_MIN, 2);
    assert.equal(b.K_NULL, 200);
    assert.equal(b.PROG_PEWNOSCI, 0.95);
    assert.equal(b.ROZMIAR_PULI_NULL, 60);
});

const { osieKandydatow } = require('../src/rectification/bramka_uczciwosci');
// Profil brzegowy A — strefa stała Etc/GMT (offset +00:00 niezależny od tzdata).
const PROFIL_BRZEGOWY_A = {
    czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
    strefa: 'Etc/GMT',
    obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
};

test('osieKandydatow: siatka kandydatów z osiami, środek = 09:44', () => {
    const k = osieKandydatow({ ...PROFIL_BRZEGOWY_A, polszerokosc_min: 120, krok_min: 2 });
    assert.equal(k.length, 121);              // -120..120 co 2
    const srodek = k.find((c) => c.offset_min === 0);
    assert.ok(Math.abs(srodek.asc - 313.203) < 0.05, `asc=${srodek.asc}`);
    // ASC rośnie z czasem
    assert.ok(k[k.length - 1].asc !== k[0].asc);
});

const { pozycjeTranzytu, scoreKandydatow } = require('../src/rectification/bramka_uczciwosci');

test('scoreKandydatow: tranzyt dokładnie na ASC kandydata → wysoki wynik tam', () => {
    const kand = [
        { offset_min: -2, asc: 100, mc: 10 },
        { offset_min: 0, asc: 200, mc: 20 },   // tu wstawimy tranzyt = 200 (koniunkcja)
        { offset_min: 2, asc: 300, mc: 30 },
    ];
    const tranzyty = [[200]]; // jedno wydarzenie, jedno ciało dokładnie na ASC kandydata #2
    const s = scoreKandydatow(kand, tranzyty);
    assert.equal(s.length, 3);
    assert.ok(s[1] > s[0] && s[1] > s[2], `s=${s}`);
    assert.ok(s[1] > 0.99); // koniunkcja ścisła
});

test('pozycjeTranzytu: zwraca długości ciał dla chwili UTC', () => {
    const tr = pozycjeTranzytu(
        { rok: 2022, miesiac: 1, dzien: 16, godzina: 12, minuta: 0, sekunda: 0 },
        { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 }
    );
    assert.ok(Array.isArray(tr) && tr.length >= 10);
    assert.ok(tr.every((x) => Number.isFinite(x)));
});

const { prominencjaPiku } = require('../src/rectification/bramka_uczciwosci');

test('prominencjaPiku: ostry pik ma wysoką prominencję; płaskie = 0', () => {
    const ostry = prominencjaPiku([0, 0, 0, 1, 0, 0, 0]);
    assert.equal(ostry.iBest, 3);
    assert.ok(ostry.prominencja > 2, `prom=${ostry.prominencja}`);
    const plaskie = prominencjaPiku([0.5, 0.5, 0.5, 0.5]);
    assert.equal(plaskie.prominencja, 0);
});

const { rozkladNull } = require('../src/rectification/bramka_uczciwosci');

test('rozkladNull: deterministyczny przy wstrzykniętym losuj; K wyników', () => {
    const kand = [
        { offset_min: -2, asc: 100, mc: 10 },
        { offset_min: 0, asc: 200, mc: 20 },
        { offset_min: 2, asc: 300, mc: 30 },
    ];
    const pula = [[200], [12], [305]]; // trzy „zestawy" tranzytów
    let i = 0;
    const losuj = () => [0.0, 0.9, 0.5][i++ % 3]; // deterministyczny
    const nul = rozkladNull(kand, pula, 2, 4, losuj);
    assert.equal(nul.length, 4);
    assert.ok(nul.every((p) => Number.isFinite(p)));
});

const { bramkaUczciwosci } = require('../src/rectification/bramka_uczciwosci');

test('bramkaUczciwosci: sygnał ponad NULL → zwraca godzinę', () => {
    // realne wydarzenie trafia dokładnie w ASC kandydata offset 0; pula NULL nie trafia nigdzie
    // Okno ±8 min: przy szerokości ~38° ASC rośnie ~0,34°/min, więc sąsiedzi kandydaci
    // wychodzą poza orb i pik środka jest wyraźny (na 54° wystarczało ±4 min).
    // Najpierw oblicz realny ASC środka
    const osieRealny = osieKandydatow({ ...PROFIL_BRZEGOWY_A, polszerokosc_min: 8, krok_min: 2 });
    const srodek = osieRealny.find((c) => c.offset_min === 0);
    const ascSrodka = srodek.asc;

    const wynik = bramkaUczciwosci({
        czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
        strefa: 'Etc/GMT',
        obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
        polszerokosc_min: 8, krok_min: 2,
        tranzytyWydarzen: [[ascSrodka]], // realne wydarzenie na ASC środka
        pulaNull: [[0], [1], [2]], // długości ~0 → żadnych aspektów → prominencja NULL ≈ 0
        K: 50, prog_pewnosci: 0.9, losuj: () => 0.0,
    });
    // realny pik istnieje (ASC środka trafiony), NULL płaski → pewnosc wysoka
    assert.ok(wynik.pewnosc >= 0.9, `pewnosc=${wynik.pewnosc}`);
    assert.ok(wynik.wynik !== null);
    assert.equal(typeof wynik.wynik.offset_min, 'number');
});

test('bramkaUczciwosci: brak sygnału ponad NULL → nie umiem (wynik null)', () => {
    const wynik = bramkaUczciwosci({
        czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
        strefa: 'Etc/GMT',
        obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
        polszerokosc_min: 4, krok_min: 2,
        tranzytyWydarzen: [[123]],       // jedno „wydarzenie"
        pulaNull: [[123], [123], [123]], // NULL identyczny jak realne → brak przewagi
        K: 50, prog_pewnosci: 0.9, losuj: () => 0.0,
    });
    assert.ok(wynik.pewnosc < 0.9);
    assert.equal(wynik.wynik, null);
    assert.match(wynik.powod, /nie umiem|brak sygnału/i);
});

test('re-eksport: qrt.bramkaUczciwosci dostępna', () => {
    const qrt = require('../src/rectification');
    assert.equal(typeof qrt.bramkaUczciwosci, 'function');
});
