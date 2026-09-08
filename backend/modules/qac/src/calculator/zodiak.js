'use strict';

const { zodiak, bramki } = require('../../config');

/**
 * Znak zodiaku tropikalnego dla długości ekliptycznej.
 * Normalizuje do [0,360). Niezależny od kwantyzacji 64 bram (reguła znak+brama).
 */
function znakZodiaku(dlugoscEkliptycznaDeg) {
    if (!Number.isFinite(dlugoscEkliptycznaDeg)) {
        throw new Error(`Nieprawidłowa długość ekliptyczna: ${dlugoscEkliptycznaDeg}`);
    }
    const s = ((dlugoscEkliptycznaDeg % bramki.PELNE_KOLO_DEG) + bramki.PELNE_KOLO_DEG) % bramki.PELNE_KOLO_DEG;
    const indeks = Math.min(Math.floor(s / zodiak.SZEROKOSC_ZNAKU_DEG), zodiak.LICZBA_ZNAKOW - 1);
    return {
        indeks,
        nazwa: zodiak.NAZWY_ZNAKOW[indeks],
        stopnie_w_znaku: s - indeks * zodiak.SZEROKOSC_ZNAKU_DEG,
    };
}

module.exports = { znakZodiaku };
