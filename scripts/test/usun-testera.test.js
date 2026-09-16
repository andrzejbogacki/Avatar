'use strict';

// Testy skryptu usuwania danych testera (REGULA_DANYCH_TESTEROW.md punkt 6).
// Wyłącznie profile syntetyczne w katalogu tymczasowym. Fixture'y QAC
// PROFIL_BRZEGOWY_A i profil_zimowy_A nie są tu importowane ani dotykane —
// punkt 4.1 reguły trzyma dane testerów z dala od testów kodu, a testy kodu
// z dala od danych.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const skrypt = require('../usun-testera');
const { STAN_USUNIETY, STAN_BRAK, STAN_PLANOWANY } = skrypt;

const AVATAR = 'tester_syntetyczny_a';
const INNY = 'tester_syntetyczny_b';

/** Stawia komplet syntetycznych danych: cztery katalogi + kontener + tabela. */
function zbudujStanowisko({ zProfilem = true, zKontem = true, zPs = true, zSaldem = true, wersjeKosza = 0 } = {}) {
    const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'usun-testera-'));
    const katalogi = {
        profileQac: path.join(baza, 'qac', 'profiles'),
        konta: path.join(baza, 'auth', 'accounts'),
        profilePs: path.join(baza, 'ps', 'profile'),
        salda: path.join(baza, 'wymiennik', 'salda'),
    };
    for (const katalog of Object.values(katalogi)) fs.mkdirSync(katalog, { recursive: true });

    const tresc = (co) => `${JSON.stringify({ avatar_id: AVATAR, co }, null, 2)}\n`;
    if (zProfilem) fs.writeFileSync(path.join(katalogi.profileQac, `${AVATAR}.json`), tresc('profil'));
    if (zKontem) fs.writeFileSync(path.join(katalogi.konta, `${AVATAR}.json`), tresc('konto'));
    if (zPs) fs.writeFileSync(path.join(katalogi.profilePs, `${AVATAR}.json`), tresc('ps'));
    if (zSaldem) fs.writeFileSync(path.join(katalogi.salda, `${AVATAR}.json`), tresc('saldo'));

    if (wersjeKosza > 0) {
        const kosz = path.join(katalogi.profileQac, '.kosz');
        fs.mkdirSync(kosz, { recursive: true });
        for (let i = 0; i < wersjeKosza; i += 1) {
            fs.writeFileSync(path.join(kosz, `${AVATAR}-2026091${i}-120000.json`), tresc(`wersja_${i}`));
        }
        // Profil obcego testera w koszu — nie może zniknąć przy okazji.
        fs.writeFileSync(path.join(kosz, `${INNY}-20260915-120000.json`), tresc('obcy'));
    }

    const nastawy = {
        kontener: path.join(baza, 'poza-repo', 'kontener.json'),
        tabela: path.join(baza, 'poza-repo', 'tabela.json'),
        rejestr: path.join(baza, 'poza-repo', 'rejestr-usuniec.jsonl'),
    };
    fs.mkdirSync(path.join(baza, 'poza-repo'), { recursive: true });
    fs.writeFileSync(nastawy.kontener, `${JSON.stringify({
        wersja_formatu: 1,
        rekordy: [
            { avatar_id: AVATAR, wersja: 1, czas_lokalny: '1990-01-01T10:00:00', strefa: 'Europe/Warsaw' },
            { avatar_id: AVATAR, wersja: 2, czas_lokalny: '1990-01-01T10:12:00', strefa: 'Europe/Warsaw' },
            { avatar_id: INNY, wersja: 1, czas_lokalny: '1991-02-02T11:00:00', strefa: 'Europe/Warsaw' },
        ],
    }, null, 2)}\n`);
    fs.writeFileSync(nastawy.tabela, `${JSON.stringify({
        wersja_formatu: 1,
        wpisy: [
            { avatar_id: AVATAR, imie_nazwisko: 'Imię Syntetyczne', dodano_ts: '2026-09-15T08:00:00.000Z' },
            { avatar_id: INNY, imie_nazwisko: 'Drugie Syntetyczne', dodano_ts: '2026-09-15T08:00:00.000Z' },
        ],
    }, null, 2)}\n`);

    return { baza, katalogi, nastawy };
}

