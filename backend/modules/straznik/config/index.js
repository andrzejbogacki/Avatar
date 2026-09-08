'use strict';

// Strażnik GPS — stałe kanoniczne modułu (ADR-011).
// Zakaz magic numbers: każda liczba używana przez geometrię pochodzi stąd.
//
// Czego tu NIE ma i mieć nie będzie: bufor planszy (ADR-011 2.4), tolerancja
// błędu pomiaru (2.4) i próg optymalizacji wierzchołków (2.3). To parametry
// organizatora — parametr nie ma wartości domyślnej, więc nie wolno mu tu
// nadać nastawy „na razie".

// Elipsoida odniesienia WGS84 — układ, w którym odbiornik podaje współrzędne.
const WGS84 = Object.freeze({
    POLOS_WIELKA_M: 6378137.0,            // a
    SPLASZCZENIE_ODWROTNE: 298.257223563, // 1/f
});

const POLOS_MALA_M = WGS84.POLOS_WIELKA_M * (1 - 1 / WGS84.SPLASZCZENIE_ODWROTNE); // b = a(1−f)

const ZIEMIA = Object.freeze({
    WGS84,
    POLOS_MALA_M,
    // Promień średni arytmetyczny R1 wg IUGG: (2a + b) / 3.
    // Model kulisty jest świadomą zgrubnością Strażnika (ADR-011 punkt 1):
    // rozstrzygamy przynależność do planszy, nie ustalamy pozycji.
    PROMIEN_SREDNI_M: (2 * WGS84.POLOS_WIELKA_M + POLOS_MALA_M) / 3,
});

const ZAKRESY = Object.freeze({
    SZEROKOSC_MIN_ST: -90,
    SZEROKOSC_MAX_ST: 90,
    DLUGOSC_MIN_ST: -180,
    DLUGOSC_MAX_ST: 180,
});

// Dwa typy kanoniczne — ADR-011 2.3. Trzeciego typu nie ma.
const TYPY_KSZTALTU = Object.freeze(['okrag', 'wielokat']);

// Dwie wartości stanu obecności — Ziarno v13 punkt 2.3. Awatar, który nigdy się
// nie zameldował, i uczestnik po rozładowaniu telefonu mają ten sam stan: duch.
const STANY_OBECNOSCI = Object.freeze(['obecny', 'duch']);

// Źródło dowodu obecności — ADR-011 2.5. Pole obowiązkowe przy każdym meldunku.
// „opaska" nie jest wartością tego pola (ADR-011 2.10).
const ZRODLA_DOWODU = Object.freeze(['terminal', 'nadajnik', 'brak']);

module.exports = { ZIEMIA, ZAKRESY, TYPY_KSZTALTU, STANY_OBECNOSCI, ZRODLA_DOWODU };
