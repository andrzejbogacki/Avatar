# ZIARNO TRANSFERU v14-REPO — WERSJA OKROJONA

**Uwaga o tej wersji.** Oryginał Ziarna v14-REPO nie wchodzi do repozytorium
w żadnej postaci — niesie dane osobowe osoby trzeciej. Ta wersja zachowuje
wszystko o repozytorium jako maszynie: wzorzec dostępu, procedurę wgrywania,
warianty naprawy, decyzje techniczne. Każde cięcie oznaczone linią
`[USUNIĘTO — dane osobowe]`. Oryginał leży u Suwerena, poza repozytorium.

**FRAZA KONTROLNA: WRZOSOWISKO-ANTRACYT-41-KOTWICA**
Źródło: Panel 14, wyrosły z Ziarna Transferu v13 (fraza KAŁAMARZ-OLIWIN-08-ZASUWA).
Powód rozdzielenia: praca infrastrukturalna i praca programowa mają różny rytm
i różny warunek zamknięcia. Panel 14 pokazał, że zmieszane zjadają się nawzajem.
Zakres: stan repozytorium, incydent danych osobowych, procedura wgrywania.
Data: 27.08.2026
Panel: 14

**To Ziarno jest jedynym miejscem prawdy o infrastrukturze.** Ziarno programowe
odsyła tutaj po adres repozytorium, wzorzec dostępu i procedurę wgrywania —
i tych rzeczy nie powtarza.

---

## 1. STAN OTWARTY — DECYZJA NIEPODJĘTA

**Incydent danych osobowych czeka na decyzję Suwerena. Nic poza zamknięciem
dostępu nie zostało wykonane.**

Panel programowy jest tym zablokowany: dopóki nie wiadomo, gdzie stoi
repozytorium, nie ma dokąd wgrywać plików.

---

## 2. INCYDENT — DANE OSOBOWE W PUBLICZNEJ HISTORII

### 2.1 Co jest odsłonięte

[USUNIĘTO — dane osobowe]

Dane weszły jako fixture testowy do specyfikacji rektyfikacji — nie były
oznaczone jako wrażliwe i nie przeszły przez tę samą redakcję co pozostałe.

### 2.2 Zasięg

