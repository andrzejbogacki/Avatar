# QRT — Silnik czułości osi + Alarm (②) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zbudować silnik czułości Ascendentu/MC na godzinę (odległość do granicy bramy/linii w sekundach zegara, ze znakiem zodiaku) oraz alarm QAC, który proponuje QRT, gdy minuta stoi przy granicy.

**Architecture:** Nowa, czysta warstwa pomiarowa w module QAC. Bazuje na istniejących kalkulatorach (`osie.js`, `kwantyzacja.js`, `czas.js`) — nie dubluje astronomii. Pomiar przesunięcia liczony w skali `jd_ut` (dodawanie sekund do JD), bo `houses_ex2` używa `jd_ut`. Silnik jest fundamentem: konsumuje go alarm ② teraz, a lista pól niepewnych ① w kolejnym planie.

**Tech Stack:** Node.js (CommonJS), `sweph` (już wpięty), wbudowany runner `node:test` + `node:assert/strict`.

## Global Constraints

- **Zakaz magic numbers poza `config/`** (ARCHITEKTURA.md reguła 4) — wszystkie liczby domenowe w `config/`.
- **Zakaz cichych wartości domyślnych** — brak danych = jawny status/wyjątek, nigdy cichy default.
- **Skala czasu:** osie liczone z `jd_ut` (nie `jd_et`) — kategoryczny zakaz mieszania (patrz komentarz w `src/calculator/osie.js`).
- **Reguła znak+brama:** ASC/MC zawsze raportowane ze znakiem zodiaku obok bramy HD.
- **TDD:** każdy krok najpierw test, potem minimalna implementacja.
- **Testy uruchamiane z katalogu `backend/`.** Pojedynczy plik: `node --test modules/qac/test/<plik>.test.js`.
- **Git:** zgodnie z regułą projektu commit/push wyłącznie na jawne zlecenie Suwerena. Kroki „Commit" wykonaj dopiero po zbiorczym zezwoleniu (lokalnie, bez push).
- **Fixture profil brzegowy A (syntetyczny):** `czas_lokalny={rok:1941,miesiac:1,dzien:3,godzina:9,minuta:44,sekunda:59}`, `strefa='Etc/GMT'` (offset stały +00:00, niezależny od tzdata), `obserwator={dlugosc_geo:-9.1393, szerokosc_geo:38.7223, wysokosc_npm_m:2}`. Wyliczone: ASC ≈ 313.203° (Wodnik 13.20°, brama 19 linia 6), ~9 s od granicy bram 19/13.

---

### Task 1: Konfiguracja zodiaku

**Files:**
- Create: `backend/modules/qac/config/zodiak.js`
- Modify: `backend/modules/qac/config/index.js`
- Test: `backend/modules/qac/test/zodiak.test.js`

**Interfaces:**
- Produces: `config.zodiak = { LICZBA_ZNAKOW: 12, SZEROKOSC_ZNAKU_DEG: 30, NAZWY_ZNAKOW: string[12] }`

- [ ] **Step 1: Write the failing test**

`backend/modules/qac/test/zodiak.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { zodiak } = require('../config');

test('config zodiak: 12 znaków po 30°, nazwy PL', () => {
    assert.equal(zodiak.LICZBA_ZNAKOW, 12);
    assert.equal(zodiak.SZEROKOSC_ZNAKU_DEG, 30);
    assert.equal(zodiak.NAZWY_ZNAKOW.length, 12);
    assert.equal(zodiak.NAZWY_ZNAKOW[0], 'Baran');
    assert.equal(zodiak.NAZWY_ZNAKOW[9], 'Koziorożec');
    assert.equal(zodiak.NAZWY_ZNAKOW[10], 'Wodnik');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (z `backend/`): `node --test modules/qac/test/zodiak.test.js`
Expected: FAIL — `zodiak` undefined / `Cannot read properties of undefined`.

- [ ] **Step 3: Write minimal implementation**

`backend/modules/qac/config/zodiak.js`:
```js
'use strict';

// Znaki zodiaku tropikalnego: 12 równych sektorów po 30°, start 0° Barana.
// Niezależny podział koła od 64 bram HD (config/bramki.js) — reguła znak+brama.
const LICZBA_ZNAKOW = 12;
const SZEROKOSC_ZNAKU_DEG = 360 / LICZBA_ZNAKOW; // 30°

const NAZWY_ZNAKOW = Object.freeze([
    'Baran', 'Byk', 'Bliźnięta', 'Rak', 'Lew', 'Panna',
    'Waga', 'Skorpion', 'Strzelec', 'Koziorożec', 'Wodnik', 'Ryby',
]);

