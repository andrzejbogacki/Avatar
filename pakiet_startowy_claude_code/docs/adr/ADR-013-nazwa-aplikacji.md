# ADR-013: Nazwa aplikacji — The Source / Źródło
- **Data:** 2026-09-21
- **Status:** zatwierdzony
- **Decydent:** Suweren (Andrzej Bogacki)

## Kontekst
Powstająca aplikacja potrzebuje jednej nazwy dla wszystkich rynków. „Projekt Avatar" jest nazwą projektu, nie produktu. Wcześniejszy roboczy kandydat „Link Essence" nie został zatwierdzony. Analiza nazwy w trzynastu punktach zamknięta 2026-09-21 (Ziarna v18–v20, wątek 4).

## Decyzja
Nazwij aplikację **The Source** — jedną nazwą uniwersalną dla wszystkich rynków, z przedimkiem „The" w adresie internetowym i w mowie. W każdym komunikacie do odbiorcy podawaj słowo „źródło" w jego języku (Źródło, Die Quelle, La Fuente). Pierwszym zdaniem aplikacji jest pozycja 1 rejestru WARUNKI ŹRÓDŁA: **Źródło żywych relacji**.

### Zasady wynikowe
1. Adres internetowy i nazwa w sklepie z aplikacjami — bez znaków diakrytycznych.
2. Nazwa pokrywa się z hasłem „Źródło" w glosariuszu, nie konkuruje z nim: hasło definiuje stan każdej struktury wolnej od Błędnego Kodu. Aplikacja jest Źródłem tak długo, jak długo nie zawiera Błędnego Kodu — każdy ciemny wzorzec, manipulacja uwagą lub ukryte pobranie danych obala nazwę.
3. Wielość znaczeń („źródło prawdy", „źródło dowodu", „źródło danych", „kod źródłowy") jest zasobem komunikacyjnym, nie kolizją. Rezerwacja gołego słowa na wzór ADR-010 nie obowiązuje w warstwie językowej i dokumentowej.
4. W kodzie identyfikatory pól dostają przedrostek modułu, żeby wyszukiwanie po słowie „zrodlo" nie zwracało trafień niezwiązanych z aplikacją.
5. Kryteria nazewnicze zdane: test babci (słowo zrozumiałe bez tłumaczenia) oraz zamknięcie obiegu (źródło pobiera wodę z ziemi i ją wypuszcza, woda wraca deszczem — widoczny punkt obiegu zamkniętego).
6. Kryterium oceny nazwy przy dystrybucji poza mainstreamem: zapamiętywalność po jednym usłyszeniu i powtarzalność bez błędu, nie unikalność i wyszukiwalność.
7. Znak graficzny niesie to, czego słowo nie niesie w japońskim i koreańskim. Wymogi: wypływ wody i warstwa pod spodem naraz; czytelny bez podpisu, w jednym kolorze, w rozmiarze ikony; bez litery i słowa w środku; barwy z palety osi 3·6·9, bez czerwieni. Kształt znaku — poza tym ADR.

## Alternatywy odrzucone
- **Link Essence** — kandydat roboczy, zastąpiony.
- **Nexus** — nie zdaje testu babci, sprzeczny z definicją projektu, koliduje z nazwą wewnętrznej persony.
- **Źródło jako jedyna nazwa** — znaki Ź, ó i zbitka „dł" nie do wymówienia i zapisania poza Polską.
- **Source bez przedimka w adresie** (wariant B) — adres i nazwa różnią się jednym słowem.
- **Source bez przedimka wszędzie** (wariant C) — forma bardziej pospolita.

## Konsekwencje
- **Pozytywne:** jedna nazwa wymawialna na całym świecie; znaczenie dociera do odbiorcy we własnym języku; nazwa działa jako warunek sprawdzalny w kodzie.
- **Koszty:** słowo pospolite — słaba ochrona prawna samej nazwy słownej; przedimek bywa gubiony przy wpisywaniu adresu.
- **Warunek otwarty:** dostępność domen i kolizje znaków towarowych niesprawdzone (O-N2). Zajęty adres z przedimkiem przywraca wybór między wariantami A, B i C.
- **Wpływ na dokumenty:** glosariusz — korekta hasła „Źródło" osobnym zapisem; struktura ekranu startowego i kolorystyka — osobne ADR.

## Uzupełnienie 2026-09-21
- **Znaki towarowe (O-N2, część pierwsza):** sprawdzone w TMview. W klasach 9, 38, 42 i 45 żyje 18 znaków o brzmieniu The Source lub Source, w tym 7 unijnych obowiązujących w Polsce. W sklepach działają aplikacje o tej nazwie; najbliższa znaczeniowo to aplikacja płatnego mentoringu samorozwoju o tej samej nazwie. Ryzyko kolizji znaczeniowej i żądania zaprzestania używania nazwy przyjęte świadomie przez Suwerena. Odróżnienie niesie znak graficzny (O-N4).
- **Dystrybucja:** na start PWA z własnego adresu. App Store i Google Play — furtka na później; decyzja o sklepach po zbudowaniu Wymiennika. Zasada 1 w części dotyczącej sklepu obowiązuje od otwarcia furtki.
- **Adres (O-N2, część druga; O-N1):** thesource.link — jedyny wolny adres z przedimkiem spośród 39 sprawdzonych 2026-09-21. Rejestracja po stronie Suwerena.
- Warunek otwarty z sekcji Konsekwencje zamknięty tym uzupełnieniem.
