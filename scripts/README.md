# scripts/ — narzędzia operatorskie węzła

## raport-danych-awatara.js

Raport rozmieszczenia danych Awatara. Odpowiada na jedno pytanie: gdzie
w systemie leżą dane danego `avatar_id`. Realizuje odczytową część
`docs/dokumenty/REGULA_DANYCH.md` punkt 6.

```
node scripts/raport-danych-awatara.js <avatar_id>
```

**Skrypt wyłącznie czyta.** Nie kasuje, nie modyfikuje, nie zapisuje.
Pełna automatyzacja usuwania została odrzucona — usunięcie danych pozostaje
czynnością człowieka, a narzędzie mówi mu tylko, czego szukać i gdzie.
Test sprawdza to migawką całego stanowiska przed i po przebiegu.

### Co obejmuje raport

Magazyny własne (6.1) — profil QAC wraz ze wszystkimi wersjami i koszem
bramki 9b, konto Auth, profil Protokołu Suwerenności, saldo Wymiennika,
rekordy w kontenerze wejściowym, wpis w tabeli wiążącej, tokeny klasy
`avatar` z polem `emitent`, źródła Rezonatora z polem `wlasciciel`.

Ślady w danych innych Awatarów (6.2) — liczba wpisów w cudzych profilach PS
(`poziomy_obserwatorow`, `nadpisania`, `rejestr_dostepu`, `zgody_na_kontakt`,
certyfikaty wystawione przez tego Awatara, `certyfikacja_startowa.zapraszajacy`)
oraz pliki zaproszeń Auth i transakcji i ofert Wymiennika niosące ten
identyfikator.

Kryterium dla wpisu w tablicy: identyfikator w którymkolwiek polu rekordu.
Nazwy pól nie są wymienione celowo — punkt 6.2 mówi „wpisy z tym
identyfikatorem", a struktura certyfikatów zewnętrznych nie ma jeszcze
implementacji w backendzie.

Sesja logowania (6.3) żyje w pamięci procesu serwera i w raporcie nie jest
widoczna. Mechanizm jej unieważniania leży w module Auth: `ktoZalogowany`
odrzuca sesję Awatara bez pliku konta i zdejmuje jego sesje z mapy.

### Nastawy

| zmienna | znaczenie |
|---|---|
| `AVATAR_KONTENER_WEJSCIOWY` | plik kontenera wejściowego |
| `AVATAR_TABELA_WIAZACA` | plik tabeli wiążącej |
| `AVATAR_KORZEN_DANYCH` | korzeń katalogów danych (opcjonalna) |

Kontener i tabela leżą poza repozytorium (punkt 2) — skrypt nie zgaduje ich
położenia. Bez nastawy raport wypisuje przy tym bycie „nastawa niepodana",
zamiast milczeć o nim tak, jakby danych tam nie było.

Bez `AVATAR_KORZEN_DANYCH` obowiązują katalogi magazynów modułów. Nastawa
służy do sprawdzenia skryptu na stanowisku syntetycznym, czego punkt 6.6
wymaga przed wejściem pierwszego Awatara.

### Kontrakty formatu

Kontener wejściowy i tabela wiążąca nie mają implementacji w backendzie.
Poniższy kształt jest kontraktem przyjętym przez ten skrypt — nie kanonem
projektu, dopóki Suweren go nie zatwierdzi.

```json
{ "rekordy": [ { "avatar_id": "awatar_a", "wersja": 1 } ] }
{ "wpisy":   [ { "avatar_id": "awatar_a", "imie_nazwisko": "…" } ] }
```

Oba mają być szyfrowane (punkt 2). Skrypt czyta postać jawną — mechanizm
szyfrowania nie jest rozstrzygnięty, a zgadnięcie go byłoby konfabulacją.

### Testy

```
node --test 'scripts/test/*.test.js'
```

Wyłącznie profile syntetyczne w katalogu tymczasowym. Fixture'y QAC
`PROFIL_BRZEGOWY_A` i `profil_zimowy_A` nie są dotykane.

## backup-wykluczenia.txt

Lista katalogów danych wyłączonych z kopii zapasowej (`REGULA_DANYCH.md`
punkt 6.4) wraz z czynnościami jednorazowymi na węźle. Do wpisania
w narzędzie backupu — kod jej nie czyta.