module.exports = Object.freeze({ LICZBA_ZNAKOW, SZEROKOSC_ZNAKU_DEG, NAZWY_ZNAKOW });
```

W `backend/modules/qac/config/index.js` dodaj do obiektu eksportu linię (zachowaj kolejność alfabetyczną istniejących kluczy):
```js
    zodiak: require('./zodiak'),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/zodiak.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/config/zodiak.js backend/modules/qac/config/index.js backend/modules/qac/test/zodiak.test.js
git commit -m "feat(qac): konfiguracja znaków zodiaku (reguła znak+brama)"
```

---

### Task 2: Funkcja znaku zodiaku

**Files:**
- Create: `backend/modules/qac/src/calculator/zodiak.js`
- Test: `backend/modules/qac/test/zodiak.test.js` (dopisz)

**Interfaces:**
- Consumes: `config.zodiak`
- Produces: `znakZodiaku(dlugoscEkliptycznaDeg) -> { indeks:0..11, nazwa:string, stopnie_w_znaku:number }`

- [ ] **Step 1: Write the failing test** (dopisz na końcu `test/zodiak.test.js`)

```js
const { znakZodiaku } = require('../src/calculator/zodiak');

test('znakZodiaku: mapuje długość na znak i stopnie w znaku', () => {
    const koz = znakZodiaku(285.5);
    assert.equal(koz.nazwa, 'Koziorożec');
    assert.equal(koz.indeks, 9);
    assert.ok(Math.abs(koz.stopnie_w_znaku - 15.5) < 0.01);

    assert.equal(znakZodiaku(0).nazwa, 'Baran');
    assert.equal(znakZodiaku(302).nazwa, 'Wodnik');       // 2° Wodnika
    assert.equal(znakZodiaku(-1).nazwa, 'Ryby');          // normalizacja ujemnych
    assert.equal(znakZodiaku(360).nazwa, 'Baran');
});

