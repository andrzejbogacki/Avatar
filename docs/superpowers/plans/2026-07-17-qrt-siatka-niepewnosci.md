# QRT — ① Siatka niepewności (C) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uczciwie przyjąć osobę bez dokładnej godziny urodzenia: zapisać osie/pars/nakszatry do profilu, oznaczyć pola niepewne z pomiaru w oknie i nie wypuścić takiego profilu poza piaskownicę bez sekcji `niepewnosc`.

**Architecture:** Nadbudowa nad silnikiem czułości ②. Nowy moduł `src/rectification/niepewnosc.js` mierzy zmienność pól czułych (ASC/MC/domy + linie Słońca/Ziemi + Księżyc) w zadeklarowanym oknie i składa sekcję `profil.niepewnosc`. `generujProfil` dołącza ją tylko gdy `czas_zrodlo != 'dokladny'`; regulator 9b (bramka zapisu) egzekwuje jej obecność. Wsteczna zgodność: bez `czas_zrodlo` wszystko działa jak dziś, plus profil zyskuje osie/pars/nakszatry.

**Tech Stack:** Node.js (CommonJS), `sweph`, wbudowany runner `node:test` + `node:assert/strict`.

## Global Constraints

- **Zakaz magic numbers poza `config/`** — liczby domenowe w `config/`.
- **Zakaz cichych wartości domyślnych** — brak danych = jawny status/wyjątek. (Wyjątek: `czas_zrodlo` domyślnie `'dokladny'` to jawny default zgodności wstecz, brany z `config.rejestr.CZAS_ZRODLO_DOMYSLNE`.)
- **Skala czasu:** osie z `jd_ut`, pozycje z `jd_et`; przesunięcia w oknie dodawane w odpowiedniej skali (`/ astronomia.SEKUND_NA_DOBE`).
- **Reguła znak+brama:** każde pole osiowe raportowane ze znakiem zodiaku.
- **Wsteczna zgodność:** profile bez `czas_zrodlo` zachowują dotychczasowe zachowanie (dokładny, bez sekcji `niepewnosc`).
- **TDD**, testy z katalogu `backend/`. Pojedynczy plik: `node --test modules/qac/test/<plik>.test.js`. Pełna suita QAC: `node --test 'modules/qac/test/*.test.js'`.
- **Git:** commit/push wyłącznie na jawne zlecenie Suwerena; kroki „Commit" wykonaj lokalnie (bez push).
- **Fixture profil brzegowy A (syntetyczny):** `czas_lokalny={rok:1941,miesiac:1,dzien:3,godzina:9,minuta:44,sekunda:59}`, `strefa='Etc/GMT'` (offset stały +00:00, niezależny od tzdata), `obserwator={dlugosc_geo:-9.1393,szerokosc_geo:38.7223,wysokosc_npm_m:2}`. Wyliczone w oknie ±120 min: ASC 16 możliwych bram (niepewne, w środku brama 19 linia 6 Wodnik), MC 12 (niepewne), Słońce 1 brama/1 linia (pewne), Ziemia 1/1 (pewne), Księżyc 1 brama/3 linie (niepewne_linia).
- **Reuse z ②:** `czuloscOsi`/`osieDlaPrzesuniecia` istnieją; `znakZodiaku` w `src/calculator/zodiak.js`; `kwantyzuj` w `src/calculator/kwantyzacja.js`; `bramki.PELNE_KOLO_DEG`; `astronomia.SEKUND_NA_DOBE`.

---

### Task 1: Konfiguracja — źródło czasu i krok skanu

**Files:**
- Modify: `backend/modules/qac/config/rejestr.js`
- Modify: `backend/modules/qac/config/rektyfikacja.js`
- Test: `backend/modules/qac/test/niepewnosc.test.js` (utwórz)

**Interfaces:**
- Produces: `config.rejestr.ZRODLA_CZASU = ['dokladny','przyblizony','rektyfikowany']`, `config.rejestr.CZAS_ZRODLO_DOMYSLNE = 'dokladny'`, `config.rektyfikacja.NIEPEWNOSC = { KROK_SKANU_S: 60 }`

