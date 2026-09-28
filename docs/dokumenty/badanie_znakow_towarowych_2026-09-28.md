# Badanie znaków towarowych — znak graficzny aplikacji The Source (O-N4)

- **Data badania:** 2026-09-28
- **Baza:** TMview (TMDN), publiczny punkt końcowy `POST https://www.tmdn.org/tmview/api/search/results`
- **Wzorzec porównania:** `/Users/andrzej/Pictures/drawthings-mcp/referencja-logo-zrodlo-1024.png`
- **Zakres:** urzędy EM (EUIPO), PL (UPRP), US (USPTO), WO (WIPO); klasy nicejskie 9, 42, 45
- **Charakter dokumentu:** wyłącznie dane z odczytu, bez oceny prawnej

## 1. Ustalenie kodów klasyfikacji wiedeńskiej

Źródło: International Classification of the Figurative Elements of Marks (Vienna Classification),
5. edycja, WIPO, plik `vcl_5_en_20030101.pdf`, kategoria 24, strona 101 dokumentu.

| Kod | Brzmienie oryginalne | Rola w badaniu |
|---|---|---|
| A 24.17.8 | Symbol of infinity | znak nieskończoności — kod wiodący |
| 26.1.6 | Several circles or ellipses, juxtaposed, tangential or intersecting | dwa koła stykające się |
| 26.4.1 | Squares | kwadrat |
| 29.1.12 | Two predominant colours | dwie barwy dominujące |

Dział 24.17 nosi nazwę SIGNS, NOTATIONS, SYMBOLS. Sekcja A 24.17.8 jest sekcją pomocniczą
przypisaną do sekcji głównej 24.17.5 (Mathematical signs).

**Rozbieżność wobec założenia zadania.** Kod 24.17.12 podany w zadaniu jako oznaczenie znaku
nieskończoności w rejestrze USA oznacza w klasyfikacji wiedeńskiej 5. edycji `A 24.17.12 Notes alone`
(same nuty). W bazie TMview rekordy urzędu US posługują się kodem 24.17.08, tym samym co EUIPO —
zapytanie o 24.17.08 dla urzędu US zwraca 863 rekordy. Systemem odrębnym jest USPTO Design Search
Code, którego TMview nie udostępnia; nie został sprawdzony.

Format kodu wymagany przez punkt końcowy: trzy człony z zerem wiodącym, na przykład `24.17.08`,
`26.01.06`, `26.04.01`. Zapis bez zera (`24.17.8`) zwraca 0 rekordów.

## 2. Użyte zapytania

Ciało zapytania, wariant podstawowy:

```json
{"page":"1","pageSize":"100","criteria":"C","fOffices":["EM"],
 "viennaCode":["24.17.08"],"fNiceClass":["9"]}
```

Parametry sprawdzone kontrolnie:
- `viennaCode` i `fViennaCodes` działają wymiennie;
- filtr `fNiceClass` zawęża poprawnie — klasa nieistniejąca 99 zwraca 0 rekordów;
- **podanie kilku kodów wiedeńskich działa jak suma logiczna, nie iloczyn.** Zapytanie
  o 24.17.08 wraz z 26.01.06 zwraca dla EM 4009 rekordów, czyli więcej niż sam kod
  24.17.08 (3989). Przecięcia kodów policzono lokalnie, po pobraniu rekordów.
- maksymalny rozmiar strony wyników: 100 pozycji; metoda GET odrzucana kodem 405.

Metoda: pobrano komplet rekordów dla każdej pary urząd–klasa z kodem 24.17.08
(12 zapytań stronicowanych, 2755 rekordów unikatowych), po czym filtrowano lokalnie
po polu `viennaCodes` każdego rekordu.

## 3. Liczba trafień — kod 24.17.08 (znak nieskończoności)

| Urząd | Bez filtra klasy | Klasa 9 | Klasa 42 | Klasa 45 |
|---|---|---|---|---|
| EM (EUIPO) | 3989 | 1324 | 1228 | 226 |
| PL (UPRP) | 206 | 34 | 51 | 13 |
| US (USPTO) | 863 | 141 | 70 | 6 |
| WO (WIPO) | 1168 | 385 | 357 | 53 |

Rekordy unikatowe po złączeniu wszystkich dwunastu zapytań: 2755.
Podział według urzędu: EM 1925, WO 542, US 204, PL 84.

## 4. Przecięcia kodów — wyliczone lokalnie

| Zestaw kodów | Liczba rekordów |
|---|---|
| 24.17.08 oraz 26.01.06 (koła stykające się) | 16 |
| 24.17.08 oraz 26.04.01 (kwadrat) | 64 |
| 24.17.08 oraz 26.01.06 oraz 26.04.01 | 0 |
| 24.17.08 oraz dowolny kod z grupy 26.01 i dowolny z grupy 26.04 | 5 |
| 24.17.08 oraz 29.01.12 (dwie barwy dominujące) | 150 |
| 24.17.08 oraz 29.01.12 oraz grupa kół lub kwadratu | 17 |

