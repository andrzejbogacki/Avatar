# Reguła przechowywania danych testerów — wersja pokazowa v1

Status: zatwierdzone 15.09.2026
Docelowa ścieżka w repozytorium: `docs/dokumenty/REGULA_DANYCH_TESTEROW.md`

---

## 1. Zakres

Dokument obowiązuje dla pierwszego testu w terenie, prowadzonego na prawdziwych danych kilku testerów (wariant A1: obliczenia na węźle).

Obejmuje: dane urodzeniowe testerów (data, godzina, miejsce), wyniki wyliczone z tych danych, dane kont i profili.

Nie obejmuje: poczty, transkryptów Claude Code i plików prywatnych na dysku Suwerena. Zakresem jest system, nie maszyna.

---

## 2. Gdzie leżą dane

Trzy osobne byty, nigdy w jednym pliku:

1. **Kontener wejściowy** — data, godzina i współrzędne urodzenia. Szyfrowany, poza repozytorium, poza katalogiem profili. Każdy rekord ma numer wersji.
2. **Tabela wiążąca** — powiązanie imienia i nazwiska z `avatar_id`. Szyfrowana, osobny plik, poza repozytorium.
3. **Katalog profili** — wyłącznie `avatar_id` i wyniki. Bez imion.

Skutek: wyciek katalogu profili daje zbiór liczb bez przypisania do człowieka.

Węzeł: Mac Mini, dysk zaszyfrowany (FileVault). Kopia zapasowa wyłącznie na nośniku zewnętrznym, szyfrowanym. Kopia na tym samym dysku nie jest kopią.

Katalogi danych (`qac/profiles/`, `auth/accounts/`, `ps/profile/`, `wymiennik/salda/`) pozostają puste w repozytorium i wpisane w `.gitignore`.

---

## 3. Co jest daną osobową

Daną osobową jest zarówno wejście, jak i wynik z niego wyliczony.

Z ascendentu podanego w stopniach odtwarza się godzinę urodzenia co do sekundy. Usunięcie wejścia bez usunięcia wyniku niczego nie załatwia.

Reguła dotyczy także zrzutów ekranu, dokumentów i materiałów pokazowych.

---

## 4. Zakazy

1. Dane testerów nigdy nie wchodzą do testów kodu. Fixture'y pozostają syntetyczne (`PROFIL_BRZEGOWY_A`, `profil_zimowy_A`).
2. Profil realnego testera pokazywany inwestorowi wyłącznie za jego odrębną zgodą (punkt 9). Domyślnie pokaz idzie na koncie pokazowym.
3. Profil testera nie trafia do okna rozmowy z modelem ani do Ziarna Transferu.
4. Osoby małoletnie nie biorą udziału w pierwszym teście.
5. Współrzędne bieżące (Strażnik GPS) nie opuszczają telefonu — węzeł otrzymuje stan obecności, nie pozycję.

---

## 5. Korekta danych

Data urodzenia jest własnością Awatara: widzi ją i może ją zmienić.

Korekta jest operacją systemu, nie ręczną edycją pliku:

1. Awatar zmienia wejście.
2. Wejście otrzymuje nowy numer wersji.
3. Silnik przelicza profil.
4. Stary profil zostaje oznaczony jako zastąpiony, nowy staje się aktywny.

Historię wersji widzi wyłącznie właściciel profilu.

Ręczna edycja liczb w profilu jest zakazana — profil musi wynikać z zapisanego wejścia.

Punkt otwarty (poza v1): korekta po wystawieniu certyfikatów zewnętrznych unieważnia ich podstawę. W v1 pole `certyfikaty_zewnetrzne` jest puste.

---

## 6. Usunięcie danych

Tester ma prawo do usunięcia danych na żądanie, wykonanego w jednym kroku.
Skrypt przyjmuje `avatar_id`. Operacja jest nieodwracalna.

### 6.1 Magazyny własne testera

