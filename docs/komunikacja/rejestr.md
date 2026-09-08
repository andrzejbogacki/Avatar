# Rejestr komunikacji Nexus ↔ Suweren

Kategorie tarć: R — brak rekomendacji · E — etykieta dwuznaczna · O — domysł zamiast odczytu ·
D — zła długość modułu · G — wyciek grzeczności · Z — żargon, zdanie niezrozumiałe.
Trafienie = decyzja przyjęta jednym słowem za pierwszym razem.
Wzorzec zgłaszany po powtórzeniu litery w trzech panelach. Litera nie powstaje po jednym wystąpieniu.

## Tablica

| Panel | Data | Model | R | E | O | D | G | Z | Tarcia razem | Trafienia |
|---|---|---|---|---|---|---|---|---|---|---|
| 13 | — | Opus 5 | 2 | 0 | 0 | 0 | 0 | 0 | 2 | — |
| 14 | 27.08.2026 | Opus 5 | 1 | 2 | 2 | 0 | 0 | 0 | 5 | — |
| 15 | 08.09.2026 | Opus 5 | 1 | 1 | 5 | 1 | 0 | 0 | 8 | 20 |
| 15 | 08.09.2026 | Fable 5.1 | 0 | 0 | 2 | 0 | 0 | 0 | 2 | 2 |
| 16 | 09.09.2026 | Opus 5 | 0 | 3 | 0 | 0 | 0 | 0 | 3 | 3 |

## Dziennik

| Data | Panel | Model | Kat. | Co się stało | Reguła przyjęta |
|---|---|---|---|---|---|
| — | 13 | Opus 5 | R | pytanie o kolejność bez rekomendacji, dwukrotnie → prośba o ponowne wyświetlenie opcji | rekomendacja obowiązkowa |
| 27.08.2026 | 14 | Opus 5 | R | pytanie o kolejność porządków bez rekomendacji, trzecie powtórzenie | j.w. — wzorzec potwierdzony |
| 27.08.2026 | 14 | Opus 5 | E | etykieta „jeden klucz, jedno urządzenie" dwuznaczna → decyzja wybrana i cofnięta | etykiety pisane dla odbiorcy |
| 27.08.2026 | 14 | Opus 5 | E | pytanie o spisanie ADR-u zabrzmiało jak oferta wgrania, bez dostępu do repozytorium | nazywać jawnie, czego Nexus nie może |
| 27.08.2026 | 14 | Opus 5 | O | plan inwentaryzacji pominął Mac Mini; leżało tam 25 niewypchniętych commitów | stan maszyn z odczytu |
| 27.08.2026 | 14 | Opus 5 | O | rekomendacja wypchnięcia gałęzi mimo ostrzeżenia w jej nazwie | nazwa gałęzi to sygnał, nie szum |
| 08.09.2026 | 15 | Opus 5 | O | blokada wgrywania czytana szerzej niż brzmiała, przez dwa panele | blokada dotyczy tego, co nazwano, nie więcej |
| 08.09.2026 | 15 | Opus 5 | O | instrukcje plikowe wydane dla Mac Mini, gdy Andrzej pracował z MacBooka; plik pobrany na złej maszynie | żadnych ścieżek bez potwierdzonej maszyny |
| 08.09.2026 | 15 | Opus 5 | R | polecenie „przenieś z Downloads" bez ustalenia, gdzie plik faktycznie leży | odczyt przed poleceniem |
| 08.09.2026 | 15 | Opus 5 | E | „wklej polecenie" zrozumiane jako „wklej dokument"; potrzebna tura wyjaśniająca | rozróżniać jawnie: polecenie vs treść |
| 08.09.2026 | 15 | Fable 5.1 | O | ścieżka ADR w CLAUDE.md wpisana z pamięci; katalog nie istnieje | ścieżki wyłącznie z odczytu drzewa |
| 08.09.2026 | 15 | Fable 5.1 | O | drugi CLAUDE.md znaleziony przed zapisem, zgłoszony dopiero po | przed zapisem pliku konfiguracyjnego: find po nazwie w całym repozytorium |
| 08.09.2026 | 15 | Opus 5 | O | reguła granicy wielokąta przyjęta przez analogię do okręgu i wypchnięta w kodzie jako „wniosek logiczny", zanim ADR ją rozstrzygnął | kanon przed kodem: brakującą regułę stawia się jako decyzję do Suwerena w tej samej turze, nie jako komentarz w pliku |
| 08.09.2026 | 15 | Opus 5 | O | w uzasadnieniu rekomendacji: „trzy z czterech źródeł prawdy wróciły do repozytorium"; z odczytu wynikały dwa wiersze na cztery, dwa nadal wskazują pliki nieistniejące | liczby w uzasadnieniu też z odczytu, nie z rozpędu |
| 08.09.2026 | 15 | Opus 5 | O | mapa projektu zapisana przez parser JSON: przeformatowany cały plik zamiast jednej wartości, 191 linii różnicy zamiast jednej | zmiana punktowa w tekście; przed zapisem sprawdzić, co narzędzie zrobi z resztą pliku |
| 08.09.2026 | 15 | Opus 5 | D | różnica przed i po utonęła w długim raporcie; Suweren musiał poprosić o nią drugi raz, osobno | to, o co poproszono, idzie samo i pierwsze; reszta raportu po nim albo wcale |
| 09.09.2026 | 16 | Opus 5 | E | „bezpiecznik czasowy" nazywał dwie wielkości o przeciwnym statusie: kanon dwóch godzin z punktu 2.8 i parametr organizatora z punktu 2.9 | jedna nazwa na jedną wielkość; nazwa pasująca do obu nie rozstrzyga, która jest nastawiana |
| 09.09.2026 | 16 | Opus 5 | E | gołe słowo „sesja" w pięciu znaczeniach naraz: gra, logowanie, ważność meldunku, praca z Claude Code, emisja Rezonatora | pięć pełnych nazw, gołe słowo zakazane |
| 09.09.2026 | 16 | Opus 5 | E | „sesja programowa" poprawiona w CLAUDE.md na „sesja pracy", podczas gdy nazwy plików Ziaren niosą dalej PROGRAM | nazwa pliku jest identyfikatorem zamkniętego zapisu, nie tekstem dokumentu — reguła nazewnicza jej nie obejmuje |
| 09.09.2026 | 16 | Opus 5 | — | trzy zatrzymania Code przed dopisaniem czegoś, czego kanon nie daje: czas ważności meldunku bez telefonu, piąte znaczenie słowa sesja, brak liczby dla wieku Ostatniego dowodu Awatara. Wszystkie trzy słuszne | trafienia, nie tarcia — zatrzymanie przed konfabulacją jest wykonaniem reguły |
| 09.09.2026 | 16 | Opus 5 | E | **wzorzec:** litera E po raz trzeci w trzech kolejnych panelach — 14, 15, 16. To nie jest pojedyncze wystąpienie, tylko stała słabość nazewnicza | nazwę sprawdza się na dwuznaczność przed zapisem do kanonu, nie po zgłoszeniu przez Suwerena |