function stan(plan, cel) {
    return plan.pozycje.find((p) => p.cel === cel)?.stan;
}

test('plan obejmuje wszystkie sześć celów usunięcia (punkt 6)', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);

    assert.equal(stan(plan, 'profil QAC'), STAN_PLANOWANY);
    assert.equal(stan(plan, 'konto Auth'), STAN_PLANOWANY);
    assert.equal(stan(plan, 'profil Protokołu Suwerenności'), STAN_PLANOWANY);
    assert.equal(stan(plan, 'saldo Wymiennika'), STAN_PLANOWANY);
    assert.equal(stan(plan, 'kontener wejściowy (dane urodzeniowe, wszystkie wersje)'), STAN_PLANOWANY);
    assert.equal(stan(plan, 'wpis w tabeli wiążącej'), STAN_PLANOWANY);
});

test('tryb próbny niczego nie kasuje', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);
    const tekst = skrypt.raport(plan, { suchy: true });

    assert.match(tekst, /PRÓBA \(--dry-run\)/);
    assert.ok(fs.existsSync(path.join(katalogi.konta, `${AVATAR}.json`)), 'konto ma zostać nietknięte');
    assert.ok(fs.existsSync(path.join(katalogi.salda, `${AVATAR}.json`)), 'saldo ma zostać nietknięte');
    const kontener = JSON.parse(fs.readFileSync(nastawy.kontener, 'utf8'));
    assert.equal(kontener.rekordy.length, 3, 'kontener ma zostać nietknięty');
    assert.equal(fs.existsSync(nastawy.rejestr), false, 'próba nie dopisuje do rejestru');
});

test('usunięcie kasuje wszystkie wersje profilu, w tym kopie w koszu bramki 9b', () => {
    const { nastawy, katalogi } = zbudujStanowisko({ wersjeKosza: 3 });
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);

    const wersje = plan.pozycje.filter((p) => p.cel === 'profil QAC');
    assert.equal(wersje.length, 4, 'profil aktywny + trzy kopie w koszu');

    skrypt.wykonaj(plan, nastawy);

    const kosz = path.join(katalogi.profileQac, '.kosz');
    const zostalo = fs.readdirSync(kosz);
    assert.deepEqual(zostalo, [`${INNY}-20260915-120000.json`], 'kopia obcego testera zostaje');
    assert.equal(fs.existsSync(path.join(katalogi.profileQac, `${AVATAR}.json`)), false);
});

test('usunięcie czyści wszystkie wersje rekordu w kontenerze, cudze zostawia', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    skrypt.wykonaj(skrypt.zaplanuj(AVATAR, nastawy, katalogi), nastawy);

    const kontener = JSON.parse(fs.readFileSync(nastawy.kontener, 'utf8'));
    assert.deepEqual(kontener.rekordy.map((r) => r.avatar_id), [INNY]);

    const tabela = JSON.parse(fs.readFileSync(nastawy.tabela, 'utf8'));
    assert.deepEqual(tabela.wpisy.map((w) => w.avatar_id), [INNY]);
});

test('brak pliku nie jest błędem — trafia do raportu jako „nie znaleziono"', () => {
    const { nastawy, katalogi } = zbudujStanowisko({ zKontem: false, zSaldem: false });
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);

    assert.equal(stan(plan, 'konto Auth'), STAN_BRAK);
    assert.equal(stan(plan, 'saldo Wymiennika'), STAN_BRAK);

    skrypt.wykonaj(plan, nastawy);
    const wiersz = skrypt.dopiszDoRejestru(plan, nastawy.rejestr);

    assert.deepEqual(
        wiersz.nie_znaleziono.map((p) => p.cel).sort(),
        ['konto Auth', 'saldo Wymiennika']
    );
    assert.ok(wiersz.usuniete.some((p) => p.cel === 'profil QAC'));
});

