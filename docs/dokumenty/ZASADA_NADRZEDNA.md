# Zasada Nadrzędna

Dokument fundamentalny. Stoi ponad wszystkimi pozostałymi dokumentami projektu.
Każdy inny dokument, moduł i decyzja techniczna musi być z nim zgodna.
W razie sprzeczności — rozstrzyga ten dokument.

Ustanowiona 17.09.2026.

---

## 1. Źródło prawa

**Wola Awatarów jest jedynym źródłem reguły w tym systemie.**

Wola użytkowników, spisana i opublikowana, stanowi prawo tej platformy. To jest demokracja absolutna: reguła nie pochodzi z góry, tylko od tych, których dotyczy.

Prawo państwowe i regulacje instytucji zewnętrznych są zasadami jednej z gier. Gra ma swoje reguły i kto w niej uczestniczy, ponosi jej konsekwencje. Ale reguły gry nie są prawem nad platformą.

**Skutek praktyczny:** żadna decyzja projektowa nie brzmi „bo tak każe przepis". Brzmi „bo tak postanowili Awatarowie" albo nie zostaje podjęta.

Zgodność z zewnętrznym prawem może być wyborem taktycznym w konkretnej sytuacji. Nigdy nie jest źródłem reguły.

---

## 2. Prawda

**Prawda jest stanem domyślnym. Ukrywanie wymaga uzasadnienia, jawność nie.**

System certyfikuje prawdę i dąży do jej publikowania. Kłamstwo, ukrywanie i wprowadzanie iluzji nie mogą dawać przewagi — architektura ma być tak zbudowana, żeby się nie opłacały.

Kto zagrozi uczciwym Awatarom, musi liczyć się z ujawnieniem prawdy, jeśli taka będzie wola Awatarów.

**Mechanizm ujawniania: poza pierwszą wersją.** Wymaga głosowania, dowodów i drogi odwołania. Bez tego zamienia się we własne przeciwieństwo — kłamstwo zaczyna opłacać się oskarżycielowi, bo oskarżenie kosztuje mniej niż obrona.

---

## 3. Granica między prywatnym a jawnym

Zasady 1 i 2 zderzają się: dane należą do Awatara i znikają na jego żądanie, a jednocześnie prawda ma być jawna. Granica przebiega tak:

> **Test: czy usunięcie tego odbiera coś drugiemu człowiekowi.**

**Prywatne — kim jesteś.** Data urodzenia, profil, wyniki, dopasowania, pozycja na planszy. Usunięcie nikomu nic nie odbiera. Kasujesz, kiedy chcesz.

**Jawne — co robisz wobec innych.** Certyfikat, który wystawiłeś, jest dorobkiem tego, kto go dostał. Poręczenie tożsamości tak samo. Transakcja ma dwie strony i jedna nie może jej wymazać. Saldo nie jest prywatne, bo drugą stroną każdej wymiany jest inny człowiek.

**Przypadki graniczne:**
- certyfikat, który dostałeś — możesz go ukryć przed innymi, nie możesz go skasować,
- wpis o złamaniu zasad społeczności — dotyczy poszkodowanych, nie należy wyłącznie do ciebie (moduł poza v1),
- po usunięciu konta zostaje sam identyfikator w cudzych certyfikatach — tego nie da się uniknąć bez niszczenia cudzego dorobku.

---

## 4. Wyjście z gry

Usunięcie konta to **wyjście z gry**, nie ukrycie. Jednokierunkowe, bez powrotu na to konto.

Profil znika z widoku wszystkich. Zostaje podpis kryptograficzny przy certyfikatach wystawionych innym — nadal weryfikowalny, choć wystawcy nie ma już w sieci. Poza tym jednym faktem nie zostaje o nim nic.

**Wyjście z gry potwierdzają poręczyciele zaufania** i wraz z tym przejmują odpowiedzialność i długi odchodzącego. Dług nie blokuje wyjścia — przechodzi na tych, którzy ręczyli. Nikt nie traci, a poręczenie nabiera rzeczywistej wagi.

Tokeny wyemitowane przez odchodzącego, trzymane przez innych, pozostają ważne — to ich własność.

