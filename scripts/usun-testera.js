#!/usr/bin/env node
'use strict';

// Usunięcie danych testera na żądanie — REGULA_DANYCH_TESTEROW.md punkt 6.
//
// Zakres: magazyny własne (6.1), ślady w danych innych Awatarów (6.2),
// sesja logowania (6.3), rejestry (6.5). Operacja jest nieodwracalna:
// pliki kasowane trwale, nie do Kosza. Kopia zapasowa (6.4) jest poza
// zasięgiem skryptu z założenia — backup nie obejmuje danych testerów.

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

// Katalogi danych bierzemy z magazynów modułów — jedno źródło prawdy.
const { KATALOG_PROFILI, KATALOG_KOSZA } = require('../backend/modules/qac/src/regulator9/bramka_zapisu');
const { KATALOG_DOMYSLNY: KATALOG_KONT } = require('../backend/modules/auth/src/konta/magazyn');
const { KATALOG_DOMYSLNY: KATALOG_ZAPROSZEN } = require('../backend/modules/auth/src/regulator9/magazyn_zaproszen');
const { KATALOG_DOMYSLNY: KATALOG_PROFILI_PS } = require('../backend/modules/ps/src/profil/magazyn');
const { KATALOG_DOMYSLNY: KATALOG_SALD } = require('../backend/modules/wymiennik/src/salda/magazyn_sald');
const { KATALOG_DOMYSLNY: KATALOG_TOKENOW } = require('../backend/modules/wymiennik/src/fabryka/magazyn_tokenow');
const { KATALOG_DOMYSLNY: KATALOG_ZRODEL } = require('../backend/modules/rezonator/src/zrodla/magazyn');

// Wzorzec bezpieczeństwa ścieżki — wspólny dla Auth, PS i Wymiennika.
// Odrzuca kropkę i ukośnik, więc avatar_id nie wyprowadzi kasowania poza
// katalog danych. Sprawdzenie idzie ZAWSZE przed złożeniem ścieżki.
const WZORZEC_AVATAR_ID = /^[a-z][a-z0-9_]{2,63}$/;

const STAN_USUNIETY = 'usunięty';
const STAN_BRAK = 'nie znaleziono';
const STAN_PLANOWANY = 'do usunięcia';
const STAN_BLAD = 'błąd';

// Nastawy organizatora (KONWENCJE: parametr nie ma wartości domyślnej).
// Kontener, tabela i oba rejestry leżą poza repozytorium (punkty 2 i 7).
const ZMIENNE_SCIEZEK = Object.freeze({
    kontener: 'AVATAR_KONTENER_WEJSCIOWY',
    tabela: 'AVATAR_TABELA_WIAZACA',
    rejestr: 'AVATAR_REJESTR_USUNIEC',
    rejestrTesterow: 'AVATAR_REJESTR_TESTEROW',
});

// Nastawa opcjonalna: przesuwa katalogi danych na inny korzeń, w układzie
// z punktu 2. Wymóg 6.6 — sprawdzenie na profilu syntetycznym przed wejściem
// pierwszego testera — bez niej oznaczałoby ruszanie danych realnych.
const ZMIENNA_KORZENIA_DANYCH = 'AVATAR_KORZEN_DANYCH';

function katalogiDanych(srodowisko = process.env) {
    const korzen = srodowisko[ZMIENNA_KORZENIA_DANYCH];
    if (!korzen || !String(korzen).trim()) {
        return {
            profileQac: KATALOG_PROFILI,
            konta: KATALOG_KONT,
            zaproszenia: KATALOG_ZAPROSZEN,
            profilePs: KATALOG_PROFILI_PS,
            salda: KATALOG_SALD,
            tokeny: KATALOG_TOKENOW,
            transakcje: path.join(KATALOG_SALD, '..', 'transakcje'),
            oferty: path.join(KATALOG_SALD, '..', 'oferty'),
            zrodla: KATALOG_ZRODEL,
        };
    }
    const baza = path.resolve(String(korzen).trim());
    return {
        profileQac: path.join(baza, 'qac', 'profiles'),
        konta: path.join(baza, 'auth', 'accounts'),
        zaproszenia: path.join(baza, 'auth', 'zaproszenia'),
        profilePs: path.join(baza, 'ps', 'profile'),
        salda: path.join(baza, 'wymiennik', 'salda'),
        tokeny: path.join(baza, 'wymiennik', 'tokeny'),
        transakcje: path.join(baza, 'wymiennik', 'transakcje'),
        oferty: path.join(baza, 'wymiennik', 'oferty'),
        zrodla: path.join(baza, 'rezonator', 'zrodla'),
    };
}

