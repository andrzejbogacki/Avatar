'use strict';

const { lokalnyNaUtc, utcNaSkaleCzasowe } = require('../calculator/czas');
const { osieKatowe } = require('../calculator/osie');
const { pozycjeTopocentryczne } = require('../calculator/pozycje');
const { kwantyzuj } = require('../calculator/kwantyzacja');
const { znakZodiaku } = require('../calculator/zodiak');
const { rektyfikacja, astronomia, bramki } = require('../../config');

const POLA = ['ascendent', 'mc', 'slonce', 'ziemia', 'ksiezyc'];

// Wartości długości ekliptycznej pól czułych w chwili (jd_et dla ciał, jd_ut dla osi).
function wartosciPol(jd_et, jd_ut, obserwator) {
    const osie = osieKatowe(jd_ut, obserwator);
    const poz = pozycjeTopocentryczne(jd_et, obserwator);
    const K = bramki.PELNE_KOLO_DEG;
    const slonce = poz.slonce.dlugosc_ekliptyczna_deg;
    return {
        ascendent: osie.ascendent.dlugosc_ekliptyczna_deg,
        mc: osie.mc.dlugosc_ekliptyczna_deg,
        slonce,
        ziemia: ((slonce + K / 2) % K + K) % K,
        ksiezyc: poz.ksiezyc.dlugosc_ekliptyczna_deg,
    };
}

/**
 * Zmienność pól czułych w oknie ± polszerokosc_min wokół podanej godziny.
 * Zwraca per pole liczbę możliwych bram/linii w oknie, wartość w środku i status.
 */
function polaWOknie({ czas_lokalny, strefa, obserwator, polszerokosc_min }) {
    if (!(polszerokosc_min > 0)) {
        throw new Error(`Niepewność: polszerokosc_min musi być > 0: ${polszerokosc_min}`);
    }
    const { czas_utc } = lokalnyNaUtc(czas_lokalny, strefa);
    const { jd_et, jd_ut } = utcNaSkaleCzasowe(czas_utc);
    const doba = astronomia.SEKUND_NA_DOBE;
    const krok = rektyfikacja.NIEPEWNOSC.KROK_SKANU_S;
    const zasieg = polszerokosc_min * 60;

    const bramySet = {}, linieSet = {};
    for (const p of POLA) { bramySet[p] = new Set(); linieSet[p] = new Set(); }

    for (let s = -zasieg; s <= zasieg; s += krok) {
        const w = wartosciPol(jd_et + s / doba, jd_ut + s / doba, obserwator);
        for (const p of POLA) {
            const q = kwantyzuj(w[p]);
            bramySet[p].add(q.bramka);
            linieSet[p].add(`${q.bramka}.${q.linia}`);
        }
    }

    const srodek = wartosciPol(jd_et, jd_ut, obserwator);
    const wynik = {};
    for (const p of POLA) {
        const q = kwantyzuj(srodek[p]);
        const nb = bramySet[p].size, nl = linieSet[p].size;
        wynik[p] = {
            w_srodku: { bramka: q.bramka, linia: q.linia, znak: znakZodiaku(srodek[p]).nazwa },
            mozliwych_bram: nb,
            mozliwych_linii: nl,
            status: nb > 1 ? 'niepewne' : (nl > 1 ? 'niepewne_linia' : 'pewne'),
        };
    }
    return wynik;
}

/**
 * Sekcja profilu niepewności: zbiera pola w oknie, degraduje warstwy astrologiczne
 * na podstawie pewności osi i profilu.
 */
function sekcjaNiepewnosci({ czas_zrodlo, czas_lokalny, strefa, obserwator, polszerokosc_min }) {
    const pola = polaWOknie({ czas_lokalny, strefa, obserwator, polszerokosc_min });
    const osieNiepewne = pola.ascendent.status !== 'pewne' || pola.mc.status !== 'pewne';
    const profilPewny = pola.slonce.status === 'pewne' && pola.ziemia.status === 'pewne';
    const ksiezycStan = pola.ksiezyc.status === 'pewne'
        ? 'czynna'
        : (pola.ksiezyc.status === 'niepewne_linia' ? 'czesciowa' : 'nieczynna');

    const dwa = (n) => String(n).padStart(2, '0');
    return {
        czas_zrodlo,
        okno: {
            srodek: `${dwa(czas_lokalny.godzina)}:${dwa(czas_lokalny.minuta)}`,
            polszerokosc_min,
        },
        piaskownica: true,
        pola,
        warstwy_zdegradowane: [
            { warstwa: 'profil Human Design (linie Słońca/Ziemi)', stan: profilPewny ? 'czynna' : 'nieczynna' },
            { warstwa: 'nakszatra Księżyca', stan: ksiezycStan },
            { warstwa: 'astrologia domowa (domy, osie)', stan: osieNiepewne ? 'nieczynna' : 'czynna' },
        ],
    };
}

module.exports = { polaWOknie, sekcjaNiepewnosci };
