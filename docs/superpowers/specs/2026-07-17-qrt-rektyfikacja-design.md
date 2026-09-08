# Spec — QRT (Rektyfikacja Czasu Narodzin)

Data: 2026-07-17 · Moduł: `backend/modules/qac` (QRT) · Status: PROJEKT do zatwierdzenia Suwerena

---

## 1. Kontekst i diagnoza (zmierzone, nie teoria)

QRT (Quantum Rectification Tool) ma wyznaczać godzinę urodzenia, gdy nie jest znana
dokładnie. Diagnoza na żywych danych (15.07.2026) wykazała **fałszywą pewność**:

- `src/rectification/pewnosc.js`: `pewnosc = 0.7·dopasowanie + 0.3·margines`. Ponieważ
  `dopasowanie` przez nadmiar aspektów (13 ciał × 13 × 5 aspektów × orb ±1° ≈ 9× pokrycia)
  jest zawsze ≈0.95, sam pierwszy człon daje ~0.66 **dla dowolnego, także wylosowanego czasu**.
- `src/rectification/dopasowanie.js` woła tylko `pozycjeTopocentryczne` (planety), które
  w dobie ledwo drgają. **Osi (`osie.js`) nie używa** — a Ascendent (15°/h, 1°/4 min) to
  jedyna rzecz naprawdę czuła na godzinę.

Wniosek: metryka nagradza samo dopasowanie i nie dyskryminuje godziny. Fałszywe „0.70"
jest gorsze niż uczciwe „nie umiem".

### Pomiar odniesienia — profil brzegowy A (syntetyczny)
Fixture skonstruowany, nie pomiar osoby: dobrany tak, by ASC stał na granicy bramy, a MC
pozostawał stabilny. Dane: 1941-01-03, godzina lokalna 09:44:59, strefa stała `Etc/GMT`
(offset +00:00, niezależny od aktualizacji tzdata). Współrzędne: **38.7223 N, 9.1393 W**,
elew. ~2 m.

| pole | @09:44 | do granicy | zmienność w oknie ±30 min |
|---|---|---|---|
| **ASC** | Wodnik 13.20° · brama 19.6 | **~9 s** (styk bram 19/13); znak z Koziorożca o 09:03 | 4 bramy — alarm |
| **MC** | Strzelec 1.83° · brama 34.2 | linia ~42 s; znak ze Skorpiona o 09:37 | 16 linii — czułe |
| **Słońce** | brama 38.4 | >6 h | 0 przejść — stabilne |
| **Ziemia** | brama 39.4 | >6 h | 0 przejść — stabilne |
| **Księżyc** | brama 22.3 | ~4 h | ~stabilne |

**Rozdzielenie warstw:** warstwa astrologiczna (ASC/MC/domy) bez dokładnej godziny jest
NIEZNANA (źródło alarmu); warstwa profilu (linie Słońca/Ziemi) jest PEWNA nawet przy
godzinie przybliżonej (Słońce w 30 min nie zmienia linii). Koryguje to uproszczenie
„bez godziny nie znasz profilu": z godziną **przybliżoną** profil JEST znany.

---

## 2. Cele i zasady

1. QRT nigdy nie zwraca fałszywej pewności. Brak sygnału = niska pewność, jawnie.
2. Osoba bez dokładnej godziny jest przyjmowana uczciwie — z jawną listą tego, co niepewne
   i które systemy interpretacyjne (która astrologia) nie zadziałają w pełni.
3. Wszystko sterowane **pomiarem**, nie założeniami.
4. Reguła przekrojowa: **ASC/MC zawsze pokazywane ze znakiem zodiaku OBOK bramy HD** —
   nigdy zlane. To dwa niezależne podziały koła (znaki 12×30° od 0° Barana; bramy 64×5.625°
   od 302°). Sama brama HD myli, ukrywając granicę znaku.

---

## 3. Architektura — cztery elementy

Kolejność realizacji: **① → ② → ③ → ④** (fundament uczciwości najpierw; ④ zależne od danych).

