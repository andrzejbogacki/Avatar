# scripts/ — narzędzia operatorskie węzła

## usun-testera.js

Usunięcie danych testera na żądanie, w jednym kroku.
Realizuje `docs/dokumenty/REGULA_DANYCH_TESTEROW.md` punkt 6.

```
node scripts/usun-testera.js <avatar_id> [--dry-run]
```

`--dry-run` wypisuje plan i nie dotyka dysku. Bez flagi skrypt żąda
potwierdzenia przez wpisanie `avatar_id`; każda inna odpowiedź przerywa.

Usuwa sześć celów: profil QAC wraz ze wszystkimi wersjami, konto Auth,
profil Protokołu Suwerenności, saldo Wymiennika, rekordy w kontenerze
wejściowym (wszystkie wersje) i wpis w tabeli wiążącej.

Brak pliku nie jest błędem — trafia do raportu i do rejestru jako
`nie znaleziono`. Brak `avatar_id` w tabeli wiążącej przerywa całość:
bez wpisu nie ma potwierdzenia, czyje dane miałyby zniknąć.

Kasowanie jest trwałe. Bramka 9b modułu QAC przenosi profil do
`profiles/.kosz/`, ale kopia w koszu zawiera te same wyniki wyliczone
z daty urodzenia, więc tutaj kosz znika razem z profilem (punkty 3 i 6).

### Nastawy

Ścieżek skrypt nie zgaduje — parametr nie ma wartości domyślnej.

| zmienna | znaczenie |
|---|---|
| `AVATAR_KONTENER_WEJSCIOWY` | plik kontenera wejściowego (wymagana) |
| `AVATAR_TABELA_WIAZACA` | plik tabeli wiążącej (wymagana) |
| `AVATAR_REJESTR_USUNIEC` | plik rejestru usunięć, JSON Lines (wymagana) |
| `AVATAR_KORZEN_DANYCH` | korzeń czterech katalogów danych (opcjonalna) |

Bez `AVATAR_KORZEN_DANYCH` obowiązują katalogi magazynów modułów. Nastawa
służy do sprawdzenia skryptu na stanowisku syntetycznym, czego punkt 6
wymaga przed wejściem pierwszego testera.

### Kontrakty formatu

Kontener wejściowy i tabela wiążąca nie mają jeszcze implementacji w
backendzie. Poniższy kształt jest kontraktem przyjętym przez ten skrypt —
nie kanonem projektu, dopóki Suweren go nie zatwierdzi.

Kontener wejściowy — jeden rekord na wersję danych urodzeniowych (punkt 5):

```json
{
  "wersja_formatu": 1,
  "rekordy": [
    { "avatar_id": "tester_a", "wersja": 1, "czas_lokalny": "…", "strefa": "…" }
  ]
}
```

Tabela wiążąca — powiązanie imienia i nazwiska z identyfikatorem (punkt 2):

```json
{
  "wersja_formatu": 1,
  "wpisy": [
    { "avatar_id": "tester_a", "imie_nazwisko": "…", "dodano_ts": "…" }
  ]
}
```

Rejestr usunięć — dopisanie wiersza, nigdy nadpisanie. Jeden wiersz to
`avatar_id`, znacznik czasu, lista celów faktycznie usuniętych oraz lista
tych, których nie znaleziono. Leży poza katalogami danych, więc przeżywa
usunięcie samych danych.

### Testy

```
node --test 'scripts/test/*.test.js'
```

Wyłącznie profile syntetyczne w katalogu tymczasowym. Fixture'y QAC
`PROFIL_BRZEGOWY_A` i `profil_zimowy_A` nie są dotykane.
