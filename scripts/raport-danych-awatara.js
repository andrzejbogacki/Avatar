#!/usr/bin/env node
'use strict';

// Raport rozmieszczenia danych Awatara — REGULA_DANYCH.md punkt 6.
//
// Skrypt wyłącznie czyta i wypisuje, gdzie leżą dane danego avatar_id.
// Nie kasuje, nie modyfikuje, nie zapisuje niczego. Pełna automatyzacja
// usuwania została odrzucona — usunięcie danych pozostaje decyzją i czynnością
// człowieka, a to narzędzie mówi mu tylko, czego szukać i gdzie.

const fs = require('node:fs');
const path = require('node:path');

// Katalogi danych bierzemy z magazynów modułów — jedno źródło prawdy.
const { KATALOG_PROFILI, KATALOG_KOSZA } = require('../backend/modules/qac/src/regulator9/bramka_zapisu');
const { KATALOG_DOMYSLNY: KATALOG_KONT } = require('../backend/modules/auth/src/konta/magazyn');
const { KATALOG_DOMYSLNY: KATALOG_ZAPROSZEN } = require('../backend/modules/auth/src/regulator9/magazyn_zaproszen');
const { KATALOG_DOMYSLNY: KATALOG_PROFILI_PS } = require('../backend/modules/ps/src/profil/magazyn');
const { KATALOG_DOMYSLNY: KATALOG_SALD } = require('../backend/modules/wymiennik/src/salda/magazyn_sald');
const { KATALOG_DOMYSLNY: KATALOG_TOKENOW } = require('../backend/modules/wymiennik/src/fabryka/magazyn_tokenow');
const { KATALOG_DOMYSLNY: KATALOG_ZRODEL } = require('../backend/modules/rezonator/src/zrodla/magazyn');

// Wzorzec bezpieczeństwa ścieżki — wspólny dla Auth, PS i Wymiennika.
// Odrzuca kropkę i ukośnik, więc avatar_id nie wyprowadzi odczytu poza
// katalog danych. Sprawdzenie idzie ZAWSZE przed złożeniem ścieżki.
const WZORZEC_AVATAR_ID = /^[a-z][a-z0-9_]{2,63}$/;

const STAN_OBECNY = 'jest';
const STAN_BRAK = 'nie znaleziono';
const STAN_BEZ_NASTAWY = 'nastawa niepodana';

// Nastawy organizatora. Kontener wejściowy i tabela wiążąca leżą poza
// repozytorium (punkt 2) — skrypt nie zgaduje, gdzie Suweren je trzyma.
// Bez nastawy raport mówi o tym wprost, zamiast milczeć o całym bycie.
const ZMIENNE_SCIEZEK = Object.freeze({
    kontener: 'AVATAR_KONTENER_WEJSCIOWY',
    tabela: 'AVATAR_TABELA_WIAZACA',
});

// Nastawa opcjonalna: przesuwa katalogi danych na inny korzeń, w układzie
// z punktu 2 — sprawdzenie skryptu na stanowisku syntetycznym (6.6).
const ZMIENNA_KORZENIA_DANYCH = 'AVATAR_KORZEN_DANYCH';

function katalogiDanych(srodowisko = process.env) {
    const korzen = srodowisko[ZMIENNA_KORZENIA_DANYCH];
    if (!korzen || !String(korzen).trim()) {
        return {
            profileQac: KATALOG_PROFILI,
            konta: KATALOG_KONT,
            zaproszenia: KATALOG_ZAPROSZEN,
            profilePs: KATALOG_PROFILI_PS,
            salda: KATALOG_SALD,
            tokeny: KATALOG_TOKENOW,
            transakcje: path.join(KATALOG_SALD, '..', 'transakcje'),
            oferty: path.join(KATALOG_SALD, '..', 'oferty'),
            zrodla: KATALOG_ZRODEL,
        };
    }
    const baza = path.resolve(String(korzen).trim());
    return {
        profileQac: path.join(baza, 'qac', 'profiles'),
        konta: path.join(baza, 'auth', 'accounts'),
        zaproszenia: path.join(baza, 'auth', 'zaproszenia'),
        profilePs: path.join(baza, 'ps', 'profile'),
        salda: path.join(baza, 'wymiennik', 'salda'),
        tokeny: path.join(baza, 'wymiennik', 'tokeny'),
        transakcje: path.join(baza, 'wymiennik', 'transakcje'),
        oferty: path.join(baza, 'wymiennik', 'oferty'),
        zrodla: path.join(baza, 'rezonator', 'zrodla'),
    };
}

