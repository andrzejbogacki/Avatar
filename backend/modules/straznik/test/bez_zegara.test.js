'use strict';

// Strażnik GPS — strażnik zakazu zegara.
//
// Do punktu 2.8 moduł nie miał czasu w ogóle i zakaz wynikał z braku kodu.
// Odkąd bezpiecznik ciszy przyjmuje chwile od węzła (ADR-012 punkt 7), zakaz
// musi mieć własny dozór: zegar urządzenia podpisującego nie ma mocy dowodowej,
// więc moduł nie wolno mu go odczytać ani teraz, ani po cichu później.
//
// Test czyta źródła modułu, nie jego zachowanie — pilnuje kształtu kodu.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const KORZEN = path.join(__dirname, '..');
const KATALOGI_MODULU = ['config', 'src'];

// Każdy sposób, którym kod może sięgnąć po bieżącą chwilę własnego urządzenia.
const ODCZYTY_ZEGARA = [
    { nazwa: 'Date.now()', wzorzec: /\bDate\s*\.\s*now\s*\(/ },
    { nazwa: 'new Date() bez argumentu', wzorzec: /\bnew\s+Date\s*\(\s*\)/ },
    { nazwa: 'Date() jako funkcja', wzorzec: /[^.\w]Date\s*\(\s*\)/ },
    { nazwa: 'performance.now()', wzorzec: /\bperformance\s*\.\s*now\s*\(/ },
    { nazwa: 'process.hrtime', wzorzec: /\bprocess\s*\.\s*hrtime\b/ },
    { nazwa: 'process.uptime', wzorzec: /\bprocess\s*\.\s*uptime\b/ },
    { nazwa: 'node:timers', wzorzec: /require\s*\(\s*['"](node:)?timers/ },
    { nazwa: 'setTimeout', wzorzec: /\bsetTimeout\s*\(/ },
    { nazwa: 'setInterval', wzorzec: /\bsetInterval\s*\(/ },
];

function zrodlaModulu() {
    const pliki = [path.join(KORZEN, 'index.js')];

    for (const katalog of KATALOGI_MODULU) {
        const wejscia = fs.readdirSync(path.join(KORZEN, katalog), {
            recursive: true, withFileTypes: true,
        });
        for (const wejscie of wejscia) {
            if (wejscie.isFile() && wejscie.name.endsWith('.js')) {
                pliki.push(path.join(wejscie.parentPath ?? wejscie.path, wejscie.name));
            }
        }
    }
    return pliki;
}

test('zrodlaModulu widzi wszystkie pliki modułu — test bez materiału nie jest testem', () => {
    const pliki = zrodlaModulu().map((p) => path.relative(KORZEN, p));

    assert.ok(pliki.includes('index.js'), `pliki: ${pliki.join(', ')}`);
    assert.ok(pliki.includes(path.join('config', 'index.js')), `pliki: ${pliki.join(', ')}`);
    assert.ok(pliki.includes(path.join('src', 'obecnosc', 'cisza.js')), `pliki: ${pliki.join(', ')}`);
    assert.ok(pliki.length >= 8, `plików: ${pliki.length}`);
});

test('moduł nie sięga po zegar urządzenia w żadnej postaci (ADR-012 punkt 7)', () => {
    const trafienia = [];

    for (const plik of zrodlaModulu()) {
        const tresc = fs.readFileSync(plik, 'utf8');
        for (const odczyt of ODCZYTY_ZEGARA) {
            if (odczyt.wzorzec.test(tresc)) {
                trafienia.push(`${path.relative(KORZEN, plik)}: ${odczyt.nazwa}`);
            }
        }
    }

    assert.deepEqual(trafienia, [], `odczyt zegara w module: ${trafienia.join(' · ')}`);
});

test('formatowanie chwili danej przez węzeł jest dozwolone — zakaz dotyczy odczytu, nie zapisu', () => {
    const cisza = fs.readFileSync(path.join(KORZEN, 'src', 'obecnosc', 'cisza.js'), 'utf8');

    assert.match(cisza, /new Date\(\s*\w/, 'moduł formatuje chwilę pochodzącą z wejścia');
});
