'use strict';

// Strażnik GPS — wspólna walidacja obu producentów meldunku.
// Ten sam wzorzec co `src/geometria/wspolrzedne.js`: reguła wejścia opisana
// raz, żeby dwaj producenci nie rozjechali się w tym, co odrzucają.
//
// Zasada wspólna dla całego modułu: brak wartości jest błędem, nie zerem
// i nie wartością domyślną. Nic tu nie jest zgadywane.

const { STANY_OBECNOSCI, ZRODLA_DOWODU } = require('../../config');

function sprawdzStanPoprzedni(stan) {
    if (!STANY_OBECNOSCI.includes(stan)) {
        throw new RangeError(
            `stan_poprzedni: ${JSON.stringify(stan)} — dozwolone: ${STANY_OBECNOSCI.join(', ')}`,
        );
    }
    return stan;
}

function sprawdzObiekt(wartosc, nazwa) {
    if (wartosc === null || typeof wartosc !== 'object') {
        throw new TypeError(`${nazwa}: oczekiwano obiektu`);
    }
    return wartosc;
}

// Źródło dowodu planszy — ADR-011 2.5. Obowiązkowe przy każdym meldunku,
// bo bez niego meldunek nie niesie własnej siły (Ziarno v12 punkt 1.5).
function sprawdzZrodloDowodu(nastawy) {
    if (!ZRODLA_DOWODU.includes(nastawy.zrodlo_dowodu)) {
        throw new RangeError(
            `nastawy.zrodlo_dowodu: ${JSON.stringify(nastawy.zrodlo_dowodu)} — `
            + `dozwolone: ${ZRODLA_DOWODU.join(', ')}`,
        );
    }
    return nastawy.zrodlo_dowodu;
}

// Chwila podana przez węzeł. Milisekundy uniksowe — konwencja `teraz`
// z modułu Auth. Moduł nigdy jej nie odczytuje, wyłącznie przyjmuje.
function sprawdzChwile(wartosc, nazwa) {
    if (!Number.isFinite(wartosc)) {
        throw new TypeError(
            `${nazwa}: oczekiwano chwili w milisekundach uniksowych, otrzymano ${JSON.stringify(wartosc)}`,
        );
    }
    return wartosc;
}

module.exports = { sprawdzStanPoprzedni, sprawdzObiekt, sprawdzZrodloDowodu, sprawdzChwile };
