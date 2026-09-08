'use strict';

// Strażnik GPS — bezpiecznik ciszy sprzętu (ADR-011 2.8) i zsunięcie warunkowe
// (2.9). Drugi producent meldunku, obok detektora przekroczenia granicy.
//
// Cisza rozładowanego telefonu wygląda identycznie jak cisza „bez zmian"
// (Ziarno v12 §1.10) — rozróżnia je wyłącznie upływ. Moduł nie ma zegara:
// obie chwile podaje węzeł (ADR-012 punkt 7), moduł je wyłącznie odejmuje.

const test = require('node:test');
const assert = require('node:assert/strict');

const { wykryjSkutekCiszy } = require('../src/obecnosc');
const { CZAS } = require('../config');

const GODZINA_MS = 3600 * 1000;
const POCZATEK_CISZY_MS = Date.UTC(2026, 8, 8, 12, 0, 0);   // chwila ostatniego meldunku
const OKNO_MS = 30 * 60 * 1000;                             // parametr organizatora: 30 min

const DOWOD_TERMINAL = { rodzaj: 'terminal', chwila_uzyskania_ms: POCZATEK_CISZY_MS - GODZINA_MS };
const DOWOD_NADAJNIK = { rodzaj: 'nadajnik', chwila_uzyskania_ms: POCZATEK_CISZY_MS - GODZINA_MS };
const DOWOD_BRAK = { rodzaj: 'brak', chwila_uzyskania_ms: POCZATEK_CISZY_MS - GODZINA_MS };

const NASTAWY = { okno_zsunietego_meldunku_ms: OKNO_MS, zrodlo_dowodu: 'terminal' };

function chwile(uplyw_ms) {
    return {
        chwila_ostatniego_meldunku_ms: POCZATEK_CISZY_MS,
        chwila_biezaca_ms: POCZATEK_CISZY_MS + uplyw_ms,
    };
}

// ——— bezpiecznik czasowy (ADR-011 2.8) ———

test('cisza krótsza od bezpiecznika nie zmienia niczego — cisza znaczy „bez zmian"', () => {
    const wynik = wykryjSkutekCiszy('obecny', DOWOD_TERMINAL, chwile(GODZINA_MS), NASTAWY);

    assert.equal(wynik.stan, 'obecny');
    assert.equal(wynik.meldunek, null);
});

test('bezpiecznik bez drugiego dowodu gasi obecność — źródło „brak" nie zsuwa', () => {
    const wynik = wykryjSkutekCiszy('obecny', DOWOD_BRAK, chwile(2 * GODZINA_MS), NASTAWY);

    assert.equal(wynik.stan, 'duch');
    assert.equal(wynik.meldunek.stan, 'duch');
});

test('bezpiecznik to 2 godziny z kanonu, nie liczba wpisana w kod (ADR-011 2.8)', () => {
    assert.equal(CZAS.BEZPIECZNIK_CISZY_MS, 2 * GODZINA_MS);

    const tuz_przed = wykryjSkutekCiszy('obecny', DOWOD_BRAK, chwile(CZAS.BEZPIECZNIK_CISZY_MS - 1), NASTAWY);
    const na_progu = wykryjSkutekCiszy('obecny', DOWOD_BRAK, chwile(CZAS.BEZPIECZNIK_CISZY_MS), NASTAWY);

    assert.equal(tuz_przed.stan, 'obecny');
    assert.equal(na_progu.stan, 'duch');
});

test('duch pozostaje duchem — bezpiecznik nie ma czego zgasić, żadnego meldunku', () => {
    const wynik = wykryjSkutekCiszy('duch', DOWOD_TERMINAL, chwile(5 * GODZINA_MS), NASTAWY);

    assert.equal(wynik.stan, 'duch');
    assert.equal(wynik.meldunek, null);
});

// ——— zsunięcie warunkowe (ADR-011 2.9) ———

test('drugi dowód terminalem zsuwa obecność o poziom zamiast ją gasić', () => {
    const wynik = wykryjSkutekCiszy('obecny', DOWOD_TERMINAL, chwile(2 * GODZINA_MS), NASTAWY);

    assert.equal(wynik.stan, 'zsuniety');
    assert.equal(wynik.meldunek.stan, 'zsuniety');
});