- [ ] **Step 1: Write the failing test**

`backend/modules/qac/test/niepewnosc.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { rejestr, rektyfikacja } = require('../config');

test('config: źródła czasu, domyślne, krok skanu niepewności', () => {
    assert.deepEqual(rejestr.ZRODLA_CZASU, ['dokladny', 'przyblizony', 'rektyfikowany']);
    assert.equal(rejestr.CZAS_ZRODLO_DOMYSLNE, 'dokladny');
    assert.ok(rejestr.ZRODLA_CZASU.includes(rejestr.CZAS_ZRODLO_DOMYSLNE));
    assert.equal(rektyfikacja.NIEPEWNOSC.KROK_SKANU_S, 60);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (z `backend/`): `node --test modules/qac/test/niepewnosc.test.js`
Expected: FAIL — `ZRODLA_CZASU` undefined.

- [ ] **Step 3: Write minimal implementation**

W `backend/modules/qac/config/rejestr.js` dodaj dwie stałe przed `module.exports` i dołącz je do eksportowanego obiektu:
```js
// Źródło znajomości godziny urodzenia — kształtuje siatkę niepewności (①).
const ZRODLA_CZASU = Object.freeze(['dokladny', 'przyblizony', 'rektyfikowany']);
const CZAS_ZRODLO_DOMYSLNE = 'dokladny';
```
(dodaj `ZRODLA_CZASU, CZAS_ZRODLO_DOMYSLNE` do listy w `module.exports = Object.freeze({ ... })`).

W `backend/modules/qac/config/rektyfikacja.js` dodaj przed `module.exports` stałą i dołącz do eksportu:
```js
// Krok skanu okna niepewności [s] — 60 s łapie granice linii (≥ ~2.6 min odstępu).
const NIEPEWNOSC = Object.freeze({ KROK_SKANU_S: 60 });
```
(dodaj `NIEPEWNOSC` do `module.exports = Object.freeze({ ... })`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/niepewnosc.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/config/rejestr.js backend/modules/qac/config/rektyfikacja.js backend/modules/qac/test/niepewnosc.test.js
git commit -m "feat(qac): config źródła czasu + krok skanu niepewności"
```

---

### Task 2: `polaWOknie` — zmienność pól w oknie

**Files:**
- Create: `backend/modules/qac/src/rectification/niepewnosc.js`
- Test: `backend/modules/qac/test/niepewnosc.test.js` (dopisz)

**Interfaces:**
- Consumes: `lokalnyNaUtc`/`utcNaSkaleCzasowe` (`calculator/czas`), `osieKatowe` (`calculator/osie`), `pozycjeTopocentryczne` (`calculator/pozycje`), `kwantyzuj` (`calculator/kwantyzacja`), `znakZodiaku` (`calculator/zodiak`), `config.rektyfikacja.NIEPEWNOSC.KROK_SKANU_S`, `config.astronomia.SEKUND_NA_DOBE`, `config.bramki.PELNE_KOLO_DEG`
- Produces: `polaWOknie({ czas_lokalny, strefa, obserwator, polszerokosc_min }) -> { ascendent, mc, slonce, ziemia, ksiezyc }` gdzie każde pole = `{ w_srodku:{bramka,linia,znak}, mozliwych_bram:number, mozliwych_linii:number, status:'pewne'|'niepewne_linia'|'niepewne' }`

- [ ] **Step 1: Write the failing test** (dopisz do `test/niepewnosc.test.js`)

