'use strict';

const { lokalnyNaUtc, utcNaSkaleCzasowe } = require('../calculator/czas');
const { osieKatowe } = require('../calculator/osie');
const { pozycjeTopocentryczne } = require('../calculator/pozycje');
const { wagaAspektu } = require('./dopasowanie');
const { rektyfikacja, astronomia } = require('../../config');

/**
 * Osie natalne (ASC/MC) dla każdego kandydata godziny w oknie ± polszerokosc_min.
 * Zależą od godziny, NIE od wydarzeń — liczone raz, wielokrotnie użyte (real + NULL).
 */
function osieKandydatow({ czas_lokalny, strefa, obserwator, polszerokosc_min, krok_min }) {
    if (!(polszerokosc_min > 0) || !(krok_min > 0)) {
        throw new Error(`Bramka: polszerokosc_min i krok_min muszą być > 0`);
    }
    const { czas_utc } = lokalnyNaUtc(czas_lokalny, strefa);
    const { jd_ut } = utcNaSkaleCzasowe(czas_utc);
    const doba = astronomia.SEKUND_NA_DOBE;
    const out = [];
    for (let off = -polszerokosc_min; off <= polszerokosc_min + 1e-9; off += krok_min) {
        const o = osieKatowe(jd_ut + (off * 60) / doba, obserwator);
        out.push({
            offset_min: Math.round(off),
            asc: o.ascendent.dlugosc_ekliptyczna_deg,
            mc: o.mc.dlugosc_ekliptyczna_deg,
        });
    }
    return out;
}

/** Długości ekliptyczne wszystkich ciał w chwili wydarzenia (tranzyt). */
function pozycjeTranzytu(czas_utc, obserwator) {
    const { jd_et } = utcNaSkaleCzasowe(czas_utc);
    const poz = pozycjeTopocentryczne(jd_et, obserwator);
    return Object.values(poz).map((p) => p.dlugosc_ekliptyczna_deg);
}

/**
 * Wynik dopasowania każdego kandydata: średnia (po wydarzeniach) najlepszej wagi
 * aspektu między dowolnym tranzytującym ciałem a natalnym ASC lub MC kandydata.
 */
function scoreKandydatow(osieKand, tranzytyWydarzen) {
    if (!Array.isArray(tranzytyWydarzen) || tranzytyWydarzen.length === 0) {
        throw new Error('Bramka: wymagana niepusta lista tranzytów wydarzeń');
    }
    return osieKand.map(({ asc, mc }) => {
        let suma = 0;
        for (const tr of tranzytyWydarzen) {
            let best = 0;
            for (const t of tr) {
                const w = Math.max(wagaAspektu(t, asc), wagaAspektu(t, mc));
                if (w > best) best = w;
            }
            suma += best;
        }
        return suma / tranzytyWydarzen.length;
    });
}

/** Prominencja najlepszego kandydata nad rozkładem wszystkich (separacja piku). */
function prominencjaPiku(scores) {
    if (!Array.isArray(scores) || scores.length === 0) {
        throw new Error('Bramka: brak wyników do oceny prominencji');
    }
    let best = -Infinity, iBest = -1;
    for (let i = 0; i < scores.length; i++) {
        if (scores[i] > best) { best = scores[i]; iBest = i; }
    }
    const srednia = scores.reduce((a, b) => a + b, 0) / scores.length;
    const wariancja = scores.reduce((a, b) => a + (b - srednia) ** 2, 0) / scores.length;
    const sd = Math.sqrt(wariancja);
    const prominencja = sd > 1e-9 ? (best - srednia) / sd : 0;
    return { iBest, best, srednia, sd, prominencja };
}

/**
 * Rozkład NULL: K prób, każda dobiera `liczbaWydarzen` losowych zestawów tranzytów
 * z puli (indeks = floor(losuj()·rozmiar)) i liczy prominencję piku. losuj: ()->[0,1).
 */
function rozkladNull(osieKand, pulaTranzytow, liczbaWydarzen, K, losuj) {
    if (!Array.isArray(pulaTranzytow) || pulaTranzytow.length === 0) {
        throw new Error('Bramka: pusta pula NULL');
    }
    const proms = [];
    for (let k = 0; k < K; k++) {
        const probka = [];
        for (let e = 0; e < liczbaWydarzen; e++) {
            const idx = Math.min(Math.floor(losuj() * pulaTranzytow.length), pulaTranzytow.length - 1);
            probka.push(pulaTranzytow[idx]);
        }
        proms.push(prominencjaPiku(scoreKandydatow(osieKand, probka)).prominencja);
    }
    return proms;
}

/**
 * Bramka uczciwości: zwraca godzinę TYLKO gdy pik rzeczywistych wydarzeń wyraźnie
 * bije rozkład NULL. p_value = (#NULL ≥ real + 1)/(K+1); pewnosc = 1 − p_value.
 * `tranzytyWydarzen` i `pulaNull` — tablice tablic długości (wstrzykiwalne).
 */
function bramkaUczciwosci({
    czas_lokalny, strefa, obserwator, polszerokosc_min,
    tranzytyWydarzen, pulaNull,
    krok_min, K, prog_pewnosci, losuj,
}) {
    const cfg = rektyfikacja.BRAMKA_UCZCIWOSCI;
    krok_min = krok_min ?? cfg.KROK_KANDYDATA_MIN;
    K = K ?? cfg.K_NULL;
    prog_pewnosci = prog_pewnosci ?? cfg.PROG_PEWNOSCI;
    losuj = losuj ?? Math.random;

    const osieKand = osieKandydatow({ czas_lokalny, strefa, obserwator, polszerokosc_min, krok_min });
    const realny = prominencjaPiku(scoreKandydatow(osieKand, tranzytyWydarzen));
    const nul = rozkladNull(osieKand, pulaNull, tranzytyWydarzen.length, K, losuj);

    const gorszych = nul.filter((p) => p >= realny.prominencja).length;
    const p_value = (gorszych + 1) / (K + 1);
    const pewnosc = 1 - p_value;
    const zaufany = pewnosc >= prog_pewnosci;

    return {
        pewnosc: Number(pewnosc.toFixed(4)),
        p_value: Number(p_value.toFixed(4)),
        prominencja: Number(realny.prominencja.toFixed(3)),
        wynik: zaufany ? { offset_min: osieKand[realny.iBest].offset_min } : null,
        powod: zaufany
            ? 'sygnał wyraźnie ponad przypadek (NULL)'
            : 'brak sygnału ponad przypadek (NULL) — nie umiem wyznaczyć godziny',
    };
}

module.exports = { osieKandydatow, pozycjeTranzytu, scoreKandydatow, prominencjaPiku, rozkladNull, bramkaUczciwosci };
