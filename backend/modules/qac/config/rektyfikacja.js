'use strict';

// Parametry Quantum Rectification Tool. // TERMIN-KANDYDAT: Quantum Rectification Tool

// Aspekty ścisłe uwzględniane w dopasowaniu tranzytów [°].
const ASPEKTY_DEG = Object.freeze([0, 60, 90, 120, 180]);

// Maksymalne odchylenie od aspektu ścisłego (orb) [°].
const ORB_SCISLY_DEG = 1.0;

// Domyślny krok generowania kandydatów w zakresie brzegowym [min].
const KROK_KANDYDATA_MIN = 4;

// Górny limit liczby kandydatów jednego zadania (ochrona pętli obliczeniowej).
const MAKS_KANDYDATOW = 5000;

// Składowe metryki `pewnosc` — formuła robocza (wniosek logiczny, punkt otwarty O8):
// pewnosc = WAGA_DOPASOWANIA · dopasowanie_znorm + WAGA_MARGINESU · margines_nad_drugim.
const PEWNOSC = Object.freeze({
    WAGA_DOPASOWANIA: 0.7,
    WAGA_MARGINESU: 0.3,
});

const MINUT_NA_DOBE = 1440;

// Alarm czułości osi: jeśli ASC/MC bliżej granicy bramy/linii niż PROG_ALARMU_S
// sekund zegara, proponujemy QRT. HORYZONT_POMIARU_S ogranicza koszt skanu.
const CZULOSC = Object.freeze({
    PROG_ALARMU_S: 60,
    HORYZONT_POMIARU_S: 600,
});

// Krok skanu okna niepewności [s] — 60 s łapie granice linii (≥ ~2.6 min odstępu).
const NIEPEWNOSC = Object.freeze({ KROK_SKANU_S: 60 });

// Bramka uczciwości ③: rektyfikacja geometryczna z testem istotności wobec NULL.
const BRAMKA_UCZCIWOSCI = Object.freeze({
    KROK_KANDYDATA_MIN: 2,   // krok skanu kandydatów godziny [min]
    K_NULL: 200,             // liczba prób rozkładu NULL
    PROG_PEWNOSCI: 0.95,     // minimalna pewnosc, by zwrócić godzinę
    ROZMIAR_PULI_NULL: 60,   // liczba losowych zestawów tranzytów w puli NULL
});

module.exports = Object.freeze({
    ASPEKTY_DEG,
    ORB_SCISLY_DEG,
    KROK_KANDYDATA_MIN,
    MAKS_KANDYDATOW,
    PEWNOSC,
    MINUT_NA_DOBE,
    CZULOSC,
    NIEPEWNOSC,
    BRAMKA_UCZCIWOSCI,
});
