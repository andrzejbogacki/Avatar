'use strict';

// Strażnik GPS — typ kanoniczny „wielokąt" (ADR-011 2.3).
// Zapis kształtu: lista wierzchołków. Test przynależności: test przecięć promienia.
// Obrys z mapy realnej to sposób narysowania wielokąta, nie odrębny byt —
// po zamrożeniu zostaje sama lista wierzchołków i ten jeden test.

const { ZAKRESY, ZIEMIA } = require('../../config');
const { sprawdzWspolrzedne, STOPIEN_NA_RADIAN } = require('./wspolrzedne');

const MIN_WIERZCHOLKOW = 3;
// Test przecięć pracuje na płaszczyźnie długość × szerokość. Plansza nie może
// przecinać południka 180° ani obejmować bieguna (ADR-011 2.3) — kształt
// szerszy niż półkula odrzucamy jawnie, zamiast wydać cichy zły werdykt.
const MAKS_ROZPIETOSC_DLUGOSCI_ST = (ZAKRESY.DLUGOSC_MAX_ST - ZAKRESY.DLUGOSC_MIN_ST) / 2;

function sprawdzWielokat(ksztalt) {
    if (ksztalt === null || typeof ksztalt !== 'object') {
        throw new TypeError('ksztalt: oczekiwano obiektu wielokąta');
    }
    const { wierzcholki } = ksztalt;

    if (!Array.isArray(wierzcholki)) {
        throw new TypeError('ksztalt.wierzcholki: oczekiwano tablicy wierzchołków');
    }
    if (wierzcholki.length < MIN_WIERZCHOLKOW) {
        throw new RangeError(
            `ksztalt.wierzcholki: ${wierzcholki.length} — wielokąt wymaga co najmniej ${MIN_WIERZCHOLKOW}`,
        );
    }
    wierzcholki.forEach((w, i) => sprawdzWspolrzedne(w, `ksztalt.wierzcholki[${i}]`));

    const dlugosci = wierzcholki.map((w) => w.dlugosc_geo);
    const rozpietosc = Math.max(...dlugosci) - Math.min(...dlugosci);
    if (rozpietosc > MAKS_ROZPIETOSC_DLUGOSCI_ST) {
        throw new RangeError(
            `ksztalt.wierzcholki: rozpietosc dlugosci ${rozpietosc}° przekracza ` +
            `${MAKS_ROZPIETOSC_DLUGOSCI_ST}° — kształt poza zakresem testu płaskiego`,
        );
    }
    return ksztalt;
}

// Czy punkt leży na odcinku a–b (włącznie z końcami).
function czyNaOdcinku(punkt, a, b) {
    const px = punkt.dlugosc_geo;
    const py = punkt.szerokosc_geo;
    const iloczynWektorowy = (b.dlugosc_geo - a.dlugosc_geo) * (py - a.szerokosc_geo)
        - (b.szerokosc_geo - a.szerokosc_geo) * (px - a.dlugosc_geo);

    if (iloczynWektorowy !== 0) return false;

    return px >= Math.min(a.dlugosc_geo, b.dlugosc_geo)
        && px <= Math.max(a.dlugosc_geo, b.dlugosc_geo)
        && py >= Math.min(a.szerokosc_geo, b.szerokosc_geo)
        && py <= Math.max(a.szerokosc_geo, b.szerokosc_geo);
}

// Przynależność do wielokąta. Granica należy do zewnętrza — ADR-011 2.3
// rozstrzyga to dla obu typów: punkt na krawędzi i w wierzchołku jest na
// zewnątrz. Kanon, nie wniosek z analogii.
function czyWewnatrzWielokata(punkt, ksztalt) {
    sprawdzWielokat(ksztalt);
    sprawdzWspolrzedne(punkt, 'punkt');

    const { wierzcholki } = ksztalt;
    const px = punkt.dlugosc_geo;
    const py = punkt.szerokosc_geo;

    let wewnatrz = false;

    for (let i = 0, j = wierzcholki.length - 1; i < wierzcholki.length; j = i, i += 1) {
        const a = wierzcholki[j];
        const b = wierzcholki[i];

        if (czyNaOdcinku(punkt, a, b)) return false;

        // Przedział półotwarty po szerokości — promień trafiający w wierzchołek
        // liczy się dokładnie raz.
        if ((a.szerokosc_geo > py) !== (b.szerokosc_geo > py)) {
            const dlugoscPrzeciecia = a.dlugosc_geo
                + (py - a.szerokosc_geo) * (b.dlugosc_geo - a.dlugosc_geo)
                / (b.szerokosc_geo - a.szerokosc_geo);

            if (px < dlugoscPrzeciecia) wewnatrz = !wewnatrz;
        }
    }

    return wewnatrz;
}

const METR_NA_STOPIEN = ZIEMIA.PROMIEN_SREDNI_M * STOPIEN_NA_RADIAN;

// Rzut na płaszczyznę lokalną zaczepioną w punkcie badanym. Południki zbiegają
// się z szerokością, więc długość skalujemy cosinusem. Zgrubność świadoma —
// ADR-011 punkt 1: rozstrzygamy przynależność, nie ustalamy pozycji.
function naMetry(punkt, odniesienie) {
    const cosSzerokosci = Math.cos(odniesienie.szerokosc_geo * STOPIEN_NA_RADIAN);

    return {
        x: (punkt.dlugosc_geo - odniesienie.dlugosc_geo) * METR_NA_STOPIEN * cosSzerokosci,
        y: (punkt.szerokosc_geo - odniesienie.szerokosc_geo) * METR_NA_STOPIEN,
    };
}

// Odległość punktu od odcinka a–b w metrach. Gdy rzut wypada poza odcinek,
// liczy się odległość do bliższego końca — stąd wierzchołki działają same z siebie.
function odlegloscDoOdcinkaMetry(punkt, a, b) {
    const A = naMetry(a, punkt);
    const B = naMetry(b, punkt);
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const dlugoscKw = dx * dx + dy * dy;

    let t = 0;
    if (dlugoscKw > 0) {
        t = -(A.x * dx + A.y * dy) / dlugoscKw;
        t = Math.max(0, Math.min(1, t));
    }
    const rzutX = A.x + t * dx;
    const rzutY = A.y + t * dy;

    return Math.sqrt(rzutX * rzutX + rzutY * rzutY);
}

// Odległość od granicy wielokąta: ujemna wewnątrz, dodatnia na zewnątrz.
// Znak bierze się z tego samego testu przecięć, więc reguła granicy jest jedna.
function odlegloscOdWielokata(punkt, ksztalt) {
    sprawdzWielokat(ksztalt);
    sprawdzWspolrzedne(punkt, 'punkt');

    const { wierzcholki } = ksztalt;
    let najblizsza = Infinity;

    for (let i = 0, j = wierzcholki.length - 1; i < wierzcholki.length; j = i, i += 1) {
        najblizsza = Math.min(najblizsza, odlegloscDoOdcinkaMetry(punkt, wierzcholki[j], wierzcholki[i]));
    }
    return czyWewnatrzWielokata(punkt, ksztalt) ? -najblizsza : najblizsza;
}

module.exports = { czyWewnatrzWielokata, odlegloscOdWielokata };