- **25 z 73 commitów** `origin/main`.
- Pierwszy commit wprowadzający: **`6ec13d0`** („docs(qrt): spec rektyfikacji
  + plan silnika czułości i alarmu"), **17.07.2026**.
- Nieprzerwanie do HEAD `9903396`.
- Ekspozycja publiczna trwała od 17 lipca do 27 sierpnia — **sześć tygodni**.

Pliki dotknięte:

[USUNIĘTO — dane osobowe]

### 2.3 Co NIE jest odsłonięte

[USUNIĘTO — dane osobowe]

Redakcja zastosowana w plikach specyfikacji i planu „dane wejściowe" zadziałała
poprawnie we wszystkich ich wersjach na `origin/main`, wraz z notką w treści
pliku o publicznym charakterze repozytorium.

[USUNIĘTO — dane osobowe]

### 2.4 Cztery opcje naprawy

| # | Opcja | Co usuwa | Koszt |
|---|---|---|---|
| A | Redakcja tylko na HEAD | stan bieżący | **niewystarczające** — dane zostają w 25 commitach |
| B | `git filter-repo` + force-push | całą historię `origin/main` | zmienia numery commitów; GitHub trzyma stare obiekty pod bezpośrednimi adresami do czasu ręcznego wyczyszczenia przez Support |
| C | Nowe czyste repozytorium, stare skasowane | całą skażoną historię | utrata publicznej historii i adresu repozytorium |
| D | Zmiana na prywatne | nic — zatrzymuje dalszą ekspozycję | jedno kliknięcie; nie cofa kopii już pobranych |

**Rekomendacja Nexusa: D natychmiast, następnie C.** Przy danych dziecka
poleganie na zgłoszeniu do GitHub Support i cudzej kolejce jest gorsze niż
usunięcie repozytorium w całości. Pełna historia zostaje offline w bundle.

**Zastrzeżenie trwałe:** usunięcie z GitHuba nie cofa kopii już pobranych
ani zindeksowanych.

### 2.5 Wykryty błąd metodologiczny audytu

Zbiorcze `git grep` z listą 73 rewizji **po cichu zwracało puste wyniki** —
narzędzie odrzuca zbyt długą listę rewizji bez komunikatu błędu. Pierwszy skan
raportował „zero trafień" i był fałszywy. Audyt powtórzono pętlą po commitach,
jedna rewizja na wywołanie.

**Zasada do kanonu: cisza narzędzia nie jest wynikiem negatywnym.** Skan
zwracający zero wymaga potwierdzenia drugą metodą, zanim zostanie uznany
za dowód czystości.

---

## 3. STAN REPOZYTORIUM

### 3.1 Wykonane w Panelu 14

- **`main` wypchnięty z węzła.** `2b3d9cb..9903396`, przyrostowo, bez force.
  Dwadzieścia pięć commitów lokalnych z 16–17 lipca uratowanych z dysku.
- **Bundle obu gałęzi lokalnych utworzony i zweryfikowany.**

### 3.2 Bundle — dwie lokalizacje

```
/Users/andrzej/Documents/Avatar-backup-galezie-2026-08-27.bundle      (373 KB)
/Volumes/Modele i Dane/Avatar-backup-galezie-2026-08-27.bundle        (kopia)
```

Zawiera pełną historię obu gałęzi, obie na commicie `ce69c06`:
`backup-przed-anonimizacja` oraz `feat/qac-dane-wejsciowe`.
`git bundle verify` przeszedł, sumy SHA256 identyczne.

Odtworzenie:

```bash
git clone /Volumes/"Modele i Dane"/Avatar-backup-galezie-2026-08-27.bundle odtworzenie
```

### 3.3 Gałęzie lokalne — werdykt

Obie gałęzie (po 12 commitów, `ce69c06`) **nie zawierają pracy unikalnej**.
Porównanie treści, nie numerów commitów, wykazało: funkcja „dane wejściowe"
jest w całości w `main`, a `main` poszedł dalej (silnik QRT: czułość,
niepewność, bramka uczciwości, poprawka geokodowania `admin_level`).

Jedyna realna różnica: cztery pliki, w tym dwa dokumenty specyfikacji i planu
z danymi nieredagowanymi.

**Wniosek: gałęzie mają wartość wyłącznie archiwalną. Nie wolno ich wypychać
na publiczny origin.** Bundle wystarczy.

### 3.4 Gałęzie zdalne — do sprzątnięcia

| Gałąź | Stan |
|---|---|
| `main` | jedyna żywa; 73 commity |
| `claude/git-init-si6k34` | **domyślna gałąź repozytorium**; zawiera dwa pliki (README, .gitignore) |
| `claude/github-mac-mini-sync-bl6rub` | nie zawiera nic ponad `main` |

Skutek uboczny: kto wchodzi na GitHub, widzi puste repozytorium, bo domyślną
gałęzią jest ta z dwoma plikami.

**Kolejność wymuszona:** najpierw przestawienie domyślnej gałęzi na `main`
w ustawieniach GitHuba, dopiero potem kasowanie. Gałęzi domyślnej nie da się
skasować, dopóki nią jest.

Zadanie traci sens, jeśli zapadnie decyzja C.

### 3.5 Zasoby poza repozytorium (raport z węzła)

| Ścieżka | Data | Uwagi |
|---|---|---|
| `~/Downloads/avatar_backup_backend_docs_20260709_0140.zip` | 09.07.2026 | 1,9 MB; pełny `backend/` wraz z `ephemeris/seas_18.se1` |
| `~/Documents/Avatar_Backup/Backup_2026-02-14_20-00` | 14.02.2026 | stara struktura `core/docs/logs/media` |
| `~/Desktop/Avatar_Backup_2026-02-14` | kopia z 12.05.2026 | jak wyżej |
| `~/Documents/Avatar_Backup_2026-02-14` | 14.02.2026 | jak wyżej |
| `~/Documents/Avatar_Project_Backup_2026-02-14` | 14.02.2026 | jak wyżej |
| `~/.ssh/id_ed25519_github_avatar` | 09.07.2026 | klucz SSH do repozytorium |
| `/Volumes/Modele i Dane/Modele/` — dwa rendery koncepcyjne | 18.12.2025 | pliki graficzne poza repozytorium |

Cztery katalogi z lutego mają strukturę sprzed obecnej — to stan archiwalny,
nie kopia bieżącego repozytorium.

**Nierozstrzygnięte:** czy archiwa z lutego i zip z lipca zawierają dane
osobowe. Nieprzeszukane.

---

## 4. USTALENIA O NARZĘDZIACH

### 4.1 Maszyna

**Laptop i węzeł to ta sama maszyna.** `hostname` = `Mac`, nazwa komputera
= `Mac mini (Andrzej)`. Claude Code działa w dwóch zakładkach: jedna lokalnie,
druga przez Tailscale SSH — obie wskazały ten sam katalog.

Jedyny klon repozytorium na całym systemie: **`/Users/andrzej/Public/Avatar`**.
Zdalny: `git@github.com:andrzejbogacki/Avatar.git` (adres z 08.09.2026;
w Panelu 14 było `Avatar-Projekt.git`, dziś pod zdalnym `stare`).

### 4.2 Podział ról — ustalony jawnie

**Nexus nie ma dostępu do zapisu w repozytorium i nigdy nie miał.** Może je
wyłącznie pobierać i czytać. Pliki wytwarza do katalogu wyjściowego rozmowy,
skąd Suweren je pobiera; commituje Claude Code.

Wzorzec odczytu dla Nexusa — pełna historia:

```bash
cd /tmp && git clone -q https://github.com/andrzejbogacki/Avatar.git klon
```

Wzorzec odczytu bez historii (szybszy):

```bash
curl -sS -L -o /tmp/avatar.tar.gz \
  "https://codeload.github.com/andrzejbogacki/Avatar/tar.gz/refs/heads/main"
```

**Oba przestaną działać, jeśli repozytorium stanie się prywatne.** Wtedy
odczyt repozytorium przez Nexusa znika i weryfikacja obecności plików
przechodzi w całości na Claude Code.

### 4.3 Procedura wgrywania

Krok pierwszy: pobrać plik z rozmowy przyciskiem na karcie pliku. Trafia
do katalogu pobierania. **W Panelu 14 ten krok został pominięty i Claude Code
zatrzymał się na braku pliku — to najczęstszy punkt awarii.**

Krok drugi: nowa rozmowa w zakładce Code. Nie kontynuacja starej — stara może
mieć katalog roboczy sprzed tygodni.

Krok trzeci: polecenie w formie gotowej do wklejenia. Ścieżka docelowa, nazwa
pliku, komunikat commita, zakaz obchodzenia problemu. Nigdy proza.

### 4.4 Zachowania Claude Code odnotowane

- Zatrzymał się na braku pliku źródłowego i **odmówił zmyślenia treści ADR-u**.
- Zablokował push dwóch gałęzi (klasyfikator auto-mode), a następnie sam
  znalazł powód merytoryczny, dla którego push był błędny.
- Wykrył i zgłosił własny błąd metodologiczny w audycie.

**Wniosek: polecenie z klauzulą „nie obchodź problemu, zatrzymaj się
i napisz, czego brakuje" działa i wchodzi do wzorca na stałe.**

---

## 5. ZASADY POTWIERDZONE — NOWE W v14-REPO

- **Trzy stany zamiast dwóch: omówione / spisane / wgrane i potwierdzone
  odczytem.** Panel nie zamyka tematu przed trzecim stanem.
- **Cisza narzędzia nie jest wynikiem negatywnym.**
- **Backup na tym samym dysku nie jest backupem.**
- **Nazwa gałęzi bywa ostrzeżeniem.** `backup-przed-anonimizacja` niosło
  informację o danych wrażliwych; Nexus jej nie odczytał i zarekomendował push.
- **Porównanie gałęzi po numerach commitów jest bezwartościowe.** Rozstrzyga
  porównanie treści.
- **Dane osobowe wchodzą do repozytorium jako fixture testowy**, nie jako
  dane. To jest ścieżka, która obeszła świadomą redakcję.

---

## 6. NASTĘPNA POZYCJA

1. **Decyzja o naprawie incydentu** — opcja C albo B. Blokuje wszystko inne.
2. Po decyzji: wykonanie, weryfikacja odczytem.
3. Audyt archiwów spoza repozytorium pod kątem danych osobowych.
4. Reguła wstępna dla nowych fixture'ów testowych — żeby ta ścieżka
   nie powtórzyła się.
5. Sprzątnięcie gałęzi zdalnych — bezprzedmiotowe przy opcji C.
