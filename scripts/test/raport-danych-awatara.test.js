'use strict';

// Testy raportu rozmieszczenia danych Awatara — REGULA_DANYCH.md punkt 6.
// Wyłącznie profile syntetyczne w katalogu tymczasowym (6.6). Fixture'y QAC
// PROFIL_BRZEGOWY_A i profil_zimowy_A nie są tu importowane ani dotykane.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const skrypt = require('../raport-danych-awatara');
const { STAN_OBECNY, STAN_BRAK, STAN_BEZ_NASTAWY } = skrypt;

const AWATAR = 'wspoltworca_syntetyczny_a';
const INNY = 'wspoltworca_syntetyczny_b';

function zapisz(sciezka, dane) {
    fs.mkdirSync(path.dirname(sciezka), { recursive: true });
    fs.writeFileSync(sciezka, `${JSON.stringify(dane, null, 2)}\n`, 'utf8');
}

/** Migawka wszystkich plików stanowiska: ścieżka → treść. */
function migawka(korzen) {
    const wynik = new Map();
    const obejdz = (katalog) => {
        for (const wpis of fs.readdirSync(katalog, { withFileTypes: true })) {
            const pelna = path.join(katalog, wpis.name);
            if (wpis.isDirectory()) obejdz(pelna);
            else wynik.set(pelna, fs.readFileSync(pelna, 'utf8'));
        }
    };
    obejdz(korzen);
    return wynik;
}

function zbudujStanowisko({ zSaldem = true, zNastawami = true } = {}) {
    const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'raport-awatara-'));
    const katalogi = skrypt.katalogiDanych({ AVATAR_KORZEN_DANYCH: path.join(baza, 'dane') });

    zapisz(path.join(katalogi.profileQac, `${AWATAR}.json`), { naglowek: { avatar_id: AWATAR } });
    zapisz(path.join(katalogi.profileQac, '.kosz', `${AWATAR}-20260910-120000.json`), { wersja: 1 });
    zapisz(path.join(katalogi.profileQac, '.kosz', `${INNY}-20260915-120000.json`), { obcy: true });
    zapisz(path.join(katalogi.konta, `${AWATAR}.json`), { avatar_id: AWATAR });
    zapisz(path.join(katalogi.profilePs, `${AWATAR}.json`), { avatar_id: AWATAR });
    if (zSaldem) zapisz(path.join(katalogi.salda, `${AWATAR}.json`), { avatar_id: AWATAR });

    zapisz(path.join(katalogi.tokeny, 'tok_a.json'), { klasa: 'avatar', emitent: AWATAR });
    zapisz(path.join(katalogi.tokeny, 'tok_b.json'), { klasa: 'produkt', emitent: AWATAR });
    zapisz(path.join(katalogi.zrodla, 'zr_a.json'), { wlasciciel: AWATAR });
    zapisz(path.join(katalogi.zrodla, 'zr_b.json'), { wlasciciel: INNY });
    zapisz(path.join(katalogi.zaproszenia, 'z1.json'), { zapraszajacy: AWATAR });
    zapisz(path.join(katalogi.transakcje, 't1.json'), { od: AWATAR, do: INNY });
    zapisz(path.join(katalogi.oferty, 'o1.json'), { od: INNY });

    zapisz(path.join(katalogi.profilePs, `${INNY}.json`), {
        avatar_id: INNY,
        modul_1_jakosci_kwantowe: {
            osie: { os_pierwsza: { uczen: { certyfikaty_zewnetrzne: [{ wystawca: AWATAR }] } } },
        },
        modul_4_protokol_relacji: {
            strumien_1_dostep_relacyjny: { nadpisania: [{ obserwator: AWATAR }] },
            strumien_2_dostep_do_wiedzy: { poziomy_obserwatorow: { [AWATAR]: 'uczen' } },
            rejestr_dostepu: [],
            zgody_na_kontakt: [{ od: AWATAR }],
        },
        certyfikacja_startowa: { zapraszajacy: AWATAR },
    });

    const nastawy = zNastawami ? {
        kontener: path.join(baza, 'poza-repo', 'kontener.json'),
        tabela: path.join(baza, 'poza-repo', 'tabela.json'),
    } : { kontener: null, tabela: null };

    if (zNastawami) {
        zapisz(nastawy.kontener, {
            rekordy: [{ avatar_id: AWATAR, wersja: 1 }, { avatar_id: AWATAR, wersja: 2 },
                { avatar_id: INNY, wersja: 1 }],
        });
        zapisz(nastawy.tabela, { wpisy: [{ avatar_id: AWATAR, imie_nazwisko: 'Imię Syntetyczne' }] });
    }

    return { baza, katalogi, nastawy };
}

