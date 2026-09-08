# Protokół Suwerenności — Dokument Zamykający v1
**Suweren:** Andrzej Bogacki (avatar_id: `andrzej_bogacki`)
**Status wersji:** v1 — zamrożona, sandbox (piaskownica)
**Plik źródłowy:** `docs/protokol_suwerennosci_andrzej_bogacki.json` (instancja Suwerena; schemat wzorca `ps_v1` leży w korzeniu jako `protokol_suwerennosci.json`)
---
## Cel dokumentu
Transfer kontekstu do kolejnych wątków bez pamięci tej rozmowy. Zawiera stan każdego modułu, kluczowe decyzje i otwarte punkty. Punkt wejścia do wznowienia prac.
---
## Struktura nadrzędna
```
protokol_suwerennosci
├── suweren: "Andrzej Bogacki"
├── avatar_id: "andrzej_bogacki"
├── logika_certyfikacji (globalna, obowiązuje cały PS)
└── moduly[] (tablica, klucz porządkujący: numer)
```
**logika_certyfikacji** — zasada nadrzędna: „Ten kto certyfikuje, poświadcza swoją prawdę.”
Dwie warstwy: autocertyfikacja (samopoświadczenie) + certyfikacja zewnętrzna (wzmocnienie / weryfikacja).
Typy: `auto` / `wzmocnienie` / `weryfikacja`. Poziomy bazowe: `uczeń` / `mistrz`.
Wiarygodność = suma prawd certyfikujących.
---
## Moduł 1 — Jakości Kwantowe (Talenty Avatara)
**Status:** kompletny.
**Logika:** Avatar = obserwator 9 ponad osiami. Wnosi w relacje zasilanie (3) i formę materializacji (6). Cztery osie vortex, każda = para 3–6:
| Oś | Zasilanie 3 | Forma 6 | Poziom 3 | Poziom 6 |
|----|-------------|---------|----------|----------|
| 1 | Wolność | Akceptacja | mistrz | mistrz |
| 2 | Mądrość | Piękno | uczeń | uczeń |
| 3 | Sprawiedliwość | Dobro | uczeń | uczeń |
| 4 | Odpowiedzialność | Prawda | uczeń | uczeń |
Każda pozycja osi = obiekt certyfikacji: `autocertyfikat` (obowiązkowy) + `certyfikaty_zewnetrzne[]` (pusta tablica w v1).
Funkcja modułu: narzędzie doskonalenia mistrzostwa + filtr jakości relacji.
---
## Moduł 2 — Akceptowane Symulacje (Gry)
**Status:** kompletny.
**Skala akceptacji:** pełna / warunkowa / brak.
| Symulacja | Akceptacja | Warunek |
|-----------|------------|---------|
| Nowa Ziemia | pełna | — |
| Polska.3D | warunkowa | Zakres transakcyjny zdefiniowany przez suwerena, waluta PLN |
| UE.3D | brak | — |
Akceptacja = parametr suwerennej decyzji, nie przynależności. Warunkowa wymaga jawnego pola `warunek`.
---
## Moduł 3 — Tokeny (Systemy Wymiany)
**Status:** kompletny.
**Skala:** pełna / warunkowa / brak.
| Token | Akceptacja | Uwagi |
|-------|------------|-------|
| Avatar Token | pełna | Nośnik wewnętrzny architektury suwerennej |
| Volt Token (Vote Token) | pełna | Pełne mapowanie 3·6·9 + mechanika + integracja aplikacji |
| PLN | warunkowa | Powiązany z Polska.3D (ograniczenia technologiczno-systemowe) |
**Volt Token — mechanika:** 1 token na aktywnego Avatara (równość: jeden suweren = jedna jednostka energii). Alokacja procentowa 100% napięcia, płynna, redystrybuowalna w dowolnym momencie. Cele: Avatarowie / projekty / źródła / formy i struktury Nowej Ziemi. System kieruje zasoby proporcjonalnie do sumy napięcia.
Mapowanie: 3 = napięcie (energia), 6 = głosowanie (materializacja), 9 = system dystrybucji (stabilizator).
Integracja: natywny moduł głosowania wbudowany w aplikację.
---
## Moduł 4 — Protokół Relacji (Zasady Dostępu)
**Status:** kompletny.
**Rola systemowa:** meta-regulator uprawnień (analogia 9 — kontroler obiegu). Spina moduły wymagające kontroli dostępu.
**Zasada nadrzędna:** im wyższa jakość właściciela na osi, tym wyższy próg wejścia dla obserwatora.
**Hierarchia poziomów (drabina):** niesklasyfikowany < uczeń < adept < mistrz
- niesklasyfikowany — brak deklaracji uprawnień; system czyta nieobecność reguły (Default Deny), nie powód
- uczeń — zainteresował się, zaczyna wdrażać
- adept — opanował sztukę danej osi i jej jakości
- mistrz — pełne mistrzostwo osi
**Cztery stany dostępu:** brak < warunkowy < akceptacja < dozwolony
- brak — Default Deny
- warunkowy — najcięższy próg, wymaga mechanizmu zgody na kontakt
- akceptacja — lżejszy próg, akt uznania między równymi/wyższymi
- dozwolony — otwarty
**Strumień 1 — dostęp relacyjny (macierz domyślna, per oś):**
| właściciel ↓ \ obserwator → | niesklasyfikowany | uczeń | adept | mistrz |
|---|---|---|---|---|
| mistrz | brak | warunkowy | dozwolony | dozwolony |
| adept | warunkowy | warunkowy | akceptacja | akceptacja |
| uczeń | warunkowy | dozwolony | dozwolony | dozwolony |
| niesklasyfikowany | — (brak reguł, poza obiegiem) | | | |
Model: ustawienia domyślne (przycisk „uzupełnij domyślnie") + nadpisanie ręczne + slot przyszłych profili. Zakres: per oś, replikowany na cały Moduł 1 i przyszłe moduły tej samej mechaniki.
**Strumień 2 — dostęp do wiedzy:** warstwowa widoczność modułów/danych wg klasyfikacji obserwatora. Niesklasyfikowany → tylko dane podstawowe lub moduły jawnie otwarte. Uczeń/adept/mistrz → zakres konfigurowany.
**Bramka wstępna (szczelność):** osoba niezalogowana zatwierdza dwa elementy — (1) uznanie statusu (to Profil Suwerena, traktuję go jako suwerena), (2) klauzula nieużycia (dane nie mogą być użyte przeciw suwerenowi w żadnej akceptowanej symulacji). Zatwierdzenie generuje zobowiązanie obserwatora i odblokowuje kolejny poziom uprawnień.
---
## Otwarte punkty (do kolejnych wątków)
1. **sygnatura_prawdy: null** — wszystkie autocertyfikaty Modułu 1 mają sygnaturę `null`. Wypełnienie przy publikacji niemutowalnej (blockchain), po dojrzeniu w sandboxie.
2. **certyfikaty_zewnetrzne: []** — puste w v1. Zasilane w miarę poświadczeń od innych Avatarów.
3. **Glosariusz** — dodać definicje: `uczeń`, `adept` (definicje ostre ustalone w tym wątku), ewentualnie `Protokół Suwerenności`, `Volt Token`, stany dostępu.
4. **Strumień 2 Modułu 4** — zakresy widoczności dla uczeń/adept/mistrz oznaczone „konfigurowany"; wymagają konkretnej mapy moduł→poziom.
5. **Profile dostępu** — slot zarezerwowany, profile niezdefiniowane.
6. **Mechanizm zgody na kontakt** — stan „warunkowy" wymaga zdefiniowania konkretnej mechaniki zgody (UX + reguła).
---
## Następne fazy (poza v1)
- Synchronizacja PS Reader (HTML/JS) z pełnym dokumentem v1 (4 moduły)
- Publikacja: Project knowledge / GitHub (raw URL jako uniwersalne źródło)
- Blockchain — publikacja niemutowalna po dojrzeniu sandboxa
- Aplikacja: integracja Volt Token (UX głosowania), bramka wstępna, warstwy widoczności
