'use strict';

// Testy skryptu usuwania danych testera — REGULA_DANYCH_TESTEROW.md punkt 6.
// Wyłącznie profile syntetyczne w katalogu tymczasowym (6.6). Fixture'y QAC
// PROFIL_BRZEGOWY_A i profil_zimowy_A nie są tu importowane ani dotykane.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const skrypt = require('../usun-testera');
const { STAN_USUNIETY, STAN_BRAK, STAN_PLANOWANY } = skrypt;

const AVATAR = 'tester_syntetyczny_a';
const INNY = 'tester_syntetyczny_b';

function zapisz(sciezka, dane) {
    fs.mkdirSync(path.dirname(sciezka), { recursive: true });
    fs.writeFileSync(sciezka, `${JSON.stringify(dane, null, 2)}\n`, 'utf8');
}

/** Profil PS Awatara INNY, niosący komplet śladów po AVATAR (6.2). */
function profilZeSladami() {
    return {
        avatar_id: INNY,
        dane_podstawowe: { imie: 'Drugi Syntetyczny', status_suwerenny: true },
        modul_1_jakosci_kwantowe: {
            osie: {
                os_pierwsza: {
                    uczen: {
                        autocertyfikat: { status: 'brak' },
                        certyfikaty_zewnetrzne: [
                            { id: 'c1', wystawca: AVATAR, os: 'os_pierwsza' },
                            { id: 'c2', wystawca: INNY, os: 'os_pierwsza' },
                        ],
                    },
                },
            },
        },
        modul_4_protokol_relacji: {
            strumien_1_dostep_relacyjny: {
                macierz_domyslna: { nietkniete: true },
                nadpisania: [
                    { obserwator: AVATAR, os: 'os_pierwsza', stan: 'otwarte' },
                    { obserwator: INNY, os: 'os_pierwsza', stan: 'otwarte' },
                ],
            },
            strumien_2_dostep_do_wiedzy: {
                poziomy_obserwatorow: { [AVATAR]: 'uczen', [INNY]: 'mistrz' },
            },
            rejestr_dostepu: [{ id_goscia: 'abc', od: AVATAR }, { id_goscia: 'def' }],
            zgody_na_kontakt: [
                { id: 'p1', od: AVATAR, status: 'oczekujaca' },
                { id: 'p2', od: INNY, status: 'oczekujaca' },
            ],
        },
        certyfikacja_startowa: { status: 'certyfikacja_oczekujaca', zapraszajacy: AVATAR },
    };
}

