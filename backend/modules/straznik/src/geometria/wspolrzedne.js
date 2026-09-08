'use strict';

// Strażnik GPS — walidacja współrzędnych. Wspólna dla obu typów kanonicznych,
// więc nie mieszka w żadnym z nich.
// Brak danych to jawny błąd, nigdy cicha wartość domyślna (KONWENCJE 6).

const { ZAKRESY } = require('../../config');

// Konwersja kątowa wspólna dla obu typów kanonicznych — mieszka tam, gdzie
// reszta wspólnej obsługi współrzędnych, nie w jednym z typów.
const STOPIEN_NA_RADIAN = Math.PI / 180;

function sprawdzWspolrzedne(punkt, nazwa) {
    if (punkt === null || typeof punkt !== 'object') {
        throw new TypeError(`${nazwa}: oczekiwano obiektu współrzędnych`);
    }
    const { szerokosc_geo, dlugosc_geo } = punkt;

    if (!Number.isFinite(szerokosc_geo)) {
        throw new TypeError(`${nazwa}.szerokosc_geo: oczekiwano liczby skończonej`);
    }
    if (szerokosc_geo < ZAKRESY.SZEROKOSC_MIN_ST || szerokosc_geo > ZAKRESY.SZEROKOSC_MAX_ST) {
        throw new RangeError(
            `${nazwa}.szerokosc_geo: ${szerokosc_geo} poza zakresem ` +
            `[${ZAKRESY.SZEROKOSC_MIN_ST}, ${ZAKRESY.SZEROKOSC_MAX_ST}]`,
        );
    }
    if (!Number.isFinite(dlugosc_geo)) {
        throw new TypeError(`${nazwa}.dlugosc_geo: oczekiwano liczby skończonej`);
    }
    if (dlugosc_geo < ZAKRESY.DLUGOSC_MIN_ST || dlugosc_geo > ZAKRESY.DLUGOSC_MAX_ST) {
        throw new RangeError(
            `${nazwa}.dlugosc_geo: ${dlugosc_geo} poza zakresem ` +
            `[${ZAKRESY.DLUGOSC_MIN_ST}, ${ZAKRESY.DLUGOSC_MAX_ST}]`,
        );
    }
    return punkt;
}

module.exports = { sprawdzWspolrzedne, STOPIEN_NA_RADIAN };