1. `qac/profiles/<avatar_id>.json` — profil, wszystkie wersje, wraz z `.kosz/`
2. `auth/accounts/<avatar_id>.json` — konto
3. `ps/profile/<avatar_id>.json` — profil Protokołu Suwerenności
4. `wymiennik/salda/<avatar_id>.json` — saldo
5. kontener wejściowy — rekord danych urodzeniowych, wszystkie wersje
6. tabela wiążąca — wpis `avatar_id → imię i nazwisko`
7. `wymiennik/tokeny/` — tokeny klasy `avatar` z polem `emitent = avatar_id`
8. `rezonator/zrodla/` — źródła z polem `wlasciciel = avatar_id`

### 6.2 Ślady w danych innych Awatarów

Identyfikator usuwanego testera pozostaje danymi testera także wtedy, gdy leży w cudzym pliku. Skrypt usuwa jego wpisy, cudzych profili poza tym nie modyfikuje:

- `ps/profile/*.json` → `poziomy_obserwatorow[<avatar_id>]`
- `ps/profile/*.json` → `nadpisania[]` z `obserwator = avatar_id`
- `rejestr_dostepu` oraz `zgody_na_kontakt` — wpisy z tym identyfikatorem
- `auth/zaproszenia/*.json` — rekordy z `zapraszajacy` lub `kandydat_avatar_id`
- `wymiennik/transakcje/` i `wymiennik/oferty/` — rekordy z tym identyfikatorem po dowolnej stronie
- certyfikaty i poręczenia **wystawione przez** usuwanego testera u innych Awatarów — usuwane. Certyfikat bez wystawcy jest nieweryfikowalny.

### 6.3 Sesja

Usunięcie konta kasuje aktywną sesję z pamięci procesu. Tester traci dostęp natychmiast, bez czekania na restart serwera.

### 6.4 Kopia zapasowa

**Kopia zapasowa nie obejmuje danych testerów.** Backup obejmuje kod i dokumenty; katalogi profili, kont, sald i kontener wejściowy są z niego wyłączone.

Uzasadnienie: żaden skrypt na węźle nie dosięgnie nośnika zewnętrznego, więc obietnica usunięcia byłaby niespełniona. Cena: awaria dysku kasuje dane testu. Przy kilku testerach — akceptowalne.

Katalog `backend/dev_public/pobierz/` zostaje wyczyszczony i wyłączony na czas testu.

### 6.5 Rejestr

Skrypt dopisuje wiersz do rejestru usunięć: `avatar_id`, znacznik czasu, lista faktycznie usuniętych obiektów, lista nieznalezionych.
Uzupełnia też pole „data usunięcia" w rejestrze testerów z punktu 7.

### 6.6 Wymagania wykonawcze

- tryb `--dry-run` — raport bez kasowania
- bez flagi: potwierdzenie przez wpisanie `avatar_id`
- brak pliku nie jest błędem, trafia do raportu jako „nie znaleziono"
- przerwanie, gdy `avatar_id` nie występuje w żadnym magazynie
- przy przerwaniu w połowie: rejestr zapisuje stan faktyczny, nie zamierzony
- skrypt napisany i sprawdzony na profilu syntetycznym **przed** wejściem pierwszego testera
- nie dotyka `PROFIL_BRZEGOWY_A` ani `profil_zimowy_A`

---

## 7. Rejestr testerów

Poza repozytorium. Jeden wiersz na osobę: `avatar_id`, zakres udostępnionych danych, data zgody, data usunięcia.

Zgoda pisemna, jedna strona: jakie dane, po co, gdzie leżą, jak długo, jak skasować. Zawiera zdanie o wynikach pochodnych (punkt 3).

---

## 8. Skan przed commitem

Skan danych osobowych nie może zależeć od pamięci operatora — wchodzi jako hook `pre-commit`:

- `git grep` po rewizjach (`grep` nie czyta obiektów gita — są spakowane zlib),
- bez uwzględniania wielkości liter,
- osobny wzorzec `data + godzina`, nie tylko nazwiska,
- osobny skan drzewa roboczego (`git grep HEAD` nie widzi niezacommitowanych zmian).

