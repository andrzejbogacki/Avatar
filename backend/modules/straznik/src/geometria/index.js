'use strict';

// Strażnik GPS — fasada geometrii planszy (ADR-011 2.3).
// Dwa typy kanoniczne i jeden punkt wejścia. Typ jest polem kształtu, nie
// zgadywanką po zestawie pól: kształt bez typu to kształt nierozstrzygalny.

const { TYPY_KSZTALTU } = require('../../config');
const { odlegloscMetry, czyWewnatrzOkregu, odlegloscOdOkregu } = require('./okrag');
const { czyWewnatrzWielokata, odlegloscOdWielokata } = require('./wielokat');
const { sprawdzWspolrzedne } = require('./wspolrzedne');

const TESTY = Object.freeze({
    okrag: czyWewnatrzOkregu,
    wielokat: czyWewnatrzWielokata,
});

const ODLEGLOSCI = Object.freeze({
    okrag: odlegloscOdOkregu,
    wielokat: odlegloscOdWielokata,
});

// Werdykt przynależności: wewnątrz albo na zewnątrz. Nic pomiędzy, nic o tym,
// gdzie dokładnie stoi punkt.
function kierujPoTypie(mapa, ksztalt) {
    if (ksztalt === null || typeof ksztalt !== 'object') {
        throw new TypeError('ksztalt: oczekiwano obiektu kształtu');
    }
    const funkcja = mapa[ksztalt.typ];

    if (!funkcja) {
        throw new RangeError(
            `ksztalt.typ: ${JSON.stringify(ksztalt.typ)} — dozwolone: ${TYPY_KSZTALTU.join(', ')}`,
        );
    }
    return funkcja;
}

function czyWewnatrzKsztaltu(punkt, ksztalt) {
    return kierujPoTypie(TESTY, ksztalt)(punkt, ksztalt);
}

// Odległość od granicy kształtu, metry ze znakiem: ujemna wewnątrz.
function odlegloscOdKsztaltu(punkt, ksztalt) {
    return kierujPoTypie(ODLEGLOSCI, ksztalt)(punkt, ksztalt);
}

// Przynależność z buforem planszy (ADR-011 2.4). Bufor jest parametrem
// organizatora — nie ma wartości domyślnej, więc brak wartości to błąd,
// nie zero. Przy buforze 0 reguła wraca do „granica należy do zewnętrza".
function czyWewnatrzZBuforem(punkt, ksztalt, bufor_m) {
    if (!Number.isFinite(bufor_m)) {
        throw new TypeError('bufor_m: oczekiwano liczby skończonej — parametr organizatora nie ma wartości domyślnej');
    }
    if (bufor_m < 0) {
        throw new RangeError(`bufor_m: ${bufor_m} — bufor dokłada się na zewnątrz figury, wartość ujemna nie istnieje`);
    }
    return odlegloscOdKsztaltu(punkt, ksztalt) < bufor_m;
}

module.exports = {
    czyWewnatrzKsztaltu,
    odlegloscOdKsztaltu,
    czyWewnatrzZBuforem,
    czyWewnatrzOkregu,
    czyWewnatrzWielokata,
    odlegloscMetry,
    sprawdzWspolrzedne,
};
