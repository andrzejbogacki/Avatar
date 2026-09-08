> **Adnotacja przy wgraniu, 08.09.2026.** Poniżej zapis dosłowny Ziarna v12.
> Jedno miejsce jest wyprzedzone przez kanon: sekcja 1.2 opisuje trzy formaty
> kształtu, a ADR-011 punkt 2.3 zna dwa typy kanoniczne — obrys pobrany
> z realnych map jest sposobem narysowania wielokąta, nie trzecim typem.
> Przy sprzeczności obowiązuje ADR, nie Ziarno.

# ZIARNO TRANSFERU v12
**FRAZA KONTROLNA: MODRZEW-SZAFRAN-63-BRODZIK**
Źródło: wątek wyrosły z Ziarna Transferu v11 (fraza WRZOS-CYNOBER-17-LATARNIA).
Powód zamknięcia: domknięcie wszystkich decyzji przy stole dla Strażnika GPS.
Zakres wątku: Strażnik GPS — pełny przegląd kontekstu i dwanaście rozstrzygnięć; rewizja struktury planszy.
Data: 26.08.2026
Panel: 12
---
## 1. ZATWIERDZONE W TYM WĄTKU
### 1.1 Wariant A — kanon
**Werdykt liczy telefon.** Na zewnątrz wychodzi wyłącznie jedno słowo: `obecny` albo `duch`. Współrzędne nigdy nie opuszczają urządzenia.
Wariant B odrzucony jako **niewykonalny**, nie jako gorszy — przesłanka Dyrektora mówi, że plansza nie zawsze będzie miała węzeł, więc nie ma komu liczyć.
Wariant C (mieszany) rozpatrzony i odrzucony — dwie ścieżki kodu, wyjątek wypadający na planszach najczęściej używanych (kluby, sale), tryb planszy jako nowy cel ataku.
**Furtka rozbudowy — doprecyzowanie:** dotyczy dokładania dowodów (świadkowanie, nowe źródła). Oddanie liczenia węzłowi to powrót do wariantu B i wymaga osobnej decyzji, nie mieści się w słowie „rozbudowa".
**Zamyka konflikt z v11 §2.1.** Wariant A był tam błędnie traktowany jako ustalony bez decyzji.
### 1.2 Kształt planszy
**Trzy formaty, jeden mechanizm — figura plus bufor:**
| Format | Zastosowanie |
|---|---|
| punkt + promień | dom, klub (np. 50 m) |
| wielokąt rysowany na mapie | granica nieregularna |
| obrys pobrany z realnych map + bufor | dzielnica, Trójmiasto (np. 500 m) |
Punkt z promieniem = figura zerowymiarowa z buforem. Ręczny wielokąt = figura z buforem zero. Telefon liczy zawsze tak samo.
**Bufor osobno od kształtu** — decyzja Dyrektora, powód: uniknięcie namnażania się podobnych plansz. Jedna plansza, wiele progów. Trójmiasto istnieje raz.
**Nazwa: `bufor planszy`** (w kodzie `bufor_planszy`). Odrzucone: „bufor GPS" (sugeruje kompensację błędu pomiaru — to inna wielkość), „otulina". Termin „tolerancja błędu" zostaje wolny na margines pomiarowy przy testach.
**Optymalizacja wierzchołków:** błąd uproszczenia musi być zapisany i bezpieczny sam z siebie, bez liczenia na zapas bufora (bufor jest zmienny, więc nie stanowi gwarancji).
**Narzędzia wymagane** (nie należą do Strażnika, należą do konfiguracji planszy): rysowanie na mapie, import obrysów z realnych map, optymalizacja dokładności pod transfer danych.
**Zależność zewnętrzna nazwana:** obrysy realnych granic pochodzą spoza sieci suwerennej. Lekarstwo — pobranie jednorazowe przy tworzeniu planszy, uproszczenie, podpis. Żadnych zapytań na żywo. Mapa zewnętrzna jest źródłem startowym, nie zależnością działania.
### 1.3 KSZTAŁT NIEZMIENNY — zamrożenie przy wyjściu z piaskownicy
**Kluczowe rozstrzygnięcie wątku.** Kształt zamrożony w momencie wyjścia z piaskownicy. **Bez drogi powrotnej.**
Poprawki dowolne dopóki plansza siedzi w piaskownicy. Wyjście = akt podpisu. Jeden podpis, jedna data, jedna wersja.
**Skasowane tym jednym cięciem:**
- numery wersji kształtu
- rejestr zmian kształtu
- atak przez cofnięcie (downgrade)
- rozwidlenie „najnowsza vs najwyższa wspólna wersja"
- reguła „gra trzyma się wersji, na której ruszyła" (wersja jest jedna)
- negocjowanie, kto ma nowszą kopię
**Odcisk kształtu = tożsamość planszy.** Skoro kształt nigdy się nie zmienia, jego odcisk jest jego nazwą. „Ta sama plansza" i „ten sam kształt" to jedno zdanie. Porównanie przed startem trywialne, wykonalne głosem.
**Synchronizacja upraszcza się do:** kształt albo go masz, albo nie. Nie istnieje stan „masz stary".
**Zmiana geometrii po latach** = nowa plansza ze wskazaniem na poprzedniczkę (mechanizm rodowodu, zatwierdzony w v11).
**Zgodność z kanonem:** ta sama figura co konwencja `zamrożony_vN`.
### 1.4 Podpis kształtu
**Podpisuje właściciel planszy swoim kluczem Awatara.** Plansza nie dostaje własnego rodzaju klucza — dziedziczy tożsamość człowieka, który ją postawił. Mniej bytów, widać kto za planszą stoi.
**Zakres podpisu — sześć rzeczy:**
1. identyfikator planszy (inaczej podpis da się przykleić do innej planszy)
2. kształt uproszczony — ten, który telefon naprawdę liczy
3. wersja kształtu
4. błąd uproszczenia
5. **źródło dowodu wraz z tożsamością nadajnika**
6. widełki bufora (domyślny i maksymalny)
**Poza podpisem:** konkretny bufor wybrany dla danej gry. Telefon sprawdza tylko, czy mieści się w podpisanych widełkach.
**KOREKTA WŁASNA odnotowana:** wcześniej w wątku zapisałem, że podpis nie obejmuje źródła dowodu. Błąd — **atak przez obniżenie**: napastnik zmienia „terminal" na „brak" i melduje się bez kotwicy. Nie musi niczego łamać, wystarczy osłabić wymaganie.
**Zasada ogólna:** pod podpisem jest wszystko, czego zmiana daje napastnikowi przewagę. Poza podpisem tylko to, co mieści się w granicach już podpisanych.
**Otwarte:** ważność podpisu po rotacji klucza (patrz §2).
### 1.5 Źródło dowodu obecności
**Nazwa zatwierdzona, trzy poziomy:**
- glosariusz: `Źródło dowodu obecności`
- mowa i dokumenty: `Źródło dowodu`
- kod: `zrodlo_dowodu`
Odrzucone: „Kotwica" (nieintuicyjne — decyzja Dyrektora), „Świadek planszy" (kolizja z telefonem-świadkiem).
**Obowiązkowe pole planszy. Trzy wartości:**
| Wartość | Siła | Uwagi |
|---|---|---|
| terminal | najmocniejsza | wymaga dotknięcia, działa bez baterii telefonu |
| nadajnik | średnia | latarnia Bluetooth, podpisany sygnał ze znacznikiem czasu |
| brak | deklaracja | sam GPS; werdykt jest oświadczeniem Awatara |
**Reguła wymuszona geometrią:** nadajnik jest wymagany wtedy i tylko wtedy, gdy błąd GPS jest porównywalny z rozmiarem kształtu. **Mała plansza nie może mieć wartości „brak".**
**Zasada do kanonu:** siła meldunku zależy od źródła dowodu planszy, nie od samego Strażnika.
### 1.6 Nadajnik planszy — technika i rola
**KOREKTA WŁASNA (dwukrotna w wątku):** zapisałem „nadajnik przestaje cię słyszeć". Sprzeczne z kanonem. **Nadajnik nikogo nie słyszy.** Telefon wyłącznie nasłuchuje. Poprawne zdanie: *telefon przestaje słyszeć nadajnik*.
**Nadajnik to latarnia morska.** Świeci w ciemność, nie wie kto patrzy. Nie prowadzi listy — zabranie nadajnika daje napastnikowi możliwość podszywania się pod planszę, ale **zero informacji o tym, kto na niej bywał**.
**LoRa odrzucona — dwa niezależne powody:**
1. **Twardy:** żaden zwykły telefon nie ma odbiornika LoRa. Wymagałoby noszenia dodatkowego pudełka → sprzęt decydowałby o przynależności (zakazane kanonem).
2. **Skala:** LoRa sięga kilometrów, kształt planszy to sala lub budynek. Latarnia świecąca dziesięć razy dalej niż granica nie potwierdza niczego.
LoRa ma miejsce w projekcie, ale inne: kanał **między węzłami** w stanie docelowym bayo, nie między planszą a człowiekiem.
**Przyjęte: Bluetooth w trybie rozgłaszania.** Zasięg dziesiątek metrów = skala pomieszczenia. Każdy telefon odbiera bez dodatkowego sprzętu. Paczka maleńka, ale nadajnik niesie tylko podpis i znacznik czasu.
**Bonus:** ten sam aparat co warstwa druga Lejka trójstopniowego. Nie dokładamy nowej techniki, używamy istniejącej w drugiej roli.
**Rozszerzenie:** nadajnik może nieść bieżący numer wersji kształtu — samo stanie na planszy mówi, czy kopia jest stara. Napastnik nie podrobi (brak klucza). Działa tylko na małych planszach.
### 1.7 Struktura planszy — rewizja
**Ustalenie Dyrektora:** plansza to **sam kształt**. Zawartość — punkty, atrakcje, ciekawostki, lokale i obiekty partnerów respektujące Protokoły Suwerenności — jest niezależna.
**Diagnoza błędu (mojego):** traktowałem planszę jak worek — kształt i wszystko razem. Przy „kształcie niezmiennym" ta pomyłka zabolała, bo zamrożenie kształtu wyglądało na zamrożenie całej planszy na zawsze.
**Kanon już to rozstrzygał:** plansza to obszar trwały, gra to wydarzenie na nim. Nie zastosowaliśmy tego o piętro niżej.
**Plansza trzyma listę wskazań, nie treści.** Zna adresy, nie opisy. Klub zmienia godziny co tydzień — gdyby opis siedział w planszy, plansza zmieniałaby się co tydzień.
**Skutki:**
- kształt niezmienny przestaje boleć — zamraża geometrię, nie życie
- rejestr zmian schodzi z planszy na listę atrakcji, gdzie zmiany naprawdę zachodzą
- nikt nie potrzebuje klucza właściciela planszy, żeby dodać swoje miejsce; **każdy punkt podpisuje się sam**
- Strażnik GPS nie widzi atrakcji — cała ta warstwa może powstawać niezależnie
**O dopisaniu punktu decyduje Protokół Suwerenności**, nie właściciel planszy. Właściciel przestaje być bramkarzem. Zależność: PS jako kod to pozycja druga w kolejności rozwoju — do tego czasu lista atrakcji będzie otwarta dla wszystkich. Strażnika nie blokuje.
**Wskazanie donikąd** (punkt zniknął) = telefon pomija, plansza bez zmian. Brak odpowiedzi to cisza, nie błąd.
**Czwarte wystąpienie tej samej figury:** szablon i wystąpienie, plansza i gra, kształt i atrakcje. Trwałe osobno, zmienne osobno.
### 1.8 Węzeł jako magazyn kształtów
**Zatwierdzone: węzeł = magazyn, nigdy sędzia.** Tam gdzie stoi, trzyma kształty i rozdaje na żądanie. Nie liczy pozycji, nie orzeka.
Bez węzła wszystko działa tak samo, tylko kształt rozchodzi się wolniej, między telefonami.
**Węzeł nie musi być zaufany** — podpis broni danych, więc magazyn może być zwykłym składem.
### 1.9 Rozchodzenie się kształtów
**Rozstrzygnięcie Dyrektora:** znajomi umawiający się na grę i tak muszą się zsynchronizować przed startem. Wtedy ten, kto ma najnowszą wersję, wymienia dane dowolnym kanałem — Bluetooth, WiFi, internet, mesh.
**KOREKTA WŁASNA:** wcześniej proponowałem bayo jako kanał dla wiadomości o kluczach. Wycofane. Sięgnąłem po bayo, bo już istnieje — złe uzasadnienie. bayo doręcza do konkretnego odbiorcy po `avatar_id`; wiadomość o unieważnieniu ma dotrzeć do wszystkich, którzy trzymają plansze danego właściciela, a nadawca nie wie kto to jest. **To rozgłoszenie, nie przesyłka.**
**Zasady zatwierdzone:**
- transport obojętny
- najnowsza wersja wygrywa przy synchronizacji *(po §1.3 w praktyce bezprzedmiotowe — wersja jest jedna)*
- **unieważnienie klucza bije numer wersji**
**Otwarte:** kto podpisuje samo unieważnienie. Kandydat logiczny — **krąg poręczycieli** (rotacja kręgu i procedura odzyskania figurują w kanonie od v10). Weryfikacja: blokada techniczna.
### 1.10 Droga werdyktu
**Zatwierdzone: ogłoszenie jako podstawa, odpytywanie jako wyjątek.**
Telefon sam ogłasza zmianę stanu (`obecny` ↔ `duch`). Cisza znaczy „bez zmian". Kilka komunikatów zamiast setek pytań — mniejsze zużycie baterii, nikt nie jest centralą.
**Odpytywanie wyłącznie w momencie rozstrzygającym** — zamknięcie etapu, przyznanie nagrody, wejście w kolejną fazę. **Wyłącznie przez Mistrza Gry. Nigdy cyklicznie** (zakaz zapisany wprost, nie liczymy na rozsądek).
**Uzasadnienie odrzucenia czystego odpytywania:** musi być ktoś, kto pyta — jego telefon staje się centralą. To odtwarza węzeł w postaci człowieka.
**Koszty nazwane:**
- dwie ścieżki doręczenia (ale jedna ścieżka liczenia — to samo słowo, ten sam werdykt, to samo miejsce)
- kierunek pytania rozstrzyga o wycieku — sam moment zapytania ujawnia, że coś się dzieje i kogo dotyczy; stąd ograniczenie do Mistrza Gry
- pokusa rozrostu do cykliczności
**Luka nieusuwalna:** cisza rozładowanego telefonu wygląda identycznie jak cisza „bez zmian". Domyka to istniejący licznik dwóch godzin.
### 1.11 Brak telefonu i rozładowanie
**Rozładowany telefon nic nie wyśle — prawda niezależna od wszystkich wyborów.**
**Rozróżnienie kluczowe:** system nie dowiaduje się, że wyszedłeś. Dowiaduje się, że **przestałeś potwierdzać**. Dwa różne fakty, nie wolno ich sklejać. Dlatego wyjście ma okno 5 min (jest werdykt), a cisza ma 2 h (werdyktu nie ma).
Rozładowanie wygląda identycznie jak wyłączenie celowe. Nie da się rozróżnić i nie warto próbować.
**Bez telefonu Strażnik nie działa** — nie ma czym liczyć. Zostaje terminal (poziom pierwszy hierarchii). Dotknięcie opaską nie potrzebuje baterii Awatara.
**Terminal daje punkt, nie ciągłość.** Wie że przyszedłeś, nie wie że wyszedłeś. Meldunek bez telefonu gaśnie wymeldowaniem przy terminalu albo upływem ważności sesji.
**Zapis twardy:** plansza bez terminala + Awatar bez telefonu = obecności nie da się ustanowić. Nie ma czym.
**Propozycja (niezatwierdzona):** padnięcie telefonu nie gasi meldunku, tylko **zsuwa go o poziom niżej** — ze Strażnika na ważność sesji. Odbicie przy terminalu przywraca mocniejszy poziom.
**Rozdział warstw obowiązuje:** rozładowanie gasi meldunek, nie grę. Awatar zostaje uczestnikiem. Traci to, co żyje na ekranie — ogłoszenia, soundtrack, komunikaty. **Gra decyduje, czy „duch" wyklucza z rozgrywki** — to pole gry, nie Strażnika.
### 1.12 Terminal a uprawnienia — rozdzielenie
**Terminal potwierdza obecność. Nie daje dostępu do niczego.** Uprawnienia rozstrzyga Protokół Relacji.
Bez tego rozdzielenia terminal staje się kluczem do drzwi — kto zdobędzie cudzą opaskę, ten wchodzi.
**Trzy warunki dla terminala na dużej planszy:**
1. terminal podpisany kluczem właściciela planszy (inaczej ktoś stawia własny w domu)
2. terminal potwierdza obecność **w punkcie**, nie na całej planszy (odbicie w Gdyni ≠ obecność we Wrzeszczu)
3. opaska powiązana z Awatarem, nie z urządzeniem (kanon bayo)
**Ryzyko główne: kradzież opaski.** Bez telefonu nie ma czym potwierdzić, że opaska jest w ręku właściciela. Meldunek staje się dowodem obecności opaski, nie człowieka. **Kanon „weryfikuje się człowieka, nie jego sprzęt" tu trzeszczy.**
**Propozycja (niezatwierdzona):** opaska bez telefonu ustanawia meldunek, ale nie uprawnia do niczego wymagającego tożsamości — wymiany, poświadczeń, dostępu do treści. Ta sama figura co przy nadajniku: sygnał wystarcza do potwierdzenia, nie wystarcza do władzy.
### 1.13 Awaria Mistrza Gry
**Mistrz Gry jest pojedynczym punktem awarii.** Jego telefon pada — nikt nie ogłasza faz, nikt nie może zapytać w momencie rozstrzygającym. Gorzej niż rozładowanie uczestnika: uczestnik traci swój meldunek, Mistrz zatrzymuje całą grę.
**Rekomendacja (niezatwierdzona): kolejność następców + tryb okrojony.**
- lista następców ustalana przed startem (pole misji, nie nowy mechanizm)
- po wyczerpaniu listy gra biegnie dalej bez Mistrza — ogłoszenia działają same, bo idą od telefonów uczestników; znika sterowanie fazą i możliwość zapytania
**Zasada do zapisu:** żadna rola nie może zatrzymać gry swoim milczeniem. Milczenie roli zsuwa grę na niższy poziom funkcjonowania, nie kończy jej.
### 1.14 Telefon-świadek — osłabiony i odłożony
Pomysł: dwa telefony widzą się przez Bluetooth, oba twierdzą że są na tej samej planszy, wzmacniają się.
**Dziura: zmowa.** Dwóch Awatarów może kłamać razem. Nadajnika nie da się przekonać (nie ma woli). Człowieka da się.
**Reguła ratująca pomysł:** świadek jest wart tyle, ile jego własna kotwica, **minus jeden poziom**. Świadek z terminalem — mocny. Świadek z nadajnikiem — średni. Świadek z samym GPS — nic (dwa oświadczenia to nadal oświadczenie, tylko głośniejsze). Łańcuch świadków słabnie z każdym ogniwem — dowód nie może po drodze urosnąć.
**Wniosek:** to nie nowy poziom hierarchii, tylko **mechanizm przenoszenia poziomu ze stratą**. Hierarchia zostaje trzypoziomowa.
**Dwa problemy:**
- świadkowanie wymaga, żeby telefon **nadawał**. Kanon mówi „telefon wyłącznie nasłuchuje" — to dotyczy relacji z nadajnikiem, relacja telefon-telefon jest inna. **Możliwy konflikt, do sprawdzenia w źródłach.**
- wymiana identyfikatorów tworzy ślad: kto był blisko kogo. Ten sam problem co wzorzec bywania z Lejka, tylko o ludziach zamiast miejsc. Rozstrzyga Protokół Relacji, Master Fader musi umieć wyciszyć.
**REKOMENDACJA: nie wkładać do pozycji pierwszej.** Zależy od Protokołu Relacji (pozycja druga). Wejście z tym teraz = budowanie mechanizmu, którego nie ma czym ograniczyć. Złamanie zasady „kolejność wyznacza zależność".
### 1.15 Odcisk planszy — mechanizm weryfikacji
**Przed startem każdy uczestnik pokazuje krótki odcisk kształtu.** Sześć znaków, słowo, kolor — cokolwiek, co człowiek odczyta na głos.
Zgadzają się → ta sama plansza. Nie zgadzają się → widać kto odstaje.
**Nie sprawdza, czyja wersja nowsza — sprawdza czy wszyscy mają tę samą.** To jest dokładnie priorytet Dyrektora: *w grze wspólnej najważniejsze, by grali na tej samej planszy.*
Działa bez sieci, bez węzła, bez kodu serwerowego. Można głosem.
**Po §1.3 (kształt niezmienny) odcisk staje się tożsamością planszy**, nie dodatkowym mechanizmem.
**Odrzucone:** centralny rejestr odcisków plansz — rozwiązywałby to samo, ale wprowadzał węzeł do pytania, czyli rozbierał wariant A.
### 1.16 Gry na dużych planszach — warunek brzegowy
**Na dużych planszach telefon jest jedynym źródłem dowodu.** Terminale stoją w punktach, między punktami nie ma nic. Rozładowanie = zniknięcie.
**Trzy wymogi projektowe:**
1. gra trwa krócej niż bateria, albo ma punkty naturalnego ładowania (terminal w kawiarni = miejsce odbicia i postoju jednocześnie)
2. gra nie karze za zniknięcie (kanon v11: misja niezamknięta jest faktem, nie przewinieniem)
3. gra znosi cichy powrót — Awatar znika na godzinę, ładuje, wraca do tego samego miejsca w grze, nie do zera
**Zasada do kanonu:** zasięg planszy wyznacza gęstość terminali. Im większa plansza, tym bardziej gra opiera się na telefonie i tym łagodniej musi znosić jego brak.
---
## 2. OTWARTE — DO PRZENIESIENIA
### 2.1 Nowe w tym wątku
| Punkt | Stan |
|---|---|
| **Ważność podpisu po rotacji klucza** | Trzy warianty postawione (bezterminowa / traci przy rotacji / ważna do daty kompromitacji). **Decyzja nie padła.** Kanon („poświadczenia nie da się wycofać", rodowód trwały) ciągnie ku bezterminowej. Po §1.3 problem lżejszy: skradziony klucz nie przerobi istniejących plansz, może tylko tworzyć nowe |
| Kto podpisuje unieważnienie klucza | kandydat: krąg poręczycieli. **Weryfikacja: blokada techniczna** |
| Wartość skróconego okna wygaszenia | **nie jest decyzją — jest zadaniem testowym.** Metoda: tryb obserwacji, pomiar najdłuższego przypadku jednoczesnego kłamstwa obu źródeł; skrócone okno musi być dłuższe. **Parametr planszy, nie systemu** (piwnica i otwarte pole dadzą inne liczby) |
| Padnięcie telefonu zsuwa meldunek o poziom niżej | propozycja, niezatwierdzona |
| Opaska bez telefonu — meldunek tak, uprawnienia nie | propozycja, niezatwierdzona |
| Kolejność następców Mistrza Gry + tryb okrojony | rekomendacja, niezatwierdzona |
| Telefon-świadek | odłożony za Protokół Relacji; reguła „minus jeden poziom" zapisana |
| Konflikt: „telefon wyłącznie nasłuchuje" a świadkowanie | do sprawdzenia w źródłach |
| Nadajnik niosący numer wersji kształtu | propozycja; po §1.3 wersja jest jedna — do przemyślenia, czy nadal potrzebne |
| Czy plansza może wrócić do piaskownicy | **rekomendacja: nie.** Powrót przywróciłby skasowane problemy. Formalnie niezatwierdzone |
| Rejestr zmian listy atrakcji | wymóg Dyrektora (co/kiedy/przez kogo) przeniesiony z planszy na listę atrakcji. **Struktura niezaprojektowana** |
| Klucze Awatara — czy nadają się do podpisywania kształtów | **Blokada techniczna:** brak dostępu do repozytorium |
| Imię właściciela planszy a Master Fader | ta sama kolizja co rodowód szablonów. **Rozstrzygnięcie musi być jedno dla obu** |
| Geometria: format kształtu w kodzie | okrąg / wielokąt — reprezentacja do zaprojektowania |
### 2.2 Przeniesione z v11, nieruszone
| Punkt | Stan |
|---|---|
| Kolizja rotacji po odzyskaniu | okno 3 dni chroni Awatara przed napastnikiem, ale przy koncie przejętym chroni napastnika przed Awatarem |
| ZNACZNIK TESTOWY: procedura odzyskania + rotacja kręgu | kanon przyjęty logicznie, **niesprawdzony w działaniu** |
| ADR: Quantum Log, Strażnik Relacji, Mission Control | **dochodzi czwarty: ADR Strażnik GPS** |
| Co uruchamia tryb czujności Bluetooth | automat / człowiek / parametr Awatara |
| Czy spacer rezonansowy wymaga planszy | tak / nie / parametr Awatara |
| Nadpisywanie pól szablonu — zakres domyślny | brak reguły domyślnej |
| Certyfikacja PS przy klonowaniu | czy klon może obejść wymóg poświadczonych jakości |
| Wspólny zegar dla soundtracku | kandydat: silnik astronomiczny QAC. Interpretacja, nie ustalenie |
| Źródło dźwięku | pliki Awatara / częstotliwości Rezonatora / usługa zewnętrzna |
| Rezonator Kwantowy: odtwarzanie na żądanie innego modułu | **[BRAK DANYCH]** |
| Cztery zachowania Mission Control | faza przygotowania, widoczny postęp, kierunek i odległość, omówienie po powrocie |
| Przewóz rzeczy przez jadącego | wymiennik w ruchu |
| Wpisy do Mapy 3·6·9 | trzy triady z v11 czekają na weryfikację; **dwie dziewiątki** wymagają sprawdzenia |
| Nazwa Mission Control w kodzie | polski identyfikator bez ogonków |
| Podłączenie bayo do sieci kratowej | **brak decyzji kierunkowej** |
| Misja etapu w Fight.Club | czeka na definicję z Mission Control |
| QAC4: O7, O8, weryfikacja `noaa_swpc.js` | osobny wątek `Transfer_QAC4_O7_O8.md` |
| ADR-010 do repozytorium, `modul.qr` w `rejestr.json` | niewykonane |
| Glosariusz v5: kolejka wpisów, 11 rekordów bez `rozszerzenia` | niewykonane |
| `modul.dziennik.quantum_log` do `rejestr.json` | z v8, nadal niewykonane |
| Awatar bez telefonu chcący maski przy terminalu | częściowo domknięte w §1.11–1.12, formalnie otwarte |
| **Blokada techniczna:** szablon ADR z `pakiet_startowy_claude_code/` | bez zmian |
---
## 3. GLOSARIUSZ — NOWE POJĘCIA Z TEGO WĄTKU
| Termin | Definicja robocza |
|---|---|
| **Źródło dowodu obecności** | pole planszy określające, co potwierdza fizyczną obecność Awatara: terminal, nadajnik albo brak |
| **Bufor planszy** | promień dokładany na zewnątrz figury; osobne pole, zmienne w podpisanych widełkach |
| **Kształt podpisany** | geometria planszy zamrożona przy wyjściu z piaskownicy i podpisana kluczem Awatara właściciela |
| **Nadajnik planszy** | latarnia Bluetooth nadająca podpisany komunikat ze znacznikiem czasu; nikogo nie słyszy, nie prowadzi listy |
| **Błąd uproszczenia** | zapisana wielkość przesunięcia granicy przy optymalizacji wierzchołków |
| **Odcisk planszy** | krótki skrót kształtu; po zamrożeniu = tożsamość planszy |
| **Wskazanie** | referencja planszy do atrakcji; adres, nie treść |
---
## 4. ZASADY POTWIERDZONE
**Nowe w v12:**
- **Awatar liczy sam, ale nie na własnych danych.** Telefon wykonuje całą pracę na materiale, którego nie kontroluje (podpisany kształt, podpis nadajnika).
- **Podpis czyni transport nieistotnym.** Dane bronią się same — nie trzeba ufać drodze.
- **Synchronizacja jeździ na okazji.** Ludzie i tak muszą się zgadać przed grą; przy okazji wyrównują dane. Zero dodatkowej maszynerii.
- **Pod podpisem jest wszystko, czego zmiana daje napastnikowi przewagę.**
- **Unieważnienie bije wersję.**
- **Każda rzecz, która się zmienia, niesie swoją historię ze sobą.** *(trzecie wystąpienie: rodowód szablonów, wersje kształtu, rejestr atrakcji)*
- **Trwałe osobno, zmienne osobno.** *(czwarte wystąpienie: szablon/wystąpienie, plansza/gra, kształt/atrakcje)*
- **Siła meldunku zależy od źródła dowodu planszy, nie od Strażnika.**
- **Świadek jest wart tyle, ile jego kotwica, minus jeden poziom.** Dowód nie może po drodze urosnąć.
- **System nie dowiaduje się, że wyszedłeś — dowiaduje się, że przestałeś potwierdzać.**
- **Żadna rola nie może zatrzymać gry swoim milczeniem.**
- **Zasięg planszy wyznacza gęstość terminali.**
- **Terminal potwierdza obecność, nie daje dostępu.** Sygnał wystarcza do potwierdzenia, nie wystarcza do władzy.
- **Brak odpowiedzi to cisza, nie błąd.**
**W mocy z v8–v11:**
- Automat wykonuje wolę — nie zastępuje jej.
- Kolejność wyznacza zależność, nie ważność.
- Sygnał negatywny wolno, sygnał pozytywny nie.
- Kierunek pytania rozstrzyga o wycieku.
- Weryfikuje się człowieka, nie jego sprzęt.
- Dwa niezależne dowody uprawniają do szybszego rozstrzygnięcia niż jeden.
- Moduł transportowy przenosi, nigdy nie interpretuje.
- Puste pole to informacja, nie brak.
- Rodowodu nie da się wycofać.
- Nie nadzór nad Awatarem, lecz narzędzie Awatara.
- Kolejność budowania ≠ kolejność działania.
---
## 5. STAN STRAŻNIKA GPS
**Wszystkie decyzje przy stole zamknięte.** Zostaje wykonanie.
### Papiery
- ADR Strażnika GPS *(czwarty w kolejce ADR)*
- wpis modułu do `rejestr.json` — bez adresu moduł nie istnieje dla systemu
- siedem pojęć do glosariusza (§3)
### Kod
- dwie funkcje z kontraktu — jedyne wymagane przez bayo:
  ```
  straznik.zameldowaniNaPlanszy(plansza_id)
  straznik.stanAwatara(plansza_id, avatar_id) → 'obecny' | 'duch'
  ```
- wymiana atrapy na moduł *(stan potwierdzony 4.08: moduł nie istnieje w rdzeniu repozytorium — bayo rozmawia z atrapą)*
- nasłuch nadajnika po stronie telefonu
- trzy liczniki: odświeżanie ~1 h, okno wyjścia ~5 min (parametr planszy), utrata sygnału 2 h
- sprawdzenie punktu w kształcie
- weryfikacja podpisu kształtu
### Test
- **tryb obserwacji** na jednej planszy: nic nie gasi, tylko zapisuje. Cel — wartość skróconego okna
- rozgłaszanie i odbiór Bluetooth **przy zgaszonym ekranie na iPhone** *(v11 sygnalizuje mocne ograniczenia)*
- zużycie baterii przy stałym nasłuchu — uwaga: tu nasłuch trwa całą grę, nie tylko na czas misji
### Kolejność wymuszona
Decyzje o kształcie i źródle dowodu przed kodem *(wykonane)*. Weryfikacja kluczy Awatara przed testem podpisu.
### Blokady techniczne
- szablon ADR z `pakiet_startowy_claude_code/` niedostępny *(bez zmian od v10)*
- weryfikacja kluczy Awatara i mechanizmu Rezonatora w repozytorium — brak dostępu z tego poziomu
---
## 6. NASTĘPNA POZYCJA
**Protokół Relacji jako kod** — pozycja druga w kolejności rozwoju.
Dziś atrapa mówiąca „dozwolony" każdemu. Rozstrzyga:
- do kogo idą ogłoszenia Strażnika
- kto widzi listę atrakcji planszy
- kto może dopisać punkt
- czy telefon-świadek wchodzi do systemu
---
## 7. PLIKI WYGENEROWANE W TYM WĄTKU
- `Ziarno_Transferu_v12.md` — niniejszy dokument
