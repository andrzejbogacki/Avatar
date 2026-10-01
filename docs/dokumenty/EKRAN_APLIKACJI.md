# Ekran aplikacji — Master Fader, poziom najniższy, tryb gościa

Status: dokument roboczy (nie ADR). Data: 2026-10-01. Źródło: decyzje Suwerena, wątek 8.

## 1. Zakres
- Projektowany jest ekran startowy aplikacji w telefonie, w wersji responsywnej. Strona projektu — osobno, później.
- Tabela „Ekran startowy” w WARUNKI_ZRODLA.md (trzy poziomy 6→3→9) pochodzi z propozycji Nexusa z 2026-09-20. Jej status wobec tego dokumentu — do decyzji Suwerena.

## 2. Master Fader
- Znak The Source na środku dolnego menu, stały element ekranów. Forma docelowa: cewka Rodina połączona ze znakiem — nieustalona.
- Kliknięcie znaku: wysuwa dolny panel kreacji z opcjami modułów dostępnych na bieżącym poziomie.
- Przytrzymanie znaku: wysuwa z dołu panel z menu poziomów i suwakiem obok. Ruch palcem góra/dół zmienia poziom. Podwójne kliknięcie pozycji zwija panel i przełącza tryb.
- W dół — wyciszenie: mniej funkcji i komunikacji, ekrany prostsze, elementy znikają. W górę — aktywacja modułów i opuszczanie barier komunikacji w akceptowanych grach z akceptowanymi graczami.
- Każdy poziom ma grafikę lub animację przejścia.
- Liczba poziomów: wstępnie cztery. Nazwy nieustalone. Numeracja poziomów nie może mieszać się ani dublować z systemem 3·6·9.
- Ograniczenia techniczne: aplikacja webowa nie wyłącza transmisji danych telefonu, tylko własny ruch. Na iOS przytrzymanie wymaga wyłączenia systemowego menu zaznaczania.

## 3. Poziom najniższy
- Definicja: wycofanie uwagi z zewnątrz i skierowanie jej do wewnątrz — istnieje tylko „ja jako postać i ja jako świadomość”.
- Moduły: Rezonator Kwantowy, QAC (tylko własny profil), Auth, PS uproszczony (Jakości Kwantowe), Quantum Log, Glosariusz, Strażnik GPS, Krąg zaufania.
- Obowiązują ustalenia kanonu Mute z 2026-07-22: Strażnik GPS działa w tle; wyciszenie przebijają tylko krąg zaufania i słowo alarmowe.
- Rezonator: bez internetu wbudowany syntezator z gotowych presetów (ambient, tło dnia, medytacja, praca). Z internetem opcjonalnie zewnętrzne źródła dźwięku bezpieczne dla tego poziomu — świadome odstępstwo od zasady zera sygnału na zewnątrz.
- Zasada gestu modułów: kliknięcie = akcja główna, przytrzymanie = wybór.
  - Rezonator: kliknięcie odtwarza dźwięk; przytrzymanie rozwija menu presetów.
  - Quantum Log: kliknięcie dodaje wpis; przytrzymanie włącza kamerę z podglądem i pokazuje film, dyktowanie oraz listę ostatnich wpisów do edycji. Jeden gest: trzymasz, przesuwasz palec na opcję, puszczasz. Puszczenie na filmie nagrywa widoczny podgląd. Po wyborze innej opcji kamera wyłącza się od razu.
- Otwarte: gesty Jakości Kwantowych i QAC; liczba pozycji listy ostatnich wpisów; zatrzymanie nagrywania; dyktowanie w pełni lokalne (rozpoznawanie mowy w Chrome wysyła głos na zewnątrz).

## 4. Tryb gościa
- Urządzenie (telefon lub terminal) w trybie gościa pokazuje jawną perspektywę właściciela: pamięć podręczną rzeczy jawnych z jego sieci relacji. Nic prywatnego.
- Tylko moduły bez zapisu i bez zmian: Rezonator, Glosariusz, Dokumentacja, QAC (symulacja z danymi gościa, bez zapisu).
- Tryb prezentuje system i daje podstawową użyteczność bez logowania, np. obecność osób, które ją jawnie udostępniły. Co i z jaką szczegółowością widać, rozstrzyga Protokół Suwerenności każdej osoby — nowe ustawienie, domyślnie zamknięte; w kodzie dziś go nie ma.
- Narzędzie wizualizacji sieci relacji i wyników modułów — jawna część dla gościa; do zbudowania.
- Znak u gościa działa jak u zalogowanego, w zakresie dopuszczonym przez moduły. Zmiana poziomu przez gościa obowiązuje tylko na czas wizyty.
- Zaproszenie: oznaczenie „gość” w nagłówku jest klikalne; w jego menu stoi „Zaproszenie”. Kroki:
  1. zgoda właściciela urządzenia na zaproszenie;
  2. potwierdzenie tożsamości osoby fizycznej — właściciel zna ją osobiście i jest jej pewny; wymaga ponownego uwierzytelnienia właściciela oraz informacji: za co bierze odpowiedzialność, dlaczego to ważne, że potwierdzenie nieprawdy zostanie zweryfikowane i zapamiętane;
  3. kod QR ważny tylko chwilę — gość importuje nim profil na własny telefon.
- Druga faza zaproszenia (zatwierdzenie Suwerena, moduł Auth, ADR-002) obowiązuje tylko w fazie testowej, by uniknąć fałszywych kont; potem wystarcza potwierdzenie właściciela. Wymaga przełącznika i nowej decyzji w ADR.
- Kolizja do decyzji: istniejący w PS gość po bramce wstępnej zapisuje zobowiązanie w rejestrze właściciela — sprzeczne z zasadą „bez zapisu”.
- Otwarte: kto i jak weryfikuje potwierdzenie tożsamości; gdzie zapisany jest ślad i kto go widzi; kto ogłasza koniec fazy testowej; ochrona danych urodzenia w kodzie QR.

## 5. Szkice
Szkice z wątku 8 są robocze. Układ ekranów, przypisanie kolorów elementom i wartości czasu (np. 60 s ważności kodu) to propozycje Nexusa, nie decyzje Suwerena.
