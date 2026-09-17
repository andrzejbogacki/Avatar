#!/usr/bin/env node
'use strict';

// Skan danych osobowych przed commitem — REGULA_DANYCH.md punkt 8.
//
// Dwa kanały, bo dwa różne rodzaje śladu:
//   A — imiona i nazwiska wzięte z tabeli wiążącej (poza repozytorium).
//       Skan celowany: wiemy, czego szukamy. Trafienie blokuje commit.
//   B — wzorzec data + godzina. Skan bezcelowy z natury: nie wiemy, czyja
//       to data, więc trafienie wymaga oceny człowieka.
//
// Oba kanały idą po drzewie roboczym ORAZ po rewizjach. `git grep HEAD` nie
// widzi zmian niezacommitowanych, a zwykły grep nie czyta obiektów gita —
// są spakowane zlib. Jedno bez drugiego nie jest skanem.
//
// Wynik zerowy nie jest wynikiem negatywnym: skrypt kończy raportem, co
// faktycznie sprawdził, a czego sprawdzić nie mógł.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ZMIENNA_TABELI = 'AVATAR_TABELA_WIAZACA';
const PLIK_WYJATKOW = path.join(__dirname, '..', '.githooks', 'wyjatki-daty.txt');

// Data z godziną w jednym miejscu — z takiej pary odtwarza się moment urodzenia.
// Zapis w składni POSIX ERE — tej używa git grep. Myślnik stoi na końcu klasy
// znaków, bo odwrotny ukośnik w klasie ERE nie ucieka, tylko tworzy zakres.
const WZORZEC_DATA_GODZINA = String.raw`[0-9]{4}-[0-9]{2}-[0-9]{2}[T ][0-9]{2}:[0-9]{2}`
    + String.raw`|[0-9]{1,2}[./-][0-9]{1,2}[./-][0-9]{4}[, ]+[0-9]{1,2}:[0-9]{2}`;