function odczytajNastawy(srodowisko = process.env) {
    const brakujace = [];
    const nastawy = {};
    for (const [klucz, zmienna] of Object.entries(ZMIENNE_SCIEZEK)) {
        const wartosc = srodowisko[zmienna];
        if (!wartosc || !String(wartosc).trim()) brakujace.push(zmienna);
        else nastawy[klucz] = path.resolve(String(wartosc).trim());
    }
    if (brakujace.length > 0) {
        throw new Error(
            `Brak nastaw organizatora: ${brakujace.join(', ')}. `
            + 'Kontener wejściowy, tabela wiążąca i oba rejestry leżą poza '
            + 'repozytorium (punkty 2 i 7) — ścieżki podaje Suweren, skrypt ich nie zgaduje.'
        );
    }
    return nastawy;
}

function sprawdzAvatarId(avatar_id) {
    if (typeof avatar_id !== 'string' || !WZORZEC_AVATAR_ID.test(avatar_id)) {
        throw new Error(
            `Nieprawidłowy avatar_id: wymagany wzorzec ${WZORZEC_AVATAR_ID}. Otrzymano: ${avatar_id}`
        );
    }
    return avatar_id;
}

function wczytajJson(sciezka) {
    try {
        return JSON.parse(fs.readFileSync(sciezka, 'utf8'));
    } catch (blad) {
        if (blad.code === 'ENOENT') return null;
        if (blad instanceof SyntaxError) throw new Error(`Plik nie jest poprawnym JSON-em (${sciezka}): ${blad.message}`);
        throw blad;
    }
}

// Nadpisanie przez plik tymczasowy + rename: przerwanie w połowie zapisu
// nie zostawia okrojonego pliku z danymi.
function zapiszJsonAtomowo(sciezka, dane) {
    const tymczasowy = `${sciezka}.tmp-${process.pid}`;
    fs.writeFileSync(tymczasowy, `${JSON.stringify(dane, null, 2)}\n`, 'utf8');
    fs.renameSync(tymczasowy, sciezka);
}

function plikiJsonWKatalogu(katalog) {
    try {
        return fs.readdirSync(katalog).filter((n) => n.endsWith('.json'));
    } catch (blad) {
        if (blad.code === 'ENOENT') return [];
        throw blad;
    }
}

/**
 * Czy rekord niesie ten identyfikator w którymkolwiek ze swoich pól.
 * Kryterium celowo nie wymienia nazw pól: punkt 6.2 mówi „wpisy z tym
 * identyfikatorem", a części struktur (certyfikaty zewnętrzne) nie mają
 * jeszcze implementacji, więc nazwa pola wystawcy nie jest przesądzona.
 */
function niesieIdentyfikator(rekord, avatar_id) {
    if (rekord === avatar_id) return true;
    if (!rekord || typeof rekord !== 'object') return false;
    return Object.values(rekord).some((w) => w === avatar_id);
}

function pozycjaPliku(cel, sciezka, punkt) {
    return {
        rodzaj: 'plik',
        cel,
        punkt,
        sciezka,
        stan: fs.existsSync(sciezka) ? STAN_PLANOWANY : STAN_BRAK,
    };
}

/** Wszystkie wersje profilu QAC: plik aktywny plus kopie w koszu bramki 9b (6.1.1). */
function zbierzWersjeProfiluQac(avatar_id, katalogProfili) {
    const pliki = [path.join(katalogProfili, `${avatar_id}.json`)];
    const kosz = path.join(katalogProfili, KATALOG_KOSZA);
    const przedrostek = `${avatar_id}-`;
    for (const nazwa of plikiJsonWKatalogu(kosz)) {
        if (nazwa.startsWith(przedrostek)) pliki.push(path.join(kosz, nazwa));
    }
    return pliki;
}