function odczytajNastawy(srodowisko = process.env) {
    const nastawy = {};
    for (const [klucz, zmienna] of Object.entries(ZMIENNE_SCIEZEK)) {
        const wartosc = srodowisko[zmienna];
        nastawy[klucz] = (wartosc && String(wartosc).trim())
            ? path.resolve(String(wartosc).trim()) : null;
    }
    return nastawy;
}

function sprawdzAvatarId(avatar_id) {
    if (typeof avatar_id !== 'string' || !WZORZEC_AVATAR_ID.test(avatar_id)) {
        throw new Error(
            `Nieprawidłowy avatar_id: wymagany wzorzec ${WZORZEC_AVATAR_ID}. Otrzymano: ${avatar_id}`
        );
    }
    return avatar_id;
}

function wczytajJson(sciezka) {
    try {
        return JSON.parse(fs.readFileSync(sciezka, 'utf8'));
    } catch (blad) {
        if (blad.code === 'ENOENT') return null;
        if (blad instanceof SyntaxError) {
            throw new Error(`Plik nie jest poprawnym JSON-em (${sciezka}): ${blad.message}`);
        }
        throw blad;
    }
}

function plikiJsonWKatalogu(katalog) {
    try {
        return fs.readdirSync(katalog).filter((n) => n.endsWith('.json'));
    } catch (blad) {
        if (blad.code === 'ENOENT') return [];
        throw blad;
    }
}

/**
 * Czy rekord niesie ten identyfikator w którymkolwiek ze swoich pól.
 * Kryterium celowo nie wymienia nazw pól: punkt 6.2 mówi „wpisy z tym
 * identyfikatorem", a struktura certyfikatów zewnętrznych nie ma jeszcze
 * implementacji, więc nazwa pola wystawcy nie jest przesądzona.
 */
function niesieIdentyfikator(rekord, avatar_id) {
    if (rekord === avatar_id) return true;
    if (!rekord || typeof rekord !== 'object') return false;
    return Object.values(rekord).some((w) => w === avatar_id);
}

function pozycjaPliku(cel, sciezka, punkt) {
    return { cel, punkt, sciezka, stan: fs.existsSync(sciezka) ? STAN_OBECNY : STAN_BRAK };
}

/** Wszystkie wersje profilu QAC: plik aktywny plus kopie w koszu bramki 9b (6.1.1). */
function zbierzWersjeProfiluQac(avatar_id, katalogProfili) {
    const pliki = [path.join(katalogProfili, `${avatar_id}.json`)];
    const przedrostek = `${avatar_id}-`;
    for (const nazwa of plikiJsonWKatalogu(path.join(katalogProfili, KATALOG_KOSZA))) {
        if (nazwa.startsWith(przedrostek)) {
            pliki.push(path.join(katalogProfili, KATALOG_KOSZA, nazwa));
        }
    }
    return pliki;
}

/** Pliki w katalogu, których treść spełnia predykat — magazyny kluczowane nie po avatar_id. */
function znajdzPlikiPoTresci(katalog, predykat) {
    const znalezione = [];
    for (const nazwa of plikiJsonWKatalogu(katalog)) {
        const sciezka = path.join(katalog, nazwa);
        const rekord = wczytajJson(sciezka);
        if (rekord && predykat(rekord)) znalezione.push(sciezka);
    }
    return znalezione;
}