Wynik zerowy wymaga potwierdzenia drugą metodą. Cisza narzędzia nie jest wynikiem negatywnym.

---

## 9. Pokaz dla inwestora

Trzy warianty. Wybór zależy od osoby.

### 9.1 Inwestor obcy — konto pokazowe

Osobny Awatar w sieci (`avatar_id: DEMO-01`), data urodzenia wymyślona. Silnik liczy go tak samo jak każdy inny profil — jakości i dopasowania działają naprawdę, tylko za profilem nie stoi konkretna osoba.

Testerzy poszerzają mu widok przez **nadpisanie ręczne** w Protokole Relacji — wskazują konto pokazowe na liście wyjątków.

**Zakaz:** nadawanie certyfikatów kontu pokazowemu w celu odblokowania dostępu. Certyfikat poświadcza prawdę o opanowaniu osi, nie jest przyciskiem dostępu. Użyty jako przycisk — traci wartość w całym systemie.

### 9.2 Inwestor znajomy — prawdziwe konto

Zakłada własne konto na własnych danych i używa systemu, zamiast go oglądać. Przechodzi przez bramkę tak jak każdy: niesklasyfikowany → ściana → deklaracja jakości → uczeń → dostęp.

Warunki:
- podlega całej tej regule na równi z testerami (zgoda, kontener, prawo do usunięcia),
- testerzy muszą wiedzieć, że wchodzi konkretna osoba z imienia — to zmienia ich decyzję o udostępnieniu,
- **zakaz certyfikatów w obie strony.** Certyfikat między inwestorem a testerem po rozmowie o finansowaniu nie jest poświadczeniem prawdy.

### 9.3 Inwestor branżowy — właściciel obiektu

Restauracja, klub, muzeum, punkt na mapie. Nie interesują go profile ani dopasowania. Interesuje go plansza w jego obiekcie, sesja gry i potwierdzona obecność.

Pokaz prowadzony z poziomu zwykłego gracza. Osobny panel właściciela obiektu — **poza v1, wersja druga**.

Odpowiedź na pytanie o statystyki: otrzymuje liczbę potwierdzonych obecności w swojej sesji, godziny wejść i liczbę powracających. Bez śledzenia kogokolwiek — pozycja nie opuszcza telefonu gracza. To jest przewaga sprzedażowa, nie ograniczenie: lokal może zadeklarować, że nie śledzi gości.

### 9.4 Zgoda na pokaz

Odrębna od zgody na test. Tester może ją cofnąć w każdej chwili, bez wychodzenia z testu. Cofnięcie usuwa konto pokazowe i konto inwestora z jego listy wyjątków.

---

## 10. Certyfikaty, poręczenia i korekta daty

Trzy odrębne byty, wcześniej mylone:

1. **Certyfikat zewnętrzny** — poświadczenie, że Awatar opanował daną oś. Ocena jakości. **Wchodzi do v1.**
2. **Poręczenie tożsamości** — poświadczenie, że wystawca spotkał osobę na żywo i ta osoba istnieje. Nie jest oceną. **Wchodzi do v1.**
3. **Odzyskiwanie konta z fragmentów klucza** (krąg poręczycieli) — mechanizm kryptograficzny, nie certyfikat. **Poza v1, wersja druga.** W v1 utrata urządzenia oznacza założenie konta od nowa.

Skutek dla punktu 5: pole `certyfikaty_zewnetrzne` **nie jest puste w v1** — wcześniejszy zapis przestaje obowiązywać.

**Korekta daty urodzenia wobec certyfikatów:**
- poręczenie tożsamości pozostaje ważne zawsze — data urodzenia nie ma wpływu na fakt spotkania,
- przy korekcie system porównuje osie przed i po przeliczeniu,
- certyfikaty na osie, które się zmieniły, otrzymują status **„do potwierdzenia"**; decyzję o podtrzymaniu podejmuje wystawca,
- certyfikaty na osie niezmienione pozostają nietknięte.