```js
const { polaWOknie } = require('../src/rectification/niepewnosc');

const PROFIL_BRZEGOWY_A = {
    czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
    strefa: 'Etc/GMT',
    obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
};

test('polaWOknie: profil brzegowy ±120 min — osie niepewne, profil (Słońce/Ziemia) pewny', () => {
    const p = polaWOknie({ ...PROFIL_BRZEGOWY_A, polszerokosc_min: 120 });
    assert.equal(p.ascendent.status, 'niepewne');
    assert.ok(p.ascendent.mozliwych_bram >= 12, `ASC bram=${p.ascendent.mozliwych_bram}`);
    assert.equal(p.ascendent.w_srodku.bramka, 19);
    assert.equal(p.ascendent.w_srodku.linia, 6);
    assert.equal(p.ascendent.w_srodku.znak, 'Wodnik');
    assert.equal(p.mc.status, 'niepewne');
    assert.equal(p.slonce.status, 'pewne');
    assert.equal(p.slonce.mozliwych_bram, 1);
    assert.equal(p.ziemia.status, 'pewne');
    assert.equal(p.ksiezyc.status, 'niepewne_linia');
    assert.equal(p.ksiezyc.mozliwych_bram, 1);
});

test('polaWOknie: polszerokosc_min musi być > 0', () => {
    assert.throws(() => polaWOknie({ ...PROFIL_BRZEGOWY_A, polszerokosc_min: 0 }), /polszerokosc/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/niepewnosc.test.js`
Expected: FAIL — `polaWOknie is not a function`.

- [ ] **Step 3: Write minimal implementation**

`backend/modules/qac/src/rectification/niepewnosc.js`:
```js
'use strict';

const { lokalnyNaUtc, utcNaSkaleCzasowe } = require('../calculator/czas');
const { osieKatowe } = require('../calculator/osie');
const { pozycjeTopocentryczne } = require('../calculator/pozycje');
const { kwantyzuj } = require('../calculator/kwantyzacja');
const { znakZodiaku } = require('../calculator/zodiak');
const { rektyfikacja, astronomia, bramki } = require('../../config');

const POLA = ['ascendent', 'mc', 'slonce', 'ziemia', 'ksiezyc'];

// Wartości długości ekliptycznej pól czułych w chwili (jd_et dla ciał, jd_ut dla osi).
function wartosciPol(jd_et, jd_ut, obserwator) {
    const osie = osieKatowe(jd_ut, obserwator);
    const poz = pozycjeTopocentryczne(jd_et, obserwator);
    const K = bramki.PELNE_KOLO_DEG;
    const slonce = poz.slonce.dlugosc_ekliptyczna_deg;
    return {
        ascendent: osie.ascendent.dlugosc_ekliptyczna_deg,
        mc: osie.mc.dlugosc_ekliptyczna_deg,
        slonce,
        ziemia: ((slonce + K / 2) % K + K) % K,
        ksiezyc: poz.ksiezyc.dlugosc_ekliptyczna_deg,
    };
}

/**
 * Zmienność pól czułych w oknie ± polszerokosc_min wokół podanej godziny.
 * Zwraca per pole liczbę możliwych bram/linii w oknie, wartość w środku i status.
 */
function polaWOknie({ czas_lokalny, strefa, obserwator, polszerokosc_min }) {
    if (!(polszerokosc_min > 0)) {
        throw new Error(`Niepewność: polszerokosc_min musi być > 0: ${polszerokosc_min}`);
    }
    const { czas_utc } = lokalnyNaUtc(czas_lokalny, strefa);
    const { jd_et, jd_ut } = utcNaSkaleCzasowe(czas_utc);
    const doba = astronomia.SEKUND_NA_DOBE;
    const krok = rektyfikacja.NIEPEWNOSC.KROK_SKANU_S;
    const zasieg = polszerokosc_min * 60;

    const bramySet = {}, linieSet = {};
    for (const p of POLA) { bramySet[p] = new Set(); linieSet[p] = new Set(); }

    for (let s = -zasieg; s <= zasieg; s += krok) {
        const w = wartosciPol(jd_et + s / doba, jd_ut + s / doba, obserwator);
        for (const p of POLA) {
            const q = kwantyzuj(w[p]);
            bramySet[p].add(q.bramka);
            linieSet[p].add(`${q.bramka}.${q.linia}`);
        }
    }

    const srodek = wartosciPol(jd_et, jd_ut, obserwator);
    const wynik = {};
    for (const p of POLA) {
        const q = kwantyzuj(srodek[p]);
        const nb = bramySet[p].size, nl = linieSet[p].size;
        wynik[p] = {
            w_srodku: { bramka: q.bramka, linia: q.linia, znak: znakZodiaku(srodek[p]).nazwa },
            mozliwych_bram: nb,
            mozliwych_linii: nl,
            status: nb > 1 ? 'niepewne' : (nl > 1 ? 'niepewne_linia' : 'pewne'),
        };
    }
    return wynik;
}

module.exports = { polaWOknie };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/niepewnosc.test.js`
Expected: PASS (real ephemeris; ok jeśli wolniejsze).

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/src/rectification/niepewnosc.js backend/modules/qac/test/niepewnosc.test.js
git commit -m "feat(qac): polaWOknie — zmienność pól czułych w oknie niepewności"
```

---

### Task 3: `sekcjaNiepewnosci` — sekcja profilu + warstwy + re-eksport

**Files:**
- Modify: `backend/modules/qac/src/rectification/niepewnosc.js`
- Modify: `backend/modules/qac/src/rectification/index.js`
- Test: `backend/modules/qac/test/niepewnosc.test.js` (dopisz)

**Interfaces:**
- Consumes: `polaWOknie`
- Produces: `sekcjaNiepewnosci({ czas_zrodlo, czas_lokalny, strefa, obserwator, polszerokosc_min }) -> { czas_zrodlo, okno:{srodek,polszerokosc_min}, piaskownica:true, pola, warstwy_zdegradowane:[{warstwa,stan}] }`
- Re-eksport z `src/rectification/index.js`: `polaWOknie`, `sekcjaNiepewnosci`

- [ ] **Step 1: Write the failing test** (dopisz)

```js
const { sekcjaNiepewnosci } = require('../src/rectification/niepewnosc');
const qrt = require('../src/rectification');

