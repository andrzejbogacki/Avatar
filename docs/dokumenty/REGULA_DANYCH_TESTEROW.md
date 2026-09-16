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

Skrypt przyjmuje `avatar_id` i usuwa: profil QAC, konto auth, profil Protokołu Suwerenności, saldo wymiennika, rekord w kontenerze wejściowym, wpis w tabeli wiążącej. Następnie dopisuje wiersz do rejestru usunięć.

Skrypt musi być napisany i sprawdzony na profilu syntetycznym **przed** wejściem pierwszego testera.

Uwaga: `rm -rf` omija Kosz. Operacja jest nieodwracalna.

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
