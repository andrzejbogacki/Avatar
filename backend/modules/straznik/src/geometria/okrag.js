'use strict';

// Strażnik GPS — typ kanoniczny „okrąg" (ADR-011 2.3).
// Zapis kształtu: punkt środkowy + promień. Test przynależności: odległość
// mniejsza od promienia. Funkcje czyste, bez zależności zewnętrznych.

const { ZIEMIA } = require('../../config');
const { sprawdzWspolrzedne, STOPIEN_NA_RADIAN } = require('./wspolrzedne');

// Odległość po wielkim kole (haversine) na kuli o promieniu średnim. Metry.
function odlegloscMetry(a, b) {
    sprawdzWspolrzedne(a, 'punkt_a');
    sprawdzWspolrzedne(b, 'punkt_b');

    const fiA = a.szerokosc_geo * STOPIEN_NA_RADIAN;
    const fiB = b.szerokosc_geo * STOPIEN_NA_RADIAN;
    const deltaFi = (b.szerokosc_geo - a.szerokosc_geo) * STOPIEN_NA_RADIAN;
    const deltaLambda = (b.dlugosc_geo - a.dlugosc_geo) * STOPIEN_NA_RADIAN;

    const sinFi = Math.sin(deltaFi / 2);
    const sinLambda = Math.sin(deltaLambda / 2);
    const h = sinFi * sinFi + Math.cos(fiA) * Math.cos(fiB) * sinLambda * sinLambda;

    return 2 * ZIEMIA.PROMIEN_SREDNI_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

function sprawdzOkrag(ksztalt) {
    if (ksztalt === null || typeof ksztalt !== 'object') {
        throw new TypeError('ksztalt: oczekiwano obiektu okręgu');
    }
    if (!Number.isFinite(ksztalt.promien_m)) {
        throw new TypeError('ksztalt.promien_m: oczekiwano liczby skończonej');
    }
    if (ksztalt.promien_m <= 0) {
        throw new RangeError(`ksztalt.promien_m: ${ksztalt.promien_m} — oczekiwano wartości dodatniej`);
    }
    sprawdzWspolrzedne(ksztalt.srodek, 'ksztalt.srodek');
    return ksztalt;
}

// Przynależność do okręgu. Granica należy do zewnętrza — ADR-011 2.3 mówi
// „odległość mniejsza od promienia", nie „nie większa". Ta sama reguła
// obowiązuje wielokąt.
function czyWewnatrzOkregu(punkt, ksztalt) {
    sprawdzOkrag(ksztalt);
    sprawdzWspolrzedne(punkt, 'punkt');

    return odlegloscMetry(punkt, ksztalt.srodek) < ksztalt.promien_m;
}

// Odległość od granicy okręgu: ujemna wewnątrz, dodatnia na zewnątrz, zero
// na granicy. Bufor planszy (ADR-011 2.4) porównuje się z tą wartością.
function odlegloscOdOkregu(punkt, ksztalt) {
    sprawdzOkrag(ksztalt);
    sprawdzWspolrzedne(punkt, 'punkt');

    return odlegloscMetry(punkt, ksztalt.srodek) - ksztalt.promien_m;
}

module.exports = { odlegloscMetry, czyWewnatrzOkregu, odlegloscOdOkregu };
