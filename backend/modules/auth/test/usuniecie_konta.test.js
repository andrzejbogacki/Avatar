'use strict';

// Sesja logowania pada wraz z kontem — REGULA_DANYCH.md punkt 6.3.
// Dane Awatara kasuje człowiek poza tym procesem, więc mapa sesji nie dostanie
// o tym sygnału; brak pliku konta jest jedynym, po którym serwer to pozna.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { MagazynKont, nowyRekordKonta } = require('../src/konta/magazyn');
const { RejestrSesji } = require('../src/sesje/rejestr');
const { UslugaLogowania } = require('../src/logowanie/usluga');

const WSPOLTWORCA = 'wspoltworca_syntetyczny_a';
const INNY = 'wspoltworca_syntetyczny_b';

function srodowisko() {
    const katalog = fs.mkdtempSync(path.join(os.tmpdir(), 'auth-usuniecie-'));
    const magazyn = new MagazynKont({ katalog });
    const sesje = new RejestrSesji();
    const usluga = new UslugaLogowania({ magazyn, sesje });
    return { katalog, magazyn, sesje, usluga };
}

async function zalozKonto(magazyn, avatar_id) {
    return magazyn.utworzKonto(nowyRekordKonta({
        avatar_id,
        zaproszenie: { zapraszajacy: INNY, uzasadnienie: 'stanowisko syntetyczne' },
        token_aktywacji: 'token-syntetyczny',
        teraz: Date.now(),
    }));
}

test('sesja istniejącego konta pozostaje aktywna', async () => {
    const { magazyn, sesje, usluga } = srodowisko();
    await zalozKonto(magazyn, WSPOLTWORCA);
    const sesja = sesje.utworzSesje(WSPOLTWORCA);

    assert.deepEqual(usluga.ktoZalogowany(sesja.id), { status: 'aktywna', avatar_id: WSPOLTWORCA });
});

test('usunięcie pliku konta unieważnia sesję natychmiast, bez restartu', async () => {
    const { katalog, magazyn, sesje, usluga } = srodowisko();
    await zalozKonto(magazyn, WSPOLTWORCA);
    const sesja = sesje.utworzSesje(WSPOLTWORCA);
    assert.equal(usluga.ktoZalogowany(sesja.id).status, 'aktywna');

    // To robi operator przy kasowaniu ręcznym — plik konta znika, proces serwera
    // nie zostaje o niczym powiadomiony.
    fs.unlinkSync(path.join(katalog, `${WSPOLTWORCA}.json`));

    assert.deepEqual(usluga.ktoZalogowany(sesja.id), { status: 'brak_konta' });
});

test('sesja zdjęta z pamięci procesu, nie tylko odrzucona', async () => {
    const { katalog, magazyn, sesje, usluga } = srodowisko();
    await zalozKonto(magazyn, WSPOLTWORCA);
    const pierwsza = sesje.utworzSesje(WSPOLTWORCA);
    const druga = sesje.utworzSesje(WSPOLTWORCA);

    fs.unlinkSync(path.join(katalog, `${WSPOLTWORCA}.json`));
    usluga.ktoZalogowany(pierwsza.id);

    assert.equal(sesje.weryfikujSesje(pierwsza.id).status, 'brak_sesji');
    assert.equal(sesje.weryfikujSesje(druga.id).status, 'brak_sesji',
        'wszystkie sesje tego Awatara, nie tylko ta sprawdzana');
});

test('sesja innego Awatara pozostaje nietknięta', async () => {
    const { katalog, magazyn, sesje, usluga } = srodowisko();
    await zalozKonto(magazyn, WSPOLTWORCA);
    await zalozKonto(magazyn, INNY);
    const sesjaWspoltworcy = sesje.utworzSesje(WSPOLTWORCA);
    const sesjaInnego = sesje.utworzSesje(INNY);

    fs.unlinkSync(path.join(katalog, `${WSPOLTWORCA}.json`));
    usluga.ktoZalogowany(sesjaWspoltworcy.id);

    assert.deepEqual(usluga.ktoZalogowany(sesjaInnego.id), { status: 'aktywna', avatar_id: INNY });
});

test('uniewaznijSesjeAwatara zwraca liczbę zdjętych sesji', () => {
    const { sesje } = srodowisko();
    sesje.utworzSesje(WSPOLTWORCA);
    sesje.utworzSesje(WSPOLTWORCA);
    sesje.utworzSesje(INNY);

    assert.equal(sesje.uniewaznijSesjeAwatara(WSPOLTWORCA), 2);
    assert.equal(sesje.uniewaznijSesjeAwatara(WSPOLTWORCA), 0, 'powtórzenie nic nie zmienia');
});

test('istniejeKontoSync odrzuca avatar_id niezgodny ze wzorcem, zamiast rzucać', () => {
    const { magazyn } = srodowisko();
    assert.equal(magazyn.istniejeKontoSync('../../etc/passwd'), false);
    assert.equal(magazyn.istniejeKontoSync(WSPOLTWORCA), false);
});