/** Liczy ślady identyfikatora w profilu innego Awatara (6.2). Niczego nie zmienia. */
function policzSladyWProfiluPs(profil, avatar_id) {
    let slady = 0;
    const relacje = profil?.modul_4_protokol_relacji;

    const poziomy = relacje?.strumien_2_dostep_do_wiedzy?.poziomy_obserwatorow;
    if (poziomy && Object.prototype.hasOwnProperty.call(poziomy, avatar_id)) slady += 1;

    const policz = (tablica) => (Array.isArray(tablica)
        ? tablica.filter((w) => niesieIdentyfikator(w, avatar_id)).length : 0);

    slady += policz(relacje?.strumien_1_dostep_relacyjny?.nadpisania);
    slady += policz(relacje?.rejestr_dostepu);
    slady += policz(relacje?.zgody_na_kontakt);

    const osie = profil?.modul_1_jakosci_kwantowe?.osie;
    if (osie && typeof osie === 'object') {
        for (const poziomy_osi of Object.values(osie)) {
            for (const poziom of Object.values(poziomy_osi ?? {})) {
                slady += policz(poziom?.certyfikaty_zewnetrzne);
            }
        }
    }

    if (profil?.certyfikacja_startowa?.zapraszajacy === avatar_id) slady += 1;

    return slady;
}

/** Buduje raport. Wyłącznie odczyt — żadna ścieżka nie jest zapisywana ani kasowana. */
function zbierzRaport(avatar_id, nastawy, katalogi) {
    sprawdzAvatarId(avatar_id);
    const pozycje = [];

    // --- 6.1 Magazyny własne Awatara ---
    for (const sciezka of zbierzWersjeProfiluQac(avatar_id, katalogi.profileQac)) {
        pozycje.push(pozycjaPliku('profil QAC', sciezka, '6.1.1'));
    }
    pozycje.push(pozycjaPliku('konto Auth', path.join(katalogi.konta, `${avatar_id}.json`), '6.1.2'));
    pozycje.push(pozycjaPliku('profil Protokołu Suwerenności', path.join(katalogi.profilePs, `${avatar_id}.json`), '6.1.3'));
    pozycje.push(pozycjaPliku('saldo Wymiennika', path.join(katalogi.salda, `${avatar_id}.json`), '6.1.4'));

    for (const [klucz, cel, punkt, pole] of [
        ['kontener', 'kontener wejściowy (dane urodzeniowe, wszystkie wersje)', '6.1.5', 'rekordy'],
        ['tabela', 'wpis w tabeli wiążącej', '6.1.6', 'wpisy'],
    ]) {
        if (!nastawy[klucz]) {
            pozycje.push({
                cel, punkt, sciezka: `(${ZMIENNE_SCIEZEK[klucz]})`, stan: STAN_BEZ_NASTAWY,
            });
            continue;
        }
        const dane = wczytajJson(nastawy[klucz]);
        const rekordy = Array.isArray(dane?.[pole])
            ? dane[pole].filter((r) => r?.avatar_id === avatar_id) : [];
        pozycje.push({
            cel, punkt, sciezka: nastawy[klucz], liczba: rekordy.length,
            stan: rekordy.length > 0 ? STAN_OBECNY : STAN_BRAK,
        });
    }

    for (const sciezka of znajdzPlikiPoTresci(katalogi.tokeny,
        (t) => t.klasa === 'avatar' && t.emitent === avatar_id)) {
        pozycje.push(pozycjaPliku('token klasy avatar', sciezka, '6.1.7'));
    }
    for (const sciezka of znajdzPlikiPoTresci(katalogi.zrodla, (z) => z.wlasciciel === avatar_id)) {
        pozycje.push(pozycjaPliku('źródło Rezonatora', sciezka, '6.1.8'));
    }

    // --- 6.2 Ślady w danych innych Awatarów ---
    for (const nazwa of plikiJsonWKatalogu(katalogi.profilePs)) {
        if (nazwa === `${avatar_id}.json`) continue;
        const sciezka = path.join(katalogi.profilePs, nazwa);
        const profil = wczytajJson(sciezka);
        if (!profil) continue;
        const slady = policzSladyWProfiluPs(profil, avatar_id);
        if (slady > 0) {
            pozycje.push({
                cel: `ślady w profilu ${nazwa.replace(/\.json$/, '')}`,
                punkt: '6.2', sciezka, liczba: slady, stan: STAN_OBECNY,
            });
        }
    }

    const nosiId = (r) => niesieIdentyfikator(r, avatar_id);
    for (const [katalog, cel] of [
        [katalogi.zaproszenia, 'zaproszenie Auth'],
        [katalogi.transakcje, 'transakcja Wymiennika'],
        [katalogi.oferty, 'oferta Wymiennika'],
    ]) {
        for (const sciezka of znajdzPlikiPoTresci(katalog, nosiId)) {
            pozycje.push({ cel, punkt: '6.2', sciezka, stan: STAN_OBECNY });
        }
    }

    const obecnych = pozycje.filter((p) => p.stan === STAN_OBECNY).length;
    return { avatar_id, pozycje, obecnych };
}

