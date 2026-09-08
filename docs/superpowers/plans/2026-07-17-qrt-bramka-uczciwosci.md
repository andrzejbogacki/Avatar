# QRT — ③ Bramka uczciwości (metoda geometryczna B, przeprojektowana) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rektyfikacja geometryczna, która NIGDY nie kłamie: dopasowuje tranzyty do natalnych osi kandydatów, ale zwraca godzinę tylko wtedy, gdy pik wyraźnie bije rozkład NULL (te same wyliczenia dla losowych dat); inaczej jawne „nie umiem".

**Architecture:** Nowy moduł `src/rectification/bramka_uczciwosci.js`. Osie natalne kandydatów (zależne od godziny, NIEzależne od wydarzeń) liczone raz. Wynik = separacja piku rzeczywistych wydarzeń od rozkładu prominencji dla K losowych zestawów dat z puli. p-value = odsetek NULL ≥ rzeczywisty → pewnosc = 1−p. Powód decyzji projektowej: pomiar kontrolny pokazał, że geometryczny „znajdywacz" nasyca się (permisywnie) lub produkuje pewne, ale BŁĘDNE piki nawet z losowych dat (ściśle) — więc jedyna uczciwa rola to bramka istotności, nie znajdywanie.

**Tech Stack:** Node.js (CommonJS), `sweph`, `node:test` + `node:assert/strict`.

## Global Constraints

- **Zakaz magic numbers poza `config/`** — parametry bramki w `config/`.
- **Zakaz cichych wartości domyślnych** — brak sygnału = jawny status `wynik: null` + `powod`, nigdy zmyślona godzina.
- **Skala czasu:** osie z `jd_ut`, tranzyty z `jd_et`.
- **Determinizm testów:** losowość (pula NULL, dobór prób) wstrzykiwalna — testy podają `pulaNull` i `losuj`; brak `Math.random` w asercjach.
- **Reuse:** `wagaAspektu(katT, katN)` i `roznicaKatowa` z `src/rectification/dopasowanie.js` (już przetestowane, orb/aspekty z `config.rektyfikacja`). `osieKatowe`, `pozycjeTopocentryczne`, `czas`.
- **TDD**, testy z `backend/`. Pełna suita QAC: `node --test 'modules/qac/test/*.test.js'`.
- **Git:** commit/push wyłącznie na jawne zlecenie Suwerena; kroki „Commit" lokalnie (bez push).

---

### Task 1: Konfiguracja bramki uczciwości

**Files:**
- Modify: `backend/modules/qac/config/rektyfikacja.js`
- Test: `backend/modules/qac/test/bramka_uczciwosci.test.js` (utwórz)

**Interfaces:**
- Produces: `config.rektyfikacja.BRAMKA_UCZCIWOSCI = { KROK_KANDYDATA_MIN: 2, K_NULL: 200, PROG_PEWNOSCI: 0.95, ROZMIAR_PULI_NULL: 60 }`

- [ ] **Step 1: Write the failing test**

`backend/modules/qac/test/bramka_uczciwosci.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { rektyfikacja } = require('../config');

test('config: parametry bramki uczciwości', () => {
    const b = rektyfikacja.BRAMKA_UCZCIWOSCI;
    assert.equal(b.KROK_KANDYDATA_MIN, 2);
    assert.equal(b.K_NULL, 200);
    assert.equal(b.PROG_PEWNOSCI, 0.95);
    assert.equal(b.ROZMIAR_PULI_NULL, 60);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (z `backend/`): `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: FAIL — `BRAMKA_UCZCIWOSCI` undefined.

- [ ] **Step 3: Write minimal implementation**