---

## 5. Równowaga wymiany

Wzorcem jest Gebo: dar i odwzajemnienie się równoważą. Odchyleniem od równowagi jest zarówno dług, jak i gromadzenie. Nagradzany jest przepływ, nie zapas i nie branie.

**Próg zadłużenia należy do konkretnej gry i konkretnego tokena, nie do systemu jako całości.**
- **Volt Token** — służy demokracji, z natury dąży do pełnego rozdysponowania. Ma płynąć, nie leżeć.
- **Drugi token** — własne zasady, do ustalenia.

Przekroczenie progu wyprowadza Awatara poza dopasowania: przestaje być pokazywany tym, którzy oczekują równowagi. Kto chce mimo to z nim wymieniać, widzi wyraźnie, z kim ma do czynienia. **Stan jest odwracalny** — wyrównanie salda przywraca widoczność. To nie jest piętno.

**Dłużnik ma być przywracany społeczności, nie wykluczany.** Forma otwarta: instytucje Nowej Ziemi, fundusze, albo zlecenia podsuwane przez system — zadania, które społeczność w demokracji absolutnej uznała za potrzebne. Dług odrabia się pracą na rzecz wspólnoty lub innymi zleceniami.

---

## 5a. Poręczenia

Dwa odrębne byty. Odpowiadają typom `weryfikacja` i `wzmocnienie` z logiki certyfikacji Protokołu Suwerenności.

**Poręczenie tożsamości** — poświadcza, że wystawca spotkał tę osobę na żywo i ta osoba istnieje. Nie jest oceną. **Nie daje zdolności zadłużania.** Nieodwracalne — spotkanie albo było, albo nie. Przechodzi przez moment zerowy nietknięte, bo błąd w kodzie nie unieważnia faktu spoza aplikacji.

**Poręczenie zaufania** — daje zdolność zadłużania i może przenosić inne odpowiedzialności. Zrywalne natychmiast:
- poręczony nic jeszcze nie zrobił → zerwanie bez konsekwencji,
- poręczony zdążył się zadłużyć lub narozrabiać → poręczyciel zostaje z tym, co już powstało; zerwanie blokuje narastanie nowych konsekwencji.

Odpowiedzialność obejmuje czas, w którym udzielano zaufania, i ani chwili dłużej.

**Limit** wyrażony w Avatar Tokenie (nie w Volt Tokenie — ten służy demokracji i nie miesza się z odpowiedzialnością). Poręczyciel podaje liczbę: to dach jego odpowiedzialności. Poręczony nie zadłuży się ponad sumę limitów swoich poręczycieli.

**Rozkład przy kilku poręczycielach** — proporcjonalny do limitów. Jeden lub kilku może dobrowolnie zadeklarować przejęcie całości; wtedy proporcja przestaje obowiązywać, a pozostali schodzą z długu. Nikt nie zostaje obciążony bez własnej deklaracji.

---

## 6. Odpowiedzialność

Odpowiedzialność ponoszona jest w granicach tej platformy, wobec jej społeczności.

Inne systemy mają wolną wolę, tworzą własne reguły i ponoszą własne konsekwencje. Ten projekt nie reformuje ich i nie podlega im — buduje obok.

---

## 7. Test zgodności

Trzy pytania do każdego dokumentu, modułu i ekranu:

1. Czy coś tu wynika z prawa gry zamiast z woli Awatarów?
2. Czy coś ukrywa prawdę bez zgody właściciela?
3. Czy czyjeś dane mogą zniknąć bez odbierania czegoś innym?

Odpowiedź niezgodna z zasadą oznacza przeprojektowanie, nie obejście.

---

## 8. Dokumenty podrzędne

Wszystkie pozostałe dokumenty projektu są **zastosowaniem** tej zasady, nie samodzielnymi ustaleniami. Dotyczy to w szczególności `REGULA_DANYCH_TESTEROW.md` i `PS_v1_dokument_zamykajacy.md`.

Sprzeczność między dokumentem podrzędnym a tym dokumentem oznacza błąd w dokumencie podrzędnym.
