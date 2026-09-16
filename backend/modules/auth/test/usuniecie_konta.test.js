'use strict';

// Sesja logowania pada wraz z kontem — REGULA_DANYCH_TESTEROW.md punkt 6.3.
// Skrypt usuwania danych testera działa w osobnym procesie i do mapy sesji
// nie sięga; brakiem pliku konta sygnalizuje usunięcie działającemu serwerowi.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { MagazynKont, nowyRekordKonta } = require('../src/konta/magazyn');
const { RejestrSesji } = require('../src/sesje/rejestr');
const { UslugaLogowania } = require('../src/logowanie/usluga');

const TESTER = 'tester_syntetyczny_a';
const INNY = 'tester_syntetyczny_b';

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
    await zalozKonto(magazyn, TESTER);
    const sesja = sesje.utworzSesje(TESTER);

    assert.deepEqual(usluga.ktoZalogowany(sesja.id), { status: 'aktywna', avatar_id: TESTER });
});

test('usunięcie pliku konta unieważnia sesję natychmiast, bez restartu', async () => {
    const { katalog, magazyn, sesje, usluga } = srodowisko();
    await zalozKonto(magazyn, TESTER);
    const sesja = sesje.utworzSesje(TESTER);
    assert.equal(usluga.ktoZalogowany(sesja.id).status, 'aktywna');

    // To robi skrypt usuwania — kasuje plik konta, nie dotykając procesu serwera.
    fs.unlinkSync(path.join(katalog, `${TESTER}.json`));

    assert.deepEqual(usluga.ktoZalogowany(sesja.id), { status: 'brak_konta' });
});

test('sesja zdjęta z pamięci procesu, nie tylko odrzucona', async () => {
    const { katalog, magazyn, sesje, usluga } = srodowisko();
    await zalozKonto(magazyn, TESTER);
    const pierwsza = sesje.utworzSesje(TESTER);
    const druga = sesje.utworzSesje(TESTER);

    fs.unlinkSync(path.join(katalog, `${TESTER}.json`));
    usluga.ktoZalogowany(pierwsza.id);

    assert.equal(sesje.weryfikujSesje(pierwsza.id).status, 'brak_sesji');
    assert.equal(sesje.weryfikujSesje(druga.id).status, 'brak_sesji',
        'wszystkie sesje tego Awatara, nie tylko ta sprawdzana');
});

test('sesja innego Awatara pozostaje nietknięta', async () => {
    const { katalog, magazyn, sesje, usluga } = srodowisko();
    await zalozKonto(magazyn, TESTER);
    await zalozKonto(magazyn, INNY);
    const sesjaTestera = sesje.utworzSesje(TESTER);
    const sesjaInnego = sesje.utworzSesje(INNY);

    fs.unlinkSync(path.join(katalog, `${TESTER}.json`));
    usluga.ktoZalogowany(sesjaTestera.id);

    assert.deepEqual(usluga.ktoZalogowany(sesjaInnego.id), { status: 'aktywna', avatar_id: INNY });
});

test('uniewaznijSesjeAwatara zwraca liczbę zdjętych sesji', () => {
    const { sesje } = srodowisko();
    sesje.utworzSesje(TESTER);
    sesje.utworzSesje(TESTER);
    sesje.utworzSesje(INNY);

    assert.equal(sesje.uniewaznijSesjeAwatara(TESTER), 2);
    assert.equal(sesje.uniewaznijSesjeAwatara(TESTER), 0, 'powtórzenie nic nie zmienia');
});

test('istniejeKontoSync odrzuca avatar_id niezgodny ze wzorcem, zamiast rzucać', () => {
    const { magazyn } = srodowisko();
    assert.equal(magazyn.istniejeKontoSync('../../etc/passwd'), false);
    assert.equal(magazyn.istniejeKontoSync(TESTER), false);
});