/** Pliki w katalogu, których treść spełnia predykat — dla magazynów kluczowanych nie po avatar_id. */
function znajdzPlikiPoTresci(katalog, predykat) {
    const znalezione = [];
    for (const nazwa of plikiJsonWKatalogu(katalog)) {
        const sciezka = path.join(katalog, nazwa);
        const rekord = wczytajJson(sciezka);
        if (rekord && predykat(rekord)) znalezione.push(sciezka);
    }
    return znalezione;
}

/**
 * Usuwa ślady identyfikatora z profilu innego Awatara (6.2).
 * Zwraca liczbę zmian. Poza wymienionymi miejscami profilu nie rusza.
 */
function oczysccProfilPs(profil, avatar_id) {
    let zmiany = 0;
    const relacje = profil?.modul_4_protokol_relacji;

    const poziomy = relacje?.strumien_2_dostep_do_wiedzy?.poziomy_obserwatorow;
    if (poziomy && Object.prototype.hasOwnProperty.call(poziomy, avatar_id)) {
        delete poziomy[avatar_id];
        zmiany += 1;
    }

    const odfiltruj = (tablica) => {
        if (!Array.isArray(tablica)) return tablica;
        const przed = tablica.length;
        const po = tablica.filter((w) => !niesieIdentyfikator(w, avatar_id));
        zmiany += przed - po.length;
        return po;
    };

    const s1 = relacje?.strumien_1_dostep_relacyjny;
    if (s1) s1.nadpisania = odfiltruj(s1.nadpisania);
    if (relacje) {
        relacje.rejestr_dostepu = odfiltruj(relacje.rejestr_dostepu);
        relacje.zgody_na_kontakt = odfiltruj(relacje.zgody_na_kontakt);
    }

    // Certyfikaty i poręczenia wystawione przez usuwanego testera (6.2).
    // Certyfikat bez wystawcy jest nieweryfikowalny, więc znika w całości.
    const osie = profil?.modul_1_jakosci_kwantowe?.osie;
    if (osie && typeof osie === 'object') {
        for (const poziomy_osi of Object.values(osie)) {
            for (const poziom of Object.values(poziomy_osi ?? {})) {
                if (Array.isArray(poziom?.certyfikaty_zewnetrzne)) {
                    poziom.certyfikaty_zewnetrzne = odfiltruj(poziom.certyfikaty_zewnetrzne);
                }
            }
        }
    }

    // Akt certyfikacji startowej wystawiony przez usuwanego testera.
    if (profil?.certyfikacja_startowa?.zapraszajacy === avatar_id) {
        profil.certyfikacja_startowa.zapraszajacy = null;
        profil.certyfikacja_startowa.status = 'certyfikacja_bez_wystawcy';
        zmiany += 1;
    }

    return zmiany;
}

/** Wpisy usuwanego testera w kontenerze, tabeli i rejestrze testerów (6.1, 6.5). */
function pozycjaRekordow(cel, punkt, sciezka, liczba, { zawszeObecne = false } = {}) {
    return {
        rodzaj: 'rekordy',
        cel,
        punkt,
        sciezka,
        liczba,
        stan: (liczba > 0 || zawszeObecne) ? STAN_PLANOWANY : STAN_BRAK,
    };
}

/**
 * Buduje plan usunięcia. Poza odczytem nie dotyka dysku.
 * Przerywa, gdy identyfikator nie występuje w żadnym magazynie (6.6).
 */
