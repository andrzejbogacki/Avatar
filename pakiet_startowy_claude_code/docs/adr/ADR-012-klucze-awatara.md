# ADR-012: Klucze podpisu Awatara
- **Data:** 2026-08-27 (Panel 14); spisany do repozytorium 2026-09-08
- **Status:** zatwierdzony
- **Decydent:** Suweren (Andrzej Bogacki)
- **Źródło:** Ziarno Transferu v14-PROGRAM, sekcja 3
- **Powiązania:** ADR-002 (Auth), ADR-011 punkty 2.6 i 2.11 (podpis kształtu planszy)

## Kontekst
Podpis kształtu planszy (ADR-011 2.6) i ważność podpisu wobec zdjęcia klucza
(ADR-011 2.11) wymagają tożsamości kryptograficznej, której projekt nie ma.
Odczyt repozytorium z 08.09.2026: w `backend/` nie występuje ani jedno
wywołanie `generateKeyPair`, `createSign` ani `createVerify`. Moduł Auth zna
wyłącznie hasło przepuszczone przez scrypt, sól, jednorazowy token aktywacji
i rejestr sesji; unieważnienie sesji to usunięcie wpisu.

## Decyzja
1. **Rozszerz moduł Auth o tożsamość kryptograficzną.** Hasło zostaje przy
   logowaniu do sesji, klucz służy do podpisu. Dwie role, bez splątania.
   Osobny ADR, nie dopisek do ADR-002.
2. **Używaj Ed25519.** Klucz publiczny 32 B, podpis 64 B, stała długość,
   podpis deterministyczny. Dostępny w `node:crypto` bez zewnętrznej
   zależności — zgodnie z regułą ADR-002 o wyłącznych prymitywach.
3. **Klucz prywatny nigdy nie opuszcza urządzenia.** Parę generuje urządzenie.
   Backend nie generuje i nie przechowuje klucza prywatnego w żadnej postaci.
4. **Konto trzyma listę kluczy publicznych — po jednym na urządzenie.**
   Tożsamością jest konto; klucz jest tożsamością urządzenia i wyłącznie nią.
5. **Hasło konta autoryzuje operacje na liście** — dopisanie klucza nowego
   urządzenia, zdjęcie klucza urządzenia utraconego. Hasło jest kanałem
   niezależnym od utraconego urządzenia.
6. **Zdjęcie klucza ma dwa powody o różnym skutku.** `wycofanie` — sprzęt
   wymieniony, podpisy zostają ważne. `uniewaznienie` — sprzęt w cudzych
   rękach, podpisy tracą ważność od chwili zgłoszenia. Rekord klucza niesie
   powód i datę, nie samą obecność na liście.
7. **Chwilę rozstrzygającą nadaje węzeł przy przyjęciu podpisanej treści.**
   Zegar urządzenia podpisującego nie ma mocy dowodowej.

## Alternatywy odrzucone
- **ECDSA P-256** — podpis DER 70–72 B o zmiennej długości; rozmiar podpisu
  jest parametrem architektonicznym, bo podpisana treść wchodzi w budżet
  pakietu sieci kratowej.
- **RSA 2048** — podpis 256 B, przekracza pakiet MeshCore.
- **Klucz prywatny na węźle** oraz **kopia zapasowa klucza na węźle** —
  sprzeczne z punktem 3; węzeł dystrybuuje, nie posiada.
- **Jeden klucz na konto** — nie rozróżnia urządzeń, więc utrata jednego
  sprzętu unieważnia podpisy wszystkich. Wariant „jeden klucz, jedno
  urządzenie" został w trakcie Panelu 14 wybrany i skreślony przez Suwerena:
  etykieta była dwuznaczna. Obowiązuje punkt 4.
- **Dwa poziomy z kluczem tożsamości** — mnoży role klucza wbrew punktowi 1.
- **Krąg poręczycieli jako autoryzacja** oraz **zapraszający jako
  autoryzujący** — krąg poręczycieli nie istnieje ani w kodzie Protokołu
  Suwerenności, ani w schemacie profilu; istnieje wyłącznie pole
  `certyfikacja_startowa.zapraszajacy`, jeden zapraszający.
- **Zegar urządzenia** oraz **oba zegary z progiem rozbieżności** —
  antydatowanie przez posiadacza przejętego urządzenia.

## Konsekwencje
- **Przyjęte świadomie:** klucz prywatny bez kopii ginie razem z urządzeniem.
  To przyjęty kształt systemu, nie awaria — odzyskanie idzie przez hasło konta
  i dopisanie klucza nowego urządzenia (punkt 5).
- **Rozmiar podpisu jest parametrem architektonicznym.** 64 B Ed25519 mieści
  się w budżecie pakietu sieci kratowej; wybór krzywej jest jednocześnie
  wyborem budżetu transmisji.
- **Zdjęcie klucza nie jest jedną operacją.** Powód niesie skutek, więc rekord
  klucza wymaga pól powodu i daty. Unieważnienie bije wersję.
- **Wpływ na Auth:** magazyn kont (`backend/modules/auth/`) dostaje listę
  kluczy publicznych per konto; parametry krypto rozszerzają się o Ed25519
  obok scrypt w `config/krypto.js`. Klucz prywatny nie ma w backendzie
  miejsca zapisu i mieć go nie będzie.
- **Wpływ na Strażnika GPS:** podpis kształtu planszy (ADR-011 2.6) i reguła
  ważności podpisu (ADR-011 2.11) dostają nośnik. Do czasu zbudowania kluczy
  punkt ADR-011 O4 pozostaje zamknięty warunkowo — klucze będą się nadawać,
  gdy powstaną.
- **Koszt:** własna odpowiedzialność za poprawność użycia prymitywów,
  ograniczona wyłącznym korzystaniem z `node:crypto` (jak w ADR-002).

## Punkty otwarte
Numeracja własna tego ADR-u. Nie miesza się z O1–O9 Strażnika GPS.

| Nr | Sprawa | Stan |
|---|---|---|
| O1 | utrata hasła i urządzenia jednocześnie; jedyny kandydat — krąg poręczycieli, nieistniejący w kodzie | otwarty |
| O2 | czy powód zdjęcia klucza wymaga potwierdzenia z drugiego kanału; napastnik znający hasło może zdjąć klucz jako `wycofanie` zamiast `uniewaznienie` | otwarty |
| O3 | korekta zdania o podpisie cyfrowym w `docs/dokumenty/strategia_sieci_suwerennych.md` punkt 205 — utożsamia podpis z hashem; hash świadczy o niezmienności treści, nie o tożsamości podpisującego | otwarty |
| O4 | moment powstania pierwszej pary przy zakładaniu konta; ścieżka aktywacji z ADR-002 nie przewiduje zgłoszenia klucza publicznego | otwarty |

## Zasady utrwalone przez ten ADR
- Tożsamością jest konto, klucz jest tożsamością urządzenia.
- Klucz prywatny bez kopii ginie razem z urządzeniem — i to jest przyjęty
  kształt systemu, nie awaria.
- Rozmiar podpisu jest parametrem architektonicznym.
- Chwilę rozstrzygającą nadaje węzeł, nie urządzenie.
- Unieważnienie bije wersję.
- Weryfikuje się człowieka, nie jego sprzęt.
