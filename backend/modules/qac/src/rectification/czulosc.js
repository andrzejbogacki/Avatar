'use strict';

const { lokalnyNaUtc, utcNaSkaleCzasowe } = require('../calculator/czas');
const { osieKatowe } = require('../calculator/osie');
const { astronomia, rektyfikacja } = require('../../config');
const { kwantyzuj } = require('../calculator/kwantyzacja');
const { znakZodiaku } = require('../calculator/zodiak');

/**
 * Zwraca funkcję os(przesuniecie_s) -> {asc_deg, mc_deg}.
 * Bazowy jd_ut liczony raz z czasu lokalnego; przesunięcie dodawane w skali
 * jd_ut (houses_ex2 wymaga jd_ut). Dodatnie = później, ujemne = wcześniej.
 */
function osieDlaPrzesuniecia({ czas_lokalny, strefa, obserwator }) {
    const { czas_utc } = lokalnyNaUtc(czas_lokalny, strefa);
    const { jd_ut } = utcNaSkaleCzasowe(czas_utc);
    return function os(przesuniecie_s) {
        const osie = osieKatowe(jd_ut + przesuniecie_s / astronomia.SEKUND_NA_DOBE, obserwator);
        return {
            asc_deg: osie.ascendent.dlugosc_ekliptyczna_deg,
            mc_deg: osie.mc.dlugosc_ekliptyczna_deg,
        };
    };
}

// Najmniejsze |przesunięcie| [s], przy którym klucz klasyfikacji się zmienia.
// Skan sekunda po sekundzie w obie strony do horyzontu; null = brak zmiany w horyzoncie.
function odlegloscDoZmiany(os, wybierzDeg, klasyfikuj, horyzont_s) {
    const klucz0 = klasyfikuj(wybierzDeg(os(0)));
    for (let s = 1; s <= horyzont_s; s++) {
        if (klasyfikuj(wybierzDeg(os(s))) !== klucz0) return s;
        if (klasyfikuj(wybierzDeg(os(-s))) !== klucz0) return s;
    }
    return null;
}

function osCzulosc(os, wybierzDeg, horyzont_s) {
    const deg0 = wybierzDeg(os(0));
    const q = kwantyzuj(deg0);
    return {
        bramka: q.bramka,
        linia: q.linia,
        znak: znakZodiaku(deg0),
        sek_do_bramki: odlegloscDoZmiany(os, wybierzDeg, (d) => kwantyzuj(d).bramka, horyzont_s),
        sek_do_linii: odlegloscDoZmiany(os, wybierzDeg, (d) => `${kwantyzuj(d).bramka}.${kwantyzuj(d).linia}`, horyzont_s),
    };
}

function czuloscOsi(wejscie) {
    const os = osieDlaPrzesuniecia(wejscie);
    const H = rektyfikacja.CZULOSC.HORYZONT_POMIARU_S;
    return {
        ASC: osCzulosc(os, (o) => o.asc_deg, H),
        MC: osCzulosc(os, (o) => o.mc_deg, H),
    };
}

function alarmCzulosci(wejscie, prog_s = rektyfikacja.CZULOSC.PROG_ALARMU_S) {
    if (prog_s > rektyfikacja.CZULOSC.HORYZONT_POMIARU_S) {
        throw new Error(
            `prog_s (${prog_s} s) przekracza horyzont pomiaru (${rektyfikacja.CZULOSC.HORYZONT_POMIARU_S} s) — zwiększ HORYZONT_POMIARU_S`
        );
    }
    const c = czuloscOsi(wejscie);
    const powody = [];
    for (const os of ['ASC', 'MC']) {
        const o = c[os];
        if (o.sek_do_bramki !== null && o.sek_do_bramki <= prog_s) {
            powody.push({ os, rodzaj: 'bramka', sekundy: o.sek_do_bramki });
        }
        if (o.sek_do_linii !== null && o.sek_do_linii <= prog_s) {
            powody.push({ os, rodzaj: 'linia', sekundy: o.sek_do_linii });
        }
    }
    return { alarm: powody.length > 0, prog_s, powody };
}

module.exports = { osieDlaPrzesuniecia, czuloscOsi, alarmCzulosci };
