'use strict';

// Strażnik GPS — przekroczenie granicy planszy (ADR-011 punkty 2.2 i 2.7).
// Pierwszy z dwóch producentów meldunku. Meldunek powstaje w chwili zmiany
// stanu, nie w regularnym takcie. Cisza znaczy „bez zmian" (Ziarno v12 1.10).
//
// Czego tu nie ma i mieć nie będzie: czasu w żadnej postaci. Ten producent
// orzeka z samej pozycji, więc jego meldunek nie niesie chwili — chwilę
// rozstrzygającą nadaje węzeł przy przyjęciu podpisanej treści (ADR-012
// punkt 7). Bezpiecznik ciszy sprzętu (2.8) i zsunięcie warunkowe (2.9) to
// drugi producent i drugi plik: `cisza.js`.
//
// Stan `zsuniety` jest tu dopuszczonym wejściem, i to celowo: skoro pozycja
// w ogóle dotarła, telefon znów mówi i cisza się skończyła. Pozycja rozstrzyga
// wtedy od nowa — zsunięta obecność wraca do `obecny` albo gaśnie do `duch`.

const { STANY_OBECNOSCI } = require('../../config');
const { czyWewnatrzZBuforem } = require('../geometria');
const { sprawdzStanPoprzedni, sprawdzObiekt, sprawdzZrodloDowodu } = require('./wejscie');

const [OBECNY, DUCH] = STANY_OBECNOSCI;

function sprawdzNastawy(nastawy) {
    sprawdzObiekt(nastawy, 'nastawy');
    sprawdzZrodloDowodu(nastawy);
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