### ① Siatka niepewności (C) — fundament
- Pole profilu `czas_zrodlo: 'dokladny' | 'przyblizony' | 'rektyfikowany'`.
- Przy braku dokładnej godziny: umowna 12:00 **niecichа** (jawny status), plus
  **lista pól niepewnych generowana z pomiaru** (nie z założeń): dla każdego pola
  status + informacja „który system to czyta i co bez tego odpada".
- `regulator9` (9b) nie przepuszcza profilu poza piaskownicę bez tej listy.
- Zależność: `obliczDaneSurowe` liczy osie/pars fortunae/nakszatry, ale `generujProfil`
  zapisuje tylko `{jd_et, pozycje}` — do rozstrzygnięcia, czy osie mają wejść do profilu.

### ② Alarm czułości — nakładka na QAC
- Dla **podanej** godziny liczymy odległość ASC i MC do najbliższej granicy bramy/linii,
  **w jednostkach zegara (s/min)** — bo to odpowiada „błędowi minuty" (np. pomyłka lekarza).
- Jeśli bliżej niż próg (zmienna konfiguracyjna) → wynik QAC dostaje flagę „czułe na błąd
  minuty" + propozycję QRT.
- Domyślne 12:00 przy wpisie QAC pokazuje komunikat „podaj dokładną godzinę → przejdź do QRT".

### ③ Naprawa metody geometrycznej (B)
- Dodać ASC/MC do dopasowania (jedyne osie czułe na godzinę).
- Zawęzić do aspektów osi zamiast wszystkich 169 par.
- Przeskalować `pewnosc`: brak sygnału = niska pewność.
- **Test-strażnik**: czas wylosowany MUSI dostać niską pewność (obalenie feralnego 0.70).

### ④ Rektyfikacja przez rozpoznanie jakościowe (kontrastowe)
- Drugi, niezależny sygnał — nie wymaga wydarzeń życiowych (istotne dla profilu dziecka).
- Prezentujemy **kontrast** jakości bram/linii/znaków kandydatów w oknie niepewności
  (nie portret pojedynczy — to broni przed efektem Barnuma/potakiwaniem).
- Wynik = **ludzkie rozpoznanie i wybór**, zapis `czas_zrodlo: 'rektyfikowany'` + jawna
  podstawa; ląduje w dzienniku trafności NEXUS (kalibracja wzajemna), weryfikuje się z życiem.
- **Zakaz**: sygnał miękki NIE produkuje liczbowej `pewnosc`.
- Zależność: dane „legenda jakości bram/linii" (patrz §6).

---

## 4. Narzędzie — interaktywna oś czasu

- **Dwie warstwy**: zodiak + bramy HD (+ linie przy dużym zoomie), dla ASC/MC.
- **Przewijanie** lewo/prawo; **kursor odczytu na środku** (timeline przesuwa się pod stałym
  kursorem); osobny marker podanej godziny.
- **Suwak powiększenia** (± 5 min … 6 h). Domyślnie dla profilu brzegowego A: środek na 09:44, ± 1 h.
- Kursor pokazuje znak, bramę.linię każdego pola oraz odległość ASC do granicy bramy w sekundach.
- Kierunek (NIE teraz): wygląd analityczny jak narzędzia traderów (crosshair, warstwy, zoom).

Prototyp interaktywny istnieje (dane 00:00–06:00 z modułów QAC).

---

## 5. Wejście do QRT — dwie osie decyzji (UI)

Czytelność: oba wybory zawsze w **jednym zdaniu na górze** (pasek podsumowania), pod spodem
dwa ponumerowane kroki.

- **Krok 1 — Co wiesz o godzinie?** (segmentowany wybór):
  - *Dokładna* → pole godziny; QRT zbędny, zostaje tylko alarm ② (czułość ASC).
  - *Przybliżona* → pole godziny + okno niepewności **± 5 / 15 / 30 min / 1 h / 2 h**.
  - *Nieznana* → znika godzina; pojawia się wybór **pory doby** (Rano 6–12 / Przedpołudnie 9–12 /
    Popołudnie 12–18 / Wieczór 18–24 / Noc do północy 21–24 / Noc po północy 0–6), ~6 h.