test('sekcjaNiepewnosci: profil brzegowy przybliżony — piaskownica, warstwy zdegradowane', () => {
    const s = sekcjaNiepewnosci({ czas_zrodlo: 'przyblizony', ...PROFIL_BRZEGOWY_A, polszerokosc_min: 120 });
    assert.equal(s.czas_zrodlo, 'przyblizony');
    assert.equal(s.piaskownica, true);
    assert.equal(s.okno.srodek, '09:44');
    assert.equal(s.okno.polszerokosc_min, 120);
    assert.equal(s.pola.ascendent.status, 'niepewne');
    const stan = (nazwaFragment) => s.warstwy_zdegradowane.find((w) => w.warstwa.includes(nazwaFragment)).stan;
    assert.equal(stan('Human Design'), 'czynna');
    assert.equal(stan('astrologia domowa'), 'nieczynna');
    assert.equal(stan('nakszatra'), 'czesciowa');
});

test('re-eksport: qrt.polaWOknie i qrt.sekcjaNiepewnosci dostępne', () => {
    assert.equal(typeof qrt.polaWOknie, 'function');
    assert.equal(typeof qrt.sekcjaNiepewnosci, 'function');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/niepewnosc.test.js`
Expected: FAIL — `sekcjaNiepewnosci is not a function`.

- [ ] **Step 3: Write minimal implementation**

W `niepewnosc.js` dodaj funkcję i rozszerz eksport:
```js
function sekcjaNiepewnosci({ czas_zrodlo, czas_lokalny, strefa, obserwator, polszerokosc_min }) {
    const pola = polaWOknie({ czas_lokalny, strefa, obserwator, polszerokosc_min });
    const osieNiepewne = pola.ascendent.status !== 'pewne' || pola.mc.status !== 'pewne';
    const profilPewny = pola.slonce.status === 'pewne' && pola.ziemia.status === 'pewne';
    const ksiezycStan = pola.ksiezyc.status === 'pewne'
        ? 'czynna'
        : (pola.ksiezyc.status === 'niepewne_linia' ? 'czesciowa' : 'nieczynna');

    const dwa = (n) => String(n).padStart(2, '0');
    return {
        czas_zrodlo,
        okno: {
            srodek: `${dwa(czas_lokalny.godzina)}:${dwa(czas_lokalny.minuta)}`,
            polszerokosc_min,
        },
        piaskownica: true,
        pola,
        warstwy_zdegradowane: [
            { warstwa: 'profil Human Design (linie Słońca/Ziemi)', stan: profilPewny ? 'czynna' : 'nieczynna' },
            { warstwa: 'nakszatra Księżyca', stan: ksiezycStan },
            { warstwa: 'astrologia domowa (domy, osie)', stan: osieNiepewne ? 'nieczynna' : 'czynna' },
        ],
    };
}

module.exports = { polaWOknie, sekcjaNiepewnosci };
```
W `src/rectification/index.js` dodaj import i re-eksport obok istniejących (nie usuwaj `czuloscOsi`/`alarmCzulosci` z Tasku ②):
```js
const { polaWOknie, sekcjaNiepewnosci } = require('./niepewnosc');
```
oraz dodaj `polaWOknie, sekcjaNiepewnosci` do `module.exports = { ... }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/niepewnosc.test.js`
Expected: PASS (wszystkie).

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/src/rectification/niepewnosc.js backend/modules/qac/src/rectification/index.js backend/modules/qac/test/niepewnosc.test.js
git commit -m "feat(qac): sekcjaNiepewnosci — sekcja profilu + warstwy zdegradowane"
```

---

### Task 4: Walidacja wejścia — czas_zrodlo + okno

**Files:**
- Modify: `backend/modules/qac/src/regulator9/walidacja_wejscia.js`
- Test: `backend/modules/qac/test/regulator.test.js` — JEŚLI istnieje; w przeciwnym razie dopisz do `backend/modules/qac/test/profil.test.js`. (Sprawdź: `ls backend/modules/qac/test/`; testy walidacji wejścia są w `profil.test.js` wokół `walidujDaneWejsciowe`.)

**Interfaces:**
- Consumes: `config.rejestr.ZRODLA_CZASU`, `config.rejestr.CZAS_ZRODLO_DOMYSLNE`
- Produces: `walidujDaneWejsciowe` akceptuje opcjonalne `czas_zrodlo` i `okno_niepewnosci_min`; dla `czas_zrodlo != 'dokladny'` wymaga `okno_niepewnosci_min > 0`.

- [ ] **Step 1: Write the failing test** (dopisz do `test/profil.test.js`, gdzie są testy `walidujDaneWejsciowe`; użyj istniejącego helpera `wejscieMinimalne()`)

```js
test('walidacja: czas_zrodlo przybliżony wymaga okna; nieznane źródło odrzucone', () => {
    const baza = wejscieMinimalne();
    // domyślnie dokładny — przechodzi bez okna
    assert.deepEqual(qac.regulator9.walidujDaneWejsciowe(baza), { poprawne: true });
    // przybliżony bez okna — odrzucony
    assert.throws(
        () => qac.regulator9.walidujDaneWejsciowe({ ...baza, czas_zrodlo: 'przyblizony' }),
        /okno_niepewnosci_min/
    );
    // przybliżony z oknem — przechodzi
    assert.deepEqual(
        qac.regulator9.walidujDaneWejsciowe({ ...baza, czas_zrodlo: 'przyblizony', okno_niepewnosci_min: 120 }),
        { poprawne: true }
    );
    // nieznane źródło — odrzucone
    assert.throws(
        () => qac.regulator9.walidujDaneWejsciowe({ ...baza, czas_zrodlo: 'zmyslone' }),
        /czas_zrodlo/
    );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/profil.test.js`
Expected: FAIL — przybliżony bez okna nie rzuca (brak walidacji).

- [ ] **Step 3: Write minimal implementation**

W `backend/modules/qac/src/regulator9/walidacja_wejscia.js`:
- na górze rozszerz require: `const { rejestr } = require('../../config');` już jest — użyjesz `rejestr.ZRODLA_CZASU`, `rejestr.CZAS_ZRODLO_DOMYSLNE`.
- w `walidujDaneWejsciowe`, przed `if (bledy.length > 0)`, dodaj:
```js
    const czas_zrodlo = dane.czas_zrodlo ?? rejestr.CZAS_ZRODLO_DOMYSLNE;
    if (!rejestr.ZRODLA_CZASU.includes(czas_zrodlo)) {
        bledy.push(`czas_zrodlo poza dozwolonymi (${rejestr.ZRODLA_CZASU.join('/')}): ${dane.czas_zrodlo}`);
    } else if (czas_zrodlo !== 'dokladny' && !(dane.okno_niepewnosci_min > 0)) {
        bledy.push('okno_niepewnosci_min wymagane (> 0 min) dla czas_zrodlo != dokladny');
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/profil.test.js`
Expected: PASS (nowy test + istniejące).

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/src/regulator9/walidacja_wejscia.js backend/modules/qac/test/profil.test.js
git commit -m "feat(qac): walidacja czas_zrodlo + okno_niepewnosci_min"
```

---

### Task 5: Wpięcie w generujProfil — osie w profilu + sekcja niepewnosc

**Files:**
- Modify: `backend/modules/qac/index.js` (funkcja `generujProfil`, sekcje `dane_wejsciowe` i `dane_surowe.forma_swiadoma`)
- Modify: `backend/modules/qac/test/profil.test.js` (aktualizacja istniejącej asercji + nowe testy)
- Test: `backend/modules/qac/test/profil.test.js`

**Interfaces:**
- Consumes: `qrt.sekcjaNiepewnosci` (moduł `./src/rectification` już wiązany jako `qrt`), `config.rejestr.CZAS_ZRODLO_DOMYSLNE`, `daneSurowe.forma_swiadoma.{osie,pars_fortunae,nakszatry}` (już liczone przez `obliczDaneSurowe`)
- Produces: `profil.dane_wejsciowe.czas_zrodlo`; `profil.dane_surowe.forma_swiadoma.{osie,pars_fortunae,nakszatry}`; `profil.niepewnosc` (tylko gdy `czas_zrodlo != 'dokladny'`)

- [ ] **Step 1: Zaktualizuj istniejącą asercję (inaczej regresja)**

W `backend/modules/qac/test/profil.test.js` w teście „profil 1.1.0: sekcja dane_wejsciowe odwzorowuje wejście" dodaj `czas_zrodlo: 'dokladny'` do oczekiwanego obiektu (dziś kończy się na `miejsce: 'Warszawa, Polska',`):
```js
    assert.deepEqual(profil.dane_wejsciowe, {
        avatar_id: 'andrzej_bogacki',
        czas_lokalny: { rok: 1990, miesiac: 6, dzien: 15, godzina: 8, minuta: 30, sekunda: 0 },
        strefa: 'Europe/Warsaw',
        obserwator: { dlugosc_geo: 21.0122, szerokosc_geo: 52.2297, wysokosc_npm_m: 113 },
        miejsce: 'Warszawa, Polska',
        czas_zrodlo: 'dokladny',
    });
```

- [ ] **Step 2: Write the failing tests** (dopisz — używają PRAWDZIWEGO silnika, bo osie/niepewnosc wymagają efemeryd)

```js
const PROFIL_BRZEGOWY_A_WE = {
    avatar_id: 'profil_brzegowy_a',
    czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
    strefa: 'Etc/GMT',
    obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
};

test('profil: dokładny — osie w dane_surowe, brak sekcji niepewnosc', async () => {
    const katalog = fs.mkdtempSync(path.join(os.tmpdir(), 'qac-doc-'));
    const { profil } = await qac.generujProfil(PROFIL_BRZEGOWY_A_WE, { katalogProfili: katalog });
    assert.equal(typeof profil.dane_surowe.forma_swiadoma.osie.ascendent.dlugosc_ekliptyczna_deg, 'number');
    assert.ok(profil.dane_surowe.forma_swiadoma.pars_fortunae);
    assert.ok(profil.dane_surowe.forma_swiadoma.nakszatry);
    assert.equal(profil.dane_wejsciowe.czas_zrodlo, 'dokladny');
    assert.equal(profil.niepewnosc, undefined);
    fs.rmSync(katalog, { recursive: true, force: true });
});

test('profil: przybliżony — sekcja niepewnosc z piaskownicą', async () => {
    const katalog = fs.mkdtempSync(path.join(os.tmpdir(), 'qac-prz-'));
    const { profil } = await qac.generujProfil(
        { ...PROFIL_BRZEGOWY_A_WE, czas_zrodlo: 'przyblizony', okno_niepewnosci_min: 120 },
        { katalogProfili: katalog }
    );
    assert.equal(profil.dane_wejsciowe.czas_zrodlo, 'przyblizony');
    assert.equal(profil.niepewnosc.piaskownica, true);
    assert.equal(profil.niepewnosc.pola.ascendent.status, 'niepewne');
    fs.rmSync(katalog, { recursive: true, force: true });
});
```

- [ ] **Step 3: Run to verify they fail**

Run: `node --test modules/qac/test/profil.test.js`
Expected: FAIL — `osie` undefined w dane_surowe / `niepewnosc` undefined.

- [ ] **Step 4: Write minimal implementation** (w `backend/modules/qac/index.js`, funkcja `generujProfil`)

Tuż po `regulator9.walidujDaneWejsciowe(daneWejsciowe);` ustal źródło czasu:
```js
    const czas_zrodlo = daneWejsciowe.czas_zrodlo ?? konfiguracja.rejestr.CZAS_ZRODLO_DOMYSLNE;
```
W obiekcie `profil.dane_wejsciowe` dodaj pole (na końcu, po `miejsce`):
```js
            czas_zrodlo,
```
W `profil.dane_surowe.forma_swiadoma` rozszerz zapis (dziś `{ jd_et, pozycje }`) o:
```js
            forma_swiadoma: {
                jd_et: daneSurowe.forma_swiadoma.jd_et,
                pozycje: daneSurowe.forma_swiadoma.pozycje,
                osie: daneSurowe.forma_swiadoma.osie,
                pars_fortunae: daneSurowe.forma_swiadoma.pars_fortunae,
                nakszatry: daneSurowe.forma_swiadoma.nakszatry,
            },
```
Bezpośrednio przed `const sciezka = zapisz ? ...` dołącz sekcję niepewności warunkowo:
```js
    if (czas_zrodlo !== 'dokladny') {
        profil.niepewnosc = qrt.sekcjaNiepewnosci({
            czas_zrodlo,
            czas_lokalny: daneWejsciowe.czas_lokalny,
            strefa: daneWejsciowe.strefa,
            obserwator: daneWejsciowe.obserwator,
            polszerokosc_min: daneWejsciowe.okno_niepewnosci_min,
        });
    }
```

- [ ] **Step 5: Run to verify they pass**

Run: `node --test modules/qac/test/profil.test.js`
Expected: PASS (zaktualizowana asercja + dwa nowe testy + reszta).

- [ ] **Step 6: Commit**

```bash
git add backend/modules/qac/index.js backend/modules/qac/test/profil.test.js
git commit -m "feat(qac): osie/pars/nakszatry w profilu + sekcja niepewnosc dla przybliżonych"
```

---

### Task 6: Bramka 9b — piaskownica dla profili niepewnych

**Files:**
- Modify: `backend/modules/qac/src/regulator9/bramka_zapisu.js` (funkcja `walidujProfil`)
- Test: `backend/modules/qac/test/profil.test.js` (dopisz)

**Interfaces:**
- Produces: `walidujProfil` odrzuca profil, gdy `dane_wejsciowe.czas_zrodlo != 'dokladny'` i brak sekcji `niepewnosc`.

- [ ] **Step 1: Write the failing test** (dopisz)

```js
test('bramka 9b: profil przybliżony bez sekcji niepewnosc — odrzucony', () => {
    const bazowy = () => ({
        naglowek: { avatar_id: 'profil_brzegowy_a', adres_rejestru: 'x', wersja_schematu: '1', status: 's', wygenerowano: 'now' },
        dane_wejsciowe: { avatar_id: 'profil_brzegowy_a', czas_zrodlo: 'przyblizony' },
        dane_surowe: {}, aktywacje: {},
        mapa_369: { stemple_srodowiskowe: {} }, macierz_relacyjna: {},
    });
    assert.throws(() => qac.regulator9.walidujProfil(bazowy()), /niepewnosc/);
    const zOK = { ...bazowy(), niepewnosc: { piaskownica: true } };
    assert.doesNotThrow(() => qac.regulator9.walidujProfil(zOK));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/profil.test.js`
Expected: FAIL — brak walidacji, `walidujProfil` nie rzuca.

- [ ] **Step 3: Write minimal implementation**

W `backend/modules/qac/src/regulator9/bramka_zapisu.js`, w `walidujProfil`, przed `if (bledy.length > 0)` dodaj:
```js
    const zrodloCzasu = profil?.dane_wejsciowe?.czas_zrodlo ?? 'dokladny';
    if (zrodloCzasu !== 'dokladny' && !profil?.niepewnosc) {
        bledy.push('profil z czas_zrodlo != dokladny bez sekcji niepewnosc — bramka piaskownicy 9b');
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/profil.test.js`
Expected: PASS.

- [ ] **Step 5: Uruchom pełną suitę QAC (brak regresji)**

Run: `node --test 'modules/qac/test/*.test.js'`
Expected: wszystkie zielone (istniejące + nowe niepewność/profil/walidacja).

- [ ] **Step 6: Commit**

```bash
git add backend/modules/qac/src/regulator9/bramka_zapisu.js backend/modules/qac/test/profil.test.js
git commit -m "feat(qac): bramka 9b — piaskownica dla profili z niepewną godziną"
```

---

## Poza zakresem tego planu (osobne)

- **`obszar_doby`** (tryb „nieznana godzina", np. noc po północy 0–6 h) — mapowanie region → środek+połszerokość; cienka nakładka na `okno_niepewnosci_min`, dopisać później.
- **Bump `WERSJA_SCHEMATU_PROFILU`** — zmiany są addytywne/wstecznie zgodne; wersję podnieść przy szerszej rewizji schematu.
- **Efektywność `polaWOknie`** — dla profili przybliżonych skan woła pełne `pozycjeTopocentryczne` (13 ciał × sideralna) na próbkę; koszt ponoszą tylko profile != dokładny. Optymalizacja (celowany odczyt Słońca/Księżyca) — follow-up jeśli takie profile staną się częste.
- **③ metoda B, ④ rozpoznanie jakościowe** — osobne plany (④ czeka na legendę bram).

## Self-Review (wykonane)

- **Pokrycie specu §3①:** `czas_zrodlo` (Task 1,4,5), umowna godzina niecichа = jawna sekcja `niepewnosc` (Task 3,5), lista pól niepewnych z pomiaru (Task 2,3), bramka 9b piaskownicy (Task 6). OP-3 (osie/pars/nakszatry w profilu) — Task 5.
- **Placeholdery:** brak — każdy krok ma pełny kod i komendę.
- **Spójność typów:** `polaWOknie` zwraca pola `{w_srodku:{bramka,linia,znak},mozliwych_bram,mozliwych_linii,status}`; `sekcjaNiepewnosci` czyta `.status` tych pól i składa `{czas_zrodlo,okno,piaskownica,pola,warstwy_zdegradowane}`; `generujProfil` zapisuje ją jako `profil.niepewnosc`; `walidujProfil` sprawdza `profil.niepewnosc` + `profil.dane_wejsciowe.czas_zrodlo`. Nazwy zgodne między zadaniami.
- **Regresja:** jawnie zaadresowana sztywna asercja `dane_wejsciowe` (Task 5 Step 1) — dodanie `czas_zrodlo: 'dokladny'`.