function zaplanuj(avatar_id, nastawy, katalogi) {
    sprawdzAvatarId(avatar_id);
    const pozycje = [];

    // --- 6.1 Magazyny własne testera ---
    for (const sciezka of zbierzWersjeProfiluQac(avatar_id, katalogi.profileQac)) {
        pozycje.push(pozycjaPliku('profil QAC', sciezka, '6.1.1'));
    }
    pozycje.push(pozycjaPliku('konto Auth', path.join(katalogi.konta, `${avatar_id}.json`), '6.1.2'));
    pozycje.push(pozycjaPliku('profil Protokołu Suwerenności', path.join(katalogi.profilePs, `${avatar_id}.json`), '6.1.3'));
    pozycje.push(pozycjaPliku('saldo Wymiennika', path.join(katalogi.salda, `${avatar_id}.json`), '6.1.4'));

    const kontener = wczytajJson(nastawy.kontener);
    const rekordyKontenera = Array.isArray(kontener?.rekordy)
        ? kontener.rekordy.filter((r) => r?.avatar_id === avatar_id) : [];
    pozycje.push(pozycjaRekordow(
        'kontener wejściowy (dane urodzeniowe, wszystkie wersje)', '6.1.5',
        nastawy.kontener, rekordyKontenera.length
    ));

    const tabela = wczytajJson(nastawy.tabela);
    const wpisyTabeli = Array.isArray(tabela?.wpisy)
        ? tabela.wpisy.filter((w) => w?.avatar_id === avatar_id) : [];
    pozycje.push(pozycjaRekordow('wpis w tabeli wiążącej', '6.1.6', nastawy.tabela, wpisyTabeli.length));

    for (const sciezka of znajdzPlikiPoTresci(katalogi.tokeny,
        (t) => t.klasa === 'avatar' && t.emitent === avatar_id)) {
        pozycje.push(pozycjaPliku('token klasy avatar', sciezka, '6.1.7'));
    }
    for (const sciezka of znajdzPlikiPoTresci(katalogi.zrodla, (z) => z.wlasciciel === avatar_id)) {
        pozycje.push(pozycjaPliku('źródło Rezonatora', sciezka, '6.1.8'));
    }

    // --- 6.2 Ślady w danych innych Awatarów ---
    for (const nazwa of plikiJsonWKatalogu(katalogi.profilePs)) {
        if (nazwa === `${avatar_id}.json`) continue; // profil własny znika w całości
        const sciezka = path.join(katalogi.profilePs, nazwa);
        const profil = wczytajJson(sciezka);
        if (!profil) continue;
        const zmiany = oczysccProfilPs(JSON.parse(JSON.stringify(profil)), avatar_id);
        if (zmiany > 0) {
            pozycje.push({
                rodzaj: 'slady_ps', cel: `ślady w profilu ${nazwa.replace(/\.json$/, '')}`,
                punkt: '6.2', sciezka, liczba: zmiany, stan: STAN_PLANOWANY,
            });
        }
    }

    const nosiId = (r) => niesieIdentyfikator(r, avatar_id);
    for (const sciezka of znajdzPlikiPoTresci(katalogi.zaproszenia, nosiId)) {
        pozycje.push(pozycjaPliku('zaproszenie Auth', sciezka, '6.2'));
    }
    for (const sciezka of znajdzPlikiPoTresci(katalogi.transakcje, nosiId)) {
        pozycje.push(pozycjaPliku('transakcja Wymiennika', sciezka, '6.2'));
    }
    for (const sciezka of znajdzPlikiPoTresci(katalogi.oferty, nosiId)) {
        pozycje.push(pozycjaPliku('oferta Wymiennika', sciezka, '6.2'));
    }

    // --- 6.5 Data usunięcia w rejestrze testerów ---
    const rejestrTesterow = wczytajJson(nastawy.rejestrTesterow);
    const wierszeTesterow = Array.isArray(rejestrTesterow?.testerzy)
        ? rejestrTesterow.testerzy.filter((t) => t?.avatar_id === avatar_id) : [];
    pozycje.push({
        rodzaj: 'data_usuniecia',
        cel: 'data usunięcia w rejestrze testerów',
        punkt: '6.5',
        sciezka: nastawy.rejestrTesterow,
        liczba: wierszeTesterow.length,
        stan: wierszeTesterow.length > 0 ? STAN_PLANOWANY : STAN_BRAK,
    });

    // --- 6.6 Przerwanie, gdy identyfikatora nie ma w żadnym magazynie ---
    const cokolwiekZnalezione = pozycje.some((p) => p.stan === STAN_PLANOWANY);
    if (!cokolwiekZnalezione) {
        throw new Error(
            `avatar_id ${avatar_id} nie występuje w żadnym magazynie. `
            + 'Usunięcie przerwane — nie ma czego kasować.'
        );
    }

    return { avatar_id, pozycje, kontener, tabela, rejestrTesterow };
}