test('avatar_id spoza tabeli wiążącej przerywa usunięcie', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    assert.throws(
        () => skrypt.zaplanuj('tester_nieznany_c', nastawy, katalogi),
        /nie figuruje w tabeli wiążącej/
    );
    assert.ok(fs.existsSync(path.join(katalogi.profileQac, `${AVATAR}.json`)), 'cudze dane nietknięte');
});

test('rejestr usunięć leży poza katalogami danych i tylko przyrasta', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);
    skrypt.wykonaj(plan, nastawy);

    skrypt.dopiszDoRejestru(plan, nastawy.rejestr, new Date('2026-09-16T10:00:00Z'));
    skrypt.dopiszDoRejestru(plan, nastawy.rejestr, new Date('2026-09-16T11:00:00Z'));

    const wiersze = fs.readFileSync(nastawy.rejestr, 'utf8').trim().split('\n');
    assert.equal(wiersze.length, 2, 'dopisanie, nigdy nadpisanie');

    const pierwszy = JSON.parse(wiersze[0]);
    assert.equal(pierwszy.avatar_id, AVATAR);
    assert.equal(pierwszy.znacznik_czasu, '2026-09-16T10:00:00.000Z');
    assert.ok(Array.isArray(pierwszy.usuniete));

    for (const katalog of Object.values(katalogi)) {
        assert.ok(
            !path.resolve(nastawy.rejestr).startsWith(path.resolve(katalog) + path.sep),
            `rejestr nie może leżeć w katalogu danych ${katalog}`
        );
    }
});

test('avatar_id z wyjściem poza katalog jest odrzucany przed dotknięciem dysku', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    for (const zly of ['../../etc/passwd', 'tester/../../x', '.kosz', 'Tester_A', 'ab']) {
        assert.throws(() => skrypt.zaplanuj(zly, nastawy, katalogi), /Nieprawidłowy avatar_id/);
    }
});

test('brak nastaw organizatora zatrzymuje skrypt z nazwami zmiennych', () => {
    assert.throws(() => skrypt.odczytajNastawy({}), /AVATAR_KONTENER_WEJSCIOWY/);
    assert.throws(
        () => skrypt.odczytajNastawy({ AVATAR_KONTENER_WEJSCIOWY: '/x', AVATAR_TABELA_WIAZACA: '/y' }),
        /AVATAR_REJESTR_USUNIEC/
    );
    const nastawy = skrypt.odczytajNastawy({
        AVATAR_KONTENER_WEJSCIOWY: '/a/kontener.json',
        AVATAR_TABELA_WIAZACA: '/a/tabela.json',
        AVATAR_REJESTR_USUNIEC: '/a/rejestr.jsonl',
    });
    assert.equal(nastawy.tabela, '/a/tabela.json');
});

test('brak pliku tabeli wiążącej zatrzymuje skrypt', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    fs.unlinkSync(nastawy.tabela);
    assert.throws(() => skrypt.zaplanuj(AVATAR, nastawy, katalogi), /Brak pliku: tabela wiążąca/);
});

test('nastawa korzenia danych przesuwa cztery katalogi w układzie z punktu 2', () => {
    const domyslne = skrypt.katalogiDanych({});
    assert.match(domyslne.profileQac, /qac[/\\]profiles$/);
    assert.match(domyslne.konta, /auth[/\\]accounts$/);

    const przesuniete = skrypt.katalogiDanych({ AVATAR_KORZEN_DANYCH: '/stanowisko' });
    assert.equal(przesuniete.profileQac, path.join('/stanowisko', 'qac', 'profiles'));
    assert.equal(przesuniete.konta, path.join('/stanowisko', 'auth', 'accounts'));
    assert.equal(przesuniete.profilePs, path.join('/stanowisko', 'ps', 'profile'));
    assert.equal(przesuniete.salda, path.join('/stanowisko', 'wymiennik', 'salda'));
});