test('znakZodiaku: odrzuca wartości niefinitne', () => {
    assert.throws(() => znakZodiaku(NaN), /Nieprawid/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/zodiak.test.js`
Expected: FAIL — `znakZodiaku is not a function`.

- [ ] **Step 3: Write minimal implementation**

`backend/modules/qac/src/calculator/zodiak.js`:
```js
'use strict';

const { zodiak } = require('../../config');

/**
 * Znak zodiaku tropikalnego dla długości ekliptycznej.
 * Normalizuje do [0,360). Niezależny od kwantyzacji 64 bram (reguła znak+brama).
 */
function znakZodiaku(dlugoscEkliptycznaDeg) {
    if (!Number.isFinite(dlugoscEkliptycznaDeg)) {
        throw new Error(`Nieprawidłowa długość ekliptyczna: ${dlugoscEkliptycznaDeg}`);
    }
    const s = ((dlugoscEkliptycznaDeg % 360) + 360) % 360;
    const indeks = Math.min(Math.floor(s / zodiak.SZEROKOSC_ZNAKU_DEG), zodiak.LICZBA_ZNAKOW - 1);
    return {
        indeks,
        nazwa: zodiak.NAZWY_ZNAKOW[indeks],
        stopnie_w_znaku: s - indeks * zodiak.SZEROKOSC_ZNAKU_DEG,
    };
}

module.exports = { znakZodiaku };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/zodiak.test.js`
Expected: PASS (wszystkie).

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/src/calculator/zodiak.js backend/modules/qac/test/zodiak.test.js
git commit -m "feat(qac): znakZodiaku — długość ekliptyczna → znak + stopnie"
```

---

### Task 3: Konfiguracja progu alarmu czułości

**Files:**
- Modify: `backend/modules/qac/config/rektyfikacja.js`
- Test: `backend/modules/qac/test/czulosc.test.js` (utwórz z tym testem)

**Interfaces:**
- Produces: `config.rektyfikacja.CZULOSC = { PROG_ALARMU_S: 60, HORYZONT_POMIARU_S: 600 }`

- [ ] **Step 1: Write the failing test**

`backend/modules/qac/test/czulosc.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { rektyfikacja } = require('../config');

test('config: próg alarmu czułości i horyzont pomiaru', () => {
    assert.equal(rektyfikacja.CZULOSC.PROG_ALARMU_S, 60);
    assert.equal(rektyfikacja.CZULOSC.HORYZONT_POMIARU_S, 600);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/czulosc.test.js`
Expected: FAIL — `Cannot read properties of undefined (reading 'PROG_ALARMU_S')`.

- [ ] **Step 3: Write minimal implementation**

W `backend/modules/qac/config/rektyfikacja.js` dodaj przed `module.exports` stałą:
```js
// Alarm czułości osi: jeśli ASC/MC bliżej granicy bramy/linii niż PROG_ALARMU_S
// sekund zegara, proponujemy QRT. HORYZONT_POMIARU_S ogranicza koszt skanu.
const CZULOSC = Object.freeze({
    PROG_ALARMU_S: 60,
    HORYZONT_POMIARU_S: 600,
});
```
i dodaj `CZULOSC` do obiektu w `module.exports = Object.freeze({ ... })`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/czulosc.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/config/rektyfikacja.js backend/modules/qac/test/czulosc.test.js
git commit -m "feat(qac): konfiguracja progu alarmu czułości osi"
```

---

### Task 4: Osie dla przesunięcia czasu

**Files:**
- Create: `backend/modules/qac/src/rectification/czulosc.js`
- Test: `backend/modules/qac/test/czulosc.test.js` (dopisz)

**Interfaces:**
- Consumes: `lokalnyNaUtc`, `utcNaSkaleCzasowe` (`src/calculator/czas.js`), `osieKatowe` (`src/calculator/osie.js`)
- Produces: `osieDlaPrzesuniecia({ czas_lokalny, strefa, obserwator }) -> (przesuniecie_s:number) => { asc_deg, mc_deg }` (funkcja zwracająca funkcję — bazowy `jd_ut` liczony raz)

- [ ] **Step 1: Write the failing test** (dopisz do `test/czulosc.test.js`)

```js
const { osieDlaPrzesuniecia } = require('../src/rectification/czulosc');

const PROFIL_BRZEGOWY_A = {
    czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
    strefa: 'Etc/GMT',
    obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
};

test('osieDlaPrzesuniecia: ASC profilu brzegowego ≈ 313.20° na granicy bramy, rośnie z czasem', () => {
    const os = osieDlaPrzesuniecia(PROFIL_BRZEGOWY_A);
    const teraz = os(0);
    assert.ok(Math.abs(teraz.asc_deg - 313.203) < 0.05, `asc=${teraz.asc_deg}`);
    const zaMinute = os(60);
    // ASC ~0.34°/min — rośnie
    assert.ok(zaMinute.asc_deg > teraz.asc_deg, 'ASC rośnie z czasem');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/czulosc.test.js`
Expected: FAIL — `osieDlaPrzesuniecia is not a function`.

- [ ] **Step 3: Write minimal implementation**

`backend/modules/qac/src/rectification/czulosc.js`:
```js
'use strict';

const { lokalnyNaUtc, utcNaSkaleCzasowe } = require('../calculator/czas');
const { osieKatowe } = require('../calculator/osie');

const SEK_NA_DOBE = 86400;

/**
 * Zwraca funkcję os(przesuniecie_s) -> {asc_deg, mc_deg}.
 * Bazowy jd_ut liczony raz z czasu lokalnego; przesunięcie dodawane w skali
 * jd_ut (houses_ex2 wymaga jd_ut). Dodatnie = później, ujemne = wcześniej.
 */
function osieDlaPrzesuniecia({ czas_lokalny, strefa, obserwator }) {
    const { czas_utc } = lokalnyNaUtc(czas_lokalny, strefa);
    const { jd_ut } = utcNaSkaleCzasowe(czas_utc);
    return function os(przesuniecie_s) {
        const osie = osieKatowe(jd_ut + przesuniecie_s / SEK_NA_DOBE, obserwator);
        return {
            asc_deg: osie.ascendent.dlugosc_ekliptyczna_deg,
            mc_deg: osie.mc.dlugosc_ekliptyczna_deg,
        };
    };
}

module.exports = { osieDlaPrzesuniecia };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/czulosc.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/src/rectification/czulosc.js backend/modules/qac/test/czulosc.test.js
git commit -m "feat(qac): osieDlaPrzesuniecia — ASC/MC dla przesunięcia w jd_ut"
```

---

### Task 5: Czułość osi — odległość do granic w sekundach + znak

**Files:**
- Modify: `backend/modules/qac/src/rectification/czulosc.js`
- Test: `backend/modules/qac/test/czulosc.test.js` (dopisz)

**Interfaces:**
- Consumes: `osieDlaPrzesuniecia`, `kwantyzuj` (`src/calculator/kwantyzacja.js`), `znakZodiaku` (`src/calculator/zodiak.js`), `config.rektyfikacja.CZULOSC.HORYZONT_POMIARU_S`
- Produces: `czuloscOsi({ czas_lokalny, strefa, obserwator }) -> { ASC: OsCzulosc, MC: OsCzulosc }` gdzie
  `OsCzulosc = { bramka:number, linia:number, znak:{indeks,nazwa,stopnie_w_znaku}, sek_do_bramki:number|null, sek_do_linii:number|null }` (null = dalej niż horyzont)

- [ ] **Step 1: Write the failing test** (dopisz)

```js
const { czuloscOsi } = require('../src/rectification/czulosc');

test('czuloscOsi: ASC profilu brzegowego na ostrzu noża — ~9 s do granicy bramy', () => {
    const c = czuloscOsi(PROFIL_BRZEGOWY_A);
    assert.equal(c.ASC.bramka, 19);
    assert.equal(c.ASC.linia, 6);
    assert.equal(c.ASC.znak.nazwa, 'Wodnik');
    assert.ok(c.ASC.sek_do_bramki !== null && c.ASC.sek_do_bramki >= 6 && c.ASC.sek_do_bramki <= 12,
        `sek_do_bramki=${c.ASC.sek_do_bramki}`);
    // MC profilu brzegowego: znak Strzelec; granica bramy ~427 s (w horyzoncie 600 s), daleko od progu alarmu 60 s
    assert.equal(c.MC.znak.nazwa, 'Strzelec');
    assert.ok(c.MC.sek_do_bramki === null || c.MC.sek_do_bramki > 300,
        `MC daleko od granicy bramy, sek_do_bramki=${c.MC.sek_do_bramki}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/czulosc.test.js`
Expected: FAIL — `czuloscOsi is not a function`.

- [ ] **Step 3: Write minimal implementation** (dopisz do `czulosc.js`; zaktualizuj `require` i `module.exports`)

Na górze pliku dodaj:
```js
const { kwantyzuj } = require('../calculator/kwantyzacja');
const { znakZodiaku } = require('../calculator/zodiak');
const { rektyfikacja } = require('../../config');
```
Dodaj funkcje:
```js
// Najmniejsze |przesunięcie| [s], przy którym klucz klasyfikacji się zmienia.
// Skan sekunda po sekundzie w obie strony do horyzontu; null = brak zmiany w horyzoncie.
function odlegloscDoZmiany(os, wybierzDeg, klasyfikuj, horyzont_s) {
    const klucz0 = klasyfikuj(wybierzDeg(os(0)));
    for (let s = 1; s <= horyzont_s; s++) {
        if (klasyfikuj(wybierzDeg(os(s))) !== klucz0) return s;
        if (klasyfikuj(wybierzDeg(os(-s))) !== klucz0) return s;
    }
    return null;
}

function osCzulosc(os, wybierzDeg, horyzont_s) {
    const deg0 = wybierzDeg(os(0));
    const q = kwantyzuj(deg0);
    return {
        bramka: q.bramka,
        linia: q.linia,
        znak: znakZodiaku(deg0),
        sek_do_bramki: odlegloscDoZmiany(os, wybierzDeg, (d) => kwantyzuj(d).bramka, horyzont_s),
        sek_do_linii: odlegloscDoZmiany(os, wybierzDeg, (d) => `${kwantyzuj(d).bramka}.${kwantyzuj(d).linia}`, horyzont_s),
    };
}

function czuloscOsi(wejscie) {
    const os = osieDlaPrzesuniecia(wejscie);
    const H = rektyfikacja.CZULOSC.HORYZONT_POMIARU_S;
    return {
        ASC: osCzulosc(os, (o) => o.asc_deg, H),
        MC: osCzulosc(os, (o) => o.mc_deg, H),
    };
}
```
Rozszerz eksport:
```js
module.exports = { osieDlaPrzesuniecia, czuloscOsi };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/czulosc.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/src/rectification/czulosc.js backend/modules/qac/test/czulosc.test.js
git commit -m "feat(qac): czuloscOsi — odległość ASC/MC do granicy [s] + znak"
```

---

### Task 6: Alarm czułości i eksport modułu

**Files:**
- Modify: `backend/modules/qac/src/rectification/czulosc.js`
- Modify: `backend/modules/qac/src/rectification/index.js`
- Test: `backend/modules/qac/test/czulosc.test.js` (dopisz)

**Interfaces:**
- Consumes: `czuloscOsi`, `config.rektyfikacja.CZULOSC.PROG_ALARMU_S`
- Produces: `alarmCzulosci(wejscie, prog_s?) -> { alarm:boolean, prog_s:number, powody: Array<{os:'ASC'|'MC', rodzaj:'bramka'|'linia', sekundy:number}> }`
- Re-eksport z `src/rectification/index.js`: `czuloscOsi`, `alarmCzulosci`

- [ ] **Step 1: Write the failing test** (dopisz)

```js
const { alarmCzulosci } = require('../src/rectification/czulosc');
const qrt = require('../src/rectification');

test('alarmCzulosci: profil brzegowy (~9 s) wywołuje alarm z powodem ASC/bramka', () => {
    const a = alarmCzulosci(PROFIL_BRZEGOWY_A);
    assert.equal(a.alarm, true);
    assert.equal(a.prog_s, 60);
    assert.ok(a.powody.some((p) => p.os === 'ASC' && p.rodzaj === 'bramka' && p.sekundy <= 60));
});

test('alarmCzulosci: brak alarmu, gdy próg bardzo mały', () => {
    const a = alarmCzulosci(PROFIL_BRZEGOWY_A, 1);
    assert.equal(a.alarm, false);
    assert.deepEqual(a.powody, []);
});

test('re-eksport: qrt.czuloscOsi i qrt.alarmCzulosci dostępne', () => {
    assert.equal(typeof qrt.czuloscOsi, 'function');
    assert.equal(typeof qrt.alarmCzulosci, 'function');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/czulosc.test.js`
Expected: FAIL — `alarmCzulosci is not a function`.

- [ ] **Step 3: Write minimal implementation**

W `czulosc.js` dodaj funkcję i rozszerz eksport:
```js
function alarmCzulosci(wejscie, prog_s = rektyfikacja.CZULOSC.PROG_ALARMU_S) {
    const c = czuloscOsi(wejscie);
    const powody = [];
    for (const os of ['ASC', 'MC']) {
        const o = c[os];
        if (o.sek_do_bramki !== null && o.sek_do_bramki <= prog_s) {
            powody.push({ os, rodzaj: 'bramka', sekundy: o.sek_do_bramki });
        }
        if (o.sek_do_linii !== null && o.sek_do_linii <= prog_s) {
            powody.push({ os, rodzaj: 'linia', sekundy: o.sek_do_linii });
        }
    }
    return { alarm: powody.length > 0, prog_s, powody };
}

module.exports = { osieDlaPrzesuniecia, czuloscOsi, alarmCzulosci };
```
W `src/rectification/index.js` dodaj import i re-eksport (obok istniejących):
```js
const { czuloscOsi, alarmCzulosci } = require('./czulosc');
```
oraz dodaj `czuloscOsi, alarmCzulosci` do `module.exports = { ... }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/czulosc.test.js`
Expected: PASS (wszystkie).

- [ ] **Step 5: Uruchom pełną suitę QAC (brak regresji)**

Run (z `backend/`): `node --test 'modules/qac/test/*.test.js'`
Expected: wszystkie zielone (istniejące + nowe zodiak/czulosc).

- [ ] **Step 6: Commit**

```bash
git add backend/modules/qac/src/rectification/czulosc.js backend/modules/qac/src/rectification/index.js backend/modules/qac/test/czulosc.test.js
git commit -m "feat(qac): alarmCzulosci — propozycja QRT przy granicy; re-eksport"
```

---

## Poza zakresem tego planu (osobne plany)

- **① Siatka niepewności (C):** `czas_zrodlo`, lista pól niepewnych z pomiaru (konsumuje `czuloscOsi`/rozszerzenie na Słońce/Księżyc), bramka regulatora 9b, niecichе 12:00. Zależność OP-3 (czy osie wchodzą do profilu).
- **② Wpięcie alarmu w przepływ QAC/dev_server** (komunikat „podaj dokładną godzinę → QRT") + polityka precyzji adresu (OP-1).
- **③ Naprawa metody geometrycznej B:** osie w dopasowaniu, aspekty osi, przeskalowanie `pewnosc`, test-strażnik „losowy czas = niska pewność".
- **④ Rozpoznanie jakościowe:** wymaga danych legendy bram (OP-2, scaffold I Ching Legge).

## Self-Review (wykonane)

- **Pokrycie specu §3②:** silnik czułości + alarm (sekundy zegara, próg konfigurowalny) — Tasks 3–6. §2 reguła znak+brama — Tasks 1,2,5 (każda `OsCzulosc` niesie `znak`). Pomiar dla listy pól niepewnych ① — `czuloscOsi` gotowe do konsumpcji.
- **Placeholdery:** brak — każdy krok ma pełny kod i komendę.
- **Spójność typów:** `czuloscOsi` zwraca `{ASC,MC}` z polami `bramka,linia,znak,sek_do_bramki,sek_do_linii`; `alarmCzulosci` czyta dokładnie te pola; `osieDlaPrzesuniecia` zwraca `{asc_deg,mc_deg}` używane przez `osCzulosc`. Nazwy zgodne między zadaniami.