/**
 * Wykonuje plan. Każda pozycja zmienia stan natychmiast po swojej operacji,
 * więc plan przerwany w połowie niesie stan faktyczny, nie zamierzony (6.6).
 */
function wykonaj(plan, nastawy) {
    for (const pozycja of plan.pozycje) {
        if (pozycja.stan !== STAN_PLANOWANY) continue;
        try {
            if (pozycja.rodzaj === 'plik') {
                fs.unlinkSync(pozycja.sciezka);
            } else if (pozycja.rodzaj === 'slady_ps') {
                const profil = wczytajJson(pozycja.sciezka);
                oczysccProfilPs(profil, plan.avatar_id);
                zapiszJsonAtomowo(pozycja.sciezka, profil);
            } else if (pozycja.sciezka === nastawy.kontener) {
                plan.kontener.rekordy = plan.kontener.rekordy
                    .filter((r) => r?.avatar_id !== plan.avatar_id);
                zapiszJsonAtomowo(nastawy.kontener, plan.kontener);
            } else if (pozycja.sciezka === nastawy.tabela) {
                plan.tabela.wpisy = plan.tabela.wpisy
                    .filter((w) => w?.avatar_id !== plan.avatar_id);
                zapiszJsonAtomowo(nastawy.tabela, plan.tabela);
            } else if (pozycja.rodzaj === 'data_usuniecia') {
                const teraz = new Date().toISOString();
                for (const wiersz of plan.rejestrTesterow.testerzy) {
                    if (wiersz?.avatar_id === plan.avatar_id) wiersz.data_usuniecia = teraz;
                }
                zapiszJsonAtomowo(nastawy.rejestrTesterow, plan.rejestrTesterow);
            }
            pozycja.stan = STAN_USUNIETY;
        } catch (blad) {
            pozycja.stan = STAN_BLAD;
            pozycja.blad = blad.message;
            throw blad; // rejestr zapisze stan faktyczny w bloku finally wywołującego
        }
    }
    return plan;
}

/**
 * Dopisuje wiersz do rejestru usunięć (6.5) — JSON Lines, dopisanie, nigdy
 * nadpisanie. Rejestr leży poza katalogami danych, więc przeżywa usunięcie.
 */
function dopiszDoRejestru(plan, sciezkaRejestru, { przerwane = false, teraz = new Date() } = {}) {
    const opis = (p) => ({
        cel: p.cel,
        punkt: p.punkt,
        sciezka: p.sciezka,
        ...(p.liczba !== undefined ? { liczba: p.liczba } : {}),
        ...(p.blad ? { blad: p.blad } : {}),
    });
    const wiersz = {
        avatar_id: plan.avatar_id,
        znacznik_czasu: teraz.toISOString(),
        przerwane,
        usuniete: plan.pozycje.filter((p) => p.stan === STAN_USUNIETY).map(opis),
        nie_znaleziono: plan.pozycje.filter((p) => p.stan === STAN_BRAK).map(opis),
        niewykonane: plan.pozycje
            .filter((p) => p.stan === STAN_PLANOWANY || p.stan === STAN_BLAD)
            .map(opis),
    };
    fs.mkdirSync(path.dirname(sciezkaRejestru), { recursive: true });
    fs.appendFileSync(sciezkaRejestru, `${JSON.stringify(wiersz)}\n`, 'utf8');
    return wiersz;
}

function opiszPozycje(p) {
    const ogon = p.liczba !== undefined ? ` [${p.liczba}]` : '';
    return `  ${p.stan.padEnd(14)} ${p.punkt.padEnd(6)} ${p.cel}${ogon}\n                        ${p.sciezka}`;
}