test('drugi dowód nadajnikiem certyfikowanym zsuwa tak samo jak terminal', () => {
    const wynik = wykryjSkutekCiszy('obecny', DOWOD_NADAJNIK, chwile(2 * GODZINA_MS), NASTAWY);

    assert.equal(wynik.stan, 'zsuniety');
});

test('meldunek zsunięty niesie chwilę ważności — to jego istota (ADR-011 2.9)', () => {
    const wynik = wykryjSkutekCiszy('obecny', DOWOD_TERMINAL, chwile(2 * GODZINA_MS), NASTAWY);
    const oczekiwany = new Date(POCZATEK_CISZY_MS + CZAS.BEZPIECZNIK_CISZY_MS + OKNO_MS).toISOString();

    assert.equal(wynik.meldunek.wazny_do_ts, oczekiwany);
    assert.deepEqual(Object.keys(wynik.meldunek).sort(), ['stan', 'wazny_do_ts', 'zrodlo_dowodu']);
});

test('chwila ważności zależy od początku ciszy, nie od chwili sprawdzenia', () => {
    const wczesniej = wykryjSkutekCiszy('obecny', DOWOD_TERMINAL, chwile(2 * GODZINA_MS), NASTAWY);
    const pozniej = wykryjSkutekCiszy('obecny', DOWOD_TERMINAL, chwile(2 * GODZINA_MS + 60 * 1000), NASTAWY);

    assert.equal(pozniej.meldunek.wazny_do_ts, wczesniej.meldunek.wazny_do_ts);
});

test('zsunięty w oknie: bez zmian, żadnego meldunku', () => {
    const wynik = wykryjSkutekCiszy('zsuniety', DOWOD_TERMINAL, chwile(2 * GODZINA_MS + 60 * 1000), NASTAWY);

    assert.equal(wynik.stan, 'zsuniety');
    assert.equal(wynik.meldunek, null);
});

test('upływ okna gasi zsuniętą obecność — meldunek o czasie ważności wygasa', () => {
    const uplyw = CZAS.BEZPIECZNIK_CISZY_MS + OKNO_MS;
    const wynik = wykryjSkutekCiszy('zsuniety', DOWOD_TERMINAL, chwile(uplyw), NASTAWY);

    assert.equal(wynik.stan, 'duch');
    assert.equal(wynik.meldunek.stan, 'duch');
});

test('cisza dłuższa od bezpiecznika i okna razem gasi obecność bez etapu zsunięcia', () => {
    const uplyw = CZAS.BEZPIECZNIK_CISZY_MS + OKNO_MS + GODZINA_MS;
    const wynik = wykryjSkutekCiszy('obecny', DOWOD_TERMINAL, chwile(uplyw), NASTAWY);

    assert.equal(wynik.stan, 'duch');
    assert.equal(wynik.meldunek.stan, 'duch');
});

test('dowód uzyskany po rozpoczęciu ciszy nie jest dowodem sprzed ciszy', () => {
    const pozniejszy = { rodzaj: 'terminal', chwila_uzyskania_ms: POCZATEK_CISZY_MS + 60 * 1000 };
    const wynik = wykryjSkutekCiszy('obecny', pozniejszy, chwile(2 * GODZINA_MS), NASTAWY);

    assert.equal(wynik.stan, 'duch');
});

test('dowód uzyskany dokładnie w chwili ostatniego meldunku liczy się jako sprzed ciszy', () => {
    const na_progu = { rodzaj: 'terminal', chwila_uzyskania_ms: POCZATEK_CISZY_MS };
    const wynik = wykryjSkutekCiszy('obecny', na_progu, chwile(2 * GODZINA_MS), NASTAWY);

    assert.equal(wynik.stan, 'zsuniety');
});

// ——— meldunek nie wynosi więcej, niż wolno ———

test('meldunek ciszy nie niesie współrzędnych — cisza ich nawet nie dostaje', () => {
    const wynik = wykryjSkutekCiszy('obecny', DOWOD_BRAK, chwile(2 * GODZINA_MS), NASTAWY);
    const zapis = JSON.stringify(wynik.meldunek);

    assert.equal(zapis.includes('szerokosc_geo'), false, `meldunek: ${zapis}`);
    assert.equal(zapis.includes('dlugosc_geo'), false, `meldunek: ${zapis}`);
    assert.equal(wykryjSkutekCiszy.length, 4, 'sygnatura nie przyjmuje punktu ani kształtu');
});