function git(argumenty) {
    try {
        return execFileSync('git', argumenty, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    } catch (blad) {
        // git grep kończy kodem 1, gdy nie ma trafień — to nie jest awaria
        if (blad.status === 1) return '';
        throw blad;
    }
}

function rewizje() {
    const lista = git(['rev-list', '--all']).trim();
    return lista ? lista.split('\n') : [];
}

/** Trafienia w drzewie roboczym i w rewizjach. Zwraca wiersze git grep. */
function szukaj(wzorzec, { rewizjeDoPrzeszukania }) {
    const flagi = ['grep', '-n', '-I', '-i'];
    // --untracked: git grep domyślnie widzi wyłącznie pliki śledzone, więc nowy
    // plik z danymi przeszedłby skan niezauważony. Punkt 8 wymaga skanu drzewa
    // roboczego właśnie dlatego, że HEAD nie widzi tego, czego jeszcze nie
    // zacommitowano — a plik nieśledzony jest tego skrajnym przypadkiem.
    // Flaga musi stać przed wzorcem; po nim git czyta ją jako nazwę rewizji.
    const wDrzewie = git([...flagi, '--untracked', '-E', wzorzec, '--', '.']).trim();
    const wHistorii = rewizjeDoPrzeszukania.length > 0
        ? git([...flagi, '-E', wzorzec, ...rewizjeDoPrzeszukania, '--', '.']).trim() : '';
    return {
        drzewo: wDrzewie ? wDrzewie.split('\n') : [],
        historia: wHistorii ? zwinPowtorzenia(wHistorii.split('\n')) : [],
    };
}

function wczytajWyjatki() {
    try {
        return fs.readFileSync(PLIK_WYJATKOW, 'utf8')
            .split('\n')
            .map((w) => w.trim())
            .filter((w) => w && !w.startsWith('#'));
    } catch (blad) {
        if (blad.code === 'ENOENT') return [];
        throw blad;
    }
}

/**
 * Historia powtarza to samo trafienie w każdej rewizji, która je niosła.
 * Zwijamy do jednego wiersza na ścieżkę, numer i treść, z liczbą rewizji —
 * inaczej raport tonie w powtórzeniach i przestaje być czytany.
 */
function zwinPowtorzenia(wiersze) {
    const grupy = new Map();
    for (const wiersz of wiersze) {
        const czesci = wiersz.split(':');
        const zRewizja = /^[0-9a-f]{7,40}$/.test(czesci[0]);
        const klucz = zRewizja ? czesci.slice(1).join(':') : wiersz;
        grupy.set(klucz, (grupy.get(klucz) ?? 0) + 1);
    }
    return [...grupy].map(([tresc, ile]) => (ile > 1 ? `${tresc}   [rewizji: ${ile}]` : tresc));
}

/** Ścieżka z wiersza git grep — z przedrostkiem rewizji albo bez niego. */
function sciezkaZWiersza(wiersz) {
    const czesci = wiersz.split(':');
    // postać z rewizją: <sha>:<ścieżka>:<nr>:<treść>
    if (/^[0-9a-f]{7,40}$/.test(czesci[0])) return czesci[1] ?? '';
    return czesci[0] ?? '';
}

function objetyWyjatkiem(wiersz, wyjatki) {
    const sciezka = sciezkaZWiersza(wiersz);
    return wyjatki.some((w) => sciezka.startsWith(w));
}

/** Imiona i nazwiska z tabeli wiążącej — jedyne pewne źródło tego, kogo szukać. */
function nazwiskaZTabeli(sciezkaTabeli) {
    const dane = JSON.parse(fs.readFileSync(sciezkaTabeli, 'utf8'));
    const wpisy = Array.isArray(dane?.wpisy) ? dane.wpisy : [];
    const nazwy = new Set();
    for (const wpis of wpisy) {
        const pelna = String(wpis?.imie_nazwisko ?? '').trim();
        if (!pelna) continue;
        nazwy.add(pelna);
        for (const czlon of pelna.split(/\s+/)) {
            if (czlon.length >= 3) nazwy.add(czlon);
        }
    }
    return [...nazwy];
}

function ekranuj(tekst) {
    return tekst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function skanuj(srodowisko = process.env) {
    const rewizjeDoPrzeszukania = rewizje();
    const wyjatki = wczytajWyjatki();
    const raport = { rewizji: rewizjeDoPrzeszukania.length, kanalA: null, kanalB: null };

    const sciezkaTabeli = srodowisko[ZMIENNA_TABELI];
    if (sciezkaTabeli && fs.existsSync(sciezkaTabeli)) {
        const nazwy = nazwiskaZTabeli(sciezkaTabeli);
        raport.kanalA = { mozliwy: true, nazw: nazwy.length, drzewo: [], historia: [] };
        if (nazwy.length > 0) {
            const wzorzec = nazwy.map(ekranuj).join('|');
            const wynik = szukaj(wzorzec, { rewizjeDoPrzeszukania });
            raport.kanalA.drzewo = wynik.drzewo;
            raport.kanalA.historia = wynik.historia;
        }
    } else {
        raport.kanalA = {
            mozliwy: false,
            powod: sciezkaTabeli
                ? `tabela wiążąca nie istnieje pod ${sciezkaTabeli}`
                : `nastawa ${ZMIENNA_TABELI} niepodana`,
        };
    }

    const wynikB = szukaj(WZORZEC_DATA_GODZINA, { rewizjeDoPrzeszukania });
    raport.kanalB = {
        drzewo: wynikB.drzewo.filter((w) => !objetyWyjatkiem(w, wyjatki)),
        historia: wynikB.historia.filter((w) => !objetyWyjatkiem(w, wyjatki)),
        wyjatkow: wyjatki.length,
    };

    return raport;
}

function wypiszTrafienia(etykieta, wiersze, limit = 20) {
    if (wiersze.length === 0) return;
    process.stderr.write(`  ${etykieta}: ${wiersze.length}\n`);
    for (const wiersz of wiersze.slice(0, limit)) {
        process.stderr.write(`    ${wiersz.slice(0, 160)}\n`);
    }
    if (wiersze.length > limit) {
        process.stderr.write(`    … i ${wiersze.length - limit} dalszych\n`);
    }
}

function glowna() {
    const raport = skanuj();
    let blokada = false;

    process.stderr.write(`Skan danych osobowych (REGULA_DANYCH punkt 8). Rewizji: ${raport.rewizji}.\n`);

    if (raport.kanalA.mozliwy) {
        const trafien = raport.kanalA.drzewo.length + raport.kanalA.historia.length;
        process.stderr.write(`Kanał A — nazwiska z tabeli wiążącej (${raport.kanalA.nazw} nazw): ${trafien}\n`);
        wypiszTrafienia('drzewo robocze', raport.kanalA.drzewo);
        wypiszTrafienia('rewizje', raport.kanalA.historia);
        if (trafien > 0) blokada = true;
    } else {
        process.stderr.write(`Kanał A — NIEWYKONANY: ${raport.kanalA.powod}.\n`);
        process.stderr.write('  Cisza narzędzia nie jest wynikiem negatywnym — tego kanału nie sprawdzono.\n');
    }

    const trafienB = raport.kanalB.drzewo.length + raport.kanalB.historia.length;
    process.stderr.write(`Kanał B — data z godziną (wyjątków: ${raport.kanalB.wyjatkow}): ${trafienB}\n`);
    wypiszTrafienia('drzewo robocze', raport.kanalB.drzewo);
    wypiszTrafienia('rewizje', raport.kanalB.historia);
    if (trafienB > 0) blokada = true;

    if (blokada) {
        process.stderr.write(
            '\nCommit wstrzymany. Każde trafienie wymaga oceny człowieka:\n'
            + '  — to dana osobowa → usuń ją z treści, zanim commitujesz,\n'
            + '  — to nie dana osobowa → dopisz ścieżkę do .githooks/wyjatki-daty.txt (kanał B)\n'
            + '    albo pomiń hook świadomie: git commit --no-verify.\n'
        );
        return 1;
    }

    process.stderr.write('\nBrak trafień w wykonanych kanałach. Potwierdź drugą metodą, zanim uznasz to za wynik.\n');
    return 0;
}

if (require.main === module) {
    try {
        process.exitCode = glowna();
    } catch (blad) {
        process.stderr.write(`BŁĄD skanu: ${blad.message}\n`);
        process.stderr.write('Skan nie został wykonany — to nie jest wynik negatywny.\n');
        process.exitCode = 1;
    }
}

module.exports = {
    skanuj, nazwiskaZTabeli, sciezkaZWiersza, objetyWyjatkiem, wczytajWyjatki,
    zwinPowtorzenia,
    WZORZEC_DATA_GODZINA, ZMIENNA_TABELI, PLIK_WYJATKOW,
};