- **Krok 2 — Jaką drogą?** (jawny wybór, oznaczony):
  - *Geometryczna* (③) — plakietka „wymaga wydarzeń".
  - *Porównanie jakości bram* (④) — plakietka „bez wydarzeń"; dla profilu dziecka **zalecana**.
- Wybrane okno zasila oś czasu (§4).

Prototyp mockup istnieje.

---

## 6. Dane bram HD — dwie warstwy o różnym statusie prawnym

- **Warstwa strukturalna** (brama ↔ heksagram, brama ↔ stopień zodiaku, centrum/kanał):
  deterministyczna, otwarta; częściowo już w repo (`config/bramki.js`), reszta w projektach
  MIT (hdkit, MCP_Human_design).
- **Warstwa jakościowa (legenda)**: nazwy/opisy HD wywodzone z prac Ra Uru Hu / Jovian Archive —
  **objęte prawami autorskimi**; „cheat-sheety" swobodnie czytelne, ale nie do przejęcia.
- **Rozwiązanie (surowe źródło publiczne):** numer bramy HD = numer heksagramu I Ching
  (King Wen). I Ching ma tłumaczenia w domenie publicznej (Legge, 1899). Budujemy **własną**
  legendę jakości na publicznym I Ching, keyed „brama N = heksagram N" — zamiast kopiować
  treści HD. To realizuje kierunek „własny system interpretacyjny na surowych danych".
- **Do zrobienia (przy ④):** scaffold `64 bramy → {stopień zodiaku (mamy), heksagram + Legge (PD),
  centrum/kanał (MIT), POLE na własny opis}`.

---

## 7. Punkty otwarte (jawnie, blokują tylko swoje elementy)

- **OP-1 (②)** Polityka precyzji adresu: gruby poziom (które miasto — duplikaty Nominatim = do
  21 min błędu ASC) rozbrajany zawsze z góry; drobny poziom (dokładny budynek) żądany tylko gdy
  margines ASC jest rzędu niepewności adresu (sterowane alarmem). — decyzja Suwerena zawieszona.
- **OP-2 (④)** Źródło i zakres legendy jakości bram (scaffold I Ching Legge) — osobny, duży temat.
- **OP-3 (①)** Czy osie/pars fortunae/nakszatry wchodzą do zapisu profilu.

---

## 8. Kolejność implementacji i DoD

1. **① + fundament metryki** (TDD): pole `czas_zrodlo`, lista pól niepewnych z pomiaru,
   bramka 9b. Test-strażnik uczciwości metryki (losowy czas = niska pewność) — wspólny z ③.
2. **② Alarm czułości**: funkcja odległości ASC/MC do granicy w sekundach, próg konfigurowalny,
   komunikat 12:00. Testy: profil brzegowy A (ASC ~9 s → alarm), przypadek środka bramy (brak alarmu).
3. **③ Metoda B**: osie w dopasowaniu, aspekty osi, przeskalowanie pewności. Test-strażnik.
4. **④ Rozpoznanie jakościowe**: po dostarczeniu danych §6; kontrast kandydatów, wybór człowieka,
   zapis do dziennika NEXUS; zakaz liczbowej pewności.

DoD każdego elementu: testy TDD zielone; jawny status zamiast cichych defaultów; zatwierdzenie
Suwerena przed zapisem punktów otwartych (reguła roadmapy). Zmiany niecommitowane bez zlecenia.

## 9. Fixture i weryfikacja
Profil brzegowy A jako przypadek testowy: (a) ② alarm musi się odezwać (ASC ~9 s od granicy);
(b) przy chudych wydarzeniach ③ metryka musi uczciwie powiedzieć „za mało danych"; (c) ④ ma dać
czytelny kontrast bram 19 vs 13 (i znaków Wodnik vs Koziorożec). Skrypty pomiarowe w scratchpadzie sesji.
