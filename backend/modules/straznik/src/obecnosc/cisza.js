'use strict';

// Strażnik GPS — bezpiecznik ciszy sprzętu (ADR-011 2.8) i zsunięcie warunkowe
// (2.9). Drugi producent meldunku obok detektora przekroczenia granicy.
//
// Rozróżnienie, na którym stoi cały ten plik (Ziarno v12 punkt 1.11): system
// nie dowiaduje się, że Awatar wyszedł. Dowiaduje się, że przestał
// potwierdzać. Przekroczenie granicy ma werdykt i gasi natychmiast (2.7);
// cisza werdyktu nie ma i dlatego dostaje bezpiecznik.
//
// Czas wchodzi wyłącznie wejściem. Obie chwile podaje węzeł (ADR-012 punkt 7),
// bo zegar urządzenia nie ma mocy dowodowej — moduł je odejmuje i formatuje,
// nigdy nie odczytuje. Pilnuje tego `test/bez_zegara.test.js`.

const { STANY_OBECNOSCI, ZRODLA_DOWODU, CZAS } = require('../../config');
const {
    sprawdzStanPoprzedni, sprawdzObiekt, sprawdzZrodloDowodu, sprawdzChwile,
} = require('./wejscie');

const [, DUCH, ZSUNIETY] = STANY_OBECNOSCI;

// Ostatni dowód Awatara — pole Awatara, nie planszy. // TERMIN-KANDYDAT: Ostatni dowód Awatara
// Mówi, czym ten Awatar potwierdził obecność ostatnim razem i kiedy. Pole
// planszy `zrodlo_dowodu` mówi co innego: co plansza dopuszcza. Punkt 2.9 pyta
// o Awatara, więc plansza z terminalem nie wystarcza — liczy się, czy ten
// człowiek go dotknął.
function sprawdzOstatniDowod(ostatni_dowod) {
    sprawdzObiekt(ostatni_dowod, 'ostatni_dowod');

    if (!ZRODLA_DOWODU.includes(ostatni_dowod.rodzaj)) {
        throw new RangeError(
            `ostatni_dowod.rodzaj: ${JSON.stringify(ostatni_dowod.rodzaj)} — `
            + `dozwolone: ${ZRODLA_DOWODU.join(', ')}`,
        );
    }
    sprawdzChwile(ostatni_dowod.chwila_uzyskania_ms, 'ostatni_dowod.chwila_uzyskania_ms');
    return ostatni_dowod;
}

function sprawdzChwileWezla(chwile) {
    sprawdzObiekt(chwile, 'chwile');
    sprawdzChwile(chwile.chwila_ostatniego_meldunku_ms, 'chwile.chwila_ostatniego_meldunku_ms');
    sprawdzChwile(chwile.chwila_biezaca_ms, 'chwile.chwila_biezaca_ms');

    if (chwile.chwila_biezaca_ms < chwile.chwila_ostatniego_meldunku_ms) {
        throw new RangeError(
            'chwile.chwila_biezaca_ms: wcześniejsza niż chwila ostatniego meldunku — '
            + 'czas nie płynie wstecz, a zgodność zegarów węzła nie jest przedmiotem tego modułu',
        );
    }
    return chwile;
}

// Długość okna zsuniętego meldunku to parametr organizatora (ADR-011 2.9).
// Parametr nie ma wartości domyślnej — brak jest błędem, nie zerem.
function sprawdzNastawy(nastawy) {
    sprawdzObiekt(nastawy, 'nastawy');
    sprawdzZrodloDowodu(nastawy);

    const okno = nastawy.okno_zsunietego_meldunku_ms;
    if (!Number.isFinite(okno) || okno < 0) {
        throw new RangeError(
            `nastawy.okno_zsunietego_meldunku_ms: ${JSON.stringify(okno)} — `
            + 'parametr organizatora, liczba milisekund nieujemna, bez wartości domyślnej',
        );
    }
    return nastawy;
}

// Drugi dowód z punktu 2.9: terminal albo nadajnik certyfikowany, uzyskany
// przed ciszą. Samo GPS („brak") drugim dowodem nie jest — brak sygnału nie
// może dawać więcej niż sygnał.
function czyByłDrugiDowod(ostatni_dowod, chwila_ostatniego_meldunku_ms) {
    return ostatni_dowod.rodzaj !== 'brak'
        && ostatni_dowod.chwila_uzyskania_ms <= chwila_ostatniego_meldunku_ms;
}

function wynik(stan_poprzedni, stan, nastawy, koniec_okna_ms) {
    if (stan === stan_poprzedni) {
        return { stan, meldunek: null };
    }
    const meldunek = { stan, zrodlo_dowodu: nastawy.zrodlo_dowodu };

    // Jedyny meldunek Strażnika niosący chwilę — i to nie własną. Punkt 2.9
    // nazywa go „meldunkiem o czasie ważności": bez terminu nie byłby zsunięty,
    // tylko bezterminowy, czyli mocniejszy od tego, co zastąpił.
    if (stan === ZSUNIETY) {
        meldunek.wazny_do_ts = new Date(koniec_okna_ms).toISOString();
    }
    return { stan, meldunek };
}

// Skutek ciszy. Wejściem są dwie chwile od węzła i ostatni dowód Awatara —
// nigdy pozycja: ucichnięty telefon nie ma czego zmierzyć, a moduł nie ma
// gdzie tej pozycji przyjąć.
function wykryjSkutekCiszy(stan_poprzedni, ostatni_dowod, chwile, nastawy) {
    sprawdzStanPoprzedni(stan_poprzedni);
    sprawdzOstatniDowod(ostatni_dowod);
    sprawdzChwileWezla(chwile);
    sprawdzNastawy(nastawy);

    const czas_ciszy_ms = chwile.chwila_biezaca_ms - chwile.chwila_ostatniego_meldunku_ms;

    // Cisza krótsza od bezpiecznika znaczy „bez zmian" i niczym się nie różni
    // od ciszy telefonu, który po prostu nie ma nic do powiedzenia.
    if (czas_ciszy_ms < CZAS.BEZPIECZNIK_CISZY_MS) {
        return { stan: stan_poprzedni, meldunek: null };
    }
    // Duch nie ma czego stracić. Bezpiecznik gasi obecność, nie uczestnictwo.
    if (stan_poprzedni === DUCH) {
        return { stan: DUCH, meldunek: null };
    }

    const koniec_okna_ms = chwile.chwila_ostatniego_meldunku_ms
        + CZAS.BEZPIECZNIK_CISZY_MS + nastawy.okno_zsunietego_meldunku_ms;

    // Okno liczy się od początku ciszy, nie od chwili sprawdzenia. Inaczej
    // późniejsze zapytanie przedłużałoby obecność, której nikt nie potwierdza.
    if (!czyByłDrugiDowod(ostatni_dowod, chwile.chwila_ostatniego_meldunku_ms)
        || chwile.chwila_biezaca_ms >= koniec_okna_ms) {
        return wynik(stan_poprzedni, DUCH, nastawy);
    }
    return wynik(stan_poprzedni, ZSUNIETY, nastawy, koniec_okna_ms);
}

module.exports = { wykryjSkutekCiszy };