function zbudujStanowisko({ zSaldem = true, wersjeKosza = 0 } = {}) {
    const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'usun-testera-'));
    const katalogi = skrypt.katalogiDanych({ AVATAR_KORZEN_DANYCH: path.join(baza, 'dane') });

    zapisz(path.join(katalogi.profileQac, `${AVATAR}.json`), { naglowek: { avatar_id: AVATAR } });
    zapisz(path.join(katalogi.konta, `${AVATAR}.json`), { avatar_id: AVATAR });
    zapisz(path.join(katalogi.profilePs, `${AVATAR}.json`), { avatar_id: AVATAR });
    if (zSaldem) zapisz(path.join(katalogi.salda, `${AVATAR}.json`), { avatar_id: AVATAR, salda: {} });

    for (let i = 0; i < wersjeKosza; i += 1) {
        zapisz(path.join(katalogi.profileQac, '.kosz', `${AVATAR}-2026091${i}-120000.json`), { wersja: i });
    }
    zapisz(path.join(katalogi.profileQac, '.kosz', `${INNY}-20260915-120000.json`), { obcy: true });

    // 6.1.7 — token klasy avatar emitenta AVATAR znika; token innej klasy i cudzy zostają.
    zapisz(path.join(katalogi.tokeny, 'tok_a.json'), { token_id: 'tok_a', klasa: 'avatar', emitent: AVATAR });
    zapisz(path.join(katalogi.tokeny, 'tok_b.json'), { token_id: 'tok_b', klasa: 'produkt', emitent: AVATAR });
    zapisz(path.join(katalogi.tokeny, 'tok_c.json'), { token_id: 'tok_c', klasa: 'avatar', emitent: INNY });

    // 6.1.8 — źródło Rezonatora z właścicielem.
    zapisz(path.join(katalogi.zrodla, 'zr_a.json'), { zrodlo_id: 'zr_a', wlasciciel: AVATAR });
    zapisz(path.join(katalogi.zrodla, 'zr_b.json'), { zrodlo_id: 'zr_b', wlasciciel: INNY });

    // 6.2 — ślady w cudzych plikach.
    zapisz(path.join(katalogi.profilePs, `${INNY}.json`), profilZeSladami());
    zapisz(path.join(katalogi.zaproszenia, 'z1.json'), { id: 'z1', zapraszajacy: AVATAR, kandydat_avatar_id: INNY });
    zapisz(path.join(katalogi.zaproszenia, 'z2.json'), { id: 'z2', zapraszajacy: INNY, kandydat_avatar_id: 'ktos_inny_x' });
    zapisz(path.join(katalogi.transakcje, 't1.json'), { id: 't1', od: AVATAR, do: INNY });
    zapisz(path.join(katalogi.transakcje, 't2.json'), { id: 't2', od: INNY, do: 'ktos_inny_x' });
    zapisz(path.join(katalogi.oferty, 'o1.json'), { id: 'o1', od: AVATAR });

    const nastawy = {
        kontener: path.join(baza, 'poza-repo', 'kontener.json'),
        tabela: path.join(baza, 'poza-repo', 'tabela.json'),
        rejestr: path.join(baza, 'poza-repo', 'rejestr-usuniec.jsonl'),
        rejestrTesterow: path.join(baza, 'poza-repo', 'rejestr-testerow.json'),
    };
    zapisz(nastawy.kontener, {
        wersja_formatu: 1,
        rekordy: [
            { avatar_id: AVATAR, wersja: 1 }, { avatar_id: AVATAR, wersja: 2 },
            { avatar_id: INNY, wersja: 1 },
        ],
    });
    zapisz(nastawy.tabela, {
        wersja_formatu: 1,
        wpisy: [
            { avatar_id: AVATAR, imie_nazwisko: 'Imię Syntetyczne' },
            { avatar_id: INNY, imie_nazwisko: 'Drugie Syntetyczne' },
        ],
    });
    zapisz(nastawy.rejestrTesterow, {
        wersja_formatu: 1,
        testerzy: [
            { avatar_id: AVATAR, zakres_danych: 'A', data_zgody: '2026-09-15', data_usuniecia: null },
            { avatar_id: INNY, zakres_danych: 'A', data_zgody: '2026-09-15', data_usuniecia: null },
        ],
    });

    return { baza, katalogi, nastawy };
}

const cele = (plan) => plan.pozycje.map((p) => p.cel);
const stanCelu = (plan, cel) => plan.pozycje.find((p) => p.cel === cel)?.stan;

test('6.1 — plan obejmuje osiem rodzajów magazynów własnych', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);

    for (const cel of ['profil QAC', 'konto Auth', 'profil Protokołu Suwerenności', 'saldo Wymiennika',
        'kontener wejściowy (dane urodzeniowe, wszystkie wersje)', 'wpis w tabeli wiążącej',
        'token klasy avatar', 'źródło Rezonatora']) {
        assert.equal(stanCelu(plan, cel), STAN_PLANOWANY, `brak celu: ${cel}`);
    }
});

test('6.1.7 — znika tylko token klasy avatar usuwanego emitenta', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    skrypt.wykonaj(skrypt.zaplanuj(AVATAR, nastawy, katalogi), nastawy);

    assert.deepEqual(fs.readdirSync(katalogi.tokeny).sort(), ['tok_b.json', 'tok_c.json']);
});

test('6.1.8 — znika źródło Rezonatora usuwanego właściciela, cudze zostaje', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    skrypt.wykonaj(skrypt.zaplanuj(AVATAR, nastawy, katalogi), nastawy);

    assert.deepEqual(fs.readdirSync(katalogi.zrodla), ['zr_b.json']);
});

test('6.1.1 — kasowane są wszystkie wersje profilu, w tym kosz bramki 9b', () => {
    const { nastawy, katalogi } = zbudujStanowisko({ wersjeKosza: 3 });
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);
    assert.equal(cele(plan).filter((c) => c === 'profil QAC').length, 4);

    skrypt.wykonaj(plan, nastawy);
    assert.deepEqual(fs.readdirSync(path.join(katalogi.profileQac, '.kosz')),
        [`${INNY}-20260915-120000.json`]);
});