W `backend/modules/qac/config/rektyfikacja.js` dodaj przed `module.exports` i dołącz do eksportu:
```js
// Bramka uczciwości ③: rektyfikacja geometryczna z testem istotności wobec NULL.
const BRAMKA_UCZCIWOSCI = Object.freeze({
    KROK_KANDYDATA_MIN: 2,   // krok skanu kandydatów godziny [min]
    K_NULL: 200,             // liczba prób rozkładu NULL
    PROG_PEWNOSCI: 0.95,     // minimalna pewnosc, by zwrócić godzinę
    ROZMIAR_PULI_NULL: 60,   // liczba losowych zestawów tranzytów w puli NULL
});
```
(dodaj `BRAMKA_UCZCIWOSCI` do `module.exports = Object.freeze({ ... })`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/config/rektyfikacja.js backend/modules/qac/test/bramka_uczciwosci.test.js
git commit -m "feat(qac): konfiguracja bramki uczciwości ③"
```

---

### Task 2: `osieKandydatow` — osie natalne per kandydat

**Files:**
- Create: `backend/modules/qac/src/rectification/bramka_uczciwosci.js`
- Test: `backend/modules/qac/test/bramka_uczciwosci.test.js` (dopisz)

**Interfaces:**
- Consumes: `lokalnyNaUtc`/`utcNaSkaleCzasowe`, `osieKatowe`, `config.astronomia.SEKUND_NA_DOBE`
- Produces: `osieKandydatow({ czas_lokalny, strefa, obserwator, polszerokosc_min, krok_min }) -> Array<{ offset_min, asc, mc }>`

- [ ] **Step 1: Write the failing test** (dopisz)

```js
const { osieKandydatow } = require('../src/rectification/bramka_uczciwosci');
const PROFIL_BRZEGOWY_A = {
    czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
    strefa: 'Etc/GMT',
    obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
};

test('osieKandydatow: siatka kandydatów z osiami, środek = 09:44', () => {
    const k = osieKandydatow({ ...PROFIL_BRZEGOWY_A, polszerokosc_min: 120, krok_min: 2 });
    assert.equal(k.length, 121);              // -120..120 co 2
    const srodek = k.find((c) => c.offset_min === 0);
    assert.ok(Math.abs(srodek.asc - 313.203) < 0.05, `asc=${srodek.asc}`);
    // ASC rośnie z czasem
    assert.ok(k[k.length - 1].asc !== k[0].asc);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: FAIL — `osieKandydatow is not a function`.

- [ ] **Step 3: Write minimal implementation**

`backend/modules/qac/src/rectification/bramka_uczciwosci.js`:
```js
'use strict';

const { lokalnyNaUtc, utcNaSkaleCzasowe } = require('../calculator/czas');
const { osieKatowe } = require('../calculator/osie');
const { pozycjeTopocentryczne } = require('../calculator/pozycje');
const { wagaAspektu } = require('./dopasowanie');
const { rektyfikacja, astronomia } = require('../../config');

/**
 * Osie natalne (ASC/MC) dla każdego kandydata godziny w oknie ± polszerokosc_min.
 * Zależą od godziny, NIE od wydarzeń — liczone raz, wielokrotnie użyte (real + NULL).
 */
function osieKandydatow({ czas_lokalny, strefa, obserwator, polszerokosc_min, krok_min }) {
    if (!(polszerokosc_min > 0) || !(krok_min > 0)) {
        throw new Error(`Bramka: polszerokosc_min i krok_min muszą być > 0`);
    }
    const { czas_utc } = lokalnyNaUtc(czas_lokalny, strefa);
    const { jd_ut } = utcNaSkaleCzasowe(czas_utc);
    const doba = astronomia.SEKUND_NA_DOBE;
    const out = [];
    for (let off = -polszerokosc_min; off <= polszerokosc_min + 1e-9; off += krok_min) {
        const o = osieKatowe(jd_ut + (off * 60) / doba, obserwator);
        out.push({
            offset_min: Math.round(off),
            asc: o.ascendent.dlugosc_ekliptyczna_deg,
            mc: o.mc.dlugosc_ekliptyczna_deg,
        });
    }
    return out;
}

module.exports = { osieKandydatow };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/src/rectification/bramka_uczciwosci.js backend/modules/qac/test/bramka_uczciwosci.test.js
git commit -m "feat(qac): osieKandydatow — osie natalne per kandydat godziny"
```

---

### Task 3: `pozycjeTranzytu` + `scoreKandydatow`

**Files:**
- Modify: `backend/modules/qac/src/rectification/bramka_uczciwosci.js`
- Test: `backend/modules/qac/test/bramka_uczciwosci.test.js` (dopisz)

**Interfaces:**
- Consumes: `pozycjeTopocentryczne`, `utcNaSkaleCzasowe`, `wagaAspektu`
- Produces:
  - `pozycjeTranzytu(czas_utc, obserwator) -> number[]` (długości ekliptyczne ciał w chwili wydarzenia)
  - `scoreKandydatow(osieKand, tranzytyWydarzen) -> number[]` (średnia najlepszych wag aspektu tranzyt↔ASC/MC per wydarzenie, ∈ [0,1])

- [ ] **Step 1: Write the failing test** (dopisz)

```js
const { pozycjeTranzytu, scoreKandydatow } = require('../src/rectification/bramka_uczciwosci');

test('scoreKandydatow: tranzyt dokładnie na ASC kandydata → wysoki wynik tam', () => {
    const kand = [
        { offset_min: -2, asc: 100, mc: 10 },
        { offset_min: 0, asc: 200, mc: 20 },   // tu wstawimy tranzyt = 200 (koniunkcja)
        { offset_min: 2, asc: 300, mc: 30 },
    ];
    const tranzyty = [[200]]; // jedno wydarzenie, jedno ciało dokładnie na ASC kandydata #2
    const s = scoreKandydatow(kand, tranzyty);
    assert.equal(s.length, 3);
    assert.ok(s[1] > s[0] && s[1] > s[2], `s=${s}`);
    assert.ok(s[1] > 0.99); // koniunkcja ścisła
});

test('pozycjeTranzytu: zwraca długości ciał dla chwili UTC', () => {
    const tr = pozycjeTranzytu(
        { rok: 2022, miesiac: 1, dzien: 16, godzina: 12, minuta: 0, sekunda: 0 },
        { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 }
    );
    assert.ok(Array.isArray(tr) && tr.length >= 10);
    assert.ok(tr.every((x) => Number.isFinite(x)));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: FAIL — `scoreKandydatow is not a function`.

- [ ] **Step 3: Write minimal implementation** (dopisz do modułu; zaktualizuj `module.exports`)

```js
/** Długości ekliptyczne wszystkich ciał w chwili wydarzenia (tranzyt). */
function pozycjeTranzytu(czas_utc, obserwator) {
    const { jd_et } = utcNaSkaleCzasowe(czas_utc);
    const poz = pozycjeTopocentryczne(jd_et, obserwator);
    return Object.values(poz).map((p) => p.dlugosc_ekliptyczna_deg);
}

/**
 * Wynik dopasowania każdego kandydata: średnia (po wydarzeniach) najlepszej wagi
 * aspektu między dowolnym tranzytującym ciałem a natalnym ASC lub MC kandydata.
 */
function scoreKandydatow(osieKand, tranzytyWydarzen) {
    if (!Array.isArray(tranzytyWydarzen) || tranzytyWydarzen.length === 0) {
        throw new Error('Bramka: wymagana niepusta lista tranzytów wydarzeń');
    }
    return osieKand.map(({ asc, mc }) => {
        let suma = 0;
        for (const tr of tranzytyWydarzen) {
            let best = 0;
            for (const t of tr) {
                const w = Math.max(wagaAspektu(t, asc), wagaAspektu(t, mc));
                if (w > best) best = w;
            }
            suma += best;
        }
        return suma / tranzytyWydarzen.length;
    });
}
```
Rozszerz eksport: `module.exports = { osieKandydatow, pozycjeTranzytu, scoreKandydatow };`

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/src/rectification/bramka_uczciwosci.js backend/modules/qac/test/bramka_uczciwosci.test.js
git commit -m "feat(qac): pozycjeTranzytu + scoreKandydatow (dopasowanie osiowe)"
```

---

### Task 4: `prominencjaPiku`

**Files:**
- Modify: `backend/modules/qac/src/rectification/bramka_uczciwosci.js`
- Test: `backend/modules/qac/test/bramka_uczciwosci.test.js` (dopisz)

**Interfaces:**
- Produces: `prominencjaPiku(scores) -> { iBest, best, srednia, sd, prominencja }` gdzie `prominencja = (best - srednia)/sd` (0 przy zerowym rozrzucie)

- [ ] **Step 1: Write the failing test** (dopisz)

```js
const { prominencjaPiku } = require('../src/rectification/bramka_uczciwosci');

test('prominencjaPiku: ostry pik ma wysoką prominencję; płaskie = 0', () => {
    const ostry = prominencjaPiku([0, 0, 0, 1, 0, 0, 0]);
    assert.equal(ostry.iBest, 3);
    assert.ok(ostry.prominencja > 2, `prom=${ostry.prominencja}`);
    const plaskie = prominencjaPiku([0.5, 0.5, 0.5, 0.5]);
    assert.equal(plaskie.prominencja, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: FAIL — `prominencjaPiku is not a function`.

- [ ] **Step 3: Write minimal implementation** (dopisz; zaktualizuj eksport)

```js
/** Prominencja najlepszego kandydata nad rozkładem wszystkich (separacja piku). */
function prominencjaPiku(scores) {
    if (!Array.isArray(scores) || scores.length === 0) {
        throw new Error('Bramka: brak wyników do oceny prominencji');
    }
    let best = -Infinity, iBest = -1;
    for (let i = 0; i < scores.length; i++) {
        if (scores[i] > best) { best = scores[i]; iBest = i; }
    }
    const srednia = scores.reduce((a, b) => a + b, 0) / scores.length;
    const wariancja = scores.reduce((a, b) => a + (b - srednia) ** 2, 0) / scores.length;
    const sd = Math.sqrt(wariancja);
    const prominencja = sd > 1e-9 ? (best - srednia) / sd : 0;
    return { iBest, best, srednia, sd, prominencja };
}
```
Rozszerz eksport o `prominencjaPiku`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/src/rectification/bramka_uczciwosci.js backend/modules/qac/test/bramka_uczciwosci.test.js
git commit -m "feat(qac): prominencjaPiku — separacja najlepszego kandydata"
```

---

### Task 5: `rozkladNull` — rozkład prominencji dla losowych dat

**Files:**
- Modify: `backend/modules/qac/src/rectification/bramka_uczciwosci.js`
- Test: `backend/modules/qac/test/bramka_uczciwosci.test.js` (dopisz)

**Interfaces:**
- Produces: `rozkladNull(osieKand, pulaTranzytow, liczbaWydarzen, K, losuj) -> number[]` (K prominencji; każda próba losuje `liczbaWydarzen` zestawów tranzytów z `pulaTranzytow` używając `losuj()`∈[0,1))

- [ ] **Step 1: Write the failing test** (dopisz)

```js
const { rozkladNull } = require('../src/rectification/bramka_uczciwosci');

test('rozkladNull: deterministyczny przy wstrzykniętym losuj; K wyników', () => {
    const kand = [
        { offset_min: -2, asc: 100, mc: 10 },
        { offset_min: 0, asc: 200, mc: 20 },
        { offset_min: 2, asc: 300, mc: 30 },
    ];
    const pula = [[200], [12], [305]]; // trzy „zestawy" tranzytów
    let i = 0;
    const losuj = () => [0.0, 0.9, 0.5][i++ % 3]; // deterministyczny
    const nul = rozkladNull(kand, pula, 2, 4, losuj);
    assert.equal(nul.length, 4);
    assert.ok(nul.every((p) => Number.isFinite(p)));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: FAIL — `rozkladNull is not a function`.

- [ ] **Step 3: Write minimal implementation** (dopisz; zaktualizuj eksport)

```js
/**
 * Rozkład NULL: K prób, każda dobiera `liczbaWydarzen` losowych zestawów tranzytów
 * z puli (indeks = floor(losuj()·rozmiar)) i liczy prominencję piku. losuj: ()->[0,1).
 */
function rozkladNull(osieKand, pulaTranzytow, liczbaWydarzen, K, losuj) {
    if (!Array.isArray(pulaTranzytow) || pulaTranzytow.length === 0) {
        throw new Error('Bramka: pusta pula NULL');
    }
    const proms = [];
    for (let k = 0; k < K; k++) {
        const probka = [];
        for (let e = 0; e < liczbaWydarzen; e++) {
            const idx = Math.min(Math.floor(losuj() * pulaTranzytow.length), pulaTranzytow.length - 1);
            probka.push(pulaTranzytow[idx]);
        }
        proms.push(prominencjaPiku(scoreKandydatow(osieKand, probka)).prominencja);
    }
    return proms;
}
```
Rozszerz eksport o `rozkladNull`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/modules/qac/src/rectification/bramka_uczciwosci.js backend/modules/qac/test/bramka_uczciwosci.test.js
git commit -m "feat(qac): rozkladNull — rozkład prominencji dla losowych dat"
```

---

### Task 6: `bramkaUczciwosci` — decyzja + re-eksport

**Files:**
- Modify: `backend/modules/qac/src/rectification/bramka_uczciwosci.js`
- Modify: `backend/modules/qac/src/rectification/index.js`
- Test: `backend/modules/qac/test/bramka_uczciwosci.test.js` (dopisz)

**Interfaces:**
- Consumes: wszystkie powyższe + `config.rektyfikacja.BRAMKA_UCZCIWOSCI`
- Produces: `bramkaUczciwosci({ czas_lokalny, strefa, obserwator, polszerokosc_min, tranzytyWydarzen, pulaNull, krok_min?, K?, prog_pewnosci?, losuj? }) -> { pewnosc, p_value, prominencja, wynik: {offset_min}|null, powod }`. `tranzytyWydarzen` i `pulaNull` to tablice tablic długości (wstrzykiwalne — pozwala testom ominąć efemerydy i losowość).
- Re-eksport z `src/rectification/index.js`: `bramkaUczciwosci`

- [ ] **Step 1: Write the failing test** (dopisz — obie gałęzie, syntetycznie i deterministycznie)

```js
const { bramkaUczciwosci } = require('../src/rectification/bramka_uczciwosci');
const qrt = require('../src/rectification');

// siatka 5 kandydatów; kandydat #2 (offset 0) ma ASC=200
const KAND = { czas_lokalny: null }; // nieużywane — podajemy osieKand przez pulaNull ścieżkę niżej

test('bramkaUczciwosci: sygnał ponad NULL → zwraca godzinę', () => {
    // realne wydarzenie trafia dokładnie w ASC kandydata offset 0; pula NULL nie trafia nigdzie
    const wynik = bramkaUczciwosci({
        czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
        strefa: 'Etc/GMT',
        obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
        // ±8 min: na ~38° ASC rośnie ~0,34°/min, więc sąsiedzi wychodzą poza orb (na 54° starczało ±4)
        polszerokosc_min: 8, krok_min: 2,
        tranzytyWydarzen: [[ /* wypełnimy realnym trafieniem w ASC środka */ ]],
        pulaNull: [[0], [1], [2]], // długości ~0 → żadnych aspektów → prominencja NULL ≈ 0
        K: 50, prog_pewnosci: 0.9, losuj: () => 0.0,
    });
    // realny pik istnieje (ASC środka trafiony), NULL płaski → pewnosc wysoka
    assert.ok(wynik.pewnosc >= 0.9, `pewnosc=${wynik.pewnosc}`);
    assert.ok(wynik.wynik !== null);
    assert.equal(typeof wynik.wynik.offset_min, 'number');
});

test('bramkaUczciwosci: brak sygnału ponad NULL → nie umiem (wynik null)', () => {
    const wynik = bramkaUczciwosci({
        czas_lokalny: { rok: 1941, miesiac: 1, dzien: 3, godzina: 9, minuta: 44, sekunda: 59 },
        strefa: 'Etc/GMT',
        obserwator: { dlugosc_geo: -9.1393, szerokosc_geo: 38.7223, wysokosc_npm_m: 2 },
        polszerokosc_min: 4, krok_min: 2,
        tranzytyWydarzen: [[123]],       // jedno „wydarzenie"
        pulaNull: [[123], [123], [123]], // NULL identyczny jak realne → brak przewagi
        K: 50, prog_pewnosci: 0.9, losuj: () => 0.0,
    });
    assert.ok(wynik.pewnosc < 0.9);
    assert.equal(wynik.wynik, null);
    assert.match(wynik.powod, /nie umiem|brak sygnału/i);
});

test('re-eksport: qrt.bramkaUczciwosci dostępna', () => {
    assert.equal(typeof qrt.bramkaUczciwosci, 'function');
});
```

Uwaga dla implementera: w pierwszym teście `tranzytyWydarzen` musi trafić w ASC kandydata offset 0. Ponieważ osie liczą się z efemeryd, NAJPIERW policz osie: wywołaj `osieKandydatow({...te same..., polszerokosc_min:4, krok_min:2})`, odczytaj `asc` kandydata `offset_min===0` i wstaw tę wartość jako jedyne ciało: `tranzytyWydarzen: [[ascSrodka]]`. Zbuduj tę wartość w teście przed wywołaniem (import `osieKandydatow`).

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: FAIL — `bramkaUczciwosci is not a function`.

- [ ] **Step 3: Write minimal implementation** (dopisz; zaktualizuj eksport modułu)

```js
/**
 * Bramka uczciwości: zwraca godzinę TYLKO gdy pik rzeczywistych wydarzeń wyraźnie
 * bije rozkład NULL. p_value = (#NULL ≥ real + 1)/(K+1); pewnosc = 1 − p_value.
 * `tranzytyWydarzen` i `pulaNull` — tablice tablic długości (wstrzykiwalne).
 */
function bramkaUczciwosci({
    czas_lokalny, strefa, obserwator, polszerokosc_min,
    tranzytyWydarzen, pulaNull,
    krok_min, K, prog_pewnosci, losuj,
}) {
    const cfg = rektyfikacja.BRAMKA_UCZCIWOSCI;
    krok_min = krok_min ?? cfg.KROK_KANDYDATA_MIN;
    K = K ?? cfg.K_NULL;
    prog_pewnosci = prog_pewnosci ?? cfg.PROG_PEWNOSCI;
    losuj = losuj ?? Math.random;

    const osieKand = osieKandydatow({ czas_lokalny, strefa, obserwator, polszerokosc_min, krok_min });
    const realny = prominencjaPiku(scoreKandydatow(osieKand, tranzytyWydarzen));
    const nul = rozkladNull(osieKand, pulaNull, tranzytyWydarzen.length, K, losuj);

    const gorszych = nul.filter((p) => p >= realny.prominencja).length;
    const p_value = (gorszych + 1) / (K + 1);
    const pewnosc = 1 - p_value;
    const zaufany = pewnosc >= prog_pewnosci;

    return {
        pewnosc: Number(pewnosc.toFixed(4)),
        p_value: Number(p_value.toFixed(4)),
        prominencja: Number(realny.prominencja.toFixed(3)),
        wynik: zaufany ? { offset_min: osieKand[realny.iBest].offset_min } : null,
        powod: zaufany
            ? 'sygnał wyraźnie ponad przypadek (NULL)'
            : 'brak sygnału ponad przypadek (NULL) — nie umiem wyznaczyć godziny',
    };
}
```
Eksport: `module.exports = { osieKandydatow, pozycjeTranzytu, scoreKandydatow, prominencjaPiku, rozkladNull, bramkaUczciwosci };`
W `src/rectification/index.js` dodaj `const { bramkaUczciwosci } = require('./bramka_uczciwosci');` i dołącz `bramkaUczciwosci` do `module.exports` (nie usuwaj istniejących: `zlecRektyfikacje, statusZadania, KolejkaZadan, czuloscOsi, alarmCzulosci, polaWOknie, sekcjaNiepewnosci`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test modules/qac/test/bramka_uczciwosci.test.js`
Expected: PASS (wszystkie).

- [ ] **Step 5: Uruchom pełną suitę QAC**

Run: `node --test 'modules/qac/test/*.test.js'`
Expected: wszystkie zielone.

- [ ] **Step 6: Commit**

```bash
git add backend/modules/qac/src/rectification/bramka_uczciwosci.js backend/modules/qac/src/rectification/index.js backend/modules/qac/test/bramka_uczciwosci.test.js
git commit -m "feat(qac): bramkaUczciwosci — godzina tylko ponad rozkład NULL"
```

---

## Poza zakresem tego planu (osobne)

- **Generator puli NULL z efemeryd** (`generujPuleNull(obserwator, rok_od, rok_do, rozmiar, losuj)` — losowe daty po urodzeniu → tranzyty). Tu wstrzykiwana; produkcyjny generator + spięcie z realnym wejściem (daty wydarzeń użytkownika) — następny plan.
- **Spięcie z profilem/QRT UI** — zastąpienie starego `zlecRektyfikacje` (fałszywa pewność) bramką; zapis `czas_zrodlo:'rektyfikowany'` gdy `wynik != null`.
- **④ rozpoznanie jakościowe** — osobny tor.

## Self-Review (wykonane)

- **Pokrycie:** bramka zwraca godzinę tylko ponad NULL (Task 6), sygnał osiowy (Task 2-3), separacja (Task 4), NULL (Task 5), próg z config (Task 1). Uczciwość: `wynik: null` + `powod` gdy brak sygnału — zakaz zmyślonej godziny spełniony.
- **Placeholdery:** brak — pełny kod i komendy; test Task 6 zawiera jawną instrukcję zbudowania trafienia w ASC środka.
- **Determinizm:** `losuj`, `tranzytyWydarzen`, `pulaNull` wstrzykiwane — testy bez `Math.random` i (w gałęziach syntetycznych) bez efemeryd poza `osieKandydatow`.
- **Spójność typów:** `osieKandydatow`→`[{offset_min,asc,mc}]`; `scoreKandydatow(osieKand, tranzyty[])`→`number[]`; `prominencjaPiku(number[])`→`{iBest,...,prominencja}`; `rozkladNull(...)→number[]`; `bramkaUczciwosci(...)→{pewnosc,p_value,prominencja,wynik,powod}`. Nazwy zgodne między zadaniami.
