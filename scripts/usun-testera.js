#!/usr/bin/env node
'use strict';

// Usunięcie danych testera na żądanie — REGULA_DANYCH_TESTEROW.md punkt 6.
//
// Operacja jest nieodwracalna z założenia. Pliki kasowane są trwale, nie do
// Kosza (punkt 6: „rm -rf omija Kosz"). Bramka 9b modułu QAC przenosi profil
// do profiles/.kosz/ — dla żądania testera to za mało, bo kopia w koszu wciąż
// zawiera wyniki wyliczone z daty urodzenia, a te są daną osobową na równi
// z wejściem (punkt 3). Dlatego kosz jest tu czyszczony razem z profilem.

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

// Katalogi danych bierzemy z magazynów modułów — jedno źródło prawdy.
// Przepisanie ścieżek tutaj rozjechałoby się przy pierwszej zmianie w module.
const { KATALOG_PROFILI, KATALOG_KOSZA } = require('../backend/modules/qac/src/regulator9/bramka_zapisu');
const { KATALOG_DOMYSLNY: KATALOG_KONT } = require('../backend/modules/auth/src/konta/magazyn');
const { KATALOG_DOMYSLNY: KATALOG_PROFILI_PS } = require('../backend/modules/ps/src/profil/magazyn');
const { KATALOG_DOMYSLNY: KATALOG_SALD } = require('../backend/modules/wymiennik/src/salda/magazyn_sald');

// Wzorzec bezpieczeństwa ścieżki — wspólny dla Auth, PS i Wymiennika.
// Odrzuca kropkę i ukośnik, więc avatar_id nie wyprowadzi kasowania poza
// katalog danych. Sprawdzenie idzie ZAWSZE przed złożeniem jakiejkolwiek
// ścieżki. QAC ma wzorzec węższy (wymaga podkreślenia) — nie zawężamy do
// niego, bo konto bez profilu QAC również podlega usunięciu.
const WZORZEC_AVATAR_ID = /^[a-z][a-z0-9_]{2,63}$/;

const STAN_USUNIETY = 'usunięty';
const STAN_BRAK = 'nie znaleziono';
const STAN_PLANOWANY = 'do usunięcia';

// Nastawy organizatora (KONWENCJE: parametr nie ma wartości domyślnej).
// Kontener wejściowy i tabela wiążąca leżą poza repozytorium i poza katalogiem
// profili (punkt 2) — skrypt nie zgaduje, gdzie Suweren je trzyma.
const ZMIENNE_SCIEZEK = Object.freeze({
    kontener: 'AVATAR_KONTENER_WEJSCIOWY',
    tabela: 'AVATAR_TABELA_WIAZACA',
    rejestr: 'AVATAR_REJESTR_USUNIEC',
});

// Nastawa opcjonalna: przesuwa cztery katalogi danych na inny korzeń, w układzie
// z punktu 2 reguły. Bez niej obowiązują katalogi magazynów modułów. Istnieje po
// to, by dało się wykonać wymóg punktu 6 — sprawdzenie skryptu na profilu
// syntetycznym przed wejściem pierwszego testera, bez dotykania danych realnych.
const ZMIENNA_KORZENIA_DANYCH = 'AVATAR_KORZEN_DANYCH';

function katalogiDanych(srodowisko = process.env) {
    const korzen = srodowisko[ZMIENNA_KORZENIA_DANYCH];
    if (!korzen || !String(korzen).trim()) {
        return {
            profileQac: KATALOG_PROFILI,
            konta: KATALOG_KONT,
            profilePs: KATALOG_PROFILI_PS,
            salda: KATALOG_SALD,
        };
    }
    const baza = path.resolve(String(korzen).trim());
    return {
        profileQac: path.join(baza, 'qac', 'profiles'),
        konta: path.join(baza, 'auth', 'accounts'),
        profilePs: path.join(baza, 'ps', 'profile'),
        salda: path.join(baza, 'wymiennik', 'salda'),
    };
}