test('6.2 — ślady w cudzym profilu znikają, reszta profilu nietknięta', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    skrypt.wykonaj(skrypt.zaplanuj(AVATAR, nastawy, katalogi), nastawy);

    const profil = JSON.parse(fs.readFileSync(path.join(katalogi.profilePs, `${INNY}.json`), 'utf8'));
    const relacje = profil.modul_4_protokol_relacji;

    assert.deepEqual(Object.keys(relacje.strumien_2_dostep_do_wiedzy.poziomy_obserwatorow), [INNY]);
    assert.deepEqual(relacje.strumien_1_dostep_relacyjny.nadpisania.map((n) => n.obserwator), [INNY]);
    assert.deepEqual(relacje.zgody_na_kontakt.map((z) => z.od), [INNY]);
    assert.deepEqual(relacje.rejestr_dostepu.map((w) => w.id_goscia), ['def']);

    const cert = profil.modul_1_jakosci_kwantowe.osie.os_pierwsza.uczen.certyfikaty_zewnetrzne;
    assert.deepEqual(cert.map((c) => c.id), ['c2'], 'certyfikat wystawiony przez usuwanego znika');

    assert.equal(profil.certyfikacja_startowa.zapraszajacy, null);
    assert.equal(profil.certyfikacja_startowa.status, 'certyfikacja_bez_wystawcy');

    assert.equal(profil.dane_podstawowe.imie, 'Drugi Syntetyczny', 'reszta profilu nietknięta');
    assert.deepEqual(relacje.strumien_1_dostep_relacyjny.macierz_domyslna, { nietkniete: true });
});

test('6.2 — znikają zaproszenia, transakcje i oferty z tym identyfikatorem', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    skrypt.wykonaj(skrypt.zaplanuj(AVATAR, nastawy, katalogi), nastawy);

    assert.deepEqual(fs.readdirSync(katalogi.zaproszenia), ['z2.json']);
    assert.deepEqual(fs.readdirSync(katalogi.transakcje), ['t2.json']);
    assert.deepEqual(fs.readdirSync(katalogi.oferty), []);
});

test('6.1.5 i 6.1.6 — znikają wszystkie wersje rekordu i wpis, cudze zostają', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    skrypt.wykonaj(skrypt.zaplanuj(AVATAR, nastawy, katalogi), nastawy);

    const kontener = JSON.parse(fs.readFileSync(nastawy.kontener, 'utf8'));
    assert.deepEqual(kontener.rekordy.map((r) => r.avatar_id), [INNY]);
    const tabela = JSON.parse(fs.readFileSync(nastawy.tabela, 'utf8'));
    assert.deepEqual(tabela.wpisy.map((w) => w.avatar_id), [INNY]);
});

test('6.5 — rejestr testerów dostaje datę usunięcia tylko w wierszu testera', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    skrypt.wykonaj(skrypt.zaplanuj(AVATAR, nastawy, katalogi), nastawy);

    const rejestr = JSON.parse(fs.readFileSync(nastawy.rejestrTesterow, 'utf8'));
    const usuniety = rejestr.testerzy.find((t) => t.avatar_id === AVATAR);
    const pozostaly = rejestr.testerzy.find((t) => t.avatar_id === INNY);
    assert.match(usuniety.data_usuniecia, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(pozostaly.data_usuniecia, null);
});

test('6.5 — rejestr usunięć dopisuje wiersz z listą usuniętych i nieznalezionych', () => {
    const { nastawy, katalogi } = zbudujStanowisko({ zSaldem: false });
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);
    skrypt.wykonaj(plan, nastawy);

    skrypt.dopiszDoRejestru(plan, nastawy.rejestr, { teraz: new Date('2026-09-16T10:00:00Z') });
    skrypt.dopiszDoRejestru(plan, nastawy.rejestr, { teraz: new Date('2026-09-16T11:00:00Z') });

    const wiersze = fs.readFileSync(nastawy.rejestr, 'utf8').trim().split('\n');
    assert.equal(wiersze.length, 2, 'dopisanie, nigdy nadpisanie');

    const w = JSON.parse(wiersze[0]);
    assert.equal(w.avatar_id, AVATAR);
    assert.equal(w.znacznik_czasu, '2026-09-16T10:00:00.000Z');
    assert.equal(w.przerwane, false);
    assert.deepEqual(w.nie_znaleziono.map((p) => p.cel), ['saldo Wymiennika']);
    assert.ok(w.usuniete.some((p) => p.punkt === '6.1.7'), 'punkty reguły w rejestrze');

    for (const katalog of Object.values(katalogi)) {
        assert.ok(!path.resolve(nastawy.rejestr).startsWith(path.resolve(katalog) + path.sep),
            `rejestr nie może leżeć w katalogu danych ${katalog}`);
    }
});