const stanCelu = (w, cel) => w.pozycje.find((p) => p.cel === cel)?.stan;

test('raport wskazuje wszystkie miejsca z punktu 6.1', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    const w = skrypt.zbierzRaport(AWATAR, nastawy, katalogi);

    for (const cel of ['profil QAC', 'konto Auth', 'profil Protokołu Suwerenności',
        'saldo Wymiennika', 'kontener wejściowy (dane urodzeniowe, wszystkie wersje)',
        'wpis w tabeli wiążącej', 'token klasy avatar', 'źródło Rezonatora']) {
        assert.equal(stanCelu(w, cel), STAN_OBECNY, `brak celu: ${cel}`);
    }
    assert.equal(w.pozycje.filter((p) => p.cel === 'profil QAC').length, 2, 'aktywny i kopia w koszu');
    assert.equal(w.pozycje.filter((p) => p.cel === 'token klasy avatar').length, 1, 'tylko klasa avatar');
    assert.equal(w.pozycje.filter((p) => p.cel === 'źródło Rezonatora').length, 1, 'cudze źródło pominięte');
});

test('raport wskazuje ślady w cudzych plikach z punktu 6.2', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    const w = skrypt.zbierzRaport(AWATAR, nastawy, katalogi);

    const slady = w.pozycje.find((p) => p.cel === `ślady w profilu ${INNY}`);
    assert.equal(slady.stan, STAN_OBECNY);
    assert.equal(slady.liczba, 5, 'poziom, nadpisanie, zgoda, certyfikat, zapraszajacy');

    assert.equal(stanCelu(w, 'zaproszenie Auth'), STAN_OBECNY);
    assert.equal(stanCelu(w, 'transakcja Wymiennika'), STAN_OBECNY);
    assert.equal(stanCelu(w, 'oferta Wymiennika'), undefined, 'cudza oferta nie trafia do raportu');
});

test('skrypt niczego nie kasuje ani nie zmienia', () => {
    const { baza, nastawy, katalogi } = zbudujStanowisko();
    const przed = migawka(baza);

    skrypt.raport(skrypt.zbierzRaport(AWATAR, nastawy, katalogi));

    const po = migawka(baza);
    assert.equal(po.size, przed.size, 'liczba plików bez zmian');
    for (const [sciezka, tresc] of przed) {
        assert.equal(po.get(sciezka), tresc, `plik zmieniony: ${sciezka}`);
    }
});

test('brak pliku trafia do raportu jako „nie znaleziono", nie jako błąd', () => {
    const { nastawy, katalogi } = zbudujStanowisko({ zSaldem: false });
    const w = skrypt.zbierzRaport(AWATAR, nastawy, katalogi);

    assert.equal(stanCelu(w, 'saldo Wymiennika'), STAN_BRAK);
    assert.match(skrypt.raport(w), /nie znaleziono/);
});

test('brak nastawy jest nazwany wprost, nie przemilczany', () => {
    const { nastawy, katalogi } = zbudujStanowisko({ zNastawami: false });
    const w = skrypt.zbierzRaport(AWATAR, nastawy, katalogi);

    assert.equal(stanCelu(w, 'wpis w tabeli wiążącej'), STAN_BEZ_NASTAWY);
    assert.match(skrypt.raport(w), /AVATAR_TABELA_WIAZACA/);
});

test('avatar_id nieobecny wszędzie daje pusty raport, nie błąd', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    const w = skrypt.zbierzRaport('wspoltworca_nieobecny_c', nastawy, katalogi);

    assert.equal(w.obecnych, 0);
    assert.match(skrypt.raport(w), /nie znaleziono w żadnym magazynie/);
});

test('avatar_id z wyjściem poza katalog odrzucany przed dotknięciem dysku', () => {
    const { nastawy, katalogi } = zbudujStanowisko();
    for (const zly of ['../../etc/passwd', 'awatar/../../x', '.kosz', 'Awatar_A', 'ab']) {
        assert.throws(() => skrypt.zbierzRaport(zly, nastawy, katalogi), /Nieprawidłowy avatar_id/);
    }
});

test('nastawa korzenia danych przesuwa katalogi w układzie z punktu 2', () => {
    const p = skrypt.katalogiDanych({ AVATAR_KORZEN_DANYCH: '/stanowisko' });
    assert.equal(p.profileQac, path.join('/stanowisko', 'qac', 'profiles'));
    assert.equal(p.zaproszenia, path.join('/stanowisko', 'auth', 'zaproszenia'));
    assert.equal(p.zrodla, path.join('/stanowisko', 'rezonator', 'zrodla'));

    const d = skrypt.katalogiDanych({});
    assert.match(d.profileQac, /qac[/\\]profiles$/);
});