## 5. Znaki najbliższe wzorcowi

Elementy odróżniające wzorca: **(1)** dwa koła stykające się w jednym punkcie,
**(2)** kwadrat w punkcie przecięcia, **(3)** dwie barwy w przeciwfazie.
Ocena elementów pochodzi z oględzin miniatur pobranych z TMview.

| Numer | Urząd | Klasy | Stan | Opis znaku | (1) | (2) | (3) |
|---|---|---|---|---|---|---|---|
| EM500000019196975 | EM | 9, 35, 39, 42 | Registered | czarny kwadrat zaokrąglony jako tło, w nim białe dwa koła stykające się, jedno wypełnione | tak | kwadrat obejmuje całość, nie punkt styku | nie |
| EM500000013178504 | EM | 9, 16, 41, 42 | Expired | srebrny kwadrat zaokrąglony jako tło, czerwony znak nieskończoności z dwóch kół | tak | kwadrat obejmuje całość | nie |
| EM500000013346408 | EM | 9 | Expired | pomarańczowy czworokąt stojący na rogu, w nim dwa koła stykające się | tak | czworokąt obejmuje całość | nie |
| EM500000007337793 | EM | 35, 36, 38, 41, 45 i inne | Expired | żółta ramka kwadratowa, czerwone pole, żółty znak nieskończoności | tak | ramka obejmuje całość | dwie barwy, nie w przeciwfazie |
| WO500000001614425 | WO | 7, 9, 12, 17, 35, 37, 39, 42 | Registered | dwa duże szare okręgi stykające się, pod nimi napis | tak | nie | nie |
| WO500000001134514 | WO | 35, 37, 39, 41, 42 | Expired | dwa grube czarne okręgi stykające się | tak | nie | nie |
| WO500000001311672 | WO | 9, 35, 42 | Registered | dwa czarne okręgi stykające się, obok napis | tak | nie | nie |
| WO500000001209357 | WO | 9 | Registered | czerwony znak nieskończoności z dwóch okręgów nad napisem | tak | nie | nie |
| EM500000019125644 | EM | 9, 16, 40 | Registered | zielony kwadrat zaokrąglony, w nim splot dwóch pętli | tak | kwadrat obejmuje całość | nie |
| WO500000001567291 | WO | 7, 9, 11, 12, 42 | Registered | dwa koła w dwóch barwach, wewnątrz kształty | tak | nie | dwie barwy |

Adresy rekordów:
- urząd EM: `https://euipo.europa.eu/trademark/data/<numer>`
- urząd WO: `https://www.tmdn.org/tmdsview-cdc/trademark/data/<numer>`

Właściciel rekordu EM500000013346408 to trzy osoby fizyczne — dane pominięto zgodnie
z zasadą ochrony danych osobowych obowiązującą w repozytorium.

**Żaden znaleziony znak nie łączy kwadratu umieszczonego w punkcie styku dwóch kół
z dwiema barwami w przeciwfazie.** Liczba rekordów łączących kod kół stykających się
z kodem kwadratu wynosi 0.

## 6. Czego nie sprawdzono i dlaczego

1. **Wyszukiwanie po obrazie.** Interfejs TMview zawiera pola `imageId`, `imageName`,
   `segmentLeft`, `segmentRight`, `segmentTop`, `segmentBottom` oraz moduł `imageSearch`.
   Punkt końcowy przyjmujący plik obrazu nie został ustalony; przesyłanie odbywa się
   jako `multipart/form-data` do zasobu wymagającego stanu sesji logowania przeglądarki.
   Porównanie wykonano wyłącznie wzrokowo, na miniaturach.
2. **Znaki bez kodu 24.17.08.** Pobrano wyłącznie rekordy z tym kodem. Znak zbudowany
   z dwóch kół, któremu urząd nie nadał kodu nieskończoności, nie znalazł się w badaniu.
3. **USPTO Design Search Code.** Własny system kodowania USPTO nie jest udostępniany
   przez TMview i nie został przeszukany.
4. **Urząd PL poza TMview.** Nie sprawdzono bezpośrednio bazy Urzędu Patentowego
   Rzeczypospolitej Polskiej; dane dla PL pochodzą z TMview.
5. **Klasy inne niż 9, 42, 45.** Poza zakresem zadania.
6. **Stan rejestracji na dzień badania.** Pola `tradeMarkStatus` pochodzą z odpowiedzi
   TMview z 2026-09-28 i nie były weryfikowane w rejestrach źródłowych.
