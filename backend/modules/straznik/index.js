'use strict';

// Strażnik GPS — kontrakt publiczny modułu (ADR-011). // TERMIN-KANDYDAT: Strażnik GPS
//
// Zakres stanu zapisanego: wyłącznie geometria planszy z punktu 2.3 ADR —
// dwa testy przynależności jako funkcje czyste, bez zależności zewnętrznych.
// Reszta Strażnika (meldunki o zmianie stanu, bezpiecznik ciszy sprzętu,
// zsunięcie warunkowe, opaska, podpis kształtu) nie jest zbudowana.
//
// Werdykt powstaje na urządzeniu — moduł nie przyjmuje ani nie przekazuje
// współrzędnych dalej. Wejściem jest punkt i kształt, wyjściem wartość
// logiczna. Wzorzec 3·6·9: obliczenie (3); forma i regulacja jeszcze
// nie istnieją.

const konfig = require('./config');
const geometria = require('./src/geometria');
const obecnosc = require('./src/obecnosc');

module.exports = { konfig, geometria, obecnosc };
