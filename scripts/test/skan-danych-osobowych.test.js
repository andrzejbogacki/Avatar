'use strict';

// Testy skanu danych osobowych — REGULA_DANYCH.md punkt 8.
// Każdy przypadek buduje własne repozytorium w katalogu tymczasowym, żeby
// wynik nie zależał od stanu repozytorium Avatara.

const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SKANER = path.join(__dirname, '..', 'skan-danych-osobowych.js');
const skrypt = require('../skan-danych-osobowych');

function git(katalog, argumenty) {
    return execFileSync('git', argumenty, { cwd: katalog, encoding: 'utf8' });
}

/** Repozytorium z jednym commitem i podstawioną tabelą wiążącą. */
function zbudujRepozytorium({ tresc = 'const a = 1;\n', nazwisko = 'Kwiatkowska Zenobia' } = {}) {
    const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'skan-osobowy-'));
    git(baza, ['init', '-q']);
    git(baza, ['config', 'user.email', 'stanowisko@example.invalid']);
    git(baza, ['config', 'user.name', 'Stanowisko Syntetyczne']);
    fs.writeFileSync(path.join(baza, 'plik.js'), tresc, 'utf8');
    git(baza, ['add', '-A']);
    git(baza, ['commit', '-q', '-m', 'stan poczatkowy']);

    const tabela = path.join(baza, 'tabela.json');
    fs.writeFileSync(tabela, JSON.stringify({
        wersja_formatu: 1,
        wpisy: [{ avatar_id: 'wspoltworca_a', imie_nazwisko: nazwisko }],
    }), 'utf8');
    return { baza, tabela };
}

/**
 * Uruchamia skaner w podanym repozytorium; zwraca kod wyjścia i wypis.
 * Raport idzie na stderr także przy powodzeniu, więc zbieramy oba strumienie —
 * execFileSync oddaje samo stdout i przy kodzie 0 wypis byłby pusty.
 */
function uruchom(baza, srodowisko = {}) {
    const wynik = spawnSync('node', [SKANER], {
        cwd: baza, encoding: 'utf8', env: { ...process.env, ...srodowisko },
    });
    return { kod: wynik.status, wypis: `${wynik.stdout ?? ''}${wynik.stderr ?? ''}` };
}

test('kanał A znajduje nazwisko z tabeli wiążącej w pliku śledzonym', () => {
    const { baza, tabela } = zbudujRepozytorium();
    fs.writeFileSync(path.join(baza, 'plik.js'), '// Zenobia Kwiatkowska\n', 'utf8');
    git(baza, ['add', '-A']);
    git(baza, ['commit', '-q', '-m', 'wpis z nazwiskiem']);

    const { kod, wypis } = uruchom(baza, { AVATAR_TABELA_WIAZACA: tabela });
    assert.equal(kod, 1, 'trafienie blokuje commit');
    assert.match(wypis, /Kanał A/);
    assert.match(wypis, /Kwiatkowska/);
});

test('kanał A widzi plik nieśledzony — git grep sam z siebie go pomija', () => {
    const { baza, tabela } = zbudujRepozytorium();
    fs.writeFileSync(path.join(baza, 'nowy.js'), '// Zenobia Kwiatkowska\n', 'utf8');

    const { kod, wypis } = uruchom(baza, { AVATAR_TABELA_WIAZACA: tabela });
    assert.equal(kod, 1);
    assert.match(wypis, /nowy\.js/);
});

test('kanał A sięga do rewizji, gdy plik został już usunięty z drzewa', () => {
    const { baza, tabela } = zbudujRepozytorium({ tresc: '// Zenobia Kwiatkowska\n' });
    fs.writeFileSync(path.join(baza, 'plik.js'), 'const a = 1;\n', 'utf8');
    git(baza, ['add', '-A']);
    git(baza, ['commit', '-q', '-m', 'usuniecie nazwiska z drzewa']);

    const { kod, wypis } = uruchom(baza, { AVATAR_TABELA_WIAZACA: tabela });
    assert.equal(kod, 1, 'ślad w historii nadal blokuje');
    assert.match(wypis, /rewizje/);
});

test('brak nastawy tabeli nazywa kanał A niewykonanym, zamiast milczeć', () => {
    const { baza } = zbudujRepozytorium();
    const { kod, wypis } = uruchom(baza, { AVATAR_TABELA_WIAZACA: '' });

    assert.equal(kod, 0);
    assert.match(wypis, /Kanał A — NIEWYKONANY/);
    assert.match(wypis, /Cisza narzędzia nie jest wynikiem negatywnym/);
});

test('kanał B znajduje datę z godziną i respektuje wyjątki', () => {
    const { baza, tabela } = zbudujRepozytorium({ tresc: 'const t = "1990-06-15T08:30";\n' });
    let wynik = uruchom(baza, { AVATAR_TABELA_WIAZACA: tabela });
    assert.equal(wynik.kod, 1);
    assert.match(wynik.wypis, /Kanał B/);

    fs.mkdirSync(path.join(baza, '.githooks'), { recursive: true });
    fs.writeFileSync(path.join(baza, '.githooks', 'wyjatki-daty.txt'), 'plik.js\n', 'utf8');
    // Wyjątki czyta skaner z repozytorium Avatara, nie z badanego — sprawdzamy
    // samą funkcję dopasowania, bo to ona rozstrzyga o pominięciu wiersza.
    assert.equal(skrypt.objetyWyjatkiem('plik.js:1:const t = "1990-06-15T08:30";', ['plik.js']), true);
    assert.equal(skrypt.objetyWyjatkiem('inny.js:1:const t = "1990-06-15T08:30";', ['plik.js']), false);
});

test('ścieżka odczytana z wiersza git grep — z rewizją i bez', () => {
    assert.equal(skrypt.sciezkaZWiersza('scripts/plik.js:12:treść'), 'scripts/plik.js');
    assert.equal(
        skrypt.sciezkaZWiersza('4a783e6fa1f88d44dffa29ae2c0826993cbb5a23:scripts/plik.js:12:treść'),
        'scripts/plik.js'
    );
});

test('powtórzenia z historii zwijane do jednego wiersza z licznikiem', () => {
    const wiersze = [
        'aaaaaaa1:plik.js:1:treść',
        'bbbbbbb2:plik.js:1:treść',
        'ccccccc3:inny.js:5:inna treść',
    ];
    const zwiniete = skrypt.zwinPowtorzenia(wiersze);
    assert.equal(zwiniete.length, 2);
    assert.ok(zwiniete.some((w) => w.includes('plik.js:1:treść') && w.includes('rewizji: 2')));
    assert.ok(zwiniete.some((w) => w === 'inny.js:5:inna treść'));
});

test('nazwiska z tabeli rozbijane na człony, krótkie pomijane', () => {
    const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'skan-tabela-'));
    const tabela = path.join(baza, 'tabela.json');
    fs.writeFileSync(tabela, JSON.stringify({
        wpisy: [{ imie_nazwisko: 'Jo Kwiatkowska' }, { imie_nazwisko: '' }],
    }), 'utf8');

    const nazwy = skrypt.nazwiskaZTabeli(tabela);
    assert.ok(nazwy.includes('Jo Kwiatkowska'), 'pełna nazwa zawsze szukana');
    assert.ok(nazwy.includes('Kwiatkowska'), 'człon od trzech znaków szukany osobno');
    assert.ok(!nazwy.includes('Jo'), 'człon krótszy niż trzy znaki daje za dużo fałszywych trafień');
});
