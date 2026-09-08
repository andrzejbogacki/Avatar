# Architektura — Projekt Avatar (Architektura Nowej Ziemi)
Status: piaskownica · v1

## 1. Zasada porządkująca: matryca 3 · 6 · 9

| Pozycja | Rola | Warstwa aplikacji | Warstwa sprzętowa (węzły) |
|---|---|---|---|
| **3** | Impuls / zasilanie | Aplikacja i jej moduły (kod) | Telefon |
| **6** | Forma / materializacja | Baza danych, stan, artefakty | Serwer lokalizacji (Mac Mini) |
| **9** | Regulacja + rezonans (dwuaspektowo) | Kernel (warstwa Lila): walidacje, synchronizacja, kontrola obiegu | Chmura prywatna |

**Mikro = makro:** każdy moduł odwzorowuje ten sam wzorzec wewnętrznie — wejście/impuls (3), stan/forma (6), warstwa kontrolna (9). Przykład: QAC → `calculator` (3), `profiles` (6), `regulator9` (9).

**Pozycja 9 zawsze dwuaspektowo** (zgodnie z `kernel_specyfikacja_v1.md`): regulator (nad systemem, nie uczestniczy w obiegu) + rezonator (punkt między 3 a 6). Implementacja obu aspektów jest obowiązkowa — moduł realizujący 9 wyłącznie jako wartość obliczaną jest niezgodny z kanonem.

## 2. Układ repozytorium

```
/
├── frontend/     # React PWA (impuls interfejsu — 3)
│   └── src/modules/<id>/
├── backend/      # Node.js
│   └── modules/<id>/        # moduły domenowe (QAC, ...)
├── docs/         # ten pakiet: mapa, architektura, konwencje, moduły, ADR
└── [pliki źródeł prawdy w korzeniu lub Project knowledge]
```

## 3. Źródła prawdy

| Plik | Zakres |
|---|---|
| `docs/glosariusz.json` (v5) | Semantyka pojęć — jedyna wykładnia terminologii. 67 pozycji, 99 431 B |
| `rejestr.json` — **nie istnieje w repozytorium** | Adresacja kanoniczna: dot-address, 9 rootów. Do czasu zasilenia każdy adres modułu jest kandydatem |
| `kernel_specyfikacja_v1.md` — **nie istnieje w repozytorium** | Warstwa 9 (Lila), reguły SOLID, punkty otwarte kernela |
| `protokol_suwerennosci.json` (schemat `ps_v1`, korzeń) + `docs/protokol_suwerennosci_andrzej_bogacki.json` (instancja Suwerena) + `docs/dokumenty/PS_v1_dokument_zamykajacy.md` | Tożsamość (avatar_id), certyfikacja, zasady dostępu. Schemat opisuje każdego Awatara, instancja opisuje jednego |

Konflikt między źródłami → decyzja Suwerena, zapis w ADR.

## 4. Reguły rozszerzania (modularność)

1. **Nowy moduł** = katalog `backend/modules/<id>/` lub `frontend/src/modules/<id>/`, wzorzec Brahmandy: kontener z jawnymi kanałami — komunikacja między modułami wyłącznie przez kontrakty zdefiniowane w dokumentacji modułu, nigdy przez sięganie do wnętrza innego modułu.
2. **Definition of Done modułu:** kod + `README.md` w katalogu modułu + `docs/moduly/<id>.md` + wpis w `mapa_projektu.json` + adres w `rejestr.json` + terminy w glosariuszu (lub status TERMIN-KANDYDAT).
3. **Zależności zewnętrzne** (biblioteki, API, usługi) zawsze z opisanym zachowaniem przy ich braku — brak zależności nie może blokować rdzenia modułu.
4. **Dane środowiskowe i konfiguracyjne** wyłącznie z warstwy `config/` modułu — zakaz magic numbers.
5. **Statusy artefaktów:** `piaskownica` (mutowalny) → `zamrożony_vN` (dokument zamykający wg wzorca `PS_v1_dokument_zamykajacy.md`). Publikacja niemutowalna (blockchain) wyłącznie ze statusu zamrożonego.
