'use strict';

// Strażnik GPS — przekroczenie granicy planszy (ADR-011 punkty 2.2 i 2.7).
// Meldunek powstaje w chwili zmiany stanu, nie w regularnym takcie. Cisza
// znaczy „bez zmian" (Ziarno v12 punkt 1.10).
//
// Czego tu nie ma i mieć nie będzie: zegara. Chwilę rozstrzygającą nadaje
// węzeł przy przyjęciu podpisanej treści (ADR-012 punkt 7), więc urządzenie
// nie stempluje meldunku własnym czasem. Bezpiecznik ciszy sprzętu (ADR-011
// 2.8) i zsunięcie warunkowe (2.9) to inny mechanizm — nie ten plik.

const { STANY_OBECNOSCI, ZRODLA_DOWODU } = require('../../config');
const { czyWewnatrzZBuforem } = require('../geometria');

const [OBECNY, DUCH] = STANY_OBECNOSCI;

function sprawdzStanPoprzedni(stan) {
    if (!STANY_OBECNOSCI.includes(stan)) {
        throw new RangeError(
            `stan_poprzedni: ${JSON.stringify(stan)} — dozwolone: ${STANY_OBECNOSCI.join(', ')}`,
        );
    }
    return stan;
}

function sprawdzNastawy(nastawy) {
    if (nastawy === null || typeof nastawy !== 'object') {
        throw new TypeError('nastawy: oczekiwano obiektu nastaw planszy');
    }
    if (!ZRODLA_DOWODU.includes(nastawy.zrodlo_dowodu)) {
        throw new RangeError(
            `nastawy.zrodlo_dowodu: ${JSON.stringify(nastawy.zrodlo_dowodu)} — `
            + `dozwolone: ${ZRODLA_DOWODU.join(', ')}`,
        );
    }
    return nastawy;
}

// Werdykt i meldunek. Na zewnątrz idzie stan, nigdy pozycja — meldunek niesie
// samo słowo i źródło dowodu, niczego więcej.
function wykryjZmianeStanu(stan_poprzedni, punkt, ksztalt, nastawy) {
    sprawdzStanPoprzedni(stan_poprzedni);
    sprawdzNastawy(nastawy);

    const stan = czyWewnatrzZBuforem(punkt, ksztalt, nastawy.bufor_m) ? OBECNY : DUCH;

    if (stan === stan_poprzedni) {
        return { stan, meldunek: null };
    }
    return { stan, meldunek: { stan, zrodlo_dowodu: nastawy.zrodlo_dowodu } };
}

module.exports = { wykryjZmianeStanu };