function raport(wynik) {
    const wiersz = (p) => {
        const ogon = p.liczba !== undefined ? ` [${p.liczba}]` : '';
        return `  ${p.stan.padEnd(18)} ${p.punkt.padEnd(6)} ${p.cel}${ogon}\n${' '.repeat(28)}${p.sciezka}`;
    };
    const naglowek = wynik.obecnych > 0
        ? `Dane Awatara ${wynik.avatar_id} — znalezionych miejsc: ${wynik.obecnych}`
        : `Dane Awatara ${wynik.avatar_id} — nie znaleziono w żadnym magazynie`;
    return [
        naglowek,
        ...wynik.pozycje.map(wiersz),
        '',
        '  Raport. Skrypt niczego nie skasował ani nie zmienił.',
        '  Sesja logowania (6.3) żyje w pamięci procesu serwera i nie jest tu widoczna.',
    ].join('\n');
}

function glowna(argv) {
    const pozycyjne = argv.filter((a) => !a.startsWith('--'));
    if (pozycyjne.length !== 1) {
        process.stderr.write(
            'Wywołanie: node scripts/raport-danych-awatara.js <avatar_id>\n\n'
            + 'Skrypt wyłącznie raportuje. Niczego nie kasuje.\n\n'
            + 'Nastawy organizatora (bez nich raport mówi „nastawa niepodana"):\n'
            + `  ${ZMIENNE_SCIEZEK.kontener}  — kontener wejściowy\n`
            + `  ${ZMIENNE_SCIEZEK.tabela}      — tabela wiążąca\n`
            + `  ${ZMIENNA_KORZENIA_DANYCH}       — korzeń katalogów danych (opcjonalna)\n`
        );
        return 2;
    }
    const wynik = zbierzRaport(pozycyjne[0], odczytajNastawy(), katalogiDanych());
    process.stdout.write(`${raport(wynik)}\n`);
    return 0;
}

if (require.main === module) {
    try {
        process.exitCode = glowna(process.argv.slice(2));
    } catch (blad) {
        process.stderr.write(`BŁĄD: ${blad.message}\n`);
        process.exitCode = 1;
    }
}

module.exports = {
    odczytajNastawy, katalogiDanych, sprawdzAvatarId, zbierzWersjeProfiluQac,
    znajdzPlikiPoTresci, niesieIdentyfikator, policzSladyWProfiluPs,
    zbierzRaport, raport, glowna,
    WZORZEC_AVATAR_ID, ZMIENNE_SCIEZEK, ZMIENNA_KORZENIA_DANYCH,
    STAN_OBECNY, STAN_BRAK, STAN_BEZ_NASTAWY,
};