function raport(plan, { suchy }) {
    const naglowek = suchy
        ? `PRÓBA (--dry-run) — nic nie zostało skasowane. avatar_id: ${plan.avatar_id}`
        : `USUNIĘTO. avatar_id: ${plan.avatar_id}`;
    const stopka = suchy
        ? '\n  Sesja logowania (6.3): konto pozostaje, sesja działa.'
        : '\n  Sesja logowania (6.3): unieważniona wraz z kontem — moduł Auth odrzuca'
          + '\n                        sesję awatara bez pliku konta, bez restartu serwera.';
    return [naglowek, ...plan.pozycje.map(opiszPozycje), stopka].join('\n');
}

function zapytajOPotwierdzenie(avatar_id) {
    const we = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((zwroc) => {
        we.question(
            `Operacja jest nieodwracalna. Wpisz avatar_id, aby potwierdzić (${avatar_id}): `,
            (odpowiedz) => { we.close(); zwroc(odpowiedz.trim() === avatar_id); }
        );
    });
}

async function glowna(argv) {
    const suchy = argv.includes('--dry-run');
    const pozycyjne = argv.filter((a) => !a.startsWith('--'));

    if (pozycyjne.length !== 1) {
        process.stderr.write(
            'Wywołanie: node scripts/usun-testera.js <avatar_id> [--dry-run]\n\n'
            + 'Nastawy organizatora (bez wartości domyślnych):\n'
            + `  ${ZMIENNE_SCIEZEK.kontener}  — kontener wejściowy\n`
            + `  ${ZMIENNE_SCIEZEK.tabela}      — tabela wiążąca\n`
            + `  ${ZMIENNE_SCIEZEK.rejestr}    — rejestr usunięć (JSON Lines)\n`
            + `  ${ZMIENNE_SCIEZEK.rejestrTesterow}   — rejestr testerów (punkt 7)\n\n`
            + 'Nastawa opcjonalna:\n'
            + `  ${ZMIENNA_KORZENIA_DANYCH}       — korzeń katalogów danych\n`
        );
        return 2;
    }

    const avatar_id = pozycyjne[0];
    const nastawy = odczytajNastawy();
    const plan = zaplanuj(avatar_id, nastawy, katalogiDanych());

    if (suchy) {
        process.stdout.write(`${raport(plan, { suchy: true })}\n`);
        return 0;
    }

    if (!await zapytajOPotwierdzenie(avatar_id)) {
        process.stderr.write('Potwierdzenie niezgodne — przerwane, nic nie skasowano.\n');
        return 1;
    }

    // Rejestr zapisuje się także wtedy, gdy kasowanie padnie w połowie (6.6).
    let przerwane = false;
    try {
        wykonaj(plan, nastawy);
    } catch (blad) {
        przerwane = true;
        process.stderr.write(`BŁĄD w trakcie usuwania: ${blad.message}\n`);
        throw blad;
    } finally {
        const wiersz = dopiszDoRejestru(plan, nastawy.rejestr, { przerwane });
        process.stdout.write(`${raport(plan, { suchy: false })}\n`);
        process.stdout.write(`Rejestr usunięć: ${nastawy.rejestr} (wiersz z ${wiersz.znacznik_czasu})\n`);
    }
    return 0;
}

if (require.main === module) {
    glowna(process.argv.slice(2))
        .then((kod) => { process.exitCode = kod; })
        .catch((blad) => {
            process.stderr.write(`BŁĄD: ${blad.message}\n`);
            process.exitCode = 1;
        });
}

module.exports = {
    odczytajNastawy, katalogiDanych, sprawdzAvatarId, zbierzWersjeProfiluQac,
    znajdzPlikiPoTresci, niesieIdentyfikator, oczysccProfilPs,
    zaplanuj, wykonaj, dopiszDoRejestru, raport, glowna,
    WZORZEC_AVATAR_ID, ZMIENNE_SCIEZEK, ZMIENNA_KORZENIA_DANYCH,
    STAN_USUNIETY, STAN_BRAK, STAN_PLANOWANY, STAN_BLAD,
};
