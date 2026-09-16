# scripts/ — narzędzia operatorskie węzła

## usun-testera.js

Usunięcie danych testera na żądanie, w jednym kroku.
Realizuje `docs/dokumenty/REGULA_DANYCH_TESTEROW.md` punkt 6.

```
node scripts/usun-testera.js <avatar_id> [--dry-run]
```

`--dry-run` wypisuje plan i nie dotyka dysku. Bez flagi skrypt żąda
potwierdzenia przez wpisanie `avatar_id`; każda inna odpowiedź przerywa.
Każda pozycja raportu nosi numer podpunktu reguły, z którego wynika.

### Zakres (6.1, 6.2, 6.3)

Magazyny własne testera — profil QAC wraz ze wszystkimi wersjami i koszem
bramki 9b, konto Auth, profil Protokołu Suwerenności, saldo Wymiennika,
rekordy w kontenerze wejściowym, wpis w tabeli wiążącej, tokeny klasy
`avatar` z polem `emitent`, źródła Rezonatora z polem `wlasciciel`.

Ślady w danych innych Awatarów — w cudzych profilach PS znikają wpisy
`poziomy_obserwatorow`, `nadpisania`, `rejestr_dostepu`, `zgody_na_kontakt`
i certyfikaty wystawione przez usuwanego; `certyfikacja_startowa.zapraszajacy`
przechodzi w `certyfikacja_bez_wystawcy`. Poza tymi miejscami cudze profile
pozostają nietknięte. Pliki zaproszeń Auth oraz transakcji i ofert
Wymiennika niosące ten identyfikator znikają w całości.

Kryterium dla wpisu w tablicy: identyfikator w którymkolwiek polu rekordu.
Nazwy pól nie są wymienione celowo — punkt 6.2 mówi „wpisy z tym
identyfikatorem", a struktura certyfikatów zewnętrznych nie ma jeszcze
implementacji w backendzie.

Sesja logowania (6.3) żyje w pamięci procesu serwera, do której skrypt jako
osobny proces nie sięga. Mechanizm leży w module Auth: `ktoZalogowany`
odrzuca sesję Awatara bez pliku konta i zdejmuje jego sesje z mapy. Skutek
jest natychmiastowy, bez restartu serwera.

Kasowanie jest trwałe. Bramka 9b modułu QAC przenosi profil do
`profiles/.kosz/`, ale kopia w koszu zawiera te same wyniki wyliczone
z daty urodzenia, więc tutaj kosz znika razem z profilem (punkty 3 i 6).

### Rejestry (6.5)

Rejestr usunięć — JSON Lines, dopisanie, nigdy nadpisanie. Jeden wiersz to
`avatar_id`, znacznik czasu, znacznik przerwania oraz trzy listy: usunięte,
nieznalezione i niewykonane. Suma trzech list zawsze równa się liczbie
pozycji planu, więc rejestr niesie stan faktyczny także wtedy, gdy kasowanie
padnie w połowie (6.6).

Rejestr testerów z punktu 7 dostaje datę usunięcia w wierszu tego Awatara.

### Nastawy

Ścieżek skrypt nie zgaduje — parametr nie ma wartości domyślnej.

| zmienna | znaczenie |
|---|---|
| `AVATAR_KONTENER_WEJSCIOWY` | plik kontenera wejściowego (wymagana) |
| `AVATAR_TABELA_WIAZACA` | plik tabeli wiążącej (wymagana) |
| `AVATAR_REJESTR_USUNIEC` | rejestr usunięć, JSON Lines (wymagana) |
| `AVATAR_REJESTR_TESTEROW` | rejestr testerów z punktu 7 (wymagana) |
| `AVATAR_KORZEN_DANYCH` | korzeń katalogów danych (opcjonalna) |

Bez `AVATAR_KORZEN_DANYCH` obowiązują katalogi magazynów modułów. Nastawa
służy do sprawdzenia skryptu na stanowisku syntetycznym, czego punkt 6.6
wymaga przed wejściem pierwszego testera.

### Kontrakty formatu

Kontener wejściowy, tabela wiążąca i rejestr testerów nie mają implementacji
w backendzie. Poniższy kształt jest kontraktem przyjętym przez ten skrypt —
nie kanonem projektu, dopóki Suweren go nie zatwierdzi.

```json
{ "wersja_formatu": 1,
  "rekordy": [ { "avatar_id": "tester_a", "wersja": 1, "czas_lokalny": "…", "strefa": "…" } ] }

{ "wersja_formatu": 1,
  "wpisy": [ { "avatar_id": "tester_a", "imie_nazwisko": "…", "dodano_ts": "…" } ] }

{ "wersja_formatu": 1,
  "testerzy": [ { "avatar_id": "tester_a", "zakres_danych": "…",
                  "data_zgody": "…", "data_usuniecia": null } ] }
```

Kontener i tabela mają być szyfrowane (punkt 2). Skrypt czyta postać jawną —
mechanizm szyfrowania nie jest rozstrzygnięty, a zgadnięcie go byłoby
konfabulacją. Luka do zamknięcia przed wejściem pierwszego testera.

### Testy

```
node --test 'scripts/test/*.test.js'
node --test 'backend/modules/auth/test/usuniecie_konta.test.js'
```

Wyłącznie profile syntetyczne w katalogu tymczasowym. Fixture'y QAC
`PROFIL_BRZEGOWY_A` i `profil_zimowy_A` nie są dotykane.
