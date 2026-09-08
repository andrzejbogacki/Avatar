'use strict';

// Strażnik GPS — kontrakt publiczny modułu (ADR-011). // TERMIN-KANDYDAT: Strażnik GPS
//
// Zakres stanu zapisanego: geometria planszy (2.3, 2.4) oraz dwaj producenci
// meldunku — przekroczenie granicy (2.2, 2.7) i cisza sprzętu (2.8, 2.9).
// Wszystko funkcjami czystymi, bez zależności zewnętrznych. Niezbudowane:
// opaska (2.10) i podpis kształtu (2.6).
//
// Werdykt powstaje na urządzeniu — moduł nie przyjmuje ani nie przekazuje
// współrzędnych dalej. Nie odczytuje też zegara: chwile podaje węzeł
// (ADR-012 punkt 7), a pilnuje tego `test/bez_zegara.test.js`.
// Wzorzec 3·6·9: obliczenie (3); forma i regulacja jeszcze nie istnieją.

const konfig = require('./config');
const geometria = require('./src/geometria');
const obecnosc = require('./src/obecnosc');

module.exports = { konfig, geometria, obecnosc };
