# ADR-014: Kolorystyka — paleta osi 3·6·9
- **Data:** 2026-09-25
- **Status:** zatwierdzony
- **Decydent:** Suweren (Andrzej Bogacki)

## Kontekst
Zasada palety zatwierdzona 2026-09-21 (Ziarno v20, sekcje 2.6–2.7) nie miała wartości technicznych (O-N12) ani nośnika błędu bez czerwieni (O-N13). Oba punkty zamknięte 2026-09-25.

## Decyzja
Buduj interfejs na palecie wyprowadzonej z osi 3·6·9, w trybie ciemnym i jasnym, z wartościami z tabeli poniżej.

| Rola | Tryb ciemny | Tryb jasny |
|---|---|---|
| Tło | #2A2723 | #FAF6EE |
| Tekst | #FAF6EE | #2A2723 |
| Tekst drugorzędny | #BDB5A8 | #6B655C |
| Oś 9 — złoto / ochra | #E0B84F | #946F1A |
| Oś 6 — błękit wodny | #3DA2C7 | #2C7A96 |
| Oś 3 — miedź | #C77D48 | #A35F2E |
| Błąd — fiolet | #A47BDF | #6B2FC4 |

### Zasady wynikowe
1. **Złoto — oś 9:** akcent przewodni i nagłówki, najsilniejszy na poziomie 3. **Błękit wodny — oś 6:** akcent poziomu 1. **Miedź — oś 3:** akcent poziomu 2. Zgodne z normą przewodów elektrycznych: neutralny niebieski to zero (6), fazowy brązowy to faza (3).
2. Każdy kolor ma parę wartości, po jednej dla każdego trybu. Para różni się wyłącznie jasnością; barwa i nasycenie są dziedziczone. Złoto w trybie jasnym przechodzi w ochrę, służącą wyłącznie liniom i znakom.
3. Zwykły tekst nigdy nie jest w kolorze osi.
4. Tło nigdy nie jest czystą czernią ani czystą bielą. Zejście oddaje głębia tła: każdy poziom o ton ciemniejszy.
5. **Nawigacja kolorem:** numery i punktory mają kolor osi, której dotyczy treść, zawsze z drugim nośnikiem (numer albo etykieta osi). Tekst punktu zostaje w kolorze podstawowym.
6. **Błąd:** czwarty znak w czwartym kolorze, zgodnie z kanonem „czwarty element sygnalizuje błąd". Zawsze z komunikatem prostymi słowami. Minimalny rozmiar znaku błędu: 14 px.
7. Czerwień wykluczona z interfejsu.
8. Progi kontrastu: tekst co najmniej 4,5, linie i znaki co najmniej 3,0. Każdy nowy kolor przechodzi ten test przed użyciem.

## Alternatywy odrzucone
- **Para czerwień–błękit z filmu Matrix:** wybór binarny, cytat kanonu na zewnątrz, czerwień jako alarm.
- **Zestawy 1 i 2:** błękit nieczytelny w trybie ciemnym.
- **Pary kolorów dobierane osobno dla każdego trybu:** fiolet i błękit traciły żywość w jednym z trybów.
- **Błąd jako szarość:** mylony z elementem nieaktywnym.
- **Cały tekst punktu w kolorze osi:** męczy oko, akcent traci siłę.

## Konsekwencje
- **Pozytywne:** struktura czytelna wzrokiem, zanim padną słowa; wszystkie wartości przechodzą progi kontrastu; błąd widoczny bez łamania ciszy.
- **Koszty:** każdy kolor ma dwie wartości do utrzymania; fiolet może łagodzić wagę komunikatu.
- **Otwarte:** O-N18 — kształt znaku błędu, do dobrania razem z logo; O-N19 — wartości tonów tła dla poziomów zejścia.