test('meldunek wygaśnięcia niesie stan i źródło dowodu, bez chwili ważności', () => {
    const wynik = wykryjSkutekCiszy('obecny', DOWOD_BRAK, chwile(2 * GODZINA_MS), NASTAWY);

    assert.deepEqual(Object.keys(wynik.meldunek).sort(), ['stan', 'zrodlo_dowodu']);
});

test('meldunek niesie źródło dowodu planszy — pole obowiązkowe (ADR-011 2.5)', () => {
    const wynik = wykryjSkutekCiszy(
        'obecny', DOWOD_NADAJNIK, chwile(2 * GODZINA_MS),
        { okno_zsunietego_meldunku_ms: OKNO_MS, zrodlo_dowodu: 'nadajnik' },
    );

    assert.equal(wynik.meldunek.zrodlo_dowodu, 'nadajnik');
});

// ——— odmowy: parametr bez wartości domyślnej, dane nieznane ———

test('brak okna zsuniętego meldunku jest odrzucany — parametr organizatora bez domyślnej', () => {
    assert.throws(
        () => wykryjSkutekCiszy('obecny', DOWOD_TERMINAL, chwile(2 * GODZINA_MS), { zrodlo_dowodu: 'terminal' }),
        /okno_zsunietego_meldunku_ms/,
    );
});

test('okno ujemne jest odrzucane — okno krótsze niż nic nie istnieje', () => {
    assert.throws(
        () => wykryjSkutekCiszy(
            'obecny', DOWOD_TERMINAL, chwile(2 * GODZINA_MS),
            { okno_zsunietego_meldunku_ms: -1, zrodlo_dowodu: 'terminal' },
        ),
        /okno_zsunietego_meldunku_ms/,
    );
});

test('brak ostatniego dowodu Awatara jest odrzucany, nie brany za „brak"', () => {
    assert.throws(
        () => wykryjSkutekCiszy('obecny', undefined, chwile(2 * GODZINA_MS), NASTAWY),
        /ostatni_dowod/,
    );
});

test('rodzaj dowodu spoza trzech wartości jest odrzucany — „opaska" nim nie jest (ADR-011 2.10)', () => {
    assert.throws(
        () => wykryjSkutekCiszy(
            'obecny', { rodzaj: 'opaska', chwila_uzyskania_ms: POCZATEK_CISZY_MS }, chwile(2 * GODZINA_MS), NASTAWY,
        ),
        /rodzaj/,
    );
});

test('dowód bez chwili uzyskania jest odrzucany — „przed ciszą" nie da się bez niej orzec', () => {
    assert.throws(
        () => wykryjSkutekCiszy('obecny', { rodzaj: 'terminal' }, chwile(2 * GODZINA_MS), NASTAWY),
        /chwila_uzyskania_ms/,
    );
});

test('brakująca chwila od węzła jest odrzucana — moduł nie ma czym jej zastąpić', () => {
    assert.throws(
        () => wykryjSkutekCiszy(
            'obecny', DOWOD_TERMINAL,
            { chwila_ostatniego_meldunku_ms: POCZATEK_CISZY_MS }, NASTAWY,
        ),
        /chwila_biezaca_ms/,
    );
});

test('chwila bieżąca wcześniejsza od ostatniego meldunku jest odrzucana — czas nie płynie wstecz', () => {
    assert.throws(
        () => wykryjSkutekCiszy('obecny', DOWOD_TERMINAL, chwile(-1000), NASTAWY),
        /chwila_biezaca_ms/,
    );
});

test('stan poprzedni spoza trzech wartości jest odrzucany', () => {
    assert.throws(
        () => wykryjSkutekCiszy('nieznany', DOWOD_TERMINAL, chwile(2 * GODZINA_MS), NASTAWY),
        /stan_poprzedni/,
    );
});

test('kontrakt modułu: obecność wystawia dwóch producentów meldunku, stan ma trzy wartości', () => {
    const straznik = require('../index');

    assert.equal(typeof straznik.obecnosc.wykryjZmianeStanu, 'function');
    assert.equal(typeof straznik.obecnosc.wykryjSkutekCiszy, 'function');
    assert.deepEqual(straznik.konfig.STANY_OBECNOSCI, ['obecny', 'duch', 'zsuniety']);
});