test('6.6 — tryb próbny niczego nie kasuje', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);
    assert.match(skrypt.raport(plan, { suchy: true }), /PRÓBA \(--dry-run\)/);

    assert.ok(fs.existsSync(path.join(katalogi.konta, `${AVATAR}.json`)));
    assert.equal(fs.readdirSync(katalogi.tokeny).length, 3);
    assert.equal(JSON.parse(fs.readFileSync(nastawy.kontener, 'utf8')).rekordy.length, 3);
    assert.equal(fs.existsSync(nastawy.rejestr), false, 'próba nie dopisuje do rejestru');
});

test('6.6 — brak pliku nie jest błędem, trafia do raportu', () => {
    const { nastawy, katalogi } = zbudujStanowisko({ zSaldem: false });
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);
    assert.equal(stanCelu(plan, 'saldo Wymiennika'), STAN_BRAK);
    assert.match(skrypt.raport(plan, { suchy: true }), /nie znaleziono/);
});

test('6.6 — identyfikator spoza wszystkich magazynów przerywa usunięcie', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    assert.throws(
        () => skrypt.zaplanuj('tester_nieobecny_c', nastawy, katalogi),
        /nie występuje w żadnym magazynie/
    );
    assert.ok(fs.existsSync(path.join(katalogi.profileQac, `${AVATAR}.json`)), 'cudze dane nietknięte');
});

test('6.6 — przerwanie w połowie: rejestr zapisuje stan faktyczny', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    const plan = skrypt.zaplanuj(AVATAR, nastawy, katalogi);

    // Kasujemy plik spod pierwszej pozycji planu — unlink wywróci się na ENOENT.
    const pierwsza = plan.pozycje.find((p) => p.rodzaj === 'plik');
    fs.unlinkSync(pierwsza.sciezka);

    assert.throws(() => skrypt.wykonaj(plan, nastawy));
    const wiersz = skrypt.dopiszDoRejestru(plan, nastawy.rejestr, { przerwane: true });

    assert.equal(wiersz.przerwane, true);
    assert.ok(wiersz.niewykonane.length > 0, 'pozycje niewykonane wypisane jawnie');
    assert.ok(wiersz.niewykonane.some((p) => p.blad), 'powód przerwania zapisany');
    assert.ok(
        wiersz.usuniete.length + wiersz.nie_znaleziono.length + wiersz.niewykonane.length
        === plan.pozycje.length,
        'każda pozycja planu ma stan w rejestrze'
    );
});

test('6.6 — avatar_id z wyjściem poza katalog odrzucany przed dotknięciem dysku', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    for (const zly of ['../../etc/passwd', 'tester/../../x', '.kosz', 'Tester_A', 'ab']) {
        assert.throws(() => skrypt.zaplanuj(zly, nastawy, katalogi), /Nieprawidłowy avatar_id/);
    }
});

test('brak nastaw organizatora zatrzymuje skrypt z nazwami zmiennych', () => {
    assert.throws(() => skrypt.odczytajNastawy({}), /AVATAR_KONTENER_WEJSCIOWY/);
    assert.throws(() => skrypt.odczytajNastawy({
        AVATAR_KONTENER_WEJSCIOWY: '/x', AVATAR_TABELA_WIAZACA: '/y', AVATAR_REJESTR_USUNIEC: '/z',
    }), /AVATAR_REJESTR_TESTEROW/);
});

test('nastawa korzenia danych przesuwa katalogi w układzie z punktu 2', () => {
    const p = skrypt.katalogiDanych({ AVATAR_KORZEN_DANYCH: '/stanowisko' });
    assert.equal(p.profileQac, path.join('/stanowisko', 'qac', 'profiles'));
    assert.equal(p.zaproszenia, path.join('/stanowisko', 'auth', 'zaproszenia'));
    assert.equal(p.tokeny, path.join('/stanowisko', 'wymiennik', 'tokeny'));
    assert.equal(p.zrodla, path.join('/stanowisko', 'rezonator', 'zrodla'));

    const d = skrypt.katalogiDanych({});
    assert.match(d.profileQac, /qac[/\\]profiles$/);
    assert.match(d.zrodla, /rezonator[/\\]zrodla$/);
});