function odczytajNastawy(srodowisko = process.env) {
    const brakujace = [];
    const nastawy = {};
    for (const [klucz, zmienna] of Object.entries(ZMIENNE_SCIEZEK)) {
        const wartosc = srodowisko[zmienna];
        if (!wartosc || !String(wartosc).trim()) brakujace.push(zmienna);
        else nastawy[klucz] = path.resolve(String(wartosc).trim());
    }
    if (brakujace.length > 0) {
        throw new Error(
            `Brak nastaw organizatora: ${brakujace.join(', ')}. `
            + 'Kontener wejściowy, tabela wiążąca i rejestr usunięć leżą poza '
            + 'repozytorium (punkt 2) — ścieżki podaje Suweren, skrypt ich nie zgaduje.'
        );
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

function wczytajJson(sciezka, opisByt) {
    let surowy;
    try {
        surowy = fs.readFileSync(sciezka, 'utf8');
    } catch (blad) {
        if (blad.code === 'ENOENT') throw new Error(`Brak pliku: ${opisByt} (${sciezka})`);
        throw blad;
    }
    try {
        return JSON.parse(surowy);
    } catch (blad) {
        throw new Error(`${opisByt} nie jest poprawnym JSON-em (${sciezka}): ${blad.message}`);
    }
}

// Nadpisanie przez plik tymczasowy w tym samym katalogu + rename.
// Przerwanie w połowie zapisu nie zostawia okrojonego pliku z danymi.
function zapiszJsonAtomowo(sciezka, dane) {
    const tymczasowy = `${sciezka}.tmp-${process.pid}`;
    fs.writeFileSync(tymczasowy, `${JSON.stringify(dane, null, 2)}\n`, 'utf8');
    fs.renameSync(tymczasowy, sciezka);
}

/**
 * Wszystkie wersje profilu QAC: plik aktywny oraz kopie w koszu bramki 9b,
 * nazywane <avatar_id>-RRRRMMDD-GGMMSS.json. Kopia zastąpiona przy korekcie
 * danych (punkt 5) zawiera te same wyniki co aktywna i podlega usunięciu.
 */
function zbierzWersjeProfiluQac(avatar_id, katalogProfili) {
    const pliki = [path.join(katalogProfili, `${avatar_id}.json`)];
    const kosz = path.join(katalogProfili, KATALOG_KOSZA);
    let zawartoscKosza = [];
    try {
        zawartoscKosza = fs.readdirSync(kosz);
    } catch (blad) {
        if (blad.code !== 'ENOENT') throw blad;
    }
    const przedrostek = `${avatar_id}-`;
    for (const nazwa of zawartoscKosza) {
        if (nazwa.startsWith(przedrostek) && nazwa.endsWith('.json')) {
            pliki.push(path.join(kosz, nazwa));
        }
    }
    return pliki;
}

function pozycjaPliku(cel, sciezka) {
    return {
        rodzaj: 'plik',
        cel,
        sciezka,
        stan: fs.existsSync(sciezka) ? STAN_PLANOWANY : STAN_BRAK,
    };
}

/**
 * Buduje plan usunięcia. Nie dotyka dysku poza odczytem.
 * Rzuca, gdy avatar_id nie figuruje w tabeli wiążącej — brak wpisu oznacza,
 * że nie wiadomo, czyje dane miałyby zniknąć, więc kasowanie nie rusza.
 */
function zaplanuj(avatar_id, nastawy, katalogi = {}) {
    sprawdzAvatarId(avatar_id);

    const {
        profileQac = KATALOG_PROFILI,
        konta = KATALOG_KONT,
        profilePs = KATALOG_PROFILI_PS,
        salda = KATALOG_SALD,
    } = katalogi;

    const tabela = wczytajJson(nastawy.tabela, 'tabela wiążąca');
    const wpisy = Array.isArray(tabela?.wpisy) ? tabela.wpisy : null;
    if (!wpisy) {
        throw new Error(
            `Tabela wiążąca bez tablicy „wpisy" (${nastawy.tabela}) — format niezgodny z kontraktem.`
        );
    }
    const wpisyTestera = wpisy.filter((w) => w?.avatar_id === avatar_id);
    if (wpisyTestera.length === 0) {
        throw new Error(
            `avatar_id ${avatar_id} nie figuruje w tabeli wiążącej (${nastawy.tabela}). `
            + 'Usunięcie przerwane — bez wpisu nie ma potwierdzenia, czyje dane są kasowane.'
        );
    }

    const kontener = wczytajJson(nastawy.kontener, 'kontener wejściowy');
    const rekordy = Array.isArray(kontener?.rekordy) ? kontener.rekordy : null;
    if (!rekordy) {
        throw new Error(
            `Kontener wejściowy bez tablicy „rekordy" (${nastawy.kontener}) — format niezgodny z kontraktem.`
        );
    }
    const rekordyTestera = rekordy.filter((r) => r?.avatar_id === avatar_id);

    const pozycje = [];
    for (const sciezka of zbierzWersjeProfiluQac(avatar_id, profileQac)) {
        pozycje.push(pozycjaPliku('profil QAC', sciezka));
    }
    pozycje.push(pozycjaPliku('konto Auth', path.join(konta, `${avatar_id}.json`)));
    pozycje.push(pozycjaPliku('profil Protokołu Suwerenności', path.join(profilePs, `${avatar_id}.json`)));
    pozycje.push(pozycjaPliku('saldo Wymiennika', path.join(salda, `${avatar_id}.json`)));

    pozycje.push({
        rodzaj: 'rekordy',
        cel: 'kontener wejściowy (dane urodzeniowe, wszystkie wersje)',
        sciezka: nastawy.kontener,
        liczba: rekordyTestera.length,
        wersje: rekordyTestera.map((r) => r?.wersja ?? null),
        stan: rekordyTestera.length > 0 ? STAN_PLANOWANY : STAN_BRAK,
    });
    pozycje.push({
        rodzaj: 'rekordy',
        cel: 'wpis w tabeli wiążącej',
        sciezka: nastawy.tabela,
        liczba: wpisyTestera.length,
        stan: STAN_PLANOWANY,
    });

    return { avatar_id, pozycje, kontener, tabela };
}

/** Wykonuje plan. Zwraca plan z zaktualizowanymi stanami pozycji. */
function wykonaj(plan, nastawy) {
    for (const pozycja of plan.pozycje) {
        if (pozycja.stan !== STAN_PLANOWANY) continue;

        if (pozycja.rodzaj === 'plik') {
            fs.unlinkSync(pozycja.sciezka);
            pozycja.stan = STAN_USUNIETY;
            continue;
        }

        if (pozycja.sciezka === nastawy.kontener) {
            plan.kontener.rekordy = plan.kontener.rekordy.filter((r) => r?.avatar_id !== plan.avatar_id);
            zapiszJsonAtomowo(nastawy.kontener, plan.kontener);
        } else {
            plan.tabela.wpisy = plan.tabela.wpisy.filter((w) => w?.avatar_id !== plan.avatar_id);
            zapiszJsonAtomowo(nastawy.tabela, plan.tabela);
        }
        pozycja.stan = STAN_USUNIETY;
    }
    return plan;
}

/**
 * Dopisuje wiersz do rejestru usunięć (JSON Lines — dopisanie, nigdy nadpisanie).
 * Rejestr leży poza katalogami danych, więc przeżywa usunięcie samych danych.
 */
function dopiszDoRejestru(plan, sciezkaRejestru, teraz = new Date()) {
    const usuniete = plan.pozycje.filter((p) => p.stan === STAN_USUNIETY);
    const wiersz = {
        avatar_id: plan.avatar_id,
        znacznik_czasu: teraz.toISOString(),
        usuniete: usuniete.map((p) => (p.rodzaj === 'plik'
            ? { cel: p.cel, sciezka: p.sciezka }
            : { cel: p.cel, sciezka: p.sciezka, liczba_rekordow: p.liczba })),
        nie_znaleziono: plan.pozycje
            .filter((p) => p.stan === STAN_BRAK)
            .map((p) => ({ cel: p.cel, sciezka: p.sciezka })),
    };
    fs.mkdirSync(path.dirname(sciezkaRejestru), { recursive: true });
    fs.appendFileSync(sciezkaRejestru, `${JSON.stringify(wiersz)}\n`, 'utf8');
    return wiersz;
}

function opiszPozycje(pozycja) {
    const ogon = pozycja.rodzaj === 'rekordy' ? ` [rekordów: ${pozycja.liczba}]` : '';
    return `  ${pozycja.stan.padEnd(14)} ${pozycja.cel}${ogon}\n                 ${pozycja.sciezka}`;
}

function raport(plan, { suchy }) {
    const naglowek = suchy
        ? `PRÓBA (--dry-run) — nic nie zostało skasowane. avatar_id: ${plan.avatar_id}`
        : `USUNIĘTO. avatar_id: ${plan.avatar_id}`;
    return [naglowek, ...plan.pozycje.map(opiszPozycje)].join('\n');
}

function zapytajOPotwierdzenie(avatar_id) {
    const we = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((zwroc) => {
        we.question(
            `Operacja jest nieodwracalna. Wpisz avatar_id, aby potwierdzić (${avatar_id}): `,
            (odpowiedz) => {
                we.close();
                zwroc(odpowiedz.trim() === avatar_id);
            }
        );
    });
}

async function glowna(argv) {
    const suchy = argv.includes('--dry-run');
    const pozycyjne = argv.filter((a) => !a.startsWith('--'));

    if (pozycyjne.length !== 1) {
        process.stderr.write(
            'Wywołanie: node scripts/usun-testera.js <avatar_id> [--dry-run]\n\n'
            + 'Nastawy organizatora (zmienne środowiskowe, bez wartości domyślnych):\n'
            + `  ${ZMIENNE_SCIEZEK.kontener}  — plik kontenera wejściowego\n`
            + `  ${ZMIENNE_SCIEZEK.tabela}      — plik tabeli wiążącej\n`
            + `  ${ZMIENNE_SCIEZEK.rejestr}    — plik rejestru usunięć (JSON Lines)\n\n`
            + 'Nastawa opcjonalna:\n'
            + `  ${ZMIENNA_KORZENIA_DANYCH}       — korzeń katalogów danych (sprawdzenie na stanowisku syntetycznym)\n`
        );
        return 2;
    }

    const avatar_id = pozycyjne[0];
    const nastawy = odczytajNastawy();
    const plan = zaplanuj(avatar_id, nastawy, katalogiDanych());

    if (suchy) {
        process.stdout.write(`${raport(plan, { suchy: true })}\n`);
        return 0;
    }

    if (!await zapytajOPotwierdzenie(avatar_id)) {
        process.stderr.write('Potwierdzenie niezgodne — przerwane, nic nie skasowano.\n');
        return 1;
    }

    wykonaj(plan, nastawy);
    const wiersz = dopiszDoRejestru(plan, nastawy.rejestr);
    process.stdout.write(`${raport(plan, { suchy: false })}\n`);
    process.stdout.write(`Rejestr usunięć: ${nastawy.rejestr} (wiersz z ${wiersz.znacznik_czasu})\n`);
    return 0;
}

if (require.main === module) {
    glowna(process.argv.slice(2))
        .then((kod) => { process.exitCode = kod; })
        .catch((blad) => {
            process.stderr.write(`BŁĄD: ${blad.message}\n`);
            process.exitCode = 1;
        });
}

module.exports = {
    odczytajNastawy,
    katalogiDanych,
    sprawdzAvatarId,
    zbierzWersjeProfiluQac,
    zaplanuj,
    wykonaj,
    dopiszDoRejestru,
    raport,
    glowna,
    WZORZEC_AVATAR_ID,
    ZMIENNE_SCIEZEK,
    ZMIENNA_KORZENIA_DANYCH,
    STAN_USUNIETY,
    STAN_BRAK,
    STAN_PLANOWANY,
};
